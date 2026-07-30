import React from 'react';
import RichTextInline from './RichTextInline';
import { blackColor } from '../constans/Color';
import { style } from '../constans/Fonts';

/**
 * Full (untruncated) renderer for an HTML description string produced by
 * <RichTextEditor/>. Delegates to <RichTextInline/> (nested <Text>) — no
 * WebView, so it renders reliably everywhere (a WebView's auto-height can
 * collapse to 0 and become invisible). Bold/italic/underline + paragraph and
 * bullet line breaks are preserved; plain-text values render fine too.
 */
const RichTextViewer = ({ html, color = blackColor, fontSize }) => {
  if (!html) return null;
  const textStyle = {
    color: typeof color === 'string' ? color : blackColor,
    fontSize: fontSize || style.fontSizeNormal2x.fontSize,
    lineHeight: 22,
  };
  return <RichTextInline html={html} style={textStyle} />;
};

export default RichTextViewer;
