import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { selectAuth } from '../../redux/slices/authSlice';
import { getBuyerBookingByIdApi } from '../../services/buyerService';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  purpleColor,
  redColor,
  whiteColor,
  blueColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BOOKING_ACCEPT_MESSAGE,
  BOOKING_ACCEPT_TITLE,
  BOOKING_ACTIONS,
  BOOKING_CANCEL_MESSAGE,
  BOOKING_CANCEL_TITLE,
  BOOKING_DESCRIPTION,
  BOOKING_DETAILS_TITLE,
  BOOKING_ID_PREFIX,
  BOOKING_PRICE_BREAKDOWN,
  BOOKING_REJECT_MESSAGE,
  BOOKING_REJECT_TITLE,
  BOOKING_SERVICE_FEE,
  BOOKING_SUBTOTAL,
  BOOKING_TIMELINE,
  BOOKING_TOTAL,
  FEE_INCL_PREFIX,
  FEE_SUFFIX,
  SELLER_PREFIX,
} from '../../constans/Constants';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const getBookingStatusStyle = status => {
  if (status === 'Ongoing') return { bg: '#E8F0F8', text: blueColor };
  if (status === 'Amidst-Completion-Process') return { bg: '#F3E8FF', text: purpleColor };
  if (status === 'In-dispute') return { bg: '#FFEBEB', text: redColor };
  if (status === 'Completed') return { bg: '#E8F8EE', text: greenColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const formatCurrency = (amount, currency = '$') =>
  `${currency}${Number(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const BookingDetailsScreen = ({ navigation, route }) => {
  const { token } = useSelector(selectAuth);
  const initialBooking = route.params?.booking;
  const bookingId = initialBooking?.id || route.params?.bookingId;

  const [booking, setBooking] = useState(
    initialBooking || {
      id: '0',
      title: '—',
      sellerName: '—',
      sellerInitials: '—',
      date: '—',
      total: 0,
      fee: 0,
      currency: '₹',
      status: '—',
    },
  );

  const [timeline] = useState([
    { id: '1', label: 'Booking Placed', date: '—', done: true },
    { id: '2', label: 'Work Started', date: '—', done: false },
    { id: '3', label: 'In Progress', date: '—', done: false },
    { id: '4', label: 'Delivery / Review', date: 'Pending', done: false },
    { id: '5', label: 'Completed', date: 'Pending', done: false },
  ]);

  const [description] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    message: '',
    actionType: '',
    confirmColor: redColor,
    iconName: 'alert-circle',
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchBookingDetail = async () => {
        if (!token || !bookingId) {
          console.log('[BuyerBookingDetail] Skipped — missing token or bookingId', {
            hasToken: Boolean(token),
            bookingId,
          });
          return;
        }

        try {
          await getBuyerBookingByIdApi(token, bookingId);
          // Response is console-logged in the service.
          // UI mapping will be decided after reviewing the payload (screen vs popup).
        } catch (error) {
          if (!cancelled) {
            // Error already logged in getBuyerBookingByIdApi
          }
        }
      };

      fetchBookingDetail();

      return () => {
        cancelled = true;
      };
    }, [token, bookingId]),
  );

  const statusStyle = getBookingStatusStyle(booking.status);
  const subtotal = booking.total - booking.fee;

  const openConfirmModal = actionType => {
    const configs = {
      accept: {
        title: BOOKING_ACCEPT_TITLE,
        message: BOOKING_ACCEPT_MESSAGE,
        confirmColor: greenColor,
        iconName: 'check-circle',
      },
      reject: {
        title: BOOKING_REJECT_TITLE,
        message: BOOKING_REJECT_MESSAGE,
        confirmColor: redColor,
        iconName: 'x-circle',
      },
      cancel: {
        title: BOOKING_CANCEL_TITLE,
        message: BOOKING_CANCEL_MESSAGE,
        confirmColor: '#C27803',
        iconName: 'alert-circle',
      },
    };
    const config = configs[actionType];
    setConfirmModal({
      visible: true,
      actionType,
      title: config.title,
      message: config.message,
      confirmColor: config.confirmColor,
      iconName: config.iconName,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, visible: false }));
  };

  const handleConfirmAction = () => {
    const { actionType } = confirmModal;
    setBooking(prev => {
      if (actionType === 'accept') {
        return { ...prev, status: 'Completed', filterType: 'completed' };
      }
      if (actionType === 'reject') {
        return { ...prev, status: 'In-dispute', filterType: 'active' };
      }
      if (actionType === 'cancel') {
        return { ...prev, status: 'Cancelled', filterType: 'cancelled' };
      }
      return prev;
    });
    closeConfirmModal();
  };

  const renderInfoRow = (label, value) => (
    <View style={[styles.infoRow, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
      <Text style={[styles.infoLabel, style.fontWeightThin]}>{label}</Text>
      <Text style={[styles.infoValue, style.fontWeightMedium]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, style.fontWeightMedium]} numberOfLines={1}>
            {BOOKING_DETAILS_TITLE}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <View style={[flexDirectionRow, alignItemsCenter]}>
              <View style={[styles.sellerAvatar, alignJustifyCenter]}>
                <Text style={[styles.sellerAvatarText, style.fontWeightMedium]}>
                  {booking.sellerInitials}
                </Text>
              </View>
              <View style={styles.summaryInfo}>
                <Text style={[styles.bookingTitle, style.fontWeightMedium]}>{booking.title}</Text>
                <Text style={[styles.sellerName, style.fontWeightThin]}>
                  {SELLER_PREFIX} {booking.sellerName}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{booking.status}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            {renderInfoRow(BOOKING_ID_PREFIX, `#B-${booking.id.padStart(4, '0')}`)}
            {renderInfoRow('Date', booking.date)}
            {renderInfoRow('Total', formatCurrency(booking.total, booking.currency))}
            {renderInfoRow('Fee', `${FEE_INCL_PREFIX} ${formatCurrency(booking.fee, booking.currency)} ${FEE_SUFFIX}`)}
          </View>

          <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{BOOKING_PRICE_BREAKDOWN}</Text>
          <View style={styles.sectionCard}>
            {renderInfoRow(BOOKING_SUBTOTAL, formatCurrency(subtotal, booking.currency))}
            {renderInfoRow(BOOKING_SERVICE_FEE, formatCurrency(booking.fee, booking.currency))}
            <View style={styles.divider} />
            {renderInfoRow(BOOKING_TOTAL, formatCurrency(booking.total, booking.currency))}
          </View>

          <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{BOOKING_DESCRIPTION}</Text>
          <View style={styles.sectionCard}>
            <Text style={[styles.descriptionText, style.fontWeightThin]}>{description}</Text>
          </View>

          <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{BOOKING_TIMELINE}</Text>
          <View style={styles.sectionCard}>
            {timeline.map((step, index) => (
              <View key={step.id} style={[styles.timelineRow, flexDirectionRow]}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      alignJustifyCenter,
                      step.done ? styles.timelineDotDone : styles.timelineDotPending,
                    ]}>
                    {step.done ? <Icon name="check" size={10} color={whiteColor} /> : null}
                  </View>
                  {index < timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, style.fontWeightMedium]}>{step.label}</Text>
                  <Text style={[styles.timelineDate, style.fontWeightThin]}>{step.date}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actionsWrap}>
            {booking.status === 'Ongoing' ? (
              <TouchableOpacity
                style={[styles.cancelBtn, flexDirectionRow, alignItemsCenter, alignJustifyCenter]}
                onPress={() => openConfirmModal('cancel')}>
                <Icon name="alert-circle" size={16} color="#C27803" />
                <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.CANCEL}</Text>
              </TouchableOpacity>
            ) : null}

            {booking.status === 'Amidst-Completion-Process' ? (
              <View style={[flexDirectionRow, styles.actionRow]}>
                <TouchableOpacity
                  style={[styles.acceptBtn, flexDirectionRow, alignItemsCenter, alignJustifyCenter]}
                  onPress={() => openConfirmModal('accept')}>
                  <Icon name="check" size={16} color={whiteColor} />
                  <Text style={[styles.acceptBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.ACCEPT}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, flexDirectionRow, alignItemsCenter, alignJustifyCenter]}
                  onPress={() => openConfirmModal('reject')}>
                  <Icon name="x" size={16} color={whiteColor} />
                  <Text style={[styles.rejectBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.REJECT}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmColor={confirmModal.confirmColor}
        iconName={confirmModal.iconName}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmModal}
      />
    </SafeAreaView>
  );
};

