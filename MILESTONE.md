# The Game — Milestones (Backend, DB, Mobile e Publicação)

Este documento transforma o que o frontend já pressupõe (telas/fluxos atuais) em entregas de backend + base de dados, com boas práticas, desempenho e um caminho até publicação em Android/iOS.

## 1) Escopo funcional (derivado do frontend)

Telas/fluxos existentes:
- Autenticação: `Welcome`, `Login` (Google/Facebook/Email), `Register` (wizard), `ForgotPassword`
- Descoberta: `Home` (feed de perfis, carrossel de fotos, expand/collapse, swipe: dislike/neutral/like/superlike, “vibe/tag do dia”)
- Curtidas: `Likes` (lista, bloqueada/blur quando não Premium)
- Chat: `Chat` (lista + detalhe, envio de mensagens, elogio rápido, galeria de fotos do perfil, ação “Denunciar” dentro do chat)
- Perfil: `Profile`, `EditProfile` (fotos com editor/crop 9:16, bio, cidade/UF, gênero, “tenho interesse em”, tags/interesses (até 3), sliders idade/distância e toggles)
- Ranking: `Ranking` (ranking por cidade/UF)
- Premium/Pagamentos: `Premium` (planos, checkout), `PaymentHistory`
- Notificações: `Notifications`
- Segurança/Conteúdo legal: `Security`, `ChangePassword`, `Terms`, `Privacy`, `About`, `Help`
- Denúncias: `Report`, `ReportList`, `ReportDetail`

## 2) Arquitetura recomendada (MVP robusto)

**Backend**
- Node.js + TypeScript (recomendado pelo alinhamento com o front)
- Framework: Fastify ou NestJS
- API: REST (JSON) + WebSocket (chat em tempo real)

**Dados**
- PostgreSQL + PostGIS (lat/lng + consultas por raio/distância)
- Redis: cache/ratelimit/filas leves
- Storage de imagens: S3 compatível (MinIO/S3) + CDN

**Observabilidade/Operação**
- Logs estruturados + request-id
- Métricas (latência, erro, fila) + tracing opcional

## 3) Contratos de API (MVP)

### 3.1 Auth
- `POST /v1/auth/register` (email/senha)
- `POST /v1/auth/login` (email/senha)
- `POST /v1/auth/oauth/google` (token → sessão)
- `POST /v1/auth/oauth/facebook` (token → sessão)
- `POST /v1/auth/logout`
- `POST /v1/auth/forgot-password` (email)
- `POST /v1/auth/reset-password` (token, nova senha)
- `POST /v1/auth/change-password` (senha atual, nova senha)

Sessão:
- JWT curto + refresh token (rotacionável) **ou** sessão server-side (cookie httpOnly)

### 3.2 Perfil
- `GET /v1/me`
- `PATCH /v1/me` (nome, bio, cidade/UF, gênero, lookingFor, preferências)
- `PUT /v1/me/location` `{ lat, lng, city?, state?, accuracyM? }`
- `POST /v1/me/photos` (upload → URL + ordem)
- `PUT /v1/me/photos/:photoId` (reordenar/definir principal)
- `DELETE /v1/me/photos/:photoId`
- `PUT /v1/me/interests` (até 3 tags)
- `PUT /v1/me/vibe` (tag ativa/dia)

Campos detalhados que o UI de `EditProfile` já sugere (mesmo que hoje estejam locais no front):
- intenção, relacionamento, signo, formação, família, pets, bebida, fumo, exercícios, alimentação, sono, comunicação, linguagem do amor, personalidade, pronomes, altura
- toggles: smart photos (reordenação automática), ocultar idade (Premium)

### 3.3 Descoberta / Swipes
- `GET /v1/discovery/feed?cursor=...` (perfis paginados + fotos + campos necessários)
  - filtrar por distância usando PostGIS + `max_distance_km` do usuário (ou override por query)
