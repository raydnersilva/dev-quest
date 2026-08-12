import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Injectable({ providedIn: 'root' })
export class PwaService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  readonly canInstall = signal(false);
  readonly installed = signal(false);
  readonly isIos = /iphone|ipad|ipod/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');

  constructor() {
    if (typeof window === 'undefined') return;
    this.installed.set(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.installed.set(true);
      this.canInstall.set(false);
      this.deferredPrompt = null;
    });
  }

  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    await this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    if (result.outcome === 'accepted') this.canInstall.set(false);
    return result.outcome === 'accepted';
  }
}
