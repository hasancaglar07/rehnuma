# Eksikler Listesi (Dokümantasyon ↔ Uygulama)

## Yönetim Paneli
- [x] Yazı yönetimi: Zengin metin editörü, kategori seçimi, taslak/yayınla durumu, Blob ile görsel/ses upload eklendi.
- [x] Dergi yönetimi: PDF upload entegrasyonu (Blob), kapak gösterimi tamamlandı; yazı iliştirme/hakemlik eklendi.
- [x] Kategori yönetimi: CRUD + sıralama arayüzü eklendi.
- [x] Kullanıcı yönetimi: Ban/rol güncelleme ve abonelik bilgisi listesi eklendi (abonelik statüsü manuel güncelleme yok).
- [x] Dashboard: Son olaylar, en çok okunanlar grafikleri eklendi; metrikler görselleştirildi.

## API ve Doğrulama
- [x] Tüm mutasyon uçlarında zod şemaları ve düzgün hata mesajları.
- [x] Admin yetkisi: Cookie yerine veritabanı kontrolü; server actions/route handlers’da tekrar kullanım.
- [x] Mutasyon sonrası ISR revalidate (`revalidatePath`) tetiklemeleri (bazı uçlarda eklendi, tam değil).
- [x] Rate limiting: Upstash gibi kalıcı bir katman; şu an bellek içi.
- [x] Auth: Session cookie üretimi gerçek kimlik doğrulama sağlayıcısı ile; şifre hash ve seeding iyileştirme.

## Abonelik ve Dergi Akışı
- [x] Plan bazlı `expiresAt` hesaplama, VIP plan için PDF indirme izni (VIP dışında indirme kapalı).
- [x] `/dergi` sayfası abonelik önizlemesi ve VIP indirme butonu; middleware dergi arşivini serbest, detayları koruyor.
- [x] Flipbook viewer (react-flipbook) entegrasyonu ve lazy yükleme; iframe yerine.
- [x] Webhook: Stripe event’lerinde plan/metada doğrulama, hata loglama, imza doğrulama konfigürasyonu.
- [x] Checkout: Plan kodu doğrulama eklendi; `NEXT_PUBLIC_URL` zorunluluğu kontrolü eklendi.

## Kullanıcı Akışları
- [x] Yazıda “Kaydet” ve “Okuma ilerlemesi” aksiyonları; ilgili API/server actions.
- [x] Profil/kaydedilenler/okuma-geçmişi sayfalarında optimistik güncelleme ve skeleton/boş durum iyileştirmesi.
- [x] Yazı sayfasında font-size kontrolü ve ilerleme barı (paywall sonrası).
- [x] Abonelik sayfasında plan fiyatları, avantaj listeleri; checkout hata yönetimi/toast.

## İçerik ve Veri Besleme
- [x] Ana sayfa ve vitrinler (öne çıkan, kategoriler, dergi) gerçek veriden çekilmeli; şu an statik örnekler.
- [x] Kategori sayfası excerpt/özet için truncate/HTML temizliği.
- [x] `Issue` kapak görseli alanı ve gösterimi.
- [x] Seed verisi: Örnek yazılar/kapaklar/audio bağlantıları, VIP plan testi.

## SEO ve Performans
- [x] `generateMetadata` ile dinamik canonical/OG; OG image generator varyantları (yazı, dergi).
- [x] Structured Data: Article schema, dergi için CreativeWork; paywall kısmında `data-nosnippet` (paywallda eklendi).
- [x] Sitemap: Güncel rotalar ve priority/lastmod hesaplaması.
- [x] ISR/Edge cache stratejisi: Public GET için cache headers; lazy bileşenlerde skeleton.
- [x] LCP/CLS iyileştirmeleri: `next/image` placeholders, sakura animasyonu throttle/mobil yoğunluk azaltma.

## Güvenlik
- [x] Stripe webhook: Env zorunlu kontroller, imza doğrulama hatalarında loglama/alert.
- [x] CSRF: Form POST’ları için token veya header doğrulaması; session cookie ayarları (SameSite/secure).
- [x] Dosya yükleme: İzinli MIME kontrolü, imzalı URL üretimi.
- [x] Middleware: `/dergi` önizleme serbest, `/dergi/*` için abonelik/VIP kontrolü; `/admin/*` rol kontrolü.
- [x] Loglarda PII maskeleme; audit trail (admin mutasyonları).

## Teknoloji ve UI Stack
- [x] Next.js 15’e yükseltme (App Router kullanımı korunarak), `@vercel/og` uyumluluğu.
- [x] shadcn/ui kurulumu ve `components/ui/*` altında atomların eklenmesi; mevcut tasarım token’larına uyum.
- [x] react-hook-form + zod ile form validasyonu (yeni yazı formu); reusable form bileşenleri eksik.
- [x] Vercel Blob entegrasyonu; upload helper’ları ve client uploader bileşenleri eklendi.

## DevOps ve İzleme
- [x] `.env.example` güncellemesi: Stripe price ID’leri, Blob token, DB URL.
- [x] Prisma migrasyonlarının üretilip CI’da çalışması; `prisma:deploy` pipeline adımı.
- [x] Vercel proje ayarları: Edge/Node runtime seçimi, preview/prod env ayrımı.
- [x] Loglama/izleme: Stripe event log relay, Vercel log uyarıları; (opsiyonel) rate-limit metrikleri.

## Testler
- [x] API route handler’ları için birim/entegrasyon test iskeleti (fetch-mock/prisma test client).
- [x] Paywall, abonelik ve middleware akışları için e2e senaryolar (ör. Playwright).
