"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  title: string;
};

export function ShareButton({ title }: Props) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  async function share() {
    const url = window.location.href;

    if (canNativeShare) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine"
    >
      {copied ? <Check className="h-4 w-4" /> : canNativeShare ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "已复制" : "分享"}
    </button>
  );
}