export default BookingDetailsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
  },
  header: {
    width: '100%',
    marginBottom: hp(1.5),
    gap: wp(2),
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: inputBgColor,
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
  },
  scrollContent: { paddingBottom: hp(4) },
  summaryCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
  },
  sellerAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: redColor,
    marginRight: wp(3),
  },
  sellerAvatarText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  summaryInfo: { flex: 1 },
  bookingTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: hp(0.3),
  },
  sellerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: hp(0.8),
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: wp(5),
  },
  statusText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: hp(1),
  },
  sectionCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
  },
  infoRow: {
    paddingVertical: hp(0.8),
  },
  infoLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  infoValue: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: wp(3),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: borderLightColor,
    marginVertical: hp(0.5),
  },
  descriptionText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 20,
  },
  timelineRow: {
    marginBottom: hp(0.5),
  },
  timelineLeft: {
    alignItems: 'center',
    width: wp(6),
    marginRight: wp(3),
  },
  timelineDot: {
    width: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(2.25),
  },
  timelineDotDone: { backgroundColor: greenColor },
  timelineDotPending: {
    backgroundColor: whiteColor,
    borderWidth: 2,
    borderColor: borderLightColor,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: borderLightColor,
    marginVertical: hp(0.3),
    minHeight: hp(3),
  },
  timelineContent: {
    flex: 1,
    paddingBottom: hp(1.5),
  },
  timelineLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  timelineDate: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginTop: hp(0.2),
  },
  actionsWrap: {
    marginTop: hp(1),
    gap: hp(1),
  },
  actionRow: { gap: wp(3) },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#C27803',
    borderRadius: wp(2),
    paddingVertical: hp(1.4),
    gap: wp(2),
  },
  cancelBtnText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: '#C27803',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: greenColor,
    borderRadius: wp(2),
    paddingVertical: hp(1.4),
    gap: wp(2),
  },
  acceptBtnText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: whiteColor,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: redColor,
    borderRadius: wp(2),
    paddingVertical: hp(1.4),
    gap: wp(2),
  },
  rejectBtnText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: whiteColor,
  },
});
