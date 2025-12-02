# Veritabanı (Prisma) Şeması

## Modeller
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

## İlişkiler ve Notlar
- `User` ↔ `Subscription`: bire bir; `Subscription.userId` unique.
- `User` ↔ `SavedArticle`/`ReadingProgress`: bire çok.
- `Category` ↔ `Article`: bire çok.
- `Issue`: bağımsız; dergi PDF’leri Blob URL’si ile.

## Veri Akışları
- **Kayıt/Giriş**: `User` oluşturma; parola veya harici auth opsiyonel.
- **Abonelik**: Webhook `Subscription` kaydını oluşturur/günceller; `expiresAt` plan süresine göre.
- **Yazı Okuma**: `ReadingProgress` güncellenir; `progress` yüzde/step olarak tutulur.
- **Kaydetme**: `SavedArticle` ekle/sil.
- **Dergi**: `Issue.pdfUrl` Blob’dan gelir; yıl/ay slug’ı rota parametresi.

## Örnek Prisma Sorguları
```ts
// Kullanıcı ve abonelik
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { subscription: true },
});

// Yazı detayı + kategori
const article = await prisma.article.findUnique({
  where: { slug },
  include: { category: true },
});

// Reading progress güncelleme
await prisma.readingProgress.upsert({
  where: { userId_articleId: { userId, articleId } },
  update: { progress },
  create: { userId, articleId, progress },
});
```
