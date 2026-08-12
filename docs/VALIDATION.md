# Validação técnica desta entrega

Data da revisão: 12/08/2026.

## Verificado localmente

- Estrutura TypeScript do frontend e das Vercel Functions passou em uma checagem estática com stubs das dependências externas.
- O gerador do cronograma foi compilado e executado isoladamente.
- Período validado: `2026-08-12` até `2028-08-11`.
- Total: **731 dias**, **24 fases** e **1.561 missões planejadas**.
- O dia inicial gera a Fase 01 (Lógica + Java básico), inglês de 30 min e carreira de 90 min.
- `25/12/2026` e `01/01/2027` são dias de descanso no bootcamp de férias.
- O schema SQL contém tabelas, índices, RLS e triggers de perfil/updated_at.
- O cronômetro de foco é salvo no `localStorage` e limita sessões esquecidas a no máximo 12 horas.

## Compatibilidade alvo

- Angular 22.x
- TypeScript 6.0.x
- Node.js 22.22.3+
- Vercel Functions
- Supabase Postgres/Auth

## Limitação do ambiente usado para gerar o ZIP

O ambiente de geração não conseguiu baixar pacotes do registry npm e possui Node 22.16.0, abaixo do mínimo do Angular 22. Por isso não foi possível executar `npm install` + `ng build` reais aqui.

O repositório inclui GitHub Actions (`.github/workflows/ci.yml`) configurado com Node 22.22.3 para instalar as dependências e executar o build em cada push/pull request. A Vercel também fará o build no deploy.

Antes de publicar em produção, confirme que o workflow CI fica verde e execute o checklist de `docs/DEPLOY-VERCEL.md`.
