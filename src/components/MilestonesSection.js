import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Linking } from 'react-native';
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

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const fmt = n => `$${(Number(n) || 0).toFixed(2)}`;

// Open an attachment (image → full view in browser; file → opens/downloads).
export const openAttachment = url => {
  if (!url) return;
  Linking.openURL(String(url)).catch(() => {});
};

const STATUS_META = {
  paid: { label: 'Paid', bg: '#E8F8EE', text: greenColor },
  submitted: { label: 'Submitted', bg: '#E7EEFB', text: '#3B6981' },
  countered: { label: 'Countered', bg: '#FFF4E5', text: '#B26A00' },
  rejected: { label: 'Rejected', bg: '#FDECEC', text: redColor },
  not_submitted: { label: 'Not submitted', bg: '#F3F4F6', text: grayColor },
};

/**
 * Renders a booking's milestones + role-appropriate actions (real API driven).
 *  - seller: not_submitted/rejected → Submit / Resubmit.
 *  - buyer:  submitted → Accept & Pay / Counter / Reject
 *  - countered by buyer → seller can Accept the countered amount or counter back
 * busyId = the milestone id currently mid-action (shows a spinner).
 */
const MilestonesSection = ({
  milestones = [],
  role = 'seller',
  busyId = null,
  onSubmit,
  onAcceptPay,
  onReject,
  onCounter,
  onAcceptCounter,
  onCounterBack,
  // Escrow "Pay & Hold": this stage's card authorisation is placed but not
  // captured. Buyer-only — releasing it is the same Accept & Pay button.
  onCancelHold,
  holdDays = null,
}) => {
  if (!milestones.length) return null;

  const released = milestones
    .filter(m => m.status === 'paid')
    .reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const held = milestones
    .filter(m => m.status !== 'paid')
    .reduce((s, m) => s + (Number(m.amount) || 0), 0);

  return (
    <View style={styles.wrap}>
      <View style={[styles.headerRow, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
        <Text style={[styles.sectionTitle, style.fontWeightMedium]}>MILESTONES</Text>
        <Text style={styles.summary}>
          <Text style={[styles.released, style.fontWeightThin]}>{fmt(released)} released</Text>
          <Text style={[styles.dot, style.fontWeightThin]}>{'  ·  '}</Text>
          <Text style={[styles.heldText, style.fontWeightThin]}>{fmt(held)} still held</Text>
        </Text>
      </View>

      {milestones.map(m => {
        const meta = STATUS_META[m.status] || STATUS_META.not_submitted;
        const busy = busyId != null && String(busyId) === String(m.id);
        const sellerCanSubmit =
          role === 'seller' && (m.status === 'not_submitted' || m.status === 'rejected');
        const buyerSubmitted = role === 'buyer' && m.status === 'submitted';
        const buyerCountered = m.status === 'countered' && m.counterBy === 'buyer';
        const sellerCountered = m.status === 'countered' && m.counterBy === 'seller';
        const sellerCanRespond = role === 'seller' && buyerCountered;
        const onHold = isHoldHeld(m.raw || m);

        return (
          <View key={String(m.id)} style={styles.card}>
            <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
              <Text style={[styles.mTitle, style.fontWeightMedium]} numberOfLines={1}>
                {m.title}
              </Text>
              <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                <Text style={[styles.badgeText, { color: meta.text }]}>{meta.label}</Text>
              </View>
            </View>
            <Text style={[styles.mAmount, style.fontWeightMedium]}>{fmt(m.amount)}</Text>

            {m.notes ? (
              <View style={styles.messageBox}>
                <Text style={[styles.messageText, style.fontWeightThin]}>{m.notes}</Text>
              </View>
            ) : null}

            {Array.isArray(m.attachments) && m.attachments.length ? (
              <View style={[styles.attachRow, flexDirectionRow]}>
                {m.attachments.map((f, i) => {
                  const url = f?.url || f?.uri;
                  const isImage =
                    /^image\//i.test(String(f?.type || '')) ||
                    /\.(png|jpe?g|gif|webp|heic)$/i.test(String(url || ''));
                  if (url && isImage) {
                    return (
                      <TouchableOpacity
                        key={`${m.id}-f-${i}`}
                        activeOpacity={0.8}
                        onPress={() => openAttachment(url)}>
                        <Image source={{ uri: url }} style={styles.thumb} />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={`${m.id}-f-${i}`}
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

            {buyerCountered ? (
              <View style={styles.counterBox}>
                <Text style={[styles.counterText, style.fontWeightThin]}>
                  {role === 'seller'
                    ? `Buyer offered ${fmt(m.counterAmount)} instead of ${fmt(m.amount)}.`
                    : `You offered ${fmt(m.counterAmount)} instead of ${fmt(m.amount)}. Waiting for seller to respond.`}
                </Text>
                {m.counterNote ? (
                  <Text style={[styles.counterNote, style.fontWeightThin]}>{m.counterNote}</Text>
                ) : null}
              </View>
            ) : null}

            {sellerCountered ? (
              <View style={styles.counterBox}>
                <Text style={[styles.counterText, style.fontWeightThin]}>
                  {role === 'seller'
                    ? `You countered back with ${fmt(m.counterAmount)}. Waiting for buyer to respond.`
                    : `Seller countered back with ${fmt(m.counterAmount)}.`}
                </Text>
                {m.counterNote ? (
                  <Text style={[styles.counterNote, style.fontWeightThin]}>{m.counterNote}</Text>
                ) : null}
              </View>
            ) : null}

            {sellerCanRespond ? (
              <>
                <TouchableOpacity
                  style={[styles.acceptFullBtn, alignJustifyCenter]}
                  onPress={() => onAcceptCounter?.(m)}
                  disabled={busy}
                  activeOpacity={0.85}>
                  {busy ? (
                    <ActivityIndicator size="small" color={whiteColor} />
                  ) : (
                    <Text style={[styles.acceptText, style.fontWeightMedium]}>
                      Accept {fmt(m.counterAmount)}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.counterBackBtn, alignJustifyCenter]}
                  onPress={() => onCounterBack?.(m)}
                  disabled={busy}
                  activeOpacity={0.85}>
                  <Text style={[styles.rejectText, style.fontWeightMedium]}>Counter back</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {sellerCanSubmit ? (
              <TouchableOpacity
                style={[styles.submitBtn, alignJustifyCenter]}
                onPress={() => onSubmit?.(m)}
                disabled={busy}
                activeOpacity={0.85}>
                {busy ? (
                  <ActivityIndicator size="small" color={whiteColor} />
                ) : (
                  <Text style={[styles.submitText, style.fontWeightMedium]}>
                    {m.status === 'rejected' ? 'Resubmit' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}

            {onHold ? (
              <HoldNotice
                role={role}
                days={holdDays}
                busy={busy}
                onCancel={role === 'buyer' && onCancelHold ? () => onCancelHold(m) : undefined}
              />
            ) : null}

            {buyerSubmitted ? (
              <>
                <View style={[styles.buyerActions, flexDirectionRow]}>
                  <TouchableOpacity
                    style={[styles.rejectBtn, alignJustifyCenter]}
                    onPress={() => onReject?.(m)}
                    disabled={busy}
                    activeOpacity={0.85}>
                    <Text style={[styles.rejectText, style.fontWeightMedium]}>Reject</Text>
                  </TouchableOpacity>
                  {onCounter ? (
                    <TouchableOpacity
                      style={[styles.rejectBtn, alignJustifyCenter]}
                      onPress={() => onCounter?.(m)}
                      disabled={busy}
                      activeOpacity={0.85}>
                      <Text style={[styles.rejectText, style.fontWeightMedium]}>Counter</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={[styles.acceptFullBtn, alignJustifyCenter]}
                  onPress={() => onAcceptPay?.(m)}
                  disabled={busy}
                  activeOpacity={0.85}>
                  {busy ? (
                    <ActivityIndicator size="small" color={whiteColor} />
                  ) : (
                    <Text style={[styles.acceptText, style.fontWeightMedium]}>
                      {onHold ? HOLD_RELEASE_BUTTON : 'Accept & Pay'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

export default MilestonesSection;

const styles = StyleSheet.create({
  wrap: { marginTop: spacings.large },
  headerRow: { marginBottom: spacings.normal },
  sectionTitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.5,
  },
  summary: { fontSize: style.fontSizeExtraSmall.fontSize },
  released: { color: greenColor, fontSize: style.fontSizeExtraSmall.fontSize },
  dot: { color: grayColor, fontSize: style.fontSizeExtraSmall.fontSize },
  heldText: { color: '#7A5AF8', fontSize: style.fontSizeExtraSmall.fontSize },
  card: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.normal,
    gap: spacings.xsmall,
  },
  mTitle: { flex: 1, fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  mAmount: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor },
  badge: {
    paddingHorizontal: spacings.normal,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: spacings.small,
  },
  badgeText: { fontSize: style.fontSizeExtraSmall.fontSize, fontWeight: '600' },
  messageBox: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    padding: spacings.normal,
    marginTop: spacings.xsmall,
  },
  messageText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
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
  submitBtn: {
    marginTop: spacings.small,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: redColor,
    alignSelf: 'flex-end',
    paddingHorizontal: spacings.xLarge,
  },
  submitText: { fontSize: style.fontSizeSmall1x.fontSize, color: whiteColor },
  buyerActions: { marginTop: spacings.small, gap: spacings.normal },
  rejectBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  rejectText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
  acceptBtn: { flex: 1.4, minHeight: 42, borderRadius: 10, backgroundColor: greenColor },
  acceptFullBtn: {
    marginTop: spacings.small,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: greenColor,
  },
  counterBackBtn: {
    marginTop: spacings.small,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  counterBox: {
    backgroundColor: '#FFF4E5',
    borderRadius: 10,
    padding: spacings.normal,
    marginTop: spacings.xsmall,
  },
  counterText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
  counterNote: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginTop: spacings.xsmall,
  },
  acceptText: { fontSize: style.fontSizeSmall1x.fontSize, color: whiteColor },
});
