# Bileşen Yapısı (Atomic Design)

## Katmanlar
- **Atoms**: Button, Input, Label, Badge, Skeleton, Icon, Toggle, Progress.
- **Molecules**: Card (yazı kartı), CategoryChip, AudioPlayer, PaywallOverlay, Pagination, Breadcrumbs.
- **Organisms**: HeroSection, FeaturedGrid, CategoryGrid, ArticleContent, FlipbookViewer, SubscriptionPlans, ProfileSummary, AdminTable.
- **Templates**: Page layout’ları (Ana sayfa grid, Yazı sayfası şablonu, Admin dashboard şablonu).
- **Pages**: App Router segmentleri; server/client bileşenleri birleştirir.

## Dosya Konvansiyonları
- `components/ui/*`: shadcn türevleri, tema uyarlamaları.
- `components/sections/*`: Sayfa bölümleri (Hero, Featured, Dergi vitrini).
- `components/articles/*`: Yazı kartı, içerik renderı, paywall overlay, audio player.
- `components/admin/*`: Tablo, form, uploader, dashboard widget’ları.
- `components/shared/*`: Navbar, Footer, ThemeToggle, SakuraMount (arka plan).

## Örnek: Paywall Overlay
```tsx
"use client";
import { Button } from "@/components/ui/button";

export function PaywallOverlay({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <div className="bg-gradient-to-b from-background/70 to-background/90 backdrop-blur rounded-xl p-6 border shadow-lg text-center">
      <h3 className="text-lg font-semibold">Devamını okumak için abone olun.</h3>
      <p className="text-sm text-muted-foreground mt-2">Tam içerik, sesli anlatım ve dergi arşivi abonelere açık.</p>
      <Button className="mt-4" onClick={onSubscribe}>Aboneliği Başlat</Button>
    </div>
  );
}
```

## Örnek: Audio Player (lazy)
```tsx
"use client";
import dynamic from "next/dynamic";
const ReactAudio = dynamic(() => import("react-h5-audio-player"), { ssr: false });

export function ArticleAudio({ src }: { src: string }) {
  if (!src) return null;
  return (
    <div className="mt-6">
      <ReactAudio src={src} autoPlayAfterSrcChange={false} customAdditionalControls={[]} />
    </div>
  );
}
```

## Stil ve Erişilebilirlik
- Atomlar Radix ARIA özelliklerini korur.
- Dark mode, radius, spacing ve tipografi token’ları tüm katmanlarda tutarlı uygulanır.
- Lazy bileşenler (audio, flipbook) CLS oluşturmaması için placeholder/skeleton içerir.
