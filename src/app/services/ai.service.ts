import { Injectable, signal } from '@angular/core';

export interface VideoSuggestion {
  title: string;
  channel: string;
  url: string;
  duration: string;
  reason: string;
}

export interface CourseSuggestion {
  title: string;
  platform: string;
  url: string;
  price: string;
  rating: string;
  reason: string;
}

export interface SuggestResponse {
  videos: VideoSuggestion[];
  courses: CourseSuggestion[];
}

export interface ChallengeResponse {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  solution: string;
  solutionExplanation: string;
}

export interface EvaluationResponse {
  correct: boolean;
  feedback: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

@Injectable({ providedIn: 'root' })
export class AiService {
  readonly suggestLoading = signal(false);
  readonly challengeLoading = signal(false);
  readonly suggestError = signal('');
  readonly challengeError = signal('');

  async suggest(topic: string, track: string, phase: number): Promise<SuggestResponse | null> {
    const cacheKey = `dq_suggest_${track}_${topic}`;
    const cached = this.getCache<SuggestResponse>(cacheKey);
    if (cached) return cached;

    this.suggestLoading.set(true);
    this.suggestError.set('');

    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, track, phase })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erro na API' })) as { error?: string };
        throw new Error(payload.error ?? `HTTP ${response.status}`);
      }

      const data = await response.json() as SuggestResponse;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      this.suggestError.set(error instanceof Error ? error.message : 'Erro ao buscar sugestões.');
      return null;
    } finally {
      this.suggestLoading.set(false);
    }
  }

  async challenge(topic: string, track: string, difficulty: 'easy' | 'medium' | 'hard', language?: string): Promise<ChallengeResponse | null> {
    this.challengeLoading.set(true);
    this.challengeError.set('');

    try {
      const response = await fetch('/api/ai/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, track, difficulty, language })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erro na API' })) as { error?: string };
        throw new Error(payload.error ?? `HTTP ${response.status}`);
      }

      const data = await response.json() as ChallengeResponse;

      // Save to history
      const history = this.getChallengeHistory();
      history.unshift({ ...data, generatedAt: new Date().toISOString(), topic });
      if (history.length > 20) history.length = 20;
      this.setChallengeHistory(history);

      return data as ChallengeResponse;
    } catch (e: any) {
      this.challengeError.set('Erro ao carregar desafio. Tente novamente mais tarde.');
      return null;
    } finally {
      this.challengeLoading.set(false);
    }
  }

  async evaluateCode(title: string, description: string, language: string, userCode: string): Promise<EvaluationResponse | null> {
    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, language, userCode })
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json() as EvaluationResponse;
    } catch (e: any) {
      console.error('Failed to evaluate code:', e);
      return null;
    }
  }

  getChallengeHistory(): (ChallengeResponse & { generatedAt: string; topic: string })[] {
    try {
      const raw = localStorage.getItem('dq_challenge_history');
      return raw ? JSON.parse(raw) as Array<ChallengeResponse & { generatedAt: string; topic: string }> : [];
    } catch {
      return [];
    }
  }

  private setChallengeHistory(history: Array<ChallengeResponse & { generatedAt: string; topic: string }>): void {
    try {
      localStorage.setItem('dq_challenge_history', JSON.stringify(history));
    } catch { /* storage full */ }
  }

  private getCache<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() - entry.timestamp > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  }

  private setCache<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch { /* storage full */ }
  }
}
