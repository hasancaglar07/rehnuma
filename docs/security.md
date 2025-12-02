# Güvenlik Önlemleri

## Stripe Webhook
- İmza doğrulaması (`STRIPE_WEBHOOK_SECRET`) zorunlu.
- Body ham metin olarak okunur; doğrulama sonrası işlenir.

## Rate Limiting
- Upstash (veya eşdeğeri) ile API çağrı limitleri; özellikle auth ve checkout uçları.

## CSRF ve Auth
- Session cookie’leri `HttpOnly`, `Secure`, `SameSite=Lax`.
- Form POST’larında CSRF token; server actions otomatik koruma + ek kontrol gerekirse header doğrulaması.

## Middleware ve Yetki
- `/admin/*` role check (admin).
- `/dergi/*` ve tam yazı içerikleri abonelik kontrolü.
- Auth gerektiren sayfalar için yönlendirme.

## Girdi Doğrulama
- zod şemaları: auth, yazı/dergi/kategori CRUD, checkout plan kodu.
- Prisma katmanında tip güvenliği; slug/ID doğrulaması.

## Dosya Yükleme
- Blob upload URL’leri backend tarafından üretilir; izinli mime tipleri.
- PDF/audio/görsel linkleri imzalı veya erişim kısıtlı konumdan çekilir (Blob token).

## Diğer
- HTTPS varsayımı (Vercel).
- Loglarda PII maskeleme (e-posta kısmi); Stripe event logları güvenli yönetim.
