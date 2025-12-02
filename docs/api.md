# API Endpoint Dokümantasyonu

## Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```
- Register/Login server action veya route handler; zod doğrulama.
- Başarılı login sonrası session cookie set edilir.

## Yazılar
```
GET    /api/articles
GET    /api/articles/[slug]
POST   /api/articles/create
PUT    /api/articles/update
DELETE /api/articles/delete
```
- `GET /api/articles`: Listeleme, kategori filtresi; ISR/Edge cache uyumlu.
- `GET /api/articles/[slug]`: Yazı detayı; abonelik kontrolü view layer’da yapılır.
- Mutasyon uçları admin yetkisi gerektirir; body zod şeması ile doğrulanır.

## Dergi
```
GET  /api/issues
POST /api/issues/create
```
- `GET /api/issues`: Ay/yıl sıralı; kapak ve pdfUrl (abonelik kontrolü client/server).
- `POST /api/issues/create`: Admin; Blob upload edilmiş PDF URL’si bekler.

## Abonelik
```
POST /api/subscription/checkout
POST /api/subscription/webhook
GET  /api/subscription/status
```
- `checkout`: Plan kodu alır, Stripe Checkout URL döner.
- `webhook`: Stripe imza doğrulaması; abonelik kaydı/güncellemesi.
- `status`: Kullanıcının aktif plan/statü bilgisini döner.

## Örnek Route Handler (Checkout)
```ts
// app/api/subscription/checkout/route.ts
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plan } = await req.json();
  const priceId = getPriceId(plan); // backend sabitleri

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/profil`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/abonelik`,
  });
  return NextResponse.json({ url: session.url });
}
```

## Örnek Webhook Handler
```ts
// app/api/subscription/webhook/route.ts
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id!;
    await prisma.subscription.upsert({
      where: { userId },
      update: { status: "active", plan: session.metadata?.plan ?? "monthly" },
      create: { userId, status: "active", plan: session.metadata?.plan ?? "monthly", expiresAt: addMonths(new Date(), 1) },
    });
  }

  return new NextResponse("ok", { status: 200 });
}
```
