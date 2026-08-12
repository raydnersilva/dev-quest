import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { publicConfig } from './config';

export function bearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export function userClient(req: VercelRequest): { client: SupabaseClient; token: string } | null {
  const token = bearerToken(req);
  const config = publicConfig();
  if (!token || !config.configured) return null;
  const client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return { client, token };
}

export async function requireUser(req: VercelRequest): Promise<{ client: SupabaseClient; user: User } | null> {
  const context = userClient(req);
  if (!context) return null;
  const { data, error } = await context.client.auth.getUser(context.token);
  if (error || !data.user) return null;
  return { client: context.client, user: data.user };
}
