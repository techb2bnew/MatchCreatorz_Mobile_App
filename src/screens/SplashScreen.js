import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MATCH_CREATORZ_LOGO } from '../assests/images';
import { BaseStyle } from '../constans/Style';
import { redColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  SCREEN_NAMES,
  SPLASH_APP_NAME,
  SPLASH_DURATION,
  SPLASH_TAGLINE,
} from '../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, alignItemsCenter, alignJustifyCenter, resizeModeContain, textAlign } = BaseStyle;

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      navigation.replace(SCREEN_NAMES.LOGIN);
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, pulseAnim]);

  return (
    <SafeAreaView style={[flex, styles.container]} edges={['top', 'bottom']}>
      <View style={styles.topAccent} />
      <View style={styles.bottomAccent} />

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
          <View style={[styles.logoWrap, alignJustifyCenter]}>
            <Image source={MATCH_CREATORZ_LOGO} style={[styles.logo, resizeModeContain]} />
          </View>

          <Text style={[styles.appName, style.fontWeightBold, textAlign]}>{SPLASH_APP_NAME}</Text>
          <Text style={[styles.tagline, style.fontWeightMedium, textAlign]}>{SPLASH_TAGLINE}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.loaderWrap, alignItemsCenter, { opacity: pulseAnim }]}>
        <View style={styles.loaderBarTrack}>
          <View style={styles.loaderBarFill} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
  },
  topAccent: {
    position: 'absolute',
    top: -hp(8),
    right: -wp(20),
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    backgroundColor: redColor,
    opacity: 0.08,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: -hp(6),
    left: -wp(18),
    width: wp(55),
    height: wp(55),
    borderRadius: wp(28),
    backgroundColor: redColor,
    opacity: 0.07,
  },
  content: {
    paddingHorizontal: wp(8),
  },
  logoWrap: {
    width: wp(32),
    height: wp(32),
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: 'rgba(233,69,69,0.18)',
    marginBottom: spacings.xLarge,
  },
  logo: {
    width: wp(22),
    height: wp(22),
  },
  appName: {
    fontSize: style.fontSizeLarge3x.fontSize,
    color: '#1C1E2B',
    marginBottom: spacings.small,
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: redColor,
  },
  loaderWrap: {
    paddingBottom: hp(5),
  },
  loaderBarTrack: {
    width: wp(28),
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
  },
  loaderBarFill: {
    width: '55%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: redColor,
  },
});
