const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function recommendAssignees(task, users) {
  try {
    const usersText = users.map((u, idx) => `${idx}: ${u.name} - skills: ${(u.skills || []).join(', ')} - availability:${u.availabilityScore || 1}`).join('\n');
    const prompt = `You are an assistant that suggests the best assignees for a task.\nTask title: ${task.title}\nRequired skills: ${(task.requiredSkills || []).join(', ')}\nUsers:\n${usersText}\n\nReturn a JSON array of up to 3 suggestions. Each suggestion: { "userIdIndex": <index>, "score": <0-1>, "reason": "<short reason>" }`;

    const resp = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      temperature: 0
    });

    const out = resp.output?.[0]?.content?.[0]?.text || resp.output_text || '';
    const match = out.match(/\[.*\]/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        console.warn('[ai] parse error', err.message);
        return [];
      }
    } else {
      return [];
    }
  } catch (err) {
    console.warn('[ai] request failed', err.message);
    return [];
  }
}

module.exports = { recommendAssignees };
