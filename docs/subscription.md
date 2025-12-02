# Abonelik Sistemi (Stripe)

## Planlar
| Plan | Özellik |
|------|---------|
| Aylık | Tüm yazılar |
| Yıllık | Tüm yazılar + eski sayılar |
| VIP | PDF indirilebilir + özel sesli içerik |

## Akış
1. Kullanıcı plan seçer, Stripe Checkout başlatılır.
2. Ödeme tamamlanınca Stripe webhook tetiklenir.
3. Webhook → DB’de `Subscription.status = active`, `plan`, `expiresAt`, `stripeId` güncellenir.
4. Middleware abonelik gerektiren rotalarda bu durumu okur; yetkisizse yönlendirir.

## Middleware Kontrolleri
- `/yazi/[slug]`: Abone değilse içerik %40’ta kesilir, overlay gösterilir.
- `/dergi/*`: Sadece aboneler; VIP planı PDF indirme izni alır.
- `/profil/*`: Giriş zorunlu; abonelik bilgisi yanında gösterilir.

```ts
// middleware.ts iskeleti
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/dergi", "/profil", "/admin"];

export async function middleware(req: Request) {
  const url = new URL(req.url);
  if (!PROTECTED.some((p) => url.pathname.startsWith(p))) return NextResponse.next();

  const session = await getSession(req);
  if (!session?.user) return NextResponse.redirect(new URL("/abonelik", url.origin));

  if (url.pathname.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  if (url.pathname.startsWith("/dergi") && session.user.subscriptionStatus !== "active") {
    return NextResponse.redirect(new URL("/abonelik", url.origin));
  }

  return NextResponse.next();
}
```

## API Uçları
- `POST /api/subscription/checkout`: Checkout linki oluşturur, client’a döner.
- `POST /api/subscription/webhook`: Stripe imzası doğrulanır, abonelik güncellenir.
- `GET /api/subscription/status`: Kullanıcı abonelik durumunu döner.

## İstemci Entegrasyonu
- Abonelik butonları `checkoutUrl` alıp `redirectToCheckout` yapar.
- Webhook tamamlandığında kullanıcı `status` endpoint’inden güncel bilgiyi alır.
- Server Actions ile plan seçimi sonrası redirect yapılabilir.

## Stripe Güvenliği
- Webhook imza doğrulaması zorunlu (`STRIPE_WEBHOOK_SECRET`).
- Plan kimlikleri backend’de sabit tanımlanır; client’tan gelen değerler doğrulanır.
- Fiyatlar Stripe’ta yönetilir; client sadece plan kodunu iletir.