- `POST /v1/swipes` `{ targetUserId, type: like|dislike|neutral|superlike }`
  - resposta pode indicar `matchCreated: boolean` e `matchId`

Regras típicas:
- limitar swipes diários (não Premium)
- superlikes diários (Premium)

### 3.4 Curtidas / Matches
- `GET /v1/likes/received` (quem curtiu você; se não Premium retorna oculto/contagem)
- `GET /v1/matches` (lista)

### 3.5 Chat
- `GET /v1/chats` (previews)
- `GET /v1/chats/:chatId/messages?cursor=...`
- `POST /v1/chats/:chatId/messages` `{ text, clientId }`
- WebSocket: `ws /v1/chat` (eventos: message.new, message.read, typing opcional)

### 3.6 Notificações
- `GET /v1/notifications?cursor=...`
- `POST /v1/notifications/:id/seen`

### 3.7 Denúncias / Segurança
- `POST /v1/reports` (contra usuário + motivo + descrição + data)
- `GET /v1/reports` (meus tickets)
- `GET /v1/reports/:id` (detalhe + updates)
- (backoffice/admin) endpoints separados para triagem/moderação

### 3.8 Ranking
- `GET /v1/ranking?city=...&state=...&cursor=...`
- `GET /v1/ranking/nearby?lat=...&lng=...&radiusKm=...&cursor=...` (opcional, baseado em geo real)

### 3.9 Premium / Pagamentos
- `POST /v1/billing/checkout` (plano, recorrência) — Stripe Checkout/PaymentIntent
- `POST /v1/billing/webhook` (gateway)
- `GET /v1/billing/payments` (histórico)
- `GET /v1/billing/subscription`
- `POST /v1/billing/cancel`

Observação (mobile): para assinaturas digitais dentro do app, é comum as lojas exigirem IAP. Se a escolha for **Stripe** mesmo no mobile, planejar o fluxo (ex: compra fora do app via web + login no app) e validar impacto de políticas antes de publicar.

## 4) Modelo de dados (PostgreSQL)

### 4.1 Entidades principais
- `users` (id, email, password_hash?, status, created_at)
- `user_identities` (user_id, provider: email|google|facebook, provider_subject, created_at)
- `sessions` (id, user_id, refresh_token_hash, expires_at, created_at, revoked_at)

- `profiles` (user_id PK, name, birth_date, city, state, gender, bio, ranking_enabled, location GEOGRAPHY(Point, 4326), location_updated_at, created_at, updated_at)
- `profile_preferences` (user_id PK, looking_for[], min_age, max_age, max_distance_km, expand_distance, expand_age, …)
- `profile_details` (user_id PK, intention, relationship, sign, education, family, pets, drink, smoke, exercise, food, sleep, communication, love_language, personality, pronouns, height, smart_photos_enabled, hide_age)
- `profile_photos` (id, user_id, url, sort_order, is_primary, created_at)
- `tags` (id, name UNIQUE) — seed com `TAGS_LIST`
- `profile_interests` (user_id, tag_id, created_at) — **constraint:** max 3 por user
- `profile_vibes` (user_id, tag_id, active_date) — 1 por dia (ou “current_vibe”)

- `swipes` (id, from_user_id, to_user_id, type, created_at) — UNIQUE(from,to)
- `matches` (id, user_a_id, user_b_id, created_at) — UNIQUE(LEAST(a,b), GREATEST(a,b))

- `chats` (id, match_id UNIQUE, created_at)
- `messages` (id, chat_id, sender_user_id, text, created_at)
- `message_receipts` (message_id, user_id, seen_at)

- `notifications` (id, user_id, type, title, description, payload_json, created_at, seen_at)

- `reports` (id, reporter_user_id, offender_user_id, occurred_at_date, reason, description, status, created_at)
- `report_updates` (id, report_id, sender: user|support, text, created_at)

