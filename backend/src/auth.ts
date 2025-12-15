import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { jwtVerify } from 'jose';
import type { AppConfig } from './config.js';

export type AuthUser = {
  userId: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

function parseBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(' ');
  if (scheme?.toLowerCase() !== 'bearer') return null;
  if (!token || token.trim().length === 0) return null;
  return token;
}

export function createRequireAuth(config: AppConfig) {
  const secret = config.JWT_ACCESS_SECRET ?? '';
  const secretBytes = new TextEncoder().encode(secret);

  return async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
    if (!secret) {
      request.log.error('JWT_ACCESS_SECRET is not configured');
      return reply.code(500).send({ error: 'server_misconfigured' });
    }

    const token = parseBearerToken(request.headers.authorization);
    if (!token) return reply.code(401).send({ error: 'unauthorized' });

    try {
      const { payload } = await jwtVerify(token, secretBytes);
      const sub = typeof payload.sub === 'string' ? payload.sub : null;
      if (!sub) return reply.code(401).send({ error: 'unauthorized' });
      request.user = { userId: sub };
    } catch {
      return reply.code(401).send({ error: 'unauthorized' });
    }
  };
}

export function registerAuth(app: FastifyInstance, config: AppConfig) {
  app.decorate('requireAuth', createRequireAuth(config));
}

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: ReturnType<typeof createRequireAuth>;
  }
}
