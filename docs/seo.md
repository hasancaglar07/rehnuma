# SEO Stratejisi

## Metadata ve Yapı
- Next.js `generateMetadata` ile dinamik title/description.
- Canonical URL’ler segment bazında.
- OG image generator: yazı kapağı + başlık overlay; dergi kapağı için ayrı şablon.
- Structured Data: Article schema (başlık, yazar, tarih, kategori), dergi sayıları için CreativeWork.

## Sitemap ve Robots
- Dinamik sitemap: kategoriler, yazılar, dergi sayıları.
- Robots.txt: admin ve özel sayfalar engelli; public içerik izinli.

## İçerik Kalitesi
- Başlık hiyerarşisi (H1 yazı başlığı, H2 alt başlıklar).
- Öne çıkan görsel için alt text.
- Mobil öncelikli; LCP/CLS optimizasyonu.

## Paywall Davranışı
- Ücretsiz %40 içerik arama motorlarının taramasına açık; geri kalan paywall.
- `data-nosnippet` hassas bölümler için kullanılabilir.

## Performans Destekleri
- ISR ve edge cache ile hızlı first byte.
- Görsel optimizasyonu (next/image, boyut seti).
