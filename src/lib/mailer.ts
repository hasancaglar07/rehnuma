import nodemailer from "nodemailer";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  const from = process.env.SMTP_FROM;

  if (!host || !from) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined
    });
  }

  return { transporter: cachedTransporter, from };
}

export async function sendMail(payload: MailPayload) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[mail] missing SMTP configuration");
    return { skipped: true };
  }

  await mailer.transporter.sendMail({
    from: mailer.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });

  return { skipped: false };
}
