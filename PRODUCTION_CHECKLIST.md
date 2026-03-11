# The Game — Checkup de Produção

## 1) Fluxos validados agora

- ✅ Criação de conta por email/senha (`/v1/auth/register`)
- ✅ Login por email/senha (`/v1/auth/login`)
- ✅ Verificação de email + reset de senha por fluxo real
- ✅ Forgot password end-to-end (`/v1/auth/forgot-password` → `/v1/auth/reset-password` → login com nova senha)
- ✅ Feed/likes/chat/notifications com persistência em banco
- ✅ Notificações automáticas de domínio para match e message
- ✅ Notificações automáticas do tipo system (boas-vindas, email confirmado e denúncia recebida)
- ✅ Upload de fotos com signed URL GCS (`/v1/profile/photos/upload-url`) em ambiente de deploy
- ✅ Ranking via backend (`/v1/ranking`) integrado no frontend
- ✅ Denúncias persistidas via backend (`POST /v1/reports`, `GET /v1/reports`, `GET /v1/reports/:id`)
- ✅ Exclusão de conta autenticada
- ✅ Rate limit em auth/swipes/chat + auditoria mínima persistida

## 2) Seeds aplicados

Perfis demo adicionais (1 foto por perfil, dados coerentes de idade/gênero/interesses):
- `seed.rafael@thegame.local`
- `seed.bruna@thegame.local`
- `seed.lucas@thegame.local`
- `seed.camila@thegame.local`
- `seed.gabriel@thegame.local`
- `seed.isabela@thegame.local`

Status atual no banco:
- `SEED_USERS = 6`
- `SEED_PROFILES = 6`
- `SEED_PHOTOS = 6`

## 3) Checkup de telas (persistência real)

### Operacionais com backend persistente
- Login
- Register
- ForgotPassword
- Home
- Likes
- Chat
- Notifications
- EditProfile
- Ranking
- ChangePassword
- Report
- ReportList
- ReportDetail

### Dependem de backend para operar plenamente
- Premium: billing Stripe implementado; falta configurar chaves/preços no env para checkout real
- PaymentHistory: integrado ao endpoint real (`GET /v1/billing/payments`)
- Security / Settings: falta persistência de preferências sensíveis e políticas de conta

### Telas essencialmente estáticas (ok para fase atual)
- Welcome, Terms, Privacy, About, Help, Rules

## 4) O que falta no backend para funcionamento pleno

### Alta prioridade para modo de testes completo
1. OAuth social
   - `POST /v1/auth/oauth/google`
   - `POST /v1/auth/oauth/facebook`
2. Cobertura de testes dos módulos já entregues
   - fechar gaps de GCS real e billing real com webhook assinado
3. Persistência de preferências do app
   - `Security / Settings`, localização e preferências principais do frontend
4. Completar notificações de domínio
   - refinamentos de UX/payload e novos eventos quando necessário

### Média prioridade
5. Stripe real em ambiente de teste
   - chaves, prices, webhook HTTPS e smoke de checkout/webhook
6. Operação contínua
   - backup, alertas e rollback

## 5) Base para alta performance (milhares de usuários)

## Já implementado
- Índices de feed/chat/likes/notificações (migração de performance)
- Constraints de integridade para `swipes.direction` e `notifications.type`
- Paginação por cursor no feed
- Cache de opções com ETag (`/v1/options/all`)
- Refresh token com rotação e detecção de reuse

## Próximos passos técnicos recomendados
1. **Cache**
   - Redis para feed quente, ranking e contagens
2. **Mensageria**
   - fila para notificações e tarefas de mídia (BullMQ/Rabbit)
3. **Banco**
   - `pgBouncer` para pool de conexões
   - monitorar planos (EXPLAIN ANALYZE) e ajustar índices por cardinalidade real
4. **Chat**
   - mover entrega para WebSocket + confirmação de leitura
5. **Mídia**
   - geração de thumbnails/background processing
6. **Observabilidade**
   - métricas (latência p95/p99), tracing e alertas

## 6) Pronto para lojas? (gap final)

Ainda não. Para publicação Google Play / App Store, faltam:
- Build mobile final (Capacitor/RN) com assinatura Android/iOS
- OAuth social + compliance iOS (Sign in with Apple se aplicável)
- Billing em conformidade com política da loja
- Data Safety (Google) + Privacy Nutrition (Apple)
- Página pública de suporte e de exclusão de conta
- Testes E2E mobile em device real e evidências para revisão
