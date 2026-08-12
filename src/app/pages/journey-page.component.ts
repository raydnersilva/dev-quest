import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PHASES } from '../data/study-plan';
import { Track } from '../models';
import { AppStoreService } from '../services/app-store.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-journey-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-stack journey-page">
      <section class="hero-card glass journey-hero">
        <div>
          <p class="eyebrow">ROAD TO EXPERT</p>
          <h1>Uma estrada que anda com você.</h1>
          <p>O avatar não avança porque o calendário virou. Ele avança quando você conclui as missões.</p>
        </div>
        <div class="journey-destination"><span>{{ store.profile().avatar }}</span><i>→</i><span>🏆</span><strong>{{ game.overallPercent() }}%</strong></div>
      </section>

      <section class="glass panel road-summary">
        <div class="section-head"><div><p class="eyebrow">VISÃO GERAL</p><h2>Distância até Especialista</h2></div><strong>{{ game.xp() }} XP</strong></div>
        <div class="road-progress"><i [style.width.%]="game.overallPercent()"></i><span class="road-traveler" [style.left.%]="game.overallPercent()">{{ store.profile().avatar }}</span></div>
        <div class="road-labels"><span>🌱 Início</span><span>☕ Backend</span><span>🅰️ Full Stack</span><span>☁️ Cloud</span><span>🧠 Sênior</span><span>🏆 Especialista</span></div>
      </section>

      <section class="quest-map glass">
        <div class="map-header"><p class="eyebrow">24 CHECKPOINTS</p><h2>Mapa de habilidades</h2><p>Cada ilha representa um mês/fase. As ilhas vão ganhando cor conforme suas missões são concluídas.</p></div>
        <div class="quest-path">
          @for (phase of phases; track phase.id; let idx = $index) {
            <article class="quest-step" [class.left]="idx % 2 === 0" [class.right]="idx % 2 !== 0" [class.complete]="game.phaseProgress(phase.id)===100" [class.active]="idx===game.currentQuestIndex()">
              <div class="path-segment"></div>
              <div class="quest-node">
                @if (idx===game.currentQuestIndex()) { <span class="node-avatar">{{ store.profile().avatar }}</span> }
                <span class="node-icon">{{ iconForTrack(phase.track) }}</span>
                <small>FASE {{ pad(phase.id) }}</small>
                <strong>{{ phase.label }}</strong>
                <div class="node-progress"><i [style.width.%]="game.phaseProgress(phase.id)"></i></div>
                <span>{{ game.phaseProgress(phase.id) }}%</span>
              </div>
            </article>
          }
          <div class="finish-castle"><span>🏆</span><h3>Especialista</h3><p>Java Backend + Angular + Cloud + Inglês técnico</p></div>
        </div>
      </section>

      <section class="glass panel philosophy-card">
        <div class="big-quote">“</div>
        <div><p class="eyebrow">REGRA DO JOGO</p><h2>Não é terminar rápido. É chegar sabendo fazer.</h2><p>Você pode repetir uma fase, diminuir o ritmo ou registrar mais minutos. O mapa mede consistência e execução — não serve para transformar estudo em corrida.</p></div>
      </section>
    </div>
  `
})
export class JourneyPageComponent {
  readonly phases = PHASES;
  constructor(public readonly store: AppStoreService, public readonly game: GameService) {}
  pad(value: number): string { return String(value).padStart(2, '0'); }
  iconForTrack(track: Track): string { return ({ backend: '☕', frontend: '🅰️', cloud: '☁️', architecture: '🧠', english: '🇺🇸', ads: '🎓' } as Record<Track,string>)[track]; }
}
