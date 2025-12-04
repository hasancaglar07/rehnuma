import type { Metadata } from "next";
import Link from "next/link";

const principles = [
  {
    title: "Üyelik ve abonelik",
    detail:
      "Hesabınızı kişisel kullanım için oluşturursunuz; giriş bilgilerinizi üçüncü kişilerle paylaşmamakla yükümlüsünüz."
  },
  {
    title: "İçerik kullanımı",
    detail:
      "Dergideki yazı, görsel ve videolar teliflidir. Kaynak göstermeden kopyalama, yeniden yayınlama veya ticari kullanım yasaktır."
  },
  {
    title: "Davranış kuralları",
    detail:
      "Platformu kötüye kullanmamak, hukuka aykırı içerik paylaşmamak ve diğer kullanıcıların deneyimine zarar vermemek esastır."
  },
  {
    title: "Hizmet değişiklikleri",
    detail:
      "Rehnüma, yayın akışı, abonelik planları veya özelliklerde değişiklik yapabilir; güncellemeler makul süre önceden duyurulur."
  }
];

export const metadata: Metadata = {
  title: "Kullanım Şartları | Rehnüma Kadın Dergisi",
  description: "Rehnüma Kadın Dergisi dijital platformunun kullanım koşulları, telif ve sorumluluk ilkeleri."
};

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 lg:py-16 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Güncellendi: 2024</p>
          <h1 className="text-3xl md:text-4xl font-serif">Kullanım Şartları</h1>
          <p className="text-lg text-muted-foreground">
            Rehnüma Kadın Dergisi&apos;ni kullanarak aşağıdaki şartları kabul etmiş olursunuz. Platformu güvenli, saygılı ve
            telif haklarına uygun şekilde kullanmanız beklenir.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {principles.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-3"
            >
              <h2 className="text-xl font-serif">{item.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
          <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Sorumluluk ve hesaplar</p>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Hesabınızın güvenliği için güçlü parola kullanın; şüpheli etkinlik fark ettiğinizde derhal bildirerek hesabınızı
                geçici olarak askıya aldırabilirsiniz.
              </p>
              <p>
                Abonelik ve ödeme işlemleri güvenli ödeme sağlayıcıları üzerinden yürütülür. Plan değişiklikleri veya iptaller,
                yürürlükteki iptal politikası çerçevesinde uygulanır.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-primary/80">İletişim</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kullanım şartlarıyla ilgili sorular veya geri bildirimleriniz için{" "}
              <Link href="/iletisim" className="text-primary hover:underline">
                iletişim sayfasından
              </Link>{" "}
              bize ulaşabilirsiniz.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yasal bildirimler ve güncellemeler kayıtlı e-posta adresiniz üzerinden paylaşılır; iletişim bilgilerinizi güncel
              tutmanızı öneririz.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
