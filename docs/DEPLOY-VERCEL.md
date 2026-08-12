# Deploy completo — Vercel + Supabase

Este guia publica o DevQuest com frontend Angular, API Node.js e Postgres/Auth.

## 1. Criar o Supabase

Você pode criar pelo próprio **Vercel → Storage → Create Database → Supabase** ou diretamente no dashboard do Supabase.

O DevQuest usa:

- Postgres
- Auth por e-mail/senha
- Row Level Security

Não precisa de Redis para funcionar.

## 2. Criar tabelas e políticas

No projeto Supabase:

1. Abra **SQL Editor**.
2. Crie uma query nova.
3. Cole todo o arquivo `supabase/migrations/001_devquest.sql`.
4. Clique em **Run**.

O script cria:

- `profiles`
- `progress_entries`
- índices
- policies RLS
- trigger para criar perfil após cadastro
- triggers de `updated_at`

## 3. Copiar credenciais públicas

No Supabase abra **Connect / API Keys** e copie:

- Project URL
- Publishable key (`sb_publishable_...`)

Você NÃO precisa colocar a Secret key/service_role no projeto.

## 4. Configurar autenticação

Em **Authentication → URL Configuration**:

### Durante desenvolvimento

Adicione, se necessário:

```text
http://localhost:4200
http://localhost:3000
```

### Depois do deploy

Site URL:

```text
https://SEU-PROJETO.vercel.app
```

Redirect URLs:

```text
https://SEU-PROJETO.vercel.app/**
```

Se usar domínio próprio, inclua também o domínio.

> Se “Confirm email” estiver habilitado, o cadastro pedirá confirmação por e-mail. Para um projeto estritamente pessoal você pode escolher manter ou desabilitar essa confirmação nas configurações de Auth.

## 5. GitHub

Na pasta do projeto:

```bash
git init
git add .
git commit -m "feat: DevQuest completo"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO.git
git push -u origin main
```

## 6. Importar na Vercel

1. Abra a Vercel.
2. **Add New → Project**.
3. Importe o repositório GitHub.
4. Framework: Angular deve ser detectado automaticamente.
5. Não altere o Root Directory.

O `vercel.json` já define Angular e o comando `npm run vercel-build`.

## 7. Environment Variables

Em **Project → Settings → Environment Variables**, configure para Production, Preview e Development:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

Valores:

```text
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Se a integração do Marketplace já criou variáveis com nomes diferentes, crie estas duas apontando para os mesmos valores.

## 8. Deploy

Faça Redeploy ou push na `main`.

Teste:

```text
https://SEU-PROJETO.vercel.app/api/health
```

Resposta esperada:

```json
{
  "ok": true,
  "service": "devquest-api",
  "database": "configured"
}
```

Depois abra a raiz do site e crie sua conta.

## 9. Instalar no iPhone

1. Abra a URL no **Safari**.
2. Toque em **Compartilhar**.
3. Toque em **Adicionar à Tela de Início**.
4. Abra pelo ícone DevQuest.

No desktop Chrome/Edge, use o botão **Instalar app** quando aparecer ou a opção de instalação da barra de endereço.

## 10. Checklist pós-deploy

- [ ] `/api/health` retorna `configured`
- [ ] criar conta funciona
- [ ] confirmar e-mail, se habilitado
- [ ] login funciona
- [ ] marcar uma missão
- [ ] atualizar a página e confirmar que o check continua
- [ ] abrir em outro dispositivo e confirmar sincronização
- [ ] editar minutos/anotação
- [ ] exportar backup JSON
- [ ] instalar PWA
- [ ] testar modo avião e marcar uma missão
- [ ] voltar a ficar online e confirmar sincronização

## Problemas comuns

### “Supabase ainda não configurado”

As variáveis não existem na Vercel ou o deployment foi criado antes delas. Adicione as variáveis e faça Redeploy.

### Cadastro funciona, mas não entra

Confira se a confirmação de e-mail está habilitada e se o e-mail foi confirmado.

### Erro 401 em `/api/progress`

A sessão expirou ou não existe. Saia e entre novamente.

### Erro de RLS / permission denied

Execute novamente `supabase/migrations/001_devquest.sql` e verifique se as tabelas estão em `public` com RLS habilitado.

### Projeto Free do Supabase demorou para responder

Projetos gratuitos podem ser pausados por inatividade. Abra o dashboard do Supabase e aguarde o projeto ficar ativo novamente.
