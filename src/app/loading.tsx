import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 header-premium px-3 md:px-6">
        <div className="container">
          <div className="header-shell flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-28 rounded-full" />
              <div className="hidden items-center gap-2 lg:flex">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-9 w-20 rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 lg:flex">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-12 pb-16">
        <section className="container pt-10 md:pt-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-5/6" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <div className="flex flex-wrap gap-3 pt-2">
                <Skeleton className="h-11 w-32 rounded-full" />
                <Skeleton className="h-11 w-36 rounded-full" />
              </div>
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-[420px] w-full rounded-[32px]" />
            </div>
          </div>
        </section>

        <section className="container">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-background/70 p-5 shadow-sm">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
              </div>
            ))}
          </div>
        </section>

        <section className="container">
          <Skeleton className="mb-6 h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-background/70 p-4 shadow-sm">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>

        <section className="container">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-background/70 p-6 md:flex-row">
            <Skeleton className="h-56 w-40 rounded-lg" />
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-11/12" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
