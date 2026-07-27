import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, redColor, whiteColor } from '../constans/Color';
import { style } from '../constans/Fonts';
import { STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL } from '../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

/**
 * In-app Stripe Checkout. Loads the hosted checkout URL in a WebView and watches
 * navigation for the success/cancel return URLs. Calls route.params.onResult with
 * 'success' | 'cancel' exactly once, then pops back to the caller (which confirms
 * with the backend + refreshes balances).
 */
const StripeCheckoutScreen = ({ navigation, route }) => {
  const checkoutUrl = route.params?.checkoutUrl;
  const onResult = route.params?.onResult;
  const title = route.params?.title || 'Secure Payment';

  const settledRef = useRef(false);
  const [loading, setLoading] = useState(true);

  const finish = result => {
    if (settledRef.current) return;
    settledRef.current = true;
    onResult?.(result);
    navigation.goBack();
  };

  const handleNavChange = navState => {
    const url = navState?.url || '';
    if (url.startsWith(STRIPE_SUCCESS_URL)) {
      finish('success');
    } else if (url.startsWith(STRIPE_CANCEL_URL)) {
      finish('cancel');
    }
  };

  if (!checkoutUrl) {
    return null;
  }

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
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleNavChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
        />
        {loading ? (
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
});
