import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { createDb } from './db.js';
import { registerAuth } from './auth.js';
import { getConfig, registerConfig } from './config.js';
import { registerAuthRoutes } from './routes/auth.js';

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

  registerAuth(app, config);

  await registerAuthRoutes(app, config);

  const db = createDb(config.DATABASE_URL);

  app.decorate('db', db);

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
  }
}
