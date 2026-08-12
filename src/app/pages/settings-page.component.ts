import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AppStoreService } from '../services/app-store.service';
import { PwaService } from '../services/pwa.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-stack">
      <section class="hero-card glass compact-hero">
        <div><p class="eyebrow">PERFIL & CONFIGURAÇÕES</p><h1>Seu save, suas regras.</h1><p>Ajuste nome, avatar, meta diária, aparência e faça backup do seu progresso.</p></div>
        <div class="profile-preview"><span>{{ avatar }}</span><strong>{{ displayName }}</strong></div>
      </section>

      @if (message()) { <div class="notice success sticky-notice">{{ message() }}</div> }
      @if (error()) { <div class="notice error sticky-notice">{{ error() }}</div> }

      <section class="settings-grid">
        <article class="glass panel settings-card">
          <p class="eyebrow">PERFIL</p><h2>Identidade no jogo</h2>
          <label class="field-label">Nome<input class="field" [(ngModel)]="displayName" maxlength="60"></label>
          <div class="field-label">Avatar<div class="avatar-picker">@for (item of avatars; track item) { <button [class.active]="avatar===item" (click)="avatar=item">{{ item }}</button> }</div></div>
          <label class="field-label">Meta diária (minutos)<input class="field" type="number" min="15" max="600" step="15" [(ngModel)]="dailyGoalMinutes"></label>
          <label class="field-label">Aparência<select class="field" [(ngModel)]="theme"><option value="dark">Escuro</option><option value="light">Claro</option></select></label>
          <button class="btn primary" (click)="saveProfile()">Salvar perfil</button>
        </article>

        <article class="glass panel settings-card">
          <p class="eyebrow">PWA</p><h2>Instalar como aplicativo</h2>
          @if (pwa.installed()) {
            <div class="install-state">✅ DevQuest já está aberto como aplicativo instalado.</div>
          } @else if (pwa.canInstall()) {
            <p>Seu navegador permite instalar o DevQuest diretamente.</p><button class="btn primary" (click)="installPwa()">Instalar DevQuest</button>
          } @else if (pwa.isIos) {
            <div class="ios-steps"><strong>No iPhone/iPad:</strong><span>1. Abra no Safari</span><span>2. Toque em Compartilhar ⎋</span><span>3. Escolha “Adicionar à Tela de Início”</span><span>4. Abra pelo novo ícone</span></div>
          } @else {
            <p>Abra o menu do navegador e procure por “Instalar aplicativo” ou “Adicionar à tela inicial”.</p>
          }
          <p class="muted">O service worker mantém o shell do app disponível offline; o progresso também fica salvo localmente.</p>
        </article>

        <article class="glass panel settings-card">
          <p class="eyebrow">SINCRONIZAÇÃO</p><h2>Nuvem</h2>
          <div class="sync-status-card" [class]="store.syncState()"><span>{{ syncIcon() }}</span><div><strong>{{ store.syncMessage() }}</strong><small>{{ store.pendingCount() }} alteração(ões) pendente(s)</small></div></div>
          @if (auth.authenticated()) {
            <p>Conta: <strong>{{ auth.user()?.email }}</strong></p>
            <button class="btn ghost" (click)="syncNow()">Sincronizar agora</button>
            <button class="btn danger-ghost" (click)="signOut()">Sair da conta</button>
          } @else {
            <p>Você está usando o modo local. Entre em uma conta para sincronizar entre dispositivos.</p>
            <button class="btn primary" (click)="showLogin()">Entrar / criar conta</button>
          }
        </article>

        <article class="glass panel settings-card">
          <p class="eyebrow">SEGURANÇA</p><h2>Alterar senha</h2>
          @if (auth.authenticated()) {
            <label class="field-label">Nova senha<input class="field" type="password" minlength="6" [(ngModel)]="newPassword" placeholder="Mínimo 6 caracteres"></label>
            <button class="btn ghost" (click)="changePassword()">Atualizar senha</button>
          } @else { <p>Entre em uma conta para gerenciar sua senha.</p> }
        </article>

        <article class="glass panel settings-card">
          <p class="eyebrow">BACKUP</p><h2>Exportar e importar</h2>
          <p>O backup JSON inclui perfil, checklists, minutos e anotações.</p>
          <div class="button-stack"><button class="btn ghost" (click)="downloadBackup()">Baixar backup JSON</button><label class="btn ghost file-button">Importar backup<input type="file" accept="application/json,.json" (change)="importBackup($event)"></label></div>
          <hr>
          <p class="danger-copy"><strong>Zona de cuidado:</strong> apagar o progresso local remove a cópia deste aparelho. Se a nuvem estiver ativa, os dados remotos podem voltar na próxima sincronização.</p>
          <button class="btn danger" (click)="clearLocal()">Apagar progresso local</button>
        </article>

        <article class="glass panel settings-card full-span">
          <p class="eyebrow">FÉRIAS COLETIVAS</p><h2>Bootcamp de dezembro</h2>
          <p>O cronograma usa provisoriamente <strong>22/12/2026 a 02/01/2027</strong> como 12 dias de férias coletivas, com 25/12 e 01/01 reservados para descanso. Quando sua empresa confirmar as datas, altere o bloco em <code>src/app/data/study-plan.ts</code>.</p>
        </article>
      </section>
    </div>
  `
})
export class SettingsPageComponent {
  readonly avatars = ['🧑‍💻','👨‍💻','🧙‍♂️','🥷','🦸‍♂️','🤖','🚀','🧠'];
  readonly message = signal('');
  readonly error = signal('');
  displayName = '';
  avatar = '🧑‍💻';
  dailyGoalMinutes = 120;
  theme: 'dark' | 'light' = 'dark';
  newPassword = '';

  constructor(public readonly store: AppStoreService, public readonly auth: AuthService, public readonly pwa: PwaService) {
    const profile = this.store.profile();
    this.displayName = profile.displayName;
    this.avatar = profile.avatar;
    this.dailyGoalMinutes = profile.dailyGoalMinutes;
    this.theme = profile.theme;
  }

  async saveProfile(): Promise<void> {
    await this.store.updateProfile({ displayName: this.displayName, avatar: this.avatar, dailyGoalMinutes: this.dailyGoalMinutes, theme: this.theme });
    this.message.set('Perfil salvo.');
    window.setTimeout(() => this.message.set(''), 2500);
  }

  async installPwa(): Promise<void> { await this.pwa.install(); }
  async syncNow(): Promise<void> { await this.store.bootstrapRemote(true); }
  async signOut(): Promise<void> { await this.auth.signOut(); this.store.useLocalOnly(); }
  showLogin(): void { this.store.disableLocalOnly(); }

  async changePassword(): Promise<void> {
    this.error.set('');
    this.message.set('');
    if (this.newPassword.length < 6) { this.error.set('A senha precisa ter pelo menos 6 caracteres.'); return; }
    const error = await this.auth.updatePassword(this.newPassword);
    if (error) this.error.set(error); else { this.newPassword = ''; this.message.set('Senha atualizada com sucesso.'); }
  }

  downloadBackup(): void {
    const blob = new Blob([this.store.exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `devquest-backup-${new Date().toISOString().slice(0,10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  importBackup(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = this.store.importBackup(String(reader.result ?? ''));
      if (result.ok) this.message.set(result.message); else this.error.set(result.message);
      input.value = '';
    };
    reader.readAsText(file);
  }

  clearLocal(): void {
    if (!confirm('Apagar a cópia local do progresso neste aparelho?')) return;
    this.store.clearLocalProgress();
    this.message.set('Cópia local apagada.');
  }

  syncIcon(): string { return ({ local:'💾', syncing:'🔄', synced:'☁️', offline:'📴', error:'⚠️' } as const)[this.store.syncState()]; }
}
