import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { whiteColor, redColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { heightPercentageToDP } from '../utils';

const { alignJustifyCenter, flexDirectionRow } = BaseStyle;

const CustomButton = ({
  title,
  onPress,
  backgroundColor = redColor,
  textColor = whiteColor,
  iconName,
  iconSize = 16,
  iconPosition = 'left',
  style: customStyle,
  textStyle: customTextStyle,
  disabled = false,
  loading = false,
  borderColor,
  borderWidth = 0,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        alignJustifyCenter,
        flexDirectionRow,
        {
          backgroundColor: disabled ? '#ccc' : backgroundColor,
          borderColor,
          borderWidth,
        },
        customStyle,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {iconName && iconPosition === 'left' ? (
            <Icon name={iconName} size={iconSize} color={textColor} style={styles.iconLeft} />
          ) : null}
          <Text style={[styles.title, style.fontWeightMedium, { color: textColor }, customTextStyle]}>
            {title}
          </Text>
          {iconName && iconPosition === 'right' ? (
            <Icon name={iconName} size={iconSize} color={textColor} style={styles.iconRight} />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: heightPercentageToDP(6),
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.xLarge,
    borderRadius: 10,
  },
  title: {
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
