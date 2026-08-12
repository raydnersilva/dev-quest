export type TaskCategory = 'english' | 'career' | 'ads';
export type Track = 'backend' | 'frontend' | 'cloud' | 'architecture' | 'english' | 'ads';
export type SyncState = 'local' | 'syncing' | 'synced' | 'offline' | 'error';

export interface Phase {
  id: number;
  label: string;
  start: string;
  end: string;
  track: Track;
  topics: string[];
}

export interface DayTask {
  key: string;
  category: TaskCategory;
  label: string;
  minutes: number;
  track: Track;
}

export interface DayPlan {
  date: string;
  phase: Phase;
  mode: 'Normal' | 'Férias coletivas' | 'Descanso';
  tasks: DayTask[];
}

export interface ProgressEntry {
  date: string;
  taskKey: string;
  category: TaskCategory;
  track: Track;
  completed: boolean;
  minutes: number;
  notes: string | null;
  updatedAt: string;
  dirty?: boolean;
}

export interface UserProfile {
  displayName: string;
  avatar: string;
  dailyGoalMinutes: number;
  theme: 'dark' | 'light';
  totalXp?: number;
  level?: number;
  githubUsername?: string;
  youtubeFocusUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Achievement {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
}

export interface WeekDayStat {
  date: string;
  label: string;
  minutes: number;
  planned: number;
  percent: number;
}

export interface EnglishStage {
  period: string;
  level: string;
  title: string;
  tools: string;
  topics: string[];
  target: string;
}

export interface EnglishResource {
  name: string;
  description: string;
  url: string;
  recommendedFrom: string;
}

export interface CertificationItem {
  order: number;
  title: string;
  moment: string;
  status: 'base' | 'priority' | 'later';
  description: string;
}
