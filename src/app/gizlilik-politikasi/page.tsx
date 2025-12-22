import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

const sections = [
  {
    title: "Topladığımız bilgiler",
    items: [
      "Üyelik ve abonelik için ad, e-posta ve ödeme sağlayıcısına iletilen temel fatura bilgileri.",
      "Hizmet kalitesini ölçmek için cihaz/tarayıcı bilgisi, sayfa görüntüleme ve etkileşim verileri.",
      "Destek taleplerinde paylaştığınız mesajlar, ekran görüntüleri veya tercih ettiğiniz iletişim kanalı."
    ]
  },
  {
    title: "Verileri nasıl kullanıyoruz",
    items: [
      "Üyelik, giriş ve abonelik süreçlerini yürütmek; dijital dergiye erişimi sağlamak.",
      "İçerik deneyimini iyileştirmek, öne çıkan yazıları ve sayıları size daha iyi sunmak.",
      "Bilgilendirme e-postaları, abonelik hatırlatmaları ve kritik sistem duyuruları göndermek.",
      "Güvenlik takibi, dolandırıcılık önleme ve yasal yükümlülüklerimizi yerine getirmek."
    ]
  },
  {
    title: "Çerezler ve benzeri teknolojiler",
    items: [
      "Oturum ve kimlik doğrulama çerezleri: girişin korunması, seansın sürdürülmesi.",
      "Tercih çerezleri: dil ve görünüm ayarlarının hatırlanması.",
      "Performans/analitik: anonim kullanım istatistikleri ile iyileştirme yapılması.",
      "Gömülü içerikler (video vb.): Üçüncü taraf sağlayıcılar kendi çerezlerini kullanabilir."
    ]
  },
  {
    title: "Veri paylaşımı",
    items: [
      "Hizmet sağlayıcılar: ödeme ve altyapı hizmetleriyle sınırlı, sözleşmesel veri paylaşımı.",
      "Yasal gereklilikler: Mahkeme veya resmi makam taleplerinde zorunlu paylaşımlar.",
      "Anonimleştirilmiş raporlar: Kişisel olarak tanımlayıcı bilgileri içermeyen istatistikler."
    ]
  },
  {
    title: "Saklama ve güvenlik",
    items: [
      "Veriler, hizmeti sunmak için gereken süre boyunca ve yasal saklama süreleri boyunca tutulur.",
      "Güvenli bağlantı (HTTPS) ve erişim kontrolleri uygulanır; ihtiyaç duyulan minimum veri toplanır.",
      "Talebiniz üzerine hesabınızı ve ilişkili verileri (yasal zorunluluklar hariç) silebiliriz."
    ]
  }
];

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Rehnüma Kadın Dergisi",
  description:
    "Rehnüma Kadın Dergisi olarak kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgi edinin."
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 lg:py-16 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Güncellendi: 2024</p>
          <h1 className="text-3xl md:text-4xl font-serif">Gizlilik Politikası</h1>
          <p className="text-lg text-muted-foreground">
            Rehnüma Kadın Dergisi olarak kişisel verilerinizi KVKK ve ilgili mevzuata uygun, şeffaf ve ölçülü şekilde
            işleriz. Bu metin; hangi verileri neden topladığımızı, nasıl sakladığımızı ve haklarınızı özetler.
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

        <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Haklarınız</p>
              <h3 className="text-2xl font-serif">KVKK kapsamındaki talepler</h3>
            </div>
            <Link href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-muted-foreground">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Erişim ve düzeltme</p>
              <p>Hesap bilgilerinizdeki hataları düzeltebilir, veri erişim talebi oluşturabilirsiniz.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Silme ve itiraz</p>
              <p>Hesabınızın kapatılmasını ve kişisel verilerinizin (yasal zorunluluklar hariç) silinmesini talep edebilirsiniz.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ayrıca çerez tercihlerinizi tarayıcınızdan yönetebilir, analitik ve pazarlama çerezlerini reddedebilirsiniz.
            Ayrıntılar için <Link href="/cerez-politikasi" className="text-primary hover:underline">Çerez Politikası</Link>{" "}
            sayfasına göz atın.
          </p>
        </div>
      </main>
    </div>
  );
}
