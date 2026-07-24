import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  blueColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  lightPink,
  purpleColor,
  redColor,
  screenBgColor,
  tabBgColor,
  whiteColor,
  goldColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  ACCEPT_COUNTER_BTN,
  ACCEPT_COUNTER_OFFER_CONFIRM_BTN,
  ACCEPT_COUNTER_OFFER_MESSAGE,
  ACCEPT_COUNTER_OFFER_TITLE,
  BID_STATUS_COUNTERED,
  BOOKINGS_FILTER_LABELS,
  BOOKINGS_FILTER_TABS,
  BUYER_PREFIX,
  COUNTER_BACK_BTN,
  COUNTER_OFFER_MODAL,
  COUNTERED_BY_LABEL,
  EMPTY_BOOKINGS_MESSAGE,
  EMPTY_BOOKINGS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  EMPTY_SELLER_BIDS_MESSAGE,
  EMPTY_SELLER_BIDS_TITLE,
  ERROR_ACCEPT_COUNTER_FAILED,
  ERROR_START_CHAT_FAILED,
  MESSAGE_BUYER_BTN,
  // EMPTY_SELLER_OFFERS_MESSAGE,
  // EMPTY_SELLER_OFFERS_TITLE,
  FEE_INCL_PREFIX,
  FEE_SUFFIX,
  SELLER_BIDS_ACCEPTED,
  SELLER_BIDS_BUDGET,
  SELLER_BIDS_DELIVERY,
  SELLER_BIDS_FILTER_ALL,
  SELLER_BIDS_FILTER_REJECTED,
  SELLER_BIDS_PENDING,
  SELLER_BIDS_SUCCESS_RATE,
  SELLER_BIDS_TITLE,
  SELLER_BIDS_TOTAL,
  SELLER_BIDS_YOUR_BID,
  SELLER_BOOKINGS_SEARCH,
  SELLER_BOOKINGS_TITLE,
  SELLER_BOOKINGS_VIEW,
  SELLER_BOOKINGS_ACCEPT,
  SELLER_BOOKINGS_CANCEL,
  SELLER_BOOKINGS_SUBMIT,
  SELLER_BOOKING_ACCEPT_TITLE,
  SELLER_BOOKING_ACCEPT_MESSAGE,
  SELLER_BOOKING_ACCEPT_CONFIRM,
  SELLER_BOOKING_SUBMIT_TITLE,
  SELLER_BOOKING_SUBMIT_MESSAGE,
  SELLER_BOOKING_SUBMIT_CONFIRM,
  SELLER_BOOKING_CANCEL_TITLE,
  SELLER_BOOKING_CANCEL_MESSAGE,
  SELLER_BOOKING_CANCEL_CONFIRM,
  SELLER_BOOKING_DETAIL_MODAL,
  // SELLER_OFFERS_ACCEPT,
  // SELLER_OFFERS_DECLINE,
  // SELLER_OFFER_ACCEPT_MESSAGE,
  // SELLER_OFFER_ACCEPT_TITLE,
  // SELLER_OFFER_DECLINE_MESSAGE,
  // SELLER_OFFER_DECLINE_TITLE,
  BOOKING_REASON_PLACEHOLDER,
  BOOKING_REASON_REQUIRED,
  ERROR_BOOKING_ACTION_FAILED,
  // SELLER_OFFERS_RECEIVED,
  // SELLER_OFFERS_SENT,
  // SELLER_OFFERS_TITLE,
  SELLER_TABS,
  SELLER_WORK_TABS,
  SCREEN_NAMES,
  TAB_SELLER_BOOKINGS_SEGMENT,
  TAB_SELLER_MY_BIDS,
  // TAB_SELLER_OFFERS,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader from '../../components/ScreenHeader';
// import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import CounterOfferModal from '../../components/modal/CounterOfferModal';
import SellerBookingDetailModal from '../../components/modal/SellerBookingDetailModal';
import { selectAuth } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../services/apiClient';
import { createOrGetConversationApi } from '../../services/chatService';
import {
  getSellerBidsApi,
  getSellerBookingsApi,
  getSellerBookingByIdApi,
  acceptSellerBookingApi,
  submitSellerBookingApi,
  cancelSellerBookingApi,
  acceptSellerJobBidApi,
  counterSellerJobBidApi,
} from '../../services/sellerService';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '../../utils';
import { formatAppCurrency, formatAppPrice } from '../../utils/currency';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } = BaseStyle;

const BIDS_PAGE_LIMIT = 20;
const BOOKINGS_PAGE_LIMIT = 20;

const WORK_SEGMENTS = [
  { id: SELLER_WORK_TABS.BIDS, label: TAB_SELLER_MY_BIDS },
  { id: SELLER_WORK_TABS.BOOKINGS, label: TAB_SELLER_BOOKINGS_SEGMENT },
  // Offers tab hidden for now
  // { id: SELLER_WORK_TABS.OFFERS, label: TAB_SELLER_OFFERS },
];

const getBidIcon = status => {
  if (status === 'Accepted') return { name: 'check-circle', color: greenColor, bg: '#E8F8EE' };
  if (status === 'Rejected' || status === 'Withdrawn') return { name: 'x-circle', color: redColor, bg: lightPink };
  if (status === BID_STATUS_COUNTERED) return { name: 'repeat', color: purpleColor, bg: '#F3E8FF' };
  return { name: 'clock', color: goldColor, bg: '#FFF4E5' };
};

const getBookingStatusStyle = status => {
  if (status === 'Ongoing' || status === 'Pending' || status === 'Delivery Submitted' || status === 'Awaiting Acceptance') {
    return { bg: '#E8F0F8', text: blueColor };
  }
  if (status === 'Amidst-Completion-Process') return { bg: '#F3E8FF', text: purpleColor };
  if (status === 'In-dispute') return { bg: '#FFEBEB', text: redColor };
  if (status === 'Completed') return { bg: '#E8F8EE', text: greenColor };
  if (status === 'Cancelled') return { bg: '#F3F4F6', text: grayColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const formatCurrency = amount => formatAppCurrency(amount, { decimals: 2 });

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';

const formatAmount = value => formatAppPrice(value);

const formatBudgetRange = (min, max) => {
  const minStr = formatAmount(min);
  const maxStr = formatAmount(max);
  if (minStr !== '—' && maxStr !== '—') return `${minStr} - ${maxStr}`;
  if (minStr !== '—') return minStr;
  if (maxStr !== '—') return maxStr;
  return '—';
};

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
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const capitalizeTitle = value => {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const mapBidStatusToUi = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'accepted') return 'Accepted';
  if (normalized === 'rejected') return 'Rejected';
  if (normalized === 'withdrawn') return 'Withdrawn';
  if (normalized.includes('counter')) return BID_STATUS_COUNTERED;
  return 'Pending';
};

const extractBidsList = response => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.bids)) return response.bids;
  return [];
};

