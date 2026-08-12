import { Injectable, effect } from '@angular/core';
import { AppStoreService } from './app-store.service';
import { ProgressEntry } from '../models';

@Injectable({ providedIn: 'root' })
export class GithubIntegrationService {
  private lastCheck = 0;

  constructor(private store: AppStoreService) {
    // Run sync when github username changes or on boot
    effect(() => {
      const username = this.store.profile().githubUsername;
      if (username) {
        this.syncGithubActivity(username);
      }
    });

    // Check periodically if tab is left open (every 4 hours)
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        const username = this.store.profile().githubUsername;
        if (username) this.syncGithubActivity(username);
      }, 4 * 60 * 60 * 1000);
    }
  }

  async syncGithubActivity(username: string): Promise<void> {
    // Throttle to prevent API rate limits (max once every 5 minutes)
    if (Date.now() - this.lastCheck < 5 * 60 * 1000) return;
    this.lastCheck = Date.now();

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public`);
      if (!res.ok) return; // Ignore errors like 404 or rate limit

      const events = await res.json() as any[];
      const today = this.todayIso();
      
      const hasTodayCodeActivity = events.some(ev => 
        (ev.type === 'PushEvent' || ev.type === 'PullRequestEvent') &&
        ev.created_at && ev.created_at.startsWith(today)
      );

      if (hasTodayCodeActivity) {
        const taskKey = 'github-auto';
        const existing = this.store.entry(today, taskKey);
        
        if (!existing || !existing.completed) {
          // Grant XP for github contribution
          // This uses saveTaskDetails logic directly via saveEntry (needs to be exposed or we can toggle it)
          // Since saveTaskDetails is public but requires DayTask, let's build a mock DayTask
          const mockTask = {
            key: taskKey,
            category: 'career' as const,
            label: 'Contribuição no GitHub',
            minutes: 60,
            track: 'backend' as const
          };
          
          await this.store.saveTaskDetails(today, mockTask, 60, 'XP automático do GitHub (' + username + ')');
        }
      }
    } catch (e) {
      console.error('Github Sync Error:', e);
    }
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
