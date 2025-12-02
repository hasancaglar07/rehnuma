import { prisma } from "@/db/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

type Props = { params: { "year-month": string } };

export default async function IssuePage({ params }: Props) {
  const [yearStr, monthStr] = params["year-month"].split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const issue = await prisma.issue.findFirst({ where: { year, month } });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-12 space-y-4">
        <h1 className="text-3xl font-serif">
          {month}/{year} Sayısı
        </h1>
        {!issue && <p className="text-muted-foreground">Dergi bulunamadı.</p>}
        {issue && (
          <div className="aspect-[3/4] w-full border border-border rounded-xl overflow-hidden">
            <iframe src={issue.pdfUrl} className="w-full h-full" title="Dergi PDF" />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
