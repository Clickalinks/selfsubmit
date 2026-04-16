const { getFirestore } = require('../config/firebase');

/**
 * Append-only audit trail for compliance (e.g. 6-year retention context).
 */
async function logAudit({ action, actorUid, resourceType, resourceId, metadata }) {
  const db = getFirestore();
  await db.collection('audit_logs').add({
    action,
    actorUid: actorUid || null,
    resourceType: resourceType || null,
    resourceId: resourceId || null,
    metadata: metadata || {},
    createdAt: new Date().toISOString(),
  });
}

module.exports = {
  logAudit,
};
