&nbsp; 1. npm install çalıştırın; .env değerlerini doldurun (DB, Stripe key/price IDs, BLOB token, NEXT\_PUBLIC\_URL).

&nbsp; 2. npx prisma generate \&\& npx prisma migrate dev \&\& npx prisma db seed ile şemayı uygulayın.

&nbsp; 3. Stripe webhook’u /api/subscription/webhook endpoint’ine yönlendirip STRIPE\_WEBHOOK\_SECRET ekleyin.

&nbsp; 4. npm run dev ile yerelde test edin; abonelik akışı ve middleware yönlendirmelerini doğrulayın.

