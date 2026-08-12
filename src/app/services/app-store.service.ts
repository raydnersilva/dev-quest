import { Injectable, signal } from '@angular/core';
import { DayTask, ProgressEntry, SyncState, UserProfile } from '../models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

const PROGRESS_KEY = 'devquest-progress-v2';
const PROFILE_KEY = 'devquest-profile-v2';
const LOCAL_ONLY_KEY = 'devquest-local-only-v2';

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Dev em evolução',
  avatar: '🧑‍💻',
  dailyGoalMinutes: 120,
  theme: 'dark'
};

@Injectable({ providedIn: 'root' })
export class AppStoreService {
  private readonly progressSignal = signal<Record<string, ProgressEntry>>({});
  readonly progress = this.progressSignal.asReadonly();
  readonly profile = signal<UserProfile>({ ...DEFAULT_PROFILE });
  readonly localOnly = signal(false);
  readonly syncState = signal<SyncState>('local');
  readonly syncMessage = signal('Dados salvos neste dispositivo');
  readonly selectedDate = signal(this.todayIso());
  private bootstrappedUserId: string | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
    this.loadLocal();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void this.syncDirty());
      window.addEventListener('offline', () => {
        this.syncState.set('offline');
        this.syncMessage.set('Sem internet — alterações ficam seguras neste aparelho');
      });
    }
  }

  key(date: string, taskKey: string): string { return `${date}:${taskKey}`; }
  entry(date: string, taskKey: string): ProgressEntry | undefined { return this.progressSignal()[this.key(date, taskKey)]; }
  isDone(date: string, taskKey: string): boolean { return this.entry(date, taskKey)?.completed ?? false; }
  pendingCount(): number { return Object.values(this.progressSignal()).filter(entry => entry.dirty).length; }

  useLocalOnly(): void {
    this.localOnly.set(true);
    localStorage.setItem(LOCAL_ONLY_KEY, '1');
    this.syncState.set('local');
    this.syncMessage.set('Modo local ativo');
  }

  disableLocalOnly(): void {
    this.localOnly.set(false);
    localStorage.removeItem(LOCAL_ONLY_KEY);
  }

  async bootstrapRemote(force = false): Promise<void> {
    const userId = this.auth.user()?.id ?? null;
    if (!userId || this.localOnly()) return;
    if (!force && this.bootstrappedUserId === userId) return;
    this.bootstrappedUserId = userId;
    this.syncState.set('syncing');
    this.syncMessage.set('Sincronizando com a nuvem…');
    try {
      const [remoteEntries, remoteProfile] = await Promise.all([
        this.api.get<ProgressEntry[]>('/api/progress'),
        this.api.get<UserProfile>('/api/profile')
      ]);
      this.mergeRemote(remoteEntries);
      this.profile.set({ ...DEFAULT_PROFILE, ...remoteProfile });
      this.applyTheme();
      this.persistLocal();
      await this.syncDirty();
      this.syncState.set('synced');
      this.syncMessage.set('Sincronizado com Supabase');
    } catch {
      this.syncState.set('offline');
      this.syncMessage.set('Nuvem indisponível — usando cópia local');
    }
  }

  async toggleTask(date: string, task: DayTask): Promise<void> {
    const current = this.entry(date, task.key);
    const completed = !(current?.completed ?? false);
    await this.saveEntry({
      date,
      taskKey: task.key,
      category: task.category,
      track: task.track,
      completed,
      minutes: completed ? (current?.minutes || task.minutes) : 0,
      notes: current?.notes ?? null,
      updatedAt: new Date().toISOString(),
      dirty: true
    });
  }

  async saveTaskDetails(date: string, task: DayTask, minutes: number, notes: string): Promise<void> {
    const current = this.entry(date, task.key);
    await this.saveEntry({
      date,
      taskKey: task.key,
      category: task.category,
      track: task.track,
      completed: current?.completed ?? false,
      minutes: Math.max(0, Math.round(minutes || 0)),
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
      dirty: true
    });
  }

  async updateProfile(next: UserProfile): Promise<void> {
    const cleaned: UserProfile = {
      displayName: next.displayName.trim() || DEFAULT_PROFILE.displayName,
      avatar: next.avatar || DEFAULT_PROFILE.avatar,
      dailyGoalMinutes: Math.min(600, Math.max(15, Math.round(next.dailyGoalMinutes || 120))),
      theme: next.theme === 'light' ? 'light' : 'dark',
      updatedAt: new Date().toISOString()
    };
    this.profile.set(cleaned);
    this.applyTheme();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(cleaned));
    if (this.auth.authenticated() && !this.localOnly()) {
      this.syncState.set('syncing');
      try {
        const saved = await this.api.post<UserProfile>('/api/profile', cleaned);
        this.profile.set(saved);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));
        this.syncState.set('synced');
        this.syncMessage.set('Perfil sincronizado');
      } catch {
        this.syncState.set('offline');
        this.syncMessage.set('Perfil salvo localmente; sincronizaremos depois');
      }
    }
  }

  async syncDirty(): Promise<void> {
    if (!this.auth.authenticated() || this.localOnly() || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    const dirty = Object.values(this.progressSignal()).filter(entry => entry.dirty);
    if (!dirty.length) {
      this.syncState.set('synced');
      this.syncMessage.set('Tudo sincronizado');
      return;
    }
    this.syncState.set('syncing');
    this.syncMessage.set(`Sincronizando ${dirty.length} alteração(ões)…`);
    try {
      const saved = await this.api.post<ProgressEntry[]>('/api/progress', { entries: dirty.map(({ dirty: _dirty, ...entry }) => entry) });
      this.progressSignal.update(all => {
        const next = { ...all };
        for (const entry of saved) next[this.key(entry.date, entry.taskKey)] = { ...entry, dirty: false };
        return next;
      });
      this.persistLocal();
      this.syncState.set('synced');
      this.syncMessage.set('Tudo sincronizado');
    } catch {
      this.syncState.set('offline');
      this.syncMessage.set('Sem conexão com a nuvem — continuamos salvando localmente');
    }
  }

  exportBackup(): string {
    return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), profile: this.profile(), progress: Object.values(this.progressSignal()) }, null, 2);
  }

  importBackup(raw: string): { ok: boolean; message: string } {
    try {
      const parsed = JSON.parse(raw) as { profile?: UserProfile; progress?: ProgressEntry[] };
      if (!Array.isArray(parsed.progress)) return { ok: false, message: 'Arquivo não contém uma lista de progresso válida.' };
      const next: Record<string, ProgressEntry> = {};
      for (const entry of parsed.progress) {
        if (!entry.date || !entry.taskKey) continue;
        next[this.key(entry.date, entry.taskKey)] = { ...entry, dirty: true, updatedAt: entry.updatedAt || new Date().toISOString() };
      }
      this.progressSignal.set(next);
      if (parsed.profile) this.profile.set({ ...DEFAULT_PROFILE, ...parsed.profile });
      this.applyTheme();
      this.persistLocal();
      void this.syncDirty();
      return { ok: true, message: 'Backup importado com sucesso.' };
    } catch {
      return { ok: false, message: 'Não consegui ler este arquivo JSON.' };
    }
  }

  clearLocalProgress(): void {
    this.progressSignal.set({});
    localStorage.removeItem(PROGRESS_KEY);
    this.syncState.set('local');
    this.syncMessage.set('Progresso local apagado');
  }

  private async saveEntry(entry: ProgressEntry): Promise<void> {
    const k = this.key(entry.date, entry.taskKey);
    this.progressSignal.update(all => ({ ...all, [k]: entry }));
    this.persistLocal();
    if (this.auth.authenticated() && !this.localOnly()) await this.syncDirty();
  }

  private mergeRemote(remoteEntries: ProgressEntry[]): void {
    const local = this.progressSignal();
    const merged = { ...local };
    for (const remote of remoteEntries) {
      const k = this.key(remote.date, remote.taskKey);
      const current = local[k];
      if (!current || (!current.dirty && remote.updatedAt >= current.updatedAt)) merged[k] = { ...remote, dirty: false };
    }
    this.progressSignal.set(merged);
  }

  private loadLocal(): void {
    try {
      const rawProgress = localStorage.getItem(PROGRESS_KEY);
      if (rawProgress) this.progressSignal.set(JSON.parse(rawProgress) as Record<string, ProgressEntry>);
      const rawProfile = localStorage.getItem(PROFILE_KEY);
      if (rawProfile) this.profile.set({ ...DEFAULT_PROFILE, ...(JSON.parse(rawProfile) as UserProfile) });
      this.localOnly.set(localStorage.getItem(LOCAL_ONLY_KEY) === '1');
      this.applyTheme();
    } catch {
      this.progressSignal.set({});
      this.profile.set({ ...DEFAULT_PROFILE });
    }
  }

  private persistLocal(): void {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progressSignal()));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile()));
  }

  private applyTheme(): void {
    if (typeof document !== 'undefined') document.documentElement.dataset['theme'] = this.profile().theme;
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
