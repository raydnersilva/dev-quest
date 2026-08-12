import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, noStore, safeMessage } from './_lib/http';
import { userClient } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  noStore(res);
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);
  
  const auth = userClient(req);
  if (!auth) { res.status(401).json({ error: 'Não autorizado.' }); return; }

  try {
    const { data, error } = await auth.client
      .from('profiles')
      .select('display_name, avatar, total_xp, level')
      .order('total_xp', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    
    const formatted = (data || []).map(row => ({
      displayName: row.display_name,
      avatar: row.avatar,
      totalXp: row.total_xp || 0,
      level: row.level || 1
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    console.error('leaderboard api', error);
    res.status(500).json({ error: safeMessage(error) });
  }
}
