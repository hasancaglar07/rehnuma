type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminShell({ title, description, children }: Props) {
  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}
