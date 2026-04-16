const admin = require('firebase-admin');

let firebaseInitialised = false;

/**
 * Initialise Firebase Admin (Firestore, Auth verification, Storage).
 * Safe to call once at process startup.
 */
function initFirebase() {
  if (firebaseInitialised) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: credentials.project_id || projectId,
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        (credentials.project_id || projectId
          ? `${credentials.project_id || projectId}.appspot.com`
          : undefined),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        (projectId ? `${projectId}.appspot.com` : undefined),
    });
  }

  firebaseInitialised = true;
  return admin.app();
}

function getFirestore() {
  return admin.firestore();
}

function getAuth() {
  return admin.auth();
}

function getStorage() {
  return admin.storage();
}

module.exports = {
  initFirebase,
  getFirestore,
  getAuth,
  getStorage,
  admin,
};
