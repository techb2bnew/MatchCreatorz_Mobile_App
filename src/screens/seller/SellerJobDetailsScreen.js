import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
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
import { style } from '../../constans/Fonts';
import {
  BIDS_SUFFIX,
  ERROR_START_CHAT_FAILED,
  MESSAGE_BUYER_BTN,
  POST_JOB_LABELS,
  SCREEN_NAMES,
  SELLER_JOB_DETAIL_MODAL,
  SELLER_BID_PENDING,
  SELLER_BID_ACCEPTED,
  SELLER_BID_REJECTED,
  SELLER_TABS,
} from '../../constans/Constants';
import { selectAuth } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../services/apiClient';
import { getSellerJobByIdApi } from '../../services/sellerService';
import { createOrGetConversationApi } from '../../services/chatService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import { formatAppPrice } from '../../utils/currency';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } = BaseStyle;

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';

const capitalizeTitle = value => {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const mapApiStatusToUi = status => {
  const normalized = String(status || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');
  if (normalized === 'OPEN') return 'Open';
  if (normalized === 'IN_PROGRESS') return 'In Progress';
  if (normalized === 'CLOSED') return 'Closed';
  if (normalized === 'CANCELLED') return 'Cancelled';
  return status || '—';
};

const mapJobTypeToUi = jobType => {
  const normalized = String(jobType || '')
    .trim()
    .toLowerCase();
  return normalized === 'hourly' ? 'Hourly' : 'Fixed Price';
};

const mapExperienceLevelToUi = level => {
  const normalized = String(level || '')
    .trim()
    .toLowerCase();
  if (normalized === 'beginner' || normalized === 'entry') return 'Entry Level';
  if (normalized === 'intermediate') return 'Intermediate';
  if (normalized === 'expert') return 'Expert';
  return 'Any Level';
};

const formatJobDate = dateStr => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDeadlineForDisplay = value => {
  if (!value) return '—';
  const match = String(value)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return String(value);
};

const formatDetailAmount = amount => formatAppPrice(amount);

const isImageUrl = url => /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(String(url || ''));

const mapJobAttachmentsList = job => {
  const raw = job?.attachments || job?.files || job?.attachment_urls || job?.attachmentUrls || [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map(item =>
      typeof item === 'string'
        ? { url: item, name: item.split('/').pop() }
        : { url: item?.url || item?.path || '', name: item?.name || item?.filename || '' },
    )
    .filter(item => item.url);
};

const mapJobDetailForDisplay = job => {
  const min = job?.budget_min ?? job?.budgetMin;
  const max = job?.budget_max ?? job?.budgetMax;
  const skills = Array.isArray(job?.skills)
    ? job.skills.filter(Boolean)
    : String(job?.skills || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
  const myBid = job?.my_bid || null;

  return {
    title: capitalizeTitle(job?.title),
    status: mapApiStatusToUi(job?.status),
    buyerId: job?.buyer?.id ?? job?.buyer_id ?? job?.buyerId ?? null,
    buyerName: job?.buyer?.name || 'Buyer',
    category: job?.category || job?.job_category || '—',
    jobType: mapJobTypeToUi(job?.job_type || job?.jobType),
    budgetMin: min != null ? formatDetailAmount(min) : '—',
    budgetMax: max != null ? formatDetailAmount(max) : '—',
    deadline: formatDeadlineForDisplay(job?.deadline || job?.deadline_date || ''),
    experienceLevel: mapExperienceLevelToUi(job?.experience_level || job?.experienceLevel),
    description: job?.description || '',
    skills,
    bidCount: Number(job?.bid_count ?? job?.bidCount ?? job?.bids_count ?? 0) || 0,
    date: formatJobDate(job?.created_at || job?.createdAt || job?.date),
    attachments: mapJobAttachmentsList(job),
    hasBid: Boolean(job?.has_bid),
    myBid: myBid
      ? {
          amount: formatDetailAmount(myBid.amount),
          deliveryDays: myBid.delivery_days != null ? `${myBid.delivery_days} days` : '—',
          status: myBid.status,
          proposal: myBid.proposal || '—',
        }
      : null,
  };
};

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

const InfoRow = ({ label, value, last = false }) => (
  <View
    style={[
      styles.infoRow,
      flexDirectionRow,
      justifyContentSpaceBetween,
      alignItemsCenter,
      !last && styles.infoRowBorder,
    ]}>
    <Text style={[styles.infoLabel, style.fontWeightThin]}>{label}</Text>
    <Text style={[styles.infoValue, style.fontWeightMedium]} numberOfLines={2}>
      {value || '—'}
    </Text>
  </View>
);

const SellerJobDetailsScreen = ({ navigation, route }) => {
  const { token } = useSelector(selectAuth);
  const routeJob = route.params?.job;
  const jobId = routeJob?.id;

  const [job, setJob] = useState(routeJob?.raw ? mapJobDetailForDisplay(routeJob.raw) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleMessageBuyer = async () => {
    if (!token || !job?.buyerId || isStartingChat) return;

    setIsStartingChat(true);
    try {
      const response = await createOrGetConversationApi(token, job.buyerId);
      const conversation = response?.data?.conversation || response?.data || response;
      const conversationId = conversation?.id;
      if (!conversationId) throw new Error('missing conversation id');

      const tabNavigation = navigation.getParent();
      // Prime the Chat tab's stack with its list screen first (in a separate tick so
      // React Navigation commits it) so back navigation stays within the tab instead
      // of jumping to the tab navigator's first route.
      tabNavigation?.navigate(SELLER_TABS.CHAT_STACK, { screen: SCREEN_NAMES.CHAT });
      setTimeout(() => {
        tabNavigation?.navigate(SELLER_TABS.CHAT_STACK, {
          screen: SCREEN_NAMES.CHAT_CONVERSATION,
          params: {
            conversationId,
            otherUser: { id: job.buyerId, name: job.buyerName, initials: getInitials(job.buyerName), avatarColor: redColor },
          },
        });
      }, 0);
    } catch (err) {
      Alert.alert('', getApiErrorMessage(err?.data, err?.message || ERROR_START_CHAT_FAILED));
    } finally {
      setIsStartingChat(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchJobDetail = async () => {
        if (!token || !jobId) return;

        setIsLoading(true);
        setError('');
        try {
          const response = await getSellerJobByIdApi(token, jobId);
          if (cancelled) return;
          const detail = response?.data || response;
          setJob(mapJobDetailForDisplay(detail));
        } catch (err) {
          if (cancelled) return;
          const fallback = routeJob?.raw || routeJob;
          if (fallback) setJob(mapJobDetailForDisplay(fallback));
          setError(getApiErrorMessage(err?.data, err?.message || SELLER_JOB_DETAIL_MODAL.loadError));
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      fetchJobDetail();

      return () => {
        cancelled = true;
      };
    }, [token, jobId, routeJob]),
  );

  const statusStyle = getJobStatusStyle(job?.status);
  const bidStatusStyle = job?.myBid ? getBidStatusStyle(job.myBid.status) : null;

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, style.fontWeightMedium]} numberOfLines={1}>
            {SELLER_JOB_DETAIL_MODAL.title}
          </Text>
        </View>

        {isLoading && !job ? (
          <View style={[flex, alignJustifyCenter]}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {error ? (
              <View style={[styles.errorBanner, flexDirectionRow, alignItemsCenter]}>
                <Icon name="alert-circle" size={14} color={redColor} />
                <Text style={[styles.errorText, style.fontWeightThin]}>{error}</Text>
              </View>
            ) : null}

            {job ? (
              <>
                <View style={styles.summaryCard}>
                  <View style={[flexDirectionRow, alignItemsCenter]}>
                    <View style={[styles.jobIcon, alignJustifyCenter]}>
                      <Icon name="briefcase" size={20} color={redColor} />
                    </View>
                    <View style={styles.summaryInfo}>
                      <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
                        {job.title}
                      </Text>
                      <Text style={[styles.buyerName, style.fontWeightThin]}>
                        {SELLER_JOB_DETAIL_MODAL.buyer}: {job.buyerName}
                      </Text>
                      <View style={[flexDirectionRow, alignItemsCenter, styles.summaryMetaRow]}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                          <Text style={[styles.statusText, { color: statusStyle.text }]}>{job.status}</Text>
                        </View>
                        <Text style={[styles.bidCountText, style.fontWeightThin]}>
                          {job.bidCount} {BIDS_SUFFIX}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.messageBuyerBtn, alignJustifyCenter, flexDirectionRow]}
                    onPress={handleMessageBuyer}
                    disabled={!job.buyerId || isStartingChat}
                    activeOpacity={0.7}>
                    {isStartingChat ? (
                      <ActivityIndicator size="small" color={redColor} />
                    ) : (
                      <>
                        <Icon name="message-circle" size={14} color={redColor} />
                        <Text style={[styles.messageBuyerBtnText, style.fontWeightMedium]}>
                          {MESSAGE_BUYER_BTN}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, style.fontWeightMedium]}>Job Details</Text>
                <View style={styles.sectionCard}>
                  <InfoRow label={POST_JOB_LABELS.category} value={job.category} />
                  <InfoRow label={POST_JOB_LABELS.jobType} value={job.jobType} />
                  <InfoRow label={POST_JOB_LABELS.budgetMin} value={job.budgetMin} />
                  <InfoRow label={POST_JOB_LABELS.budgetMax} value={job.budgetMax} />
                  <InfoRow label={POST_JOB_LABELS.deadline} value={job.deadline} />
                  <InfoRow label={POST_JOB_LABELS.experienceLevel} value={job.experienceLevel} />
                  <InfoRow label={SELLER_JOB_DETAIL_MODAL.postedOn} value={job.date} last />
                </View>

                <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{POST_JOB_LABELS.description}</Text>
                <View style={styles.sectionCard}>
                  <Text style={[styles.descriptionText, style.fontWeightThin]}>
                    {job.description || '—'}
                  </Text>
                </View>

                <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{POST_JOB_LABELS.skills}</Text>
                <View style={[styles.sectionCard, styles.skillsCard]}>
                  {job.skills.length ? (
                    <View style={[flexDirectionRow, styles.skillsWrap]}>
                      {job.skills.map((skill, index) => (
                        <View key={`${skill}-${index}`} style={styles.skillChip}>
                          <Text style={[styles.skillChipText, style.fontWeightMedium]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.descriptionText, style.fontWeightThin]}>
                      {SELLER_JOB_DETAIL_MODAL.noSkills}
                    </Text>
                  )}
                </View>

                {job.attachments.length ? (
                  <>
                    <Text style={[styles.sectionTitle, style.fontWeightMedium]}>
                      {POST_JOB_LABELS.attachments}
                    </Text>
                    <View style={[styles.sectionCard, styles.skillsCard]}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[flexDirectionRow, { gap: wp(2) }]}>
                        {job.attachments.map((file, index) =>
                          isImageUrl(file.url) ? (
                            <TouchableOpacity
                              key={`${file.url}-${index}`}
                              onPress={() => Linking.openURL(file.url)}
                              activeOpacity={0.85}>
                              <Image source={{ uri: file.url }} style={styles.attachmentImage} />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              key={`${file.url}-${index}`}
                              onPress={() => Linking.openURL(file.url)}
                              activeOpacity={0.85}
                              style={[styles.attachmentFileChip, flexDirectionRow, alignItemsCenter]}>
                              <Icon name="file" size={13} color={redColor} />
                              <Text style={[styles.attachmentFileName, style.fontWeightThin]} numberOfLines={1}>
                                {file.name || 'File'}
                              </Text>
                            </TouchableOpacity>
                          ),
                        )}
                      </ScrollView>
                    </View>
                  </>
                ) : null}

                <View style={[styles.sectionTitleRow, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
                  <Text style={[styles.sectionTitle, style.fontWeightMedium]}>
                    {SELLER_JOB_DETAIL_MODAL.yourBid}
                  </Text>
                  {job.hasBid && job.myBid ? (
                    <View style={[styles.statusBadge, { backgroundColor: bidStatusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: bidStatusStyle.text }]}>
                        {getBidStatusLabel(job.myBid.status)}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.sectionCard}>
                  {job.hasBid && job.myBid ? (
                    <>
                      <InfoRow label={SELLER_JOB_DETAIL_MODAL.bidAmount} value={job.myBid.amount} />
                      <InfoRow label={SELLER_JOB_DETAIL_MODAL.deliveryDays} value={job.myBid.deliveryDays} />
                      <View style={styles.proposalWrap}>
                        <Text style={[styles.infoLabel, style.fontWeightThin]}>
                          {SELLER_JOB_DETAIL_MODAL.proposal}
                        </Text>
                        <Text style={[styles.descriptionText, style.fontWeightThin, styles.proposalText]}>
                          {job.myBid.proposal}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={[styles.descriptionText, style.fontWeightThin]}>
                      {SELLER_JOB_DETAIL_MODAL.noBid}
                    </Text>
                  )}
                </View>
              </>
            ) : null}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SellerJobDetailsScreen;

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
  errorBanner: {
    gap: wp(2),
    backgroundColor: lightPink,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    marginBottom: hp(2),
  },
  errorText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
  },
  messageBuyerBtn: {
    marginTop: hp(1.5),
    alignSelf: 'flex-start',
    borderRadius: wp(2),
    paddingVertical: hp(0.9),
    paddingHorizontal: wp(3),
    gap: wp(1.5),
    borderWidth: 1,
    borderColor: redColor,
  },
  messageBuyerBtnText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  jobIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    backgroundColor: lightPink,
    marginRight: wp(3),
    flexShrink: 0,
  },
  summaryInfo: { flex: 1, minWidth: 0 },
  jobTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: hp(0.3),
  },
  buyerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: hp(0.8),
  },
  summaryMetaRow: { gap: wp(3) },
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
  bidCountText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  sectionTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: hp(1),
  },
  sectionTitleRow: {
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
    paddingVertical: hp(1),
  },
  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
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
  descriptionText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 20,
  },
  skillsCard: {
    paddingBottom: wp(3),
  },
  skillsWrap: {
    flexWrap: 'wrap',
    gap: wp(2),
  },
  skillChip: {
    backgroundColor: inputBgColor,
    borderRadius: wp(5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
  },
  skillChipText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  proposalWrap: {
    paddingTop: hp(1),
  },
  proposalText: {
    marginTop: hp(0.5),
  },
  attachmentImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    backgroundColor: inputBgColor,
  },
  attachmentFileChip: {
    backgroundColor: inputBgColor,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    gap: wp(1.5),
    maxWidth: wp(40),
  },
  attachmentFileName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    flexShrink: 1,
  },
});
