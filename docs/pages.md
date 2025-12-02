# Sayfa Yapıları ve Amaçları

## Genel Hiyerarşi
```
/
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

## Public Sayfalar
- `/` (Ana Sayfa): Hero (CTA: Son Sayıyı Oku, Aboneliği Başlat), öne çıkan yazılar, kategori vitrinleri, dergi vitrini (abonelere özel kapak).
- `/kategori/[slug]`: Kategoriye ait yazılar; kart listesi; ISR.
- `/yazi/[slug]`: Yazı detay; abonelik yoksa %40 içerik + paywall overlay; abonede tam içerik + audio + font-size kontrolü + progress.
- `/dergi`: Dergi arşivi; abonelik yoksa sadece kapak görseli ön izlemesi.
- `/dergi/[year-month]`: Flipbook PDF; Blob’dan çekilir; yalnızca aboneler.
- `/abonelik`: Planların açıklaması, CTA (Stripe Checkout).

## Kullanıcı Alanı
- `/profil`: Profil bilgileri, abonelik durumu, hızlı linkler.
- `/profil/kaydedilenler`: SavedArticle listesi; hızlı açılış.
- `/profil/okuma-gecmisi`: ReadingProgress; kaldığın yerden devam butonları.

## Admin Alanı
- `/admin`: Dashboard (özet metrikler: en çok okunan yazılar, aktif aboneler, son olaylar).
- `/admin/yazilar`: Yazı listesi, arama/filtre, düzenleme.
- `/admin/yazi-yeni`: Zengin metin editörü; Blob görsel/ses upload; kategori seçimi; yayınla taslağa al.
- `/admin/dergi`: Dergi sayıları yönetimi; yıl/ay seç; PDF upload; yazıları iliştir.
- `/admin/kategoriler`: Kategori CRUD, sıralama.

## Middleware ve Yetki
- Public sayfalar: `/`, `/kategori/*`, `/yazi/*` (paywall kontrolü içeride), `/abonelik`.
- Abone gerektiren: `/dergi/*`, yazı içeriğinin tam kısmı.
- Auth gerektiren: `/profil/*`, `/admin/*`.
- Admin gerektiren: `/admin/*` segmentleri (role check).
