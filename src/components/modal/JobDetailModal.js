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
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BIDS_SUFFIX,
  JOB_DETAIL_MODAL,
  POST_JOB_LABELS,
} from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const getJobStatusStyle = status => {
  if (status === 'Open') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'In Progress') return { bg: '#E8F0F8', text: '#2563EB' };
  if (status === 'Closed' || status === 'Cancelled') return { bg: '#F3F4F6', text: grayColor };
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

const JobDetailModal = ({ visible, onClose, loading, error, job }) => {
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
              <Text style={[styles.title, style.fontWeightMedium]}>{JOB_DETAIL_MODAL.title}</Text>
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

                  <DetailRow label={POST_JOB_LABELS.category} value={job.category} />
                  <DetailRow label={POST_JOB_LABELS.jobType} value={job.jobType} />
                  <DetailRow label={POST_JOB_LABELS.budgetMin} value={job.budgetMin} />
                  <DetailRow label={POST_JOB_LABELS.budgetMax} value={job.budgetMax} />
                  <DetailRow label={POST_JOB_LABELS.deadline} value={job.deadline} />
                  <DetailRow label={POST_JOB_LABELS.experienceLevel} value={job.experienceLevel} />
                  <DetailRow label={JOB_DETAIL_MODAL.postedOn} value={job.date} />
                  <DetailRow label={POST_JOB_LABELS.description} value={job.description} multiline />
                  <DetailRow
                    label={POST_JOB_LABELS.skills}
                    value={job.skills || JOB_DETAIL_MODAL.noSkills}
                    multiline
                  />
                </>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default JobDetailModal;

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
