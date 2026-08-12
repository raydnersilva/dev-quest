import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly auth: AuthService) {}

  async get<T>(url: string): Promise<T> { return this.request<T>(url, { method: 'GET' }); }
  async post<T>(url: string, body: unknown): Promise<T> { return this.request<T>(url, { method: 'POST', body: JSON.stringify(body) }); }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const token = this.auth.accessToken();
    if (!token) throw new Error('AUTH_REQUIRED');
    const response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) }
    });
    if (response.status === 401) throw new Error('AUTH_REQUIRED');
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Falha na API.' })) as { error?: string };
      throw new Error(payload.error ?? `HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}
