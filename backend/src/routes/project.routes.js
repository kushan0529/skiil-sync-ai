const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const ProjectController = require('../controllers/project.controller');

router.post('/', auth, ProjectController.createProject);
router.get('/', auth, ProjectController.listProjects);
router.get('/:id', auth, ProjectController.getProject);
router.put('/:id', auth, ProjectController.updateProject);
router.delete('/:id', auth, ProjectController.deleteProject);

module.exports = router;
 