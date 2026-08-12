import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { TodayPageComponent } from './pages/today-page.component';
import { JourneyPageComponent } from './pages/journey-page.component';
import { CalendarPageComponent } from './pages/calendar-page.component';
import { PlanPageComponent } from './pages/plan-page.component';
import { EnglishPageComponent } from './pages/english-page.component';
import { AchievementsPageComponent } from './pages/achievements-page.component';
import { SettingsPageComponent } from './pages/settings-page.component';
import { ResourcesPageComponent } from './pages/resources-page.component';
import { ChallengesPageComponent } from './pages/challenges-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPageComponent, title: 'Dashboard · DevQuest' },
  { path: 'hoje', component: TodayPageComponent, title: 'Hoje · DevQuest' },
  { path: 'recursos', component: ResourcesPageComponent, title: 'Recursos · DevQuest' },
  { path: 'desafios', component: ChallengesPageComponent, title: 'Desafios · DevQuest' },
  { path: 'jornada', component: JourneyPageComponent, title: 'Jornada · DevQuest' },
  { path: 'calendario', component: CalendarPageComponent, title: 'Calendário · DevQuest' },
  { path: 'plano', component: PlanPageComponent, title: 'Plano · DevQuest' },
  { path: 'ingles', component: EnglishPageComponent, title: 'Inglês · DevQuest' },
  { path: 'conquistas', component: AchievementsPageComponent, title: 'Conquistas · DevQuest' },
  { path: 'configuracoes', component: SettingsPageComponent, title: 'Configurações · DevQuest' },
  { path: '**', redirectTo: 'dashboard' }
];
