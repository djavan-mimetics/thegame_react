import envPlugin from '@fastify/env';
import type { FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

export type AppConfig = {
  PORT: number;
  HOST: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  DATABASE_URL: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_SECURE?: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM_NAME?: string;
  SMTP_FROM_EMAIL?: string;
  JWT_ACCESS_SECRET?: string;
  JWT_ACCESS_TTL_SECONDS?: number;
  REFRESH_TTL_DAYS?: number;
  SESSION_ABSOLUTE_TTL_DAYS?: number;
  PASSWORD_RESET_TTL_MINUTES?: number;
  EMAIL_VERIFICATION_TTL_HOURS?: number;
  GCS_PROJECT_ID?: string;
  GCS_CLIENT_EMAIL?: string;
  GCS_PRIVATE_KEY?: string;
  GCS_BUCKET?: string;
  GCS_PUBLIC_BASE_URL?: string;
  GCS_CREDENTIALS_FILE?: string;
  FRONTEND_BASE_URL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_MONTHLY?: string;
  STRIPE_PRICE_SEMIANNUAL?: string;
  STRIPE_PRICE_ANNUAL?: string;
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
    SMTP_HOST: { type: 'string', default: '' },
    SMTP_PORT: { type: 'number', default: 587 },
    SMTP_SECURE: { type: 'boolean', default: false },
    SMTP_USER: { type: 'string', default: '' },
    SMTP_PASS: { type: 'string', default: '' },
    SMTP_FROM_NAME: { type: 'string', default: 'The Game' },
    SMTP_FROM_EMAIL: { type: 'string', default: '' },
    JWT_ACCESS_SECRET: { type: 'string', default: '' },
    JWT_ACCESS_TTL_SECONDS: { type: 'number', default: 900 },
    REFRESH_TTL_DAYS: { type: 'number', default: 30 },
    SESSION_ABSOLUTE_TTL_DAYS: { type: 'number', default: 365 },
    PASSWORD_RESET_TTL_MINUTES: { type: 'number', default: 30 },
    EMAIL_VERIFICATION_TTL_HOURS: { type: 'number', default: 48 },
    GCS_PROJECT_ID: { type: 'string', default: '' },
    GCS_CLIENT_EMAIL: { type: 'string', default: '' },
    GCS_PRIVATE_KEY: { type: 'string', default: '' },
    GCS_BUCKET: { type: 'string', default: '' },
    GCS_PUBLIC_BASE_URL: { type: 'string', default: '' },
    GCS_CREDENTIALS_FILE: { type: 'string', default: '' },
    FRONTEND_BASE_URL: { type: 'string', default: '' },
    STRIPE_SECRET_KEY: { type: 'string', default: '' },
    STRIPE_WEBHOOK_SECRET: { type: 'string', default: '' },
    STRIPE_PRICE_MONTHLY: { type: 'string', default: '' },
    STRIPE_PRICE_SEMIANNUAL: { type: 'string', default: '' },
    STRIPE_PRICE_ANNUAL: { type: 'string', default: '' }
  }
} as const;

export async function registerConfig(app: FastifyInstance) {
  const explicit = process.env.THEGAME_ENV_FILE;
  const candidates = [
    explicit,
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../backend/.env')
  ].filter((value): value is string => Boolean(value));

  for (const file of candidates) {
    if (existsSync(file)) {
      dotenv.config({ path: file, override: false });
      break;
    }
  }

  await app.register(envPlugin, {
    schema,
    dotenv: false
  });
}

export function getConfig(app: FastifyInstance): AppConfig {
  return app.getEnvs<AppConfig>();
}
