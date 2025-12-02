import Link from "next/link";

type Props = {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
};

export function ArticleCard({ title, slug, excerpt, category }: Props) {
  return (
    <Link
      href={`/yazi/${slug}`}
      className="group border border-border rounded-xl p-4 bg-background/80 hover:-translate-y-1 transition shadow-sm"
    >
      {category && <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{category}</p>}
      <h3 className="mt-2 text-lg font-semibold group-hover:text-primary">{title}</h3>
      {excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>}
    </Link>
  );
}
