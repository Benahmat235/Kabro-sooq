import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const appAdmin = initializeApp({
  credential: applicationDefault(),
  projectId: firebaseConfig.projectId,
});

const firestoreDb = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const snap = await firestoreDb.collection("listings").limit(1).get();
    console.log("Success! Found listings:", snap.size);
  } catch (err: any) {
    console.error("Listings Error:", err.message);
  }
}

test();
