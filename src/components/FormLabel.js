import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { grayColor, redColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';

const FormLabel = ({ label, required = false, style: customStyle }) => {
  if (!label) return null;

  return (
    <Text style={[styles.label, style.fontWeightMedium, customStyle]}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
};

export default FormLabel;

const styles = StyleSheet.create({
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: spacings.normal,
    letterSpacing: 0.5,
  },
  required: {
    color: redColor,
  },
});
