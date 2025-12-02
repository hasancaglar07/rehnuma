# Next.js Dosya Yapısı

```text
src/
 ├─ app/
 │   ├─ layout.tsx
 │   ├─ page.tsx
 │   ├─ abonelik/
 │   ├─ kategori/[slug]/
 │   ├─ yazi/[slug]/
 │   ├─ dergi/
 │   ├─ profil/
 │   └─ admin/
 │       ├─ yazilar/
 │       ├─ dergi/
 │       ├─ kategoriler/
 ├─ components/
 ├─ lib/
 ├─ db/
 ├─ styles/
 ├─ hooks/
 └─ utils/
```

## Dizin Prensipleri
- **app/**: App Router segmentleri; server + client bileşen karışımı. Route-level loading/error/templates burada.
- **components/**: Atomic design hiyerarşisinde UI parçaları; client veya server olarak işaretlenir.
- **lib/**: Ortak yardımcılar (auth, stripe client, blob, rate limit).
- **db/**: Prisma client ve şema ile ilişkili yardımcılar.
- **styles/**: Global CSS, theme override, tailwind config uzantıları.
- **hooks/**: Reusable React hook’ları (tema toggle, okuma ilerlemesi vb.).
- **utils/**: Saf yardımcı fonksiyonlar, formatlayıcılar.

## Segment Detayları
- `app/page.tsx`: Ana sayfa; hero, öne çıkan yazılar, kategori vitrinleri, dergi vitrini.
- `app/abonelik`: Plan seçimi, Stripe Checkout yönlendirme.
- `app/kategori/[slug]`: Kategori liste sayfası; ISR/SSG.
- `app/yazi/[slug]`: Yazı detay; paywall ve audio player.
- `app/dergi`: Dergi arşivi/kapaklar; abonelik kontrolü.
- `app/dergi/[year-month]`: Flipbook PDF görüntüleme; Blob’dan çekilir.
- `app/profil`: Kullanıcı paneli; abonelik durumu, kişisel bilgiler.
- `app/profil/kaydedilenler`: Kaydedilen yazılar.
- `app/profil/okuma-gecmisi`: Okuma ilerlemeleri.
- `app/admin/*`: Yönetim modülleri (yazı, dergi, kategori, dashboard).

## Konvansiyonlar
- **Route Handlers**: `app/api/**/route.ts` içinde; HTTP metodu bazlı fonksiyonlar.
- **Server Actions**: `use server` direktifiyle bileşen/route içinde tanımlı; form submit sonrası `revalidatePath`.
- **Metadata**: Segment bazlı `generateMetadata`.
- **Revalidation**: İçerik mutasyonlarından sonra ilgili sayfaları revalidate etmek.
- **Client/Server Split**: UI bileşenleri default server; interaktivite için `use client`.
