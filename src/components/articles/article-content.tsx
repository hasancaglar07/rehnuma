import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PaywallOverlay } from "./paywall-overlay";
import { normalizeEmphasisSpacing } from "@/utils/markdown";
import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

type Props = {
  content: string;
  isSubscriber: boolean;
  fontScale?: number;
  className?: string;
  paywallMeta?: {
    returnTo: string;
    isSignedIn?: boolean;
    hasAudio?: boolean;
    wordCount?: number;
    readingMinutes?: number;
  };
};

const proseClass =
  "prose prose-lg max-w-3xl mx-auto prose-headings:font-serif prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-img:rounded-2xl prose-hr:border-border prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80";

const Markdown = (props: ComponentProps<typeof ReactMarkdown>) => {
  // react-markdown v10 className desteğini kaldırdı; olası dış className'leri yutuyoruz.
  return <ReactMarkdown {...props} />;
};

function buildPreview(text: string) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (!blocks.length) return text.slice(0, 900);
  const preview = blocks.slice(0, 3).join("\n\n");
  if (preview.length < 400 && blocks[3]) return `${preview}\n\n${blocks[3].slice(0, 240)}`;
  return preview;
}

function MarkdownBody({ text, fontScale, className }: { text: string; fontScale: number; className?: string }) {
  const normalized = normalizeEmphasisSpacing(text);
  return (
    <div className={cn(proseClass, className)} style={{ fontSize: `${fontScale}%` }}>
      <Markdown remarkPlugins={[remarkGfm]}>{normalized}</Markdown>
    </div>
  );
}

export function ArticleContent({ content, isSubscriber, fontScale = 100, className, paywallMeta }: Props) {
  const normalizedContent = normalizeEmphasisSpacing(content);
  if (isSubscriber) {
    return <MarkdownBody text={normalizedContent} fontScale={fontScale} className={className} />;
  }

  const partial = buildPreview(normalizedContent);
  return (
    <div className="space-y-6" data-nosnippet>
      <MarkdownBody text={partial} fontScale={fontScale} className={className} />
      <div className="mx-auto max-w-3xl pt-2">
        <PaywallOverlay
          returnTo={paywallMeta?.returnTo ?? "/giris"}
          isSignedIn={paywallMeta?.isSignedIn}
          hasAudio={paywallMeta?.hasAudio}
          wordCount={paywallMeta?.wordCount}
          readingMinutes={paywallMeta?.readingMinutes}
        />
      </div>
    </div>
  );
}
