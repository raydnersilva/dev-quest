import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { buildDayPlan, PLAN_END, PLAN_START } from '../data/study-plan';
import { AppStoreService } from '../services/app-store.service';
import { GameService } from '../services/game.service';

interface CalendarCell { key: string; date?: string; day?: number; }

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-stack">
      <section class="hero-card glass compact-hero">
        <div><p class="eyebrow">CALENDÁRIO DE ESTUDOS</p><h1>Veja sua consistência no tempo.</h1><p>Verde significa dia completo; amarelo é parcial; dias sem cor ainda esperam por você.</p></div>
        <div class="calendar-legend"><span><i class="legend complete"></i>Concluído</span><span><i class="legend partial"></i>Parcial</span><span><i class="legend pending"></i>Pendente</span></div>
      </section>

      <section class="glass panel calendar-panel">
        <div class="calendar-head">
          <button class="round" (click)="moveMonth(-1)">‹</button>
          <div><p class="eyebrow">MÊS</p><h2>{{ monthLabel() }}</h2></div>
          <button class="round" (click)="moveMonth(1)">›</button>
        </div>
        <div class="weekdays"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div>
        <div class="calendar-grid">
          @for (cell of monthCells(); track cell.key) {
            @if (cell.date) {
              <button class="calendar-day" [class.outside]="cell.date < planStart || cell.date > planEnd" [class.complete]="game.completionForDate(cell.date)===100 && buildPlan(cell.date).tasks.length>0" [class.partial]="game.completionForDate(cell.date)>0 && game.completionForDate(cell.date)<100" [class.today]="cell.date===today()" (click)="openDay(cell.date)">
                <span class="day-number">{{ cell.day }}</span>
                @if (cell.date >= planStart && cell.date <= planEnd) {
                  <strong>{{ game.completionForDate(cell.date) }}%</strong>
                  <small>{{ shortFocus(cell.date) }}</small>
                  <i class="minutes-badge">{{ game.minutesForDate(cell.date) }}m</i>
                }
              </button>
            } @else { <div class="calendar-day empty"></div> }
          }
        </div>
      </section>

      <section class="calendar-stat-grid">
        <article class="glass calendar-stat"><span>✅</span><div><small>DIAS 100%</small><strong>{{ completeDaysInMonth() }}</strong></div></article>
        <article class="glass calendar-stat"><span>⏱️</span><div><small>MINUTOS NO MÊS</small><strong>{{ minutesInMonth() }}</strong></div></article>
        <article class="glass calendar-stat"><span>🔥</span><div><small>STREAK ATUAL</small><strong>{{ game.streak() }}</strong></div></article>
      </section>
    </div>
  `
})
export class CalendarPageComponent {
  readonly planStart = PLAN_START;
  readonly planEnd = PLAN_END;
  readonly anchor = signal(this.initialAnchor());
  readonly monthLabel = computed(() => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.anchor()));
  readonly monthCells = computed<CalendarCell[]>(() => {
    const a = this.anchor();
    const first = new Date(a.getFullYear(), a.getMonth(), 1, 12);
    const last = new Date(a.getFullYear(), a.getMonth() + 1, 0, 12);
    const cells: CalendarCell[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push({ key: `start-${i}` });
    for (let day = 1; day <= last.getDate(); day++) {
      const d = new Date(a.getFullYear(), a.getMonth(), day, 12);
      const date = this.iso(d);
      cells.push({ key: date, date, day });
    }
    while (cells.length % 7) cells.push({ key: `end-${cells.length}` });
    return cells;
  });
  readonly completeDaysInMonth = computed(() => this.monthCells().filter(c => c.date && buildDayPlan(c.date).tasks.length && this.game.completionForDate(c.date) === 100).length);
  readonly minutesInMonth = computed(() => this.monthCells().filter(c => c.date).reduce((sum, c) => sum + this.game.minutesForDate(c.date!), 0));

  constructor(public readonly game: GameService, private readonly store: AppStoreService, private readonly router: Router) {}

  today(): string { return this.iso(new Date()); }
  buildPlan(date: string) { return buildDayPlan(date); }
  shortFocus(date: string): string { const value = buildDayPlan(date).phase.label; return value.length > 22 ? `${value.slice(0, 22)}…` : value; }
  moveMonth(delta: number): void { const d = new Date(this.anchor()); d.setMonth(d.getMonth() + delta); this.anchor.set(d); }
  openDay(date: string): void { if (date < PLAN_START || date > PLAN_END) return; this.store.selectedDate.set(date); void this.router.navigateByUrl('/hoje'); }

  private initialAnchor(): Date { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1, 12); }
  private iso(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
}
