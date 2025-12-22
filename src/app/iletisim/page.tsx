import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

const contactChannels = [
  {
    title: "Editoryal ve içerik",
    description: "Yazı önerileri, röportaj ve konu başlıkları için editoryal ekibe ulaşın.",
    detail: "İlham veren hikayeler ve özgün dosyalar için sizden gelecek fikirleri seviyoruz."
  },
  {
    title: "İşbirliği ve reklam",
    description: "Marka işbirlikleri, sponsorluk ve etkinlik talepleri için iletişim kurun.",
    detail: "Zarif, güven veren ve değer odaklı projeleri birlikte kurgulayalım."
  },
  {
    title: "Teknik ve abonelik desteği",
    description: "Üyelik, giriş veya ödeme adımlarında desteğe mi ihtiyacınız var?",
    detail: "Hesap, şifre veya erişim sorunlarında hızlıca yardımcı oluyoruz."
  }
];

export const metadata: Metadata = {
  title: "İletişim | Rehnüma Kadın Dergisi",
  description: "Editoryal, işbirliği veya abonelik desteği için Rehnüma Kadın Dergisi ekibiyle iletişime geçin."
};

export default function IletisimPage() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 lg:py-16 space-y-12">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Sizinle bağ kurmak için buradayız</p>
          <h1 className="text-3xl md:text-4xl font-serif">İletişim</h1>
          <p className="text-lg text-muted-foreground">
            Rehnüma Kadın Dergisi ekibiyle editoryal süreçler, işbirliği, abonelik ve teknik destek konularında hızlıca
            iletişime geçebilirsiniz. Mesajlarınıza en geç bir iş günü içinde dönüş yapmaya çalışıyoruz.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:-translate-y-0.5 transition"
            >
              E-posta Gönder
            </Link>
            <Link
              href="/abonelik"
              className="px-5 py-3 rounded-full border border-primary/30 bg-white text-primary hover:-translate-y-0.5 transition shadow-sm"
            >
              Abonelik Desteği
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {contactChannels.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm"
            >
              <p className="text-sm uppercase tracking-wide text-primary/80">{item.title}</p>
              <h2 className="mt-2 text-xl font-serif">{item.description}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
          <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Yanıt Süreci</p>
            <h3 className="text-2xl font-serif">En hızlı dönüş için küçük notlar</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" aria-hidden />
                <span>Konu satırında ihtiyacınızı kısaca paylaşın (örn. “Abonelik faturası”, “Yazı önerisi”).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" aria-hidden />
                <span>Teknik destek için mümkünse ekran görüntüsü ve tarayıcı bilgisi ekleyin.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" aria-hidden />
                <span>Hafta içi 10:00 – 18:00 arasında gönderilen mesajlara aynı gün yanıt vermeye çalışıyoruz.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-primary/80">İletişim Bilgileri</p>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="text-sm font-semibold text-foreground">E-posta</p>
                <Link href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                  {CONTACT_EMAIL}
                </Link>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Destek</p>
                <p>Abonelik, ödeme ve giriş sorunları için hızlı kontrol listesi ve destek akışı sağlıyoruz.</p>
                <Link href="/abonelik" className="text-primary hover:underline text-sm">
                  Abonelik sayfasına git
                </Link>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Basın ve işbirliği</p>
                <p>Basın bültenleri ve medya kitine erişim için talebinizi iletebilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
