# Analise Backend e DBA do Limpae

## Arquitetura atual

- Frontend principal em React CRA na pasta `limpae`.
- Backend em Go Fiber + GORM na pasta `limpae/go`.
- Banco de dados PostgreSQL conectado por `DATABASE_URL`.
- Evolucao de schema feita via `AutoMigrate`, sem historico versionado de migrations.

## Dominios de dados identificados

- `users`: cadastro base com `cliente` ou `diarista`.
- `addresses`: enderecos e coordenadas.
- `diarists`: perfil profissional 1:1 por usuario diarista.
- `user_profiles`: preferencias do cliente.
- `services`: agendamentos e execucao operacional.
- `payments`: pagamentos por servico.
- `reviews`: avaliacao bilateral cliente/diarista.
- `subscriptions`: planos `free`, `basic`, `premium`.
- `offers` e `offer_negotiations`: mural de ofertas e contrapropostas.

## Contratos e operacao

- Login em `/login` retorna apenas `token`.
- Papel do usuario vem de `/api/users-role`.
- Grande parte das rotas administrativas reutiliza os mesmos endpoints operacionais.
- O backend carrega relacoes de forma inconsistente: algumas listas vem enriquecidas com `Preload`, outras nao.
- `reviews` tem leitura publica por `GET /reviews`, enquanto quase todo o resto depende de JWT.

## Achados criticos

1. Nao existe papel `admin` no modelo `users`.
2. Rotas sensiveis ficam protegidas apenas por autenticacao simples.
3. Schema sem migrations versionadas.
4. Regras de negocio espalhadas nos handlers.
5. Ausencia de camada dedicada de queries administrativas.

## Achados de consistencia

- `AcceptOffer` e `AcceptNegotiation` criam `service` com status `em andamento` imediatamente.
- `UpdateService` no caso `start` valida um estado e reaplica outro, indicando bug de transicao.
- `ProcessPayment` usa status `ativo`, enquanto `subscriptions` valida `active`, `inactive`, `canceled`.
- `UpdateUser` faz bind do corpo diretamente no modelo persistido.
- `GetUsers` nao faz preload de perfis, o que enfraquece telas administrativas.

## Achados DBA

- `users.role` aceita apenas `cliente` e `diarista`; falta `admin`.
- `payments.service_id` e `reviews.service_id` sao unicos, o que restringe evolucao de historico.
- Coordenadas ficam em `addresses`, mas nao foram identificados indices geoespaciais dedicados.
- `Specialties` como string serializada reduz capacidade analitica.
- Sem migrations SQL, seeds, constraints nomeadas ou estrategia explicita de auditoria.

## Recomendacoes prioritarias

1. Criar RBAC real com `admin`, middleware de autorizacao e auditoria de acoes.
2. Introduzir migrations versionadas e seeds por ambiente.
3. Expor endpoints administrativos dedicados, paginados e com filtros server-side.
4. Normalizar estados de servicos, pagamentos e assinaturas.
5. Criar trilha de auditoria para alteracoes administrativas.
6. Extrair regras de negocio para services ou use cases.
