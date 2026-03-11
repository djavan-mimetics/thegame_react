## Stripe (Billing)

Bloco de env para produção (`thegame-backend.env`):

```dotenv
FRONTEND_BASE_URL=https://app.thegamebrasil.com.br
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_SEMIANNUAL=price_xxx
STRIPE_PRICE_ANNUAL=price_xxx
```

Rota de webhook para cadastrar na Stripe:

- `https://<SEU_BACKEND_PUBLICO>/v1/billing/webhook`

Passo a passo de configuração:

1. **`STRIPE_SECRET_KEY`**
	- Stripe Dashboard → Developers → API keys.
	- Use a chave `Secret key` do modo **Live** (`sk_live_...`).
2. **`STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_SEMIANNUAL` / `STRIPE_PRICE_ANNUAL`**
	- Stripe Dashboard → Product catalog → Product/Prices.
	- Copie o `Price ID` (`price_...`) de cada plano usado no app.
3. **`STRIPE_WEBHOOK_SECRET`**
	- Stripe Dashboard → Developers → Webhooks → Add endpoint.
	- Endpoint: `https://<SEU_BACKEND_PUBLICO>/v1/billing/webhook`.
	- Eventos mínimos: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`.
	- Após criar, copie o `Signing secret` (`whsec_...`).
4. **`FRONTEND_BASE_URL`**
	- URL pública do frontend para `success_url` e `cancel_url` do Checkout.
	- Exemplo: `https://app.thegamebrasil.com.br`.

Endpoints implementados:

- `POST /v1/billing/checkout`
- `GET /v1/billing/subscription`
- `GET /v1/billing/payments`
- `POST /v1/billing/cancel`
- `POST /v1/billing/webhook`

# thegame-backend

## Dev

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Auth (M1)

- `POST /v1/auth/register` `{ email, password }` → `{ accessToken, refreshToken, sessionId, user }`
- `POST /v1/auth/login` `{ email, password }` → `{ accessToken, refreshToken, sessionId, user }`
- `POST /v1/auth/refresh` `{ refreshToken }` → `{ accessToken, refreshToken }` (refresh rotaciona e estende a sessão)
- `POST /v1/auth/logout` `{ refreshToken }` → `{ ok: true }`
- `POST /v1/auth/forgot-password` `{ email }` → `{ ok: true, token? }`
	- Em dev/MVP retorna `token` na resposta; em produção deve enviar por email.
- `POST /v1/auth/reset-password` `{ token, newPassword }` → `{ ok: true }`
- `POST /v1/auth/change-password` (Bearer) `{ currentPassword, newPassword }` → `{ ok: true }`

## Perfil, Opcoes e Midia (M2/M3)

- `GET /v1/profile` (Bearer) → `{ profile }`
- `PUT /v1/profile` (Bearer) → `{ profile }`
- `GET /v1/options/all` → listas de opcoes e `locations` (com `ETag`)

Fotos de perfil (Bearer):
- `POST /v1/profile/photos/upload-url` `{ contentType, fileName? }` → `{ uploadUrl, gcsPath, publicUrl, expiresAt }`
- `POST /v1/profile/photos/complete` `{ gcsPath, publicUrl?, orderIndex, isPrimary?, width?, height? }` → `{ photo }`
- `PUT /v1/profile/photos/reorder` `{ photoIds: string[] }` → `{ ok: true }`
- `DELETE /v1/profile/photos/:photoId` → `{ ok: true }`
- `POST /v1/profile/photos/cleanup` `{ keepGcsPaths?: string[] }` → `{ ok: true }`

## Discovery, Likes, Chat e Notificacoes

- `GET /v1/feed?cursor=...&limit=...` (Bearer) → `{ profiles, nextCursor }`
- `POST /v1/swipes` (Bearer) `{ targetUserId, direction }` → `{ ok: true }`
- `GET /v1/likes` (Bearer) → `{ likes }`

- `GET /v1/chats` (Bearer) → `{ chats }`
- `GET /v1/chats/:matchId/messages` (Bearer) → `{ messages }`
- `POST /v1/chats/:matchId/messages` (Bearer) `{ text }` → mensagem criada

- `GET /v1/notifications` (Bearer) → `{ notifications }`

## Migrations

```bash
cd backend
npm run db:migrate
```
