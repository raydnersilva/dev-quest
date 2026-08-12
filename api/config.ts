import type { VercelRequest, VercelResponse } from '@vercel/node';
import { noStore } from './_lib/http';
import { publicConfig } from './_lib/config';

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  noStore(res);

  try {
    const config = publicConfig();
    res.status(200).json(config);
  } catch (error) {
    console.error('[api/config]', error);
    res.status(500).json({ error: 'CONFIG_ERROR' });
  }
}
