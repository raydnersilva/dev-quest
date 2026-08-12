export interface PublicConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  configured: boolean;
}

function firstEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export function publicConfig(): PublicConfig {
  const supabaseUrl = firstEnv(
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL'
  );

  const supabasePublishableKey = firstEnv(
    'SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );

  return {
    supabaseUrl,
    supabasePublishableKey,
    configured: Boolean(supabaseUrl && supabasePublishableKey)
  };
}
