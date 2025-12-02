# Kullanıcı Akışı

## Ziyaretçi → Abone
1. Ana sayfa: Hero + öne çıkan yazılar; kategori kartları.
2. Yazı açılır: İlk %40 görünür, paywall overlay “Aboneliği Başlat”.
3. Abonelik sayfası: Plan seçimi → Stripe Checkout.
4. Ödeme tamam: Webhook abonelik kaydını aktifler.
5. Kullanıcı profil: Abonelik durumu “active”, dergi ve tam yazılara erişim.

## İçerik Tüketimi
- Kategori listesi → yazı kartı → yazı detayı.
- Abone: Tam içerik, audio player, font-size kontrolü, progress bar.
- `Kaydet` butonu: `SavedArticle`; profil/kaydedilenler’den erişilir.
- Okuma sırasında progress güncellenir; profil/okuma-gecmisi sayfasında listelenir.

## Dergi Akışı
- Dergi arşivi (kapaklar); abone değilse sadece kapak görüntüler.
- Abone → `/dergi/[year-month]` flipbook PDF görüntüleme.
- VIP plan: PDF indirme izni (buton).

## Profil Akışı
- Profil özet: ad/e-posta, abonelik planı/durumu.
- Kaydedilenler: hızlı linkler; sil/oku.
- Okuma geçmişi: progress %; “devam et” CTA.

## Admin Akışı
- Dashboard: metrikler.
- Yazı ekle/düzenle; Blob yüklemeleri.
- Dergi ekle; kategori ve kullanıcı yönetimi.
