import type { Db } from '../db.js';

type NotificationType = 'match' | 'message' | 'superlike' | 'system';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
};

async function getDisplayName(db: Db, userId: string) {
  const res = await db.pool.query(
    `SELECT COALESCE(NULLIF(trim(p.name), ''), u.email) AS display_name
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [userId]
  );

  return (res.rows[0] as { display_name?: string } | undefined)?.display_name ?? 'Alguem';
}

export function createNotificationService(db: Db) {
  return {
    async create(input: CreateNotificationInput) {
      await db.pool.query(
        `INSERT INTO notifications (user_id, type, title, description, payload)
         VALUES ($1, $2, $3, $4, $5::jsonb)`,
        [input.userId, input.type, input.title, input.description, JSON.stringify(input.payload ?? {})]
      );
    },

    async notifySystem(input: { userId: string; title: string; description: string; payload?: Record<string, unknown> }) {
      await this.create({
        userId: input.userId,
        type: 'system',
        title: input.title,
        description: input.description,
        payload: input.payload
      });
    },

    async notifyMatchCreated(input: { userAId: string; userBId: string }) {
      const [nameA, nameB] = await Promise.all([
        getDisplayName(db, input.userAId),
        getDisplayName(db, input.userBId)
      ]);

      await Promise.all([
        this.create({
          userId: input.userAId,
          type: 'match',
          title: `Novo match com ${nameB}`,
          description: `${nameB} curtiu voce de volta. Agora voces podem conversar no chat.`,
          payload: { screen: 'CHAT', actionLabel: 'Abrir conversas', counterpartName: nameB }
        }),
        this.create({
          userId: input.userBId,
          type: 'match',
          title: `Novo match com ${nameA}`,
          description: `${nameA} curtiu voce de volta. Agora voces podem conversar no chat.`,
          payload: { screen: 'CHAT', actionLabel: 'Abrir conversas', counterpartName: nameA }
        })
      ]);
    },

    async notifySuperlikeReceived(input: { recipientUserId: string; senderUserId: string }) {
      const senderName = await getDisplayName(db, input.senderUserId);
      await this.create({
        userId: input.recipientUserId,
        type: 'superlike',
        title: `${senderName} enviou um superlike`,
        description: 'Seu perfil ganhou destaque. Vale a pena conferir essa curtida agora.',
        payload: { screen: 'LIKES', actionLabel: 'Ver curtidas', counterpartName: senderName }
      });
    },

    async notifyMessageReceived(input: { recipientUserId: string; senderUserId: string; text: string }) {
      const senderName = await getDisplayName(db, input.senderUserId);
      const preview = input.text.trim().slice(0, 80);
      await this.create({
        userId: input.recipientUserId,
        type: 'message',
        title: `Nova mensagem de ${senderName}`,
        description: preview.length > 0 ? preview : `${senderName} enviou uma mensagem.`,
        payload: { screen: 'CHAT', actionLabel: 'Responder agora', counterpartName: senderName }
      });
    },

    async notifyWelcome(input: { userId: string; requiresEmailVerification: boolean }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Conta criada com sucesso',
        description: input.requiresEmailVerification
          ? 'Confirme seu email para liberar o fluxo completo do app.'
          : 'Sua conta ja esta pronta para uso.',
        payload: { screen: 'EDIT_PROFILE', actionLabel: 'Completar perfil' }
      });
    },

    async notifyEmailVerified(input: { userId: string }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Email confirmado',
        description: 'Seu email foi confirmado com sucesso.',
        payload: { screen: 'SECURITY', actionLabel: 'Revisar seguranca' }
      });
    },

    async notifyPasswordChanged(input: { userId: string; source: 'reset' | 'change' }) {
      await this.notifySystem({
        userId: input.userId,
        title: input.source === 'reset' ? 'Senha redefinida' : 'Senha alterada',
        description:
          input.source === 'reset'
            ? 'Sua senha foi redefinida com sucesso. Se nao foi voce, altere novamente e revise o acesso da conta.'
            : 'Sua senha foi alterada com sucesso. Guarde a nova credencial em um lugar seguro.',
        payload: { screen: 'SECURITY', actionLabel: 'Abrir seguranca', source: input.source }
      });
    },

    async notifyReportReceived(input: { userId: string; offenderName: string }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Denuncia recebida',
        description: `Recebemos sua denuncia contra ${input.offenderName}. Nossa equipe vai analisar o caso.`,
        payload: { screen: 'REPORT_LIST', actionLabel: 'Acompanhar denuncia', offenderName: input.offenderName }
      });
    },

    async notifyBillingPaymentSucceeded(input: { userId: string; plan: string }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Pagamento confirmado',
        description: `Seu pagamento do plano ${input.plan} foi confirmado e os beneficios premium ja estao liberados.`,
        payload: { screen: 'PAYMENT_HISTORY', actionLabel: 'Ver pagamentos', plan: input.plan }
      });
    },

    async notifyBillingPaymentFailed(input: { userId: string; plan?: string | null }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Falha no pagamento',
        description: input.plan
          ? `Nao conseguimos confirmar a cobranca do plano ${input.plan}. Atualize a forma de pagamento para manter o premium.`
          : 'Nao conseguimos confirmar uma cobranca do premium. Atualize a forma de pagamento para evitar interrupcoes.',
        payload: { screen: 'PAYMENT_HISTORY', actionLabel: 'Resolver pagamento', plan: input.plan ?? null }
      });
    },

    async notifyBillingCancellationScheduled(input: { userId: string; plan?: string | null }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Cancelamento agendado',
        description: input.plan
          ? `O cancelamento do plano ${input.plan} foi agendado para o fim do ciclo atual.`
          : 'O cancelamento do premium foi agendado para o fim do ciclo atual.',
        payload: { screen: 'PAYMENT_HISTORY', actionLabel: 'Ver assinatura', plan: input.plan ?? null }
      });
    }
  };
}