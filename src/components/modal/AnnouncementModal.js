import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { blackColor, grayColor, purpleColor, whiteColor } from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { NOTIFICATION_ANNOUNCEMENT_TAG } from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

/** Full detail of an admin broadcast — broadcasts have no screen to route to. */
const AnnouncementModal = ({ visible, item, onClose }) => (
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
          <View style={[styles.headerIconWrap, alignJustifyCenter]}>
            <Icon name="radio" size={18} color={purpleColor} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.tag, style.fontWeightMedium]}>{NOTIFICATION_ANNOUNCEMENT_TAG}</Text>
            <Text style={[styles.title, style.fontWeightMedium]}>{item?.title || '—'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="x" size={20} color={grayColor} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <Text style={[styles.message, style.fontWeightThin]}>{item?.message || '—'}</Text>
          {item?.fullTime ? (
            <Text style={[styles.time, style.fontWeightThin]}>{item.fullTime}</Text>
          ) : null}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default AnnouncementModal;

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
    borderRadius: 20,
    backgroundColor: '#F3E8FB',
    flexShrink: 0,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  tag: {
    fontSize: style.fontSizeSmall.fontSize,
    color: purpleColor,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginTop: 1,
  },
  message: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    lineHeight: 22,
  },
  time: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: spacings.large,
  },
});
