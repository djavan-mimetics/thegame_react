export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function wrapEmailHtml(input: { title: string; intro: string; ctaLabel: string; ctaUrl: string; body: string[] }) {
  const bodyHtml = input.body.map((line) => `<p style="margin:0 0 16px;color:#d1d5db;line-height:1.6;">${line}</p>`).join('');
  return `
  <div style="margin:0;padding:24px;background:#060816;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid rgba(236,72,153,.25);border-radius:20px;padding:32px;">
      <p style="margin:0 0 12px;color:#ec4899;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">The Game</p>
      <h1 style="margin:0 0 12px;color:#ffffff;font-size:28px;line-height:1.2;">${input.title}</h1>
      <p style="margin:0 0 24px;color:#9ca3af;line-height:1.6;">${input.intro}</p>
      ${bodyHtml}
      <div style="margin:28px 0;">
        <a href="${input.ctaUrl}" style="display:inline-block;background:#ec4899;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">${input.ctaLabel}</a>
      </div>
      <p style="margin:0 0 12px;color:#9ca3af;line-height:1.6;">Se o botão não funcionar, copie e cole este link no navegador:</p>
      <p style="margin:0 0 24px;word-break:break-all;"><a href="${input.ctaUrl}" style="color:#f472b6;">${input.ctaUrl}</a></p>
      <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">Se você não solicitou esta ação, pode ignorar este email com segurança.</p>
    </div>
  </div>`;
}

export function buildWelcomeVerificationEmail(input: { confirmationUrl: string }): EmailTemplate {
  return {
    subject: 'Bem-vindo ao The Game — confirme seu email',
    html: wrapEmailHtml({
      title: 'Confirme seu email',
      intro: 'Sua conta foi criada com sucesso. Agora falta apenas confirmar seu endereço de email para validar seu cadastro.',
      ctaLabel: 'Confirmar email',
      ctaUrl: input.confirmationUrl,
      body: [
        'Clique no botão abaixo para confirmar seu email e concluir a ativação da sua conta.',
        'Depois da confirmação, seu cadastro continuará válido normalmente dentro do app.'
      ]
    }),
    text: [
      'Bem-vindo ao The Game.',
      'Confirme seu email acessando o link abaixo:',
      input.confirmationUrl
    ].join('\n\n')
  };
}

export function buildPasswordResetEmail(input: { resetUrl: string; expiresInMinutes: number }): EmailTemplate {
  return {
    subject: 'The Game — redefinição de senha',
    html: wrapEmailHtml({
      title: 'Redefina sua senha',
      intro: 'Recebemos uma solicitação para alterar sua senha no The Game.',
      ctaLabel: 'Criar nova senha',
      ctaUrl: input.resetUrl,
      body: [
        'Este link é de uso único e permitirá definir uma nova senha com segurança.',
        `Por segurança, o link expira em ${input.expiresInMinutes} minutos.`
      ]
    }),
    text: [
      'Recebemos uma solicitação para redefinir sua senha no The Game.',
      'Este link é de uso único:',
      input.resetUrl,
      `Expiração: ${input.expiresInMinutes} minutos.`
    ].join('\n\n')
  };
}
