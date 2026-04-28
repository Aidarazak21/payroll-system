const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/run', payrollController.getRun);
router.post('/run', payrollController.postRun);
router.get('/history', payrollController.getHistory);
router.get('/payslip/:id', payrollController.getPayslip);

module.exports = router;
