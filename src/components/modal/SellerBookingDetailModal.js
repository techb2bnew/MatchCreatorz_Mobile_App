import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  blueColor,
  grayColor,
  greenColor,
  inputBgColor,
  lightPink,
  purpleColor,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BOOKING_DETAIL_MODAL,
  BOOKING_ID_PREFIX,
  BOOKING_SERVICE_FEE,
  BOOKING_TOTAL,
  BUYER_PREFIX,
  FEE_INCL_PREFIX,
  FEE_SUFFIX,
  SELLER_BOOKING_DETAIL_MODAL,
} from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const getBookingStatusStyle = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (normalized === 'pending' || normalized === 'ongoing' || normalized === 'active') {
    return { bg: '#E8F0F8', text: blueColor };
  }
  if (
    normalized === 'amidst_completion_process' ||
    normalized === 'delivery_submitted' ||
    normalized === 'awaiting_acceptance'
  ) {
    return { bg: '#F3E8FF', text: purpleColor };
  }
  if (normalized === 'in_dispute' || normalized === 'disputed') {
    return { bg: '#FFEBEB', text: redColor };
  }
  if (normalized === 'completed') return { bg: '#E8F8EE', text: greenColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const DetailRow = ({ label, value, multiline = false }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, style.fontWeightMedium]}>{label}</Text>
    <Text
      style={[styles.detailValue, style.fontWeightThin, multiline && styles.detailValueMultiline]}
      numberOfLines={multiline ? undefined : 3}>
      {value || '—'}
    </Text>
  </View>
);

const SellerBookingDetailModal = ({ visible, onClose, loading, error, booking }) => {
  const statusStyle = getBookingStatusStyle(booking?.status);

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
              <Icon name="calendar" size={18} color={redColor} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, style.fontWeightMedium]}>{SELLER_BOOKING_DETAIL_MODAL.title}</Text>
              {booking?.title ? (
                <Text style={[styles.subtitle, style.fontWeightThin]} numberOfLines={2}>
                  {booking.title}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={[styles.loaderWrap, alignJustifyCenter]}>
              <ActivityIndicator size="large" color={redColor} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {error ? (
                <View style={styles.errorBanner}>
                  <Icon name="alert-circle" size={14} color={redColor} />
                  <Text style={[styles.errorText, style.fontWeightThin]}>{error}</Text>
                </View>
              ) : null}

              {booking ? (
                <>
                  {booking.serviceImage ? (
                    <Image
                      source={{ uri: booking.serviceImage }}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  ) : null}

                  <View style={[styles.statusRow, flexDirectionRow, alignItemsCenter]}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {booking.status}
                      </Text>
                    </View>
                    <Text style={[styles.idText, style.fontWeightThin]}>
                      {BOOKING_ID_PREFIX}: #{booking.id}
                    </Text>
                  </View>

                  <View style={[styles.sellerRow, flexDirectionRow, alignItemsCenter]}>
                    <View style={[styles.sellerAvatar, alignJustifyCenter]}>
                      <Text style={[styles.sellerAvatarText, style.fontWeightMedium]}>
                        {booking.clientInitials || booking.buyerInitials || '—'}
                      </Text>
                    </View>
                    <View style={styles.sellerInfo}>
                      <Text style={[styles.sellerName, style.fontWeightMedium]}>
                        {BUYER_PREFIX} {booking.client || booking.buyerName || '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.priceRow, flexDirectionRow, justifyContentSpaceBetween]}>
                    <View>
                      <Text style={[styles.priceLabel, style.fontWeightThin]}>{BOOKING_TOTAL}</Text>
                      <Text style={[styles.priceValue, style.fontWeightMedium]}>
                        {booking.amountDisplay}
                      </Text>
                    </View>
                    <View style={styles.feeWrap}>
                      <Text style={[styles.priceLabel, style.fontWeightThin]}>
                        {BOOKING_SERVICE_FEE}
                      </Text>
                      <Text style={[styles.feeValue, style.fontWeightThin]}>
                        {booking.feeDisplay
                          ? `${FEE_INCL_PREFIX} ${booking.feeDisplay} ${FEE_SUFFIX}`
                          : '—'}
                      </Text>
                    </View>
                  </View>

                  <DetailRow label={BOOKING_DETAIL_MODAL.service} value={booking.serviceTitle} />
                  <DetailRow label={BOOKING_DETAIL_MODAL.postedOn} value={booking.date} />
                  <DetailRow label={BOOKING_DETAIL_MODAL.delivery} value={booking.delivery} />
                  <DetailRow
                    label={BOOKING_DETAIL_MODAL.notes}
                    value={booking.notes || BOOKING_DETAIL_MODAL.noNotes}
                    multiline
                  />
                  {booking.cancelReason ? (
                    <DetailRow
                      label={BOOKING_DETAIL_MODAL.cancelReason}
                      value={booking.cancelReason}
                      multiline
                    />
                  ) : null}
                  {booking.disputeReason ? (
                    <DetailRow
                      label={BOOKING_DETAIL_MODAL.disputeReason}
                      value={booking.disputeReason}
                      multiline
                    />
                  ) : null}
                </>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SellerBookingDetailModal;

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
    maxHeight: hp(80),
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
  loaderWrap: {
    minHeight: hp(20),
    paddingVertical: spacings.xxLarge,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.small,
    backgroundColor: lightPink,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.medium,
    marginBottom: spacings.large,
  },
  errorText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
    lineHeight: 18,
  },
  serviceImage: {
    width: '100%',
    height: hp(18),
    borderRadius: 12,
    backgroundColor: inputBgColor,
    marginBottom: spacings.large,
  },
  statusRow: {
    justifyContent: 'space-between',
    marginBottom: spacings.large,
  },
  statusBadge: {
    paddingHorizontal: spacings.medium,
    paddingVertical: spacings.xsmall,
    borderRadius: 6,
  },
  statusText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: '600',
  },
  idText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  sellerRow: {
    gap: spacings.normal,
    marginBottom: spacings.large,
    paddingBottom: spacings.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightPink,
  },
  sellerAvatarText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  sellerInfo: {
    flex: 1,
    minWidth: 0,
  },
  sellerName: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  buyerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  priceRow: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  priceLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
  },
  feeWrap: {
    alignItems: 'flex-end',
  },
  feeValue: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  detailRow: {
    paddingVertical: spacings.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  detailLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    lineHeight: 22,
  },
  detailValueMultiline: {
    lineHeight: 22,
  },
});
