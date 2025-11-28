const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const multer = require('multer');
const upload = multer();

router.get('/me', auth, userController.getMe);
router.post('/upload-resume', auth, upload.single('resume'), userController.uploadResume);

module.exports = router;
