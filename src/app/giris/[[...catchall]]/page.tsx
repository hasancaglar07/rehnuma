import { AuthForm } from "@/components/auth/auth-form";

type Props = { searchParams: Promise<{ returnTo?: string; tab?: string }> };

function normalizeReturnTo(value?: string) {
  if (!value) return "/profil";
  if (!value.startsWith("/") || value.startsWith("//")) return "/profil";
  return value;
}

export default async function LoginPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const returnTo = normalizeReturnTo(resolvedSearchParams?.returnTo);
  const initialTab = resolvedSearchParams?.tab === "register" ? "register" : "login";

  return (
    <div className="min-h-screen">
      <main className="container px-4 py-10 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Üyelik</p>
          <h1 className="text-3xl font-serif sm:text-4xl">Rehnüma’ya Katıl</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Giriş yap veya yeni hesap oluştur; aboneliğini hemen başlat.
          </p>
        </div>
        <AuthForm returnTo={returnTo} initialTab={initialTab} />
      </main>
    </div>
  );
}
