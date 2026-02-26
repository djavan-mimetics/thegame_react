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
