import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppStoreService } from '../services/app-store.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-achievements-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-stack">
      <section class="hero-card glass compact-hero">
        <div><p class="eyebrow">SALA DE TROFÉUS</p><h1>Conquistas que representam trabalho real.</h1><p>As medalhas são desbloqueadas pelo estudo concluído, horas registradas, sequência e avanço nas fases.</p></div>
        <div class="trophy-total"><span>🏆</span><strong>{{ game.unlockedAchievements() }}/{{ game.achievements().length }}</strong></div>
      </section>

      <section class="achievement-grid big-grid">
        @for (achievement of game.achievements(); track achievement.name) {
          <article class="achievement-card glass" [class.unlocked]="achievement.unlocked">
            <div class="achievement-medal">{{ achievement.icon }}</div>
            <div><small>{{ achievement.unlocked ? 'DESBLOQUEADA' : 'EM PROGRESSO' }}</small><h3>{{ achievement.name }}</h3><p>{{ achievement.description }}</p><div class="progress-line"><i [style.width.%]="achievement.progress"></i></div><span>{{ achievement.progress }}%</span></div>
          </article>
        }
      </section>

      <section class="glass panel player-card">
        <div class="player-avatar">{{ store.profile().avatar }}</div>
        <div><p class="eyebrow">PLAYER CARD</p><h2>{{ store.profile().displayName }}</h2><p>Nível {{ game.level() }} · {{ game.titleForLevel() }}</p></div>
        <div class="player-stats"><span><small>XP</small><strong>{{ game.xp() }}</strong></span><span><small>Horas</small><strong>{{ game.totalHours() }}</strong></span><span><small>Streak</small><strong>{{ game.streak() }}</strong></span></div>
      </section>
    </div>
  `
})
export class AchievementsPageComponent {
  constructor(public readonly game: GameService, public readonly store: AppStoreService) {}
}
