# Performans Stratejisi

## Render ve Cache
- **ISR**: Kategori ve yazı listeleri için; mutasyon sonrası `revalidatePath`.
- **Edge Cache**: Public GET uçları; kısa TTL + revalidate.
- **Server Components**: Varsayılan; client komponentler yalnızca gerektiğinde.

## Lazy Loading
- Audio player, flipbook viewer dinamik import.
- Sakura.js mount’u client’ta; düşük FPS/throttle.
- Büyük görseller için `next/image` ve blur placeholders.

## CSS ve Tema
- Component-level Tailwind; global CSS minimal.
- Tema token’ları ile tekrar kullanılabilir stil; gereksiz custom CSS yok.

## Sorgu ve Veri
- Prisma seçici `select/include`; gereksiz alan çekilmez.
- Liste uçlarında sayfalama; limit/offset.
- Abonelik ve kullanıcı bilgisi minimal payload.

## UI Tepkisi
- Skeleton/placeholder; özellikle dergi kapakları, yazı kartları.
- Form submit’te optimistic UI gerekirse server action + pending state.

## Sakura Optimizasyonu
- requestAnimationFrame throttling; mobilde partikül sayısı düşürme.
- Animasyon destroy/cleanup on unmount.
