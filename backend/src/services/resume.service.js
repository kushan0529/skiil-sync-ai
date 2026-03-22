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
    throw new Error('This file is not looking like a resume or is not a valid PDF.');
  }
}

function isLikelyResume(text) {
  if (!text || text.length < 50) return false;
  
  const resumeKeywords = [
    'experience', 'education', 'skills', 'projects', 'summary', 
    'work', 'employment', 'background', 'qualification', 'certified',
    'university', 'college', 'school', 'professional', 'technical'
  ];
  
  const lowerText = text.toLowerCase();
  const matchCount = resumeKeywords.reduce((count, kw) => {
    return count + (lowerText.includes(kw) ? 1 : 0);
  }, 0);
  
  // If it has at least 3 keywords, we consider it a resume for this simple check
  return matchCount >= 3;
}


async function getSkillsFromResume(buffer) {
  const text = await extractText(buffer);
  
  if (!text || !isLikelyResume(text)) {
    throw new Error('This file is not looking like a resume.');
  }
  
  const skills = await aiService.extractSkillsFromResume(text);
  
  if (!skills || skills.length === 0) {
    throw new Error('This file is not having any skills or no identifiable skills were found.');
  }
  
  return skills;
}

module.exports = { extractText, getSkillsFromResume };
