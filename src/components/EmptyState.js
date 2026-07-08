import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, inputBgColor, redColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import CustomButton from './CustomButton';
import { heightPercentageToDP as hp } from '../utils';

const { alignItemsCenter, alignJustifyCenter } = BaseStyle;

const EmptyState = ({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}) => {
  return (
    <View style={[styles.wrap, alignItemsCenter, compact && styles.wrapCompact]}>
      <View style={[styles.iconWrap, alignJustifyCenter]}>
        <Icon name={icon} size={compact ? 24 : 28} color={redColor} />
      </View>
      <Text style={[styles.title, style.fontWeightMedium]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, style.fontWeightThin]}>{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <CustomButton
          title={actionLabel}
          onPress={onAction}
          style={styles.actionBtn}
          textStyle={styles.actionBtnText}
        />
      ) : null}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: hp(6),
    paddingHorizontal: spacings.xLarge,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: whiteColor,
    gap: spacings.normal,
  },
  wrapCompact: {
    paddingVertical: hp(3),
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: inputBgColor,
    marginBottom: spacings.small,
  },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    textAlign: 'center',
  },
  message: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacings.small,
  },
  actionBtn: {
    width: 'auto',
    minWidth: 160,
    marginTop: spacings.normal,
    paddingHorizontal: spacings.xLarge,
  },
  actionBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
