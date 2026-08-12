import type { VercelRequest, VercelResponse } from '@vercel/node';

export function noStore(res: VercelResponse): void {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
}

export function methodNotAllowed(req: VercelRequest, res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: `Método ${req.method ?? ''} não permitido.` });
}

export function safeMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Erro interno.';
}
