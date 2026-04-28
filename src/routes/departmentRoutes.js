const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', departmentController.getIndex);
router.get('/create', departmentController.getCreate);
router.post('/', departmentController.postCreate);
router.get('/:id/edit', departmentController.getEdit);
router.post('/:id', departmentController.postEdit);
router.post('/:id/delete', departmentController.postDelete);

module.exports = router;
