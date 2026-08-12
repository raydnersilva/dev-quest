import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, noStore, safeMessage } from './_lib/http';
import { requireUser } from './_lib/supabase';

type DbProfile = {
  display_name: string;
  avatar: string;
  daily_goal_minutes: number;
  theme: 'dark' | 'light';
  total_xp: number;
  level: number;
  created_at: string;
  updated_at: string;
};

function toClient(row: DbProfile) {
  return {
    displayName: row.display_name,
    avatar: row.avatar,
    dailyGoalMinutes: row.daily_goal_minutes,
    theme: row.theme,
    totalXp: row.total_xp || 0,
    level: row.level || 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  noStore(res);
  if (!['GET', 'POST'].includes(req.method ?? '')) return methodNotAllowed(req, res, ['GET', 'POST']);
  const auth = await requireUser(req);
  if (!auth) { res.status(401).json({ error: 'Sessão inválida ou expirada.' }); return; }

  try {
    if (req.method === 'GET') {
      let { data, error } = await auth.client.from('profiles').select('display_name,avatar,daily_goal_minutes,theme,total_xp,level,created_at,updated_at').eq('id', auth.user.id).maybeSingle();
      if (error) throw error;
      if (!data) {
        const displayName = String(auth.user.user_metadata?.['display_name'] ?? auth.user.email?.split('@')[0] ?? 'Dev em evolução');
        const created = await auth.client.from('profiles').insert({ id: auth.user.id, display_name: displayName, total_xp: 0, level: 1 }).select('display_name,avatar,daily_goal_minutes,theme,total_xp,level,created_at,updated_at').single();
        if (created.error) throw created.error;
        data = created.data;
      }
      res.status(200).json(toClient(data as DbProfile));
      return;
    }

    const body = req.body as { displayName?: string; avatar?: string; dailyGoalMinutes?: number; theme?: string; totalXp?: number; level?: number };
    const displayName = String(body.displayName ?? '').trim().slice(0, 60);
    const avatar = String(body.avatar ?? '🧑‍💻').slice(0, 16);
    const dailyGoalMinutes = Math.min(600, Math.max(15, Math.round(Number(body.dailyGoalMinutes ?? 120))));
    const theme = body.theme === 'light' ? 'light' : 'dark';
    const totalXp = Math.max(0, Math.round(Number(body.totalXp ?? 0)));
    const level = Math.max(1, Math.round(Number(body.level ?? 1)));
    const theme = body.theme === 'light' ? 'light' : 'dark';
    if (!displayName) { res.status(400).json({ error: 'Nome inválido.' }); return; }

    const { data, error } = await auth.client.from('profiles').upsert({
      id: auth.user.id,
      display_name: displayName,
      avatar,
      daily_goal_minutes: dailyGoalMinutes,
      theme,
      total_xp: totalXp,
      level,
      updated_at: new Date().toISOString()
    }).select('display_name,avatar,daily_goal_minutes,theme,total_xp,level,created_at,updated_at').single();
    if (error) throw error;
    res.status(200).json(toClient(data as DbProfile));
  } catch (error) {
    console.error('profile api', error);
    res.status(500).json({ error: safeMessage(error) });
  }
}
