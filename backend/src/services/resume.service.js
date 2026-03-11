const pdf = require('pdf-parse');
const aiService = require('./ai.service');

async function extractText(buffer) {
  try {
    const data = await pdf(buffer);
    if (!data.text || data.text.trim().length === 0) {
      console.warn('[pdf-parse] No text extracted from PDF. It might be an image/scan.');
      return '';
    }
    console.log(`[pdf-parse] Extracted ${data.text.length} characters.`);
    return data.text;
  } catch (err) {
    console.error('[pdf-parse] PDF parsing failed:', err.message);
    return '';
  }
}


async function getSkillsFromResume(buffer) {
  const text = await extractText(buffer);
  if (!text) return [];
  return await aiService.extractSkillsFromResume(text);
}

module.exports = { extractText, getSkillsFromResume };
