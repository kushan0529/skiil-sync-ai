const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/me', auth, userController.getMe);
router.get('/', auth, userController.listUsers);
router.post('/upload-resume', auth, upload.single('resume'), userController.uploadResume);

module.exports = router;
