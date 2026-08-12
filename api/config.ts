import type { VercelRequest, VercelResponse } from '@vercel/node';
import { noStore } from './_lib/http';
import { publicConfig } from './_lib/supabase';

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  noStore(res);
  res.status(200).json(publicConfig());
}
