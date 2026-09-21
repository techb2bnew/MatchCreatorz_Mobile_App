import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { HOLD_RELEASE_BUTTON } from '../constans/Constants';
import { isHoldHeld } from '../utils/escrow';
import HoldNotice from './HoldNotice';
import { formatAppCurrency } from '../utils/currency';
import {
  WORK_ENTRY_STATUS_META,
  formatHours,
  formatWorkDate,
  summarizeWorkEntries,
} from '../utils/workEntries';
import { openAttachment } from './MilestonesSection';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const money = value => formatAppCurrency(Number(value) || 0);

/**
 * Hourly breakdown for a booking — one row per logged work entry.
 *
 * seller: countered-by-buyer entries get "Accept {h}h" / "Counter back".
 * buyer:  pending entries get Approve / Counter / Dispute.
 * Money only moves on approve / accept-counter, so those buttons disable
 * themselves the moment they're tapped (busyId).
 */
const WorkEntriesSection = ({
  entries = [],
  role = 'seller',
  busyId = null,
  hourlyRate = 0,
  weeklyLimit = null,
  weeklyUsed = 0,
  onApprove,
  onCounter,
  onDispute,
  onAcceptCounter,
  onCounterBack,
  // Escrow "Pay & Hold": this entry's card authorisation is placed but not
  // captured. Buyer-only — releasing it is the same Approve & Pay button.
  onCancelHold,
  holdDays = null,
}) => {
  const totals = summarizeWorkEntries(entries);

  return (
    <View style={styles.wrap}>
      <View style={[styles.headerRow, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
        <Text style={[styles.sectionTitle, style.fontWeightMedium]}>HOURLY BREAKDOWN</Text>
        {hourlyRate > 0 ? (
          <Text style={[styles.rateText, style.fontWeightThin]}>{money(hourlyRate)}/hr</Text>
        ) : null}
      </View>

      {weeklyLimit ? (
        <Text style={[styles.limitText, style.fontWeightThin]}>
          {formatHours(weeklyUsed)} of {formatHours(weeklyLimit)} used this week
        </Text>
      ) : null}

      {!entries.length ? (
        <Text style={[styles.emptyText, style.fontWeightThin]}>No hours logged yet.</Text>
      ) : (
        <>
          <View style={[styles.totalsRow, flexDirectionRow, justifyContentSpaceBetween]}>
            <Text style={[styles.totalPaid, style.fontWeightThin]}>
              {formatHours(totals.approvedHours)} paid · {money(totals.approvedAmount)}
            </Text>
            {totals.pendingHours > 0 ? (
              <Text style={[styles.totalPending, style.fontWeightThin]}>
                {formatHours(totals.pendingHours)} pending · {money(totals.pendingAmount)}
              </Text>
            ) : null}
          </View>

          {entries.map(entry => {
            const meta = WORK_ENTRY_STATUS_META[entry.status] || WORK_ENTRY_STATUS_META.pending;
            const busy = busyId != null && String(busyId) === String(entry.id);
            const buyerCountered = entry.status === 'countered' && entry.counterBy === 'buyer';
            const sellerCountered = entry.status === 'countered' && entry.counterBy === 'seller';
            const buyerCanAct = role === 'buyer' && entry.status === 'pending';
            const sellerCanRespond = role === 'seller' && buyerCountered;
            const onHold = isHoldHeld(entry.raw || entry);

            return (
              <View key={String(entry.id)} style={styles.card}>
                <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
                  <Text style={[styles.dateText, style.fontWeightMedium]} numberOfLines={1}>
                    {formatWorkDate(entry.workDate)}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.badgeText, { color: meta.text }]}>{meta.label}</Text>
                  </View>
                </View>

                <Text style={[styles.calcText, style.fontWeightThin]}>
                  {formatHours(entry.hours)} × {money(entry.rate)} ={' '}
                  <Text style={[styles.amountText, style.fontWeightMedium]}>{money(entry.amount)}</Text>
                </Text>

                {entry.description ? (
                  <Text style={[styles.descText, style.fontWeightThin]}>{entry.description}</Text>
                ) : null}

                {entry.status === 'approved' && entry.platformFee > 0 && role === 'seller' ? (
                  <Text style={[styles.feeText, style.fontWeightThin]}>
                    Platform fee {money(entry.platformFee)} · you received{' '}
                    {money(entry.amount - entry.platformFee)}
                  </Text>
                ) : null}

                {buyerCountered ? (
                  <View style={styles.noticeBox}>
                    <Text style={[styles.noticeText, style.fontWeightThin]}>
                      {role === 'seller'
                        ? `Buyer offered to pay for ${formatHours(entry.counterHours)} instead of ${formatHours(entry.hours)}.`
                        : `You offered to pay for ${formatHours(entry.counterHours)} instead of ${formatHours(entry.hours)}. Waiting for seller to respond.`}
                    </Text>
                    {entry.counterNote ? (
                      <Text style={[styles.noticeNote, style.fontWeightThin]}>{entry.counterNote}</Text>
                    ) : null}
                  </View>
                ) : null}

                {sellerCountered ? (
                  <View style={styles.noticeBox}>
                    <Text style={[styles.noticeText, style.fontWeightThin]}>
                      {role === 'seller'
                        ? `You countered back with ${formatHours(entry.counterHours)}. Waiting for buyer to respond.`
                        : `Seller countered back with ${formatHours(entry.counterHours)}.`}
                    </Text>
                    {entry.counterNote ? (
                      <Text style={[styles.noticeNote, style.fontWeightThin]}>{entry.counterNote}</Text>
                    ) : null}
                  </View>
                ) : null}

                {entry.status === 'disputed' ? (
                  <View style={styles.disputeBox}>
                    <Text style={[styles.disputeLabel, style.fontWeightMedium]}>Dispute reason</Text>
                    <Text style={[styles.noticeText, style.fontWeightThin]}>
                      {entry.disputeReason || 'Sent to admin for review.'}
                    </Text>
                  </View>
                ) : null}

                {entry.attachments.length ? (
                  <View style={[styles.attachRow, flexDirectionRow]}>
                    {entry.attachments.map((f, i) => {
                      const url = f?.url || f?.uri;
                      const isImage =
                        /^image\//i.test(String(f?.type || '')) ||
                        /\.(png|jpe?g|gif|webp|heic)$/i.test(String(url || ''));
                      if (url && isImage) {
                        return (
                          <TouchableOpacity
                            key={`${entry.id}-f-${i}`}
                            activeOpacity={0.8}
                            onPress={() => openAttachment(url)}>
                            <Image source={{ uri: url }} style={styles.thumb} />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={`${entry.id}-f-${i}`}
                          style={[styles.fileChip, flexDirectionRow, alignItemsCenter]}
                          activeOpacity={0.7}
                          onPress={() => openAttachment(url)}>
                          <Icon name="paperclip" size={12} color={redColor} />
                          <Text style={[styles.fileName, style.fontWeightThin]} numberOfLines={1}>
                            {f?.name || f?.fileName || `attachment ${i + 1}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}

                {onHold ? (
                  <HoldNotice
                    role={role}
                    days={holdDays}
                    busy={busy}
                    onCancel={role === 'buyer' && onCancelHold ? () => onCancelHold(entry) : undefined}
                  />
                ) : null}

                {buyerCanAct ? (
                  <>
                    <View style={[styles.actionRow, flexDirectionRow]}>
                      <TouchableOpacity
                        style={[styles.secondaryBtn, alignJustifyCenter]}
                        onPress={() => onDispute?.(entry)}
                        disabled={busy}
                        activeOpacity={0.85}>
                        <Text style={[styles.secondaryText, style.fontWeightMedium]}>Dispute</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.secondaryBtn, alignJustifyCenter]}
                        onPress={() => onCounter?.(entry)}
                        disabled={busy}
                        activeOpacity={0.85}>
                        <Text style={[styles.secondaryText, style.fontWeightMedium]}>Counter</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[styles.primaryBtn, alignJustifyCenter]}
                      onPress={() => onApprove?.(entry)}
                      disabled={busy}
                      activeOpacity={0.85}>
                      {busy ? (
                        <ActivityIndicator size="small" color={whiteColor} />
                      ) : (
                        <Text style={[styles.primaryText, style.fontWeightMedium]}>
                          {onHold ? HOLD_RELEASE_BUTTON : 'Approve & Pay'} {money(entry.amount)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : null}

                {sellerCanRespond ? (
                  <>
                    <TouchableOpacity
                      style={[styles.primaryBtn, alignJustifyCenter]}
                      onPress={() => onAcceptCounter?.(entry)}
                      disabled={busy}
                      activeOpacity={0.85}>
                      {busy ? (
                        <ActivityIndicator size="small" color={whiteColor} />
                      ) : (
                        <Text style={[styles.primaryText, style.fontWeightMedium]}>
                          Accept {formatHours(entry.counterHours)}
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.secondaryFullBtn, alignJustifyCenter]}
                      onPress={() => onCounterBack?.(entry)}
                      disabled={busy}
                      activeOpacity={0.85}>
                      <Text style={[styles.secondaryText, style.fontWeightMedium]}>Counter back</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            );
          })}
        </>
      )}
    </View>
  );
};

export default WorkEntriesSection;

const styles = StyleSheet.create({
  wrap: { marginTop: spacings.large },
  headerRow: { marginBottom: spacings.xsmall },
  sectionTitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.5,
  },
  rateText: { fontSize: style.fontSizeExtraSmall.fontSize, color: blackColor },
  limitText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: spacings.small,
  },
  emptyText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    paddingVertical: spacings.normal,
  },
  totalsRow: { marginBottom: spacings.normal, gap: spacings.small },
  totalPaid: { fontSize: style.fontSizeExtraSmall.fontSize, color: greenColor },
  totalPending: { fontSize: style.fontSizeExtraSmall.fontSize, color: '#B26A00' },
  card: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.normal,
    gap: spacings.xsmall,
  },
  dateText: { flex: 1, fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  badge: {
    paddingHorizontal: spacings.normal,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: spacings.small,
  },
  badgeText: { fontSize: style.fontSizeExtraSmall.fontSize, fontWeight: '600' },
  calcText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor },
  amountText: { color: blackColor, fontSize: style.fontSizeSmall1x.fontSize },
  descText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
  feeText: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  noticeBox: {
    backgroundColor: '#FFF4E5',
    borderRadius: 10,
    padding: spacings.normal,
    marginTop: spacings.xsmall,
  },
  noticeText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
  noticeNote: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginTop: spacings.xsmall,
  },
  disputeBox: {
    backgroundColor: '#FDECEC',
    borderRadius: 10,
    padding: spacings.normal,
    marginTop: spacings.xsmall,
  },
  disputeLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: redColor,
    marginBottom: 2,
  },
  fileChip: {
    backgroundColor: inputBgColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  fileName: { fontSize: style.fontSizeExtraSmall.fontSize, color: blackColor },
  attachRow: { gap: spacings.small, flexWrap: 'wrap', marginTop: spacings.xsmall },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: inputBgColor },
  actionRow: { marginTop: spacings.small, gap: spacings.normal },
  secondaryBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  secondaryFullBtn: {
    marginTop: spacings.small,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  secondaryText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
  primaryBtn: {
    marginTop: spacings.small,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: greenColor,
  },
  primaryText: { fontSize: style.fontSizeSmall1x.fontSize, color: whiteColor },
});
