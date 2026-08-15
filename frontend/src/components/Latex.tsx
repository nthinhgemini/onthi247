"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/** Escape các ký tự HTML đặc biệt trong plain text. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Render một công thức LaTeX thành HTML, fallback về plain text nếu lỗi. */
function renderLatex(formula: string, displayMode: boolean): string {
  try {
    return katex.renderToString(formula, {
      throwOnError: true,
      displayMode,
      strict: false,
    });
  } catch {
    // Fallback: hiển thị nguyên văn công thức với class báo lỗi
    const delim = displayMode ? "$$" : "$";
    return `<span class="katex-error" title="Công thức lỗi">${escapeHtml(delim + formula + delim)}</span>`;
  }
}

type Token = { html: string };

/**
 * Tách chuỗi text thành các token gồm:
 * - Plain text (được escape HTML)
 * - Block math $$...$$ (displayMode: true)
 * - Inline math $...$ (displayMode: false)
 */
function parseTokens(text: string): Token[] {
  const tokens: Token[] = [];
  // Ưu tiên khớp $$ trước, sau đó $
  // Regex: $$...$$  |  $...$  (không khớp khoảng trắng ở đầu/cuối công thức)
  const regex = /\$\$([^$]+?)\$\$|\$([^$\n]+?)\$/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    // Plain text trước công thức
    if (m.index > lastIndex) {
      tokens.push({ html: escapeHtml(text.slice(lastIndex, m.index)) });
    }

    if (m[1] !== undefined) {
      // Block math $$...$$
      tokens.push({ html: renderLatex(m[1], true) });
    } else if (m[2] !== undefined) {
      // Inline math $...$
      tokens.push({ html: renderLatex(m[2], false) });
    }

    lastIndex = m.index + m[0].length;
  }

  // Phần còn lại sau công thức cuối
  if (lastIndex < text.length) {
    tokens.push({ html: escapeHtml(text.slice(lastIndex)) });
  }

  return tokens;
}

export default function Latex({ text }: { text?: string | null }) {
  // Return null sớm nếu text rỗng
  if (!text) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const html = useMemo(() => {
    const tokens = parseTokens(text);
    return tokens.map((t) => t.html).join("");
  }, [text]);

  return (
    <span
      className="latex-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
