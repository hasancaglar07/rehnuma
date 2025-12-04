# Deployment ve Environment Yönetimi

## Hedef Platform
- **Vercel**: Next.js 16, ISR/Edge cache desteği; Blob entegrasyonu.

## Environment Değişkenleri
- `DATABASE_URL` (PostgreSQL/Supabase/Neon)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_URL` (checkout success/cancel için)

## Build & Çalışma Zamanı
- `next build` → Vercel otomatik.
- Route handlers için edge veya node runtime seçimi; webhook için Node önerilir.
- ISR revalidation Vercel tarafından yönetilir.
- Preview/Production environment ayrımı: `DATABASE_URL`, `STRIPE_*`, `BLOB_READ_WRITE_TOKEN`, `UPSTASH_*` değişkenleri hem preview hem prod ortamlarında ayrı tutulur.
- Proje ayarlarında default runtime Node, `/api/subscription/webhook` Node, `/og` Edge olarak bırakılmalı.

## Webhook Kurulumu
- Stripe dashboard’dan endpoint: `/api/subscription/webhook`.
- İmza doğrulaması için `STRIPE_WEBHOOK_SECRET`.

## Veritabanı
- Managed PostgreSQL (Supabase/Neon).
- Prisma migrasyonları deploy öncesi uygulanır (`prisma migrate deploy`).

## Blob Depolama
- Vercel Blob token’ı production ortamına eklenir.
- PDF/kapak/audio yükleme için imzalı URL’ler.

## İzleme ve Loglar
- Vercel logs (build/runtime), Stripe event logs.
- (Opsiyonel) Uptime ve error alert’leri.
- Stripe webhook hataları ve rate-limit olayları Vercel loglarına düşer; gerektiğinde Slack/Webhook alert eklenebilir.

## Sürümleme ve Rollback
- Git push → Preview → Production promote.
- ISR sayfaları revalidate; kritik içerik değişikliklerinde manual revalidate endpoint (opsiyonel).
