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
    const jsonMatch = out.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.warn('[ai] Parse error in recommendation response', err.message);
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
    const truncatedText = text.slice(0, 10000);
    
    const prompt = `Extract a list of technical skills from the following resume text. 
    Focus on: Programming Languages, Frameworks, Databases, and Tools.
    
    Format the output as a clean JSON array of strings. 
    Example output: ["React", "Node.js", "MongoDB", "Python"]
    
    Resume text:
    ${truncatedText}`;
    
    const resp = await client.chat.completions.create({
      model: EXTRACTION_MODEL,
      messages: [
        { role: 'system', content: 'You are a professional technical recruiter. Return ONLY a JSON array.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 800
    });

    let out = resp.choices[0].message.content || '';
    
    // Clean up response: remove markdown code blocks
    if (out.includes('```')) {
      const markdownMatch = out.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch) out = markdownMatch[1];
    }
    
    // Attempt to extract the first valid JSON array found in the output
    const jsonMatch = out.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        let skills = JSON.parse(jsonMatch[0]);
        if (Array.isArray(skills)) {
          return [...new Set(skills)]
            .map(s => String(s).trim())
            .filter(s => s.length > 1 && s.length < 50)
            .slice(0, 30);
        }
      } catch (err) {
        // If the first match fails, the model might have nested brackets or complex text. 
        // Fallback: search for the last closing bracket if the first match was incomplete
        try {
          const lastBracketIndex = out.lastIndexOf(']');
          const firstBracketIndex = out.indexOf('[');
          if (firstBracketIndex !== -1 && lastBracketIndex !== -1 && lastBracketIndex > firstBracketIndex) {
            const potentialJson = out.substring(firstBracketIndex, lastBracketIndex + 1);
            let skills = JSON.parse(potentialJson);
            if (Array.isArray(skills)) {
              return [...new Set(skills)].map(s => String(s).trim()).filter(s => s.length > 1).slice(0, 30);
            }
          }
        } catch (innerErr) {
          console.warn('[ai] Parse error in skills extraction', err.message);
        }
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
    const jsonMatch = out.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch (e) { 
        console.warn('[ai] Parse error in project recommendation', e.message);
        return []; 
      }
    }
    return [];
  } catch (err) {
    return [];
  }
}

async function chat(message, user) {
  try {
    const prompt = `User ${user.name} asks: ${message}\nContext: User role is ${user.role}. Skills: ${(user.skills || []).join(', ')}. Provide a helpful, concise response about task management, project suggestions, or team optimization.`;
    
    const resp = await client.chat.completions.create({
      model: RECOMMENDATION_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 250
    });

    return resp.choices[0].message.content || "I'm sorry, I couldn't process that.";
  } catch (err) {
    console.error('[ai] chat failed', err.message);
    return "AI service is temporarily unavailable.";
  }
}

module.exports = { recommendAssignees, extractSkillsFromResume, recommendProjects, chat };
