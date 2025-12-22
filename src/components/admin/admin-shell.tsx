import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminShell({ title, description, actions, children }: Props) {
  return (
    <div className="container py-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            Admin
          </Link>
          <h1 className="text-3xl font-serif">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}
