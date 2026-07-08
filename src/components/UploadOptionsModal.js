import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  BROWSE_FILES,
  CONFIRM_CANCEL,
  PHOTO_LIBRARY,
  TAKE_PHOTO,
  UPLOAD_FILES,
} from '../constans/Constants';
import { widthPercentageToDP as wp } from '../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const ALL_OPTIONS = [
  { key: 'gallery', label: PHOTO_LIBRARY, icon: 'image' },
  { key: 'camera', label: TAKE_PHOTO, icon: 'camera' },
  { key: 'files', label: BROWSE_FILES, icon: 'folder' },
];

const UploadOptionsModal = ({
  visible,
  onClose,
  onSelect,
  title = UPLOAD_FILES,
  photoOnly = false,
}) => {
  const options = photoOnly
    ? ALL_OPTIONS.filter(option => option.key === 'gallery' || option.key === 'camera')
    : ALL_OPTIONS;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <View style={[styles.overlay, alignJustifyCenter]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.card}>
          <Text style={[styles.title, style.fontWeightMedium]}>{title}</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[styles.option, flexDirectionRow, alignItemsCenter]}
              onPress={() => {
                onClose();
                setTimeout(() => onSelect(option.key), 300);
              }}>
              <Icon name={option.icon} size={18} color={grayColor} />
              <Text style={[styles.optionText, style.fontSizeNormal2x]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={[styles.cancelText, style.fontWeightMedium]}>{CONFIRM_CANCEL}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UploadOptionsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: wp(8),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.large,
    textAlign: 'center',
  },
  option: {
    gap: spacings.large,
    paddingVertical: spacings.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  optionText: {
    color: blackColor,
  },
  cancelBtn: {
    marginTop: spacings.large,
    paddingVertical: spacings.large,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
  },
});
