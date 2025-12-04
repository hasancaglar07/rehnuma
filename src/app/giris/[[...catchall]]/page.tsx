import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
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
      <Navbar />
      <main className="container py-12 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Üyelik</p>
          <h1 className="text-4xl font-serif">Rehnüma’ya Katıl</h1>
          <p className="text-muted-foreground">
            Giriş yap veya yeni hesap oluştur; aboneliğini hemen başlat.
          </p>
        </div>
        <AuthForm returnTo={returnTo} initialTab={initialTab} />
      </main>
      <Footer />
    </div>
  );
}
