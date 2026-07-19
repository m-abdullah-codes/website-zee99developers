import { marked } from "marked";

/**
 * Markdown → HTML for post bodies (GFM: tables, strikethrough, autolinks).
 * Runs in server components at build time and in the dashboard's live preview,
 * so public pages and admin previews render identically.
 */
export function mdToHtml(md: string): string {
  return marked.parse(md, { async: false, gfm: true, breaks: false });
}
