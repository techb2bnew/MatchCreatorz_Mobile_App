import React from 'react';
import {
  Modal,
  View,
  Text,
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
  grayColor,
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BIDS_SUFFIX,
  POST_JOB_LABELS,
  SELLER_JOB_DETAIL_MODAL,
  SELLER_BID_PENDING,
  SELLER_BID_ACCEPTED,
  SELLER_BID_REJECTED,
} from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const getJobStatusStyle = status => {
  if (status === 'Open') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'In Progress') return { bg: '#E8F0F8', text: '#2563EB' };
  if (status === 'Closed' || status === 'Cancelled') return { bg: '#F3F4F6', text: grayColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const getBidStatusLabel = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'pending') return SELLER_BID_PENDING;
  if (normalized === 'accepted') return SELLER_BID_ACCEPTED;
  if (normalized === 'rejected') return SELLER_BID_REJECTED;
  return status || '—';
};

const getBidStatusStyle = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'accepted') return { bg: '#E8F8EE', text: greenColor };
  if (normalized === 'rejected') return { bg: lightPink, text: redColor };
  if (normalized === 'pending') return { bg: '#FFF7ED', text: '#C2410C' };
  return { bg: '#F3F4F6', text: grayColor };
};

const DetailRow = ({ label, value, multiline = false, last = false }) => (
  <View style={[styles.detailRow, last && styles.detailRowLast]}>
    <Text style={[styles.detailLabel, style.fontWeightMedium]}>{label}</Text>
    <Text
      style={[styles.detailValue, style.fontWeightThin, multiline && styles.detailValueMultiline]}
      numberOfLines={multiline ? undefined : 3}>
      {value || '—'}
    </Text>
  </View>
);

const SellerJobDetailModal = ({ visible, onClose, loading, error, job }) => {
  const statusStyle = getJobStatusStyle(job?.status);

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
              <Icon name="briefcase" size={18} color={redColor} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, style.fontWeightMedium]}>{SELLER_JOB_DETAIL_MODAL.title}</Text>
              {job?.title ? (
                <Text style={[styles.subtitle, style.fontWeightThin]} numberOfLines={2}>
                  {job.title}
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

              {job ? (
                <>
                  <View style={[styles.statusRow, flexDirectionRow, alignItemsCenter]}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>{job.status}</Text>
                    </View>
                    <Text style={[styles.bidCountText, style.fontWeightThin]}>
                      {job.bidCount} {BIDS_SUFFIX}
                    </Text>
                  </View>

                  <DetailRow label={SELLER_JOB_DETAIL_MODAL.buyer} value={job.buyerName} />
                  <DetailRow label={POST_JOB_LABELS.category} value={job.category} />
                  <DetailRow label={POST_JOB_LABELS.jobType} value={job.jobType} />
                  <DetailRow label={POST_JOB_LABELS.budgetMin} value={job.budgetMin} />
                  <DetailRow label={POST_JOB_LABELS.budgetMax} value={job.budgetMax} />
                  <DetailRow label={POST_JOB_LABELS.deadline} value={job.deadline} />
                  <DetailRow label={POST_JOB_LABELS.experienceLevel} value={job.experienceLevel} />
                  <DetailRow label={SELLER_JOB_DETAIL_MODAL.postedOn} value={job.date} />
                  <DetailRow label={POST_JOB_LABELS.description} value={job.description} multiline />
                  <DetailRow
                    label={POST_JOB_LABELS.skills}
                    value={job.skills || SELLER_JOB_DETAIL_MODAL.noSkills}
                    multiline
                    last
                  />

                  <View style={styles.yourBidSection}>
                    <View style={[styles.yourBidHeader, flexDirectionRow, alignItemsCenter]}>
                      <View style={styles.yourBidIconWrap}>
                        <Icon name="send" size={14} color={redColor} />
                      </View>
                      <Text style={[styles.yourBidTitle, style.fontWeightMedium]}>
                        {SELLER_JOB_DETAIL_MODAL.yourBid}
                      </Text>
                      {job.hasBid && job.myBid ? (
                        <View
                          style={[
                            styles.bidStatusBadge,
                            { backgroundColor: getBidStatusStyle(job.myBid.status).bg },
                          ]}>
                          <Text
                            style={[
                              styles.bidStatusText,
                              style.fontWeightMedium,
                              { color: getBidStatusStyle(job.myBid.status).text },
                            ]}>
                            {getBidStatusLabel(job.myBid.status)}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {job.hasBid && job.myBid ? (
                      <>
                        <DetailRow
                          label={SELLER_JOB_DETAIL_MODAL.bidAmount}
                          value={job.myBid.amount}
                        />
                        <DetailRow
                          label={SELLER_JOB_DETAIL_MODAL.deliveryDays}
                          value={job.myBid.deliveryDays}
                        />
                        <DetailRow
                          label={SELLER_JOB_DETAIL_MODAL.proposal}
                          value={job.myBid.proposal}
                          multiline
                          last
                        />
                      </>
                    ) : (
                      <Text style={[styles.noBidText, style.fontWeightThin]}>
                        {SELLER_JOB_DETAIL_MODAL.noBid}
                      </Text>
                    )}
                  </View>
                </>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SellerJobDetailModal;

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
    maxHeight: hp(75),
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
  bidCountText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  yourBidSection: {
    marginTop: spacings.xLarge,
    backgroundColor: inputBgColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.large,
    paddingTop: spacings.large,
    paddingBottom: spacings.small,
  },
  yourBidHeader: {
    gap: spacings.normal,
    marginBottom: spacings.medium,
    paddingBottom: spacings.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  yourBidIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourBidTitle: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  bidStatusBadge: {
    paddingHorizontal: spacings.medium,
    paddingVertical: spacings.xsmall,
    borderRadius: 6,
  },
  bidStatusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
  },
  noBidText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    paddingVertical: spacings.medium,
    lineHeight: 18,
  },
  detailRow: {
    paddingVertical: spacings.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  detailRowLast: {
    borderBottomWidth: 0,
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
