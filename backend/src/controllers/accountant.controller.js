const {
  listClientsForAccountant,
  listSubmissionsForAccountant,
  reviewSubmission,
} = require('../services/submission.service');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/accountant/clients
 */
async function listClients(req, res, next) {
  try {
    const clients = await listClientsForAccountant(req.auth.uid);
    res.json({ clients });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accountant/submissions
 */
async function listSubmissions(req, res, next) {
  try {
    const submissions = await listSubmissionsForAccountant(req.auth.uid);
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/accountant/submissions/:submissionId
 * Body: { "action": "approve" | "reject", "reason"?: string }
 */
async function review(req, res, next) {
  try {
    const { action, reason } = req.body;
    if (!action) {
      throw new AppError(400, 'action is required');
    }

    const submission = await reviewSubmission({
      submissionId: req.params.submissionId,
      accountantUid: req.auth.uid,
      action,
      reason,
    });

    res.json({ submission });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listClients,
  listSubmissions,
  review,
};
