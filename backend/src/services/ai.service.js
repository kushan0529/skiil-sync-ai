const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// Use a more capable model for extraction tasks
const EXTRACTION_MODEL = 'llama-3.3-70b-versatile'; 
const RECOMMENDATION_MODEL = 'llama-3.1-8b-instant';

async function recommendAssignees(task, users) {
  try {
    const usersText = users.map((u, idx) => `${idx}: ${u.name} - skills: ${(u.skills || []).join(', ')} - availability:${u.availabilityScore || 1}`).join('\n');
    const prompt = `You are an assistant that suggests the best assignees for a task.\nTask title: ${task.title}\nRequired skills: ${(task.requiredSkills || []).join(', ')}\nUsers:\n${usersText}\n\nReturn ONLY a JSON array of up to 3 suggestions. Example: [ { "userIdIndex": 0, "score": 0.9, "reason": "Good match" } ]`;

    const resp = await client.chat.completions.create({
      model: RECOMMENDATION_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    });

    const out = resp.choices[0].message.content || '';
    const match = out.match(/\[.*\]/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        return [];
      }
    }
    return [];
  } catch (err) {
    console.warn('[ai] recommendAssignees failed', err.message);
    return [];
  }
}

async function extractSkillsFromResume(text) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[ai] Missing OPENAI_API_KEY in .env.');
    return [];
  }
  try {
    // Limit input text to avoid context bloat
    const truncatedText = text.slice(0, 6000);
    
    const prompt = `Extract a concise list of unique technical skills (languages, frameworks, tools) from this resume. 
    Return ONLY a JSON array of strings. 
    RULES:
    1. Maximum 20 most relevant skills.
    2. No duplicate or repeating phrases.
    3. No descriptive sentences.
    4. Format as ["Skill1", "Skill2"].
    
    Resume text:
    ${truncatedText}`;
    
    const resp = await client.chat.completions.create({
      model: EXTRACTION_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // Slight temperature can actually help avoid loops
      max_tokens: 500
    });

    const out = resp.choices[0].message.content || '';
    const match = out.match(/\[[\s\S]*\]/);
    
    if (match) {
      try {
        let skills = JSON.parse(match[0]);
        if (Array.isArray(skills)) {
          // SANITY FILTER: Remove duplicates and any unusually long strings or looping patterns
          skills = [...new Set(skills)] // Deduplicate
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.length < 40) // Remove empty or suspiciously long "skills"
            .filter(s => !s.includes(' - ')) // Remove those repeating " - Query Store" patterns
            .slice(0, 25); // Hard cap at 25 skills
            
          console.log(`[ai] Cleaned skills:`, skills);
          return skills;
        }
      } catch (err) {
        console.warn('[ai] Parse error', err.message);
      }
    }
    return [];
  } catch (err) {
    console.error('[ai] extractSkills failed:', err.message);
    return [];
  }
}

async function recommendProjects(user, projects) {
  try {
    const projectsText = projects.map((p, idx) => `${idx}: ${p.name} - required skills: ${(p.requiredSkills || []).join(', ')}`).join('\n');
    const prompt = `Match this developer to a project.\nDeveloper: ${user.name}\nSkills: ${(user.skills || []).join(', ')}\n\nProjects:\n${projectsText}\n\nReturn ONLY a JSON array of top 3: [ { "projectIdIndex": <index>, "score": <0-1>, "reason": "reason" } ]`;

    const resp = await client.chat.completions.create({
      model: RECOMMENDATION_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    });

    const out = resp.choices[0].message.content || '';
    const match = out.match(/\[.*\]/s);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e) { return []; }
    }
    return [];
  } catch (err) {
    return [];
  }
}

module.exports = { recommendAssignees, extractSkillsFromResume, recommendProjects };
