"use client";
import dynamic from "next/dynamic";

const ReactAudioPlayer = dynamic(() => import("react-h5-audio-player"), { ssr: false });

export function ArticleAudio({ src }: { src?: string | null }) {
  if (!src) return null;
  return (
    <div className="mt-6">
      <ReactAudioPlayer src={src} autoPlayAfterSrcChange={false} customAdditionalControls={[]} />
    </div>
  );
}
