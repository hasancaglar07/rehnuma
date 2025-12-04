  1. Yazı düzenleme akışı (liste → düzenle → revalidate, paywall önizleme).

  2. Kategori CRUD + sıralama.

  3. Dergi yönetimi (kapak + PDF upload, flipbook entegrasyonu).

  4. Kullanıcı/abonelik yönetimi.



  1. /giris ve /kayit (tek sayfada tab’li veya ayrı rotalar) oluştur, zod ile validasyon + /api/auth/login ve /api/auth/

&nbsp;    register POST entegrasyonu, CSRF header’ı getCsrfToken ile gönder, başarıda /profil veya returnTo parametresine

&nbsp;    yönlendir. Başarılı giriş sonrası kısa toast/hata mesajları ekle.

&nbsp; 2. Navbar’ı cookie ipuçlarını (role, subscriptionStatus) okuyacak hale getir; misafire “Giriş / Üye Ol” CTA’sı, oturum

&nbsp;    açmışa “Profil” ve “Çıkış”, sadece role=admin olana “Admin” linkleri göster. Küçük bir avatar/isim etiketini ekle.

&nbsp; 3. Profil sayfasını doldur: ad/e-posta, abonelik kartı (plan, status, varsa expiresAt), “Aboneliği Yönet” (/abonelik)

&nbsp;    ve “Çıkış” butonları; kaydedilen/okuma geçmişi sayfalarına giden kısa özet kutuları ekle.

&nbsp; 4. Abonelik kartlarını oturum kontrolüyle bağla: SubscriptionPlans 401 dönerse otomatik /giris?returnTo=/abonelik’e

&nbsp;    yönlendir; oturum varken normal checkout akışını koru.

&nbsp; 5. Middleware yönlendirmelerini yeni login sayfasına uyumlu hale getir (auth gereken rota → /giris?returnTo=..., admin

&nbsp;    rolü yoksa /).

