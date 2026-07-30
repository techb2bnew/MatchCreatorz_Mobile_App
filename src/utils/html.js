/**
 * Helpers for the rich-text (HTML) description fields.
 *
 * Descriptions typed via the rich editor are stored as HTML strings. Full
 * detail views render them with <RichTextViewer/>, but card previews (which
 * truncate with numberOfLines) need plain text — use stripHtml there.
 */

/**
 * Convert an HTML string to readable plain text (for truncated previews).
 * Also safely handles values that are already plain text.
 */
export const stripHtml = html => {
  if (!html) return '';
  return String(html)
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * True when the HTML has no real text content — e.g. the editor's empty state
 * ("<p><br></p>"). Use for "required" validation instead of a raw .trim().
 */
export const isHtmlEmpty = html => stripHtml(html).length === 0;
