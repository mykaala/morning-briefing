import React from "react";

/**
 * Renders a string with "Allah" always capitalised, even inside
 * a container that has textTransform: "lowercase".
 *
 * How it works: splits the text on every occurrence of "allah" (case-insensitive),
 * then wraps each match in a <span style={{ textTransform: "none" }}>Allah</span>
 * which overrides the parent's textTransform.
 */
export function protectAllah(text: string): React.ReactNode {
  const regex = /\ballah\b/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} style={{ textTransform: "none" }}>
        Allah
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // No match — return plain string so callers can use it in any context
  return parts.length > 0 ? parts : text;
}
