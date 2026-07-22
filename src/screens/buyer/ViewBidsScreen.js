import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { selectAuth } from '../../redux/slices/authSlice';
import {
  getBuyerJobBidsApi,
  acceptBuyerJobBidApi,
  rejectBuyerJobBidApi,
  counterBuyerJobBidApi,
} from '../../services/buyerService';
import { getApiErrorMessage } from '../../services/apiClient';
import {
  blackColor,
  borderLightColor,
  grayColor,
  goldColor,
  greenColor,
  inputBgColor,
  lightPink,
  purpleColor,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style } from '../../constans/Fonts';
import {
  BID_STATUS_COUNTERED,
  BIDS_SUFFIX,
  COUNTER_OFFER_BTN,
  COUNTER_OFFER_MODAL,
  COUNTERED_BY_LABEL,
  EMPTY_BIDS_MESSAGE,
  EMPTY_BIDS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  ERROR_HIRE_CREATOR_FAILED,
  ERROR_REJECT_BID_FAILED,
  HIRE_CREATOR,
  HIRE_CREATOR_CONFIRM_BTN,
  HIRE_CREATOR_CONFIRM_MESSAGE,
  HIRE_CREATOR_CONFIRM_TITLE,
  REJECT_BID,
  REJECT_BID_CONFIRM_BTN,
  REJECT_BID_CONFIRM_MESSAGE,
  REJECT_BID_CONFIRM_TITLE,
  VIEW_BIDS_TITLE,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import CounterOfferModal from '../../components/modal/CounterOfferModal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import { formatAppCurrency } from '../../utils/currency';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';

const extractBidsList = response => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bids)) return data.bids;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(response?.bids)) return response.bids;
  return [];
};

const formatBidAmount = bid => {
  if (bid.amount_display) return bid.amount_display;
  if (typeof bid.amount === 'string' && bid.amount.includes('$')) return bid.amount;
  const amount = bid.amount ?? bid.bid_amount ?? bid.price ?? bid.proposed_amount;
  if (amount == null || amount === '') return '—';
  const num = Number(amount);
  if (Number.isNaN(num)) return String(amount);
  return formatAppCurrency(num, { decimals: 0, whole: true });
};

const formatDelivery = bid => {
  if (bid.delivery) return bid.delivery;
  if (bid.delivery_time) return bid.delivery_time;
  if (bid.delivery_days != null) return `${bid.delivery_days} days`;
  if (bid.estimated_days != null) return `${bid.estimated_days} days`;
  return '—';
};

const isCounteredStatus = normalizedStatus => normalizedStatus.includes('counter');

