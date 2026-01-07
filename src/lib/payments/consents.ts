export const PAYMENT_CONSENTS = [
  {
    type: "kvkk",
    label: "KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum.",
    url: "/gizlilik-politikasi",
    version: "2024-01"
  },
  {
    type: "distance-sales",
    label: "Mesafeli Satış Sözleşmesi'ni okudum ve kabul ediyorum.",
    url: "/mesafeli-satis-sozlesmesi",
    version: "2024-01"
  },
  {
    type: "subscription",
    label: "Abonelik Sözleşmesi'ni okudum ve kabul ediyorum.",
    url: "/abonelik-sozlesmesi",
    version: "2024-01"
  }
] as const;

export type PaymentConsentType = (typeof PAYMENT_CONSENTS)[number]["type"];
