import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCode, LucideSparkles, LucideLoader, LucideLightbulb, LucideEye, LucideHistory, LucideChevronDown, LucideChevronUp, LucideCheckCircle, LucideXCircle } from '@lucide/angular';
import { phaseFor, buildDayPlan } from '../data/study-plan';
import { AiService, ChallengeResponse, EvaluationResponse } from '../services/ai.service';

type Difficulty = 'easy' | 'medium' | 'hard';

@Component({
  selector: 'app-challenges-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideCode, LucideSparkles, LucideLoader, LucideLightbulb, LucideEye, LucideHistory, LucideChevronDown, LucideChevronUp, LucideCheckCircle, LucideXCircle],
  template: `
    <div class="page-stack">
      <section class="hero-card glass challenges-hero">
        <div>
          <p class="eyebrow">CODE CHALLENGES</p>
          <h1>Pratique com exercícios gerados por IA.</h1>
          <p>Exercícios estilo LeetCode contextualizados com seu tópico de estudo atual.</p>
        </div>
        <div class="challenges-orb"><svg lucideCode [size]="40"></svg><strong>{{ currentLanguage() }}</strong></div>
      </section>

      <section class="glass panel challenge-config">
        <div class="section-head"><div><p class="eyebrow">CONFIGURAR DESAFIO</p><h2>{{ currentTopic() }}</h2></div></div>
        <div class="difficulty-selector">
          <button class="diff-btn easy" [class.active]="difficulty() === 'easy'" (click)="difficulty.set('easy')">Fácil</button>
          <button class="diff-btn medium" [class.active]="difficulty() === 'medium'" (click)="difficulty.set('medium')">Médio</button>
          <button class="diff-btn hard" [class.active]="difficulty() === 'hard'" (click)="difficulty.set('hard')">Difícil</button>
        </div>
        <div class="challenge-meta">
          <span class="mode-pill">{{ currentLanguage() }}</span>
          <span class="mode-pill">Fase {{ currentPhase().id }}/24</span>
          <span class="mode-pill">{{ currentPhase().track }}</span>
        </div>
        <button class="btn primary suggest-btn" [disabled]="ai.challengeLoading()" (click)="generate()">
          @if (ai.challengeLoading()) { <svg lucideLoader [size]="18" class="spin"></svg> Gerando desafio... }
          @else { <svg lucideSparkles [size]="18"></svg> Gerar desafio }
        </button>
      </section>

      @if (ai.challengeError()) {
        <div class="error-toast">{{ ai.challengeError() }}</div>
      }

      @if (challenge()) {
        <section class="glass panel challenge-card">
          <div class="section-head">
            <div>
              <div class="challenge-title-row"><span class="diff-pill" [attr.data-diff]="challenge()!.difficulty">{{ challenge()!.difficulty }}</span><h2>{{ challenge()!.title }}</h2></div>
              <small>{{ challenge()!.language }}</small>
            </div>
          </div>
          <div class="challenge-description">{{ challenge()!.description }}</div>

          <div class="examples-section">
            <p class="eyebrow">EXEMPLOS</p>
            @for (example of challenge()!.examples; track $index) {
              <div class="example-block">
                <div><strong>Input:</strong><pre>{{ example.input }}</pre></div>
                <div><strong>Output:</strong><pre>{{ example.output }}</pre></div>
                @if (example.explanation) { <div><strong>Explicação:</strong><span>{{ example.explanation }}</span></div> }
              </div>
            }
          </div>

          @if (challenge()!.constraints.length) {
            <div class="constraints-section">
              <p class="eyebrow">RESTRIÇÕES</p>
              <ul>@for (c of challenge()!.constraints; track c) { <li>{{ c }}</li> }</ul>
            </div>
          }

          <div class="your-solution">
            <p class="eyebrow">SUA SOLUÇÃO</p>
            <textarea class="field textarea code-textarea" rows="12" [(ngModel)]="userSolution" placeholder="Escreva seu código aqui..."></textarea>
          </div>

          <div class="reveal-buttons">
            <button class="btn primary small" [disabled]="!userSolution || evaluating()" (click)="evaluateCode()">
              @if (evaluating()) { <svg lucideLoader [size]="16" class="spin"></svg> Avaliando... }
              @else { Avaliar Solução }
            </button>
            <button class="btn ghost small" (click)="showHints.set(!showHints())">
              <svg lucideLightbulb [size]="16"></svg> {{ showHints() ? 'Ocultar dicas' : 'Ver dicas' }}
            </button>
            <button class="btn ghost small" (click)="showSolution.set(!showSolution())">
              <svg lucideEye [size]="16"></svg> {{ showSolution() ? 'Ocultar solução' : 'Ver solução' }}
            </button>
          </div>

          @if (evalResult()) {
            <div class="evaluation-result glass" [class.correct]="evalResult()!.correct">
              <div class="eval-header">
                @if (evalResult()!.correct) { <svg lucideCheckCircle [size]="20" class="text-green"></svg> <strong>Correto!</strong> }
                @else { <svg lucideXCircle [size]="20" class="text-red"></svg> <strong>Incorreto ou Incompleto</strong> }
              </div>
              <p>{{ evalResult()!.feedback }}</p>
            </div>
          }

          @if (showHints()) {
            <div class="hints-section glass">
              <p class="eyebrow">DICAS</p>
              @for (hint of challenge()!.hints; track $index) {
                <div class="hint-item"><strong>Dica {{ $index + 1 }}:</strong> {{ hint }}</div>
              }
            </div>
          }

          @if (showSolution()) {
            <div class="solution-section glass">
              <p class="eyebrow">SOLUÇÃO</p>
              <pre class="solution-code">{{ challenge()!.solution }}</pre>
              <div class="solution-explanation"><p class="eyebrow">EXPLICAÇÃO</p><p>{{ challenge()!.solutionExplanation }}</p></div>
            </div>
          }
        </section>
      }

      @if (!challenge() && !ai.challengeLoading()) {
        <section class="glass panel empty-state">
          <svg lucideCode [size]="48"></svg>
          <h3>Escolha a dificuldade e clique em "Gerar desafio"</h3>
          <p>A IA vai criar um exercício sob medida para seu tópico atual.</p>
        </section>
      }

      @if (history().length) {
        <section class="glass panel history-panel">
          <div class="section-head" (click)="showHistory.set(!showHistory())">
            <div><svg lucideHistory [size]="18"></svg><p class="eyebrow" style="display:inline;margin-left:8px">HISTÓRICO ({{ history().length }})</p></div>
            @if (showHistory()) { <svg lucideChevronUp [size]="18"></svg> } @else { <svg lucideChevronDown [size]="18"></svg> }
          </div>
          @if (showHistory()) {
            <div class="history-list">
              @for (item of history(); track item.generatedAt) {
                <button class="history-item" (click)="loadFromHistory(item)">
                  <span class="diff-pill" [attr.data-diff]="item.difficulty">{{ item.difficulty }}</span>
                  <div><strong>{{ item.title }}</strong><small>{{ item.topic }} · {{ item.language }}</small></div>
                </button>
              }
            </div>
          }
        </section>
      }
    </div>
  `
})
export class ChallengesPageComponent {
  readonly challenge = signal<ChallengeResponse | null>(null);
  readonly difficulty = signal<Difficulty>('medium');
  readonly showHints = signal(false);
  readonly showSolution = signal(false);
  readonly showHistory = signal(false);
  readonly evaluating = signal(false);
  readonly evalResult = signal<EvaluationResponse | null>(null);
  userSolution = '';

