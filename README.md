# Limpae Admin

Painel administrativo em React para operar o ecossistema do Limpae a partir dos endpoints já existentes no backend Go.

## Rodar localmente

1. Instale Node.js 20+.
2. Copie `.env.example` para `.env` se quiser sobrescrever a API.
3. Instale dependências com `npm install`.
4. Rode com `npm run dev`.

## Observações

- O backend atual não possui papel `admin` nem RBAC dedicado.
- O painel foi desenhado para ser resiliente a contratos inconsistentes do backend.
- Quando um endpoint não retorna no formato esperado, o app exibe fallback visual e informa a origem do dado.
