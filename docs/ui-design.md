# UI Tasarım Rehberi

## Tema (oklch Override)
Proje, shadcn/ui üzerine özel oklch teması kullanır:

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

## Stil İlkeleri
- Soft, zarif, minimal; beyaz + mürdüm vurgu.
- Başlık fontu: serif (Playfair Display / Lora). Gövde: Inter / Lora.
- Büyük boşluklar; kart tabanlı içerik.
- %80 mobil kullanım → responsive öncelikli; tipografi ölçekleri mobilde optimize.
- Gece okuma yüksek → karanlık mod öncelikli; kontrast, link/focus stilleri net.

## Sakura.js Kullanımı
Tüm sayfalarda arka plan:

```tsx
useEffect(() => {
  import('sakura-js').then(({ default: Sakura }) => {
    new Sakura('body', { className: 'sakura', colors: [['#B76E79', '#FDF2F8']] });
  });
  return () => {
    document.querySelectorAll('.sakura').forEach((n) => n.remove());
  };
}, []);
```

- Loop throttle ve FPS sınırı (requestAnimationFrame) uygulanmalı.
- Animasyon yoğunluğu mobilde azaltılabilir.

## shadcn/ui Pratikleri
- Bileşenler `components/ui` altında; tema token’ları Tailwind’e yansıtılır.
- Varsayılan radius 0.65rem; kart ve butonlarda tutarlılık.
- Dark mode sınıfları Tailwind `dark:` ile uyumlu; `ThemeProvider` ile body class yönetimi.

## Layout ve Grid
- Hero: geniş tipografi, çift CTA (Son Sayıyı Oku, Aboneliği Başlat).
- Kategori ve yazı kartları: görsel + kategori etiketi + kısa özet.
- Dergi vitrini: aboneler için kapak + “Bu ayın sayısı”.
- Yazı sayfası: progress bar, paywall overlay, font-size kontrolü, audio player.

## Erişilebilirlik
- Radix primitive’lerin ARIA desteği korunur.
- Odak halkaları kaybolmaz; kontrast kontrolleri dark ve light için ayrı test edilir.
- Audio player kontrol etiketleri ve buton açıklamaları.
