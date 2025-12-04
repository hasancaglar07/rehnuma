export default function Loading() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 space-y-4">
        <div className="h-8 w-48 rounded-lg bg-secondary/50 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-32 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
