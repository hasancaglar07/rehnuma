import { prisma } from "@/db/prisma";

export const revalidate = 300;
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import Link from "next/link";

export default async function DergiPage() {
  const issues = await prisma.issue.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-6">
        <h1 className="text-3xl font-serif">Dijital Dergi Arşivi</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/dergi/${issue.year}-${String(issue.month).padStart(2, "0")}`}
              className="border border-border rounded-xl p-4 hover:-translate-y-1 transition"
            >
              <p className="text-sm text-muted-foreground">
                {issue.month}/{issue.year}
              </p>
              <p className="text-primary text-sm mt-2">Flipbook aç</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
