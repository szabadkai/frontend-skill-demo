import type { Todo, Goal } from '../store/useStore';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash'; // Updated valid model ID

export interface LLMResponse {
  goals: Array<{ text: string, progress: number }>;
}

export async function inferGoals(
  apiKey: string,
  todos: Todo[],
  currentGoals: Goal[]
): Promise<Array<Goal>> {
  if (!apiKey) {
    throw new Error("OpenRouter API Key is missing.");
  }

  // To save tokens, we only send essential data
  const todoSummary = todos.map(t => `- [${t.completed ? 'x' : ' '}] ${t.text}`).join('\n');
  const goalSummary = currentGoals.map(g => `- ${g.text} (Progress: ${g.progress}%)`).join('\n');

  const systemPrompt = `
You are an intelligent goal-inference assistant.
Look at the user's current Todos and existing Goals.
Your task is to infer 1 to 3 new long-term or medium-term OVERARCHING GOALS based on these todos.
If the todos show a pattern towards something (e.g. 'buy domains', 'setup hosting' -> Goal: 'Launch Website'), identify it.
Also estimate a reasonable starting 'progress' percentage (between 0 and 100) based on how many related todos are completed versus pending.

Output your answer EXACTLY as a raw JSON array of objects, with no markdown formatting. Do not include \`\`\`json.
Each object must have exactly two fields: "text" (string) and "progress" (number between 0 and 100).
Example:
[{"text": "Launch personal portfolio", "progress": 30}]
`;

  const userPrompt = `
Current Todos:
${todoSummary}

Current Goals:
${goalSummary}

Output ONLY the JSON array.
  `;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Todo AI Goals PWA",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    
    // Strip markdown formatting if the model still outputs it
    const cleanContent = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    
    const parsed = JSON.parse(cleanContent) as Array<{text: string, progress: number}>;
    
    return parsed.map(p => ({
      id: crypto.randomUUID(),
      text: p.text,
      progress: p.progress,
      inferred: true
    }));

  } catch (error) {
    console.error("LLM Inference error:", error);
    throw error;
  }
}

export async function inferTodos(
  apiKey: string,
  todos: Todo[],
  targetGoal: Goal,
  userProfile: string
): Promise<Array<{ text: string }>> {
  if (!apiKey) {
    throw new Error("OpenRouter API Key is missing.");
  }

  // To save tokens, we only send essential data
  const todoSummary = todos.map(t => `- [${t.completed ? 'x' : ' '}] ${t.text}`).join('\n');
  const contextBlock = userProfile.trim() ? `User Profile / Context:\n${userProfile}\n` : '';

  const systemPrompt = `
You are an intelligent task-planning assistant.
Your task is to infer 3 to 5 NEW small, actionable micro-tasks (Todos) that will specifically help the user make progress towards the primary Target Goal provided.
Do NOT suggest tasks they've already completed or listed in their Current Todos.
Keep tasks very actionable, concise, and short (under 6 words if possible).

Output your answer EXACTLY as a raw JSON array of objects, with no markdown formatting. Do not include \`\`\`json.
Each object must have exactly one field: "text" (string - the strict action item).
Example:
[{"text": "Research top 5 web hosting providers"}, {"text": "Draft initial sitemap"}]
`;

  const userPrompt = `
${contextBlock}
Target Goal:
- ${targetGoal.text} (Progress: ${targetGoal.progress}%)

Current Todos (Do not duplicate these):
${todoSummary || '(No current tasks)'}

Output ONLY the JSON array.
  `;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Todo AI Goals PWA",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    
    // Strip markdown formatting if the model still outputs it
    const cleanContent = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    
    return JSON.parse(cleanContent) as Array<{text: string}>;

  } catch (error) {
    console.error("LLM Inference error:", error);
    throw error;
  }
}
