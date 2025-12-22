"use client";

import { useState } from "react";

type Props = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  title?: string;
};

async function copyText(value: string) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyButton({
  text,
  label = "Kopyala",
  copiedLabel = "Kopyalandi",
  className = "",
  title
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className || "px-3 py-1 rounded-full border border-border hover:-translate-y-0.5 transition text-sm"}
      title={title || label}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
