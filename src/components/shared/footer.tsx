export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Rehnüma Kadın Dergisi</span>
        <span>Bilgeliğin ve zarafetin izinde.</span>
      </div>
    </footer>
  );
}
