const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const userController = require('../controllers/user.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/me', auth, userController.getMe);
router.get('/', auth, userController.listUsers);
router.put('/:id/approve', auth, permit('admin'), userController.approveUser);
router.post('/upload-resume', auth, permit('manager', 'admin'), upload.single('resume'), userController.uploadResume);
router.delete('/:id', auth, permit('manager', 'admin'), userController.deleteUser);

module.exports = router;
