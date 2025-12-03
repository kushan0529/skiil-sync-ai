const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const TaskController = require('../controllers/task.controller');

router.post('/', auth, TaskController.createTask);
router.put('/:id', auth, TaskController.updateTask);
router.get('/:id', auth, TaskController.getTask);
router.get('/project/:projectId', auth, TaskController.listByProject);

module.exports = router;
