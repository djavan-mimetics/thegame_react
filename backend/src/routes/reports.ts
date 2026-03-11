import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from '../config.js';

const createReportSchema = z.object({
  offenderName: z.string().trim().min(1).max(120),
  date: z.string().trim().min(8).max(10),
  reason: z.string().trim().min(1).max(160),
  description: z.string().trim().min(10).max(5000),
  accusedUserId: z.string().uuid().optional().nullable()
});

const toIsoDate = (value: string) => {
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return value;
  return null;
};

const toPtDate = (value: unknown) => {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
};

const toPtDateTime = (value: unknown) => {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR');
};

export async function registerReportsRoutes(app: FastifyInstance, _config: AppConfig) {
  app.post('/v1/reports', { preHandler: app.requireAuth }, async (req, reply) => {
    const body = createReportSchema.parse(req.body);
    const occurredOn = toIsoDate(body.date);
    if (!occurredOn) return reply.code(400).send({ error: 'invalid_date' });

    const reporterUserId = req.user!.userId;
    const reportRes = await app.db.pool.query(
      `INSERT INTO reports (reporter_user_id, accused_user_id, offender_name, occurred_on, reason, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, offender_name, occurred_on, reason, description, status`,
      [reporterUserId, body.accusedUserId ?? null, body.offenderName, occurredOn, body.reason, body.description]
    );

    const report = reportRes.rows[0];

    await app.db.pool.query(
      `INSERT INTO report_updates (report_id, sender, text)
       VALUES ($1, 'support', $2)`,
      [report.id, 'Sua denúncia foi recebida. Nossa equipe iniciará a análise em até 24 horas.']
    );

    return reply.code(201).send({
      report: {
        id: String(report.id ?? ''),
        offenderName: report.offender_name ?? '',
        date: toPtDate(report.occurred_on),
        reason: report.reason ?? '',
        description: report.description ?? '',
        status: report.status ?? 'Pendente'
      }
    });
  });

  app.get('/v1/reports', { preHandler: app.requireAuth }, async (req) => {
    const reporterUserId = req.user!.userId;
    const res = await app.db.pool.query(
      `SELECT id, offender_name, occurred_on, reason, status
       FROM reports
       WHERE reporter_user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [reporterUserId]
    );

    return {
      reports: res.rows.map((row) => ({
        id: String(row.id ?? ''),
        offenderName: row.offender_name ?? '',
        date: toPtDate(row.occurred_on),
        reason: row.reason ?? '',
        status: row.status ?? 'Pendente'
      }))
    };
  });

  app.get('/v1/reports/:id', { preHandler: app.requireAuth }, async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const reporterUserId = req.user!.userId;

    const ticket = await app.db.pool.query(
      `SELECT id, offender_name, occurred_on, reason, description, status
       FROM reports
       WHERE id = $1 AND reporter_user_id = $2
       LIMIT 1`,
      [id, reporterUserId]
    );

    if (ticket.rowCount === 0) return reply.code(404).send({ error: 'not_found' });

    const updatesRes = await app.db.pool.query(
      `SELECT id, sender, text, created_at
       FROM report_updates
       WHERE report_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    const row = ticket.rows[0];

    return {
      report: {
        id: String(row.id ?? ''),
        offenderName: row.offender_name ?? '',
        date: toPtDate(row.occurred_on),
        reason: row.reason ?? '',
        description: row.description ?? '',
        status: row.status ?? 'Pendente',
        updates: updatesRes.rows.map((update) => ({
          id: String(update.id ?? ''),
          sender: update.sender === 'support' ? 'support' : 'user',
          text: update.text ?? '',
          timestamp: toPtDateTime(update.created_at)
        }))
      }
    };
  });
}
