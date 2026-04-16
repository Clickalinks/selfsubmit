const { registerUser } = require('../services/user.service');
const { logAudit } = require('../services/audit.service');
const { AppError } = require('../middleware/errorHandler');

/**
 * POST /api/auth/register
 * Creates Firestore profile after Firebase Auth signup on the client.
 */
async function register(req, res, next) {
  try {
    const uid = req.auth.uid;
    const { displayName, role, businessType, businessName, accountantId } = req.body;

    if (!role || !['client', 'accountant'].includes(role)) {
      throw new AppError(400, 'role must be "client" or "accountant"');
    }
    if (role === 'client' && !businessType) {
      throw new AppError(400, 'businessType is required for clients');
    }

    const email = req.auth.token.email || req.body.email || null;

    const profile = await registerUser(uid, {
      email,
      displayName,
      role,
      businessType,
      businessName,
      accountantId,
    });

    await logAudit({
      action: 'user.registered',
      actorUid: uid,
      resourceType: 'user',
      resourceId: uid,
      metadata: { role },
    });

    res.status(201).json({ user: profile });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
};
