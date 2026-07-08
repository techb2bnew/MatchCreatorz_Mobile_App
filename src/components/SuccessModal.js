import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomButton from './CustomButton';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  grayColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { OK } from '../constans/Constants';
import { widthPercentageToDP as wp } from '../utils';

const { alignItemsCenter, alignJustifyCenter } = BaseStyle;

const SuccessModal = ({
  visible,
  title,
  message,
  buttonTitle = OK,
  onPress,
  iconName = 'check',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPress}>
      <View style={[styles.overlay, alignJustifyCenter]}>
        <View style={[styles.card, alignItemsCenter]}>
          <View style={[styles.iconCircle, alignJustifyCenter]}>
            <Icon name={iconName} size={36} color={redColor} />
          </View>

          <Text style={[styles.title, style.fontWeightBold]}>{title}</Text>
          <Text style={[styles.message, style.fontWeightThin]}>{message}</Text>

          <CustomButton title={buttonTitle} backgroundColor={redColor} onPress={onPress} style={styles.okButton} />
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: wp(8),
  },
  card: {
    width: '100%',
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xxLarge,
    paddingVertical: spacings.ExtraLarge,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightPink,
    marginBottom: spacings.xLarge,
  },
  title: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
    textAlign: 'center',
    marginBottom: spacings.normal,
  },
  message: {
    fontSize: style.fontSizeNormal1x.fontSize,
    color: grayColor,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacings.xxLarge,
  },
  okButton: {
    width: '100%',
  },
});
