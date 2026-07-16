import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
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
  redColor,
  screenBgColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BIDS_SUFFIX,
  EMPTY_SELLER_JOBS_MESSAGE,
  EMPTY_SELLER_JOBS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  SELLER_JOB_CATEGORIES,
  SELLER_JOBS_SEARCH_PLACEHOLDER,
  SELLER_JOBS_TITLE,
  SELLER_PLACE_BID,
  SELLER_VIEW_JOB,
  SELLER_BID_PENDING,
  SELLER_BID_ACCEPTED,
  SELLER_BID_REJECTED,
  SELLER_YOUR_BID_PREFIX,
  SELLER_JOB_DETAIL_MODAL,
  SELLER_PLACE_BID_MODAL,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import SellerJobDetailModal from '../../components/modal/SellerJobDetailModal';
import PlaceBidModal from '../../components/modal/PlaceBidModal';
import SuccessModal from '../../components/modal/SuccessModal';
import { selectAuth } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../services/apiClient';
import {
  getSellerJobsApi,
  getSellerJobByIdApi,
  placeSellerJobBidApi,
} from '../../services/sellerService';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '../../utils';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } = BaseStyle;

const formatBudget = (min, max) => {
  const formatNum = value => {
    const num = Number(value);
    if (Number.isNaN(num)) return null;
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };
  const minStr = formatNum(min);
  const maxStr = formatNum(max);
  if (minStr && maxStr) return `${minStr} - ${maxStr}`;
  if (minStr) return minStr;
  if (maxStr) return maxStr;
  return '—';
};

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';

const formatPosted = dateStr => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const extractJobsList = response => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.jobs)) return response.jobs;
  return [];
};

const extractPagination = response => response?.pagination || response?.data?.pagination || null;

const JOBS_PAGE_LIMIT = 20;

const resolveHasMoreJobs = (response, page, listLength) => {
  const pagination = extractPagination(response);
  const totalPages =
    pagination?.pages ?? pagination?.totalPages ?? pagination?.total_pages ?? null;
  const currentPage = pagination?.page ?? page;

  if (totalPages != null) {
    return Number(currentPage) < Number(totalPages);
  }

  return listLength >= JOBS_PAGE_LIMIT;
};

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

