const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const aiService = require('../services/ai.service');

router.post('/chat', auth, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Use a generic chat or specific recommendation based on context
    // For now, let's just use the OpenAI client directly in ai.service or add a chat method
    const response = await aiService.chat(message, req.user);
    res.json({ response });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
