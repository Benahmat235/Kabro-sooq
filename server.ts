import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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
