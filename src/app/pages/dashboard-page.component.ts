import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideFlame, LucideTimer, LucideTrophy, LucideTarget, LucideCoffee, LucideCode2, LucideLanguages, LucideCloud, LucideFlag } from '@lucide/angular';
import { buildDayPlan, phaseFor } from '../data/study-plan';
import { AppStoreService } from '../services/app-store.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideFlame, LucideTimer, LucideTrophy, LucideTarget, LucideCoffee, LucideCode2, LucideLanguages, LucideCloud, LucideFlag],
  template: `
    <div class="page-stack">
      <section class="hero-card glass dashboard-hero">
        <div>
          <p class="eyebrow">CENTRAL DE EVOLUÇÃO</p>
          <h1>Olá, {{ store.profile().displayName }} <span>{{ store.profile().avatar }}</span></h1>
          <p>Hoje sua missão está em <strong>{{ todayPlan().phase.label }}</strong>. Cada check move o personagem na estrada até Especialista.</p>
          <div class="hero-actions">
            <a class="btn primary" routerLink="/hoje">Começar missão de hoje</a>
            <a class="btn ghost" routerLink="/jornada">Ver minha jornada</a>
          </div>
        </div>
        <div class="level-orb">
          <div class="level-avatar">{{ store.profile().avatar }}</div>
          <strong>Nível {{ game.level() }}</strong>
          <span>{{ game.titleForLevel() }}</span>
          <div class="mini-progress"><i [style.width.%]="game.levelProgress()"></i></div>
          <small>{{ game.xp() }} XP</small>
        </div>
      </section>

      <section class="metric-grid">
        <article class="metric-card glass"><span class="metric-icon"><svg lucideFlame [size]="24"></svg></span><div><small>STREAK</small><strong>{{ game.streak() }} dias</strong><p>Consistência acima de intensidade.</p></div></article>
        <article class="metric-card glass"><span class="metric-icon"><svg lucideTimer [size]="24"></svg></span><div><small>TEMPO ESTUDADO</small><strong>{{ game.totalHours() }} h</strong><p>{{ game.completedTasks() }} missões concluídas.</p></div></article>
        <article class="metric-card glass"><span class="metric-icon"><svg lucideTrophy [size]="24"></svg></span><div><small>CONQUISTAS</small><strong>{{ game.unlockedAchievements() }}/{{ game.achievements().length }}</strong><p>Medalhas desbloqueadas.</p></div></article>
        <article class="metric-card glass"><span class="metric-icon"><svg lucideTarget [size]="24"></svg></span><div><small>JORNADA</small><strong>{{ game.overallPercent() }}%</strong><p>Rumo ao nível Especialista.</p></div></article>
      </section>

      <section class="dashboard-grid">
        <article class="glass panel weekly-panel">
          <div class="section-head"><div><p class="eyebrow">ÚLTIMOS 7 DIAS</p><h2>Ritmo de estudo</h2></div><span>{{ weekMinutes() }} min</span></div>
          <div class="week-chart">
            @for (day of game.weekStats(); track day.date) {
              <div class="week-bar-wrap" [title]="day.minutes + ' de ' + day.planned + ' min'">
                <div class="week-bar"><i [style.height.%]="day.planned ? Math.max(5, day.percent) : 4"></i></div>
                <strong>{{ day.minutes }}</strong><small>{{ day.label }}</small>
              </div>
            }
          </div>
          <p class="chart-note">A barra compara minutos feitos com minutos planejados. Dias acima da meta param em 100% visualmente, mas os minutos reais continuam registrados.</p>
        </article>

        <article class="glass panel focus-panel">
          <p class="eyebrow">META DO DIA</p>
          <div class="goal-ring" [style.--p]="todayGoalPercent() + '%'">
            <div><strong>{{ todayMinutes() }}</strong><span>/ {{ store.profile().dailyGoalMinutes }} min</span></div>
          </div>
          <h3>{{ todayGoalPercent() >= 100 ? 'Meta batida! 🎉' : 'Continue acumulando foco.' }}</h3>
          <p>Você pode alterar a meta diária em Perfil & Configurações.</p>
        </article>
      </section>

      <section class="track-grid">
        <article class="track-card backend glass"><div class="track-top"><span><svg lucideCoffee [size]="18"></svg></span><div><small>JAVA BACKEND</small><strong>{{ game.backendPercent() }}%</strong></div></div><div class="progress-line"><i [style.width.%]="game.backendPercent()"></i></div><p>Java, Spring, banco, Kafka, arquitetura e cloud.</p></article>
        <article class="track-card frontend glass"><div class="track-top"><span><svg lucideCode2 [size]="18"></svg></span><div><small>FRONTEND</small><strong>{{ game.frontendPercent() }}%</strong></div></div><div class="progress-line"><i [style.width.%]="game.frontendPercent()"></i></div><p>JavaScript, TypeScript e Angular moderno.</p></article>
        <article class="track-card english glass"><div class="track-top"><span><svg lucideLanguages [size]="18"></svg></span><div><small>INGLÊS</small><strong>{{ game.englishPercent() }}%</strong></div></div><div class="progress-line"><i [style.width.%]="game.englishPercent()"></i></div><p>Do absoluto zero até entrevista e conversação técnica.</p></article>
        <article class="track-card cloud glass"><div class="track-top"><span><svg lucideCloud [size]="18"></svg></span><div><small>CLOUD / DEVOPS</small><strong>{{ game.cloudPercent() }}%</strong></div></div><div class="progress-line"><i [style.width.%]="game.cloudPercent()"></i></div><p>AWS, Kubernetes, Terraform, CI/CD e Azure.</p></article>
      </section>

      <section class="dashboard-grid">
        <article class="glass panel next-panel">
          <div class="section-head"><div><p class="eyebrow">MISSÃO DE HOJE</p><h2>{{ humanDate(today()) }}</h2></div><span class="mode-pill">{{ todayPlan().mode }}</span></div>
          <div class="compact-task-list">
            @for (task of todayPlan().tasks; track task.key) {
              <div class="compact-task" [class.done]="store.isDone(today(), task.key)"><span>{{ store.isDone(today(), task.key) ? '✓' : '○' }}</span><div><strong>{{ task.label }}</strong><small>{{ task.minutes }} min</small></div></div>
            }
          </div>
          <a routerLink="/hoje" class="text-link">Abrir checklist completo →</a>
        </article>

        <article class="glass panel destination-panel">
          <p class="eyebrow">DESTINO</p>
          <div class="destination-art"><svg lucideFlag [size]="24"></svg> <span><svg lucideTrophy [size]="32"></svg></span></div>
          <h2>Especialista Full Stack</h2>
          <p>Java Backend especialista, Angular forte, cloud e inglês para entrevista técnica.</p>
          <div class="progress-line large"><i [style.width.%]="game.overallPercent()"></i></div>
          <small>{{ game.overallPercent() }}% da estrada percorrida</small>
        </article>
      </section>
    </div>
  `
})
export class DashboardPageComponent {
  Math = Math;
  readonly today = computed(() => this.iso(new Date()));
  readonly todayPlan = computed(() => buildDayPlan(this.today()));
  readonly todayMinutes = computed(() => this.game.minutesForDate(this.today()));
  readonly todayGoalPercent = computed(() => Math.min(100, Math.round((this.todayMinutes() / this.store.profile().dailyGoalMinutes) * 100)));
  readonly weekMinutes = computed(() => this.game.weekStats().reduce((sum, day) => sum + day.minutes, 0));

  constructor(public readonly store: AppStoreService, public readonly game: GameService) {}

  humanDate(value: string): string {
    const [y, m, d] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date(y, m - 1, d, 12));
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
