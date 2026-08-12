const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function askGroq(messages: GroqMessage[], json = true): Promise<string> {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const model = process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile';

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2048
  };

  if (json) {
    body['response_format'] = { type: 'json_object' };
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GroqResponse;
  return data.choices[0]?.message?.content ?? '';
}

export function parseGroqJson<T>(raw: string): T {
  const cleaned = raw.trim();
  return JSON.parse(cleaned) as T;
}
