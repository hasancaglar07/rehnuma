import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

const sections = [
  {
    title: "Konu",
    items: [
      "Bu sözleşme, Rehnüma dijital abonelik hizmetlerinin çevrimiçi satışına ilişkin koşulları kapsar.",
      "Ödeme tamamlandığında dijital içerik erişimi abonelik planına göre aktif edilir."
    ]
  },
  {
    title: "Ürün ve teslimat",
    items: [
      "Satın alınan hizmet dijital aboneliktir; fiziki teslimat yapılmaz.",
      "Erişim, kullanıcı hesabı üzerinden sağlanır ve plan süresi boyunca geçerlidir."
    ]
  },
  {
    title: "Cayma ve iptal",
    items: [
      "Dijital içerik hizmetlerinde cayma hakkı, mevzuat kapsamındaki istisnalara tabidir.",
      "İptal talepleri için destek ekibimizle iletişime geçebilirsiniz."
    ]
  }
];

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Rehnüma Kadın Dergisi",
  description: "Rehnüma abonelik hizmetleri için mesafeli satış sözleşmesi."
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 lg:py-16 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Güncellendi: 2024</p>
          <h1 className="text-3xl md:text-4xl font-serif">Mesafeli Satış Sözleşmesi</h1>
          <p className="text-lg text-muted-foreground">
            Rehnüma dijital abonelik hizmetlerinin çevrimiçi satışına dair temel şartlar aşağıda özetlenmiştir.
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
          <p className="text-sm uppercase tracking-[0.18em] text-primary/80">İletişim</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mesafeli satış süreçleri ve iade talepleriniz için{" "}
            <Link href="/iletisim" className="text-primary hover:underline">
              iletişim sayfasından
            </Link>{" "}
            bize ulaşabilirsiniz.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Satıcı Bilgileri</p>
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
