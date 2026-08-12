import { Injectable, computed, signal } from '@angular/core';
import { AuthChangeEvent, Session, SupabaseClient, createClient } from '@supabase/supabase-js';

interface PublicConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  configured: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private client: SupabaseClient | null = null;
  private initialized = false;
  readonly session = signal<Session | null>(null);
  readonly loading = signal(false);
  readonly configured = signal(false);
  readonly initError = signal<string | null>(null);
  readonly authenticated = computed(() => !!this.session()?.user);
  readonly user = computed(() => this.session()?.user ?? null);

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      if (!response.ok) throw new Error('Não foi possível carregar a configuração do servidor.');
      const config = await response.json() as PublicConfig;
      if (!config.configured || !config.supabaseUrl || !config.supabasePublishableKey) {
        this.configured.set(false);
        this.initError.set('Supabase ainda não configurado. Você pode usar o modo local.');
        return;
      }
      this.client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      this.configured.set(true);
      const { data } = await this.client.auth.getSession();
      this.session.set(data.session);
      this.client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => this.session.set(session));
    } catch (error) {
      this.configured.set(false);
      this.initError.set(error instanceof Error ? error.message : 'Falha ao inicializar autenticação.');
    }
  }

  async signIn(email: string, password: string): Promise<string | null> {
    if (!this.client) return 'Supabase não configurado.';
    this.loading.set(true);
    try {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) return this.translateAuthError(error.message);
      this.session.set(data.session);
      return null;
    } finally { this.loading.set(false); }
  }

  async signUp(email: string, password: string, displayName: string): Promise<{ error: string | null; needsConfirmation: boolean }> {
    if (!this.client) return { error: 'Supabase não configurado.', needsConfirmation: false };
    this.loading.set(true);
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      });
      if (error) return { error: this.translateAuthError(error.message), needsConfirmation: false };
      this.session.set(data.session);
      return { error: null, needsConfirmation: !data.session };
    } finally { this.loading.set(false); }
  }

  async sendReset(email: string): Promise<string | null> {
    if (!this.client) return 'Supabase não configurado.';
    this.loading.set(true);
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      return error ? this.translateAuthError(error.message) : null;
    } finally { this.loading.set(false); }
  }

  async updatePassword(password: string): Promise<string | null> {
    if (!this.client) return 'Supabase não configurado.';
    this.loading.set(true);
    try {
      const { error } = await this.client.auth.updateUser({ password });
      return error ? this.translateAuthError(error.message) : null;
    } finally { this.loading.set(false); }
  }

  async signOut(): Promise<void> {
    if (this.client) await this.client.auth.signOut();
    this.session.set(null);
  }

  accessToken(): string | null { return this.session()?.access_token ?? null; }

  private translateAuthError(message: string): string {
    const value = message.toLowerCase();
    if (value.includes('invalid login credentials')) return 'E-mail ou senha inválidos.';
    if (value.includes('email not confirmed')) return 'Confirme o e-mail antes de entrar.';
    if (value.includes('password should be')) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (value.includes('user already registered')) return 'Este e-mail já está cadastrado.';
    if (value.includes('rate limit')) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    return message;
  }
}
