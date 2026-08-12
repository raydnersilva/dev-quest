import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { LucideTrophy, LucideCrown, LucideMedal, LucideAward, LucideTrendingUp } from '@lucide/angular';
import { ApiService } from '../services/api.service';
import { AppStoreService } from '../services/app-store.service';
import { AuthService } from '../services/auth.service';

interface LeaderboardEntry {
  displayName: string;
  avatar: string;
  totalXp: number;
  level: number;
}

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [CommonModule, LucideTrophy, LucideCrown, LucideMedal, LucideAward, LucideTrendingUp],
  template: `
    <div class="page-stack">
      <section class="hero-card glass leaderboard-hero">
        <div>
          <p class="eyebrow">GLOBAL RANKING</p>
          <h1>Hall da Fama</h1>
          <p>Os desenvolvedores mais dedicados da comunidade DevQuest. Suba de nível e ganhe destaque.</p>
        </div>
        <div class="hero-icon"><svg lucideTrophy [size]="64"></svg></div>
      </section>

      @if (!auth.authenticated()) {
        <div class="notice sticky-notice">Você precisa estar logado para ver o ranking e participar. Vá em "Perfil" para entrar.</div>
      } @else if (loading()) {
        <div class="loading-state glass panel">Carregando o ranking global...</div>
      } @else if (error()) {
        <div class="notice error">{{ error() }}</div>
      } @else {
        <section class="leaderboard-list">
          @for (user of users(); track $index) {
            <article class="glass panel leaderboard-item" [class.top-1]="$index === 0" [class.top-2]="$index === 1" [class.top-3]="$index === 2">
              <div class="rank-number">
                @if ($index === 0) { <svg lucideCrown [size]="24"></svg> }
                @else if ($index === 1) { <svg lucideMedal [size]="24" class="silver"></svg> }
                @else if ($index === 2) { <svg lucideAward [size]="24" class="bronze"></svg> }
                @else { <span>{{ $index + 1 }}</span> }
              </div>
              <div class="user-avatar">{{ user.avatar || '🧑‍💻' }}</div>
              <div class="user-info">
                <strong>{{ user.displayName || 'Dev Anônimo' }}</strong>
                <small>Nível {{ user.level || 1 }}</small>
              </div>
              <div class="user-xp">
                <svg lucideTrendingUp [size]="16"></svg>
                <span>{{ user.totalXp }} XP</span>
              </div>
            </article>
          }
          
          @if (users().length === 0) {
            <div class="rest-state glass panel">
              <div>🏆</div>
              <h3>Ranking vazio</h3>
              <p>O ranking ainda não tem participantes. Seja o primeiro a sincronizar seu progresso!</p>
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .leaderboard-hero { display: flex; justify-content: space-between; align-items: center; }
    .hero-icon { color: var(--primary); opacity: 0.8; }
    
    .leaderboard-list { display: flex; flex-direction: column; gap: 12px; }
    
    .leaderboard-item { 
      display: flex; align-items: center; gap: 16px; padding: 16px; 
      transition: 0.2s ease;
    }
    .leaderboard-item:hover { transform: translateX(4px); background: rgba(255,255,255,0.04); }
    
    .rank-number { width: 40px; display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 18px; color: var(--muted); }
    
    .top-1 { background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent); border-left: 3px solid gold; }
    .top-1 .rank-number { color: gold; }
    
    .top-2 { background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), transparent); border-left: 3px solid silver; }
    .top-2 .rank-number .silver { color: silver; }
    
    .top-3 { background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), transparent); border-left: 3px solid #cd7f32; }
    .top-3 .rank-number .bronze { color: #cd7f32; }
    
    .user-avatar { font-size: 28px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 50%; }
    
    .user-info { flex: 1; display: flex; flex-direction: column; }
    .user-info strong { color: var(--text); font-size: 16px; }
    .user-info small { color: var(--muted); font-size: 12px; }
    
    .user-xp { display: flex; align-items: center; gap: 6px; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; }
    
    .loading-state { padding: 40px; text-align: center; color: var(--muted); }
  `]
})
export class LeaderboardPageComponent {
  readonly users = signal<LeaderboardEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor(
    private readonly api: ApiService,
    public readonly store: AppStoreService,
    public readonly auth: AuthService
  ) {
    if (this.auth.authenticated()) {
      this.fetchLeaderboard();
    }
  }

  async fetchLeaderboard(): Promise<void> {
    try {
      this.loading.set(true);
      const data = await this.api.get<LeaderboardEntry[]>('/api/leaderboard');
      this.users.set(data || []);
    } catch (e: any) {
      this.error.set('Erro ao carregar o ranking. Tente novamente mais tarde.');
    } finally {
      this.loading.set(false);
    }
  }
}