const formatDetailAmount = amount => {
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const mapJobDetailForDisplay = job => {
  const min = job?.budget_min ?? job?.budgetMin;
  const max = job?.budget_max ?? job?.budgetMax;
  const skills = Array.isArray(job?.skills)
    ? job.skills.filter(Boolean).join(', ')
    : String(job?.skills || '').trim();
  const myBid = job?.my_bid || null;

  return {
    title: capitalizeTitle(job?.title),
    status: mapApiStatusToUi(job?.status),
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
    hasBid: Boolean(job?.has_bid),
    myBid: myBid
      ? {
          amount: formatDetailAmount(myBid.amount),
          deliveryDays:
            myBid.delivery_days != null ? `${myBid.delivery_days} days` : '—',
          status: myBid.status,
          proposal: myBid.proposal || '—',
        }
      : null,
  };
};

const mapApiJobToUi = job => {
  const buyerName = job?.buyer?.name || 'Buyer';
  const bidStatus = String(job?.my_bid?.status || '')
    .trim()
    .toLowerCase();
  return {
    id: String(job.id),
    title: capitalizeTitle(job.title),
    category: job.category || '—',
    budget: formatBudget(job.budget_min, job.budget_max),
    description: job.description || '',
    client: buyerName,
    clientInitials: getInitials(buyerName),
    posted: formatPosted(job.createdAt || job.created_at),
    bids: Number(job.bids_count ?? 0) || 0,
    hasBid: Boolean(job.has_bid),
    bidStatus,
    bidAmount: job?.my_bid?.amount ?? null,
    myBid: job.my_bid || null,
    raw: job,
  };
};

const formatBidAmount = amount => {
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const getBidButtonConfig = job => {
  if (!job.hasBid) {
    return {
      label: SELLER_PLACE_BID,
      disabled: false,
      style: styles.bidBtn,
      textStyle: styles.bidBtnText,
      icon: 'send',
    };
  }

  if (job.bidStatus === 'pending') {
    return {
      label: SELLER_BID_PENDING,
      disabled: true,
      style: [styles.bidBtn, styles.bidBtnPending],
      textStyle: styles.bidBtnText,
      icon: 'clock',
    };
  }

  if (job.bidStatus === 'accepted') {
    return {
      label: SELLER_BID_ACCEPTED,
      disabled: true,
      style: [styles.bidBtn, styles.bidBtnAccepted],
      textStyle: styles.bidBtnText,
      icon: 'check',
    };
  }

  if (job.bidStatus === 'rejected') {
    return {
      label: SELLER_BID_REJECTED,
      disabled: true,
      style: [styles.bidBtn, styles.bidBtnRejected],
      textStyle: styles.bidBtnText,
      icon: null,
    };
  }

  return {
    label: SELLER_PLACE_BID,
    disabled: false,
    style: styles.bidBtn,
    textStyle: styles.bidBtnText,
    icon: 'send',
  };
};

const getBidMetaText = job => {
  if (!job.hasBid || !job.myBid) return null;

  const amount = formatBidAmount(job.bidAmount);
  const statusLabel =
    job.bidStatus === 'pending'
      ? SELLER_BID_PENDING
      : job.bidStatus === 'accepted'
        ? SELLER_BID_ACCEPTED
        : job.bidStatus === 'rejected'
          ? SELLER_BID_REJECTED
          : job.bidStatus;

  return `${SELLER_YOUR_BID_PREFIX} ${amount} · ${statusLabel}`;
};

const SellerJobsScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);
  const jobsFetchingRef = useRef(false);
  const hasMoreJobsRef = useRef(true);
  const jobsPageRef = useRef(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [jobDetailModal, setJobDetailModal] = useState({
    visible: false,
    loading: false,
    job: null,
    error: '',
  });
  const [placeBidModal, setPlaceBidModal] = useState({
    visible: false,
    loading: false,
    job: null,
    error: '',
  });
  const [bidSuccessVisible, setBidSuccessVisible] = useState(false);

  const closeJobDetailModal = () => {
    setJobDetailModal({ visible: false, loading: false, job: null, error: '' });
  };

  const closePlaceBidModal = () => {
    if (placeBidModal.loading) return;
    setPlaceBidModal({ visible: false, loading: false, job: null, error: '' });
  };

  const handleOpenPlaceBid = job => {
    if (!token || !job?.id || job.hasBid) return;
    setPlaceBidModal({ visible: true, loading: false, job, error: '' });
  };

  const fetchSellerJobs = useCallback(
    async (page = 1, { isLoadMore = false } = {}) => {
      if (!token || jobsFetchingRef.current) return;
      if (isLoadMore && !hasMoreJobsRef.current) return;

      jobsFetchingRef.current = true;
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsInitialLoading(true);
      }

      try {
        const response = await getSellerJobsApi(token, {
          category: activeCategory !== 'All' ? activeCategory : undefined,
          page,
          limit: JOBS_PAGE_LIMIT,
        });
        const list = extractJobsList(response);
        const mapped = list.map(mapApiJobToUi);
        const nextHasMore = resolveHasMoreJobs(response, page, list.length);

        setJobs(prev => (isLoadMore ? [...prev, ...mapped] : mapped));
        jobsPageRef.current = page;
        hasMoreJobsRef.current = nextHasMore;
      } catch (error) {
        if (!isLoadMore) setJobs([]);
      } finally {
        jobsFetchingRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token, activeCategory],
  );

  const handleLoadMoreJobs = useCallback(() => {
    if (isInitialLoading || isLoadingMore || !hasMoreJobsRef.current) return;
    fetchSellerJobs(jobsPageRef.current + 1, { isLoadMore: true });
  }, [isInitialLoading, isLoadingMore, fetchSellerJobs]);

  const refreshJobs = useCallback(async () => {
    hasMoreJobsRef.current = true;
    jobsPageRef.current = 1;
    await fetchSellerJobs(1, { isLoadMore: false });
  }, [fetchSellerJobs]);

  const handleSubmitBid = async form => {
    const job = placeBidModal.job;
    if (!token || !job?.id || placeBidModal.loading) return;

    setPlaceBidModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await placeSellerJobBidApi(token, job.id, form);
      setPlaceBidModal({ visible: false, loading: false, job: null, error: '' });
      setBidSuccessVisible(true);
      await refreshJobs();
    } catch (error) {
      setPlaceBidModal(prev => ({
        ...prev,
        loading: false,
        error: getApiErrorMessage(
          error?.data,
          error?.message || SELLER_PLACE_BID_MODAL.submitError,
        ),
      }));
    }
  };

  const handleViewJob = async job => {
    if (!token || !job?.id || jobDetailModal.loading) return;

    setJobDetailModal({ visible: true, loading: true, job: null, error: '' });

    try {
      const response = await getSellerJobByIdApi(token, job.id);
      const detail = response?.data || response;
      setJobDetailModal({
        visible: true,
        loading: false,
        job: mapJobDetailForDisplay(detail),
        error: '',
      });
    } catch (error) {
      const fallback = job.raw || job;
      setJobDetailModal({
        visible: true,
        loading: false,
        job: mapJobDetailForDisplay(fallback),
        error: getApiErrorMessage(error?.data, error?.message || SELLER_JOB_DETAIL_MODAL.loadError),
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      hasMoreJobsRef.current = true;
      jobsPageRef.current = 1;
      fetchSellerJobs(1, { isLoadMore: false });
    }, [fetchSellerJobs]),
  );

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter(
      job =>
        job.title.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.client.toLowerCase().includes(q),
    );
  }, [jobs, searchQuery]);

  const renderJobCard = ({ item: job }) => {
    const bidButton = getBidButtonConfig(job);
    const bidMeta = getBidMetaText(job);

    return (
      <View style={styles.jobCard}>
        <View style={[styles.jobHeader, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <Text style={[styles.jobTitle, style.fontWeightMedium]}>{job.title}</Text>
          <Text style={[styles.jobBudget, style.fontWeightMedium]}>{job.budget}</Text>
        </View>
        {job.category && job.category !== '—' ? (
          <View style={[styles.jobCategoryRow, flexDirectionRow, alignItemsCenter]}>
            <Icon name="tag" size={12} color={grayColor} />
            <Text style={[styles.jobCategoryText, style.fontWeightMedium]}>{job.category}</Text>
          </View>
        ) : null}
        <Text style={[styles.jobDesc, style.fontWeightThin]} numberOfLines={3}>
          {job.description}
        </Text>
        <View style={[styles.jobFooter, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <View style={[flexDirectionRow, alignItemsCenter, styles.clientRow]}>
            <View style={[styles.clientAvatar, alignJustifyCenter]}>
              <Text style={[styles.clientInitials, style.fontWeightMedium]}>{job.clientInitials}</Text>
            </View>
            <View>
              <Text style={[styles.clientName, style.fontWeightMedium]}>{job.client}</Text>
              <Text style={[styles.jobMeta, style.fontWeightThin]}>
                {job.posted} · {job.bids} {BIDS_SUFFIX}
              </Text>
              {bidMeta ? (
                <Text
                  style={[
                    styles.bidMeta,
                    style.fontWeightMedium,
                    job.bidStatus === 'rejected' && styles.bidMetaRejected,
                    job.bidStatus === 'accepted' && styles.bidMetaAccepted,
                    job.bidStatus === 'pending' && styles.bidMetaPending,
                  ]}>
                  {bidMeta}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={[styles.actionRow, flexDirectionRow, alignItemsCenter]}>
            <TouchableOpacity
              style={[styles.viewBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() => handleViewJob(job)}
              activeOpacity={0.7}>
              <Icon name="eye" size={14} color={blackColor} />
              <Text style={[styles.viewBtnText, style.fontWeightMedium]}>{SELLER_VIEW_JOB}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[bidButton.style, flexDirectionRow, alignItemsCenter]}
              disabled={bidButton.disabled}
              activeOpacity={bidButton.disabled ? 1 : 0.7}
              onPress={() => {
                if (!bidButton.disabled) handleOpenPlaceBid(job);
              }}>
              <Text style={[bidButton.textStyle, style.fontWeightMedium]}>{bidButton.label}</Text>
              {bidButton.icon ? <Icon name={bidButton.icon} size={14} color={whiteColor} /> : null}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderListFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={[styles.loaderWrap, alignJustifyCenter]}>
        <ActivityIndicator size="small" color={redColor} />
      </View>
    );
  };

  const renderListEmpty = () => {
    if (isInitialLoading) {
      return (
        <View style={[styles.loaderWrap, alignJustifyCenter]}>
          <ActivityIndicator size="small" color={redColor} />
        </View>
      );
    }
    return (
      <EmptyState
        icon="briefcase"
        title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_SELLER_JOBS_TITLE}
        message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_SELLER_JOBS_MESSAGE}
      />
    );
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.fixedHeader}>
        <ScreenHeader title={SELLER_JOBS_TITLE} navigation={navigation} />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={SELLER_JOBS_SEARCH_PLACEHOLDER}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}>
          {SELLER_JOB_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => {
                  if (activeCategory === cat) return;
                  setActiveCategory(cat);
                  hasMoreJobsRef.current = true;
                  jobsPageRef.current = 1;
                }}>
                <Text style={[styles.categoryText, style.fontWeightMedium, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        style={flex}
        data={filteredJobs}
        keyExtractor={item => String(item.id)}
        renderItem={renderJobCard}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderListEmpty}
        onEndReached={handleLoadMoreJobs}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      />

      <SellerJobDetailModal
        visible={jobDetailModal.visible}
        loading={jobDetailModal.loading}
        error={jobDetailModal.error}
        job={jobDetailModal.job}
        onClose={closeJobDetailModal}
      />

      <PlaceBidModal
        visible={placeBidModal.visible}
        job={placeBidModal.job}
        loading={placeBidModal.loading}
        error={placeBidModal.error}
        onClose={closePlaceBidModal}
        onSubmit={handleSubmitBid}
      />

      <SuccessModal
        visible={bidSuccessVisible}
        title={SELLER_PLACE_BID_MODAL.successTitle}
        message={SELLER_PLACE_BID_MODAL.successMessage}
        onPress={() => setBidSuccessVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SellerJobsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  fixedHeader: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    flexGrow: 1,
  },
  loaderWrap: {
    paddingVertical: hp(3),
  },
  categoryRow: {
    gap: spacings.normal,
    paddingBottom: hp(1.2),
  },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  categoryChipActive: {
    backgroundColor: redColor,
    borderColor: redColor,
  },
  categoryText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  categoryTextActive: { color: whiteColor },
  jobCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
    marginBottom: spacings.normal,
    gap: spacings.normal,
  },
  jobHeader: { gap: spacings.normal },
  jobTitle: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  jobBudget: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: redColor,
  },
  jobCategoryRow: {
    gap: 6,
  },
  jobCategoryText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  jobDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  jobFooter: { gap: spacings.normal },
  clientRow: { flex: 1, gap: spacings.normal },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: inputBgColor,
  },
  clientInitials: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  clientName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  jobMeta: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  bidMeta: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  bidMetaPending: { color: grayColor },
  bidMetaAccepted: { color: greenColor },
  bidMetaRejected: { color: redColor },
  actionRow: {
    gap: spacings.normal,
    flexShrink: 0,
  },
  viewBtn: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.medium,
    paddingVertical: spacings.normal,
    gap: 6,
  },
  viewBtnText: {
    color: blackColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  bidBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.medium,
    paddingVertical: spacings.normal,
    gap: 6,
  },
  bidBtnPending: {
    backgroundColor: grayColor,
    opacity: 0.85,
  },
  bidBtnAccepted: {
    backgroundColor: greenColor,
  },
  bidBtnRejected: {
    backgroundColor: '#B42318',
  },
  bidBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
