import React, { useMemo } from 'react';
import { Text } from 'react-native';

/**
 * Renders the limited HTML our editor produces (b/strong, i/em, u, p/div/br,
 * ul/ol/li, h1-6) to nested <Text>. Reliable + cheap everywhere — including
 * virtualized FlatList cards, where a WebView renders blankly, and full detail
 * views, where a WebView's auto-height sometimes collapses to 0 (invisible).
 *
 * - Preview (pass numberOfLines): block tags collapse to spaces so the text
 *   truncates cleanly on one/few lines.
 * - Full (no numberOfLines): block tags become line breaks, <li> becomes "• ".
 *
 * Plain-text (non-HTML) values render as-is, so old records keep working.
 */
const decodeEntities = text =>
  String(text)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const parseSegments = (html, block) => {
  const brk = block ? '\n' : ' ';
  const tokens = String(html || '').split(/(<[^>]+>)/g);
  let bold = 0;
  let italic = 0;
  let underline = 0;
  const segments = [];

  tokens.forEach(token => {
    if (!token) return;

    if (token[0] === '<') {
      const match = token.match(/^<\s*(\/?)\s*([a-zA-Z0-9]+)/);
      if (!match) return;
      const isClose = match[1] === '/';
      const tag = match[2].toLowerCase();

      if (tag === 'b' || tag === 'strong') bold += isClose ? -1 : 1;
      else if (tag === 'i' || tag === 'em') italic += isClose ? -1 : 1;
      else if (tag === 'u') underline += isClose ? -1 : 1;
      else if (tag === 'br') segments.push({ text: brk });
      else if (!isClose && tag === 'li') segments.push({ text: block ? '\n• ' : '• ' });
      else if (isClose && (tag === 'p' || tag === 'div' || tag === 'li' || /^h[1-6]$/.test(tag))) {
        segments.push({ text: brk });
      }

      bold = Math.max(0, bold);
      italic = Math.max(0, italic);
      underline = Math.max(0, underline);
      return;
    }

    const text = decodeEntities(token).replace(/\s+/g, ' ');
    if (text) segments.push({ text, bold: bold > 0, italic: italic > 0, underline: underline > 0 });
  });

  // Drop leading/trailing break-only segments and collapse consecutive breaks.
  const cleaned = [];
  segments.forEach(seg => {
    const isBreak = !seg.text.trim();
    const prev = cleaned[cleaned.length - 1];
    if (isBreak && (!prev || !prev.text.trim())) return; // no leading / doubled breaks
    cleaned.push(seg);
  });
  while (cleaned.length && !cleaned[cleaned.length - 1].text.trim()) cleaned.pop();

  return cleaned;
};

const segmentStyle = seg => {
  const s = {};
  if (seg.bold) s.fontWeight = '700';
  if (seg.italic) s.fontStyle = 'italic';
  if (seg.underline) s.textDecorationLine = 'underline';
  return s;
};

const RichTextInline = ({ html, style: textStyle, numberOfLines }) => {
  const block = !numberOfLines;
  const segments = useMemo(() => parseSegments(html, block), [html, block]);
  if (!html || segments.length === 0) return null;

  return (
    <Text style={textStyle} numberOfLines={numberOfLines} ellipsizeMode="tail">
      {segments.map((seg, index) => (
        <Text key={index} style={segmentStyle(seg)}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
};

export default RichTextInline;
