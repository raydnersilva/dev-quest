import type { VercelRequest, VercelResponse } from '@vercel/node';
import { noStore, methodNotAllowed, safeMessage } from '../_lib/http';
import { askGroq, parseGroqJson } from '../_lib/groq';

interface SuggestRequest {
  topic: string;
  track: string;
  phase: number;
}

interface VideoSuggestion {
  title: string;
  channel: string;
  url: string;
  duration: string;
  reason: string;
}

interface CourseSuggestion {
  title: string;
  platform: string;
  url: string;
  price: string;
  rating: string;
  reason: string;
}

interface SuggestResponse {
  videos: VideoSuggestion[];
  courses: CourseSuggestion[];
}

const SYSTEM_PROMPT = `Você é um mentor de tecnologia especialista em recomendar recursos de estudo.
Sempre responda em JSON válido com a estrutura exata:
{
  "videos": [
    { "title": "...", "channel": "...", "url": "https://youtube.com/...", "duration": "...", "reason": "..." }
  ],
  "courses": [
    { "title": "...", "platform": "...", "url": "https://...", "price": "Gratuito ou R$XX", "rating": "4.7/5", "reason": "..." }
  ]
}

Regras:
- Sugira exatamente 3 vídeos gratuitos do YouTube (canais reais e conhecidos, brasileiros ou internacionais)
- Sugira exatamente 2 cursos com bom custo-benefício (Udemy, Alura, Coursera, etc.) — pode incluir gratuitos
- NUNCA invente links diretos (como watch?v= ou /course/...). A inteligência artificial costuma alucinar links que não existem.
- Para vídeos, a "url" DEVE SER UM LINK DE BUSCA. Formato: https://www.youtube.com/results?search_query=NOME+DO+CANAL+TEMA+AQUI (substitua os espaços por +)
- Para cursos, a "url" DEVE SER UM LINK DE BUSCA. Exemplo Udemy: https://www.udemy.com/courses/search/?q=NOME+DO+CURSO (substitua os espaços por +)
- Prefira conteúdo em português para iniciantes, inglês para níveis avançados
- A "reason" deve explicar por que aquele recurso é bom para o tópico específico
- Considere o nível do aluno baseado na fase (1-24, onde 1=iniciante, 24=avançado)`;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  noStore(res);

  if (req.method !== 'POST') {
    methodNotAllowed(req, res, ['POST']);
    return;
  }

  try {
    const { topic, track, phase } = req.body as SuggestRequest;

    if (!topic || !track) {
      res.status(400).json({ error: 'topic e track são obrigatórios.' });
      return;
    }

    const userPrompt = `Sugira recursos de estudo para o tópico "${topic}" na trilha "${track}", fase ${phase ?? 1} de 24.
O aluno está estudando para se tornar um desenvolvedor Full Stack (Java Backend + Angular Frontend + Cloud).
Foque em conteúdo prático e atual.`;

    const raw = await askGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    const data = parseGroqJson<SuggestResponse>(raw);
    res.status(200).json(data);
  } catch (error) {
    console.error('[api/ai/suggest]', error);
    res.status(500).json({ error: safeMessage(error) });
  }
}
