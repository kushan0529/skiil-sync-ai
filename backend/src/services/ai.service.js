const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// Use a more capable model for extraction and complex reasoning
const EXTRACTION_MODEL = 'llama-3.3-70b-versatile'; 
const RECOMMENDATION_MODEL = 'llama-3.1-8b-instant';

const JIRA_SYSTEM_PROMPT = `You are the SkillSync AI Assistant, an advanced project management intelligence similar to Jira's AI. 
Your goal is to help users optimize their Agile workflows, manage tasks effectively, and make data-driven decisions.
Always be professional, concise, and focused on productivity, team velocity, and skill alignment.
When suggesting actions, explain the 'why' using project management principles (e.g., resource allocation, skill-to-task mapping, bottleneck prevention).`;

async function recommendAssignees(task, users) {
  try {
    const usersText = users.map((u, idx) => `${idx}: ${u.name} - skills: ${(u.skills || []).join(', ')} - availability:${u.availabilityScore || 1}`).join('\n');
    
    const prompt = `Task analysis for smart assignment:
Project: ${task.project?.name || 'N/A'}
Task Title: ${task.title}
Required Skills: ${(task.requiredSkills || []).join(', ')}
Priority: ${task.priority || 'Medium'}

Available Resources:
${usersText}

As a Project Management Assistant, analyze the workload and skill sets to suggest the top 3 best-fit assignees.
Consider:
1. Skill Match: How closely do user skills align with task requirements?
2. Availability: Prioritize users with higher availability scores.
3. Expertise: Identify users who can drive the task to completion fastest.

Return ONLY a JSON array of up to 3 suggestions. 
Example format: [ { "userIdIndex": 0, "score": 0.95, "reason": "Expert in React with 100% availability; has completed 5 similar tasks this sprint." } ]`;

    const resp = await client.chat.completions.create({
      model: RECOMMENDATION_MODEL,
      messages: [
        { role: 'system', content: JIRA_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
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
    
    const prompt = `Identify and categorize professional technical skills from the following resume text. 
Focus on:
- Languages & Frameworks (e.g., Python, React, Go)
- Infrastructure & Tools (e.g., Docker, AWS, Git)
- Databases (e.g., PostgreSQL, Redis)
- Methodologies (e.g., Agile, Scrum)

Resume text:
${truncatedText}

Format the output as a clean JSON array of strings. Limit to 20 most relevant skills.`;
    
    const resp = await client.chat.completions.create({
      model: EXTRACTION_MODEL,
      messages: [
        { role: 'system', content: 'You are a specialized Technical Recruiter AI. Return ONLY a JSON array.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0
    });

    let out = resp.choices[0].message.content || '';
    if (out.includes('```')) {
      const markdownMatch = out.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch) out = markdownMatch[1];
    }
    
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
        console.warn('[ai] Parse error in skills extraction', err.message);
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
    const projectsText = projects.map((p, idx) => `${idx}: ${p.name} - required skills: ${(p.requiredSkills || []).join(', ')} - status: ${p.status}`).join('\n');
    
    const prompt = `Strategic Resource Allocation Analysis:
Developer: ${user.name}
Role: ${user.role}
Verified Skills: ${(user.skills || []).join(', ')}

Available Projects for Planning:
${projectsText}

Analyze which projects would benefit most from this developer's expertise. 
Consider skill synergy and project priority. 

Return ONLY a JSON array of top 3: [ { "projectIdIndex": <index>, "score": <0-1>, "reason": "<Detailed Jira-style explanation of why this is a good match>" } ]`;

    const resp = await client.chat.completions.create({
      model: RECOMMENDATION_MODEL,
      messages: [
        { role: 'system', content: JIRA_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
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
    const prompt = `User Context:
Name: ${user.name}
Role: ${user.role}
Skills: ${(user.skills || []).join(', ')}

User Request: "${message}"

Respond as a Jira-like Virtual Assistant. If the user asks for:
- Task Breakdown: Suggest 3-5 sub-tasks for a given goal.
- Descriptions: Help draft professional issue descriptions.
- Summarization: Summarize progress (based on what they ask).
- General PM: Provide advice on sprints, backlogs, or blockers.

Keep responses professional, helpful, and formatted for readability. Use bullet points where appropriate.`;
    
    const resp = await client.chat.completions.create({
      model: RECOMMENDATION_MODEL,
      messages: [
        { role: 'system', content: JIRA_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return resp.choices[0].message.content || "I'm sorry, I couldn't process that request at this time.";
  } catch (err) {
    console.error('[ai] chat failed', err.message);
    return "The SkillSync AI Service is temporarily reaching its capacity. Please try again in a moment.";
  }
}

module.exports = { recommendAssignees, extractSkillsFromResume, recommendProjects, chat };

