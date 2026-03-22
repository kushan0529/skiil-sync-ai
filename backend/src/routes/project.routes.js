const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const ProjectController = require('../controllers/project.controller');

router.post('/', auth, ProjectController.createProject);
router.post('/assign-best', auth, ProjectController.assignToBestProject);
router.get('/', auth, ProjectController.listProjects);
router.get('/recommend/:userId', auth, ProjectController.recommendProjects);
router.post('/seed', auth, permit('manager', 'admin'), ProjectController.seed);
router.get('/:id', auth, ProjectController.getProject);
router.put('/:id', auth, ProjectController.updateProject);
router.delete('/:id', auth, permit('manager', 'admin'), ProjectController.deleteProject);

module.exports = router;
 