# Yönetim Paneli

## Modüller
- **Yazı Yönetimi**: Liste, arama/filtre, düzenleme. Zengin metin editörü; Vercel Blob ile görsel/ses upload; kategori seçimi; yayınla/taslak.
- **Dergi Yönetimi**: Yıl/ay seçimi; PDF upload (Blob); yazıları iliştirme.
- **Kategori Yönetimi**: CRUD; sıralama.
- **Kullanıcı Yönetimi**: Abonelik statüleri, sil/ban.
- **Dashboard**: En çok okunan yazılar, aktif aboneler, son olaylar.

## Erişim
- `/admin/*` rotaları admin rolü gerektirir; middleware role check.
- API mutasyonları `admin` rol kontrolü yapar.

## UI Önerileri
- Tablo + inline filter; skeleton ve boş durumları.
- Formlar react-hook-form + zod; server actions ile submit.
- Upload bileşenleri Blob URL döndürür; form state’e işler.

## İş Akışları
### Yeni Yazı
1. Başlık, slug, içerik, kategori.
2. Opsiyonel: kapak görseli, audio upload (Blob).
3. Yayınla → Prisma `Article` kaydı; ilgili sayfaları revalidate.

### Yeni Dergi
1. Ay/yıl seç, PDF Blob’a yükle.
2. `Issue` kaydı oluştur; dergi listesi revalidate.

### Kategori
1. Ad/slug, sıralama.
2. Değişiklik sonrası yazı listeleri revalidate.

## İzleme ve Geri Bildirim
- Başarılı/giriş hataları için toast.
- Kritik hatalarda log (Vercel); webhook event’leri Stripe dashboard’da.
