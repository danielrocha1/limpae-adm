# Limpae Admin

Painel administrativo em React + Vite para consumir o backend Go existente da Limpae.

## Stack

- React + Vite
- TailwindCSS
- Componentes locais no estilo shadcn/ui
- React Query
- React Router
- Axios

## Scripts

```bash
npm install
npm run dev
npm run build
```

Antes de `dev` e `build`, o script `npm run generate:schema` le automaticamente os arquivos `.go` dentro de `go/`, identifica structs e gera `src/generated/modelSchema.js`. As tabelas, telas de detalhe e formularios de usuarios usam esse schema, principalmente o model `User`.

## API

Configure a origem da API em `.env`:

```bash
VITE_API_URL=https://sua-api.com
```

O painel consome os endpoints REST:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

## Autenticacao

A autenticacao de admin e simulada no frontend. Use qualquer email/senha no login de demonstracao; o painel salva um token mock em `localStorage` para habilitar as rotas protegidas.