const extractPagination = response => response?.pagination || response?.data?.pagination || null;

const resolveHasMore = (response, page, listLength, pageLimit = BIDS_PAGE_LIMIT) => {
  const pagination = extractPagination(response);
  const totalPages =
    pagination?.pages ?? pagination?.totalPages ?? pagination?.total_pages ?? null;
  const currentPage = pagination?.page ?? page;

  if (totalPages != null) {
    return Number(currentPage) < Number(totalPages);
  }

  return listLength >= pageLimit;
};

const mapApiBookingStatusToUi = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'ongoing' || normalized === 'active' || normalized === 'in_progress') {
    return 'Ongoing';
  }
  if (normalized === 'amidst_completion_process' || normalized === 'amidst_completion') {
    return 'Amidst-Completion-Process';
  }
  if (normalized === 'delivery_submitted') return 'Delivery Submitted';
  if (normalized === 'awaiting_acceptance') return 'Awaiting Acceptance';
  if (normalized === 'in_dispute' || normalized === 'disputed') return 'In-dispute';
  if (normalized === 'completed') return 'Completed';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled';
  if (!normalized) return '—';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, ' ');
};

const formatBookingDate = dateStr => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const extractBookingsList = response => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.bookings)) return response.bookings;
  return [];
};

const mapApiBookingToUi = booking => {
  const buyer = booking?.buyer || {};
  const buyerName = buyer.name || booking?.buyer_name || 'Buyer';
  const title =
    booking?.title ||
    booking?.service?.title ||
    booking?.job?.title ||
    'Booking';
  const amount = Number(booking.amount ?? booking.total ?? 0) || 0;
  const fee = Number(booking.platform_fee ?? booking.fee ?? 0) || 0;
  const deliveryDays = booking.delivery_days ?? booking.deliveryDays ?? null;
  const images = booking?.service?.images;
  const serviceImage =
    (Array.isArray(images) && images.find(Boolean)) ||
    booking?.service_image ||
    booking?.serviceImage ||
    null;

  return {
    id: String(booking.id),
    buyerId: buyer.id ?? booking?.buyer_id ?? null,
    title: capitalizeTitle(title),
    client: buyerName,
    clientInitials: getInitials(buyerName),
    buyerName,
    buyerInitials: getInitials(buyerName),
    date: formatBookingDate(booking.createdAt || booking.created_at),
    total: amount,
    fee,
    amountDisplay: formatAppCurrency(amount, { decimals: 2 }),
    feeDisplay: fee > 0 ? formatAppCurrency(fee, { decimals: 2 }) : '',
    serviceTitle: booking?.service?.title || booking?.title || title || '—',
    delivery: deliveryDays != null ? `${deliveryDays} days` : '—',
    notes: booking.notes || '',
    cancelReason: booking.cancel_reason || booking.cancelReason || '',
    disputeReason: booking.dispute_reason || booking.disputeReason || '',
    serviceImage,
    status: mapApiBookingStatusToUi(booking.status),
    apiStatus: String(booking.status || '')
      .trim()
      .toLowerCase()
      .replace(/-/g, '_'),
    raw: booking,
  };
};

const mapApiBidToUi = bid => {
  const job = bid?.job || {};
  const buyerName = job?.buyer?.name || 'Buyer';
  const status = String(bid.status || '').trim().toLowerCase();
  const counterNote = bid.counter_note || bid.note || bid.counter_offer?.note || '';

  return {
    id: String(bid.id),
    jobId: String(job.id || bid.job_id || ''),
    title: capitalizeTitle(job.title),
    client: buyerName,
    time: formatPosted(bid.createdAt || bid.created_at || job.created_at),
    yourBid: formatAmount(bid.amount),
    budget: formatBudgetRange(job.budget_min, job.budget_max),
    delivery: bid.delivery_days != null ? `${bid.delivery_days} days` : '—',
    totalBids: Number(job.bids_count ?? 0) || 0,
    proposal: bid.proposal || '',
    status: mapBidStatusToUi(bid.status),
    isCountered: status.includes('counter'),
    counterNote,
    raw: bid,
  };
};

