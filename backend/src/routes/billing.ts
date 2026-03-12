import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import Stripe from 'stripe';
import type { AppConfig } from '../config.js';

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'semiannual', 'annual']),
  recurring: z.boolean().default(true)
});

const statusMap: Record<string, 'Pago' | 'Pendente' | 'Falha'> = {
  paid: 'Pago',
  succeeded: 'Pago',
  pending: 'Pendente',
  open: 'Pendente',
  requires_payment_method: 'Falha',
  failed: 'Falha'
};

export async function registerBillingRoutes(app: FastifyInstance, config: AppConfig) {
  const stripeKey = config.STRIPE_SECRET_KEY ?? '';
  const stripeWebhookSecret = config.STRIPE_WEBHOOK_SECRET ?? '';
  const frontendBase = config.FRONTEND_BASE_URL || 'http://localhost:5173';
  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  const planPriceMap: Record<'monthly' | 'semiannual' | 'annual', string> = {
    monthly: config.STRIPE_PRICE_MONTHLY ?? '',
    semiannual: config.STRIPE_PRICE_SEMIANNUAL ?? '',
    annual: config.STRIPE_PRICE_ANNUAL ?? ''
  };

  app.post('/v1/billing/checkout', { preHandler: app.requireAuth }, async (req, reply) => {
    if (!stripe) return reply.code(503).send({ error: 'stripe_not_configured' });

    const userId = req.user!.userId;
    const body = checkoutSchema.parse(req.body ?? {});
    const priceId = planPriceMap[body.plan];
    if (!priceId) return reply.code(503).send({ error: 'stripe_price_not_configured' });

    const mode: Stripe.Checkout.SessionCreateParams.Mode = body.recurring ? 'subscription' : 'payment';
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendBase}/?billing=success`,
      cancel_url: `${frontendBase}/?billing=cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan: body.plan,
        recurring: body.recurring ? 'true' : 'false'
      }
    });

    return reply.send({
      url: session.url,
      id: session.id
    });
  });

  app.get('/v1/billing/subscription', { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user!.userId;
    const res = await app.db.pool.query(
      `SELECT id, plan, status, current_period_end, cancel_at_period_end, provider_subscription_id
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1`,
      [userId]
    );

    const row = res.rows[0] as
      | {
          id: string;
          plan: string;
          status: string;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          provider_subscription_id: string | null;
        }
      | undefined;

    if (!row) {
      return { isPremium: false, subscription: null };
    }

    const normalizedStatus = String(row.status ?? '').toLowerCase();
    const isPremium = normalizedStatus === 'active' || normalizedStatus === 'trialing';

    return {
      isPremium,
      subscription: {
        id: row.id,
        plan: row.plan,
        status: row.status,
        renewsAt: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end,
        providerSubscriptionId: row.provider_subscription_id
      }
    };
  });

  app.get('/v1/billing/payments', { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user!.userId;
    const res = await app.db.pool.query(
      `SELECT p.id, p.amount_cents, p.currency, p.status, p.card_last4, p.created_at,
              COALESCE(s.plan, 'Plano Premium') AS plan
       FROM payments p
       LEFT JOIN subscriptions s ON s.id = p.subscription_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 100`,
      [userId]
    );

    return {
      payments: res.rows.map((row) => {
        const amount = Number(row.amount_cents ?? 0) / 100;
        return {
          id: String(row.id ?? ''),
          date: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '',
          plan: String(row.plan ?? 'Plano Premium'),
          amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: String(row.currency ?? 'BRL').toUpperCase() }).format(amount),
          status: statusMap[String(row.status ?? '').toLowerCase()] ?? 'Pendente',
          cardLast4: row.card_last4 ?? '----'
        };
      })
    };
  });

  app.post('/v1/billing/cancel', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const subRes = await app.db.pool.query(
      `SELECT id, provider_subscription_id, plan
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1`,
      [userId]
    );
    const sub = subRes.rows[0] as { id: string; provider_subscription_id: string | null; plan?: string | null } | undefined;
    if (!sub) return reply.code(404).send({ error: 'subscription_not_found' });

    if (stripe && sub.provider_subscription_id) {
      await stripe.subscriptions.update(sub.provider_subscription_id, {
        cancel_at_period_end: true
      });
    }

    await app.db.pool.query(
      `UPDATE subscriptions
       SET cancel_at_period_end = true, updated_at = now()
       WHERE id = $1`,
      [sub.id]
    );

    try {
      await app.notifications.notifyBillingCancellationScheduled({
        userId,
        plan: sub.plan ?? null
      });
    } catch (error) {
      req.log.error({ err: error, userId, subscriptionId: sub.id }, 'system_notification_failed');
    }

    return reply.send({ ok: true });
  });

  app.post('/v1/billing/webhook', { config: { rawBody: true } }, async (req, reply) => {
    if (!stripe) return reply.code(503).send({ error: 'stripe_not_configured' });

    if (!stripeWebhookSecret) {
      return reply.code(503).send({ error: 'stripe_webhook_secret_not_configured' });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      return reply.code(400).send({ error: 'stripe_signature_missing' });
    }

    if (!req.rawBody) {
      return reply.code(400).send({ error: 'stripe_raw_body_missing' });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret);
    } catch {
      return reply.code(400).send({ error: 'stripe_signature_invalid' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.client_reference_id ?? session.metadata?.userId ?? '').trim();
      if (!userId) return reply.send({ ok: true });

      const plan = (session.metadata?.plan as string | undefined) || 'monthly';
      const status = session.payment_status === 'paid' ? 'active' : 'pending';

      const subInsert = await app.db.pool.query(
        `INSERT INTO subscriptions (
            user_id, provider, provider_customer_id, provider_subscription_id,
            plan, status, current_period_end, cancel_at_period_end, created_at, updated_at
         ) VALUES ($1, 'stripe', $2, $3, $4, $5, NULL, false, now(), now())
         RETURNING id`,
        [
          userId,
          typeof session.customer === 'string' ? session.customer : null,
          typeof session.subscription === 'string' ? session.subscription : null,
          plan,
          status
        ]
      );

      await app.db.pool.query(
        `INSERT INTO payments (
            user_id, subscription_id, provider, provider_payment_id,
            amount_cents, currency, status, raw_json, created_at
         ) VALUES ($1, $2, 'stripe', $3, $4, $5, $6, $7::jsonb, now())`,
        [
          userId,
          subInsert.rows[0].id,
          session.payment_intent ? String(session.payment_intent) : session.id,
          Number(session.amount_total ?? 0),
          String((session.currency ?? 'brl').toUpperCase()),
          String(session.payment_status ?? 'pending'),
          JSON.stringify(session)
        ]
      );
    }

    if (event.type === 'invoice.payment_failed' || event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;

      if (customerId) {
        const subRes = await app.db.pool.query(
          `SELECT id, user_id
           FROM subscriptions
           WHERE provider = 'stripe' AND provider_customer_id = $1
           ORDER BY updated_at DESC, created_at DESC
           LIMIT 1`,
          [customerId]
        );
        const localSub = subRes.rows[0] as { id: string; user_id: string } | undefined;
        if (localSub) {
          const paymentStatus = event.type === 'invoice.payment_succeeded' ? 'paid' : 'failed';
          await app.db.pool.query(
            `INSERT INTO payments (
              user_id, subscription_id, provider, provider_payment_id,
              amount_cents, currency, status, raw_json, created_at
             ) VALUES ($1, $2, 'stripe', $3, $4, $5, $6, $7::jsonb, now())`,
            [
              localSub.user_id,
              localSub.id,
              invoice.id,
              Number(invoice.amount_paid ?? invoice.amount_due ?? 0),
              String((invoice.currency ?? 'brl').toUpperCase()),
              paymentStatus,
              JSON.stringify(invoice)
            ]
          );

          await app.db.pool.query(
            `UPDATE subscriptions
             SET status = $2,
                 provider_subscription_id = COALESCE($3, provider_subscription_id),
                 updated_at = now()
             WHERE id = $1`,
            [localSub.id, event.type === 'invoice.payment_succeeded' ? 'active' : 'past_due', subscriptionId]
          );

          try {
            if (event.type === 'invoice.payment_succeeded') {
              const planRes = await app.db.pool.query('SELECT plan FROM subscriptions WHERE id = $1 LIMIT 1', [localSub.id]);
              const plan = (planRes.rows[0] as { plan?: string } | undefined)?.plan ?? 'premium';
              await app.notifications.notifyBillingPaymentSucceeded({ userId: localSub.user_id, plan });
            } else {
              const planRes = await app.db.pool.query('SELECT plan FROM subscriptions WHERE id = $1 LIMIT 1', [localSub.id]);
              const plan = (planRes.rows[0] as { plan?: string } | undefined)?.plan ?? null;
              await app.notifications.notifyBillingPaymentFailed({ userId: localSub.user_id, plan });
            }
          } catch (error) {
            req.log.error({ err: error, userId: localSub.user_id, subscriptionId: localSub.id, eventType: event.type }, 'system_notification_failed');
          }
        }
      }
    }

    return reply.send({ ok: true });
  });
}
