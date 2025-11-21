const pdf = require('pdf-parse');

async function extractText(buffer) {
  const data = await pdf(buffer);
  return data.text || '';
}

async function simpleSkillExtract(text) {
  if (!text) return [];
  const keywords = ['JavaScript','React','Node','Express','MongoDB','TypeScript','Docker','AWS','Python','Django'];
  const lower = text.toLowerCase();
  const found = new Set();
  for (const k of keywords) {
    if (lower.includes(k.toLowerCase())) found.add(k);
  }
  return Array.from(found);
}

module.exports = { extractText, simpleSkillExtract };
