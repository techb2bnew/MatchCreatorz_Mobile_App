import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseStyle } from '../constans/Style';
import { blackColor, grayColor, redColor } from '../constans/Color';
import { style } from '../constans/Fonts';
import ScreenHeader, { screenContentStyles } from '../components/ScreenHeader';
import RichTextInline from '../components/RichTextInline';
import { getPublicPageApi } from '../services/publicService';
import { heightPercentageToDP as hp } from '../utils';

const { flex, alignJustifyCenter } = BaseStyle;

const hasVisibleText = html =>
  String(html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0;

/**
 * Backend sends the page body as HTML (<p>…</p>, headings, lists). Split it into
 * blocks so each paragraph gets real spacing, then let RichTextInline render the
 * inline markup (bold / italic / lists) inside each block.
 */
const splitHtmlBlocks = html => {
  const source = String(html || '').trim();
  if (!source) return [];
  if (!/<\/?[a-z][\s\S]*>/i.test(source)) {
    // Plain text: paragraphs are blank-line separated.
    return source
      .split(/\n{2,}/)
      .map(text => ({ html: text, heading: 0 }))
      .filter(block => block.html.trim());
  }

  return source
    .split(/<\/(?:p|div|h[1-6]|ul|ol|blockquote)>/i)
    .map(chunk => {
      const trimmed = chunk.trim();
      const headingMatch = trimmed.match(/<h([1-6])[^>]*>/i);
      // Re-close list blocks so RichTextInline still sees the <li> structure.
      const closed = /<(ul|ol)[^>]*>/i.test(trimmed) ? `${trimmed}</ul>` : trimmed;
      return { html: closed, heading: headingMatch ? Number(headingMatch[1]) : 0 };
    })
    .filter(block => hasVisibleText(block.html));
};

/**
 * Renders a static content page (privacy / terms / contact) fetched from
 * GET /public/pages/{slug}. Params: { slug, title?, hideHeaderActions? }.
 * hideHeaderActions is used when opened from Login / Create Account, where the
 * notification + profile shortcuts have nothing to point at yet.
 */
const StaticPageScreen = ({ navigation, route }) => {
  const slug = route.params?.slug;
  const fallbackTitle = route.params?.title || '';
  const hideHeaderActions = Boolean(route.params?.hideHeaderActions);

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublicPageApi(slug)
      .then(res => {
        if (cancelled) return;
        setPage(res?.data || res || null);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this page. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const blocks = useMemo(() => splitHtmlBlocks(page?.content), [page?.content]);

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
      <ScrollView
        contentContainerStyle={screenContentStyles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={page?.title || fallbackTitle || 'Info'}
          navigation={navigation}
          onBack={() => navigation.goBack()}
          showNotifications={!hideHeaderActions}
          showAvatar={!hideHeaderActions}
        />
        {loading ? (
          <View style={[flex, alignJustifyCenter, styles.loader]}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : error ? (
          <Text style={[styles.error, style.fontWeightThin]}>{error}</Text>
        ) : blocks.length ? (
          blocks.map((block, index) => (
            <RichTextInline
              key={index}
              html={block.html}
              style={[styles.body, block.heading ? styles.heading : style.fontWeightThin]}
            />
          ))
        ) : (
          <Text style={[styles.body, style.fontWeightThin]}>—</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaticPageScreen;

const styles = StyleSheet.create({
  loader: { paddingVertical: hp(10) },
  body: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    lineHeight: 24,
    marginBottom: hp(1.5),
  },
  heading: {
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: '600',
    marginTop: hp(0.5),
  },
  error: { fontSize: style.fontSizeNormal2x.fontSize, color: grayColor, textAlign: 'center', marginTop: hp(4) },
});
