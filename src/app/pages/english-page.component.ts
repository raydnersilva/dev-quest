import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { LucideLanguages, LucideExternalLink, LucideMic } from '@lucide/angular';
import { ENGLISH_RESOURCES, ENGLISH_STAGES, TECHNICAL_PHRASES } from '../data/career-data';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-english-page',
  standalone: true,
  imports: [CommonModule, LucideLanguages, LucideExternalLink, LucideMic],
  template: `
    <div class="page-stack">
      <section class="hero-card glass english-hero-page">
        <div><p class="eyebrow">ENGLISH QUEST</p><h1>Do “Hello” até a entrevista técnica.</h1><p>30 minutos por dia, todos os dias. No início você aprende em português; aos poucos, o próprio inglês vira sua ferramenta de estudo.</p></div>
        <div class="english-orb"><span><svg lucideLanguages [size]="40"></svg></span><strong>{{ game.englishPercent() }}%</strong><small>da trilha</small></div>
      </section>

      <section class="glass panel routine-panel">
        <div class="section-head"><div><p class="eyebrow">ROTINA DIÁRIA</p><h2>30 minutos sem complicação</h2></div></div>
        <div class="routine-steps">
          <article><span>01</span><strong>10 min · Curso</strong><p>Kultivi no começo; British Council/VOA nas fases seguintes.</p></article>
          <article><span>02</span><strong>10 min · Vocabulário</strong><p>Anote 5 palavras e crie 5 frases simples usando cada conteúdo.</p></article>
          <article><span>03</span><strong>10 min · Escuta + fala</strong><p>Ouça, pause e repita em voz alta. Não espere “saber inglês” para começar a falar.</p></article>
        </div>
      </section>

      <section class="english-levels">
        @for (stage of stages; track stage.period; let idx = $index) {
          <article class="english-stage glass" [class.reached]="game.englishPercent() >= idx * 12.5">
            <div class="level-badge">{{ stage.level }}</div>
            <div class="stage-copy"><small>{{ stage.period }} · {{ stage.tools }}</small><h3>{{ stage.title }}</h3><p>{{ stage.target }}</p><div class="topic-cloud">@for (topic of stage.topics; track topic) { <span>{{ topic }}</span> }</div></div>
          </article>
        }
      </section>

      <section class="glass panel resources-panel">
        <div class="section-head"><div><p class="eyebrow">RECURSOS GRATUITOS</p><h2>Onde estudar</h2></div><span>Links externos</span></div>
        <div class="resource-grid">
          @for (resource of resources; track resource.name) {
            <a class="resource-card" [href]="resource.url" target="_blank" rel="noopener noreferrer"><div><span><svg lucideExternalLink [size]="14"></svg></span><small>DESDE {{ resource.recommendedFrom }}</small></div><strong>{{ resource.name }}</strong><p>{{ resource.description }}</p></a>
          }
        </div>
      </section>

      <section class="glass panel phrase-lab">
        <div class="section-head"><div><p class="eyebrow">TECH ENGLISH LAB</p><h2>Frase técnica do treino</h2></div><button class="btn ghost small" (click)="nextPhrase()">Outra frase</button></div>
        <div class="phrase-card"><span>EN</span><strong>{{ phrases[phraseIndex()][0] }}</strong><button class="text-button" (click)="toggleTranslation()">{{ showTranslation() ? 'Ocultar tradução' : 'Ver tradução' }}</button>@if (showTranslation()) { <p>{{ phrases[phraseIndex()][1] }}</p> }</div>
        <div class="speaking-tip"><svg lucideMic [size]="16" style="vertical-align:middle;margin-right:4px;"></svg> Leia a frase 3 vezes em voz alta. Depois tente falar olhando apenas para a tradução em português.</div>
      </section>
    </div>
  `
})
export class EnglishPageComponent {
  readonly stages = ENGLISH_STAGES;
  readonly resources = ENGLISH_RESOURCES;
  readonly phrases = TECHNICAL_PHRASES;
  readonly phraseIndex = signal(0);
  readonly showTranslation = signal(false);
  constructor(public readonly game: GameService) {}
  nextPhrase(): void { this.phraseIndex.update(i => (i + 1) % this.phrases.length); this.showTranslation.set(false); }
  toggleTranslation(): void { this.showTranslation.update(value => !value); }
}
