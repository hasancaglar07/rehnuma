import Link from "next/link";

type Props = {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  coverUrl?: string;
  meta?: {
    readingMinutes?: number;
    date?: string;
  };
  isFeatured?: boolean;
  badge?: string;
};

export function ArticleCard({ title, slug, excerpt, category, coverUrl, meta, isFeatured, badge }: Props) {
  const hasMeta = Boolean(meta?.readingMinutes || meta?.date);
  const badgeLabel = badge || (isFeatured ? "Öne çıkan" : "");
  return (
    <Link
      href={`/yazi/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white/90 p-3 sm:p-4 shadow-sm transition hover:-translate-y-[3px] hover:shadow-md"
    >
      <div className="relative overflow-hidden rounded-[14px] bg-secondary/30 border border-border/70">
        {badgeLabel && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-primary text-primary-foreground px-2 py-1 text-[11px] font-semibold shadow-sm">
            {badgeLabel}
          </span>
        )}
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt={title}
              className="h-full w-full object-cover aspect-[16/9] transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
          </>
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/10 via-white to-accent/15" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-3 text-foreground">
        {category && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/90">
            {category}
          </p>
        )}
        <h3 className="font-sans text-[1.22rem] sm:text-[1.32rem] leading-[1.4] font-semibold tracking-[-0.01em] group-hover:text-primary transition-colors">
          {title}
        </h3>
        {excerpt && <p className="text-[0.95rem] text-muted-foreground/90 leading-relaxed line-clamp-2">{excerpt}</p>}
        {hasMeta && (
          <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            {meta?.readingMinutes ? <span>{meta.readingMinutes} dk</span> : null}
            {meta?.readingMinutes && meta?.date ? <span className="h-1 w-1 rounded-full bg-border" /> : null}
            {meta?.date ? <span>{meta.date}</span> : null}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm font-semibold text-primary/90 group-hover:text-primary pt-1">
          <span>Oku</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform group-hover:translate-x-[1px]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-6 6m6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
