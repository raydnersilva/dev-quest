import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { GameService } from '../services/game.service';

interface GraphDay {
  date: string;
  minutes: number;
  level: number; // 0: none, 1: low, 2: medium, 3: high
}

@Component({
  selector: 'app-contribution-graph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contribution-wrapper glass">
      <div class="graph-header">
        <h3>Dias de Foco</h3>
        <small>{{ totalDaysActive() }} contribuições no último ano</small>
      </div>
      <div class="graph-scroll">
        <div class="graph-grid">
          @for (week of weeks(); track $index) {
            <div class="graph-column">
              @for (day of week; track day?.date) {
                @if (day) {
                  <div class="graph-square" [class]="'level-' + day.level" [title]="day.date + ': ' + day.minutes + ' min'"></div>
                } @else {
                  <div class="graph-square empty"></div>
                }
              }
            </div>
          }
        </div>
      </div>
      <div class="graph-footer">
        <small>Menos</small>
        <div class="graph-legend">
          <div class="graph-square level-0"></div>
          <div class="graph-square level-1"></div>
          <div class="graph-square level-2"></div>
          <div class="graph-square level-3"></div>
        </div>
        <small>Mais</small>
      </div>
    </div>
  `,
  styles: [`
    .contribution-wrapper { padding: 16px; border-radius: 20px; }
    .graph-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
    .graph-header h3 { margin: 0; font-size: 16px; color: var(--text); }
    .graph-header small { color: var(--muted); font-size: 12px; }
    
    .graph-scroll { overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
    .graph-scroll::-webkit-scrollbar { display: none; }
    
    .graph-grid { display: flex; gap: 4px; }
    .graph-column { display: flex; flex-direction: column; gap: 4px; }
    
    .graph-square { width: 11px; height: 11px; border-radius: 3px; background: rgba(255,255,255,0.05); }
    .graph-square.empty { background: transparent; }
    .graph-square.level-0 { background: rgba(255,255,255,0.05); }
    .graph-square.level-1 { background: rgba(85,221,161,0.3); }
    .graph-square.level-2 { background: rgba(85,221,161,0.6); }
    .graph-square.level-3 { background: rgba(85,221,161,1); }
    
    .graph-footer { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 8px; color: var(--muted); }
    .graph-legend { display: flex; gap: 4px; }
  `]
})
export class ContributionGraphComponent {
  readonly weeks = computed(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // avoid tz issues
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // last 52 weeks (364 days)
    
    // adjust to sunday start
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const days: (GraphDay | null)[] = [];
    const endTimestamp = today.getTime();
    const curr = new Date(startDate);
    
    while (curr.getTime() <= endTimestamp) {
      const iso = this.iso(curr);
      const minutes = this.game.minutesForDate(iso);
      let level = 0;
      if (minutes > 0) level = 1;
      if (minutes >= 60) level = 2;
      if (minutes >= 120) level = 3;

      days.push({ date: iso, minutes, level });
      curr.setDate(curr.getDate() + 1);
    }
    
    // pad end with nulls if today is not saturday
    while (curr.getDay() !== 0 && days.length % 7 !== 0) {
      days.push(null);
      curr.setDate(curr.getDate() + 1);
    }

    // chunk by 7
    const w: (GraphDay | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7));
    }
    return w;
  });

  readonly totalDaysActive = computed(() => {
    let count = 0;
    for (const week of this.weeks()) {
      for (const day of week) {
        if (day && day.level > 0) count++;
      }
    }
    return count;
  });

  constructor(private game: GameService) {}

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
