"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function Latex({ text }: { text: string }) {
  const parts = useMemo(() => {
    const tokens: { html: string; inline: boolean }[] = [];
    const regex = /\$([^$]+)\$/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;

    const render = (latex: string, inline: boolean) => {
      try {
        return katex.renderToString(latex, {
          throwOnError: false,
          displayMode: !inline,
        });
      } catch {
        return latex;
      }
    };

    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIndex) {
        tokens.push({
          html: render(text.slice(lastIndex, m.index), true),
          inline: true,
        });
      }
      tokens.push({ html: render(m[1], false), inline: false });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push({ html: render(text.slice(lastIndex), true), inline: true });
    }
    return tokens;
  }, [text]);

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: parts.map((p) => p.html).join(""),
      }}
    />
  );
}
