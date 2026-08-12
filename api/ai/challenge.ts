import type { VercelRequest, VercelResponse } from '@vercel/node';
import { noStore, methodNotAllowed, safeMessage } from '../_lib/http';
import { askGroq, parseGroqJson } from '../_lib/groq';

interface ChallengeRequest {
  topic: string;
  track: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
}

interface ChallengeResponse {
  title: string;
  difficulty: string;
  language: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  hints: string[];
  solution: string;
  solutionExplanation: string;
}

const LANG_MAP: Record<string, string> = {
  backend: 'Java',
  frontend: 'TypeScript',
  cloud: 'Bash/HCL (Terraform)',
  architecture: 'Java',
  english: 'TypeScript',
  ads: 'JavaScript'
};

const DIFFICULTY_MAP: Record<string, string> = {
  easy: 'Fácil — conceitos básicos, solução direta',
  medium: 'Médio — requer raciocínio, pode envolver estruturas de dados',
  hard: 'Difícil — otimização, trade-offs, algoritmos não triviais'
};

const SYSTEM_PROMPT = `Você é um gerador de exercícios de programação estilo LeetCode/HackerRank.
Sempre responda em JSON válido com a estrutura exata:
{
  "title": "Nome do Exercício",
  "difficulty": "easy|medium|hard",
  "language": "Java|TypeScript|...",
  "description": "Descrição completa do problema em português. Use markdown para formatação.",
  "examples": [
    { "input": "...", "output": "...", "explanation": "Explicação opcional" }
  ],
  "constraints": ["Limite 1", "Limite 2"],
  "hints": ["Dica 1 sem revelar a solução", "Dica 2"],
  "solution": "Código completo da solução com comentários",
  "solutionExplanation": "Explicação detalhada da abordagem e complexidade"
}

Regras:
- O exercício deve ser PRÁTICO e relacionado ao tópico fornecido
- Exemplos devem ter pelo menos 2 casos de teste
- A solução deve ser funcional e bem comentada
- Para Java: use classes e métodos estáticos
- Para TypeScript: use funções tipadas
- Para SQL: use queries completas
- Dicas devem guiar sem entregar a resposta
- O nível deve corresponder à dificuldade pedida`;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  noStore(res);

  if (req.method !== 'POST') {
    methodNotAllowed(req, res, ['POST']);
    return;
  }

  try {
    const { topic, track, difficulty, language } = req.body as ChallengeRequest;

    if (!topic || !track) {
      res.status(400).json({ error: 'topic e track são obrigatórios.' });
      return;
    }

    const lang = language || LANG_MAP[track] || 'Java';
    const diff = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP['medium'];

    const userPrompt = `Crie um exercício de programação sobre "${topic}" em ${lang}.
Dificuldade: ${diff}.
Contexto: O aluno está na trilha "${track}" de um plano de estudos para desenvolvedor Full Stack.
O exercício deve ser prático, testável e ajudar a fixar o conceito de "${topic}".`;

    const raw = await askGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    const data = parseGroqJson<ChallengeResponse>(raw);
    res.status(200).json(data);
  } catch (error) {
    console.error('[api/ai/challenge]', error);
    res.status(500).json({ error: safeMessage(error) });
  }
}
