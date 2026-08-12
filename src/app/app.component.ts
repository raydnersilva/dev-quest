import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthPageComponent } from './components/auth-page.component';
import { AuthService } from './services/auth.service';
import { AppStoreService } from './services/app-store.service';
import { GameService } from './services/game.service';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AuthPageComponent],
  template: `
    @if (!ready()) {
      <main class="splash-screen"><div class="splash-logo">DQ</div><div class="splash-avatar">🧑‍💻</div><strong>Carregando sua jornada…</strong></main>
    } @else if (!auth.authenticated() && !store.localOnly()) {
      <app-auth-page (offline)="enterOffline()"></app-auth-page>
    } @else {
      <div class="app-shell">
        <header class="topbar glass">
          <a class="brand" routerLink="/dashboard"><span class="brand-mark">DQ</span><div><strong>DevQuest</strong><small>Rumo ao Especialista</small></div></a>
          <div class="top-progress desktop-only"><span>{{ game.overallPercent() }}%</span><div><i [style.width.%]="game.overallPercent()"></i></div><strong>🏆 Especialista</strong></div>
          <div class="top-actions">
            <span class="streak-pill">🔥 {{ game.streak() }}</span>
            <span class="xp-pill">⚡ {{ game.xp() }} XP</span>
            <a class="profile-pill" routerLink="/configuracoes" title="Perfil e configurações">{{ store.profile().avatar }}<span>{{ store.profile().displayName }}</span></a>
          </div>
        </header>

        <nav class="main-nav glass" aria-label="Navegação principal">
          <a routerLink="/dashboard" routerLinkActive="active"><span>📊</span><small>Dashboard</small></a>
          <a routerLink="/hoje" routerLinkActive="active"><span>✅</span><small>Hoje</small></a>
          <a routerLink="/jornada" routerLinkActive="active"><span>🗺️</span><small>Jornada</small></a>
          <a routerLink="/calendario" routerLinkActive="active"><span>📅</span><small>Calendário</small></a>
          <a routerLink="/plano" routerLinkActive="active"><span>🎯</span><small>Plano</small></a>
          <a routerLink="/ingles" routerLinkActive="active"><span>🇺🇸</span><small>Inglês</small></a>
          <a routerLink="/conquistas" routerLinkActive="active"><span>🏆</span><small>Troféus</small></a>
          <a routerLink="/configuracoes" routerLinkActive="active"><span>⚙️</span><small>Perfil</small></a>
        </nav>

        <main class="content"><router-outlet></router-outlet></main>

        @if (store.syncState()==='offline' && auth.authenticated()) {
          <div class="offline-toast">📴 Offline: seus checks continuam sendo salvos neste aparelho.</div>
        }
        @if (pwa.canInstall() && !pwa.installed()) {
          <button class="install-fab" (click)="pwa.install()">📲 Instalar app</button>
        }
      </div>
    }
  `
})
export class AppComponent {
  readonly ready = signal(false);
  private lastRemoteUser: string | null = null;

  constructor(
    public readonly auth: AuthService,
    public readonly store: AppStoreService,
    public readonly game: GameService,
    public readonly pwa: PwaService
  ) {
    effect(() => {
      const userId = this.auth.user()?.id ?? null;
      if (userId && userId !== this.lastRemoteUser && !this.store.localOnly()) {
        this.lastRemoteUser = userId;
        void this.store.bootstrapRemote();
      }
      if (!userId) this.lastRemoteUser = null;
    });
    void this.initialize();
  }

  enterOffline(): void { this.store.useLocalOnly(); }

  private async initialize(): Promise<void> {
    await this.auth.init();
    if (this.auth.authenticated() && !this.store.localOnly()) await this.store.bootstrapRemote();
    this.ready.set(true);
  }
}
