import type { Metadata } from "next";

const cookieTypes = [
  {
    title: "Zorunlu çerezler",
    detail: "Oturum açma, kimlik doğrulama ve güvenlik için gereklidir. Bu çerezler olmadan site çalışmaz."
  },
  {
    title: "Tercih çerezleri",
    detail: "Dil, görüntüleme seçenekleri ve kullanıcı deneyimi ayarlarınızı hatırlamak için kullanılır."
  },
  {
    title: "Performans ve analitik",
    detail: "Sayfa performansını ölçmek, hataları saptamak ve içerik tercihlerini anlamak için anonim veriler toplar."
  },
  {
    title: "Üçüncü taraf içerikleri",
    detail: "Gömülü video, harici font veya analiz sağlayıcıları kendi çerezlerini yerleştirebilir."
  }
];

export const metadata: Metadata = {
  title: "Çerez Politikası | Rehnüma Kadın Dergisi",
  description: "Çerez kullanım amaçlarımız, türleri ve tercihlerinizi nasıl yönetebileceğinizi öğrenin."
};

export default function CerezPolitikasiPage() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 lg:py-16 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Güncellendi: 2024</p>
          <h1 className="text-3xl md:text-4xl font-serif">Çerez Politikası</h1>
          <p className="text-lg text-muted-foreground">
            Çerezler; siteyi güvenli, hızlı ve kişiselleştirilmiş şekilde sunmak için kullandığımız küçük metin dosyalarıdır.
            Aşağıda çerez türleri, kullanım amaçları ve tercihlerinizi nasıl yönetebileceğiniz özetlenir.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cookieTypes.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-3"
            >
              <p className="text-sm uppercase tracking-[0.18em] text-primary/80">Çerez kategorisi</p>
              <h2 className="text-xl font-serif">{item.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
          <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-3">
            <h3 className="text-2xl font-serif">Tercihlerinizi yönetme</h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" aria-hidden />
                <span>Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" aria-hidden />
                <span>Reklam/izleme çerezlerini kapatmak için “Do Not Track” veya takip koruma ayarlarını kullanabilirsiniz.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" aria-hidden />
                <span>Çerezleri devre dışı bırakmak bazı özelliklerin (giriş, tercih hatırlama) çalışmamasına neden olabilir.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-3">
            <h3 className="text-2xl font-serif">Saklama süreleri</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Oturum çerezleri tarayıcıyı kapattığınızda silinir; kalıcı çerezler ise kullanım amacına bağlı olarak birkaç
              gün ile birkaç ay arasında tutulur. Tarayıcı ayarlarınızdan bu süreleri dilediğiniz an kısaltabilir veya
              çerezleri manuel olarak silebilirsiniz.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
