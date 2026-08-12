import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, noStore, safeMessage } from './_lib/http';
import { requireUser } from './_lib/supabase';

type InputEntry = {
  date: string;
  taskKey: string;
  category: string;
  track: string;
  completed: boolean;
  minutes: number;
  notes?: string | null;
  updatedAt?: string;
};

type DbRow = {
  date: string;
  task_key: string;
  category: string;
  track: string;
  completed: boolean;
  minutes: number;
  notes: string | null;
  updated_at: string;
};

function toClient(row: DbRow) {
  return {
    date: row.date,
    taskKey: row.task_key,
    category: row.category,
    track: row.track,
    completed: row.completed,
    minutes: row.minutes,
    notes: row.notes,
    updatedAt: row.updated_at
  };
}

function valid(entry: InputEntry): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
    && typeof entry.taskKey === 'string' && entry.taskKey.length > 0 && entry.taskKey.length <= 120
    && ['english', 'career', 'ads'].includes(entry.category)
    && ['backend', 'frontend', 'cloud', 'architecture', 'english', 'ads'].includes(entry.track)
    && typeof entry.completed === 'boolean'
    && Number.isFinite(entry.minutes) && entry.minutes >= 0 && entry.minutes <= 1440
    && (entry.notes == null || (typeof entry.notes === 'string' && entry.notes.length <= 10000));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  noStore(res);
  if (!['GET', 'POST'].includes(req.method ?? '')) return methodNotAllowed(req, res, ['GET', 'POST']);
  const auth = await requireUser(req);
  if (!auth) { res.status(401).json({ error: 'Sessão inválida ou expirada.' }); return; }

  try {
    if (req.method === 'GET') {
      const { data, error } = await auth.client
        .from('progress_entries')
        .select('date,task_key,category,track,completed,minutes,notes,updated_at')
        .eq('user_id', auth.user.id)
        .order('date', { ascending: true });
      if (error) throw error;
      res.status(200).json((data as DbRow[]).map(toClient));
      return;
    }

    const body = req.body as { entries?: InputEntry[] } | InputEntry;
    const entries = Array.isArray((body as { entries?: InputEntry[] }).entries)
      ? (body as { entries: InputEntry[] }).entries
      : [body as InputEntry];
    if (!entries.length || entries.length > 1000 || entries.some(entry => !valid(entry))) {
      res.status(400).json({ error: 'Payload de progresso inválido.' });
      return;
    }

    const rows = entries.map(entry => ({
      user_id: auth.user.id,
      date: entry.date,
      task_key: entry.taskKey,
      category: entry.category,
      track: entry.track,
      completed: entry.completed,
      minutes: Math.round(entry.minutes),
      notes: entry.notes?.trim() || null,
      updated_at: entry.updatedAt || new Date().toISOString()
    }));

    const { data, error } = await auth.client
      .from('progress_entries')
      .upsert(rows, { onConflict: 'user_id,date,task_key' })
      .select('date,task_key,category,track,completed,minutes,notes,updated_at');
    if (error) throw error;
    res.status(200).json((data as DbRow[]).map(toClient));
  } catch (error) {
    console.error('progress api', error);
    res.status(500).json({ error: safeMessage(error) });
  }
}
