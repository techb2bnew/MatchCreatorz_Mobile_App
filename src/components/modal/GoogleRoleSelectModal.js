import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BUYER_CLIENT,
  BUYER_SUBTITLE,
  CONFIRM_CANCEL,
  CREATOR_SELLER,
  CREATOR_SUBTITLE,
  GOOGLE_ROLE_MODAL_SUBTITLE,
  GOOGLE_ROLE_MODAL_TITLE,
  USER_ROLES,
} from '../../constans/Constants';
import { widthPercentageToDP as wp } from '../../utils';

const { flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const ROLE_OPTIONS = [
  { id: USER_ROLES.BUYER, title: BUYER_CLIENT, subtitle: BUYER_SUBTITLE, icon: 'shopping-bag' },
  { id: USER_ROLES.CREATOR, title: CREATOR_SELLER, subtitle: CREATOR_SUBTITLE, icon: 'briefcase' },
];

const GoogleRoleSelectModal = ({ visible, loading = false, onSelectRole, onCancel }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={loading ? undefined : onCancel}>
      <View style={[styles.overlay, alignJustifyCenter]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={loading ? undefined : onCancel} />
        <View style={styles.card}>
          <Text style={[styles.title, style.fontWeightBold]}>{GOOGLE_ROLE_MODAL_TITLE}</Text>
          <Text style={[styles.subtitle, style.fontWeightThin]}>{GOOGLE_ROLE_MODAL_SUBTITLE}</Text>

          {loading ? (
            <View style={[styles.loaderWrap, alignJustifyCenter]}>
              <ActivityIndicator size="large" color={redColor} />
            </View>
          ) : (
            <View style={[styles.roleRow, flexDirectionRow, justifyContentSpaceBetween]}>
              {ROLE_OPTIONS.map(role => (
                <TouchableOpacity
                  key={role.id}
                  activeOpacity={0.85}
                  onPress={() => onSelectRole(role.id)}
                  style={[styles.roleCard, alignItemsCenter]}>
                  <View style={[styles.roleIconBox, alignJustifyCenter]}>
                    <Icon name={role.icon} size={18} color={redColor} />
                  </View>
                  <Text style={[styles.roleTitle, style.fontWeightMedium]}>{role.title}</Text>
                  <Text style={[styles.roleSubtitle, style.fontWeightThin]}>{role.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
            <Text style={[styles.cancelText, style.fontWeightMedium]}>{CONFIRM_CANCEL}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GoogleRoleSelectModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: wp(7),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xxLarge,
    paddingBottom: spacings.large,
  },
  title: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    textAlign: 'center',
    marginTop: spacings.small,
    marginBottom: spacings.xLarge,
  },
  loaderWrap: {
    minHeight: wp(30),
  },
  roleRow: {
    gap: spacings.normal,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.normal,
  },
  roleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: lightPink,
    marginBottom: spacings.normal,
  },
  roleTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    textAlign: 'center',
    marginBottom: 2,
  },
  roleSubtitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: spacings.xLarge,
    paddingVertical: spacings.normal,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
  },
});
