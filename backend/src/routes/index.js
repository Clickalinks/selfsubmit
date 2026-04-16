const express = require('express');

const authRoutes = require('./auth.routes');
const submissionRoutes = require('./submission.routes');
const accountantRoutes = require('./accountant.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/submissions', submissionRoutes);
router.use('/accountant', accountantRoutes);

module.exports = router;
