import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  PAYMENT_CHOICE_CONFIRM,
  PAYMENT_CHOICE_DIRECT,
  PAYMENT_CHOICE_DIRECT_NOTE,
  PAYMENT_CHOICE_HOLD,
  PAYMENT_CHOICE_HOLD_NOTE_HIGHLIGHT,
  PAYMENT_CHOICE_HOLD_NOTE_PREFIX,
  PAYMENT_CHOICE_HOLD_NOTE_SUFFIX,
  PAYMENT_CHOICE_SUBTITLE,
  PAYMENT_CHOICE_TITLE,
} from '../../constans/Constants';
import { PAYMENT_TYPES } from '../../utils/escrow';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

/**
 * How the buyer wants to pay an escrow booking / milestone / work entry, asked
 * the first time they accept it:
 *
 *   direct — charged and released to the seller now.
 *   hold   — card authorised only; captured when they accept a second time,
 *            or released with no charge if they cancel the hold.
 *
 * Only rendered when the admin's Delayed Payments toggle is on — with it off
 * there's nothing to choose and the caller goes straight to 'direct'.
 */
const PaymentChoiceModal = ({
  visible,
  amountLabel = '',
  holdDays,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const [selected, setSelected] = useState(PAYMENT_TYPES.DIRECT);

  // Reopening always starts from "Pay now" rather than whatever was picked for
  // some earlier milestone.
  useEffect(() => {
    if (visible) setSelected(PAYMENT_TYPES.DIRECT);
  }, [visible]);

  const options = [
    {
      key: PAYMENT_TYPES.DIRECT,
      icon: 'zap',
      title: PAYMENT_CHOICE_DIRECT,
      note: PAYMENT_CHOICE_DIRECT_NOTE,
    },
    {
      key: PAYMENT_TYPES.HOLD,
      icon: 'clock',
      title: PAYMENT_CHOICE_HOLD,
      note: PAYMENT_CHOICE_HOLD_NOTE_PREFIX,
      // Called out in red: how long the money is tied up is the term buyers
      // most often miss, and the one that decides whether this is right.
      highlight: PAYMENT_CHOICE_HOLD_NOTE_HIGHLIGHT(holdDays),
      noteAfter: PAYMENT_CHOICE_HOLD_NOTE_SUFFIX,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={loading ? undefined : onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={loading ? undefined : onClose}
        />
        <View style={styles.sheet}>
          <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
            <View style={[styles.headerIcon, alignJustifyCenter]}>
              <Icon name="credit-card" size={18} color={redColor} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, style.fontWeightMedium]}>{PAYMENT_CHOICE_TITLE}</Text>
              <Text style={[styles.subtitle, style.fontWeightThin]}>
                {PAYMENT_CHOICE_SUBTITLE}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          {amountLabel ? (
            <View style={[styles.amountBox, alignJustifyCenter]}>
              <Text style={[styles.amountText, style.fontWeightMedium]}>{amountLabel}</Text>
            </View>
          ) : null}

          {options.map(option => {
            const active = selected === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setSelected(option.key)}
                disabled={loading}
                activeOpacity={0.85}>
                <View style={[flexDirectionRow, alignItemsCenter, styles.optionHead]}>
                  <Icon name={option.icon} size={15} color={active ? redColor : grayColor} />
                  <Text
                    style={[
                      styles.optionTitle,
                      style.fontWeightMedium,
                      active && styles.optionTitleActive,
                    ]}>
                    {option.title}
                  </Text>
                  <View style={[styles.radio, active && styles.radioActive, alignJustifyCenter]}>
                    {active ? <Icon name="check" size={12} color={whiteColor} /> : null}
                  </View>
                </View>
                <Text style={[styles.optionNote, style.fontWeightThin]}>
                  {option.note}
                  {option.highlight ? (
                    <Text style={[styles.optionNoteHighlight, style.fontWeightMedium]}>
                      {option.highlight}
                    </Text>
                  ) : null}
                  {option.noteAfter || ''}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.confirmBtn, alignJustifyCenter]}
            onPress={() => onConfirm?.(selected)}
            disabled={loading}
            activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator size="small" color={whiteColor} />
            ) : (
              <Text style={[styles.confirmText, style.fontWeightMedium]}>
                {PAYMENT_CHOICE_CONFIRM}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentChoiceModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: whiteColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: wp(5),
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.xxLarge,
    maxHeight: hp(85),
  },
  header: { gap: spacings.normal, marginBottom: spacings.large },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: lightPink, flexShrink: 0 },
  headerText: { flex: 1, minWidth: 0 },
  title: { fontSize: style.fontSizeMedium1x.fontSize, color: blackColor },
  subtitle: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, marginTop: 2 },
  amountBox: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    paddingVertical: spacings.normal,
    marginBottom: spacings.large,
  },
  amountText: { fontSize: style.fontSizeMedium1x.fontSize, color: greenColor },
  option: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.normal,
  },
  optionActive: { borderColor: redColor, backgroundColor: '#FFF5F5' },
  optionHead: { gap: spacings.small, marginBottom: 6 },
  optionTitle: { flex: 1, fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  optionTitleActive: { color: redColor },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    flexShrink: 0,
  },
  radioActive: { borderColor: redColor, backgroundColor: redColor },
  optionNote: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, lineHeight: 18 },
  optionNoteHighlight: { color: redColor },
  confirmBtn: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: redColor,
    marginTop: spacings.small,
  },
  confirmText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
});
