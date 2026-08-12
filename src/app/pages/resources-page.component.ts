import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { LucideBookOpen, LucidePlay, LucideSearch, LucideStar, LucideSparkles, LucideLoader } from '@lucide/angular';
import { buildDayPlan, phaseFor, PHASES } from '../data/study-plan';
import { AppStoreService } from '../services/app-store.service';
import { AiService, SuggestResponse } from '../services/ai.service';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  imports: [CommonModule, LucideBookOpen, LucidePlay, LucideSearch, LucideStar, LucideSparkles, LucideLoader],
  template: `
    <div class="page-stack">
      <section class="hero-card glass resources-hero">
        <div>
          <p class="eyebrow">RECURSOS IA</p>
          <h1>Estude com curadoria inteligente.</h1>
          <p>A IA analisa seu tópico atual e sugere vídeos gratuitos do YouTube e cursos com boa avaliação.</p>
        </div>
        <div class="resources-orb"><svg lucideSparkles [size]="40"></svg><strong>Groq AI</strong></div>
      </section>

      <section class="glass panel topic-selector-panel">
        <div class="section-head"><div><p class="eyebrow">SEU TÓPICO ATUAL</p><h2>{{ currentTopic() }}</h2></div>
          <span class="mode-pill">Fase {{ currentPhase().id }}/24</span>
        </div>
        <div class="topic-chips">
          @for (topic of currentPhase().topics; track topic) {
            <button class="topic-chip" [class.selected]="topic === selectedTopic()" (click)="selectTopic(topic)">{{ topic }}</button>
          }
        </div>
        <button class="btn primary suggest-btn" [disabled]="ai.suggestLoading()" (click)="fetchSuggestions()">
          @if (ai.suggestLoading()) { <svg lucideLoader [size]="18" class="spin"></svg> Buscando... }
          @else { <svg lucideSearch [size]="18"></svg> Buscar sugestões com IA }
        </button>
      </section>

      @if (ai.suggestError()) {
        <div class="error-toast">{{ ai.suggestError() }}</div>
      }

      @if (suggestions()) {
        <section class="glass panel videos-panel">
          <div class="section-head"><div><p class="eyebrow">VÍDEOS GRATUITOS</p><h2>YouTube</h2></div><span>{{ suggestions()!.videos.length }} encontrados</span></div>
          <div class="resource-grid">
            @for (video of suggestions()!.videos; track video.title) {
              <a class="resource-card video-card" [href]="video.url" target="_blank" rel="noopener noreferrer">
                <div class="resource-card-head"><svg lucidePlay [size]="16"></svg><small>{{ video.channel }} · {{ video.duration }}</small></div>
                <strong>{{ video.title }}</strong>
                <p>{{ video.reason }}</p>
              </a>
            }
          </div>
        </section>

        <section class="glass panel courses-panel">
          <div class="section-head"><div><p class="eyebrow">CURSOS RECOMENDADOS</p><h2>Custo-benefício</h2></div><span>{{ suggestions()!.courses.length }} encontrados</span></div>
          <div class="resource-grid">
            @for (course of suggestions()!.courses; track course.title) {
              <a class="resource-card course-card" [href]="course.url" target="_blank" rel="noopener noreferrer">
                <div class="resource-card-head"><svg lucideStar [size]="16"></svg><small>{{ course.platform }} · {{ course.rating }}</small></div>
                <strong>{{ course.title }}</strong>
                <p>{{ course.reason }}</p>
                <span class="price-pill">{{ course.price }}</span>
              </a>
            }
          </div>
        </section>
      }

      @if (!suggestions() && !ai.suggestLoading()) {
        <section class="glass panel empty-state">
          <svg lucideBookOpen [size]="48"></svg>
          <h3>Escolha um tópico e clique em "Buscar sugestões"</h3>
          <p>A IA vai encontrar os melhores vídeos e cursos para você.</p>
        </section>
      }
    </div>
  `
})
export class ResourcesPageComponent {
  readonly suggestions = signal<SuggestResponse | null>(null);
  readonly selectedTopic = signal('');

  readonly today = computed(() => this.iso(new Date()));
  readonly currentPhase = computed(() => phaseFor(this.today()));
  readonly currentTopic = computed(() => {
    if (this.selectedTopic()) return this.selectedTopic();
    const plan = buildDayPlan(this.today());
    const career = plan.tasks.find(t => t.category === 'career');
    return career?.label?.split('—').pop()?.trim() ?? this.currentPhase().topics[0] ?? 'Java';
  });

  constructor(public readonly store: AppStoreService, public readonly ai: AiService) {
    this.selectedTopic.set('');
  }

  selectTopic(topic: string): void {
    this.selectedTopic.set(topic);
  }

  async fetchSuggestions(): Promise<void> {
    const topic = this.selectedTopic() || this.currentTopic();
    const result = await this.ai.suggest(topic, this.currentPhase().track, this.currentPhase().id);
    if (result) this.suggestions.set(result);
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
