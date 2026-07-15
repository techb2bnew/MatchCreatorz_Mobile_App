import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { CONFIRM_CANCEL, CONFIRM_YES } from '../../constans/Constants';
import { widthPercentageToDP as wp } from '../../utils';

const { alignItemsCenter, alignJustifyCenter, flexDirectionRow } = BaseStyle;

const ConfirmationModal = ({
  visible,
  title,
  message,
  confirmText = CONFIRM_YES,
  cancelText = CONFIRM_CANCEL,
  onConfirm,
  onCancel,
  confirmColor = redColor,
  iconName = 'alert-circle',
  iconBgColor = lightPink,
  iconColor = redColor,
  showReasonInput = false,
  reasonValue = '',
  onReasonChange,
  reasonPlaceholder = 'Enter reason...',
  reasonError = '',
  loading = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, alignJustifyCenter]}>
        <View style={[styles.card, alignItemsCenter]}>
          <View style={[styles.iconCircle, alignJustifyCenter, { backgroundColor: iconBgColor }]}>
            <Icon name={iconName} size={32} color={iconColor} />
          </View>

          <Text style={[styles.title, style.fontWeightBold]}>{title}</Text>
          <Text style={[styles.message, style.fontWeightThin]}>{message}</Text>

          {showReasonInput ? (
            <View style={styles.reasonWrap}>
              <TextInput
                style={[styles.reasonInput, style.fontWeightThin]}
                value={reasonValue}
                onChangeText={onReasonChange}
                placeholder={reasonPlaceholder}
                placeholderTextColor={grayColor}
                multiline
                textAlignVertical="top"
                editable={!loading}
              />
              {reasonError ? (
                <Text style={[styles.reasonError, style.fontWeightThin]}>{reasonError}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.btnRow, flexDirectionRow]}>
            <TouchableOpacity
              style={[styles.cancelBtn, alignJustifyCenter]}
              onPress={onCancel}
              disabled={loading}>
              <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, alignJustifyCenter, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Text style={[styles.confirmBtnText, style.fontWeightMedium]}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

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
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacings.xLarge,
  },
  title: {
    fontSize: style.fontSizeLarge.fontSize,
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
  reasonWrap: {
    width: '100%',
    marginTop: -spacings.large,
    marginBottom: spacings.xLarge,
  },
  reasonInput: {
    width: '100%',
    minHeight: 88,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 10,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  reasonError: {
    marginTop: spacings.small,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  btnRow: {
    width: '100%',
    gap: spacings.normal,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
  },
  cancelBtnText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: whiteColor,
  },
});
