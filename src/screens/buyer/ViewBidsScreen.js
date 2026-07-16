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
import { getBuyerJobBidsApi, acceptBuyerJobBidApi, rejectBuyerJobBidApi } from '../../services/buyerService';
import { getApiErrorMessage } from '../../services/apiClient';
import {
  blackColor,
  borderLightColor,
  grayColor,
  goldColor,
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BIDS_SUFFIX,
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

const formatBidStatus = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (!normalized) return '—';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getBidStatusStyle = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'pending') return { bg: '#FFF4E5', text: '#C27803' };
  if (normalized === 'accepted') return { bg: '#E8F8EE', text: greenColor };
  if (normalized === 'rejected') return { bg: '#FFEBEB', text: redColor };
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

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchBids = async () => {
        if (!token || !jobId) {
          setBids([]);
          return;
        }

        setIsLoading(true);
        try {
          const response = await getBuyerJobBidsApi(token, jobId);
          if (cancelled) return;

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
          if (!cancelled) setBids([]);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      fetchBids();

      return () => {
        cancelled = true;
      };
    }, [token, jobId, routeJob?.title, routeJob?.budgetRange]),
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

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.headerRow, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, style.fontWeightMedium]}>{VIEW_BIDS_TITLE}</Text>
          <View style={styles.backBtn} />
        </View>

        {jobInfo ? (
          <View style={styles.jobSummary}>
            <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
              {jobInfo.title}
            </Text>
            <Text style={[styles.jobMeta, style.fontWeightThin]}>
              {jobInfo.budgetRange} · {jobInfo.bidCount ?? bids.length} {BIDS_SUFFIX}
            </Text>
          </View>
        ) : null}

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search bids..."
        />

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={redColor} />
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
                        <Text style={[styles.creatorName, style.fontWeightMedium]}>{bid.creatorName}</Text>
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
                        <Text style={[styles.bidAmount, style.fontWeightMedium]}>{bid.amount}</Text>
                        <Text style={styles.deliveryText}>{bid.delivery}</Text>
                      </View>
                    </View>

                    {bid.proposal ? (
                      <Text style={[styles.proposal, style.fontWeightThin]}>{bid.proposal}</Text>
                    ) : null}

                    <View
                      style={[
                        styles.bidFooter,
                        flexDirectionRow,
                        alignItemsCenter,
                        justifyContentSpaceBetween,
                      ]}>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                          {bid.statusLabel}
                        </Text>
                      </View>
                      {bid.hired ? (
                        <TouchableOpacity
                          style={[styles.hireBtn, styles.hireBtnDone, alignJustifyCenter, flexDirectionRow]}
                          disabled>
                          <Icon name="check" size={14} color={whiteColor} />
                          <Text style={[styles.hireBtnText, style.fontWeightMedium]}>Hired</Text>
                        </TouchableOpacity>
                      ) : bid.rejected ? null : (
                        <View style={[styles.bidActions, flexDirectionRow, alignItemsCenter]}>
                          <TouchableOpacity
                            style={[styles.rejectBtn, alignJustifyCenter, flexDirectionRow]}
                            onPress={() => openRejectModal(bid)}
                            disabled={isHiring || isRejecting}>
                            <Icon name="x" size={14} color={redColor} />
                            <Text style={[styles.rejectBtnText, style.fontWeightMedium]}>{REJECT_BID}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.hireBtn, alignJustifyCenter, flexDirectionRow]}
                            onPress={() => openHireModal(bid)}
                            disabled={isHiring || isRejecting}>
                            <Icon name="user-check" size={14} color={whiteColor} />
                            <Text style={[styles.hireBtnText, style.fontWeightMedium]}>{HIRE_CREATOR}</Text>
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
    </SafeAreaView>
  );
};

export default ViewBidsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  headerRow: { marginBottom: hp(1.5) },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
  },
  jobSummary: {
    backgroundColor: lightPink,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.normal,
  },
  jobTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: hp(3), flexGrow: 1 },
  bidCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: inputBgColor,
    marginRight: spacings.normal,
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
  bidRight: { alignItems: 'flex-end', marginLeft: spacings.small },
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
    marginTop: spacings.large,
  },
  bidFooter: {
    marginTop: spacings.large,
    gap: spacings.normal,
  },
  bidActions: {
    gap: spacings.small,
    flexShrink: 1,
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
  rejectBtn: {
    borderRadius: 8,
    paddingVertical: spacings.medium,
    paddingHorizontal: spacings.medium,
    gap: spacings.xsmall,
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
    borderRadius: 8,
    paddingVertical: spacings.medium,
    paddingHorizontal: spacings.large,
    gap: spacings.xsmall,
  },
  hireBtnDone: { backgroundColor: greenColor },
  hireBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
