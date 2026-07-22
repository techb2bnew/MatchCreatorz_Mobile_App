import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, lightPink, redColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { widthPercentageToDP as wp } from '../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const HIDDEN_OFFSET = -220;

const ForegroundNotificationBanner = ({ visible, title, message, onPress, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : HIDDEN_OFFSET,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible, translateY]);

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.wrap, { top: insets.top + 8, transform: [{ translateY }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.card, flexDirectionRow, alignItemsCenter]}>
        <View style={[styles.iconWrap, alignJustifyCenter]}>
          <Icon name="bell" size={16} color={redColor} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, style.fontWeightMedium]} numberOfLines={1}>
            {title}
          </Text>
          {message ? (
            <Text style={[styles.message, style.fontWeightThin]} numberOfLines={2}>
              {message}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="x" size={16} color={grayColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ForegroundNotificationBanner;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: wp(4),
    right: wp(4),
    zIndex: 999,
    elevation: 10,
  },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.large,
    gap: spacings.normal,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: lightPink,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  message: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
    lineHeight: 17,
  },
});
