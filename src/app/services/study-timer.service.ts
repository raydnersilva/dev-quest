import { Injectable, computed, signal } from '@angular/core';
import { DayTask } from '../models';

interface TimerState {
  date: string;
  taskKey: string;
  taskLabel: string;
  startedAt: number;
}

const TIMER_KEY = 'devquest-study-timer-v1';

@Injectable({ providedIn: 'root' })
export class StudyTimerService {
  readonly active = signal<TimerState | null>(null);
  readonly now = signal(Date.now());
  readonly elapsedSeconds = computed(() => {
    const active = this.active();
    return active ? Math.max(0, Math.floor((this.now() - active.startedAt) / 1000)) : 0;
  });
  readonly formatted = computed(() => {
    const total = this.elapsedSeconds();
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });
  private intervalId: number | null = null;

  constructor() {
    this.restore();
    this.ensureTicker();
  }

  isRunning(date: string, taskKey: string): boolean {
    const active = this.active();
    return active?.date === date && active.taskKey === taskKey;
  }

  start(date: string, task: DayTask): { ok: boolean; message?: string } {
    const current = this.active();
    if (current && (current.date !== date || current.taskKey !== task.key)) {
      return { ok: false, message: `Já existe um foco em andamento: ${current.taskLabel}. Pare-o antes de iniciar outro.` };
    }
    if (!current) {
      const state: TimerState = { date, taskKey: task.key, taskLabel: task.label, startedAt: Date.now() };
      this.active.set(state);
      localStorage.setItem(TIMER_KEY, JSON.stringify(state));
      this.now.set(Date.now());
      this.ensureTicker();
    }
    return { ok: true };
  }

  stop(): { state: TimerState; seconds: number; minutes: number } | null {
    const state = this.active();
    if (!state) return null;
    const seconds = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
    const minutes = Math.max(1, Math.round(seconds / 60));
    this.active.set(null);
    localStorage.removeItem(TIMER_KEY);
    this.stopTicker();
    return { state, seconds, minutes };
  }

  discard(): void {
    this.active.set(null);
    localStorage.removeItem(TIMER_KEY);
    this.stopTicker();
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(TIMER_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as TimerState;
      if (!parsed.date || !parsed.taskKey || !parsed.startedAt) return;
      // Evita um cronômetro esquecido contabilizar vários dias por acidente.
      const maxAgeMs = 12 * 60 * 60 * 1000;
      if (Date.now() - parsed.startedAt > maxAgeMs) {
        localStorage.removeItem(TIMER_KEY);
        return;
      }
      this.active.set(parsed);
      this.now.set(Date.now());
    } catch {
      localStorage.removeItem(TIMER_KEY);
    }
  }

  private ensureTicker(): void {
    if (!this.active() || this.intervalId !== null) return;
    this.intervalId = window.setInterval(() => this.now.set(Date.now()), 1000);
  }

  private stopTicker(): void {
    if (this.intervalId !== null) window.clearInterval(this.intervalId);
    this.intervalId = null;
  }
}
