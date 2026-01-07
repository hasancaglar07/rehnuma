import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const sections = [
  {
    title: "Hizmet kapsamı",
    items: [
      "Abonelik, dijital dergi içeriklerine erişim sağlar; plan süresi boyunca aktiftir.",
      "Yıllık plan arşiv erişimini ve PDF indirme haklarını içerir."
    ]
  },
  {
    title: "Plan süresi ve yenileme",
    items: [
      "Abonelik süresi satın alınan paket ve adet üzerinden hesaplanır.",
      "Süre sonunda erişim otomatik olarak sona erer; yeni ödeme ile uzatılır."
    ]
  },
  {
    title: "Kullanım koşulları",
    items: [
      "Abonelik kişisel kullanım içindir; paylaşım veya yeniden satış yapılamaz.",
      "Hesap güvenliği kullanıcı sorumluluğundadır."
    ]
  }
];

export const metadata: Metadata = {
  title: "Abonelik Sözleşmesi | Rehnüma Kadın Dergisi",
  description: "Rehnüma abonelik hizmeti sözleşme şartları."
};

export default function AbonelikSozlesmesiPage() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 lg:py-16 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Güncellendi: 2024</p>
          <h1 className="text-3xl md:text-4xl font-serif">Abonelik Sözleşmesi</h1>
          <p className="text-lg text-muted-foreground">
            Rehnüma dijital abonelik hizmetlerinden faydalanırken geçerli olan temel şartlar aşağıda yer alır.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-3"
            >
              <h2 className="text-xl font-serif">{section.title}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Soru & destek</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Abonelik şartlarıyla ilgili sorularınız için{" "}
            <Link href="/iletisim" className="text-primary hover:underline">
              iletişim sayfamızdan
            </Link>{" "}
            bize ulaşabilirsiniz.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Hizmet Sağlayıcı</p>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>Unvan: {COMPANY_INFO.name}</p>
            <p>Adres: {COMPANY_INFO.address}</p>
            {COMPANY_INFO.taxOffice && <p>Vergi Dairesi: {COMPANY_INFO.taxOffice}</p>}
            {COMPANY_INFO.taxNo && <p>Vergi No: {COMPANY_INFO.taxNo}</p>}
            {COMPANY_INFO.mersis && <p>MERSIS: {COMPANY_INFO.mersis}</p>}
            {COMPANY_INFO.phone && <p>Telefon: {COMPANY_INFO.phone}</p>}
            <p>E-posta: {COMPANY_INFO.email}</p>
            <p>Web: {COMPANY_INFO.website}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
