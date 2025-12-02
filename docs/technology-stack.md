# Teknoloji Yığını

## Frontend
- **Next.js 15 (App Router)**: SSR/ISR, route handlers, server actions, metadata API.
- **Typescript**: Tür güvenliği.
- **shadcn/ui + Radix Primitives**: Erişilebilir, tema dostu bileşen seti.
- **Tailwind CSS**: Yardımcı sınıf tabanlı stil; proje özel oklch teması override.
- **Sakura.js**: Hafif arka plan animasyonu; throttled kullanım.
- **react-hook-form + zod**: Form yönetimi + şema doğrulama.
- **react-flipbook**: PDF flipbook deneyimi (dergi).

## Backend
- **Next.js Route Handlers**: `/api/*` uçları için; edge/Node çalışma zamanı seçilebilir.
- **Server Actions**: Form submit ve mutasyonlar için; revalidate mekanizması.
- **Prisma ORM**: PostgreSQL şeması ve migrasyonlar.
- **PostgreSQL**: Ana veri deposu; kullanıcı, abonelik, içerik, dergi sayıları.
- **Stripe Subscriptions**: Checkout, webhook, plan yönetimi.
- **Vercel Blob**: PDF, kapak görselleri, ses dosyaları depolama.

## DevOps
- **Vercel**: Build & deploy, ISR/Edge cache.
- **Env Yönetimi**: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BLOB_READ_WRITE_TOKEN`.
- **Gözlem**: Vercel logları, Stripe dashboard; (opsiyonel) Upstash rate limiting.