  readonly today = computed(() => this.iso(new Date()));
  readonly currentPhase = computed(() => phaseFor(this.today()));
  readonly currentTopic = computed(() => {
    const plan = buildDayPlan(this.today());
    const career = plan.tasks.find(t => t.category === 'career');
    return career?.label?.split('—').pop()?.trim() ?? this.currentPhase().topics[0] ?? 'Java';
  });
  readonly currentLanguage = computed(() => {
    const map: Record<string, string> = { backend: 'Java', frontend: 'TypeScript', cloud: 'Bash/HCL', architecture: 'Java', english: 'TypeScript', ads: 'JavaScript' };
    return map[this.currentPhase().track] ?? 'Java';
  });
  readonly history = computed(() => this.ai.getChallengeHistory());

  constructor(public readonly ai: AiService) {}

  async generate(): Promise<void> {
    this.showHints.set(false);
    this.showSolution.set(false);
    this.evalResult.set(null);
    this.userSolution = '';
    const result = await this.ai.challenge(this.currentTopic(), this.currentPhase().track, this.difficulty(), this.currentLanguage());
    if (result) this.challenge.set(result);
  }

  async evaluateCode(): Promise<void> {
    const ch = this.challenge();
    if (!ch || !this.userSolution) return;
    this.evaluating.set(true);
    this.evalResult.set(null);
    const result = await this.ai.evaluateCode(ch.title, ch.description, ch.language, this.userSolution);
    this.evalResult.set(result);
    this.evaluating.set(false);
  }

  loadFromHistory(item: ChallengeResponse & { generatedAt: string; topic: string }): void {
    this.challenge.set(item);
    this.showHints.set(false);
    this.showSolution.set(false);
    this.evalResult.set(null);
    this.userSolution = '';
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
