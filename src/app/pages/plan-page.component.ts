import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CERTIFICATIONS } from '../data/career-data';
import { PHASES } from '../data/study-plan';
import { Track } from '../models';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-plan-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-stack">
      <section class="hero-card glass compact-hero">
        <div><p class="eyebrow">PLANO DE 24 MESES</p><h1>Do fundamento ao sistema distribuído.</h1><p>O objetivo é reconstruir a base e avançar sem pular etapas: lógica → Java → JS/TS → Angular → Spring → arquitetura → cloud.</p></div>
        <div class="big-stat"><strong>24</strong><span>fases</span></div>
      </section>

      <section class="phase-grid">
        @for (phase of phases; track phase.id) {
          <article class="phase-card glass" [class.done]="game.phaseProgress(phase.id)===100">
            <div class="phase-card-head"><span class="phase-icon">{{ iconForTrack(phase.track) }}</span><div><small>FASE {{ pad(phase.id) }}</small><h3>{{ phase.label }}</h3></div><strong>{{ game.phaseProgress(phase.id) }}%</strong></div>
            <div class="progress-line"><i [style.width.%]="game.phaseProgress(phase.id)"></i></div>
            <div class="phase-dates">{{ brDate(phase.start) }} → {{ brDate(phase.end) }}</div>
            <div class="topic-cloud">@for (topic of phase.topics; track topic) { <span>{{ topic }}</span> }</div>
          </article>
        }
      </section>

      <section class="glass panel cert-panel">
        <div class="section-head"><div><p class="eyebrow">CERTIFICAÇÕES</p><h2>Quando elas entram</h2></div><span>Conhecimento antes da prova</span></div>
        <div class="cert-timeline">
          @for (cert of certifications; track cert.order) {
            <article class="cert-item" [class.priority]="cert.status==='priority'"><div class="cert-order">{{ cert.order }}</div><div><small>{{ cert.moment }}</small><strong>{{ cert.title }}</strong><p>{{ cert.description }}</p></div></article>
          }
        </div>
      </section>
    </div>
  `
})
export class PlanPageComponent {
  readonly phases = PHASES;
  readonly certifications = CERTIFICATIONS;
  constructor(public readonly game: GameService) {}
  pad(value: number): string { return String(value).padStart(2, '0'); }
  brDate(value: string): string { const [y,m,d]=value.split('-'); return `${d}/${m}/${y}`; }
  iconForTrack(track: Track): string { return ({ backend:'☕', frontend:'🅰️', cloud:'☁️', architecture:'🧠', english:'🇺🇸', ads:'🎓' } as Record<Track,string>)[track]; }
}