const formatBidStatus = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (!normalized) return '—';
  if (isCounteredStatus(normalized)) return BID_STATUS_COUNTERED;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getBidStatusStyle = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'pending') return { bg: '#FFF4E5', text: '#C27803' };
  if (normalized === 'accepted') return { bg: '#E8F8EE', text: greenColor };
  if (normalized === 'rejected') return { bg: '#FFEBEB', text: redColor };
  if (isCounteredStatus(normalized)) return { bg: '#F3E8FF', text: purpleColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const mapApiBidToUi = bid => {
  const seller = bid.seller || bid.creator || bid.user || {};
  const creatorName =
    seller.name ||
    seller.full_name ||
    bid.seller_name ||
    bid.creator_name ||
    bid.name ||
    'Creator';

  const email = seller.email || bid.seller_email || bid.email || '';
  const status = String(bid.status || '').toLowerCase();
  const ratingRaw = seller.rating ?? bid.rating;
  const reviewsRaw = seller.reviews_count ?? seller.reviews ?? bid.reviews;
  const counterNote = bid.counter_note || bid.note || bid.counter_offer?.note || '';

  return {
    id: String(bid.id),
    creatorName,
    initials: getInitials(creatorName),
    email,
    amount: formatBidAmount(bid),
    delivery: formatDelivery(bid),
    rating: ratingRaw != null && ratingRaw !== '' ? String(ratingRaw) : null,
    reviews: Number(reviewsRaw ?? 0) || 0,
    proposal: bid.proposal || bid.message || bid.cover_letter || bid.description || '',
    status,
    statusLabel: formatBidStatus(bid.status),
    isCountered: isCounteredStatus(status),
    counterNote,
    hired: status === 'accepted' || Boolean(bid.hired),
    rejected: status === 'rejected',
    raw: bid,
  };
};

const ViewBidsScreen = ({ navigation, route }) => {
  const { token } = useSelector(selectAuth);
  const routeJob = route.params?.job;
  const jobId = routeJob?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [bids, setBids] = useState([]);
  const [jobInfo, setJobInfo] = useState(routeJob || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hireModal, setHireModal] = useState({
    visible: false,
    bidId: null,
    creatorName: '',
  });
  const [isHiring, setIsHiring] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    visible: false,
    bidId: null,
    creatorName: '',
  });
  const [isRejecting, setIsRejecting] = useState(false);
  const [counterModal, setCounterModal] = useState({ visible: false, bid: null, loading: false, error: '' });

  const fetchBids = useCallback(async () => {
    if (!token || !jobId) {
      setBids([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getBuyerJobBidsApi(token, jobId);

      // Bids list always comes in response.data (array)
      const list = extractBidsList(response).map(mapApiBidToUi);
      setBids(list);

      if (response?.job) {
        const apiJob = response.job;
        setJobInfo({
          id: String(apiJob.id),
          title: apiJob.title || routeJob?.title || '—',
          budgetRange:
            apiJob.budget_min != null || apiJob.budget_max != null
              ? `$${Number(apiJob.budget_min || 0)}–$${Number(apiJob.budget_max || 0)}`
              : routeJob?.budgetRange || '—',
          bidCount: Number(apiJob.bids_count ?? list.length) || 0,
        });
      } else if (routeJob) {
        setJobInfo(prev => ({
          ...(prev || routeJob),
          bidCount: list.length,
        }));
      }
    } catch (error) {
      setBids([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, jobId, routeJob]);

  useFocusEffect(
    useCallback(() => {
      fetchBids();
    }, [fetchBids]),
  );

  const filteredBids = useMemo(() => {
    if (!searchQuery.trim()) return bids;
    const q = searchQuery.trim().toLowerCase();
    return bids.filter(
      b =>
        b.creatorName.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.proposal.toLowerCase().includes(q) ||
        b.statusLabel.toLowerCase().includes(q),
    );
  }, [bids, searchQuery]);

  const openHireModal = bid => {
    if (!bid?.id || bid.hired || bid.rejected || isHiring || isRejecting) return;
    setHireModal({
      visible: true,
      bidId: bid.id,
      creatorName: bid.creatorName || 'this creator',
    });
  };

  const closeHireModal = () => {
    if (isHiring) return;
    setHireModal({ visible: false, bidId: null, creatorName: '' });
  };

  const handleConfirmHire = async () => {
    const bidId = hireModal.bidId;
    if (!bidId || !token || !jobId || isHiring) {
      if (!bidId) closeHireModal();
      return;
    }

    setIsHiring(true);
    try {
      await acceptBuyerJobBidApi(token, jobId, bidId);
      setBids(prev =>
        prev.map(b => ({
          ...b,
          hired: b.id === bidId,
          rejected: b.id === bidId ? false : b.rejected,
          status: b.id === bidId ? 'accepted' : b.status,
          statusLabel: b.id === bidId ? 'Accepted' : b.statusLabel,
        })),
      );
      setHireModal({ visible: false, bidId: null, creatorName: '' });
    } catch (error) {
      Alert.alert(
        HIRE_CREATOR_CONFIRM_TITLE,
        getApiErrorMessage(error?.data, error?.message || ERROR_HIRE_CREATOR_FAILED),
      );
    } finally {
      setIsHiring(false);
    }
  };

  const openRejectModal = bid => {
    if (!bid?.id || bid.hired || bid.rejected || isHiring || isRejecting) return;
    setRejectModal({
      visible: true,
      bidId: bid.id,
      creatorName: bid.creatorName || 'this creator',
    });
  };

  const closeRejectModal = () => {
    if (isRejecting) return;
    setRejectModal({ visible: false, bidId: null, creatorName: '' });
  };

  const handleConfirmReject = async () => {
    const bidId = rejectModal.bidId;
    if (!bidId || !token || !jobId || isRejecting) {
      if (!bidId) closeRejectModal();
      return;
    }

    setIsRejecting(true);
    try {
      await rejectBuyerJobBidApi(token, jobId, bidId);
      setBids(prev =>
        prev.map(b =>
          b.id === bidId
            ? {
                ...b,
                hired: false,
                rejected: true,
                status: 'rejected',
                statusLabel: 'Rejected',
              }
            : b,
        ),
      );
      setRejectModal({ visible: false, bidId: null, creatorName: '' });
    } catch (error) {
      Alert.alert(
        REJECT_BID_CONFIRM_TITLE,
        getApiErrorMessage(error?.data, error?.message || ERROR_REJECT_BID_FAILED),
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const openCounterModal = bid => {
    if (!bid?.id || bid.hired || bid.rejected || isHiring || isRejecting) return;
    setCounterModal({ visible: true, bid, loading: false, error: '' });
  };

  const closeCounterModal = () => {
    if (counterModal.loading) return;
    setCounterModal({ visible: false, bid: null, loading: false, error: '' });
  };

  const handleSubmitCounter = async form => {
    const bid = counterModal.bid;
    if (!bid?.id || !token || !jobId || counterModal.loading) return;

    setCounterModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await counterBuyerJobBidApi(token, jobId, bid.id, form);
      setCounterModal({ visible: false, bid: null, loading: false, error: '' });
      await fetchBids();
    } catch (error) {
      setCounterModal(prev => ({
        ...prev,
        loading: false,
        error: getApiErrorMessage(error?.data, error?.message || COUNTER_OFFER_MODAL.submitError),
      }));
    }
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, style.fontWeightMedium]} numberOfLines={1}>
            {VIEW_BIDS_TITLE}
          </Text>
        </View>

        {jobInfo ? (
          <View style={styles.summaryCard}>
            <View style={[flexDirectionRow, alignItemsCenter]}>
              <View style={[styles.jobIcon, alignJustifyCenter]}>
                <Icon name="briefcase" size={20} color={redColor} />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
                  {jobInfo.title}
                </Text>
                <Text style={[styles.jobMeta, style.fontWeightThin]}>
                  {jobInfo.budgetRange} · {jobInfo.bidCount ?? bids.length} {BIDS_SUFFIX}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search bids..."
          style={styles.searchBar}
        />

        {isLoading ? (
          <View style={[flex, alignJustifyCenter]}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {filteredBids.length === 0 ? (
              <EmptyState
                icon="users"
                title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_BIDS_TITLE}
                message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_BIDS_MESSAGE}
                compact
              />
            ) : (
              filteredBids.map(bid => {
                const statusStyle = getBidStatusStyle(bid.status);
                return (
                  <View key={bid.id} style={styles.bidCard}>
                    <View style={[flexDirectionRow, alignItemsCenter]}>
                      <View style={[styles.avatar, alignJustifyCenter]}>
                        <Text style={[styles.avatarText, style.fontWeightMedium]}>{bid.initials}</Text>
                      </View>
                      <View style={styles.bidInfo}>
                        <Text style={[styles.creatorName, style.fontWeightMedium]} numberOfLines={1}>
                          {bid.creatorName}
                        </Text>
                        {bid.email ? (
                          <Text style={[styles.emailText, style.fontWeightThin]} numberOfLines={1}>
                            {bid.email}
                          </Text>
                        ) : null}
                        {bid.rating ? (
                          <View style={[flexDirectionRow, alignItemsCenter, styles.ratingRow]}>
                            <Icon name="star" size={12} color={goldColor} />
                            <Text style={[styles.ratingText, style.fontWeightMedium]}>
                              {bid.rating} ({bid.reviews})
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.bidRight}>
                        <Text style={[styles.bidAmount, style.fontWeightMedium]} numberOfLines={1}>
                          {bid.amount}
                        </Text>
                        <Text style={[styles.deliveryText, style.fontWeightThin]} numberOfLines={1}>
                          {bid.delivery}
                        </Text>
                      </View>
                    </View>

                    {bid.proposal ? (
                      <Text style={[styles.proposal, style.fontWeightThin]} numberOfLines={4}>
                        {bid.proposal}
                      </Text>
                    ) : null}

                    {bid.isCountered && bid.counterNote ? (
                      <View style={styles.counterNoteWrap}>
                        <Text style={[styles.counterNoteLabel, style.fontWeightMedium]}>
                          {COUNTERED_BY_LABEL}
                        </Text>
                        <Text style={[styles.counterNoteText, style.fontWeightThin]} numberOfLines={3}>
                          {bid.counterNote}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.bidFooter}>
                      <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                          <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {bid.statusLabel}
                          </Text>
                        </View>
                        {bid.hired ? (
                          <View
                            style={[styles.hireBtn, styles.hireBtnDone, alignJustifyCenter, flexDirectionRow]}>
                            <Icon name="check" size={14} color={whiteColor} />
                            <Text style={[styles.hireBtnText, style.fontWeightMedium]}>Hired</Text>
                          </View>
                        ) : null}
                      </View>

                      {bid.hired || bid.rejected ? null : (
                        <View style={[styles.bidActionsRow, flexDirectionRow, alignItemsCenter]}>
                          <TouchableOpacity
                            style={[styles.counterBtn, styles.actionBtnFlex, alignJustifyCenter, flexDirectionRow]}
                            onPress={() => openCounterModal(bid)}
                            disabled={isHiring || isRejecting}
                            activeOpacity={0.7}>
                            <Icon name="repeat" size={13} color={purpleColor} />
                            <Text
                              style={[styles.counterBtnText, style.fontWeightMedium]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                              minimumFontScale={0.85}>
                              {COUNTER_OFFER_BTN}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.rejectBtn, styles.actionBtnFlex, alignJustifyCenter, flexDirectionRow]}
                            onPress={() => openRejectModal(bid)}
                            disabled={isHiring || isRejecting}
                            activeOpacity={0.7}>
                            <Icon name="x" size={13} color={redColor} />
                            <Text
                              style={[styles.rejectBtnText, style.fontWeightMedium]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                              minimumFontScale={0.85}>
                              {REJECT_BID}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.hireBtn, styles.actionBtnFlex, alignJustifyCenter, flexDirectionRow]}
                            onPress={() => openHireModal(bid)}
                            disabled={isHiring || isRejecting}
                            activeOpacity={0.7}>
                            <Icon name="user-check" size={13} color={whiteColor} />
                            <Text
                              style={[styles.hireBtnText, style.fontWeightMedium]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                              minimumFontScale={0.85}>
                              {HIRE_CREATOR}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      <ConfirmationModal
        visible={hireModal.visible}
        title={HIRE_CREATOR_CONFIRM_TITLE}
        message={
          hireModal.creatorName
            ? `Are you sure you want to hire ${hireModal.creatorName}? This will accept their bid.`
            : HIRE_CREATOR_CONFIRM_MESSAGE
        }
        confirmText={isHiring ? 'Hiring...' : HIRE_CREATOR_CONFIRM_BTN}
        confirmColor={greenColor}
        iconName="user-check"
        iconBgColor="#E8F8EE"
        iconColor={greenColor}
        onConfirm={handleConfirmHire}
        onCancel={closeHireModal}
      />

      <ConfirmationModal
        visible={rejectModal.visible}
        title={REJECT_BID_CONFIRM_TITLE}
        message={
          rejectModal.creatorName
            ? `Are you sure you want to reject ${rejectModal.creatorName}'s bid? This action cannot be undone.`
            : REJECT_BID_CONFIRM_MESSAGE
        }
        confirmText={isRejecting ? 'Rejecting...' : REJECT_BID_CONFIRM_BTN}
        confirmColor={redColor}
        iconName="x-circle"
        onConfirm={handleConfirmReject}
        onCancel={closeRejectModal}
      />

      <CounterOfferModal
        visible={counterModal.visible}
        job={jobInfo}
        title={COUNTER_OFFER_MODAL.title}
        submitLabel={COUNTER_OFFER_MODAL.submit}
        loading={counterModal.loading}
        error={counterModal.error}
        onClose={closeCounterModal}
        onSubmit={handleSubmitCounter}
      />
    </SafeAreaView>
  );
};

export default ViewBidsScreen;

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
  summaryCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
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
  jobMeta: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  searchBar: {
    marginBottom: hp(1.5),
  },
  scrollContent: { paddingBottom: hp(4), flexGrow: 1 },
  bidCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: lightPink,
    marginRight: wp(3),
    flexShrink: 0,
  },
  avatarText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  bidInfo: { flex: 1, minWidth: 0 },
  creatorName: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  emailText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  ratingRow: { gap: 4, marginTop: 4 },
  ratingText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  bidRight: { alignItems: 'flex-end', marginLeft: wp(2), flexShrink: 0 },
  bidAmount: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  deliveryText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  proposal: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
    marginTop: hp(1.5),
  },
  counterNoteWrap: {
    backgroundColor: '#F3E8FF',
    borderRadius: wp(2),
    padding: wp(3),
    marginTop: hp(1.5),
  },
  counterNoteLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: purpleColor,
    marginBottom: 2,
  },
  counterNoteText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    lineHeight: 18,
  },
  bidFooter: {
    marginTop: hp(1.5),
    paddingTop: hp(1.5),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
    gap: hp(1.2),
  },
  bidActionsRow: {
    gap: wp(2),
  },
  actionBtnFlex: {
    flex: 1,
  },
  counterBtn: {
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    gap: wp(1),
    borderWidth: 1,
    borderColor: purpleColor,
    backgroundColor: whiteColor,
  },
  counterBtnText: {
    color: purpleColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: wp(5),
  },
  statusText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: '600',
  },
  rejectBtn: {
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    gap: wp(1.5),
    borderWidth: 1,
    borderColor: redColor,
    backgroundColor: whiteColor,
  },
  rejectBtnText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  hireBtn: {
    backgroundColor: redColor,
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3.5),
    gap: wp(1.5),
  },
  hireBtnDone: { backgroundColor: greenColor },
  hireBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
