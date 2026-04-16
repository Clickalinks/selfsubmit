const {
  createSubmission,
  updateSubmission,
  submitSubmissionToAccountant,
  listSubmissionsForUser,
} = require('../services/submission.service');

/**
 * POST /api/submissions
 */
async function create(req, res, next) {
  try {
    const submission = await createSubmission(req.auth.uid, req.body);
    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/submissions
 */
async function listMine(req, res, next) {
  try {
    const submissions = await listSubmissionsForUser(req.auth.uid);
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/submissions/:submissionId/submit
 * Moves pending -> submitted (sent to accountant).
 */
async function submit(req, res, next) {
  try {
    const submission = await submitSubmissionToAccountant(
      req.auth.uid,
      req.params.submissionId,
    );
    res.json({ submission });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/submissions/:submissionId
 * Updates income/expenses while status is pending (including after accountant reject).
 */
async function update(req, res, next) {
  try {
    const submission = await updateSubmission(req.auth.uid, req.params.submissionId, req.body);
    res.json({ submission });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  listMine,
  submit,
  update,
};
