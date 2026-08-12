import type { VercelRequest, VercelResponse } from '@vercel/node';
import { noStore } from './_lib/http';
import { publicConfig } from './_lib/config';

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  noStore(res);
  const config = publicConfig();
  res.status(200).json({ ok: true, service: 'devquest-api', database: config.configured ? 'configured' : 'not-configured', timestamp: new Date().toISOString() });
}
