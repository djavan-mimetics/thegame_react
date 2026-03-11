# The Game — Milestones de Testes

Este documento define **o que testar**, **como testar** e **quando executar** para cada parte do sistema.

Objetivo:
- separar roadmap funcional de roadmap de validação;
- permitir smoke test rápido antes de deploy;
- deixar claro o que já tem teste automatizado e o que ainda depende de teste manual/E2E.

## 1) Estado atual de cobertura

### Já existe teste automatizado
- `backend/test/health.test.ts`
- `backend/test/auth.m1.test.ts` *(condicional com `SMOKE_DB=1`)*

### Ainda precisa de cobertura automatizada
- Perfil
- Fotos / GCS
- Feed / swipes / likes
- Chat / WebSocket
- Notificações
- Denúncias
- Ranking
- Billing Stripe
- Exclusão de conta

## 2) Ambientes de teste

### A. Smoke local/backend
Usado para validar API e banco rapidamente.

Pré-requisitos:
- backend com env válido;
- banco acessível;
- migrations aplicadas.

Comandos base:
- `cd /home/dev/thegame/backend && npm test`
- `cd /home/dev/thegame/backend && SMOKE_DB=1 npm test`

### B. Smoke de staging/produção
Usado antes e depois de deploy.

Pré-requisitos:
- backend público em HTTPS;
- frontend publicado;
- env real preenchido;
- Stripe/GCS configurados.

### C. Teste manual de interface
Usado para validar fluxos visuais e integração final no frontend.

## 3) Matriz de testes por milestone

## M0 — Fundação

### Objetivo
Garantir que aplicação sobe, responde e fala com o banco.

### Automatizado
- [x] `GET /health` retorna `200`
- [ ] Health com banco real responde `db=ok`
- [ ] Migrações sobem do zero em banco limpo

### Smoke manual
- [x] Subir backend sem erro fatal
- [ ] Confirmar header `x-request-id`
- [ ] Validar leitura do env correto

### Critério de aprovação
- API sobe sem crash
- `/health` retorna `ok: true`
- banco responde no ambiente alvo

---

## M1 — Auth & Conta

### Rotas
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `POST /v1/auth/forgot-password`
- `POST /v1/auth/reset-password`
- `POST /v1/auth/change-password`
- `POST /v1/auth/delete-account`
- `POST /v1/auth/oauth/google` *(pendente)*
- `POST /v1/auth/oauth/facebook` *(pendente)*

### Automatizado
- [x] register/login/refresh/logout
- [x] forgot/reset/change-password
- [ ] delete-account
- [ ] login com credenciais inválidas
- [ ] refresh token reutilizado após rotação deve falhar
- [ ] OAuth Google
- [ ] OAuth Facebook

### Smoke manual
- [ ] Criar conta nova
- [ ] Fazer login e navegar no app autenticado
- [ ] Trocar senha e logar novamente
- [ ] Solicitar recuperação de senha
- [ ] Excluir conta e validar revogação de sessão

### Critério de aprovação
- tokens emitidos corretamente
- rotas autenticadas rejeitam token inválido
- logout invalida refresh token

---

## M2 — Perfil & Fotos

### Rotas
- `GET /v1/profile`
- `PUT /v1/profile`
- `POST /v1/profile/photos/upload-url`
- `POST /v1/profile/photos/complete`
- `PUT /v1/profile/photos/reorder`
- `DELETE /v1/profile/photos/:photoId`
- `POST /v1/profile/photos/cleanup`
- `PUT /v1/me/location` *(pendente no roadmap)*

### Automatizado
- [ ] obter perfil autenticado
- [ ] atualizar perfil com payload válido
- [ ] rejeitar payload inválido
- [ ] gerar upload URL com GCS configurado
- [ ] completar foto e persistir metadados
- [ ] reorder mantém ordem esperada
- [ ] delete remove vínculo da foto

### Smoke manual
- [ ] Editar perfil no frontend e recarregar tela
- [x] Fazer upload de foto e abrir URL pública/signed upload URL
- [ ] Reordenar fotos e confirmar foto principal
- [ ] Remover foto e confirmar remoção visual

### Critério de aprovação
- perfil persiste após refresh
- upload URL responde `200`
- foto publicada fica acessível

---

## M3 — Discovery, Swipes e Likes

### Rotas
- `GET /v1/feed`
- `POST /v1/swipes`
- `GET /v1/likes`

### Automatizado
- [ ] feed autenticado retorna lista paginada
- [ ] cursor do feed funciona
- [ ] swipe `like` persiste
- [ ] swipe recíproco cria match
- [ ] likes recebidas retornam corretamente
- [ ] regras premium/free de limite diário
- [ ] filtro geográfico por distância *(quando implementado)*

### Smoke manual
- [ ] Abrir feed e navegar cards
- [ ] Dar like/dislike/superlike
- [ ] Confirmar criação de match em cenário recíproco
- [ ] Validar tela Likes com dados reais

### Critério de aprovação
- feed não retorna perfis inválidos/duplicados
- swipe persiste no banco
- match nasce corretamente em like recíproco

---

## M4 — Matches & Chat

### Rotas
- `GET /v1/chats`
- `GET /v1/chats/:matchId/messages`
- `POST /v1/chats/:matchId/messages`
- `GET /v1/chats/:matchId/ws`

