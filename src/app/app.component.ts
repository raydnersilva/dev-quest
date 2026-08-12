import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthPageComponent } from './components/auth-page.component';
import { AuthService } from './services/auth.service';
import { AppStoreService } from './services/app-store.service';
import { GameService } from './services/game.service';
import { PwaService } from './services/pwa.service';
import { GithubIntegrationService } from './services/github-integration.service';
import {
  LucideLayoutDashboard, LucideCheckCircle, LucideBookOpen, LucideCode, LucideMenu,
  LucideMap, LucideCalendarDays, LucideTarget, LucideLanguages, LucideTrophy, LucideSettings,
  LucideFlame, LucideZap, LucideX, LucideWifiOff, LucideDownload, LucideCrown
} from '@lucide/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AuthPageComponent,
    LucideLayoutDashboard, LucideCheckCircle, LucideBookOpen, LucideCode, LucideMenu,
    LucideMap, LucideCalendarDays, LucideTarget, LucideLanguages, LucideTrophy, LucideSettings,
    LucideFlame, LucideZap, LucideX, LucideWifiOff, LucideDownload, LucideCrown
  ],
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
            <span class="streak-pill"><svg lucideFlame [size]="16"></svg> {{ game.streak() }}</span>
            <span class="xp-pill"><svg lucideZap [size]="16"></svg> {{ game.xp() }} XP</span>
            <a class="profile-pill" routerLink="/configuracoes" title="Perfil e configurações">{{ store.profile().avatar }}<span>{{ store.profile().displayName }}</span></a>
          </div>
        </header>

        <nav class="main-nav glass" aria-label="Navegação principal">
          <a routerLink="/dashboard" routerLinkActive="active"><svg lucideLayoutDashboard [size]="20"></svg><small>Dashboard</small></a>
          <a routerLink="/hoje" routerLinkActive="active"><svg lucideCheckCircle [size]="20"></svg><small>Hoje</small></a>
          <a routerLink="/recursos" routerLinkActive="active"><svg lucideBookOpen [size]="20"></svg><small>Recursos</small></a>
          <a routerLink="/desafios" routerLinkActive="active"><svg lucideCode [size]="20"></svg><small>Desafios</small></a>
          <a routerLink="/jornada" routerLinkActive="active" class="desktop-nav-item"><svg lucideMap [size]="20"></svg><small>Jornada</small></a>
          <a routerLink="/calendario" routerLinkActive="active" class="desktop-nav-item"><svg lucideCalendarDays [size]="20"></svg><small>Calendário</small></a>
          <a routerLink="/plano" routerLinkActive="active" class="desktop-nav-item"><svg lucideTarget [size]="20"></svg><small>Plano</small></a>
          <a routerLink="/ingles" routerLinkActive="active" class="desktop-nav-item"><svg lucideLanguages [size]="20"></svg><small>Inglês</small></a>
          <a routerLink="/conquistas" routerLinkActive="active" class="desktop-nav-item"><svg lucideTrophy [size]="20"></svg><small>Troféus</small></a>
          <a routerLink="/ranking" routerLinkActive="active" class="desktop-nav-item"><svg lucideCrown [size]="20"></svg><small>Ranking</small></a>
          <a routerLink="/configuracoes" routerLinkActive="active" class="desktop-nav-item"><svg lucideSettings [size]="20"></svg><small>Perfil</small></a>
          <button class="nav-more-btn mobile-only" (click)="moreMenuOpen.set(!moreMenuOpen())"><svg lucideMenu [size]="20"></svg><small>Mais</small></button>
        </nav>

        @if (moreMenuOpen()) {
          <div class="more-backdrop" (click)="moreMenuOpen.set(false)">
            <nav class="more-menu glass" (click)="$event.stopPropagation()">
              <div class="more-header"><h3>Menu</h3><button class="round" (click)="moreMenuOpen.set(false)"><svg lucideX [size]="20"></svg></button></div>
              <a routerLink="/jornada" routerLinkActive="active" (click)="moreMenuOpen.set(false)"><svg lucideMap [size]="20"></svg><span>Jornada</span></a>
              <a routerLink="/calendario" routerLinkActive="active" (click)="moreMenuOpen.set(false)"><svg lucideCalendarDays [size]="20"></svg><span>Calendário</span></a>
              <a routerLink="/plano" routerLinkActive="active" (click)="moreMenuOpen.set(false)"><svg lucideTarget [size]="20"></svg><span>Plano</span></a>
              <a routerLink="/ingles" routerLinkActive="active" (click)="moreMenuOpen.set(false)"><svg lucideLanguages [size]="20"></svg><span>Inglês</span></a>
              <a routerLink="/conquistas" routerLinkActive="active" (click)="moreMenuOpen.set(false)"><svg lucideTrophy [size]="20"></svg><span>Troféus</span></a>
              <a routerLink="/ranking" routerLinkActive="active" (click)="moreMenuOpen.set(false)"><svg lucideCrown [size]="20"></svg><span>Ranking Global</span></a>
              <a routerLink="/configuracoes" routerLinkActive="active" (click)="moreMenuOpen.set(false)"><svg lucideSettings [size]="20"></svg><span>Perfil & Config</span></a>
            </nav>
          </div>
        }

        <main class="content"><router-outlet></router-outlet></main>

        @if (store.syncState()==='offline' && auth.authenticated()) {
          <div class="offline-toast"><svg lucideWifiOff [size]="16"></svg> Offline: seus checks continuam sendo salvos neste aparelho.</div>
        }
        @if (pwa.canInstall() && !pwa.installed()) {
          <button class="install-fab" (click)="pwa.install()"><svg lucideDownload [size]="18"></svg> Instalar app</button>
        }
      </div>
    }
  `
})
export class AppComponent {
  readonly ready = signal(false);
  readonly moreMenuOpen = signal(false);
  private lastRemoteUser: string | null = null;

  constructor(
    public readonly store: AppStoreService,
    public readonly auth: AuthService,
    public readonly game: GameService,
    public readonly pwa: PwaService,
    private readonly githubInt: GithubIntegrationService
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
