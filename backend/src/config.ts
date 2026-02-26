import envPlugin from '@fastify/env';
import type { FastifyInstance } from 'fastify';

export type AppConfig = {
  PORT: number;
  HOST: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET?: string;
  JWT_ACCESS_TTL_SECONDS?: number;
  REFRESH_TTL_DAYS?: number;
  SESSION_ABSOLUTE_TTL_DAYS?: number;
  PASSWORD_RESET_TTL_MINUTES?: number;
  GCS_PROJECT_ID?: string;
  GCS_CLIENT_EMAIL?: string;
  GCS_PRIVATE_KEY?: string;
  GCS_BUCKET?: string;
  GCS_PUBLIC_BASE_URL?: string;
};

const schema = {
  type: 'object',
  required: ['PORT', 'HOST', 'CORS_ORIGIN', 'LOG_LEVEL', 'DATABASE_URL'],
  properties: {
    PORT: { type: 'number', default: 8080 },
    HOST: { type: 'string', default: '0.0.0.0' },
    CORS_ORIGIN: { type: 'string', default: '*' },
    LOG_LEVEL: { type: 'string', default: 'info' },
    DATABASE_URL: { type: 'string' },
    JWT_ACCESS_SECRET: { type: 'string', default: '' },
    JWT_ACCESS_TTL_SECONDS: { type: 'number', default: 900 },
    REFRESH_TTL_DAYS: { type: 'number', default: 30 },
    SESSION_ABSOLUTE_TTL_DAYS: { type: 'number', default: 365 },
    PASSWORD_RESET_TTL_MINUTES: { type: 'number', default: 30 },
    GCS_PROJECT_ID: { type: 'string', default: '' },
    GCS_CLIENT_EMAIL: { type: 'string', default: '' },
    GCS_PRIVATE_KEY: { type: 'string', default: '' },
    GCS_BUCKET: { type: 'string', default: '' },
    GCS_PUBLIC_BASE_URL: { type: 'string', default: '' }
  }
} as const;

export async function registerConfig(app: FastifyInstance) {
  await app.register(envPlugin, {
    schema,
    dotenv: true
  });
}

export function getConfig(app: FastifyInstance): AppConfig {
  return app.getEnvs<AppConfig>();
}
