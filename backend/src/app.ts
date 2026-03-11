import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import rawBody from 'fastify-raw-body';
import { randomUUID } from 'node:crypto';
import { createAuditService } from './audit/service.js';
import { createDb } from './db.js';
import { createNotificationService } from './notifications/service.js';
import { registerAuth } from './auth.js';
import { getConfig, registerConfig } from './config.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerOptionsRoutes } from './routes/options.js';
import { registerProfileRoutes } from './routes/profile.js';
import { registerFeedRoutes } from './routes/feed.js';
import { registerChatRoutes } from './routes/chats.js';
import { registerNotificationsRoutes } from './routes/notifications.js';
import { registerPhotosRoutes } from './routes/photos.js';
import { registerRankingRoutes } from './routes/ranking.js';
import { registerReportsRoutes } from './routes/reports.js';
import { registerBillingRoutes } from './routes/billing.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    requestIdHeader: 'x-request-id',
    genReqId: (req) => {
      const header = req.headers['x-request-id'];
      if (typeof header === 'string' && header.trim().length > 0) return header;
      return randomUUID();
    }
  });

  await registerConfig(app);
  const config = getConfig(app);
  app.log.level = config.LOG_LEVEL;

  app.addHook('onRequest', async (req, reply) => {
    reply.header('x-request-id', req.id);
  });

  await app.register(cors, {
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(',').map((v) => v.trim())
  });
  await app.register(websocket);
  await app.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true
  });

  await app.register(rateLimit, {
    global: false,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true
    }
  });

  const db = createDb(config.DATABASE_URL);
  const audit = createAuditService(db);
  const notifications = createNotificationService(db);

  app.decorate('db', db);
  app.decorate('audit', audit);
  app.decorate('notifications', notifications);

  registerAuth(app, config);

  await registerAuthRoutes(app, config);
  await registerOptionsRoutes(app, config);
  await registerProfileRoutes(app, config);
  await registerPhotosRoutes(app, config);
  await registerFeedRoutes(app, config);
  await registerChatRoutes(app, config);
  await registerNotificationsRoutes(app, config);
  await registerRankingRoutes(app, config);
  await registerReportsRoutes(app, config);
  await registerBillingRoutes(app, config);

  app.addHook('onClose', async () => {
    await db.close();
  });

  app.get('/health', async () => {
    let dbOk = false;
    try {
      await db.pool.query('SELECT 1 as ok');
      dbOk = true;
    } catch {
      dbOk = false;
    }

    return {
      ok: true,
      db: dbOk ? 'ok' : 'unreachable'
    };
  });

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof createDb>;
    audit: ReturnType<typeof createAuditService>;
    notifications: ReturnType<typeof createNotificationService>;
  }

  interface FastifyRequest {
    rawBody?: string;
  }
}
