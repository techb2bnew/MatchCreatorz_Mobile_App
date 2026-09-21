import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  TXN_BREAKDOWN_GROSS,
  TXN_BREAKDOWN_NET,
  TXN_BREAKDOWN_PAID,
  TXN_BREAKDOWN_PLATFORM_FEE,
  TXN_BREAKDOWN_STRIPE_FEE,
  TXN_BREAKDOWN_STRIPE_FEE_LATER,
  TXN_HOLD_STATUS_META,
  TXN_RECEIPT_BUTTON,
  TXN_STATUS_META,
} from '../constans/Constants';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const CREDIT_GREEN = '#1B7A45';
const HOLD_AMBER = '#B26A00';
const HOLD_AMBER_BG = '#FFF6E5';

const money = (value, currency = '$') =>
  `${currency}${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * One row of wallet history, shared by the buyer and seller wallet screens.
 * Takes a row from mapWalletTxn().
 *
 * Rows that carry a fee breakdown expand in place to show where the money went:
 *   gross = platform fee + Stripe fee + net to seller
 * Buyer and seller see the same figures for the same settlement, so a buyer's
 * $500 payment and the seller's $425 earning reconcile against one breakdown.
 */
const WalletTransactionRow = ({
  item,
  currency = '$',
  showBorder = false,
  // Buyers see what they paid, not how it was split — the platform's cut and
  // the seller's take-home are the seller's business. Sellers get the full
  // itemization, which is what reconciles against the buyer's receipt.
  role = 'buyer',
  onDownloadReceipt,
}) => {
  const [open, setOpen] = useState(false);
  const showSplit = role === 'seller';

  const isCredit = item.type === 'credit';
  // A hold row's status column carries the hold's own lifecycle, so it needs a
  // different set of labels — see TXN_HOLD_STATUS_META.
  const statusMeta = item.isHold
    ? TXN_HOLD_STATUS_META[item.status] || TXN_HOLD_STATUS_META.pending
    : TXN_STATUS_META[item.status] || TXN_STATUS_META.completed;

  // A hold hasn't moved anything yet, so it gets no +/- at all.
  const prefix = item.isHold ? '' : isCredit ? '+' : '-';
  const amountColor = item.isHold ? HOLD_AMBER : isCredit ? CREDIT_GREEN : redColor;
  const iconBg = item.isHold ? HOLD_AMBER_BG : isCredit ? '#E8F8EE' : lightPink;
  const iconColor = item.isHold ? HOLD_AMBER : isCredit ? greenColor : redColor;
  const iconName = item.isHold
    ? 'clock'
    : item.isRecord
      ? 'credit-card'
      : isCredit
        ? 'arrow-down-left'
        : 'arrow-up-right';

  return (
    <View style={showBorder ? styles.bordered : null}>
      <TouchableOpacity
        style={[styles.row, flexDirectionRow, alignItemsCenter]}
        onPress={() => setOpen(o => !o)}
        disabled={!item.hasBreakdown}
        activeOpacity={0.7}>
        <View style={[styles.iconWrap, alignJustifyCenter, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={16} color={iconColor} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, style.fontWeightMedium]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[flexDirectionRow, alignItemsCenter, styles.metaRow]}>
            <Text style={[styles.date, style.fontWeightThin]}>{item.date}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
              <Text style={[styles.statusText, style.fontWeightMedium, { color: statusMeta.text }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>
        </View>

        {item.amount > 0 ? (
          <Text style={[styles.amount, style.fontWeightMedium, { color: amountColor }]}>
            {prefix}
            {money(item.amount, currency)}
          </Text>
        ) : null}

        {item.hasBreakdown ? (
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} color={grayColor} />
        ) : null}
      </TouchableOpacity>

      {open && item.hasBreakdown ? (
        <View style={styles.breakdown}>
          <View style={[flexDirectionRow, justifyContentSpaceBetween]}>
            <Text style={[styles.bdLabel, style.fontWeightThin]}>
              {showSplit ? TXN_BREAKDOWN_GROSS : TXN_BREAKDOWN_PAID}
            </Text>
            <Text style={[styles.bdValue, style.fontWeightMedium]}>{money(item.gross, currency)}</Text>
          </View>

          {showSplit && item.platformFee != null ? (
            <View style={[flexDirectionRow, justifyContentSpaceBetween]}>
              <Text style={[styles.bdLabel, style.fontWeightThin]}>{TXN_BREAKDOWN_PLATFORM_FEE}</Text>
              <Text style={[styles.bdValue, style.fontWeightMedium]}>
                -{money(item.platformFee, currency)}
              </Text>
            </View>
          ) : null}

          {showSplit ? (
            <View style={[flexDirectionRow, justifyContentSpaceBetween]}>
              <Text style={[styles.bdLabel, style.fontWeightThin]}>{TXN_BREAKDOWN_STRIPE_FEE}</Text>
              {item.stripeFee != null ? (
                <Text style={[styles.bdValue, style.fontWeightMedium]}>
                  -{money(item.stripeFee, currency)}
                </Text>
              ) : (
                // Nothing has been captured on a live hold, so Stripe hasn't
                // charged a processing fee to report yet.
                <Text style={[styles.bdMuted, style.fontWeightThin]}>
                  {item.isHold ? TXN_BREAKDOWN_STRIPE_FEE_LATER : '—'}
                </Text>
              )}
            </View>
          ) : null}

          {showSplit && item.net != null ? (
            <View style={[flexDirectionRow, justifyContentSpaceBetween, styles.netRow]}>
              <Text style={[styles.netLabel, style.fontWeightMedium]}>{TXN_BREAKDOWN_NET}</Text>
              <Text style={[styles.netValue, style.fontWeightMedium]}>{money(item.net, currency)}</Text>
            </View>
          ) : null}

          {onDownloadReceipt ? (
            <TouchableOpacity
              style={[styles.receiptBtn, flexDirectionRow, alignJustifyCenter]}
              onPress={() => onDownloadReceipt(item)}
              activeOpacity={0.8}>
              <Icon name="download" size={13} color={redColor} />
              <Text style={[styles.receiptText, style.fontWeightMedium]}>{TXN_RECEIPT_BUTTON}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default WalletTransactionRow;

const styles = StyleSheet.create({
  bordered: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  row: { paddingVertical: spacings.large, paddingHorizontal: spacings.large, gap: spacings.normal },
  iconWrap: { width: 40, height: 40, borderRadius: 20, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor, lineHeight: 18 },
  metaRow: { gap: spacings.small, marginTop: 3 },
  date: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  statusPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, flexShrink: 0 },
  statusText: { fontSize: style.fontSizeExtraSmall.fontSize },
  amount: { fontSize: style.fontSizeSmall1x.fontSize, flexShrink: 0 },
  breakdown: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    padding: spacings.large,
    marginHorizontal: spacings.large,
    marginBottom: spacings.large,
    gap: 6,
  },
  bdLabel: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  bdValue: { fontSize: style.fontSizeExtraSmall.fontSize, color: blackColor },
  bdMuted: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  netRow: {
    paddingTop: 6,
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
  },
  receiptBtn: {
    gap: 6,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
  },
  receiptText: { fontSize: style.fontSizeExtraSmall.fontSize, color: redColor },
  netLabel: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor },
  netValue: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
});
