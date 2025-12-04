type Props = { status: string };

export function StatusBadge({ status }: Props) {
  const isPublished = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
        isPublished ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: isPublished ? "#16a34a" : "#d97706" }} />
      {isPublished ? "Yayınlandı" : "Taslak"}
    </span>
  );
}
