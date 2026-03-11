import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { buildApp } from '../src/app.js';
import {
  authHeaders,
  cleanupUsers,
  completePhoto,
  findMatchId,
  prepareTestEnv,
  registerUser,
  upsertProfile
} from './helpers.js';

const isDbSmoke = process.env.SMOKE_DB === '1';

describe.sequential('M2-M7 core smoketests', () => {
  let app: FastifyInstance;
  let wsBaseUrl = '';
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    if (!isDbSmoke) return;
    prepareTestEnv();
    app = await buildApp();
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    wsBaseUrl = address.replace(/^http/, 'ws');
  });

  afterAll(async () => {
    if (!isDbSmoke) return;
    await cleanupUsers(app, createdUserIds);
    await app.close();
  });

  it.skipIf(!isDbSmoke)('M2 profile update validates options and photo lifecycle', async () => {
    const user = await registerUser(app, 'm2-profile');
    createdUserIds.push(user.userId);

    const { payload } = await upsertProfile(app, user.accessToken, 'M2');
    const getProfile = await app.inject({
      method: 'GET',
      url: '/v1/profile',
      headers: authHeaders(user.accessToken)
    });

    expect(getProfile.statusCode).toBe(200);
    const profileJson = getProfile.json();
    expect(profileJson.profile.name).toBe(payload.name);
    expect(profileJson.profile.current_tag).toBe(payload.currentTag);
    expect(profileJson.profile.tags).toEqual(payload.tags);

    const invalidProfile = await app.inject({
      method: 'PUT',
      url: '/v1/profile',
      headers: authHeaders(user.accessToken),
      payload: { currentTag: 'nao-existe' }
    });
    expect(invalidProfile.statusCode).toBe(400);
    expect(invalidProfile.json().error).toBe('invalid_option');

    const photoA = await completePhoto(app, user.accessToken, 0, 'm2a');
    const photoB = await completePhoto(app, user.accessToken, 1, 'm2b');

    const reorder = await app.inject({
      method: 'PUT',
      url: '/v1/profile/photos/reorder',
      headers: authHeaders(user.accessToken),
      payload: { photoIds: [photoB.id, photoA.id] }
    });
    expect(reorder.statusCode).toBe(200);

    const afterReorder = await app.inject({
      method: 'GET',
      url: '/v1/profile',
      headers: authHeaders(user.accessToken)
    });
    expect(afterReorder.json().profile.photos[0]).toContain('m2b-1.jpg');

    const del = await app.inject({
      method: 'DELETE',
      url: `/v1/profile/photos/${photoA.id}`,
      headers: authHeaders(user.accessToken)
    });
    expect(del.statusCode).toBe(200);

    const cleanup = await app.inject({
      method: 'POST',
      url: '/v1/profile/photos/cleanup',
      headers: authHeaders(user.accessToken),
      payload: { keepGcsPaths: ['profiles/test/m2b-1.jpg'] }
    });
    expect(cleanup.statusCode).toBe(200);

    const afterCleanup = await app.inject({
      method: 'GET',
      url: '/v1/profile',
      headers: authHeaders(user.accessToken)
    });
    expect(afterCleanup.json().profile.photos).toHaveLength(1);
  }, 20000);

  it.skipIf(!isDbSmoke)('M3-M6 feed, match, chat, notifications and reports flow works end-to-end', async () => {
    const userA = await registerUser(app, 'm3a');
    const userB = await registerUser(app, 'm3b');
    const intruder = await registerUser(app, 'm3c');
    createdUserIds.push(userA.userId, userB.userId, intruder.userId);

    await upsertProfile(app, userA.accessToken, 'M3A');
    await upsertProfile(app, userB.accessToken, 'M3B');
    await completePhoto(app, userA.accessToken, 0, 'm3a');
    await completePhoto(app, userB.accessToken, 0, 'm3b');

    const feed = await app.inject({
      method: 'GET',
      url: '/v1/feed',
      headers: authHeaders(userA.accessToken)
    });
    expect(feed.statusCode).toBe(200);
    expect(feed.json().profiles.some((profile: { id: string }) => profile.id === userB.userId)).toBe(true);

    const firstSwipe = await app.inject({
      method: 'POST',
      url: '/v1/swipes',
      headers: authHeaders(userA.accessToken),
      payload: { targetUserId: userB.userId, direction: 'like' }
    });
    expect(firstSwipe.statusCode).toBe(200);

    const likes = await app.inject({
      method: 'GET',
      url: '/v1/likes',
      headers: authHeaders(userB.accessToken)
    });
    expect(likes.statusCode).toBe(200);
    expect(likes.json().likes.some((like: { id: string }) => like.id === userA.userId)).toBe(true);

    const reciprocalSwipe = await app.inject({
      method: 'POST',
      url: '/v1/swipes',
      headers: authHeaders(userB.accessToken),
      payload: { targetUserId: userA.userId, direction: 'like' }
    });
    expect(reciprocalSwipe.statusCode).toBe(200);

    const matchId = await findMatchId(app, userA.userId, userB.userId);
    expect(matchId).toBeTruthy();

    const matchNotificationsA = await app.inject({
      method: 'GET',
      url: '/v1/notifications',
      headers: authHeaders(userA.accessToken)
    });
    const matchNotificationsB = await app.inject({
      method: 'GET',
      url: '/v1/notifications',
      headers: authHeaders(userB.accessToken)
    });
    expect(matchNotificationsA.json().notifications.some((item: { type: string }) => item.type === 'match')).toBe(true);
    expect(matchNotificationsB.json().notifications.some((item: { type: string }) => item.type === 'match')).toBe(true);
    expect(matchNotificationsA.json().notifications.some((item: { title: string }) => item.title.includes('Novo match com'))).toBe(true);

    const chats = await app.inject({
      method: 'GET',
      url: '/v1/chats',
      headers: authHeaders(userA.accessToken)
    });
    expect(chats.statusCode).toBe(200);
    expect(chats.json().chats.some((chat: { id: string }) => chat.id === matchId)).toBe(true);

    const postMessage = await app.inject({
      method: 'POST',
      url: `/v1/chats/${matchId}/messages`,
      headers: authHeaders(userA.accessToken),
      payload: { text: 'Mensagem automatizada de teste' }
    });
    expect(postMessage.statusCode).toBe(200);

    const forbidden = await app.inject({
      method: 'POST',
      url: `/v1/chats/${matchId}/messages`,
      headers: authHeaders(intruder.accessToken),
      payload: { text: 'Nao deveria enviar' }
    });
    expect(forbidden.statusCode).toBe(403);

    const messages = await app.inject({
      method: 'GET',
      url: `/v1/chats/${matchId}/messages`,
      headers: authHeaders(userB.accessToken)
    });
    expect(messages.statusCode).toBe(200);
    expect(messages.json().messages.some((message: { text: string }) => message.text === 'Mensagem automatizada de teste')).toBe(true);

    const notificationsAfterMessage = await app.inject({
      method: 'GET',
      url: '/v1/notifications',
      headers: authHeaders(userB.accessToken)
    });
    const messageNotification = notificationsAfterMessage.json().notifications.find((item: { type: string }) => item.type === 'message');
    expect(messageNotification).toBeTruthy();
    expect(String(messageNotification.title)).toContain('Nova mensagem de');
    expect(String(messageNotification.description)).toContain('Mensagem automatizada de teste');

    const wsMessage = await new Promise<any>((resolve, reject) => {
      const senderSocket = new WebSocket(`${wsBaseUrl}/v1/chats/${matchId}/ws?accessToken=${encodeURIComponent(userA.accessToken)}`);
      const recipientSocket = new WebSocket(`${wsBaseUrl}/v1/chats/${matchId}/ws?accessToken=${encodeURIComponent(userB.accessToken)}`);
      let opened = 0;
      let settled = false;

      const fail = (error: unknown) => {
        if (settled) return;
        settled = true;
        try { senderSocket.close(); } catch {}
        try { recipientSocket.close(); } catch {}
        reject(error);
      };

      const maybeSend = () => {
        opened += 1;
        if (opened === 2) {
          senderSocket.send(JSON.stringify({ type: 'message', text: 'Mensagem via websocket' }));
        }
      };

      senderSocket.addEventListener('open', maybeSend);
      recipientSocket.addEventListener('open', maybeSend);
      senderSocket.addEventListener('error', fail);
      recipientSocket.addEventListener('error', fail);
      recipientSocket.addEventListener('message', (event) => {
        if (settled) return;
        const payload = JSON.parse(String(event.data));
        if (payload?.type !== 'message') return;
        settled = true;
        senderSocket.close();
        recipientSocket.close();
        resolve(payload);
      });

      setTimeout(() => fail(new Error('websocket message timeout')), 5000);
    });
    expect(wsMessage.message.text).toBe('Mensagem via websocket');

    const markSeen = await app.inject({
      method: 'POST',
      url: `/v1/notifications/${messageNotification.id}/seen`,
      headers: authHeaders(userB.accessToken)
    });
    expect(markSeen.statusCode).toBe(200);
    expect(markSeen.json().seen).toBe(true);

    const report = await app.inject({
      method: 'POST',
      url: '/v1/reports',
      headers: authHeaders(userA.accessToken),
      payload: {
        offenderName: 'Usuario Teste B',
        accusedUserId: userB.userId,
        date: '11/03/2026',
        reason: 'Conduta inadequada',
        description: 'Descricao automatizada suficientemente longa para abrir um ticket de denuncia.'
      }
    });
    expect(report.statusCode).toBe(201);

    const reportId = report.json().report.id;
    const reportList = await app.inject({
      method: 'GET',
      url: '/v1/reports',
      headers: authHeaders(userA.accessToken)
    });
    expect(reportList.statusCode).toBe(200);
    expect(reportList.json().reports.some((item: { id: string }) => item.id === reportId)).toBe(true);

    const reportDetail = await app.inject({
      method: 'GET',
      url: `/v1/reports/${reportId}`,
      headers: authHeaders(userA.accessToken)
    });
    expect(reportDetail.statusCode).toBe(200);
    expect(reportDetail.json().report.updates.length).toBeGreaterThan(0);

    const systemNotification = await app.inject({
      method: 'GET',
      url: '/v1/notifications',
      headers: authHeaders(userA.accessToken)
    });
    expect(systemNotification.json().notifications.some((item: { type: string; title: string }) => item.type === 'system' && item.title === 'Denuncia recebida')).toBe(true);
  }, 30000);

  it.skipIf(!isDbSmoke)('M6-M8 ranking returns ordered and filtered profiles', async () => {
    const userA = await registerUser(app, 'ranking-a');
    const userB = await registerUser(app, 'ranking-b');
    createdUserIds.push(userA.userId, userB.userId);

    const { payload: payloadA } = await upsertProfile(app, userA.accessToken, 'RankingA');
    const { payload: payloadB } = await upsertProfile(app, userB.accessToken, 'RankingB');
    await completePhoto(app, userA.accessToken, 0, 'ranking-a');
    await completePhoto(app, userB.accessToken, 0, 'ranking-b');

    await app.inject({
      method: 'PUT',
      url: '/v1/profile',
      headers: authHeaders(userA.accessToken),
      payload: { ...payloadA, availableToday: false, bio: 'Bio simples para ranking A com tamanho suficiente.' }
    });
    await app.inject({
      method: 'PUT',
      url: '/v1/profile',
      headers: authHeaders(userB.accessToken),
      payload: { ...payloadB, availableToday: true, bio: 'Bio mais completa para ranking B com bastante texto para score.' }
    });

    const ranking = await app.inject({
      method: 'GET',
      url: `/v1/ranking?state=${encodeURIComponent(String(payloadA.state))}&city=${encodeURIComponent(String(payloadA.city))}&limit=10`,
      headers: authHeaders(userA.accessToken)
    });
    expect(ranking.statusCode).toBe(200);
    const rankingJson = ranking.json();
    expect(rankingJson.ranking.length).toBeGreaterThanOrEqual(2);
    expect(rankingJson.ranking[0].score).toBeGreaterThanOrEqual(rankingJson.ranking[1].score);
    expect(rankingJson.ranking.some((item: { id: string }) => item.id === userA.userId)).toBe(true);
    expect(rankingJson.ranking.some((item: { id: string }) => item.id === userB.userId)).toBe(true);
  }, 30000);

  it.skipIf(!isDbSmoke)('M7 billing endpoints handle configured and non-configured scenarios deterministically', async () => {
    const originalStripe = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_MONTHLY: process.env.STRIPE_PRICE_MONTHLY,
      STRIPE_PRICE_SEMIANNUAL: process.env.STRIPE_PRICE_SEMIANNUAL,
      STRIPE_PRICE_ANNUAL: process.env.STRIPE_PRICE_ANNUAL
    };

    prepareTestEnv({
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      STRIPE_PRICE_MONTHLY: '',
      STRIPE_PRICE_SEMIANNUAL: '',
      STRIPE_PRICE_ANNUAL: ''
    });

    const noStripeApp = await buildApp();
    const user = await registerUser(noStripeApp, 'm7-no-stripe');
    createdUserIds.push(user.userId);

    const subscription = await noStripeApp.inject({
      method: 'GET',
      url: '/v1/billing/subscription',
      headers: authHeaders(user.accessToken)
    });
    expect(subscription.statusCode).toBe(200);
    expect(subscription.json().subscription).toBeNull();

    const payments = await noStripeApp.inject({
      method: 'GET',
      url: '/v1/billing/payments',
      headers: authHeaders(user.accessToken)
    });
    expect(payments.statusCode).toBe(200);
    expect(payments.json().payments).toEqual([]);

    const checkoutUnavailable = await noStripeApp.inject({
      method: 'POST',
      url: '/v1/billing/checkout',
      headers: authHeaders(user.accessToken),
      payload: { plan: 'monthly', recurring: true }
    });
    expect(checkoutUnavailable.statusCode).toBe(503);
    expect(checkoutUnavailable.json().error).toBe('stripe_not_configured');

    const webhookUnavailable = await noStripeApp.inject({
      method: 'POST',
      url: '/v1/billing/webhook',
      headers: { 'content-type': 'application/json' },
      payload: {}
    });
    expect(webhookUnavailable.statusCode).toBe(503);
    expect(webhookUnavailable.json().error).toBe('stripe_not_configured');

    const cancelMissing = await noStripeApp.inject({
      method: 'POST',
      url: '/v1/billing/cancel',
      headers: authHeaders(user.accessToken)
    });
    expect(cancelMissing.statusCode).toBe(404);
    await noStripeApp.close();

    prepareTestEnv({
      STRIPE_SECRET_KEY: 'sk_test_dummy',
      STRIPE_WEBHOOK_SECRET: 'whsec_dummy',
      STRIPE_PRICE_MONTHLY: '',
      STRIPE_PRICE_SEMIANNUAL: '',
      STRIPE_PRICE_ANNUAL: ''
    });

    const configuredApp = await buildApp();
    const configuredUser = await registerUser(configuredApp, 'm7-configured');
    createdUserIds.push(configuredUser.userId);

    const checkoutMissingPrice = await configuredApp.inject({
      method: 'POST',
      url: '/v1/billing/checkout',
      headers: authHeaders(configuredUser.accessToken),
      payload: { plan: 'monthly', recurring: true }
    });
    expect(checkoutMissingPrice.statusCode).toBe(503);
    expect(checkoutMissingPrice.json().error).toBe('stripe_price_not_configured');

    const missingSignature = await configuredApp.inject({
      method: 'POST',
      url: '/v1/billing/webhook',
      headers: { 'content-type': 'application/json' },
      payload: {}
    });
    expect(missingSignature.statusCode).toBe(400);
    expect(missingSignature.json().error).toBe('stripe_signature_missing');
    await configuredApp.close();

    prepareTestEnv({
      STRIPE_SECRET_KEY: originalStripe.STRIPE_SECRET_KEY ?? '',
      STRIPE_WEBHOOK_SECRET: originalStripe.STRIPE_WEBHOOK_SECRET ?? '',
      STRIPE_PRICE_MONTHLY: originalStripe.STRIPE_PRICE_MONTHLY ?? '',
      STRIPE_PRICE_SEMIANNUAL: originalStripe.STRIPE_PRICE_SEMIANNUAL ?? '',
      STRIPE_PRICE_ANNUAL: originalStripe.STRIPE_PRICE_ANNUAL ?? ''
    });
  }, 30000);
});