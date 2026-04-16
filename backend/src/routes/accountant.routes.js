const express = require('express');
const accountantController = require('../controllers/accountant.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('accountant'));

router.get('/clients', accountantController.listClients);
router.get('/submissions', accountantController.listSubmissions);
router.patch('/submissions/:submissionId', accountantController.review);

module.exports = router;
