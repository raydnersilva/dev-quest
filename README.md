# DevQuest — Rumo ao Especialista 🚀

PWA gamificada em **Angular 22+** com backend **Node.js em Vercel Functions** e **Supabase (Postgres + Auth)**. O projeto transforma um cronograma de 24 meses em uma jornada diária rumo a:

- ☕ Especialização em Java Backend
- 🅰️ Frontend forte com JavaScript, TypeScript e Angular
- ☁️ Cloud/DevOps com AWS, Kubernetes, Terraform e Azure
- 🇺🇸 Inglês do zero até entrevista e conversação técnica

## O que está implementado

### Aplicação

- Dashboard com XP, nível, streak, horas, conquistas e gráfico semanal
- Checklist diário baseado no plano de 12/08/2026 a 11/08/2028
- Registro de minutos reais e anotações por missão
- Cronômetro de foco por missão, persistente mesmo ao recarregar a página
- Avatar que avança conforme o progresso real
- Jornada gamificada com 24 checkpoints
- Calendário mensal com dias pendentes, parciais e completos
- Plano completo de 24 fases e tópicos
- Trilha de certificações
- Área de inglês do A0 ao B2, recursos gratuitos e laboratório de frases técnicas
- Sistema de conquistas
- Perfil com avatar, tema e meta diária
- Backup/importação JSON
- Modo local/offline e sincronização posterior
- PWA instalável no iOS/desktop
- Tema escuro e claro

### Backend / segurança

- Supabase Auth com e-mail e senha
- Recuperação e alteração de senha
- Node.js/Vercel Functions em `/api`
- Supabase Postgres
- Row Level Security: cada usuário acessa somente os próprios dados
- Sincronização local → nuvem quando a conexão volta
- Nenhuma `service_role`/secret key é enviada ao navegador

## Stack

```text
Angular 22+
  ├─ Signals
  ├─ Standalone Components
  ├─ Router
  └─ Angular Service Worker / PWA

Vercel
  ├─ Frontend Angular
  └─ Node.js Functions (/api)

Supabase
  ├─ Postgres
  ├─ Auth
  └─ Row Level Security
```

## Rodar localmente

### 1. Pré-requisitos

- Node.js **22.22.3+** (Angular 22 exige essa faixa)
- npm 10+
- Projeto Supabase gratuito

### 2. Instalar

```bash
npm install
```

### 3. Criar o banco

No Supabase, abra **SQL Editor**, copie o conteúdo de:

```text
supabase/migrations/001_devquest.sql
```

e execute.

### 4. Variáveis

Para testar as Functions localmente com Vercel CLI, copie:

```bash
cp .env.example .env.local
```

Preencha:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

> Em projetos antigos, `SUPABASE_ANON_KEY` também é aceito pelo código como fallback.

### 5. Executar

Para frontend somente:

```bash
npm start
```

Para testar frontend + `/api` exatamente como na Vercel, instale a Vercel CLI e use:

```bash
npx vercel dev
```

## Deploy

Veja o guia completo em:

```text
docs/DEPLOY-VERCEL.md
```

Resumo:

1. Crie o projeto Supabase.
2. Rode `supabase/migrations/001_devquest.sql`.
3. Configure Auth URL/Redirect URLs no Supabase.
4. Publique este repositório no GitHub.
5. Importe no Vercel.
6. Adicione `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`.
7. Deploy.
8. No iPhone: Safari → Compartilhar → **Adicionar à Tela de Início**.

## Estrutura

```text
.
├── api/                         # Backend Node.js / Vercel Functions
│   ├── _lib/
│   ├── config.ts
│   ├── health.ts
│   ├── profile.ts
│   └── progress.ts
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── app.routes.ts
│   │   └── app.component.ts
│   ├── assets/icons/
│   ├── manifest.webmanifest
│   └── styles.css
├── supabase/migrations/
├── docs/
├── ngsw-config.json
└── vercel.json
```

## Dados offline

O progresso é salvo imediatamente no `localStorage`. Quando existe sessão Supabase:

1. o check é aplicado localmente;
2. a entrada fica marcada como pendente;
3. o app envia um lote para `/api/progress`;
4. se estiver offline, o lote fica pendente;
5. no evento `online`, a sincronização é tentada novamente.

Isso evita perder um check só porque a internet caiu.

## Plano de estudos

O plano está em:

```text
src/app/data/study-plan.ts
```

A planilha original que originou o app está em:

```text
docs/cronograma-original.xlsx
```

As férias coletivas estão provisoriamente configuradas de **22/12/2026 a 02/01/2027**. Ajuste quando a empresa confirmar as datas.

## Observação sobre custos

O projeto foi desenhado para uso pessoal no **Vercel Hobby + Supabase Free**. Limites e planos podem mudar; confira os painéis dos provedores antes de uso comercial ou de abrir o app para muitos usuários.
