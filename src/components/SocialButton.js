import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { heightPercentageToDP } from '../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const SOCIAL_ICONS = {
  google: { name: 'google', color: '#DB4437' },
  apple: { name: 'apple', color: '#000000' },
  facebook: { name: 'facebook', color: '#1877F2' },
};

const SocialButton = ({
  type = 'google',
  title,
  onPress,
  style: customStyle,
  disabled = false,
  loading = false,
}) => {
  const icon = SOCIAL_ICONS[type];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        flexDirectionRow,
        alignItemsCenter,
        alignJustifyCenter,
        isDisabled && styles.buttonDisabled,
        customStyle,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={grayColor} />
      ) : (
        <>
          <Icon name={icon.name} size={17} color={icon.color} />
          <Text style={[styles.title, style.fontWeightThin]} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default SocialButton;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: heightPercentageToDP(6),
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.xLarge,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
    gap: spacings.normal,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  title: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
});
