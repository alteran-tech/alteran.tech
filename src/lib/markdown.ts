/**
 * Lightweight markdown-to-HTML converter for project content.
 * Handles: headings, bold, italic, inline code, code blocks, links, lists, paragraphs, horizontal rules.
 * No external dependencies -- pure string transformation.
 *
 * IMPORTANT: Output is intended for use with dangerouslySetInnerHTML.
 * Content is admin-authored (trusted), so XSS is not a concern here.
 */
export function renderMarkdown(md: string): string {
  if (!md) return "";

  let html = md;

  // Fenced code blocks (``` ... ```)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_match, _lang, code) =>
      `<pre class="overflow-x-auto rounded-lg bg-[var(--glass-bg-strong)] border border-ancient-teal/10 p-4 text-sm text-ancient-aqua/80 my-4"><code>${escapeHtml(code.trim())}</code></pre>`,
  );

  // Split into lines for block-level processing
  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) { result.push("</ul>"); inList = false; }
      const level = headingMatch[1].length;
      const text = processInline(headingMatch[2]);
      const sizes: Record<number, string> = {
        1: "text-2xl font-bold text-ancient-teal mt-8 mb-4",
        2: "text-xl font-semibold text-ancient-teal/90 mt-6 mb-3",
        3: "text-lg font-semibold text-ancient-aqua mt-5 mb-2",
        4: "text-base font-medium text-ancient-aqua/80 mt-4 mb-2",
        5: "text-sm font-medium text-ancient-aqua/70 mt-3 mb-1",
        6: "text-sm text-ancient-aqua/60 mt-3 mb-1",
      };
      result.push(`<h${level} class="${sizes[level]}">${text}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push('<hr class="border-ancient-teal/15 my-6" />');
      continue;
    }

    // Unordered list items
    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inList) { result.push('<ul class="list-disc list-inside space-y-1 my-3 text-ancient-aqua/70">'); inList = true; }
      const text = processInline(line.replace(/^\s*[-*+]\s+/, ""));
      result.push(`<li>${text}</li>`);
      continue;
    }

    // Close list if no longer in list items
    if (inList) { result.push("</ul>"); inList = false; }

    // Empty line
    if (line.trim() === "") {
      continue;
    }

    // Pre blocks (already processed above, skip if starts with <pre)
    if (line.startsWith("<pre")) {
      result.push(line);
      continue;
    }

    // Regular paragraph
    result.push(`<p class="text-ancient-aqua/70 leading-relaxed my-3">${processInline(line)}</p>`);
  }

  if (inList) result.push("</ul>");

  return result.join("\n");
}

/** Process inline markdown: bold, italic, code, links */
function processInline(text: string): string {
  let result = text;

  // Inline code
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 text-sm rounded bg-ancient-teal/10 text-ancient-teal/80 border border-ancient-teal/10">$1</code>',
  );

  // Bold + Italic
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");

  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Italic
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-ancient-teal hover:text-ancient-aqua-light underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
