# Rehnüma Platform Mimarisi

## Genel Yaklaşım
Rehnüma, Next.js 15 App Router üzerinde kurulu, hem SSR/ISR hem de Edge dostu bir dijital dergi platformudur. Sunum katmanı (UI) shadcn/ui + Tailwind ile tasarlanır, veri katmanı Prisma + PostgreSQL ile yönetilir ve ödeme/abonelik Stripe üzerinden yürütülür. Medya (PDF, görsel, ses) Vercel Blob’da tutulur; flipbook ve audio player bileşenleri lazy-load edilir. Kullanıcı yetkilendirmesi ve abonelik kontrolü middleware seviyesinde yapılır.

## Katmanlar
- **Sunum**: Next.js App Router sayfaları, client/server bileşen karışımı, global tema ve Sakura.js arka plan efekti.
- **Uygulama Mantığı**: Server Actions + Route Handlers (API). Form doğrulama zod + react-hook-form ile yapılır.
- **Veri Erişimi**: Prisma ORM; PostgreSQL üzerinde ilişki modeli; okuma/kaydetme/abonelik durumları tek kaynaklı.
- **Ödeme**: Stripe Checkout + Webhook; abonelik durumları DB’de tutulur; middleware abonelik gerektiren rotaları korur.
- **Depolama**: Vercel Blob; PDF (dergi sayıları), kapak görselleri, ses dosyaları.
- **Önbellek/Dağıtım**: ISR ve Edge Cache; Vercel üzerine otomatik deploy.

## Akışların Özet Diyagramı
1. Kullanıcı siteye gelir → public içerik SSR/ISR ile sunulur.
2. Abonelik gerektiren sayfa → middleware abonelik durumunu kontrol eder; yoksa abonelik sayfasına yönlendirir.
3. Ödeme → Stripe Checkout → webhook → `Subscription.status = active` güncellenir.
4. Yazı okuma: içerik %40 paywall (abonelik yoksa), tam içerik + audio + progress (abonelik varsa).
5. Dergi PDF: Blob üzerinden flipbook; yalnızca abonelere açık.

## Uygulama Bileşimi
- **App Router**: Route segmentleri ile public, profil ve admin alanları ayrılır.
- **State**: Minimal global state; tema/dark-mode toggle, okuma ilerlemesi client-side; veri güncellemeleri server actions + revalidate.
- **Yetkilendirme**: Rol bazlı (user/admin) ve abonelik statüsü birlikte değerlendirilir.

## Çapraz Kesit Konuları
- **Güvenlik**: Webhook imza doğrulama, rate limiting (Upstash), CSRF koruması, giriş/abonelik middleware.
- **Performans**: ISR, lazy-load, Sakura throttle, component-level stil, Edge-first API.
- **Gözlemlenebilirlik**: (Opsiyonel) Vercel logs + Stripe event logs; kritik akışlarda (checkout/webhook) structured logging.
