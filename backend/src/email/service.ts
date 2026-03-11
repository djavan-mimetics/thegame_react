import nodemailer from 'nodemailer';
import type { FastifyBaseLogger } from 'fastify';
import type { AppConfig } from '../config.js';
import type { EmailTemplate } from './templates.js';

type DeliveryResult = {
  delivered: boolean;
  previewTokenReturned: boolean;
};

function isSmtpConfigured(config: AppConfig) {
  return Boolean(config.SMTP_HOST?.trim() && config.SMTP_FROM_EMAIL?.trim());
}

function buildTransport(config: AppConfig) {
  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT ?? 587,
    secure: config.SMTP_SECURE ?? false,
    auth: config.SMTP_USER?.trim()
      ? {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS
        }
      : undefined
  });
}

export async function sendTransactionalEmail(input: {
  config: AppConfig;
  logger: FastifyBaseLogger;
  to: string;
  template: EmailTemplate;
}): Promise<DeliveryResult> {
  if (!isSmtpConfigured(input.config)) {
    input.logger.warn(
      {
        to: input.to,
        subject: input.template.subject,
        text: input.template.text
      },
      'SMTP nao configurado; email transacional gerado apenas em modo preview'
    );
    return { delivered: false, previewTokenReturned: true };
  }

  const transport = buildTransport(input.config);
  try {
    await transport.sendMail({
      from: `${input.config.SMTP_FROM_NAME || 'The Game'} <${input.config.SMTP_FROM_EMAIL}>`,
      to: input.to,
      subject: input.template.subject,
      text: input.template.text,
      html: input.template.html
    });
  } catch (error) {
    input.logger.error({ err: error, to: input.to, subject: input.template.subject }, 'falha_ao_enviar_email_transacional');
    input.logger.warn(
      {
        to: input.to,
        subject: input.template.subject,
        text: input.template.text
      },
      'Aplicando fallback de preview para email transacional'
    );
    return { delivered: false, previewTokenReturned: true };
  }

  return { delivered: true, previewTokenReturned: false };
}
