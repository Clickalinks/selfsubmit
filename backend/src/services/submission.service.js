const admin = require('firebase-admin');
const { getFirestore } = require('../config/firebase');
const { computeTotals } = require('./calculation.service');
const {
  buildSubmissionPdfBuffer,
  uploadSubmissionPdf,
  getSignedPdfUrl,
} = require('./pdf.service');
const { logAudit } = require('./audit.service');
const { getUserProfile } = require('./user.service');

const SUBMISSIONS = 'submissions';

const BUSINESS_TYPES = new Set(['Taxi Driver', 'Barber', 'Driving Instructor']);
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

function assertClientPayload(body) {
  const errors = [];
  if (!body.businessId || typeof body.businessId !== 'string') {
    errors.push('businessId is required');
  }
  if (!body.businessType || typeof body.businessType !== 'string') {
    errors.push('businessType is required');
  } else if (!BUSINESS_TYPES.has(body.businessType)) {
    errors.push(`businessType must be one of: ${[...BUSINESS_TYPES].join(', ')}`);
  }
  if (!body.month || typeof body.month !== 'string' || !MONTH_REGEX.test(body.month)) {
    errors.push('month must be in YYYY-MM format');
  }
  if (!body.income || typeof body.income !== 'object') {
    errors.push('income object is required');
  }
  if (!body.expenses || typeof body.expenses !== 'object') {
    errors.push('expenses object is required');
  }
  return errors;
}

async function createSubmission(uid, body) {
  const errors = assertClientPayload(body);
  if (errors.length) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }

  const profile = await getUserProfile(uid);
  if (!profile) {
    const err = new Error('Complete registration before creating submissions');
    err.statusCode = 400;
    throw err;
  }
  const businesses = profile.businesses || [];
  const business = businesses.find((b) => b.id === body.businessId);
  if (!business) {
    const err = new Error('Unknown businessId for this user');
    err.statusCode = 400;
    throw err;
  }
  if (business.type && business.type !== body.businessType) {
    const err = new Error('businessType does not match registered business');
    err.statusCode = 400;
    throw err;
  }

  const totals = computeTotals(body.income, body.expenses);
  const db = getFirestore();
  const now = new Date().toISOString();

  const docRef = db.collection(SUBMISSIONS).doc();
  const submissionId = docRef.id;

  const baseRecord = {
    userId: uid,
    businessId: body.businessId,
    businessType: body.businessType,
    month: body.month,
    income: body.income,
    expenses: body.expenses,
    totals,
    // Client draft; call submitSubmissionToAccountant to move to "submitted" for review.
    status: 'pending',
    pdfPath: null,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(baseRecord);

  const recordForPdf = { id: submissionId, ...baseRecord };
  const pdfBuffer = await buildSubmissionPdfBuffer(recordForPdf);
  const { path: pdfPath } = await uploadSubmissionPdf(uid, submissionId, pdfBuffer);

  await docRef.update({
    pdfPath,
    updatedAt: new Date().toISOString(),
  });

  await logAudit({
    action: 'submission.created',
    actorUid: uid,
    resourceType: 'submission',
    resourceId: submissionId,
    metadata: { month: body.month },
  });

  const snap = await docRef.get();
  return enrichSubmission(snap.data(), submissionId);
}

async function listSubmissionsForUser(uid) {
  const db = getFirestore();
  const snap = await db.collection(SUBMISSIONS).where('userId', '==', uid).get();

  const items = [];
  for (const doc of snap.docs) {
    items.push(await enrichSubmission(doc.data(), doc.id));
  }
  items.sort((a, b) => (a.month < b.month ? 1 : -1));
  return items;
}

async function listSubmissionsForAccountant(accountantUid) {
  const db = getFirestore();
  const accSnap = await db.collection('accountants').doc(accountantUid).get();
  if (!accSnap.exists) {
    return [];
  }
  const clientIds = accSnap.data().clientIds || [];
  if (!clientIds.length) {
    return [];
  }

  const chunks = [];
  for (let i = 0; i < clientIds.length; i += 10) {
    chunks.push(clientIds.slice(i, i + 10));
  }

  const submissions = [];
  for (const chunk of chunks) {
    const snap = await db.collection(SUBMISSIONS).where('userId', 'in', chunk).get();
    for (const doc of snap.docs) {
      submissions.push(await enrichSubmission(doc.data(), doc.id));
    }
  }

  submissions.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return submissions;
}

async function listClientsForAccountant(accountantUid) {
  const db = getFirestore();
  const accSnap = await db.collection('accountants').doc(accountantUid).get();
  if (!accSnap.exists) {
    return [];
  }
  const clientIds = accSnap.data().clientIds || [];
  const clients = [];
  for (const cid of clientIds) {
    const u = await db.collection('users').doc(cid).get();
    if (u.exists) {
      clients.push({ id: u.id, ...u.data() });
    }
  }
  return clients;
}

