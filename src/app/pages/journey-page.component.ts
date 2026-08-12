import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideTrophy, LucideCoffee, LucideCode2, LucideCloud, LucideBrain, LucideLanguages, LucideGraduationCap, LucideFlag } from '@lucide/angular';
import { PHASES } from '../data/study-plan';
import { Track } from '../models';
import { AppStoreService } from '../services/app-store.service';
import { GameService } from '../services/game.service';
import { ContributionGraphComponent } from '../components/contribution-graph.component';

@Component({
  selector: 'app-journey-page',
  standalone: true,
  imports: [CommonModule, LucideTrophy, LucideCoffee, LucideCode2, LucideCloud, LucideBrain, LucideLanguages, LucideGraduationCap, LucideFlag, ContributionGraphComponent],
  template: `
    <div class="page-stack journey-page">
      <section class="hero-card glass journey-hero">
        <div>
          <p class="eyebrow">ROAD TO EXPERT</p>
          <h1>Uma estrada que anda com você.</h1>
          <p>O avatar não avança porque o calendário virou. Ele avança quando você conclui as missões.</p>
        </div>
        <div class="journey-destination"><span>{{ store.profile().avatar }}</span><i>→</i><span><svg lucideTrophy [size]="20" class="trophy-icon"></svg></span><strong>{{ game.overallPercent() }}%</strong></div>
      </section>

      <app-contribution-graph></app-contribution-graph>

      <section class="glass panel road-summary">
        <div class="section-head"><div><p class="eyebrow">VISÃO GERAL</p><h2>Distância até Especialista</h2></div><strong>{{ game.xp() }} XP</strong></div>
        <div class="road-progress"><i [style.width.%]="game.overallPercent()"></i><span class="road-traveler" [style.left.%]="game.overallPercent()">{{ store.profile().avatar }}</span></div>
        <div class="road-labels"><span><svg lucideFlag [size]="14"></svg> Início</span><span><svg lucideCoffee [size]="14"></svg> Backend</span><span><svg lucideCode2 [size]="14"></svg> Full Stack</span><span><svg lucideCloud [size]="14"></svg> Cloud</span><span><svg lucideBrain [size]="14"></svg> Sênior</span><span><svg lucideTrophy [size]="14"></svg> Especialista</span></div>
      </section>

      <section class="quest-map glass">
        <div class="map-header"><p class="eyebrow">24 CHECKPOINTS</p><h2>Mapa de habilidades</h2><p>Cada ilha representa um mês/fase. As ilhas vão ganhando cor conforme suas missões são concluídas.</p></div>
        <div class="quest-path">
          @for (phase of phases; track phase.id; let idx = $index) {
            <article class="quest-step" [class.left]="idx % 2 === 0" [class.right]="idx % 2 !== 0" [class.complete]="game.phaseProgress(phase.id)===100" [class.active]="idx===game.currentQuestIndex()">
              <div class="path-segment"></div>
              <div class="quest-node">
                @if (idx===game.currentQuestIndex()) { <span class="node-avatar">{{ store.profile().avatar }}</span> }
                <span class="node-icon">
                  @switch(phase.track) {
                    @case ('backend') { <svg lucideCoffee [size]="18"></svg> }
                    @case ('frontend') { <svg lucideCode2 [size]="18"></svg> }
                    @case ('cloud') { <svg lucideCloud [size]="18"></svg> }
                    @case ('architecture') { <svg lucideBrain [size]="18"></svg> }
                    @case ('english') { <svg lucideLanguages [size]="18"></svg> }
                    @case ('ads') { <svg lucideGraduationCap [size]="18"></svg> }
                  }
                </span>
                <small>FASE {{ pad(phase.id) }}</small>
                <strong>{{ phase.label }}</strong>
                <div class="node-progress"><i [style.width.%]="game.phaseProgress(phase.id)"></i></div>
                <span>{{ game.phaseProgress(phase.id) }}%</span>
              </div>
            </article>
          }
          <div class="finish-castle"><span><svg lucideTrophy [size]="32"></svg></span><h3>Especialista</h3><p>Java Backend + Angular + Cloud + Inglês técnico</p></div>
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
  // iconForTrack is handled via svgs in the template
}
