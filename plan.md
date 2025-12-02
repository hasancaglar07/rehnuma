# Rehnüma Kadın Dergisi — Teknik & İçerik Odaklı Tam Proje Dokümanı  
**Teknolojiler: Next.js 15, App Router, shadcn/ui, Tailwind CSS, Prisma, PostgreSQL, Stripe, Vercel Blob, Sakura.js**  
**Platform: Online İslami kadın dergisi + dijital abonelik sistemi**

---

# 1. PROJENİN GENEL AMACI
Rehnüma Kadın Dergisi, Müslüman kadınlara yönelik; annelik, aile, İslami ilimler, maneviyat, şiir, ev düzeni ve sesli içerik gibi alanlarda içerik sunan, modern ve zarif tasarımlı bir online dergi platformudur.

Platformun temel hedefleri:

- Dijital dergi aboneliğini yönetmek  
- Aylık sayılar yayımlamak  
- Kullanıcıların yazıları okuyabilmesini, kaydedebilmesini, sesli olarak dinleyebilmesini sağlamak  
- Ücretsiz & ücretli (abonelik gerektiren) içerik sunmak  
- Adminlerin tüm içerikleri, dergi sayıları ve kategorileri yönetmesini sağlamak  
- Sakura.js ile estetik bir arka plan oluşturmak  
- Next.js + Prisma yapısıyla modern ve verimli bir mimari kurmak  

---

# 2. HEDEF KİTLE
- Ev hanımları  
- Müslüman anneler  
- Genç kadınlar  
- Tasavvuf ve İslami ilimler ile ilgilenenler  
- Şiir ve ruhani yazıları sevenler  

Kullanıcı davranışı:
- %80 mobil kullanım  
- Gece okuma yüksek → Karanlık mod şart  
- Sesli içerik kullanımı yaygın  
- Basit navigasyon talebi  

---

# 3. KATEGORİLER (ANA İÇERİK YAPISI)
**Seçenek A doğrultusunda proje bu kategorileri kullanır:**

1. **Annelik & Çocuk**  
2. **Maneviyat & İslami İlimler**  
3. **Aile & Evlilik**  
4. **Ev ve Hayat**  
5. **Şiir & Edebiyat**  
6. **Sesli İçerikler**  
7. **Dijital Dergi (Aylık Sayılar)**  

---

# 4. TEKNOLOJİ YIĞINI (STACK)
## 4.1 Frontend
- **Next.js 15 (App Router)**  
- Typescript  
- shadcn/ui bileşenleri  
- Tailwind CSS  
- Sakura.js (background animasyonu)  
- react-hook-form + zod  
- react-flipbook (PDF flipbook görüntüleme)  
- Radix UI Primitives (shadcn içinde)  

## 4.2 Backend
- Next.js Server Actions  
- Prisma ORM  
- PostgreSQL  
- Stripe Subscriptions  
- Vercel Blob (PDF, görsel, ses dosyaları)  

## 4.3 DevOps
- Vercel Deploy  
- Environment variables:  
  - DATABASE_URL  
  - STRIPE_SECRET_KEY  
  - STRIPE_WEBHOOK_SECRET  
  - BLOB_READ_WRITE_TOKEN  

---

# 5. TASARIM & UI (shadcn + Tailwind)
## 5.1 shadcn Theme Override (Proje için sağlanan oklch theme)
Kullanılacak değişkenler:

```css
:root { 
  --radius: 0.65rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.586 0.253 17.585);
  --secondary: oklch(0.967 0.001 286.375);
  --accent: oklch(0.967 0.001 286.375);
  --border: oklch(0.92 0.004 286.32);
}
.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.645 0.246 16.439);
}
```

## 5.2 UI Stil İlkeleri
- Soft, zarif, minimal  
- Beyaz arka plan + mürdüm tonlu vurgu  
- Başlık fontu: serif (Playfair Display / Lora)  
- Metin fontu: Inter / Lora  
- Büyük boşluklar  
- Kart tabanlı içerik sunumu  

## 5.3 Arka Plan Efekti (Sakura)
Tüm sayfalarda:

```tsx
useEffect(() => {
  import('sakura-js').then(({ default: Sakura }) => new Sakura('body'));
}, []);
```

Throttle ve FPS optimizasyonu yapılacak.

---

# 6. SAYFA HİYERARŞİSİ

```
/ (Ana Sayfa)
/kategori/[slug]
/yazi/[slug]
/dergi
/dergi/[year-month]
/abonelik
/profil
/profil/kaydedilenler
/profil/okuma-gecmisi
/admin
/admin/yazilar
/admin/yazi-yeni
/admin/dergi
/admin/kategoriler
```

---

# 7. ANA SAYFA TASARIMI

## 7.1 Hero Bölümü
- Başlık: **“Bilgeliğin ve Zarafetin İzinde Kadınlara Rehber.”**  
- Alt metin: İslami ilimler, annelik, şiir ve manevi yazılar.  
- CTA:  
  - “Son Sayıyı Oku”  
  - “Aboneliği Başlat”  

## 7.2 Öne Çıkan Yazılar
- Büyük kartlar  
- Resim + kategori + kısa özet  

## 7.3 Kategoriler
- 6 kategori kartı  
- Sakura arka plan devam  

## 7.4 Dergi Vitrini
- Sadece abonelere kapak resmi + “Bu ayın sayısı”  

---

