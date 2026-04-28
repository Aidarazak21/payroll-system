const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', employeeController.getIndex);
router.get('/create', employeeController.getCreate);
router.post('/', employeeController.postCreate);
router.get('/:id/edit', employeeController.getEdit);
router.post('/:id', employeeController.postEdit);
router.post('/:id/delete', employeeController.postDelete);

module.exports = router;
