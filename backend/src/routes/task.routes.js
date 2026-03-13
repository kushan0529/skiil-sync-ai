const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const TaskController = require('../controllers/task.controller');

router.post('/', auth, TaskController.createTask);
router.get('/', auth, TaskController.listTasks);
router.get('/:id', auth, TaskController.getTask);
router.put('/:id', auth, TaskController.updateTask);
router.delete('/:id', auth, permit('manager', 'admin'), TaskController.deleteTask);
router.get('/project/:projectId', auth, TaskController.listByProject);
router.put('/:id/assignee', auth, TaskController.assignee);

module.exports = router;
