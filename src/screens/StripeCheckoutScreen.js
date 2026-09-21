import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, redColor, whiteColor } from '../constans/Color';
import { style } from '../constans/Fonts';
import {
  ERROR_ESCROW_CHECKOUT_FAILED,
  ERROR_STRIPE_KEY_MISSING,
  STRIPE_CANCEL_URL,
  STRIPE_EMBED_BASE_URL,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_RETURN_SUCCESS_FLAGS,
  STRIPE_SUCCESS_URL,
} from '../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

/**
 * Builds the page that hosts Stripe's own embedded checkout iframe.
 *
 * The backend creates embedded Checkout sessions, which have no hosted URL to
 * open — only a client_secret that Stripe.js mounts. The web app does this with
 * @stripe/react-stripe-js; here the same thing runs inside the WebView.
 *
 * On completion Stripe redirects the whole page to the session's return_url,
 * which the WebView's navigation handler picks up exactly as it does for a
 * hosted checkout.
 */
const buildEmbedHtml = (clientSecret, publishableKey) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
    <script src="https://js.stripe.com/v3/"></script>
    <style>
      html, body { margin: 0; padding: 0; background: #fff; -webkit-text-size-adjust: 100%; }
      #checkout { min-height: 100vh; }
    </style>
  </head>
  <body>
    <div id="checkout"></div>
    <script>
      (function () {
        var post = function (payload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        };
        try {
          var stripe = Stripe(${JSON.stringify(publishableKey)});
          stripe
            .initEmbeddedCheckout({ clientSecret: ${JSON.stringify(clientSecret)} })
            .then(function (checkout) {
              checkout.mount('#checkout');
              post({ type: 'ready' });
            })
            .catch(function (err) {
              post({ type: 'error', message: String((err && err.message) || err) });
            });
        } catch (err) {
          post({ type: 'error', message: String((err && err.message) || err) });
        }
      })();
    </script>
  </body>
</html>`;

/**
 * In-app Stripe Checkout. Handles both session shapes the backend can return:
 *
 *   checkoutUrl  — a hosted Stripe page, loaded directly.
 *   clientSecret — an embedded session, mounted via Stripe.js (see above).
 *
 * Either way it watches navigation for the success/cancel return URLs and calls
 * route.params.onResult with 'success' | 'cancel' exactly once, then pops back
 * to the caller (which confirms with the backend + refreshes balances).
 */
const StripeCheckoutScreen = ({ navigation, route }) => {
  const checkoutUrl = route.params?.checkoutUrl;
  const clientSecret = route.params?.clientSecret;
  const onResult = route.params?.onResult;
  const title = route.params?.title || 'Secure Payment';

  const settledRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const html = useMemo(
    () =>
      clientSecret && STRIPE_PUBLISHABLE_KEY
        ? buildEmbedHtml(clientSecret, STRIPE_PUBLISHABLE_KEY)
        : '',
    [clientSecret],
  );

  // The key comes from .env through react-native-config, which is a NATIVE
  // module — adding it to .env does nothing until the app is rebuilt. Say so
  // instead of rendering an empty screen, which is what used to happen.
  const missingKey = Boolean(clientSecret) && !STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    console.log('[StripeCheckout] Params >>>', {
      hasCheckoutUrl: Boolean(checkoutUrl),
      hasClientSecret: Boolean(clientSecret),
      hasPublishableKey: Boolean(STRIPE_PUBLISHABLE_KEY),
    });
  }, [checkoutUrl, clientSecret]);

  const finish = result => {
    if (settledRef.current) return;
    settledRef.current = true;
    onResult?.(result);
    navigation.goBack();
  };

  /**
   * Classifies a URL the WebView is about to visit. Returns 'success',
   * 'cancel', or '' when it's just part of the checkout itself.
   *
   * The return URL can be ours (STRIPE_SUCCESS_URL) or, when the backend
   * ignores the return_url we send, the web app's own booking/wallet page —
   * recognised by the query flags those pages use. Anything carrying a
   * session_id back to a page that isn't Stripe's is a completed checkout too:
   * that's the shape of every return URL the backend builds.
   */
  const classify = url => {
    if (!url) return '';
    if (url.startsWith(STRIPE_EMBED_BASE_URL)) return '';
    if (url.startsWith(STRIPE_CANCEL_URL)) return 'cancel';
    if (url.startsWith(STRIPE_SUCCESS_URL)) return 'success';
    if (STRIPE_RETURN_SUCCESS_FLAGS.some(f => url.includes(f))) return 'success';
    // Everything Stripe loads for the checkout itself — including its internal
    // API calls, some of which carry a session_id — must never be mistaken for
    // the return redirect.
    const isStripe = /^https?:\/\/([a-z0-9-]+\.)*stripe\.(com|network)(\/|$)/i.test(url);
    if (!isStripe && url.includes('session_id=')) return 'success';
    return '';
  };

  /**
   * Fires for every navigation the WebView attempts, including the redirect
   * Stripe performs once payment completes. Returning false stops that page
   * from loading at all — otherwise the buyer sits on a spinner while the web
   * app loads behind the scenes, which is what used to happen.
   */
  const handleShouldStartLoad = request => {
    const url = request?.url || '';
    const result = classify(url);
    console.log('[StripeCheckout] Nav >>>', { url, result });
    if (!result) return true;
    finish(result);
    return false;
  };

  // Backstop for redirects that don't surface as a load request (some Android
  // WebView redirect chains). finish() is idempotent, so a double hit is safe.
  const handleNavChange = navState => {
    const result = classify(navState?.url || '');
    if (result) finish(result);
  };

  const handleMessage = event => {
    let payload = null;
    try {
      payload = JSON.parse(event?.nativeEvent?.data || '{}');
    } catch {
      return;
    }
    console.log('[StripeCheckout] Page <<<', payload);
    if (payload?.type === 'ready') setLoading(false);
    // Stripe.js couldn't mount (expired session, bad key, no network). Show it
    // here instead of leaving the buyer on a blank white page.
    if (payload?.type === 'error') {
      setLoading(false);
      setError(payload.message || ERROR_ESCROW_CHECKOUT_FAILED);
    }
  };

  if (!checkoutUrl && !html && !missingKey) return null;

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top', 'bottom']}>
      <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => finish('cancel')}>
          <Icon name="x" size={22} color={blackColor} />
        </TouchableOpacity>
        <Text style={[styles.title, style.fontWeightMedium]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.lockWrap}>
          <Icon name="lock" size={16} color={grayColor} />
        </View>
      </View>

      <View style={flex}>
        {missingKey ? (
          <View style={[flex, alignJustifyCenter, styles.errorWrap]}>
            <Icon name="alert-circle" size={28} color={redColor} />
            <Text style={[styles.errorText, style.fontWeightThin]}>
              {ERROR_STRIPE_KEY_MISSING}
            </Text>
          </View>
        ) : error ? (
          <View style={[flex, alignJustifyCenter, styles.errorWrap]}>
            <Icon name="alert-circle" size={28} color={redColor} />
            <Text style={[styles.errorText, style.fontWeightThin]}>{error}</Text>
          </View>
        ) : (
          <WebView
            source={checkoutUrl ? { uri: checkoutUrl } : { html, baseUrl: STRIPE_EMBED_BASE_URL }}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onNavigationStateChange={handleNavChange}
            onMessage={handleMessage}
            onLoadStart={() => setLoading(true)}
            // The embedded page reports its own readiness once Stripe has
            // mounted — onLoadEnd fires while the iframe is still blank.
            onLoadEnd={() => {
              if (checkoutUrl) setLoading(false);
            }}
            onError={e => {
              setLoading(false);
              setError(e?.nativeEvent?.description || ERROR_ESCROW_CHECKOUT_FAILED);
            }}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
          />
        )}
        {loading && !error ? (
          <View style={[StyleSheet.absoluteFill, alignJustifyCenter, styles.loaderOverlay]}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default StripeCheckoutScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  header: {
    width: '100%',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
    gap: wp(2),
  },
  closeBtn: {
    width: wp(9),
    height: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  lockWrap: {
    width: wp(9),
    height: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loaderOverlay: { backgroundColor: whiteColor },
  errorWrap: { paddingHorizontal: wp(10), gap: hp(1.5) },
  errorText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
    textAlign: 'center',
    lineHeight: 22,
  },
});
