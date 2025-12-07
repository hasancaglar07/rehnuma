# Rehnüma Web Sitesi – Güncelleme Planı

## Brief’ten çıkan gereksinimler
- Header: Anasayfa, Kurumsal (Hakkımızda, Misyon, Vizyon, Künye), Sayılar, Kategoriler, Yazarlar, Blog, İletişim + “Abone Ol” CTA.
- Yeni kategori kurgusu: 6 ana kategori ve alt kırılımlar (Rehnüma Düşünce, Kültür Edebiyat, Kadın ve Sağlık, Ev ve Yaşam, Maneviyat, Aile ve Çocuk).
- Metinler: Vizyon, Misyon, Hakkımızda içeriği hazır; Künye bilgisi beklenecek.

## Mevcut durum (özet)
- Header şu an yalnızca 5 kategori linki + Abone Ol ve profil/admin linkleri içeriyor; Kurumsal/Yazarlar/Blog/Sayılar yok.
- Taksonomi tek seviyeli `Category` tablosu; alt kategori kavramı bulunmuyor, tag-line haritaları eski kategorilere göre yazılmış.
- `/dergi` rotası mevcut; “Sayılar” adı ve rota aliased değil.
- Yazar bilgisi modelde yok; yazılar “Rehnüma” tarafından yayınlanıyor görünüyor. Yazar listesi sayfası yok.
- Kurumsal içerik sayfaları (hakkımızda, vizyon, misyon, künye) bulunmuyor.

## Yol haritası (bozmadan genişletme)

### 1) Bilgi mimarisi ve navbar
- Navbar’ı brief’teki sıraya göre yeniden düzenle; “Kurumsal” altında 4 alt link, “Sayılar” `/sayilar` rotasına giderken mevcut `/dergi` rotasını 301 ile koru.
- “Kategoriler” için yeni bir landing: ana kategorileri ve alt kırılımlarını gösteren grid/accordion, mevcut `/kategori/[slug]` sayfalarına çıkış sağlar.
- “Blog” için `/blog` rotası: tüm yazıları veya seçili alt kategorileri listeleyen kronolojik feed (paywall kuralları değişmez).
- Mobil menüde açılır/kapalı hiyerarşi korunarak yeni linkler eklenir; Abone Ol CTA yeri korunur.

### 2) Kurumsal sayfalar
- `/kurumsal/hakkimizda`, `/kurumsal/misyon`, `/kurumsal/vizyon` rotalarını statik içerikle oluştur; brief’teki metinleri kullan, gerektiği yerde kısa alt başlıklarla bölsün.
- `/kurumsal/kunye` için iskelet sayfa: editoryal ekip, iletişim ve yasal bilgiler için yer tutucu alanlar; veri hazır olduğunda doldurulacak şekilde komponize et.
- SEO: `generateMetadata` ile canonical, title/description ve paylaşım görseli (default) eklensin; `robots` ve sitemap güncellensin.

### 3) Taksonomi ve veri modeli
- Prisma’da `Category`ye opsiyonel `parentId` ekleyerek hiyerarşi oluştur; mevcut sorgular root kategorilerle çalışmaya devam eder (parentId null).
- Seed ve admin panel:
  - Root kategoriler: Rehnüma Düşünce, Kültür Edebiyat, Kadın ve Sağlık, Ev ve Yaşam, Maneviyat, Aile ve Çocuk.
  - Alt kategoriler parentId ile bağlanır (Akis, Ruh ve Mana, …).
  - Admin kategoriler ekranında parent seçimi ve sıralama alanı eklenir; listeleme root/child ayrımı gösterir.
- Mevcut kategori grid/tagline haritaları yeni slug’lara göre güncellenir; eski slug’lar gerekiyorsa 301 redirect listesi hazırlanır.

### 4) Yazarlar ve blog akışı
- Veri modeli: `AuthorProfile` (id, name, slug, bio, avatar, socials) ekleyip `Article` içine opsiyonel `authorId` referansı ekle; mevcut yazılar `authorId` null kalsın, UI’de “Rehnüma” fallback’i kullanılsın.
- Admin yazı formuna yazar seçimi/dropdown ekle; yeni yazar ekleme için basit bir modal veya admin “Yazarlar” sayfası oluştur.
- `/yazarlar` listesi: yazı sayısına göre sıralı kartlar, `/yazarlar/[slug]` detayında yazar biyosu + ilgili yazılar feed’i.
- `/blog` feed’i: bütün yazıları veya seçilen alt kategori/tüm alt kategorileri sıralı gösterir; filtre olarak alt kategori çipi kullanılabilir.

### 5) Sayılar (dergi) isimlendirme uyumu
- `/sayilar` rotasını mevcut `/dergi` UI’sını kullanarak aç; `/dergi` → `/sayilar` kalıcı yönlendirme ekle.
- Navbar/footerde “Sayılar” etiketi kullan; IssueShowcase başlığını da “Bu Ayın Sayısı”/“Sayılar” diline çek.
- Sitemap/OG/title’da “Sayı” terminolojisi güncellenir.

### 6) İçerik ve metin güncellemeleri
- Hero ve meta metinlerinde vizyon/misyon cümlelerinden kısa alıntılar kullanarak mesaj uyumu sağla.
- İletişim sayfasına Kurumsal/Künye referansı ekle (örn. basın/iletişim bölümü).
- Footer’da “Kurumsal”, “Sayılar”, “Yazarlar”, “Blog” linkleri ve destek e-postası korunur/güncellenir.

### 7) SEO ve yönlendirmeler
- Yeni rotalar sitemap ve robots’a eklenir; eski kategori slug’ları veya `/dergi` gibi rotalar için redirect tablosu tanımlanır.
- Structured data: Organization (About/Mission/Vision), Article schema’da yazar adı bilgisi authorId geldiğinde doldurulur.

### 8) Test ve doğrulama
- En azından smoke testleri: navbar linkleri 200 döndürür; `/kurumsal/*` rotaları render olur; `/sayilar` → Issue listesi render eder.
- Prisma migration sonrası seed’in yeni kategorileri ve örnek yazarları oluşturduğunu doğrula.
- Paywall ve middleware akışları yeni rotalarla (özellikle `/blog`, `/sayilar`) çakışmadığını kontrol et.

## Uygulama sırası (öneri)
1) Model ve seed güncellemesi: Category parentId, AuthorProfile, Article.authorId; migration + seed.
2) Navbar/footer ve rotalar: `/kurumsal/*`, `/kategoriler`, `/blog`, `/yazarlar`, `/sayilar` + redirectler.
3) İçerik yerleştirme: Hakkımızda/Misyon/Vizyon metinleri; Künye iskeleti.
4) Admin/UI uyarlamaları: kategori hiyerarşisi, yazar seçimi, yeni feed/landing tasarımları.
5) SEO ve test: sitemap/metadata güncellemeleri, smoke testler, gerekli yerlerde ISR revalidate ayarları.
