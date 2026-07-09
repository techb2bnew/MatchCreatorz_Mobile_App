import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { blackColor, grayColor, inputBgColor, redColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { heightPercentageToDP } from '../utils';
import FormLabel from './FormLabel';

const { flexDirectionRow, alignItemsCenter } = BaseStyle;

const CustomTextInput = ({
  value,
  onChangeText,
  placeholder,
  label,
  required = false,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style: customStyle,
  inputStyle,
  onRightIconPress,
  editable = true,
  error,
  maxLength,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={customStyle}>
      <FormLabel label={label} required={required} />
      <View
        style={[
          styles.container,
          flexDirectionRow,
          alignItemsCenter,
          error ? styles.containerError : null,
        ]}>
        {leftIcon ? (
          <Icon name={leftIcon} size={17} color={grayColor} style={styles.leftIcon} />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={grayColor}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          maxLength={maxLength}
          onFocus={onFocus}
          onBlur={onBlur}
          style={[styles.input, style.fontSizeNormal2x, inputStyle]}
          {...rest}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(prev => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.rightIcon}>
            <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={17} color={grayColor} />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Icon name={rightIcon} size={17} color={grayColor} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    minHeight: heightPercentageToDP(6),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerError: {
    borderColor: redColor,
  },
  leftIcon: {
    marginRight: spacings.normal,
  },
  input: {
    flex: 1,
    color: blackColor,
    paddingVertical: spacings.medium,
  },
  rightIcon: {
    padding: spacings.xsmall,
    marginLeft: spacings.small,
  },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginTop: spacings.xsmall,
    marginLeft: spacings.xsmall,
  },
});