### Automatizado
- [ ] listar chats do usuário
- [ ] listar mensagens de um match
- [ ] enviar mensagem HTTP
- [ ] negar envio para usuário sem acesso ao match
- [ ] websocket entrega `message.new`
- [ ] paginação de mensagens *(quando concluída)*

### Smoke manual
- [ ] Abrir chat entre dois usuários reais
- [ ] Enviar mensagem do usuário A para o B
- [ ] Confirmar recebimento em tempo real
- [ ] Reabrir conversa e validar histórico

### Critério de aprovação
- mensagens persistem
- websocket entrega evento sem duplicidade
- frontend reflete mensagem sem recarregar

---

## M5 — Notificações

### Rotas
- `GET /v1/notifications`
- `POST /v1/notifications/:id/seen`

### Automatizado
- [ ] listar notificações do usuário
- [ ] marcar notificação como vista
- [ ] gerar notificação automática em evento de mensagem
- [ ] gerar notificação automática em evento de match

### Smoke manual
- [ ] Abrir lista de notificações
- [ ] Marcar item como lido
- [ ] Validar atualização visual após mensagem/match

### Critério de aprovação
- `seen_at` persistido
- notificações de domínio surgem no fluxo correto

---

## M6 — Denúncias & Moderação

### Rotas
- `POST /v1/reports`
- `GET /v1/reports`
- `GET /v1/reports/:id`

### Automatizado
- [ ] criar denúncia válida
- [ ] listar denúncias do denunciante
- [ ] detalhar denúncia existente
- [ ] negar acesso a denúncia de outro usuário
- [ ] validar updates do suporte

### Smoke manual
- [ ] Abrir tela Report e enviar ticket
- [ ] Conferir listagem em ReportList
- [ ] Abrir detalhe em ReportDetail

### Critério de aprovação
- ticket persiste com dados corretos
- usuário só vê seus próprios tickets

---

## M7 — Premium & Billing Stripe

### Rotas
- `POST /v1/billing/checkout`
- `GET /v1/billing/subscription`
- `GET /v1/billing/payments`
- `POST /v1/billing/cancel`
- `POST /v1/billing/webhook`

### Automatizado
- [ ] checkout falha com Stripe não configurado
- [ ] checkout falha sem `price_id` configurado
- [ ] checkout retorna `url` quando Stripe está configurado
- [ ] webhook rejeita request sem `stripe-signature`
- [ ] webhook rejeita assinatura inválida
- [ ] webhook `checkout.session.completed` cria assinatura/pagamento
- [ ] webhook `invoice.payment_succeeded` atualiza status
- [ ] webhook `invoice.payment_failed` marca `past_due`
- [ ] cancelamento marca `cancel_at_period_end`

### Smoke manual
- [ ] Criar sessão de checkout real
- [ ] Finalizar pagamento no Stripe
- [ ] Confirmar retorno para `FRONTEND_BASE_URL`
- [ ] Disparar evento de webhook real/teste
- [ ] Validar `GET /v1/billing/subscription`
- [ ] Validar `GET /v1/billing/payments`
- [ ] Testar cancelamento de assinatura

### Critério de aprovação
- webhook só aceita payload assinado
- status premium reflete estado do Stripe
- histórico de pagamento aparece no frontend

---

## M8 — Ranking

### Rotas
- `GET /v1/ranking`
- `GET /v1/ranking/nearby` *(pendente)*

### Automatizado
- [ ] ranking retorna lista ordenada
- [ ] filtro por cidade/UF respeitado
- [ ] nearby respeita raio configurado *(quando implementado)*

### Smoke manual
- [ ] Abrir tela Ranking
- [ ] Confirmar ordenação e localidade

### Critério de aprovação
- ranking consistente com dados persistidos

---

## M9 — Publicação / Mobile / Compliance

### Testes operacionais
- [ ] build frontend sem erro
- [ ] deploy de frontend completo
- [ ] deploy de backend completo
- [ ] serviços `systemd` sobem sem falha
- [ ] monitoramento/timer ativos

### Testes de UI
- [ ] login, navegação, feed, chat e perfil sem crash
- [ ] telas legais acessíveis
- [ ] fluxo premium e histórico acessíveis

### Testes de loja / conformidade
- [ ] URLs públicas de suporte funcionam
- [ ] URL pública de exclusão de conta funciona
- [ ] política de privacidade publicada
- [ ] formulário Data Safety preenchido
- [ ] Privacy Nutrition Labels definidas
- [ ] política de billing revisada para iOS/Android

### Critério de aprovação
- build reproduzível
- serviços estáveis
- documentação pública e política de loja fechadas

## 4) Ordem recomendada de execução de testes agora

1. **Stripe live**
   - preencher env live;
   - cadastrar webhook;
   - testar `checkout` → `webhook` → `subscription` → `payments`.
2. **Auth regressão**
   - rodar `SMOKE_DB=1 npm test`.
3. **Fluxos centrais do app**
   - perfil, feed, likes, chat, notificações, ranking, reports.
4. **Go-live**
   - build, deploy, healthcheck, smoke final em produção.

## 5) Arquivos de referência

- [MILESTONE.md](MILESTONE.md)
- [thegame.todo](thegame.todo)
- [backend/test/health.test.ts](backend/test/health.test.ts)
- [backend/test/auth.m1.test.ts](backend/test/auth.m1.test.ts)
- [backend/README.md](backend/README.md)