async function updateSubmission(uid, submissionId, body) {
  const db = getFirestore();
  const ref = db.collection(SUBMISSIONS).doc(submissionId);
  const snap = await ref.get();
  if (!snap.exists) {
    const err = new Error('Submission not found');
    err.statusCode = 404;
    throw err;
  }
  const data = snap.data();
  if (data.userId !== uid) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  if (data.status !== 'pending') {
    const err = new Error('Only pending submissions can be edited');
    err.statusCode = 400;
    throw err;
  }

  const income = body.income !== undefined ? body.income : data.income;
  const expenses = body.expenses !== undefined ? body.expenses : data.expenses;

  const partialErrors = [];
  if (typeof income !== 'object' || income === null) {
    partialErrors.push('income must be an object');
  }
  if (typeof expenses !== 'object' || expenses === null) {
    partialErrors.push('expenses must be an object');
  }
  if (partialErrors.length) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = partialErrors;
    throw err;
  }

  const totals = computeTotals(income, expenses);
  const now = new Date().toISOString();

  await ref.update({
    income,
    expenses,
    totals,
    updatedAt: now,
    rejectionReason: admin.firestore.FieldValue.delete(),
  });

  const merged = { id: submissionId, ...(await ref.get()).data() };
  const pdfBuffer = await buildSubmissionPdfBuffer(merged);
  const { path: pdfPath } = await uploadSubmissionPdf(uid, submissionId, pdfBuffer);
  await ref.update({ pdfPath, updatedAt: new Date().toISOString() });

  await logAudit({
    action: 'submission.updated',
    actorUid: uid,
    resourceType: 'submission',
    resourceId: submissionId,
    metadata: {},
  });

  const updated = await ref.get();
  return enrichSubmission(updated.data(), updated.id);
}

async function submitSubmissionToAccountant(uid, submissionId) {
  const db = getFirestore();
  const ref = db.collection(SUBMISSIONS).doc(submissionId);
  const snap = await ref.get();
  if (!snap.exists) {
    const err = new Error('Submission not found');
    err.statusCode = 404;
    throw err;
  }
  const data = snap.data();
  if (data.userId !== uid) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  if (data.status !== 'pending') {
    const err = new Error('Only pending submissions can be sent to your accountant');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date().toISOString();
  await ref.update({
    status: 'submitted',
    updatedAt: now,
    submittedAt: now,
  });

  await logAudit({
    action: 'submission.submitted_to_accountant',
    actorUid: uid,
    resourceType: 'submission',
    resourceId: submissionId,
    metadata: {},
  });

  const updated = await ref.get();
  return enrichSubmission(updated.data(), updated.id);
}

/**
 * Accountant review: approve (submitted -> approved) or reject (submitted -> pending).
 */
async function reviewSubmission({ submissionId, accountantUid, action, reason }) {
  const db = getFirestore();
  const ref = db.collection(SUBMISSIONS).doc(submissionId);
  const snap = await ref.get();
  if (!snap.exists) {
    const err = new Error('Submission not found');
    err.statusCode = 404;
    throw err;
  }

  const data = snap.data();
  const accSnap = await db.collection('accountants').doc(accountantUid).get();
  const clientIds = accSnap.exists ? accSnap.data().clientIds || [] : [];
  if (!clientIds.includes(data.userId)) {
    const err = new Error('Submission is not assigned to this accountant');
    err.statusCode = 403;
    throw err;
  }

  if (data.status !== 'submitted') {
    const err = new Error('Only submissions awaiting review can be approved or rejected');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date().toISOString();
  let newStatus;
  const updates = {
    updatedAt: now,
    reviewedAt: now,
    reviewedBy: accountantUid,
  };

  if (action === 'approve') {
    newStatus = 'approved';
    updates.status = newStatus;
    updates.rejectionReason = admin.firestore.FieldValue.delete();
  } else if (action === 'reject') {
    newStatus = 'pending';
    updates.status = newStatus;
    updates.rejectionReason = reason || 'No reason provided';
  } else {
    const err = new Error('Invalid action');
    err.statusCode = 400;
    err.details = ['action must be "approve" or "reject"'];
    throw err;
  }

  await ref.update(updates);

  await logAudit({
    action: `submission.${action}`,
    actorUid: accountantUid,
    resourceType: 'submission',
    resourceId: submissionId,
    metadata: { clientUid: data.userId, reason: reason || null },
  });

  const updated = await ref.get();
  return enrichSubmission(updated.data(), updated.id);
}

/**
 * Adds a short-lived pdfUrl for API consumers while retaining pdfPath in Firestore.
 */
async function enrichSubmission(data, id) {
  if (!data) {
    return null;
  }
  const copy = { id, ...data };
  const storagePath = copy.pdfPath;
  if (storagePath) {
    try {
      copy.pdfUrl = await getSignedPdfUrl(storagePath, 60);
    } catch {
      copy.pdfUrl = null;
    }
  } else {
    copy.pdfUrl = null;
  }
  delete copy.pdfPath;
  return copy;
}

module.exports = {
  createSubmission,
  updateSubmission,
  submitSubmissionToAccountant,
  listSubmissionsForUser,
  listSubmissionsForAccountant,
  listClientsForAccountant,
  reviewSubmission,
  BUSINESS_TYPES,
};