- `subscriptions` (id, user_id, provider, plan, status, renews_at, created_at)
- `payments` (id, user_id, provider, amount, currency, status, card_last4?, raw_json, created_at)

### 4.2 Índices (essenciais)
- `profiles (state, city)` para ranking/feeds por região
- `profiles (location)` com `GIST(location)` para feed por raio/distância
- `profile_photos (user_id, sort_order)`
- `swipes (from_user_id, created_at)` e `swipes (to_user_id, created_at)`
- `matches (user_a_id)` e `matches (user_b_id)`
- `messages (chat_id, created_at)`
- `notifications (user_id, created_at)`
- `reports (reporter_user_id, created_at)` e `reports (offender_user_id, created_at)`

Geo (decidido):
- `profiles.location GEOGRAPHY(Point, 4326)` + `GIST(location)`

## 5) Boas práticas (segurança e qualidade)

- Senhas: Argon2id (ou bcrypt com cost alto), nunca logar credenciais
- OAuth: validar tokens do provedor, anti-replay, binding em `user_identities`
- Upload de imagem: vírus/scan opcional, limites (tamanho/dimensões), URLs assinadas
- Rate limit: login/forgot-password/swipes/messages
- Auditoria: trilha mínima de ações sensíveis (senha, login, denúncias)
- Moderação: pipeline de denúncia, bloqueio e banimento (status no `users`)
- Privacidade: minimização de dados, retenção de logs, export/erase (LGPD)

## 6) Desempenho (Android/iOS)

- Payloads enxutos: endpoints específicos para listas (chat preview, feed cards)
- Paginação cursor-based em feed/chat/notificações
- Imagens: gerar thumbnails (ex: 400x600, 200x300) + CDN + cache-control
- Chat: WebSocket + ack/receipts; fallback HTTP
- Cache: Redis para ranking/feeds quentes e contagens
- Banco: índices focados em acessos reais (feed, chat, likes recebidas)
- Geo: usar queries por raio com PostGIS, paginação por cursor e limites rígidos (ex: `LIMIT 20`) para manter latência estável

## 7) Roadmap de implementação (milestones) — checklist + smoketests

### Status atual (já executado neste repositório — frontend/ops)
- [x] `systemd` user-mode + timer de monitoramento + scripts de restart em `ops/`
- [x] `npm run start` para produção via `vite preview --host 0.0.0.0 --port 3000`
- [x] Remoção de referências a `GEMINI_API_KEY`
- [x] Cache-busting de logos com `__APP_BUILD_ID__`
- [x] Correção do erro `/index.css` (remoção do link no HTML + fallback `public/index.css`)
- [x] Correção do editor/crop de foto em `screens/EditProfile.tsx` e centralização de modais (sem blur no overlay do EditProfile)

### M0 — Fundação (1 semana)
- [x] Criar repositório do backend + CI básico (lint/test/build)
- [x] Config (env), migrations, healthcheck, logging estruturado, CORS, auth middleware
- [x] Postgres + PostGIS (dev/prod) e migração inicial

Smoketests (M0)
- [x] `GET /health` retorna 200
- [ ] Migrações sobem do zero em ambiente limpo

### M1 — Auth & Conta (1–2 semanas)
- [x] Email/senha + sessões (access + refresh / ou cookie httpOnly)
- [ ] OAuth Google/Facebook (criar/vincular `user_identities`)
- [x] Forgot/reset/change password

Smoketests (M1)
- [ ] Registrar e logar com email/senha
- [ ] Fluxo `forgot-password` gera token e `reset-password` troca senha
- [ ] Login OAuth cria usuário e inicia sessão

### M2 — Perfil & Fotos (1–2 semanas)
- [ ] `GET/PATCH /v1/me` + `profile_details`
- [ ] `PUT /v1/me/location` (lat/lng) + grava `profiles.location`
- [ ] Preferências: idade/distância/lookingFor + interests (max 3) + vibe
- [ ] Upload/reorder/delete de fotos (S3 + URLs assinadas)

