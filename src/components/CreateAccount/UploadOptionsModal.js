import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { blackColor, borderLightColor, grayColor, whiteColor } from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BROWSE_FILES,
  PHOTO_LIBRARY,
  TAKE_PHOTO,
  UPLOAD_FILES,
} from '../../constans/Constants';

const { flexDirectionRow, alignItemsCenter } = BaseStyle;

const OPTIONS = [
  { key: 'gallery', label: PHOTO_LIBRARY, icon: 'image' },
  { key: 'camera', label: TAKE_PHOTO, icon: 'camera' },
  { key: 'files', label: BROWSE_FILES, icon: 'folder' },
];

const UploadOptionsModal = ({ visible, onClose, onSelect }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={[styles.title, style.fontWeightMedium]}>{UPLOAD_FILES}</Text>
          {OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[styles.option, flexDirectionRow, alignItemsCenter]}
              onPress={() => {
                onSelect(option.key);
                onClose();
              }}>
              <Icon name={option.icon} size={18} color={grayColor} />
              <Text style={[styles.optionText, style.fontSizeNormal2x]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={[styles.cancelText, style.fontWeightMedium]}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default UploadOptionsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: whiteColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.xxLarge,
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
