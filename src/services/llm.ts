import type { Todo, Goal } from '../store/useStore';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001'; // Common stable model ID

export interface LLMResponse {
  goals: Array<{ text: string, progress: number }>;
}

export async function fleshOutGoal(
  apiKey: string,
  title: string,
  currentNotes: string,
  userProfile: string,
  onProgress?: (text: string) => void
): Promise<string> {
  if (!apiKey) {
    throw new Error("OpenRouter API Key is missing.");
  }
  
  const token = apiKey.trim();

  const contextBlock = userProfile.trim() ? `User Profile / Context:\n${userProfile}\n` : '';

  const systemPrompt = `
You are an intelligent planning assistant.
Your task is to take a high-level goal and any partial notes the user has provided, and expand it into a fully fleshed-out, structured markdown document.
Integrate their partial notes seamlessly. Structure the response with clear headings, bullet points, milestones, or technical specifications as appropriate for the goal type.
Output ONLY the raw markdown text, with no conversational filler.
`;

  const userPrompt = `
${contextBlock}
Goal Title: ${title}
User's Current Notes/Ideas:
${currentNotes || "(None provided)"}

Please output the structured markdown document now:
  `;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Todo AI Goals PWA",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: !!onProgress,
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

    if (onProgress) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Streaming not supported");
      const decoder = new TextDecoder("utf-8");
      
      let fullText = "";
      let buffer = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const cleanLine = line.replace(/^data:\s*/, "").trim();
          if (cleanLine === "[DONE]" || !cleanLine) continue;
          
          try {
            const parsed = JSON.parse(cleanLine);
            const token = parsed.choices?.[0]?.delta?.content || "";
            if (token) {
              fullText += token;
              onProgress(fullText);
            }
          } catch(e) {
            // skip unparseable fragments
          }
        }
      }
      return fullText;
    } else {
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    }

  } catch (error) {
    console.error("LLM Expand error:", error);
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

  const token = apiKey.trim();

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
        "Authorization": `Bearer ${token}`,
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