# 8. YAZI SAYFASI (ARTICLE PAGE)

## 8.1 Ücretsiz kullanıcılar için:
- İçeriğin %40 gösterilir  
- Sonunda overlay card:  
  “Devamını okumak için abone olun.”

## 8.2 Aboneler için:
- Tam içerik  
- Audio player (varsa)  
- Yazı boyutu ayarı  
- Karanlık modu optimize  
- Okuma çubuğu (scroll progress)  
- Kaydet → okumaya devam sistemi  

---

# 9. DİJİTAL DERGİ (AYLIK SAYILAR)

## 9.1 Özellikler
- PDF görüntüleme (Blob)  
- Flipbook viewer  
- İçindekiler listesi  
- Bu sayıda yazanlar listesi  

## 9.2 Yetkiler
- Yalnızca abonelere açık  
- Ücretsiz kullanıcı → sadece kapak görür  

---

# 10. ABONELİK SİSTEMİ (Stripe)

## 10.1 Planlar
| Plan | Özellik |
|------|---------|
| Aylık | Tüm yazılar |
| Yıllık | Tüm yazılar + eski sayılar |
| VIP | PDF indirilebilir + özel sesli içerik |

## 10.2 Akış
1. Kullanıcı butona basar  
2. Stripe Checkout açılır  
3. Ödeme → Stripe webhook  
4. DB’de subscription status = active  
5. Middleware kullanıcıyı yetkili olarak işaretler  

## 10.3 Middleware
`middleware.ts`:

- Ücretli sayfalara erişim kontrolü  
- `/yazi/[slug]` → içerik kontrolü  
- `/dergi/*` → sadece aboneler  

---

# 11. KULLANICI PANELİ

## 11.1 Bölümler
- Profil bilgileri  
- Abonelik durumu  
- Kaydedilen yazılar  
- Okuma geçmişi  
- Kaldığın yerden devam  

---

# 12. ADMİN PANELİ

## 12.1 Modüller

### 12.1.1 Yazı Yönetimi
- Yeni yazı oluştur  
- Zengin metin editörü  
- Vercel Blob görsel upload  
- Ses dosyası upload  
- Kategori seçimi  
- Yayınlama butonu  

### 12.1.2 Dergi Yönetimi
- Yıl - ay seç  
- PDF yükle  
- Yazıları iliştir  

### 12.1.3 Kategori Yönetimi
- Yeni kategori ekle  
- Sıralama  

### 12.1.4 Kullanıcı Yönetimi
- Abonelik statüleri  
- Sil / Ban  

### 12.1.5 Dashboard
- En çok okunan yazılar  
- Aktif aboneler  
- Son olaylar  

---

# 13. VERİTABANI MİMARİSİ (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  password      String?
  role          String   @default("user")
  subscription  Subscription?
  savedArticles SavedArticle[]
  readingProgress ReadingProgress[]
  createdAt     DateTime @default(now())
}

model Subscription {
  id        String @id @default(cuid())
  userId    String @unique
  plan      String
  status    String
  expiresAt DateTime
  stripeId  String?
  user      User   @relation(fields: [userId], references: [id])
}

model Category {
  id      String   @id @default(cuid())
  name    String
  slug    String   @unique
  articles Article[]
}

model Article {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String   @db.Text
  coverUrl  String?
  audioUrl  String?
  categoryId String
  category  Category  @relation(fields: [categoryId], references: [id])
  createdAt DateTime  @default(now())
}

model SavedArticle {
  id        String @id @default(cuid())
  userId    String
  articleId String
}

model ReadingProgress {
  id        String   @id @default(cuid())
  userId    String
  articleId String
  progress  Int
  updatedAt DateTime @updatedAt
}

model Issue {
  id        String  @id @default(cuid())
  month     Int
  year      Int
  pdfUrl    String
  createdAt DateTime @default(now())
}
```

---

# 14. API SPESİFİKASYONU

## 14.1 Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

## 14.2 Yazılar
```
GET /api/articles
GET /api/articles/[slug]
POST /api/articles/create
PUT /api/articles/update
DELETE /api/articles/delete
```

## 14.3 Dergi
```
GET /api/issues
POST /api/issues/create
```

## 14.4 Abonelik
```
POST /api/subscription/checkout
POST /api/subscription/webhook
GET  /api/subscription/status
```

---

# 15. DOSYA YAPISI (Next.js)

```
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

---

# 16. PERFORMANS STRATEJİSİ

- ISR (Incremental Static Regeneration)  
- Edge Cache  
- Global CSS yerine component-level stil  
- Sakura.js için throttled loop  
- Lazy-loading:  
  - audio player  
  - flipbook viewer  

---

# 17. SEO

- metadata API  
- dynamic sitemap  
- canonical  
- OG image generator  
- structured data (Article schema)  

---

# 18. GÜVENLİK

- Stripe Webhook Signature Validation  
- Rate limiting (Upstash)  
- CSRF koruması  
- Auth middleware  
- Prisma input validation  

---

# 19. DEPLOYMENT

- Vercel deploy  
- Production env vars  
- Database → Supabase / Neon  
- Webhook route → Vercel Edge Functions  

---

# 20. ÖZET

Bu doküman, Rehnüma için tam kapsamlı ve geliştirilebilir bir Next.js tabanlı dijital dergi sistemini tanımlar.  
Tasarım, içerik, abonelik, admin paneli, DB modeli ve API tamamen hazırdır.