const SellerWorkScreen = ({ navigation, route }) => {
  const { token } = useSelector(selectAuth);
  const bidsFetchingRef = useRef(false);
  const hasMoreBidsRef = useRef(true);
  const bidsPageRef = useRef(1);
  const bookingsFetchingRef = useRef(false);
  const hasMoreBookingsRef = useRef(true);
  const bookingsPageRef = useRef(1);
  const [activeTab, setActiveTab] = useState(SELLER_WORK_TABS.BIDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [bidFilter, setBidFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState(BOOKINGS_FILTER_TABS.ACTIVE);
  // const [offerSubTab, setOfferSubTab] = useState('received');
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    actionType: '',
    targetId: null,
    title: '',
    message: '',
    confirmColor: redColor,
    iconName: 'alert-circle',
    confirmText: 'Yes',
    showReasonInput: false,
    reason: '',
    reasonError: '',
  });
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [startingChatBookingId, setStartingChatBookingId] = useState(null);

  const handleMessageBookingBuyer = useCallback(
    async booking => {
      if (!token || !booking?.buyerId || startingChatBookingId) return;

      setStartingChatBookingId(booking.id);
      try {
        const response = await createOrGetConversationApi(token, booking.buyerId);
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
              otherUser: {
                id: booking.buyerId,
                name: booking.buyerName,
                initials: booking.buyerInitials,
                avatarColor: redColor,
              },
            },
          });
        }, 0);
      } catch (error) {
        Alert.alert('', getApiErrorMessage(error?.data, error?.message || ERROR_START_CHAT_FAILED));
      } finally {
        setStartingChatBookingId(null);
      }
    },
    [token, startingChatBookingId, navigation],
  );
  const [bookingDetailModal, setBookingDetailModal] = useState({
    visible: false,
    loading: false,
    booking: null,
    error: '',
  });
  const [counterModal, setCounterModal] = useState({ visible: false, bid: null, loading: false, error: '' });

  const [bids, setBids] = useState([]);
  const [bidStats, setBidStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    successRate: '0%',
  });
  const [isBidsInitialLoading, setIsBidsInitialLoading] = useState(false);
  const [isBidsLoadingMore, setIsBidsLoadingMore] = useState(false);
  const [expandedProposalIds, setExpandedProposalIds] = useState({});

  const toggleProposalExpand = bidId => {
    setExpandedProposalIds(prev => ({
      ...prev,
      [bidId]: !prev[bidId],
    }));
  };

  const [bookings, setBookings] = useState([]);
  const [isBookingsInitialLoading, setIsBookingsInitialLoading] = useState(false);
  const [isBookingsLoadingMore, setIsBookingsLoadingMore] = useState(false);

  // Offers flow commented for now
  // const [offers, setOffers] = useState({
  //   received: [
  //     {
  //       id: '1',
  //       client: 'Alice Johnson',
  //       initials: 'AJ',
  //       project: 'Logo Design for Tech Startup',
  //       message: 'Hi, I love your portfolio. Would you be interested in working on our logo project?',
  //       amount: '$23,240',
  //       status: 'Pending',
  //     },
  //     {
  //       id: '2',
  //       client: 'Carol Reed',
  //       initials: 'CR',
  //       project: 'Brand Identity Package',
  //       message: 'We would like to offer you this project based on your previous work quality.',
  //       amount: '$41,500',
  //       status: 'Pending',
  //     },
  //   ],
  //   sent: [
  //     {
  //       id: '3',
  //       client: 'Bob Smith',
  //       initials: 'BS',
  //       project: 'Website Redesign',
  //       message: 'I can deliver a modern responsive website within your timeline and budget.',
  //       amount: '$58,100',
  //       status: 'Pending',
  //     },
  //   ],
  // });

  useFocusEffect(
    useCallback(() => {
      const { initialTab } = route.params || {};
      // Offers tab hidden — ignore offer initialTab
      if (initialTab && initialTab !== SELLER_WORK_TABS.OFFERS) {
        setActiveTab(initialTab);
        navigation.setParams({ initialTab: undefined });
      } else if (initialTab === SELLER_WORK_TABS.OFFERS) {
        navigation.setParams({ initialTab: undefined });
      }
    }, [route.params, navigation]),
  );

  const fetchSellerBids = useCallback(
    async (page = 1, { isLoadMore = false } = {}) => {
      if (!token || bidsFetchingRef.current) return;
      if (isLoadMore && !hasMoreBidsRef.current) return;

      bidsFetchingRef.current = true;
      if (isLoadMore) {
        setIsBidsLoadingMore(true);
      } else {
        setIsBidsInitialLoading(true);
      }

      try {
        const response = await getSellerBidsApi(token, {
          page,
          limit: BIDS_PAGE_LIMIT,
          status: bidFilter !== 'all' ? bidFilter : undefined,
        });
        const list = extractBidsList(response);
        const mapped = list.map(mapApiBidToUi);
        const nextHasMore = resolveHasMore(response, page, list.length);
        const stats = response?.stats || {};

        setBids(prev => (isLoadMore ? [...prev, ...mapped] : mapped));
        if (!isLoadMore) {
          setBidStats({
            total: Number(stats.total ?? mapped.length) || 0,
            pending: Number(stats.pending ?? 0) || 0,
            accepted: Number(stats.accepted ?? 0) || 0,
            successRate: `${Number(stats.success_rate ?? 0) || 0}%`,
          });
        }

        bidsPageRef.current = page;
        hasMoreBidsRef.current = nextHasMore;
      } catch (error) {
        if (!isLoadMore) {
          setBids([]);
          setBidStats({ total: 0, pending: 0, accepted: 0, successRate: '0%' });
        }
      } finally {
        bidsFetchingRef.current = false;
        setIsBidsInitialLoading(false);
        setIsBidsLoadingMore(false);
      }
    },
    [token, bidFilter],
  );

  const handleLoadMoreBids = useCallback(() => {
    if (activeTab !== SELLER_WORK_TABS.BIDS) return;
    if (isBidsInitialLoading || isBidsLoadingMore || !hasMoreBidsRef.current) return;
    fetchSellerBids(bidsPageRef.current + 1, { isLoadMore: true });
  }, [activeTab, isBidsInitialLoading, isBidsLoadingMore, fetchSellerBids]);

  const fetchSellerBookings = useCallback(
    async (page = 1, { isLoadMore = false } = {}) => {
      if (!token || bookingsFetchingRef.current) return;
      if (isLoadMore && !hasMoreBookingsRef.current) return;

      bookingsFetchingRef.current = true;
      if (isLoadMore) {
        setIsBookingsLoadingMore(true);
      } else {
        setIsBookingsInitialLoading(true);
      }

      try {
        const response = await getSellerBookingsApi(token, {
          tab: bookingFilter,
          page,
          limit: BOOKINGS_PAGE_LIMIT,
        });
        const list = extractBookingsList(response);
        const mapped = list.map(mapApiBookingToUi);
        const nextHasMore = resolveHasMore(response, page, list.length, BOOKINGS_PAGE_LIMIT);

        setBookings(prev => (isLoadMore ? [...prev, ...mapped] : mapped));
        bookingsPageRef.current = page;
        hasMoreBookingsRef.current = nextHasMore;
      } catch (error) {
        if (!isLoadMore) setBookings([]);
      } finally {
        bookingsFetchingRef.current = false;
        setIsBookingsInitialLoading(false);
        setIsBookingsLoadingMore(false);
      }
    },
    [token, bookingFilter],
  );

  const handleLoadMoreBookings = useCallback(() => {
    if (activeTab !== SELLER_WORK_TABS.BOOKINGS) return;
    if (isBookingsInitialLoading || isBookingsLoadingMore || !hasMoreBookingsRef.current) return;
    fetchSellerBookings(bookingsPageRef.current + 1, { isLoadMore: true });
  }, [activeTab, isBookingsInitialLoading, isBookingsLoadingMore, fetchSellerBookings]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab !== SELLER_WORK_TABS.BIDS) return;

      hasMoreBidsRef.current = true;
      bidsPageRef.current = 1;
      fetchSellerBids(1, { isLoadMore: false });
    }, [activeTab, fetchSellerBids]),
  );

  useFocusEffect(
    useCallback(() => {
      if (activeTab !== SELLER_WORK_TABS.BOOKINGS) return;

      hasMoreBookingsRef.current = true;
      bookingsPageRef.current = 1;
      fetchSellerBookings(1, { isLoadMore: false });
    }, [activeTab, fetchSellerBookings]),
  );

  const screenTitle = useMemo(() => {
    if (activeTab === SELLER_WORK_TABS.BIDS) return SELLER_BIDS_TITLE;
    if (activeTab === SELLER_WORK_TABS.BOOKINGS) return SELLER_BOOKINGS_TITLE;
    // return SELLER_OFFERS_TITLE;
    return SELLER_BIDS_TITLE;
  }, [activeTab]);

  const searchPlaceholder = useMemo(() => {
    if (activeTab === SELLER_WORK_TABS.BOOKINGS) return SELLER_BOOKINGS_SEARCH;
    return 'Search...';
  }, [activeTab]);

  const filteredBids = useMemo(() => {
    // Status filter is handled by API; only apply local search
    if (!searchQuery.trim()) return bids;
    const q = searchQuery.trim().toLowerCase();
    return bids.filter(b => b.title.toLowerCase().includes(q) || b.client.toLowerCase().includes(q));
  }, [bids, searchQuery]);

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter(
      b => b.title.toLowerCase().includes(q) || b.client.toLowerCase().includes(q),
    );
  }, [bookings, searchQuery]);

  // const activeOffers = offerSubTab === 'received' ? offers.received : offers.sent;

  const openConfirmModal = (actionType, targetId) => {
    const configs = {
      // Offers flow commented for now
      // acceptOffer: {
      //   title: SELLER_OFFER_ACCEPT_TITLE,
      //   message: SELLER_OFFER_ACCEPT_MESSAGE,
      //   confirmColor: greenColor,
      //   iconName: 'check-circle',
      //   confirmText: SELLER_OFFERS_ACCEPT,
      //   showReasonInput: false,
      // },
      // declineOffer: {
      //   title: SELLER_OFFER_DECLINE_TITLE,
      //   message: SELLER_OFFER_DECLINE_MESSAGE,
      //   confirmColor: redColor,
      //   iconName: 'x-circle',
      //   confirmText: SELLER_OFFERS_DECLINE,
      //   showReasonInput: false,
      // },
      acceptBooking: {
        title: SELLER_BOOKING_ACCEPT_TITLE,
        message: SELLER_BOOKING_ACCEPT_MESSAGE,
        confirmColor: greenColor,
        iconName: 'check-circle',
        confirmText: SELLER_BOOKING_ACCEPT_CONFIRM,
        showReasonInput: false,
      },
      submitBooking: {
        title: SELLER_BOOKING_SUBMIT_TITLE,
        message: SELLER_BOOKING_SUBMIT_MESSAGE,
        confirmColor: greenColor,
        iconName: 'upload',
        confirmText: SELLER_BOOKING_SUBMIT_CONFIRM,
        showReasonInput: false,
      },
      cancelBooking: {
        title: SELLER_BOOKING_CANCEL_TITLE,
        message: SELLER_BOOKING_CANCEL_MESSAGE,
        confirmColor: '#C27803',
        iconName: 'alert-circle',
        confirmText: SELLER_BOOKING_CANCEL_CONFIRM,
        showReasonInput: true,
      },
      acceptCounterBid: {
        title: ACCEPT_COUNTER_OFFER_TITLE,
        message: ACCEPT_COUNTER_OFFER_MESSAGE,
        confirmColor: greenColor,
        iconName: 'check-circle',
        confirmText: ACCEPT_COUNTER_OFFER_CONFIRM_BTN,
        showReasonInput: false,
      },
    };
    const config = configs[actionType];
    if (!config) return;
    setConfirmModal({
      visible: true,
      actionType,
      targetId,
      title: config.title,
      message: config.message,
      confirmColor: config.confirmColor,
      iconName: config.iconName,
      confirmText: config.confirmText,
      showReasonInput: config.showReasonInput,
      reason: '',
      reasonError: '',
    });
  };

  const closeConfirmModal = () => {
    if (isConfirmingAction) return;
    setConfirmModal(prev => ({
      ...prev,
      visible: false,
      reason: '',
      reasonError: '',
    }));
  };

  const closeBookingDetailModal = () => {
    setBookingDetailModal({ visible: false, loading: false, booking: null, error: '' });
  };

  const handleViewBooking = async booking => {
    if (!token || !booking?.id || bookingDetailModal.loading) return;

    setBookingDetailModal({ visible: true, loading: true, booking: null, error: '' });

    try {
      const response = await getSellerBookingByIdApi(token, booking.id);
      const detail = response?.data || response;
      setBookingDetailModal({
        visible: true,
        loading: false,
        booking: mapApiBookingToUi(detail),
        error: '',
      });
    } catch (error) {
      const fallback = booking.raw || booking;
      setBookingDetailModal({
        visible: true,
        loading: false,
        booking: mapApiBookingToUi(fallback),
        error: getApiErrorMessage(
          error?.data,
          error?.message || SELLER_BOOKING_DETAIL_MODAL.loadError,
        ),
      });
    }
  };

  const handleConfirmAction = async () => {
    const { actionType, targetId, reason, showReasonInput } = confirmModal;
    if (!targetId || isConfirmingAction) {
      if (!targetId) closeConfirmModal();
      return;
    }

    if (showReasonInput && !String(reason || '').trim()) {
      setConfirmModal(prev => ({ ...prev, reasonError: BOOKING_REASON_REQUIRED }));
      return;
    }

    // Offers flow commented for now
    // if (actionType === 'acceptOffer' || actionType === 'declineOffer') {
    //   const newStatus = actionType === 'acceptOffer' ? 'Accepted' : 'Declined';
    //   setOffers(prev => ({
    //     ...prev,
    //     received: prev.received.map(offer =>
    //       offer.id === targetId ? { ...offer, status: newStatus } : offer,
    //     ),
    //   }));
    //   closeConfirmModal();
    //   return;
    // }

    if (!token) {
      Alert.alert(confirmModal.title, ERROR_BOOKING_ACTION_FAILED);
      return;
    }

    setIsConfirmingAction(true);
    try {
      if (actionType === 'acceptBooking') {
        await acceptSellerBookingApi(token, targetId);
      } else if (actionType === 'submitBooking') {
        await submitSellerBookingApi(token, targetId);
      } else if (actionType === 'cancelBooking') {
        await cancelSellerBookingApi(token, targetId, reason);
      } else if (actionType === 'acceptCounterBid') {
        await acceptSellerJobBidApi(token, targetId);
      }

      setConfirmModal(prev => ({
        ...prev,
        visible: false,
        reason: '',
        reasonError: '',
      }));

      if (actionType === 'acceptCounterBid') {
        hasMoreBidsRef.current = true;
        bidsPageRef.current = 1;
        await fetchSellerBids(1, { isLoadMore: false });
      } else {
        hasMoreBookingsRef.current = true;
        bookingsPageRef.current = 1;
        await fetchSellerBookings(1, { isLoadMore: false });
      }
    } catch (error) {
      Alert.alert(
        confirmModal.title,
        getApiErrorMessage(
          error?.data,
          error?.message ||
            (actionType === 'acceptCounterBid' ? ERROR_ACCEPT_COUNTER_FAILED : ERROR_BOOKING_ACTION_FAILED),
        ),
      );
    } finally {
      setIsConfirmingAction(false);
    }
  };

  const openCounterModal = bid => {
    if (!bid?.jobId || isConfirmingAction) return;
    setCounterModal({ visible: true, bid, loading: false, error: '' });
  };

  const closeCounterModal = () => {
    if (counterModal.loading) return;
    setCounterModal({ visible: false, bid: null, loading: false, error: '' });
  };

  const handleSubmitCounterBack = async form => {
    const bid = counterModal.bid;
    if (!bid?.jobId || !token || counterModal.loading) return;

    setCounterModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await counterSellerJobBidApi(token, bid.jobId, form);
      setCounterModal({ visible: false, bid: null, loading: false, error: '' });
      hasMoreBidsRef.current = true;
      bidsPageRef.current = 1;
      await fetchSellerBids(1, { isLoadMore: false });
    } catch (error) {
      setCounterModal(prev => ({
        ...prev,
        loading: false,
        error: getApiErrorMessage(error?.data, error?.message || COUNTER_OFFER_MODAL.submitError),
      }));
    }
  };

  const renderBidStats = () => (
    <View style={[styles.statsRow, flexDirectionRow]}>
      {[
        { label: SELLER_BIDS_TOTAL, value: bidStats.total, icon: 'briefcase', color: blueColor },
        { label: SELLER_BIDS_PENDING, value: bidStats.pending, icon: 'clock', color: goldColor },
        { label: SELLER_BIDS_ACCEPTED, value: bidStats.accepted, icon: 'check-circle', color: greenColor },
        { label: SELLER_BIDS_SUCCESS_RATE, value: bidStats.successRate, icon: 'trending-up', color: redColor },
      ].map(item => (
        <View key={item.label} style={styles.statCard}>
          <View style={[styles.statIcon, alignJustifyCenter, { backgroundColor: `${item.color}18` }]}>
            <Icon name={item.icon} size={14} color={item.color} />
          </View>
          <Text style={[styles.statValue, style.fontWeightMedium]}>{item.value}</Text>
          <Text style={[styles.statLabel, style.fontWeightThin]} numberOfLines={2}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBidFilters = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {[
        { id: 'all', label: SELLER_BIDS_FILTER_ALL },
        { id: 'pending', label: `${SELLER_BIDS_PENDING} (${bidStats.pending})` },
        { id: 'accepted', label: `${SELLER_BIDS_ACCEPTED} (${bidStats.accepted})` },
        { id: 'rejected', label: SELLER_BIDS_FILTER_REJECTED },
      ].map(f => (
        <TouchableOpacity
          key={f.id}
          style={[styles.filterChip, bidFilter === f.id && styles.filterChipActive]}
          onPress={() => {
            if (bidFilter === f.id) return;
            setBidFilter(f.id);
            hasMoreBidsRef.current = true;
            bidsPageRef.current = 1;
          }}>
          <Text style={[styles.filterText, style.fontWeightMedium, bidFilter === f.id && styles.filterTextActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBidCard = ({ item: bid }) => {
    const iconStyle = getBidIcon(bid.status);
    const metrics = [
      { label: SELLER_BIDS_YOUR_BID, value: bid.yourBid, highlight: true },
      { label: SELLER_BIDS_BUDGET, value: bid.budget },
      { label: SELLER_BIDS_DELIVERY, value: bid.delivery },
      { label: 'Total Bids', value: `${bid.totalBids}` },
    ];

    return (
      <View style={styles.bidCard}>
        <View style={[styles.bidTop, flexDirectionRow, alignItemsCenter]}>
          <View style={[styles.bidStatusIcon, alignJustifyCenter, { backgroundColor: iconStyle.bg }]}>
            <Icon name={iconStyle.name} size={18} color={iconStyle.color} />
          </View>
          <View style={styles.bidInfo}>
            <Text style={[styles.bidTitle, style.fontWeightMedium]} numberOfLines={2}>
              {bid.title}
            </Text>
            <Text style={[styles.bidMeta, style.fontWeightThin]} numberOfLines={1}>
              {bid.client} · {bid.time}
            </Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: iconStyle.bg }]}>
            <Text style={[styles.statusText, style.fontWeightMedium, { color: iconStyle.color }]}>
              {bid.status}
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((m, index) => (
            <View
              key={m.label}
              style={[
                styles.metricItem,
                index % 2 === 0 && styles.metricItemLeft,
                index < 2 && styles.metricItemTop,
              ]}>
              <Text style={[styles.metricLabel, style.fontWeightThin]}>{m.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  style.fontWeightMedium,
                  m.highlight && styles.metricValueHighlight,
                ]}
                numberOfLines={1}>
                {m.value}
              </Text>
            </View>
          ))}
        </View>

        {bid.proposal ? (
          <TouchableOpacity
            style={styles.proposalWrap}
            activeOpacity={0.7}
            onPress={() => toggleProposalExpand(bid.id)}>
            <Text style={[styles.proposalLabel, style.fontWeightMedium]}>Proposal</Text>
            <Text
              style={[styles.proposal, style.fontWeightThin]}
              numberOfLines={expandedProposalIds[bid.id] ? undefined : 2}>
              {bid.proposal}
            </Text>
            {String(bid.proposal).length > 80 || expandedProposalIds[bid.id] ? (
              <Text style={[styles.proposalToggle, style.fontWeightMedium]}>
                {expandedProposalIds[bid.id] ? 'See less' : 'See more'}
              </Text>
            ) : null}
          </TouchableOpacity>
        ) : null}

        {bid.isCountered ? (
          <>
            {bid.counterNote ? (
              <View style={styles.counterNoteWrap}>
                <Text style={[styles.counterNoteLabel, style.fontWeightMedium]}>{COUNTERED_BY_LABEL}</Text>
                <Text style={[styles.counterNoteText, style.fontWeightThin]} numberOfLines={3}>
                  {bid.counterNote}
                </Text>
              </View>
            ) : null}
            <View style={[styles.bidActionsRow, flexDirectionRow, alignItemsCenter]}>
              <TouchableOpacity
                style={[styles.counterBackBtn, styles.actionBtnFlex, alignJustifyCenter, flexDirectionRow]}
                onPress={() => openCounterModal(bid)}
                disabled={isConfirmingAction}
                activeOpacity={0.7}>
                <Icon name="repeat" size={13} color={purpleColor} />
                <Text
                  style={[styles.counterBackBtnText, style.fontWeightMedium]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}>
                  {COUNTER_BACK_BTN}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptCounterBtn, styles.actionBtnFlex, alignJustifyCenter, flexDirectionRow]}
                onPress={() => openConfirmModal('acceptCounterBid', bid.jobId)}
                disabled={isConfirmingAction}
                activeOpacity={0.7}>
                <Icon name="check" size={13} color={whiteColor} />
                <Text
                  style={[styles.acceptCounterBtnText, style.fontWeightMedium]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}>
                  {ACCEPT_COUNTER_BTN}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>
    );
  };

  const renderBidsFooter = () => {
    if (!isBidsLoadingMore) return null;
    return (
      <View style={styles.listLoader}>
        <ActivityIndicator size="small" color={redColor} />
      </View>
    );
  };

  const renderBidsEmpty = () => {
    if (isBidsInitialLoading) {
      return (
        <View style={styles.listLoader}>
          <ActivityIndicator size="small" color={redColor} />
        </View>
      );
    }
    return (
      <EmptyState
        icon="file-text"
        title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_SELLER_BIDS_TITLE}
        message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_SELLER_BIDS_MESSAGE}
        compact
      />
    );
  };

  const renderBids = () => (
    <>
      <View style={styles.bidsFixedSection}>
        {renderBidStats()}
        {renderBidFilters()}
      </View>
      <FlatList
        style={flex}
        data={filteredBids}
        keyExtractor={item => String(item.id)}
        renderItem={renderBidCard}
        ListFooterComponent={renderBidsFooter}
        ListEmptyComponent={renderBidsEmpty}
        onEndReached={handleLoadMoreBids}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bidsListContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      />
    </>
  );

  const renderBookingFilters = () => (
    <View style={[styles.filterRow, flexDirectionRow]}>
      {Object.values(BOOKINGS_FILTER_TABS).map(key => (
        <TouchableOpacity
          key={key}
          style={[styles.filterTab, alignJustifyCenter, bookingFilter === key && styles.filterTabActive]}
          onPress={() => {
            if (bookingFilter === key) return;
            setBookingFilter(key);
            hasMoreBookingsRef.current = true;
            bookingsPageRef.current = 1;
          }}>
          <Text
            style={[
              styles.filterTabText,
              style.fontWeightMedium,
              bookingFilter === key && styles.filterTabTextActive,
            ]}>
            {BOOKINGS_FILTER_LABELS[key.toUpperCase()]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSellerBookingActions = booking => {
    const status = booking.status;
    const isPending = status === 'Pending';
    const isOngoing = status === 'Ongoing';

    return (
      <View style={[flexDirectionRow, styles.sellerBookingActionGroup]}>
        <TouchableOpacity
          style={[styles.sellerDetailsBtn, flexDirectionRow, alignItemsCenter]}
          onPress={() => handleViewBooking(booking)}>
          <Icon name="eye" size={14} color={blackColor} />
          <Text style={[styles.sellerDetailsText, style.fontWeightMedium]}>{SELLER_BOOKINGS_VIEW}</Text>
        </TouchableOpacity>

        {isPending ? (
          <>
            <TouchableOpacity
              style={[styles.sellerCompleteBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() => openConfirmModal('acceptBooking', booking.id)}>
              <Icon name="check" size={14} color={whiteColor} />
              <Text style={[styles.sellerCompleteText, style.fontWeightMedium]}>
                {SELLER_BOOKINGS_ACCEPT}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sellerDisputeBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() => openConfirmModal('cancelBooking', booking.id)}>
              <Icon name="x" size={14} color="#C27803" />
              <Text style={[styles.sellerDisputeText, style.fontWeightMedium]}>
                {SELLER_BOOKINGS_CANCEL}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}

        {isOngoing ? (
          <TouchableOpacity
            style={[styles.sellerCompleteBtn, flexDirectionRow, alignItemsCenter]}
            onPress={() => openConfirmModal('submitBooking', booking.id)}>
            <Icon name="upload" size={14} color={whiteColor} />
            <Text style={[styles.sellerCompleteText, style.fontWeightMedium]}>
              {SELLER_BOOKINGS_SUBMIT}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderBookingCard = ({ item: booking }) => {
    const statusStyle = getBookingStatusStyle(booking.status);

    return (
      <View style={styles.sellerBookingCard}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleViewBooking(booking)}>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <View style={[styles.buyerAvatar, alignJustifyCenter]}>
              <Text style={[styles.buyerAvatarText, style.fontWeightMedium]}>{booking.clientInitials}</Text>
            </View>
            <View style={styles.sellerBookingInfo}>
              <Text style={[styles.sellerBookingTitle, style.fontWeightMedium]} numberOfLines={2}>
                {booking.title}
              </Text>
              <Text style={[styles.buyerName, style.fontWeightThin]}>
                {BUYER_PREFIX} {booking.client}
              </Text>
              <Text style={styles.sellerBookingDate}>{booking.date}</Text>
            </View>
            <View style={styles.sellerBookingPriceWrap}>
              <Text style={[styles.sellerBookingPrice, style.fontWeightMedium]}>{formatCurrency(booking.total)}</Text>
              {booking.fee > 0 ? (
                <Text style={styles.sellerBookingFee}>
                  {FEE_INCL_PREFIX} {formatCurrency(booking.fee)} {FEE_SUFFIX}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookingMessageBtn, alignJustifyCenter, flexDirectionRow]}
          onPress={() => handleMessageBookingBuyer(booking)}
          disabled={!booking.buyerId || Boolean(startingChatBookingId)}
          activeOpacity={0.7}>
          {startingChatBookingId === booking.id ? (
            <ActivityIndicator size="small" color={redColor} />
          ) : (
            <>
              <Icon name="message-circle" size={14} color={redColor} />
              <Text style={[styles.bookingMessageBtnText, style.fontWeightMedium]}>{MESSAGE_BUYER_BTN}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={[styles.sellerBookingFooter, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{booking.status}</Text>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter, styles.sellerBookingActions]}>
            {renderSellerBookingActions(booking)}
          </View>
        </View>
      </View>
    );
  };

  const renderBookingsFooter = () => {
    if (!isBookingsLoadingMore) return null;
    return (
      <View style={styles.listLoader}>
        <ActivityIndicator size="small" color={redColor} />
      </View>
    );
  };

  const renderBookingsEmpty = () => {
    if (isBookingsInitialLoading) {
      return (
        <View style={styles.listLoader}>
          <ActivityIndicator size="small" color={redColor} />
        </View>
      );
    }
    return (
      <EmptyState
        icon="calendar"
        title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_BOOKINGS_TITLE}
        message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_BOOKINGS_MESSAGE}
      />
    );
  };

  const renderBookings = () => (
    <>
      <View style={styles.bidsFixedSection}>{renderBookingFilters()}</View>
      <FlatList
        style={flex}
        data={filteredBookings}
        keyExtractor={item => String(item.id)}
        renderItem={renderBookingCard}
        ListFooterComponent={renderBookingsFooter}
        ListEmptyComponent={renderBookingsEmpty}
        onEndReached={handleLoadMoreBookings}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bidsListContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      />
    </>
  );

  // Offers flow commented for now
  // const renderOffers = () => (
  //   <>
  //     <View style={[styles.filterRow, flexDirectionRow]}>
  //       <TouchableOpacity
  //         style={[styles.filterTab, alignJustifyCenter, offerSubTab === 'received' && styles.filterTabActive]}
  //         onPress={() => setOfferSubTab('received')}>
  //         <Text
  //           style={[
  //             styles.filterTabText,
  //             style.fontWeightMedium,
  //             offerSubTab === 'received' && styles.filterTabTextActive,
  //           ]}>
  //           {SELLER_OFFERS_RECEIVED}
  //         </Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={[styles.filterTab, alignJustifyCenter, offerSubTab === 'sent' && styles.filterTabActive]}
  //         onPress={() => setOfferSubTab('sent')}>
  //         <Text
  //           style={[
  //             styles.filterTabText,
  //             style.fontWeightMedium,
  //             offerSubTab === 'sent' && styles.filterTabTextActive,
  //           ]}>
  //           {SELLER_OFFERS_SENT}
  //         </Text>
  //       </TouchableOpacity>
  //     </View>
  //     <View style={styles.listCard}>
  //       {activeOffers.length === 0 ? (
  //         <EmptyState icon="tag" title={EMPTY_SELLER_OFFERS_TITLE} message={EMPTY_SELLER_OFFERS_MESSAGE} compact />
  //       ) : (
  //         activeOffers.map((offer, index) => (
  //           <View key={offer.id} style={[styles.offerCard, index < activeOffers.length - 1 && styles.rowBorder]}>
  //             <View style={[flexDirectionRow, alignItemsCenter, styles.offerTop]}>
  //               <View style={[styles.clientAvatar, alignJustifyCenter]}>
  //                 <Text style={[styles.clientInitials, style.fontWeightMedium]}>{offer.initials}</Text>
  //               </View>
  //               <View style={styles.offerInfo}>
  //                 <Text style={[styles.offerClient, style.fontWeightMedium]}>{offer.client}</Text>
  //                 <Text style={[styles.offerProject, style.fontWeightThin]}>Re: {offer.project}</Text>
  //               </View>
  //               <Text style={[styles.offerAmount, style.fontWeightMedium]}>{offer.amount}</Text>
  //             </View>
  //             <Text style={[styles.offerMessage, style.fontWeightThin]} numberOfLines={2}>
  //               {offer.message}
  //             </Text>
  //             {offerSubTab === 'received' && offer.status === 'Pending' ? (
  //               <View style={[styles.offerActions, flexDirectionRow]}>
  //                 <TouchableOpacity
  //                   style={[styles.declineBtn, flex]}
  //                   onPress={() => openConfirmModal('declineOffer', offer.id)}>
  //                   <Text style={[styles.declineText, style.fontWeightMedium]}>{SELLER_OFFERS_DECLINE}</Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={[styles.acceptBtn, flex]}
  //                   onPress={() => openConfirmModal('acceptOffer', offer.id)}>
  //                   <Text style={[styles.acceptText, style.fontWeightMedium]}>{SELLER_OFFERS_ACCEPT}</Text>
  //                 </TouchableOpacity>
  //               </View>
  //             ) : null}
  //           </View>
  //         ))
  //       )}
  //     </View>
  //   </>
  // );

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.fixedHeader}>
        <ScreenHeader title={screenTitle} navigation={navigation} />

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={searchPlaceholder} />

        <View style={[styles.tabRow, flexDirectionRow]}>
          {WORK_SEGMENTS.map(segment => {
            const isActive = activeTab === segment.id;
            return (
              <TouchableOpacity
                key={segment.id}
                style={[styles.tab, alignJustifyCenter, isActive && styles.tabActive]}
                onPress={() => {
                  setActiveTab(segment.id);
                  setSearchQuery('');
                }}>
                <Text style={[styles.tabText, style.fontWeightMedium, isActive && styles.tabTextActive]}>
                  {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {activeTab === SELLER_WORK_TABS.BIDS ? (
        <View style={flex}>{renderBids()}</View>
      ) : (
        <View style={flex}>{renderBookings()}</View>
      )}
      {/* Offers tab commented for now
      {activeTab === SELLER_WORK_TABS.BIDS ? (
        <View style={flex}>{renderBids()}</View>
      ) : activeTab === SELLER_WORK_TABS.BOOKINGS ? (
        <View style={flex}>{renderBookings()}</View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={screenContentStyles.scrollContent}
          bounces={false}>
          {renderOffers()}
        </ScrollView>
      )}
      */}

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        iconName={confirmModal.iconName}
        showReasonInput={confirmModal.showReasonInput}
        reasonValue={confirmModal.reason}
        onReasonChange={text =>
          setConfirmModal(prev => ({ ...prev, reason: text, reasonError: '' }))
        }
        reasonPlaceholder={BOOKING_REASON_PLACEHOLDER}
        reasonError={confirmModal.reasonError}
        loading={isConfirmingAction}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmModal}
      />

      <SellerBookingDetailModal
        visible={bookingDetailModal.visible}
        loading={bookingDetailModal.loading}
        error={bookingDetailModal.error}
        booking={bookingDetailModal.booking}
        onClose={closeBookingDetailModal}
      />

      <CounterOfferModal
        visible={counterModal.visible}
        job={counterModal.bid ? { title: counterModal.bid.title } : null}
        title={COUNTER_OFFER_MODAL.title}
        submitLabel={COUNTER_OFFER_MODAL.submit}
        loading={counterModal.loading}
        error={counterModal.error}
        onClose={closeCounterModal}
        onSubmit={handleSubmitCounterBack}
      />
    </SafeAreaView>
  );
};

export default SellerWorkScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  fixedHeader: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  bidsFixedSection: {
    paddingHorizontal: wp(5),
  },
  bidsListContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    flexGrow: 1,
  },
  listLoader: {
    paddingVertical: hp(3),
    alignItems: 'center',
  },
  tabRow: {
    backgroundColor: whiteColor,
    borderRadius: 10,
    padding: 4,
    marginBottom: hp(1.5),
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: redColor },
  tabText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, textAlign: 'center' },
  tabTextActive: { color: whiteColor },
  filterRow: {
    backgroundColor: tabBgColor,
    borderRadius: 10,
    padding: 4,
    marginBottom: hp(2),
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 8,
  },
  filterTabActive: { backgroundColor: whiteColor },
  filterTabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    textAlign: 'center',
  },
  filterTabTextActive: { color: redColor },
  statsRow: { gap: spacings.normal, marginBottom: hp(1.8) },
  statCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.normal,
    alignItems: 'center',
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: spacings.xsmall,
  },
  statValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  statLabel: {
    fontSize: 9,
    color: grayColor,
    textAlign: 'center',
    marginTop: 2,
  },
  filterRow: { gap: spacings.normal, marginBottom: hp(1.8) },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  filterChipActive: { backgroundColor: redColor, borderColor: redColor },
  filterText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor },
  filterTextActive: { color: whiteColor },
  listCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  bidCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.xLarge,
    marginBottom: spacings.large,
  },
  bidTop: {
    gap: spacings.medium,
    marginBottom: spacings.large,
  },
  bidStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    flexShrink: 0,
  },
  bidInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacings.small,
  },
  bidTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    lineHeight: 20,
    marginBottom: 4,
  },
  bidMeta: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 16,
  },
  statusChip: {
    borderRadius: 8,
    paddingHorizontal: spacings.medium,
    paddingVertical: spacings.xsmall,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: inputBgColor,
    borderRadius: 10,
    overflow: 'hidden',
  },
  metricItem: {
    width: '50%',
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
  },
  metricItemLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: borderLightColor,
  },
  metricItemTop: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  metricLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  metricValueHighlight: {
    color: redColor,
  },
  proposalWrap: {
    marginTop: spacings.large,
    paddingTop: spacings.large,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
  },
  proposalLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  proposal: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  proposalToggle: {
    marginTop: 6,
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: redColor,
  },
  counterNoteWrap: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: spacings.normal,
    marginTop: spacings.normal,
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
  bidActionsRow: {
    gap: spacings.normal,
    marginTop: spacings.large,
  },
  actionBtnFlex: {
    flex: 1,
  },
  counterBackBtn: {
    borderRadius: 8,
    paddingVertical: spacings.normal,
    paddingHorizontal: spacings.small,
    gap: 6,
    borderWidth: 1,
    borderColor: purpleColor,
    backgroundColor: whiteColor,
  },
  counterBackBtnText: {
    color: purpleColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  acceptCounterBtn: {
    backgroundColor: greenColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    paddingHorizontal: spacings.small,
    gap: 6,
  },
  acceptCounterBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  sellerBookingCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  buyerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: redColor,
    marginRight: spacings.normal,
  },
  buyerAvatarText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  sellerBookingInfo: { flex: 1 },
  bookingMessageBtn: {
    alignSelf: 'flex-end',
    marginTop: spacings.large,
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  bookingMessageBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  sellerBookingTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  buyerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  sellerBookingDate: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  sellerBookingPriceWrap: { alignItems: 'flex-end' },
  sellerBookingPrice: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  sellerBookingFee: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  sellerBookingFooter: {
    marginTop: spacings.large,
    flexWrap: 'wrap',
    gap: spacings.normal,
  },
  statusBadge: {
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.xsmall,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: '600',
  },
  sellerBookingActions: {
    gap: spacings.normal,
    flexWrap: 'wrap',
  },
  sellerBookingActionGroup: {
    gap: spacings.small,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  sellerDetailsBtn: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  sellerDetailsText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  sellerCompleteBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  sellerCompleteText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  sellerDisputeBtn: {
    borderWidth: 1,
    borderColor: '#C27803',
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
    backgroundColor: '#FFF4E5',
  },
  sellerDisputeText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: '#C27803',
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: inputBgColor,
  },
  clientInitials: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  offerCard: { padding: spacings.large, gap: spacings.normal },
  offerTop: { gap: spacings.normal },
  offerInfo: { flex: 1 },
  offerClient: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  offerProject: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  offerAmount: {
    fontSize: style.fontSizeLarge.fontSize,
    color: redColor,
  },
  offerMessage: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  offerActions: { gap: spacings.normal },
  declineBtn: {
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    alignItems: 'center',
  },
  declineText: { color: redColor, fontSize: style.fontSizeSmall1x.fontSize },
  acceptBtn: {
    backgroundColor: greenColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    alignItems: 'center',
  },
  acceptText: { color: whiteColor, fontSize: style.fontSizeSmall1x.fontSize },
});
