"use client";

import { useMemo } from "react";
import { marked } from "marked";

type Props = {
  markdown: string;
  className?: string;
};

export function MarkdownClient({ markdown, className = "prose max-w-none" }: Props) {
  const html = useMemo(() => (markdown ? marked.parse(markdown) : ""), [markdown]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
