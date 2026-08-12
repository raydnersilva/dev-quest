import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="auth-shell">
      <section class="auth-hero">
        <div class="auth-orbit orbit-a"></div>
        <div class="auth-orbit orbit-b"></div>
        <div class="auth-copy">
          <div class="brand-lockup"><span class="brand-mark">DQ</span><div><strong>DevQuest</strong><small>Rumo ao Especialista</small></div></div>
          <div class="hero-avatar">🧑‍💻</div>
          <p class="eyebrow">24 MESES · UMA JORNADA</p>
          <h1>Seu estudo deixa de ser uma lista e vira uma <span>aventura.</span></h1>
          <p class="auth-description">Java Backend, JavaScript, TypeScript, Angular, Spring, AWS, Azure e inglês técnico em um mapa diário com XP, streak e conquistas.</p>
          <div class="auth-mini-road"><span>🌱</span><i></i><span>☕</span><i></i><span>🅰️</span><i></i><span>☁️</span><i></i><span>🏆</span></div>
        </div>
      </section>

      <section class="auth-panel">
        <div class="auth-card glass">
          @if (!auth.configured()) {
            <div class="setup-badge">MODO LOCAL DISPONÍVEL</div>
            <h2>Comece agora.</h2>
            <p>A nuvem ainda não está configurada. O DevQuest funciona localmente e você pode ligar o Supabase depois sem perder seu progresso.</p>
            @if (auth.initError()) { <div class="notice warning">{{ auth.initError() }}</div> }
            <button class="btn primary wide" (click)="offline.emit()">Continuar neste dispositivo</button>
            <div class="auth-tip">Depois do deploy, configure <code>SUPABASE_URL</code> e <code>SUPABASE_PUBLISHABLE_KEY</code> na Vercel.</div>
          } @else {
            <div class="auth-tabs">
              <button [class.active]="mode()==='login'" (click)="changeMode('login')">Entrar</button>
              <button [class.active]="mode()==='register'" (click)="changeMode('register')">Criar conta</button>
            </div>

            @if (message()) { <div class="notice success">{{ message() }}</div> }
            @if (error()) { <div class="notice error">{{ error() }}</div> }

            @if (mode()==='reset') {
              <p class="eyebrow">RECUPERAR ACESSO</p>
              <h2>Redefinir senha</h2>
              <p>Informe seu e-mail. O Supabase enviará o link de recuperação.</p>
              <label class="field-label">E-mail<input class="field" type="email" [(ngModel)]="email" autocomplete="email" placeholder="voce@email.com"></label>
              <button class="btn primary wide" [disabled]="auth.loading()" (click)="resetPassword()">Enviar link</button>
              <button class="text-button" (click)="changeMode('login')">Voltar para entrar</button>
            } @else {
              <p class="eyebrow">{{ mode()==='login' ? 'BEM-VINDO DE VOLTA' : 'CRIE SEU SAVE NA NUVEM' }}</p>
              <h2>{{ mode()==='login' ? 'Continue sua jornada.' : 'Comece sua jornada.' }}</h2>
              <p>{{ mode()==='login' ? 'Seu progresso será sincronizado entre iPhone e computador.' : 'A conta gratuita do Supabase é suficiente para um projeto pessoal como este.' }}</p>

              @if (mode()==='register') {
                <label class="field-label">Seu nome<input class="field" [(ngModel)]="displayName" autocomplete="name" placeholder="Como quer aparecer no app?"></label>
              }
              <label class="field-label">E-mail<input class="field" type="email" [(ngModel)]="email" autocomplete="email" placeholder="voce@email.com"></label>
              <label class="field-label">Senha<input class="field" type="password" [(ngModel)]="password" [autocomplete]="mode()==='login' ? 'current-password' : 'new-password'" placeholder="Mínimo 6 caracteres" (keyup.enter)="submit()"></label>
              <button class="btn primary wide" [disabled]="auth.loading()" (click)="submit()">{{ auth.loading() ? 'Carregando…' : mode()==='login' ? 'Entrar e sincronizar' : 'Criar minha conta' }}</button>
              @if (mode()==='login') { <button class="text-button" (click)="changeMode('reset')">Esqueci minha senha</button> }
              <div class="divider"><span>ou</span></div>
              <button class="btn ghost wide" (click)="offline.emit()">Usar somente neste dispositivo</button>
            }
          }
        </div>
      </section>
    </main>
  `
})
export class AuthPageComponent {
  @Output() readonly offline = new EventEmitter<void>();
  readonly mode = signal<'login' | 'register' | 'reset'>('login');
  readonly error = signal('');
  readonly message = signal('');
  email = '';
  password = '';
  displayName = '';

  constructor(public readonly auth: AuthService) {}

  changeMode(mode: 'login' | 'register' | 'reset'): void {
    this.mode.set(mode);
    this.error.set('');
    this.message.set('');
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.message.set('');
    if (!this.email.includes('@')) { this.error.set('Informe um e-mail válido.'); return; }
    if (this.password.length < 6) { this.error.set('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (this.mode() === 'register') {
      if (!this.displayName.trim()) { this.error.set('Informe seu nome.'); return; }
      const result = await this.auth.signUp(this.email.trim(), this.password, this.displayName.trim());
      if (result.error) this.error.set(result.error);
      else if (result.needsConfirmation) this.message.set('Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre no DevQuest.');
    } else {
      const error = await this.auth.signIn(this.email.trim(), this.password);
      if (error) this.error.set(error);
    }
  }

  async resetPassword(): Promise<void> {
    this.error.set('');
    this.message.set('');
    if (!this.email.includes('@')) { this.error.set('Informe um e-mail válido.'); return; }
    const error = await this.auth.sendReset(this.email.trim());
    if (error) this.error.set(error);
    else this.message.set('Link enviado. Verifique sua caixa de entrada e o spam.');
  }
}
