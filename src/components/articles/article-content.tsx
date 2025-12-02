import { PaywallOverlay } from "./paywall-overlay";

type Props = {
  content: string;
  isSubscriber: boolean;
};

export function ArticleContent({ content, isSubscriber }: Props) {
  if (isSubscriber) {
    return <article className="prose prose-neutral dark:prose-invert max-w-none">{content}</article>;
  }

  const partial = content.slice(0, Math.max(0, Math.floor(content.length * 0.4)));
  return (
    <div className="space-y-6">
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        {partial}
        <div className="mt-4 border-t border-border pt-4">
          <PaywallOverlay />
        </div>
      </article>
    </div>
  );
}
