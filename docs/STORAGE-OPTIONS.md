# Storage/Database da Vercel: o que escolher para o DevQuest

Atualizado em 12/08/2026.

A tela **Vercel → Storage / Marketplace Database Providers** reúne integrações com provedores. A conexão é feita pela Vercel e as variáveis podem ser injetadas no projeto, mas limites e cobrança pertencem ao plano do provedor escolhido.

## Supabase — escolhido para o DevQuest

**Tipo:** Postgres + Auth + RLS + Storage + Realtime.

**Plano Free em 12/08/2026:**

- $0/mês
- 500 MB de banco por projeto
- 50.000 MAU no Auth
- 1 GB de File Storage
- 5 GB de egress + 5 GB cached egress
- 200 conexões Realtime simultâneas
- 2 milhões de mensagens Realtime/mês
- máximo de 2 projetos Free ativos
- projeto Free pode pausar após 1 semana de inatividade

Para este app pessoal, é a opção mais simples porque banco e autenticação ficam juntos.

Oficial: https://supabase.com/pricing
Vercel Marketplace: https://vercel.com/marketplace/supabase

## Neon

**Tipo:** Serverless Postgres.

Existe plano **Free $0**. Em 12/08/2026, o plano gratuito informa 100 CU-hours de compute por projeto/mês e scale-to-zero quando o banco fica ocioso.

É excelente se você quiser somente Postgres e preferir um Auth separado.

Oficial: https://neon.com/pricing

## Upstash Redis

**Tipo:** Redis serverless / cache / rate-limit / filas.

Plano Free em 12/08/2026:

- 256 MB de dados
- 500 mil comandos/mês
- 10 GB de bandwidth
- 1 database Free

Não é necessário para a primeira versão do DevQuest. Pode ser adicionado no futuro para cache, ranking ou rate limiting.

Oficial: https://upstash.com/pricing/redis
Vercel Marketplace: https://vercel.com/marketplace/upstash/upstash-kv

## Redis oficial para Vercel

Também possui opção **Free**. A Redis informa atualmente um banco gratuito de até **30 MB**. É ótimo para cache/sessões/rate-limit, mas eu não o usaria como banco relacional principal deste projeto.

Oficial: https://redis.io/pricing/
Vercel Marketplace: https://vercel.com/marketplace/redis

## Escolha final

```text
AGORA
Angular PWA
   ↓
Vercel
   ├── frontend Angular
   └── /api Node.js Functions
              ↓
       Supabase Free
       ├── Auth
       ├── Postgres
       └── RLS

FUTURO (somente se necessário)
   ├── Upstash/Redis → cache, ranking, rate-limit
   └── Supabase Storage/Vercel Blob → fotos/arquivos
```

Para o uso pessoal esperado, não há motivo técnico para adicionar Redis no início.
