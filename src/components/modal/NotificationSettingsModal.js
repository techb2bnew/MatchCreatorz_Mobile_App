import React from 'react';
import {
  Modal,
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
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
  NOTIFICATION_PREFS_SUBTITLE,
  NOTIFICATION_PREFS_TITLE,
} from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } =
  BaseStyle;

const NotificationSettingsModal = ({ visible, onClose, settings, onToggle }) => {
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
          <View style={[styles.cardHeader, flexDirectionRow, alignItemsCenter]}>
            <View style={styles.headerIconWrap}>
              <Icon name="bell" size={18} color={redColor} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, style.fontWeightMedium]}>{NOTIFICATION_PREFS_TITLE}</Text>
              <Text style={[styles.subtitle, style.fontWeightThin]}>{NOTIFICATION_PREFS_SUBTITLE}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {settings.map((item, index) => (
              <View
                key={item.key}
                style={[
                  styles.settingRow,
                  flexDirectionRow,
                  alignItemsCenter,
                  justifyContentSpaceBetween,
                  index < settings.length - 1 && styles.settingBorder,
                ]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, style.fontWeightMedium]}>{item.title}</Text>
                  <Text style={[styles.settingDesc, style.fontWeightThin]}>{item.description}</Text>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={() => onToggle(item.key)}
                  trackColor={{ false: '#E5E5EA', true: redColor }}
                  thumbColor={whiteColor}
                  ios_backgroundColor="#E5E5EA"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationSettingsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: wp(5),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxHeight: hp(70),
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  cardHeader: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  subtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  settingRow: {
    paddingVertical: spacings.large,
    gap: spacings.normal,
  },
  settingBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  settingInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacings.normal,
  },
  settingTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
});
