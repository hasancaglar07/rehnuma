import { COMPANY_INFO } from "@/lib/company-info";
import { sendMail } from "@/lib/mailer";
import { formatTryAmount } from "@/lib/payments/plans";
import { getBaseUrl } from "@/lib/url";

type PaymentNoticeBase = {
  userEmail: string | null;
  userName?: string | null;
  planTitle: string;
  amountCents: number;
  orderId: string;
  paymentId: string;
};

type RefundNotice = PaymentNoticeBase & {
  refundedAmountCents: number;
  isPartial: boolean;
};

function getAdminEmail() {
  return process.env.PAYMENT_NOTIFICATION_EMAIL || COMPANY_INFO.email;
}

export async function sendPaymentSuccessEmail(data: PaymentNoticeBase) {
  const subject = "Odeme basarili";
  const baseUrl = getBaseUrl();
  if (data.userEmail) {
    const text = [
      `Merhaba${data.userName ? " " + data.userName : ""},`,
      "",
      "Odeminiz basariyla alindi.",
      `Plan: ${data.planTitle}`,
      `Tutar: ${formatTryAmount(data.amountCents)}`,
      `Siparis: ${data.orderId}`,
      "",
      `Profil: ${baseUrl}/profil`,
      `Destek: ${COMPANY_INFO.email}`
    ].join("\n");
    const html = [
      `<p>Merhaba${data.userName ? " " + data.userName : ""},</p>`,
      "<p>Odeminiz basariyla alindi.</p>",
      `<p><strong>Plan:</strong> ${data.planTitle}<br/>`,
      `<strong>Tutar:</strong> ${formatTryAmount(data.amountCents)}<br/>`,
      `<strong>Siparis:</strong> ${data.orderId}</p>`,
      `<p><a href="${baseUrl}/profil">Profilinizi goruntuleyin</a></p>`,
      `<p>Destek: ${COMPANY_INFO.email}</p>`
    ].join("");

    await sendMail({ to: data.userEmail, subject, text, html });
  }

  const adminEmail = getAdminEmail();
  if (adminEmail && adminEmail !== data.userEmail) {
    const adminText = [
      "Yeni odeme alindi.",
      `Kullanici: ${data.userEmail}`,
      `Plan: ${data.planTitle}`,
      `Tutar: ${formatTryAmount(data.amountCents)}`,
      `Siparis: ${data.orderId}`,
      `Odeme ID: ${data.paymentId}`
    ].join("\n");
    await sendMail({ to: adminEmail, subject: "Yeni odeme alindi", text: adminText });
  }
}

export async function sendPaymentRefundEmail(data: RefundNotice) {
  const subject = data.isPartial ? "Odeme kismi iade" : "Odeme iade";
  if (data.userEmail) {
    const text = [
      `Merhaba${data.userName ? " " + data.userName : ""},`,
      "",
      data.isPartial ? "Odeminiz kismen iade edildi." : "Odeminiz iade edildi.",
      `Plan: ${data.planTitle}`,
      `Iade: ${formatTryAmount(data.refundedAmountCents)}`,
      `Siparis: ${data.orderId}`,
      "",
      `Destek: ${COMPANY_INFO.email}`
    ].join("\n");
    const html = [
      `<p>Merhaba${data.userName ? " " + data.userName : ""},</p>`,
      `<p>${data.isPartial ? "Odeminiz kismen iade edildi." : "Odeminiz iade edildi."}</p>`,
      `<p><strong>Plan:</strong> ${data.planTitle}<br/>`,
      `<strong>Iade:</strong> ${formatTryAmount(data.refundedAmountCents)}<br/>`,
      `<strong>Siparis:</strong> ${data.orderId}</p>`,
      `<p>Destek: ${COMPANY_INFO.email}</p>`
    ].join("");
    await sendMail({ to: data.userEmail, subject, text, html });
  }

  const adminEmail = getAdminEmail();
  if (adminEmail && adminEmail !== data.userEmail) {
    const adminText = [
      data.isPartial ? "Odeme kismi iade edildi." : "Odeme iade edildi.",
      `Kullanici: ${data.userEmail}`,
      `Plan: ${data.planTitle}`,
      `Iade: ${formatTryAmount(data.refundedAmountCents)}`,
      `Siparis: ${data.orderId}`,
      `Odeme ID: ${data.paymentId}`
    ].join("\n");
    await sendMail({ to: adminEmail, subject, text: adminText });
  }
}

export async function sendPaymentCancelEmail(data: PaymentNoticeBase) {
  const subject = "Odeme iptal";
  if (data.userEmail) {
    const text = [
      `Merhaba${data.userName ? " " + data.userName : ""},`,
      "",
      "Odeminiz iptal edildi.",
      `Plan: ${data.planTitle}`,
      `Tutar: ${formatTryAmount(data.amountCents)}`,
      `Siparis: ${data.orderId}`,
      "",
      `Destek: ${COMPANY_INFO.email}`
    ].join("\n");
    const html = [
      `<p>Merhaba${data.userName ? " " + data.userName : ""},</p>`,
      "<p>Odeminiz iptal edildi.</p>",
      `<p><strong>Plan:</strong> ${data.planTitle}<br/>`,
      `<strong>Tutar:</strong> ${formatTryAmount(data.amountCents)}<br/>`,
      `<strong>Siparis:</strong> ${data.orderId}</p>`,
      `<p>Destek: ${COMPANY_INFO.email}</p>`
    ].join("");
    await sendMail({ to: data.userEmail, subject, text, html });
  }

  const adminEmail = getAdminEmail();
  if (adminEmail && adminEmail !== data.userEmail) {
    const adminText = [
      "Odeme iptal edildi.",
      `Kullanici: ${data.userEmail}`,
      `Plan: ${data.planTitle}`,
      `Tutar: ${formatTryAmount(data.amountCents)}`,
      `Siparis: ${data.orderId}`,
      `Odeme ID: ${data.paymentId}`
    ].join("\n");
    await sendMail({ to: adminEmail, subject, text: adminText });
  }
}
