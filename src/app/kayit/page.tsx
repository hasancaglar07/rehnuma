import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ returnTo?: string }> };

export default async function RegisterRedirectPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();
  params.set("tab", "register");
  if (
    resolvedSearchParams?.returnTo &&
    resolvedSearchParams.returnTo.startsWith("/") &&
    !resolvedSearchParams.returnTo.startsWith("//")
  ) {
    params.set("returnTo", resolvedSearchParams.returnTo);
  }
  redirect(`/giris?${params.toString()}`);
}
