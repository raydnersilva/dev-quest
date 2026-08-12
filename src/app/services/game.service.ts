import { Injectable, computed } from '@angular/core';
import { allPlanDates, buildDayPlan, PHASES, PLAN_END, PLAN_START } from '../data/study-plan';
import { Achievement, Track, WeekDayStat } from '../models';
import { AppStoreService } from './app-store.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly allDates = allPlanDates();
  readonly xp = computed(() => this.calculateXp());
  readonly level = computed(() => Math.floor(this.xp() / 600) + 1);
  readonly levelFloor = computed(() => (this.level() - 1) * 600);
  readonly levelProgress = computed(() => Math.round(((this.xp() - this.levelFloor()) / 600) * 100));
  readonly overallPercent = computed(() => this.percentForTracks(['backend', 'frontend', 'cloud', 'architecture', 'english']));
  readonly backendPercent = computed(() => this.percentForTracks(['backend', 'architecture', 'cloud']));
  readonly frontendPercent = computed(() => this.percentForTracks(['frontend']));
  readonly englishPercent = computed(() => this.percentForTracks(['english']));
  readonly architecturePercent = computed(() => this.percentForTracks(['architecture']));
  readonly cloudPercent = computed(() => this.percentForTracks(['cloud']));
  readonly adsPercent = computed(() => this.percentForTracks(['ads']));
  readonly streak = computed(() => this.computeStreak());
  readonly totalMinutes = computed(() => Object.values(this.store.progress()).filter(e => e.completed).reduce((sum, e) => sum + e.minutes, 0));
  readonly totalHours = computed(() => Math.round((this.totalMinutes() / 60) * 10) / 10);
  readonly completedTasks = computed(() => Object.values(this.store.progress()).filter(e => e.completed).length);
  readonly weekStats = computed(() => this.buildWeekStats());
  readonly achievements = computed<Achievement[]>(() => this.buildAchievements());
  readonly unlockedAchievements = computed(() => this.achievements().filter(a => a.unlocked).length);

  constructor(private readonly store: AppStoreService) {}

  xpFor(minutes: number, category: string): number {
    return Math.max(5, Math.round(minutes / 15) * 5) + (category === 'career' ? 10 : category === 'english' ? 5 : 0);
  }

  titleForLevel(level = this.level()): string {
    if (level < 4) return 'Iniciante';
    if (level < 8) return 'Aprendiz';
    if (level < 14) return 'Dev em evolução';
    if (level < 20) return 'Pleno forte';
    if (level < 28) return 'Sênior';
    return 'Especialista';
  }

  completionForDate(date: string): number {
    if (date < PLAN_START || date > PLAN_END) return 0;
    const tasks = buildDayPlan(date).tasks;
    if (!tasks.length) return 100;
    const done = tasks.filter(task => this.store.isDone(date, task.key)).length;
    return Math.round((done / tasks.length) * 100);
  }

  minutesForDate(date: string): number {
    return Object.values(this.store.progress()).filter(entry => entry.date === date && entry.completed).reduce((sum, entry) => sum + entry.minutes, 0);
  }

  plannedMinutesForDate(date: string): number {
    return buildDayPlan(date).tasks.reduce((sum, task) => sum + task.minutes, 0);
  }

  phaseProgress(phaseId: number): number {
    const phase = PHASES.find(p => p.id === phaseId);
    if (!phase) return 0;
    let total = 0;
    let done = 0;
    for (const date of this.allDates) {
      if (date < phase.start || date > phase.end) continue;
      for (const task of buildDayPlan(date).tasks) {
        if (task.category === 'ads') continue;
        total++;
        if (this.store.isDone(date, task.key)) done++;
      }
    }
    return total ? Math.round((done / total) * 100) : 0;
  }

  currentQuestIndex(): number {
    return Math.min(PHASES.length - 1, Math.floor((this.overallPercent() / 100) * PHASES.length));
  }

  private calculateXp(): number {
    let total = 0;
    for (const entry of Object.values(this.store.progress())) {
      if (entry.completed) total += this.xpFor(entry.minutes, entry.category);
    }
    for (const date of this.allDates) if (this.completionForDate(date) === 100 && buildDayPlan(date).tasks.length) total += 25;
    return total;
  }

  private percentForTracks(tracks: Track[]): number {
    let total = 0;
    let done = 0;
    for (const date of this.allDates) {
      for (const task of buildDayPlan(date).tasks) {
        if (!tracks.includes(task.track)) continue;
        total++;
        if (this.store.isDone(date, task.key)) done++;
      }
    }
    return total ? Math.round((done / total) * 100) : 0;
  }

  private computeStreak(): number {
    let count = 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    for (let i = 0; i < 800; i++) {
      const date = this.iso(cursor);
      const hasStudy = Object.values(this.store.progress()).some(entry => entry.date === date && entry.completed);
      if (hasStudy) count++;
      else if (i === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      } else break;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  private buildWeekStats(): WeekDayStat[] {
    const items: WeekDayStat[] = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const date = this.iso(d);
      const minutes = this.minutesForDate(date);
      const planned = this.plannedMinutesForDate(date);
      items.push({
        date,
        label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).replace('.', ''),
        minutes,
        planned,
        percent: planned ? Math.min(100, Math.round((minutes / planned) * 100)) : 0
      });
    }
    return items;
  }

  private buildAchievements(): Achievement[] {
    const englishDone = Object.values(this.store.progress()).filter(e => e.completed && e.category === 'english').length;
    const frontendDone = Object.values(this.store.progress()).filter(e => e.completed && e.track === 'frontend').length;
    const cloudDone = Object.values(this.store.progress()).filter(e => e.completed && e.track === 'cloud').length;
    return [
      this.achievement('🌱', 'Primeiro passo', 'Conclua sua primeira missão.', this.completedTasks(), 1),
      this.achievement('🔥', 'Em chamas', 'Mantenha 7 dias de sequência.', this.streak(), 7),
      this.achievement('☕', 'Java Foundations', 'Conclua a Fase 01.', this.phaseProgress(1), 100),
      this.achievement('🧠', 'POO desbloqueada', 'Conclua a Fase 02.', this.phaseProgress(2), 100),
      this.achievement('🇺🇸', 'English Habit', 'Conclua 30 missões de inglês.', englishDone, 30),
      this.achievement('🅰️', 'Frontend desbloqueado', 'Conclua sua primeira missão de frontend.', frontendDone, 1),
      this.achievement('⚡', 'Mil de XP', 'Acumule 1.000 XP.', this.xp(), 1000),
      this.achievement('⏱️', '50 horas de foco', 'Registre 50 horas de estudo.', this.totalMinutes(), 3000),
      this.achievement('☁️', 'Cloud Builder', 'Comece a trilha de cloud.', cloudDone, 1),
      this.achievement('🏗️', 'Arquiteto em formação', 'Conclua a fase de Arquitetura + DDD.', this.phaseProgress(16), 100),
      this.achievement('🎯', 'Metade do caminho', 'Chegue a 50% da jornada.', this.overallPercent(), 50),
      this.achievement('🏆', 'Especialista', 'Finalize 100% da jornada.', this.overallPercent(), 100)
    ];
  }

  private achievement(icon: string, name: string, description: string, value: number, target: number): Achievement {
    return { icon, name, description, unlocked: value >= target, progress: Math.min(100, Math.round((value / target) * 100)) };
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
