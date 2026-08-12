import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { buildDayPlan, PLAN_END, PLAN_START } from '../data/study-plan';
import { DayTask, Track } from '../models';
import { AppStoreService } from '../services/app-store.service';
import { GameService } from '../services/game.service';
import { StudyTimerService } from '../services/study-timer.service';

@Component({
  selector: 'app-today-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-stack">
      @if (celebrating()) { <div class="confetti-layer" aria-hidden="true">@for (piece of confetti; track piece) { <i [style.--i]="piece"></i> }</div> }
      @if (timerMessage()) { <div class="focus-toast">{{ timerMessage() }}</div> }
      <section class="hero-card glass today-hero">
        <div>
          <p class="eyebrow">MISSÃO ATUAL · FASE {{ plan().phase.id }}/24</p>
          <h1>{{ plan().phase.label }}</h1>
          <div class="date-switcher"><button class="round" (click)="moveDate(-1)">‹</button><button class="date-button" (click)="goToday()">{{ humanDate(store.selectedDate()) }}</button><button class="round" (click)="moveDate(1)">›</button></div>
          <div class="pill-row"><span class="mode-pill">{{ plan().mode }}</span><span>{{ dayDone() }}/{{ plan().tasks.length }} concluídas</span><span>{{ dayMinutes() }} min realizados</span></div>
        </div>
        <div class="mission-score"><strong>{{ dayPercent() }}%</strong><span>do dia</span><div class="mini-progress"><i [style.width.%]="dayPercent()"></i></div></div>
      </section>

      <section class="today-grid">
        <article class="glass panel missions-panel">
          <div class="section-head"><div><p class="eyebrow">CHECKLIST</p><h2>Missões do dia</h2></div><span class="xp-badge">+{{ potentialXp() }} XP</span></div>
          @if (!plan().tasks.length) {
            <div class="rest-state"><div>🌴</div><h3>Dia de descanso.</h3><p>Descansar faz parte do plano. Amanhã o mapa continua.</p></div>
          }
          @for (task of plan().tasks; track task.key) {
            <div class="mission-row" [class.done]="store.isDone(store.selectedDate(), task.key)">
              <button class="mission-check" (click)="toggle(task)">{{ store.isDone(store.selectedDate(), task.key) ? '✓' : '' }}</button>
              <div class="mission-icon">{{ iconForTrack(task.track) }}</div>
              <button class="mission-content" (click)="toggle(task)">
                <strong>{{ task.label }}</strong>
                <span>{{ task.minutes }} min planejados · +{{ game.xpFor(task.minutes, task.category) }} XP</span>
              </button>
              <button class="focus-button" [class.running]="timer.isRunning(store.selectedDate(), task.key)" (click)="toggleTimer(task, $event)">
                {{ timer.isRunning(store.selectedDate(), task.key) ? '⏹ ' + timer.formatted() : '▶ Foco' }}
              </button>
              <button class="details-button" title="Editar minutos e anotações" (click)="openDetails(task)">•••</button>
            </div>
          }
          @if (plan().tasks.length && dayPercent() === 100) {
            <div class="day-complete-banner"><span>🎉</span><div><strong>Missão do dia concluída!</strong><p>Você ganhou o bônus de +25 XP por fechar o checklist.</p></div></div>
          }
        </article>

        <aside class="glass panel focus-aside">
          <p class="eyebrow">STATUS DO DIA</p>
          @if (timer.active()) {
            <div class="active-focus-card">
              <span class="focus-pulse"></span>
              <div><small>FOCO EM ANDAMENTO</small><strong>{{ timer.active()!.taskLabel }}</strong><b>{{ timer.formatted() }}</b></div>
              <button class="btn compact danger-ghost" (click)="stopActiveTimer()">Parar</button>
            </div>
          }
          <div class="avatar-stage"><div class="avatar-shadow"></div><div class="avatar-bounce">{{ store.profile().avatar }}</div></div>
          <h3>{{ dayPercent() === 100 ? 'Checkpoint alcançado!' : dayPercent() > 0 ? 'Você já começou.' : 'Primeiro passo.' }}</h3>
          <p>{{ encouragement() }}</p>
          <div class="today-stat"><span>Meta pessoal</span><strong>{{ dayMinutes() }}/{{ store.profile().dailyGoalMinutes }} min</strong></div>
          <div class="today-stat"><span>Streak atual</span><strong>🔥 {{ game.streak() }} dias</strong></div>
          <div class="today-stat"><span>XP total</span><strong>⚡ {{ game.xp() }}</strong></div>
        </aside>
      </section>

      @if (editingTask()) {
        <div class="modal-backdrop" (click)="closeDetails()">
          <section class="modal-card glass" (click)="$event.stopPropagation()">
            <div class="section-head"><div><p class="eyebrow">REGISTRO DA MISSÃO</p><h2>{{ editingTask()!.label }}</h2></div><button class="round" (click)="closeDetails()">×</button></div>
            <label class="field-label">Minutos realmente estudados<input class="field" type="number" min="0" max="600" [(ngModel)]="detailMinutes"></label>
            <label class="field-label">Anotações<textarea class="field textarea" rows="6" [(ngModel)]="detailNotes" placeholder="O que aprendi? Onde tive dificuldade? O que revisar?"></textarea></label>
            <div class="modal-actions"><button class="btn ghost" (click)="closeDetails()">Cancelar</button><button class="btn primary" (click)="saveDetails()">Salvar registro</button></div>
          </section>
        </div>
      }
    </div>
  `
})
export class TodayPageComponent {
  readonly plan = computed(() => buildDayPlan(this.store.selectedDate()));
  readonly dayDone = computed(() => this.plan().tasks.filter(task => this.store.isDone(this.store.selectedDate(), task.key)).length);
  readonly dayPercent = computed(() => this.plan().tasks.length ? Math.round((this.dayDone() / this.plan().tasks.length) * 100) : 100);
  readonly dayMinutes = computed(() => this.game.minutesForDate(this.store.selectedDate()));
  readonly potentialXp = computed(() => this.plan().tasks.reduce((sum, task) => sum + this.game.xpFor(task.minutes, task.category), 0) + (this.plan().tasks.length ? 25 : 0));
  readonly editingTask = signal<DayTask | null>(null);
  readonly celebrating = signal(false);
  readonly timerMessage = signal('');
  readonly confetti = Array.from({ length: 28 }, (_, i) => i + 1);
  detailMinutes = 0;
  detailNotes = '';

  constructor(public readonly store: AppStoreService, public readonly game: GameService, public readonly timer: StudyTimerService) {}

  async toggle(task: DayTask): Promise<void> {
    const wasComplete = this.dayPercent() === 100;
    await this.store.toggleTask(this.store.selectedDate(), task);
    if (!wasComplete && this.dayPercent() === 100 && this.plan().tasks.length) {
      this.celebrating.set(true);
      window.setTimeout(() => this.celebrating.set(false), 2200);
    }
  }

  async toggleTimer(task: DayTask, event: Event): Promise<void> {
    event.stopPropagation();
    if (this.timer.isRunning(this.store.selectedDate(), task.key)) {
      await this.stopActiveTimer();
      return;
    }
    const result = this.timer.start(this.store.selectedDate(), task);
    if (!result.ok) {
      this.timerMessage.set(result.message ?? 'Já existe um foco em andamento.');
      window.setTimeout(() => this.timerMessage.set(''), 3500);
    }
  }

  async stopActiveTimer(): Promise<void> {
    const result = this.timer.stop();
    if (!result) return;
    const plan = buildDayPlan(result.state.date);
    const task = plan.tasks.find(item => item.key === result.state.taskKey);
    if (!task) return;
    const current = this.store.entry(result.state.date, task.key);
    const existingMinutes = current?.minutes ?? 0;
    await this.store.saveTaskDetails(result.state.date, task, existingMinutes + result.minutes, current?.notes ?? '');
    this.timerMessage.set(`⏱️ ${result.minutes} min adicionados a “${task.label}”.`);
    window.setTimeout(() => this.timerMessage.set(''), 3500);
  }

  openDetails(task: DayTask): void {
    const entry = this.store.entry(this.store.selectedDate(), task.key);
    this.detailMinutes = entry?.minutes ?? task.minutes;
    this.detailNotes = entry?.notes ?? '';
    this.editingTask.set(task);
  }

  closeDetails(): void { this.editingTask.set(null); }

  async saveDetails(): Promise<void> {
    const task = this.editingTask();
    if (!task) return;
    await this.store.saveTaskDetails(this.store.selectedDate(), task, this.detailMinutes, this.detailNotes);
    this.closeDetails();
  }

  moveDate(delta: number): void {
    const d = this.parse(this.store.selectedDate());
    d.setDate(d.getDate() + delta);
    const value = this.iso(d);
    if (value >= PLAN_START && value <= PLAN_END) this.store.selectedDate.set(value);
  }

  goToday(): void {
    const value = this.iso(new Date());
    this.store.selectedDate.set(value < PLAN_START ? PLAN_START : value > PLAN_END ? PLAN_END : value);
  }

  humanDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(this.parse(value));
  }

  iconForTrack(track: Track): string {
    return ({ backend: '☕', frontend: '🅰️', cloud: '☁️', architecture: '🧠', english: '🇺🇸', ads: '🎓' } as Record<Track, string>)[track];
  }

  encouragement(): string {
    const p = this.dayPercent();
    if (p === 100) return 'Seu avatar avançou mais um pouco. Feche o dia com orgulho e volte amanhã.';
    if (p >= 50) return 'Mais da metade feita. Termine o bloco atual antes de começar outro.';
    if (p > 0) return 'O mais difícil era começar. Continue uma missão por vez.';
    return 'Marque a primeira missão e coloque o personagem em movimento.';
  }

  private parse(value: string): Date { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d, 12); }
  private iso(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
}
