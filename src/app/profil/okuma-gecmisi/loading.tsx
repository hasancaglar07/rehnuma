export default function Loading() {
  return (
    <div className="min-h-screen">
      <main className="container py-12 space-y-4">
        <div className="h-8 w-48 rounded-lg bg-secondary/50 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-20 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