Smoketests (M2)
- [ ] Atualizar perfil e recuperar via `GET /v1/me`
- [ ] Enviar foto e receber URL servível (CDN/storage)
- [ ] Atualizar localização e validar que `location_updated_at` muda

### M3 — Descoberta & Swipes (1–2 semanas)
- [ ] Feed paginado + regras de elegibilidade
- [ ] Filtro por distância com PostGIS (raio/`max_distance_km`)
- [ ] Swipe API + criação de match
- [ ] Limites free vs premium (swipes/superlikes)

Smoketests (M3)
- [ ] `GET /v1/discovery/feed` retorna perfis a <= raio configurado
- [ ] `POST /v1/swipes` cria match quando há like recíproco

### M4 — Matches & Chat (1–2 semanas)
- [ ] Lista de matches/chats (previews)
- [ ] Mensagens paginadas
- [ ] Envio de mensagens (HTTP) + WebSocket (tempo real)

Smoketests (M4)
- [ ] Criar conversa a partir de match e enviar mensagem
- [ ] WebSocket entrega `message.new` para o outro usuário

### M5 — Notificações (1 semana)
- [ ] Gerar notificações (match, message, system)
- [ ] Marcar como visto

Smoketests (M5)
- [ ] Mensagem nova gera notificação para o destinatário
- [ ] `POST /v1/notifications/:id/seen` marca `seen_at`

### M6 — Denúncias & Moderação (1 semana)
- [ ] Criar/listar/detalhar tickets
- [ ] Fluxo mínimo de updates do suporte
- [ ] Controles mínimos: status de usuário (ativo/suspenso/banido) e trilha de auditoria mínima

Smoketests (M6)
- [ ] `POST /v1/reports` cria ticket e aparece em `GET /v1/reports`
- [ ] `GET /v1/reports/:id` retorna updates

### M7 — Premium & Pagamentos (2–3 semanas)
- [ ] Integração Stripe (Checkout/PaymentIntent) + webhooks
- [ ] Subscrição e histórico de pagamentos
- [ ] Sincronização de status Premium no backend (source of truth)
- [ ] Fluxo Stripe no mobile (ex: compra via web + app lê status do backend)

Smoketests (M7)
- [ ] Webhook Stripe atualiza `subscriptions.status`
- [ ] `GET /v1/billing/subscription` reflete o estado após pagamento

### M8 — Ranking (1 semana)
- [ ] Ranking por cidade/UF
- [ ] (Opcional) `ranking/nearby` por raio com PostGIS

Smoketests (M8)
- [ ] `GET /v1/ranking` retorna lista ordenada
- [ ] `GET /v1/ranking/nearby` respeita raio

### M9 — Preparação Mobile & Publicação (2–4 semanas)
Opção escolhida: **React Native**.
- [ ] App React Native consumindo a mesma API (`/v1/*`) + WebSocket do chat
- [ ] Autenticação (email + OAuth) com deep links e armazenamento seguro de tokens
- [ ] Push notifications (FCM/APNs) se necessário
- [ ] Crash reporting + analytics
- [ ] Store listing, políticas (privacidade/termos), screenshots, revisão

Smoketests (M9)
- [ ] Login/logout + navegação base sem crashes (Android/iOS)
- [ ] Chat envia/recebe mensagem em dispositivo real
- [ ] Feed carrega e pagina em rede móvel

Checklist de publicação
- [ ] Política de Privacidade + Termos (já existem telas; publicar URLs)
- [ ] Identificadores, ícones, screenshots e faixa etária
- [ ] Para Premium: fluxo escolhido **Stripe** (validar impacto de políticas de assinatura no iOS/Android)

## 8) Decisões finais (fechadas)

1) Geo: lat/lng + PostGIS
2) Mobile: React Native
3) Pagamentos: Stripe
