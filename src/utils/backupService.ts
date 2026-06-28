import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';

// Helper to get or initialize admin app
function getAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return initializeApp({
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}

/**
 * Runs a complete backup of the main Firestore collections: users, listings, reviews, chats.
 * For chats, it also fetches the subcollection chats/{chatId}/messages.
 * The output is serialized to JSON and saved directly into Google Cloud Storage (Firebase Storage).
 */
export async function runFirestoreBackup(triggeredBy: string = "system") {
  const appAdmin = getAdminApp();
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  const db = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);
  const storage = getStorage(appAdmin);
  const bucket = storage.bucket(firebaseConfig.storageBucket);

  console.log(`[BackupService] Starting Firestore backup, triggered by: ${triggeredBy}`);

  try {
    const timestamp = new Date().toISOString();
    const formattedDate = timestamp.replace(/[:.]/g, '-');
    const filename = `firestore-backups/backup_${formattedDate}.json`;

    // Fetch primary collections
    const usersSnap = await db.collection('users').get();
    const listingsSnap = await db.collection('listings').get();
    const reviewsSnap = await db.collection('reviews').get();
    const chatsSnap = await db.collection('chats').get();

    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const listings = listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Process chats and their subcollection: messages
    const chats = [];
    for (const chatDoc of chatsSnap.docs) {
      const chatId = chatDoc.id;
      const chatData = chatDoc.data();
      const messagesSnap = await db.collection(`chats/${chatId}/messages`).get();
      const messages = messagesSnap.docs.map(msgDoc => ({ id: msgDoc.id, ...msgDoc.data() }));
      chats.push({
        id: chatId,
        ...chatData,
        messages
      });
    }

    const backupPayload = {
      timestamp,
      metadata: {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        collections: ['users', 'listings', 'reviews', 'chats']
      },
      data: {
        users,
        listings,
        reviews,
        chats
      }
    };

    const fileContent = JSON.stringify(backupPayload, null, 2);
    const fileBuffer = Buffer.from(fileContent, 'utf-8');
    const fileSizeKb = Math.round(fileBuffer.length / 1024 * 100) / 100;

    // Save to the GCS bucket
    const file = bucket.file(filename);
    await file.save(fileBuffer, {
      contentType: 'application/json',
      metadata: {
        metadata: {
          triggeredBy,
          timestamp,
          usersCount: String(users.length),
          listingsCount: String(listings.length),
          reviewsCount: String(reviews.length),
          chatsCount: String(chats.length),
        }
      }
    });

    // Save metadata record to backup_history collection in Firestore
    const historyRef = db.collection('backup_history').doc();
    const historyEntry = {
      id: historyRef.id,
      filename,
      timestamp,
      sizeKb: fileSizeKb,
      status: 'success',
      triggeredBy,
      counts: {
        users: users.length,
        listings: listings.length,
        reviews: reviews.length,
        chats: chats.length,
      }
    };

    await historyRef.set(historyEntry);

    console.log(`[BackupService] Backup successfully created & saved to GCS: ${filename} (${fileSizeKb} KB)`);
    return { success: true, filename, sizeKb: fileSizeKb, timestamp };
  } catch (error: any) {
    console.error(`[BackupService] Backup failed:`, error);
    
    // Attempt to log the failed backup to history
    try {
      const timestamp = new Date().toISOString();
      const historyRef = db.collection('backup_history').doc();
      await historyRef.set({
        id: historyRef.id,
        filename: 'N/A',
        timestamp,
        sizeKb: 0,
        status: 'failed',
        triggeredBy,
        error: error.message || String(error)
      });
    } catch (dbError) {
      console.error("[BackupService] Failed to write error to backup_history collection:", dbError);
    }

    throw error;
  }
}
