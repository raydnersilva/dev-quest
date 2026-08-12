import { VercelRequest, VercelResponse } from '@vercel/node';
import { askGroq } from '../_lib/groq';

export default async function evaluate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, language, userCode } = req.body;

  if (!title || !description || !userCode) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const prompt = `Você é um avaliador de código sênior. Avalie a seguinte solução escrita pelo usuário para o desafio de código.
  
Desafio: ${title}
Descrição: ${description}
Linguagem: ${language}

Solução do usuário:
\`\`\`${language}
${userCode}
\`\`\`

A solução resolve o problema corretamente e cobre os casos base? 
Sua resposta deve ser estritamente no seguinte formato JSON, sem marcações markdown ou outro texto:
{
  "correct": true ou false,
  "feedback": "Sua análise curta (máximo de 3 frases). Se estiver errado, explique por quê. Se estiver certo, elogie e sugira uma micro-melhoria de performance/clean code se houver."
}`;

  try {
    const aiResponse = await askGroq([{ role: 'user', content: prompt }], true);
    
    // Parse the JSON from the AI response
    let result;
    try {
      const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI evaluate response:', aiResponse);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Groq Evaluate Error:', error);
    res.status(500).json({ error: 'Failed to evaluate code' });
  }
}
