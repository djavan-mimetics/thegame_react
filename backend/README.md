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

## Migrations

```bash
cd backend
npm run db:migrate
```
