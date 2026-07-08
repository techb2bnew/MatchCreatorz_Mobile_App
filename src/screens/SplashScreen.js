import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MATCH_CREATORZ_LOGO } from '../assests/images';
import { BaseStyle } from '../constans/Style';
import { blackColor, grayColor, inputBgColor, redColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  CONNECT_CREATE,
  SCREEN_NAMES,
  SPLASH_APP_NAME,
  SPLASH_DURATION,
  SUCCEED,
} from '../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, alignItemsCenter, alignJustifyCenter, resizeModeContain, textAlign } = BaseStyle;

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      navigation.replace(SCREEN_NAMES.LOGIN);
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, dotAnim]);

  const dotOpacity = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <SafeAreaView style={[flex, styles.container]} edges={['top', 'bottom']}>
      <View style={styles.glowOuter} />
      <View style={styles.glowMiddle} />
      <View style={styles.glowInner} />

      <View style={[flex, alignJustifyCenter]}>
        <Animated.View
          style={[
            styles.content,
            alignItemsCenter,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View style={styles.logoRing}>
            <View style={[styles.logoCircle, alignJustifyCenter]}>
              <Image source={MATCH_CREATORZ_LOGO} style={[styles.logo, resizeModeContain]} />
            </View>
          </View>

          <Text style={[styles.appName, style.fontWeightBold, textAlign]}>{SPLASH_APP_NAME}</Text>

          <Text style={[styles.tagline, style.fontWeightThin, textAlign]}>
            {CONNECT_CREATE}{' '}
            <Text style={styles.taglineHighlight}>{SUCCEED}</Text>
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.loaderRow, { opacity: dotOpacity }]}>
        <View style={styles.loaderDot} />
        <View style={[styles.loaderDot, styles.loaderDotMid]} />
        <View style={styles.loaderDot} />
      </Animated.View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
  },
  glowOuter: {
    position: 'absolute',
    width: wp(95),
    height: wp(95),
    borderRadius: wp(47.5),
    backgroundColor: redColor,
    opacity: 0.04,
    top: hp(22),
    alignSelf: 'center',
  },
  glowMiddle: {
    position: 'absolute',
    width: wp(72),
    height: wp(72),
    borderRadius: wp(36),
    backgroundColor: redColor,
    opacity: 0.07,
    top: hp(27),
    alignSelf: 'center',
  },
  glowInner: {
    position: 'absolute',
    width: wp(52),
    height: wp(52),
    borderRadius: wp(26),
    backgroundColor: redColor,
    opacity: 0.1,
    top: hp(31),
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: wp(8),
  },
  logoRing: {
    padding: 3,
    borderRadius: wp(16),
    borderWidth: 1.5,
    borderColor: 'rgba(233,69,69,0.25)',
    marginBottom: spacings.large,
  },
  logoCircle: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: inputBgColor,
  },
  logo: {
    width: wp(20),
    height: wp(20),
  },
  appName: {
    fontSize: style.fontSizeLarge3x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: grayColor,
    lineHeight: 28,
  },
  taglineHighlight: {
    color: redColor,
    fontWeight: '600',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: hp(4),
  },
  loaderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: redColor,
  },
  loaderDotMid: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});
