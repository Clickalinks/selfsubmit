const { getAuth } = require('../config/firebase');
const { AppError } = require('./errorHandler');
const { getUserProfile } = require('../services/user.service');

/**
 * Verifies Firebase ID token from `Authorization: Bearer <token>`.
 * Attaches `req.auth` { uid, token } and `req.userProfile` when available.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next(new AppError(401, 'Missing or invalid Authorization header'));
  }

  const idToken = match[1];

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch {
    return next(new AppError(401, 'Invalid or expired token'));
  }

  req.auth = { uid: decoded.uid, token: decoded };
  try {
    req.userProfile = await getUserProfile(decoded.uid);
  } catch (err) {
    return next(err);
  }
  return next();
}

/**
 * Ensures Firestore user profile exists and matches allowed roles.
 * @param {('client'|'accountant')[]} roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userProfile) {
      return next(new AppError(403, 'User profile not registered'));
    }
    if (!roles.includes(req.userProfile.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
