import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { validateAndSanitizeListing } from './src/utils/security';
import { runFirestoreBackup } from './src/utils/backupService';

// Load Firebase configuration
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Initialize firebase-admin
const appAdmin = initializeApp({
  projectId: firebaseConfig.projectId,
});

// Get firestore instance with custom databaseId
const firestoreDb = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Securely publish a new listing with strict rate limiting and Zod validation
  app.post("/api/listings", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Veuillez vous connecter pour publier une annonce." });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      // 1. Verify user's ID token using Firebase Admin SDK
      const authAdmin = getAuth(appAdmin);
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const sellerName = decodedToken.name || decodedToken.email?.split('@')[0] || "Vendeur";

      // 2. Perform Rate Limiting Check (Max 5 listings in last 24 hours)
      const userListingsSnapshot = await firestoreDb.collection("listings")
        .where("sellerId", "==", uid)
        .get();

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentListings = userListingsSnapshot.docs.filter(doc => {
        const data = doc.data();
        const createdAt = data.createdAt ? new Date(data.createdAt).getTime() : 0;
        return createdAt >= oneDayAgo && data.status !== 'archived';
      });

      const DAILY_LIMIT = 5;
      if (recentListings.length >= DAILY_LIMIT) {
        return res.status(429).json({ 
          error: `Limite de publication quotidienne atteinte. Vous ne pouvez publier que ${DAILY_LIMIT} annonces par 24 heures afin de préserver la qualité de la plateforme et d'éviter le spam.` 
        });
      }

      // 3. Zero-Trust Schema Validation and Sanitization
      const rawData = req.body;
      const validatedListingData = validateAndSanitizeListing(rawData);

      // 4. Create listing document
      const newDocRef = firestoreDb.collection("listings").doc();
      const newListing = {
        ...validatedListingData,
        id: newDocRef.id,
        sellerId: uid,
        sellerName: sellerName,
        sellerIsVerified: false,
        sellerResponseTime: 'Répond rapidement',
        status: 'active',
        viewsCount: 0,
        createdAt: new Date().toISOString()
      };

      await newDocRef.set(newListing);

      console.log(`User ${uid} successfully published listing ${newDocRef.id} with rate-limiting check.`);
      return res.json({ success: true, listing: newListing });
    } catch (error: any) {
      // Rule 2: Log raw technical error to console and return clean response
      console.error("Error in secure rate-limited listing publication API:", error);
      
      const isValidationError = error.message && (
        error.message.includes("Le titre") || 
        error.message.includes("La description") || 
        error.message.includes("Le prix") || 
        error.message.includes("Veuillez fournir") ||
        error.message.includes("Aucune image") ||
        error.message.includes("Numéro de téléphone")
      );
      
      const isAuthError = error.code && error.code.startsWith("auth/");
      
      const message = isValidationError 
        ? error.message 
        : isAuthError 
          ? "Session expirée. Veuillez vous reconnecter."
          : "Une erreur inattendue est survenue lors de la publication de votre annonce.";

      return res.status(isValidationError ? 400 : isAuthError ? 401 : 500).json({ error: message });
    }
  });

  // API Route: Securely increment listing views
  app.post("/api/listings/:id/increment-views", async (req, res) => {
    const listingId = req.params.id;
    if (!listingId) {
      return res.status(400).json({ error: "Missing listing ID" });
    }

    try {
      const listingRef = firestoreDb.collection("listings").doc(listingId);
      const docSnap = await listingRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Secure increment using Firestore field value
      await listingRef.update({
        viewsCount: FieldValue.increment(1)
      });

      // Get the updated count
      const updatedSnap = await listingRef.get();
      const updatedData = updatedSnap.data();
      const newViewsCount = updatedData?.viewsCount || 0;

      return res.json({ success: true, viewsCount: newViewsCount });
    } catch (error) {
      console.error("Error incrementing listing views in secure backend:", error);
      return res.status(500).json({ error: "Failed to increment views" });
    }
  });

  // API Route: Securely capture and log production execution and Firestore sync errors
  app.post("/api/logs", async (req, res) => {
    try {
      const { level, message, timestamp, error: logError, context } = req.body;

      if (!message || !level) {
        return res.status(400).json({ error: "Missing required logging payload parameters" });
      }

      // Log raw technical error to server console for debugging & platform log-drains
      const formattedLogMessage = `[FRONTEND_${String(level).toUpperCase()}] ${message}`;
      if (level === 'error') {
        console.error(formattedLogMessage, { timestamp, error: logError, context });
      } else if (level === 'warn') {
        console.warn(formattedLogMessage, { timestamp, error: logError, context });
      } else {
        console.log(formattedLogMessage, { timestamp, error: logError, context });
      }

      // Persist log securely in a dedicated Firestore collection
      try {
        await firestoreDb.collection("system_logs").add({
          level,
          message,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          error: logError || null,
          context: context || {},
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (firestoreErr) {
        console.error("Failed to persist log in Firestore system_logs:", firestoreErr);
      }

      return res.json({ success: true });
    } catch (err) {
      // Rule 2: Log raw technical error to server console, return generic user friendly response
      console.error("Failure inside secure logging pipeline endpoint:", err);
      return res.status(500).json({ error: "An unexpected error occurred while processing logs." });
    }
  });

  // Dynamic Route: Service Worker configuration with embedded Firebase Config
  app.get('/firebase-messaging-sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
      importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
      importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

      const firebaseConfig = ${JSON.stringify(firebaseConfig)};

      firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();

      messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification?.title || 'Kabro Sooq';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: payload.notification?.icon || '/favicon.ico',
          data: payload.data
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    `);
  });

  // API Route: Send FCM Push Notification
  app.post("/api/notifications/send", async (req, res) => {
    try {
      const { recipientId, title, body, data } = req.body;

      if (!recipientId || !title || !body) {
        return res.status(400).json({ error: "Missing required notification payload parameters" });
      }

      // Fetch recipient's FCM tokens
      const userRef = firestoreDb.collection("users").doc(recipientId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ error: "Recipient user not found" });
      }

      const userData = userSnap.data();
      const fcmTokens: string[] = userData?.fcmTokens || [];

      if (fcmTokens.length === 0) {
        return res.json({ success: true, message: "No FCM tokens found for the recipient" });
      }

      // Initialize messaging and send multicast
      const { getMessaging: getAdminMessaging } = await import('firebase-admin/messaging');
      const messagingAdmin = getAdminMessaging(appAdmin);

      // Filter out empty or invalid tokens
      const validTokens = fcmTokens.filter(token => typeof token === 'string' && token.trim() !== '');

      if (validTokens.length === 0) {
        return res.json({ success: true, message: "No valid FCM tokens found for the recipient" });
      }

      const response = await messagingAdmin.sendEachForMulticast({
        tokens: validTokens,
        notification: {
          title,
          body,
        },
        data: data || {},
      });

      console.log(`Successfully sent ${response.successCount} FCM push notifications (failed: ${response.failureCount})`);

      // If we see failures, we can clean up stale tokens
      if (response.failureCount > 0) {
        const staleTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errCode = resp.error.code;
            if (
              errCode === 'messaging/registration-token-not-registered' ||
              errCode === 'messaging/invalid-argument'
            ) {
              staleTokens.push(validTokens[idx]);
            }
          }
        });

        if (staleTokens.length > 0) {
          console.log(`Removing ${staleTokens.length} stale FCM tokens for user ${recipientId}`);
          const { FieldValue: AdminFieldValue } = await import('firebase-admin/firestore');
          await userRef.update({
            fcmTokens: AdminFieldValue.arrayRemove(...staleTokens)
          });
        }
      }

      return res.json({ 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount 
      });
    } catch (err) {
      console.error("Failure inside secure notifications delivery endpoint:", err);
      return res.status(500).json({ error: "An unexpected error occurred while sending push notification." });
    }
  });

  // API Route: Get history of Firestore backups from Cloud Storage / Firestore logs
  app.get("/api/admin/backups", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Veuillez vous connecter pour voir l'historique des sauvegardes." });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const authAdmin = getAuth(appAdmin);
      await authAdmin.verifyIdToken(idToken); // Ensure the user is logged in
      
      const backupsSnapshot = await firestoreDb.collection("backup_history")
        .orderBy("timestamp", "desc")
        .limit(30)
        .get();

      const backups = backupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, backups });
    } catch (error) {
      console.error("Error fetching backups history:", error);
      return res.status(500).json({ error: "Impossible de récupérer l'historique des sauvegardes." });
    }
  });

  // API Route: Manually trigger a Firestore backup
  app.post("/api/admin/backups", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Veuillez vous connecter pour lancer une sauvegarde." });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const authAdmin = getAuth(appAdmin);
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const userName = decodedToken.name || decodedToken.email?.split('@')[0] || "Administrateur";

      const result = await runFirestoreBackup(`Manuel (${userName} - ${uid})`);
      return res.json(result);
    } catch (error: any) {
      console.error("Error triggering manual backup:", error);
      return res.status(500).json({ error: error.message || "Erreur lors de la création de la sauvegarde." });
    }
  });



  // Serve Vite app or static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
