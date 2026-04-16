const { getFirestore } = require('../config/firebase');

const USERS = 'users';
const ACCOUNTANTS = 'accountants';

async function getUserProfile(uid) {
  const db = getFirestore();
  const snap = await db.collection(USERS).doc(uid).get();
  if (!snap.exists) {
    return null;
  }
  return { id: snap.id, ...snap.data() };
}

/**
 * Registers / updates the app profile after Firebase Auth signup on the client.
 */
async function registerUser(uid, payload) {
  const db = getFirestore();
  const {
    email,
    displayName,
    role,
    businessType,
    businessName,
    accountantId,
  } = payload;

  const now = new Date().toISOString();
  const businessId =
    role === 'client' ? `biz_${uid.slice(0, 8)}` : null;

  const userDoc = {
    email: email || null,
    displayName: displayName || null,
    role,
    accountantId: role === 'client' ? accountantId || null : null,
    businesses:
      role === 'client' && businessType
        ? [
            {
              id: businessId,
              type: businessType,
              name: businessName || businessType,
            },
          ]
        : [],
    updatedAt: now,
  };

  const userRef = db.collection(USERS).doc(uid);
  const existing = await userRef.get();

  if (!existing.exists) {
    userDoc.createdAt = now;
  }

  await userRef.set(userDoc, { merge: true });

  if (role === 'accountant') {
    const accRef = db.collection(ACCOUNTANTS).doc(uid);
    const accSnap = await accRef.get();
    const accPayload = {
      name: displayName || email || 'Accountant',
      email: email || null,
      clientIds: accSnap.exists ? accSnap.data().clientIds || [] : [],
      updatedAt: now,
    };
    if (!accSnap.exists) {
      accPayload.createdAt = now;
    }
    await accRef.set(accPayload, { merge: true });
  }

  if (role === 'client' && accountantId) {
    const accRef = db.collection(ACCOUNTANTS).doc(accountantId);
    const accSnap = await accRef.get();
    if (accSnap.exists) {
      const clientIds = new Set(accSnap.data().clientIds || []);
      clientIds.add(uid);
      await accRef.update({
        clientIds: Array.from(clientIds),
        updatedAt: now,
      });
    }
  }

  const saved = await userRef.get();
  return { id: saved.id, ...saved.data() };
}

module.exports = {
  getUserProfile,
  registerUser,
};
