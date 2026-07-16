import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  blueColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightBlueColor,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  CONFIRM_BOOKING_MODAL as COPY,
  PLATFORM_FEE_RATE,
} from '../../constans/Constants';
import { formatAppCurrency } from '../../utils/currency';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const formatMoney = value => formatAppCurrency(value, { decimals: 2 });

const ConfirmBookingModal = ({
  visible,
  service,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) setNotes('');
  }, [visible, service?.id]);

  const amount = useMemo(() => {
    const raw = Number(service?.priceRaw ?? service?.price);
    return Number.isFinite(raw) ? raw : 0;
  }, [service]);

  const total = useMemo(() => amount + amount * PLATFORM_FEE_RATE, [amount]);

  const deliveryLabel = useMemo(() => {
    const days = service?.deliveryDays;
    if (days == null || days === '' || days === '—') return '—';
    return `${days} ${COPY.daysSuffix}`;
  }, [service]);

  const handleConfirm = () => {
    if (loading) return;
    onConfirm?.({ notes: notes.trim() });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={loading ? undefined : onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={loading ? undefined : onClose}
        />
        <View style={styles.card}>
          <View style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <Text style={[styles.title, style.fontWeightMedium]}>{COPY.title}</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled">
            <Text style={[styles.serviceTitle, style.fontWeightMedium]} numberOfLines={2}>
              {service?.title || '—'}
            </Text>

            <View style={[styles.sellerRow, flexDirectionRow, alignItemsCenter]}>
              <View style={[styles.sellerAvatar, alignJustifyCenter]}>
                <Text style={[styles.sellerInitials, style.fontWeightMedium]}>
                  {service?.initials || 'S'}
                </Text>
              </View>
              <Text style={[styles.sellerName, style.fontWeightThin]} numberOfLines={1}>
                {service?.sellerName || 'Seller'}
              </Text>
            </View>

            <View style={[styles.summaryRow, flexDirectionRow]}>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryLabel, style.fontWeightThin]}>{COPY.amount}</Text>
                <Text style={[styles.amountValue, style.fontWeightMedium]}>
                  {formatMoney(amount)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryLabel, style.fontWeightThin]}>{COPY.delivery}</Text>
                <Text style={[styles.deliveryValue, style.fontWeightMedium]}>{deliveryLabel}</Text>
              </View>
            </View>

            <View style={[styles.feeBanner, flexDirectionRow, alignItemsCenter]}>
              <Icon name="info" size={14} color={blueColor} />
              <Text style={[styles.feeText, style.fontWeightThin]}>
                {COPY.platformFeeNote}{' '}
                <Text style={[styles.feeTotal, style.fontWeightMedium]}>{formatMoney(total)}</Text>
              </Text>
            </View>

            <Text style={[styles.notesLabel, style.fontWeightMedium]}>{COPY.notesLabel}</Text>
            <TextInput
              style={[styles.notesInput, style.fontWeightThin]}
              value={notes}
              onChangeText={setNotes}
              placeholder={COPY.notesPlaceholder}
              placeholderTextColor={grayColor}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />
          </ScrollView>

          <View style={[styles.actions, flexDirectionRow]}>
            <TouchableOpacity
              style={[styles.cancelBtn, alignJustifyCenter]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.85}>
              <Text style={[styles.cancelText, style.fontWeightMedium]}>{COPY.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, alignJustifyCenter]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Text style={[styles.confirmText, style.fontWeightMedium]}>{COPY.confirm}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ConfirmBookingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxHeight: hp(85),
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  header: {
    marginBottom: spacings.large,
  },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  serviceTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
  },
  sellerRow: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: redColor,
  },
  sellerInitials: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  sellerName: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  summaryRow: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: inputBgColor,
    borderRadius: 12,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
  },
  summaryLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: redColor,
  },
  deliveryValue: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  feeBanner: {
    gap: spacings.small,
    backgroundColor: lightBlueColor,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    marginBottom: spacings.large,
  },
  feeText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blueColor,
    lineHeight: 18,
  },
  feeTotal: {
    color: blueColor,
  },
  notesLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.4,
    marginBottom: spacings.small,
  },
  notesInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.xLarge,
  },
  actions: {
    gap: spacings.normal,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
  },
  cancelText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  confirmBtn: {
    flex: 1.2,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: redColor,
  },
  confirmText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: whiteColor,
  },
});
