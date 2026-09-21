import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { grayColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { HOLD_BADGE, HOLD_CANCEL_BUTTON } from '../constans/Constants';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const HOLD_AMBER = '#B26A00';
const HOLD_AMBER_BG = '#FFF6E5';

/**
 * Shown on a booking / milestone / work entry whose escrow payment is a
 * "Pay & Hold" authorisation: the buyer's card is committed but nothing has
 * been charged yet. Accepting again captures it; Cancel hold releases the
 * authorisation with no charge.
 *
 * Both sides see it, worded for who's reading: the buyer is told what their own
 * card is doing and can cancel, the seller is told their money is committed and
 * has no action to take.
 */
const HoldNotice = ({ days, onCancel, busy = false, role = 'buyer' }) => (
  <View style={styles.box}>
    <View style={[flexDirectionRow, alignItemsCenter, styles.head]}>
      <Icon name="clock" size={13} color={HOLD_AMBER} />
      <Text style={[styles.title, style.fontWeightMedium]}>{HOLD_BADGE}</Text>
    </View>
    <Text style={[styles.text, style.fontWeightThin]}>
      {role === 'seller'
        ? `The buyer has authorised this payment — the amount is committed on their card but not charged yet${
            days ? `, and the hold lasts up to ${days} day${Number(days) === 1 ? '' : 's'}` : ''
          }. It's paid out to you the moment they release it.`
        : `Your card is authorised but not charged${
            days ? ` — the hold expires in ${days} day${Number(days) === 1 ? '' : 's'}` : ''
          }. Releasing the payment charges it and pays the seller.`}
    </Text>
    {onCancel ? (
      <TouchableOpacity
        style={[styles.cancelBtn, alignJustifyCenter]}
        onPress={onCancel}
        disabled={busy}
        activeOpacity={0.85}>
        <Text style={[styles.cancelText, style.fontWeightMedium]}>{HOLD_CANCEL_BUTTON}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export default HoldNotice;

const styles = StyleSheet.create({
  box: {
    backgroundColor: HOLD_AMBER_BG,
    borderRadius: 10,
    padding: spacings.normal,
    marginTop: spacings.normal,
  },
  head: { gap: 6, marginBottom: 4 },
  title: { fontSize: style.fontSizeSmall.fontSize, color: HOLD_AMBER },
  text: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor, lineHeight: 16 },
  cancelBtn: {
    marginTop: spacings.normal,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HOLD_AMBER,
  },
  cancelText: { fontSize: style.fontSizeSmall.fontSize, color: HOLD_AMBER },
});
