const express = require('express');
const submissionController = require('../controllers/submission.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('client'));

router.post('/', submissionController.create);
router.get('/', submissionController.listMine);
router.post('/:submissionId/submit', submissionController.submit);
router.patch('/:submissionId', submissionController.update);

module.exports = router;
