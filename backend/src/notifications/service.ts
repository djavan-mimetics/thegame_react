import type { Db } from '../db.js';

type NotificationType = 'match' | 'message' | 'superlike' | 'system';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
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
        `INSERT INTO notifications (user_id, type, title, description)
         VALUES ($1, $2, $3, $4)`,
        [input.userId, input.type, input.title, input.description]
      );
    },

    async notifySystem(input: { userId: string; title: string; description: string }) {
      await this.create({
        userId: input.userId,
        type: 'system',
        title: input.title,
        description: input.description
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
          description: 'Agora voces podem conversar no chat.'
        }),
        this.create({
          userId: input.userBId,
          type: 'match',
          title: `Novo match com ${nameA}`,
          description: 'Agora voces podem conversar no chat.'
        })
      ]);
    },

    async notifyMessageReceived(input: { recipientUserId: string; senderUserId: string; text: string }) {
      const senderName = await getDisplayName(db, input.senderUserId);
      const preview = input.text.trim().slice(0, 80);
      await this.create({
        userId: input.recipientUserId,
        type: 'message',
        title: `Nova mensagem de ${senderName}`,
        description: preview.length > 0 ? preview : `${senderName} enviou uma mensagem.`
      });
    },

    async notifyWelcome(input: { userId: string; requiresEmailVerification: boolean }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Conta criada com sucesso',
        description: input.requiresEmailVerification
          ? 'Confirme seu email para liberar o fluxo completo do app.'
          : 'Sua conta ja esta pronta para uso.'
      });
    },

    async notifyEmailVerified(input: { userId: string }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Email confirmado',
        description: 'Seu email foi confirmado com sucesso.'
      });
    },

    async notifyReportReceived(input: { userId: string; offenderName: string }) {
      await this.notifySystem({
        userId: input.userId,
        title: 'Denuncia recebida',
        description: `Recebemos sua denuncia contra ${input.offenderName}. Nossa equipe vai analisar o caso.`
      });
    }
  };
}