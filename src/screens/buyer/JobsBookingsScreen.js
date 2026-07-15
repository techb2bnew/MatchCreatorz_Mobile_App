import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { selectAuth } from '../../redux/slices/authSlice';
import {
  getBuyerJobsApi,
  getBuyerJobByIdApi,
  getBuyerBookingsApi,
  getBuyerBookingByIdApi,
  acceptBuyerBookingApi,
  rejectBuyerBookingApi,
  cancelBuyerBookingApi,
  createBuyerJobApi,
  updateBuyerJobApi,
} from '../../services/buyerService';
import { getApiErrorMessage } from '../../services/apiClient';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  purpleColor,
  redColor,
  screenBgColor,
  tabBgColor,
  whiteColor,
  goldColor,
  blueColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BOOKING_ACCEPT_CONFIRM_BTN,
  BOOKING_ACCEPT_MESSAGE,
  BOOKING_ACCEPT_TITLE,
  BOOKING_ACTIONS,
  BOOKING_CANCEL_CONFIRM_BTN,
  BOOKING_CANCEL_MESSAGE,
  BOOKING_CANCEL_TITLE,
  BOOKING_DETAIL_MODAL,
  BOOKING_REASON_PLACEHOLDER,
  BOOKING_REASON_REQUIRED,
  BOOKING_REJECT_CONFIRM_BTN,
  BOOKING_REJECT_MESSAGE,
  BOOKING_REJECT_TITLE,
  BOOKINGS_FILTER_LABELS,
  BOOKINGS_FILTER_TABS,
  BOOKINGS_SCREEN_TITLE,
  BUYER_PROTECTION,
  BIDS_SUFFIX,
  CONFIRM_YES,
  ERROR_BOOKING_ACTION_FAILED,
  EXPERIENCE_LEVELS,
  FEE_INCL_PREFIX,
  FEE_SUFFIX,
  JOB_ACTIONS,
  JOB_DETAIL_MODAL,
  JOB_CATEGORIES,
  JOB_TYPES,
  JOBS_BOOKINGS_TABS,
  JOBS_SCREEN_TITLE,
  JOBS_SEARCH_PLACEHOLDER,
  MY_JOBS_POST_NEW_TAB,
  MY_JOBS_POSTED_TAB,
  MY_JOBS_STATS_CONFIG,
  MY_JOBS_SUB_TABS,
  EMPTY_BOOKINGS_MESSAGE,
  EMPTY_BOOKINGS_TITLE,
  EMPTY_JOBS_MESSAGE,
  EMPTY_JOBS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  ERROR_POST_JOB_FAILED,
  ERROR_UPDATE_JOB_FAILED,
  PLATFORM_STATS,
  PLATFORM_STATS_TITLE,
  POST_JOB_BTN,
  POST_JOB_LABELS,
  POST_JOB_PLACEHOLDERS,
  POST_JOB_SUBTITLE,
  POST_JOB_TIPS,
  POST_JOB_TITLE,
  SCREEN_NAMES,
  SELLER_PREFIX,
  TAB_BOOKINGS,
  TAB_MY_JOBS,
  TIPS_TITLE,
  UPDATE_JOB_BTN,
} from '../../constans/Constants';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import CustomDropdown from '../../components/CustomDropdown';
import FormLabel from '../../components/FormLabel';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import JobDetailModal from '../../components/modal/JobDetailModal';
import BookingDetailModal from '../../components/modal/BookingDetailModal';
import EmptyState from '../../components/EmptyState';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import {
  keyboardAvoidingBehavior,
  scrollInputAboveKeyboard,
  useKeyboardBottomInset,
} from '../../utils/keyboard';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
  flexWrap,
} = BaseStyle;

const getJobStatusStyle = status => {
  if (status === 'Open') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'In Progress') return { bg: '#E8F0F8', text: blueColor };
  if (status === 'Closed' || status === 'Cancelled') return { bg: '#F3F4F6', text: grayColor };
  return { bg: '#F3F4F6', text: grayColor };
};

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
    normalized === 'amidst_completion' ||
    normalized === 'delivery_submitted' ||
    normalized === 'awaiting_acceptance'
  ) {
    return { bg: '#F3E8FF', text: purpleColor };
  }
  if (normalized === 'in_dispute' || normalized === 'disputed') {
    return { bg: '#FFEBEB', text: redColor };
  }
  if (normalized === 'completed') return { bg: '#E8F8EE', text: greenColor };
  if (normalized === 'cancelled' || normalized === 'canceled') return { bg: '#F3F4F6', text: grayColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const formatCurrency = (amount, currency = '₹') => {
  const num = Number(amount);
  if (Number.isNaN(num)) return `${currency}—`;
  return `${currency}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const getBookingInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';

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

const mapApiBookingToUi = booking => {
  const seller = booking?.seller || {};
  const buyer = booking?.buyer || {};
  const sellerName = seller.name || booking?.seller_name || 'Seller';
  const buyerName = buyer.name || booking?.buyer_name || '';
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
    title,
    sellerName,
    sellerInitials: getBookingInitials(sellerName),
    buyerName,
    date: formatBookingDate(booking.createdAt || booking.created_at),
    total: amount,
    fee,
    currency: '₹',
    amountDisplay: `₹${amount.toFixed(2)}`,
    feeDisplay: `₹${fee.toFixed(2)}`,
    serviceTitle: booking?.service?.title || booking?.title || '—',
    delivery: deliveryDays != null ? `${deliveryDays} days` : '—',
    status: mapApiBookingStatusToUi(booking.status),
    apiStatus: String(booking.status || '')
      .trim()
      .toLowerCase()
      .replace(/-/g, '_'),
    notes: booking.notes || '',
    cancelReason: booking.cancel_reason || booking.cancelReason || '',
    disputeReason: booking.dispute_reason || booking.disputeReason || '',
    deliveryDays,
    serviceImage,
    raw: booking,
  };
};

const mapBookingDetailForDisplay = booking => mapApiBookingToUi(booking);

const EMPTY_POST_JOB_FORM = {
  title: '',
  description: '',
  category: 'Design',
  jobType: 'Fixed Price',
  budgetMin: '',
  budgetMax: '',
  deadline: '',
  experienceLevel: 'Any Level',
  skills: '',
};

const JOBS_PAGE_LIMIT = 20;

const extractJobsList = response => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const extractPagination = response => response?.pagination || response?.data?.pagination || null;

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

const formatJobDate = dateStr => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatBudgetRange = job => {
  if (job.budget_range) return job.budget_range;
  if (job.budgetRange) return job.budgetRange;

  const min = job.budget_min ?? job.budgetMin;
  const max = job.budget_max ?? job.budgetMax;
  if (min != null || max != null) {
    return `₹${min ?? 0}–₹${max ?? 0}`;
  }

  return '—';
};

const mapApiJobToUi = job => {
  const apiStatus = String(job?.status || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  return {
    id: String(job.id),
    title: job.title
      ? String(job.title).charAt(0).toUpperCase() + String(job.title).slice(1)
      : '—',
    category: job.category || job.job_category || '—',
    date: formatJobDate(job.created_at || job.createdAt || job.date),
    status: mapApiStatusToUi(job.status),
    apiStatus,
    description: job.description || '',
    budgetRange: formatBudgetRange(job),
    bidCount: Number(job.bid_count ?? job.bidCount ?? job.bids_count ?? 0) || 0,
    raw: job,
  };
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

const formatIsoDate = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseIsoDate = value => {
  if (!value) return null;
  const trimmed = String(value).trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTodayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDeadlineForDisplay = value => {
  const date = parseIsoDate(value);
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const mapJobDetailForDisplay = job => {
  const min = job?.budget_min ?? job?.budgetMin;
  const max = job?.budget_max ?? job?.budgetMax;
  const skills = Array.isArray(job?.skills)
    ? job.skills.filter(Boolean).join(', ')
    : String(job?.skills || '').trim();

  return {
    title: job?.title
      ? String(job.title).charAt(0).toUpperCase() + String(job.title).slice(1)
      : '—',
    status: mapApiStatusToUi(job?.status),
    category: job?.category || job?.job_category || '—',
    jobType: mapJobTypeToUi(job?.job_type || job?.jobType),
    budgetMin: min != null ? `₹${min}` : '—',
    budgetMax: max != null ? `₹${max}` : '—',
    deadline: formatDeadlineForDisplay(job?.deadline || job?.deadline_date || '') || '—',
    experienceLevel: mapExperienceLevelToUi(job?.experience_level || job?.experienceLevel),
    description: job?.description || '',
    skills,
    bidCount: Number(job?.bid_count ?? job?.bidCount ?? job?.bids_count ?? 0) || 0,
    date: formatJobDate(job?.created_at || job?.createdAt || job?.date),
  };
};

const mapJobDetailToForm = job => {
  const skills = Array.isArray(job?.skills)
    ? job.skills.filter(Boolean).join(', ')
    : String(job?.skills || '').trim();

  const deadlineRaw = job?.deadline || job?.deadline_date || '';
  const deadlineDate = parseIsoDate(deadlineRaw);

  return {
    title: job?.title || '',
    description: job?.description || '',
    category: job?.category || JOB_CATEGORIES[0],
    jobType: mapJobTypeToUi(job?.job_type || job?.jobType),
    budgetMin: String(job?.budget_min ?? job?.budgetMin ?? ''),
    budgetMax: String(job?.budget_max ?? job?.budgetMax ?? ''),
    deadline: deadlineDate ? formatIsoDate(deadlineDate) : '',
    experienceLevel: mapExperienceLevelToUi(job?.experience_level || job?.experienceLevel),
    skills,
  };
};

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

const JobsBookingsScreen = ({ navigation, route }) => {
  const { token } = useSelector(selectAuth);
  const scrollRef = useRef(null);
  const jobsFetchingRef = useRef(false);
  const hasMoreJobsRef = useRef(true);
  const jobsPageRef = useRef(1);
  const jobsSearchRef = useRef('');
  const keyboardBottom = useKeyboardBottomInset(40);
  const [activeTab, setActiveTab] = useState(JOBS_BOOKINGS_TABS.JOBS);
  const [jobsSubTab, setJobsSubTab] = useState(MY_JOBS_SUB_TABS.POSTED);
  const [bookingFilter, setBookingFilter] = useState(BOOKINGS_FILTER_TABS.ACTIVE);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobsTotalCount, setJobsTotalCount] = useState(0);
  const [isJobsInitialLoading, setIsJobsInitialLoading] = useState(false);
  const [isJobsLoadingMore, setIsJobsLoadingMore] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [isLoadingJobDetail, setIsLoadingJobDetail] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [postJobError, setPostJobError] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    message: '',
    actionType: '',
    bookingId: null,
    confirmColor: redColor,
    iconName: 'alert-circle',
    confirmText: CONFIRM_YES,
    showReasonInput: false,
    reason: '',
    reasonError: '',
  });
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [jobDetailModal, setJobDetailModal] = useState({
    visible: false,
    loading: false,
    job: null,
    error: '',
  });
  const [bookingDetailModal, setBookingDetailModal] = useState({
    visible: false,
    loading: false,
    booking: null,
    error: '',
  });
  const [bookings, setBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  const [postJobForm, setPostJobForm] = useState({ ...EMPTY_POST_JOB_FORM });

  const isJobsTab = activeTab === JOBS_BOOKINGS_TABS.JOBS;
  const isPostedJobsView = isJobsTab && jobsSubTab === MY_JOBS_SUB_TABS.POSTED;
  const isBookingsTab = activeTab === JOBS_BOOKINGS_TABS.BOOKINGS;

  const fetchBuyerBookings = useCallback(async () => {
    if (!token) return;

    setIsBookingsLoading(true);
    setBookings([]);

    try {
      const response = await getBuyerBookingsApi(token, {
        tab: bookingFilter,
        page: 1,
        limit: 20,
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      setBookings(list.map(mapApiBookingToUi));
    } catch (error) {
      setBookings([]);
    } finally {
      setIsBookingsLoading(false);
    }
  }, [token, bookingFilter]);

  const fetchBuyerJobs = useCallback(async (page = 1, { isLoadMore = false } = {}) => {
    if (!token || jobsFetchingRef.current) return;
    if (isLoadMore && !hasMoreJobsRef.current) return;

    jobsFetchingRef.current = true;
    if (isLoadMore) {
      setIsJobsLoadingMore(true);
    } else {
      setIsJobsInitialLoading(true);
    }

    try {
      const response = await getBuyerJobsApi(token, {
        page,
        limit: JOBS_PAGE_LIMIT,
        search: jobsSearchRef.current || undefined,
      });
      const list = extractJobsList(response);
      const pagination = extractPagination(response);
      const mappedJobs = list.map(mapApiJobToUi);
      const nextHasMore = resolveHasMoreJobs(response, page, list.length);

      setJobs(prev => (isLoadMore ? [...prev, ...mappedJobs] : mappedJobs));
      setJobsTotalCount(Number(pagination?.total ?? mappedJobs.length) || 0);

      jobsPageRef.current = page;
      hasMoreJobsRef.current = nextHasMore;
    } catch (error) {
      if (!isLoadMore) {
        setJobs([]);
        setJobsTotalCount(0);
      }
    } finally {
      jobsFetchingRef.current = false;
      setIsJobsInitialLoading(false);
      setIsJobsLoadingMore(false);
    }
  }, [token]);

  const handleLoadMoreJobs = useCallback(() => {
    if (!isPostedJobsView) return;
    if (isJobsInitialLoading || isJobsLoadingMore || !hasMoreJobsRef.current) return;
    fetchBuyerJobs(jobsPageRef.current + 1, { isLoadMore: true });
  }, [isPostedJobsView, isJobsInitialLoading, isJobsLoadingMore, fetchBuyerJobs]);

  useFocusEffect(
    useCallback(() => {
      const { initialTab, initialJobsSubTab } = route.params || {};
      if (initialTab) setActiveTab(initialTab);
      if (initialJobsSubTab) setJobsSubTab(initialJobsSubTab);
      if (initialTab || initialJobsSubTab) {
        navigation.setParams({ initialTab: undefined, initialJobsSubTab: undefined });
      }
    }, [route.params, navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isPostedJobsView || !token) return undefined;

      jobsPageRef.current = 1;
      hasMoreJobsRef.current = true;
      setJobs([]);
      setJobsTotalCount(0);
      fetchBuyerJobs(1, { isLoadMore: false });

      return undefined;
    }, [isPostedJobsView, token, fetchBuyerJobs]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isBookingsTab || !token) return undefined;
      fetchBuyerBookings();
      return undefined;
    }, [isBookingsTab, token, fetchBuyerBookings]),
  );

  useEffect(() => {
    if (!isPostedJobsView || !token) return undefined;

    const timer = setTimeout(() => {
      const nextSearch = searchQuery.trim();
      if (nextSearch === jobsSearchRef.current) return;

      jobsSearchRef.current = nextSearch;
      jobsPageRef.current = 1;
      hasMoreJobsRef.current = true;
      fetchBuyerJobs(1, { isLoadMore: false });
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, isPostedJobsView, token, fetchBuyerJobs]);

  const jobStats = useMemo(
    () => ({
      total: jobsTotalCount,
      open: jobs.filter(j => j.apiStatus === 'OPEN').length,
      progress: jobs.filter(j => j.apiStatus === 'IN_PROGRESS').length,
      bids: jobs.reduce((sum, j) => sum + (Number(j.bidCount) || 0), 0),
    }),
    [jobs, jobsTotalCount],
  );

  const filteredBookings = useMemo(() => {
    // API already filters by tab (active | completed | cancelled)
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.sellerName.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q),
    );
  }, [bookings, searchQuery]);

  const updateForm = (key, value) => {
    setPostJobForm(prev => ({ ...prev, [key]: value }));
    if (postJobError) setPostJobError('');
  };

  const handleInputFocus = event => {
    scrollInputAboveKeyboard(scrollRef, event, 160);
  };

  const resetPostJobForm = () => {
    setPostJobForm({ ...EMPTY_POST_JOB_FORM });
    setEditingJobId(null);
    setPostJobError('');
    setShowDeadlinePicker(false);
  };

  const handleDeadlineChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDeadlinePicker(false);
      if (event?.type === 'dismissed') return;
    }

    if (!selectedDate) return;
    const today = getTodayStart();
    const nextDate = selectedDate < today ? today : selectedDate;
    updateForm('deadline', formatIsoDate(nextDate));
  };

  const closeJobDetailModal = () => {
    setJobDetailModal({ visible: false, loading: false, job: null, error: '' });
  };

  const closeBookingDetailModal = () => {
    setBookingDetailModal({ visible: false, loading: false, booking: null, error: '' });
  };

  const handleViewBooking = async booking => {
    if (!token || !booking?.id || bookingDetailModal.loading) return;

    setBookingDetailModal({ visible: true, loading: true, booking: null, error: '' });

    try {
      const response = await getBuyerBookingByIdApi(token, booking.id);
      const detail = response?.data || response;
      setBookingDetailModal({
        visible: true,
        loading: false,
        booking: mapBookingDetailForDisplay(detail),
        error: '',
      });
    } catch (error) {
      const fallback = booking.raw || booking;
      setBookingDetailModal({
        visible: true,
        loading: false,
        booking: mapBookingDetailForDisplay(fallback),
        error: getApiErrorMessage(error?.data, error?.message || BOOKING_DETAIL_MODAL.loadError),
      });
    }
  };

  const handleViewJob = async job => {
    if (!token || !job?.id || jobDetailModal.loading) return;

    setJobDetailModal({ visible: true, loading: true, job: null, error: '' });

    try {
      const response = await getBuyerJobByIdApi(token, job.id);
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
        error: getApiErrorMessage(error?.data, error?.message || JOB_DETAIL_MODAL.loadError),
      });
    }
  };

  const handleEditJob = async job => {
    if (!token || !job?.id || isLoadingJobDetail) return;

    setEditingJobId(job.id);
    setJobsSubTab(MY_JOBS_SUB_TABS.NEW_JOB);
    setPostJobError('');
    setIsLoadingJobDetail(true);

    try {
      const response = await getBuyerJobByIdApi(token, job.id);
      const detail = response?.data || response;
      setPostJobForm(mapJobDetailToForm(detail));
    } catch (error) {
      // Fallback: prefill from list card if detail API fails
      const budgetParts = String(job.budgetRange || '')
        .replace(/₹/g, '')
        .split('–');
      setPostJobForm({
        title: job.title || '',
        description: job.description || '',
        category: job.category || JOB_CATEGORIES[0],
        jobType: mapJobTypeToUi(job.raw?.job_type),
        budgetMin: budgetParts[0]?.trim() || '',
        budgetMax: budgetParts[1]?.trim() || '',
        deadline: '',
        experienceLevel: mapExperienceLevelToUi(job.raw?.experience_level),
        skills: Array.isArray(job.raw?.skills) ? job.raw.skills.join(', ') : '',
      });
      setPostJobError(
        getApiErrorMessage(error?.data, error?.message || 'Failed to load job details.'),
      );
    } finally {
      setIsLoadingJobDetail(false);
    }
  };

  const handlePostJob = async () => {
    if (!postJobForm.title.trim() || isPostingJob) return;

    if (!token) {
      setPostJobError(editingJobId ? ERROR_UPDATE_JOB_FAILED : ERROR_POST_JOB_FAILED);
      return;
    }

    setIsPostingJob(true);
    setPostJobError('');

    try {
      if (editingJobId) {
        await updateBuyerJobApi(token, editingJobId, postJobForm);
      } else {
        await createBuyerJobApi(token, postJobForm);
      }

      resetPostJobForm();
      setJobsSubTab(MY_JOBS_SUB_TABS.POSTED);
      jobsPageRef.current = 1;
      hasMoreJobsRef.current = true;
      fetchBuyerJobs(1, { isLoadMore: false });
    } catch (error) {
      setPostJobError(
        getApiErrorMessage(
          error?.data,
          error?.message || (editingJobId ? ERROR_UPDATE_JOB_FAILED : ERROR_POST_JOB_FAILED),
        ),
      );
    } finally {
      setIsPostingJob(false);
    }
  };

  const openConfirmModal = (actionType, bookingId) => {
    const configs = {
      accept: {
        title: BOOKING_ACCEPT_TITLE,
        message: BOOKING_ACCEPT_MESSAGE,
        confirmColor: greenColor,
        iconName: 'check-circle',
        confirmText: BOOKING_ACCEPT_CONFIRM_BTN,
        showReasonInput: false,
      },
      reject: {
        title: BOOKING_REJECT_TITLE,
        message: BOOKING_REJECT_MESSAGE,
        confirmColor: redColor,
        iconName: 'x-circle',
        confirmText: BOOKING_REJECT_CONFIRM_BTN,
        showReasonInput: true,
      },
      cancel: {
        title: BOOKING_CANCEL_TITLE,
        message: BOOKING_CANCEL_MESSAGE,
        confirmColor: '#C27803',
        iconName: 'alert-circle',
        confirmText: BOOKING_CANCEL_CONFIRM_BTN,
        showReasonInput: true,
      },
    };
    const config = configs[actionType];
    setConfirmModal({
      visible: true,
      actionType,
      bookingId,
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
    if (isConfirmingBooking) return;
    setConfirmModal(prev => ({
      ...prev,
      visible: false,
      reason: '',
      reasonError: '',
    }));
  };

  const handleConfirmAction = async () => {
    const { actionType, bookingId, reason, showReasonInput } = confirmModal;
    if (!bookingId || isConfirmingBooking) {
      if (!bookingId) closeConfirmModal();
      return;
    }

    if (!token) {
      Alert.alert(confirmModal.title, ERROR_BOOKING_ACTION_FAILED);
      return;
    }

    // UI pe reason ask karte hain (cancel/reject). Swagger example mein field hai,
    // required mark nahi tha — phir bhi empty reason block karte hain taaki meaningful reason jaye.
    if (showReasonInput && !String(reason || '').trim()) {
      setConfirmModal(prev => ({ ...prev, reasonError: BOOKING_REASON_REQUIRED }));
      return;
    }

    setIsConfirmingBooking(true);
    try {
      if (actionType === 'accept') {
        await acceptBuyerBookingApi(token, bookingId);
      } else if (actionType === 'reject') {
        await rejectBuyerBookingApi(token, bookingId, reason);
      } else if (actionType === 'cancel') {
        await cancelBuyerBookingApi(token, bookingId, reason);
      }

      setConfirmModal(prev => ({
        ...prev,
        visible: false,
        reason: '',
        reasonError: '',
      }));
      await fetchBuyerBookings();
    } catch (error) {
      Alert.alert(
        confirmModal.title,
        getApiErrorMessage(error?.data, error?.message || ERROR_BOOKING_ACTION_FAILED),
      );
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  const renderHeader = () => (
    <ScreenHeader
      title={isJobsTab ? JOBS_SCREEN_TITLE : BOOKINGS_SCREEN_TITLE}
      navigation={navigation}
    />
  );

  const renderSearch = () => (
    <SearchBar
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder={JOBS_SEARCH_PLACEHOLDER}
    />
  );

  const renderMainTabs = () => (
    <View style={[styles.tabRow, flexDirectionRow]}>
      <TouchableOpacity
        style={[styles.tab, alignJustifyCenter, isJobsTab && styles.tabActive]}
        onPress={() => setActiveTab(JOBS_BOOKINGS_TABS.JOBS)}>
        <Text style={[styles.tabText, style.fontWeightMedium, isJobsTab && styles.tabTextActive]}>
          {TAB_MY_JOBS}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, alignJustifyCenter, !isJobsTab && styles.tabActive]}
        onPress={() => setActiveTab(JOBS_BOOKINGS_TABS.BOOKINGS)}>
        <Text style={[styles.tabText, style.fontWeightMedium, !isJobsTab && styles.tabTextActive]}>
          {TAB_BOOKINGS}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobStats = () => (
    <View style={[styles.statsGrid, flexDirectionRow, flexWrap]}>
      {MY_JOBS_STATS_CONFIG.map(item => (
        <View key={item.id} style={[styles.statCard, flexDirectionRow, alignItemsCenter]}>
          <View style={[styles.statIconWrap, alignJustifyCenter, { backgroundColor: `${item.color}18` }]}>
            <Icon name={item.icon} size={16} color={item.color} />
          </View>
          <View style={flex}>
            <Text style={[styles.statValue, style.fontWeightMedium]}>{jobStats[item.id]}</Text>
            <Text style={[styles.statLabel, style.fontWeightThin]}>{item.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderJobsSubTabs = () => (
    <View style={[styles.subTabRow, flexDirectionRow]}>
      <TouchableOpacity
        style={[
          styles.subTab,
          flexDirectionRow,
          alignItemsCenter,
          alignJustifyCenter,
          jobsSubTab === MY_JOBS_SUB_TABS.POSTED && styles.subTabActive,
        ]}
        onPress={() => setJobsSubTab(MY_JOBS_SUB_TABS.POSTED)}>
        <Icon
          name="briefcase"
          size={14}
          color={jobsSubTab === MY_JOBS_SUB_TABS.POSTED ? whiteColor : grayColor}
        />
        <Text
          style={[
            styles.subTabText,
            style.fontWeightMedium,
            jobsSubTab === MY_JOBS_SUB_TABS.POSTED && styles.subTabTextActive,
          ]}>
          {MY_JOBS_POSTED_TAB}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.subTab,
          flexDirectionRow,
          alignItemsCenter,
          alignJustifyCenter,
          jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB && styles.subTabActive,
        ]}
        onPress={() => {
          resetPostJobForm();
          setJobsSubTab(MY_JOBS_SUB_TABS.NEW_JOB);
        }}>
        <Icon
          name="plus"
          size={14}
          color={jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB ? whiteColor : grayColor}
        />
        <Text
          style={[
            styles.subTabText,
            style.fontWeightMedium,
            jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB && styles.subTabTextActive,
          ]}>
          {MY_JOBS_POST_NEW_TAB}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobCard = job => {
    const statusStyle = getJobStatusStyle(job.status);
    const isOpen = job.status === 'Open';

    return (
      <View style={styles.jobCard}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleViewJob(job)}>
          <View style={[flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
            <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
              {job.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{job.status}</Text>
            </View>
          </View>

          <View style={[styles.jobMetaRow, flexDirectionRow, alignItemsCenter]}>
            <Icon name="tag" size={12} color={grayColor} />
            <Text style={styles.jobMetaText}>{job.category}</Text>
            <Text style={styles.jobMetaDot}>•</Text>
            <Icon name="calendar" size={12} color={grayColor} />
            <Text style={styles.jobMetaText}>{job.date}</Text>
          </View>

          <Text style={[styles.jobDesc, style.fontWeightThin]} numberOfLines={2}>
            {job.description}
          </Text>
        </TouchableOpacity>

        <View style={[styles.jobFooter, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <View>
            <Text style={[styles.budgetText, style.fontWeightMedium]}>{job.budgetRange}</Text>
            <Text style={styles.bidCountText}>
              {job.bidCount} {BIDS_SUFFIX}
            </Text>
          </View>
          <View style={[flexDirectionRow, styles.jobActions]}>
            <TouchableOpacity
              style={[styles.outlineBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() => navigation.navigate(SCREEN_NAMES.VIEW_BIDS, { job })}>
              <Icon name="eye" size={14} color={blackColor} />
              <Text style={[styles.outlineBtnText, style.fontWeightMedium]}>{JOB_ACTIONS.VIEW_BIDS}</Text>
            </TouchableOpacity>
            {isOpen ? (
              <TouchableOpacity
                style={[styles.editBtn, flexDirectionRow, alignItemsCenter]}
                onPress={() => handleEditJob(job)}>
                <Icon name="edit-2" size={14} color={whiteColor} />
                <Text style={[styles.editBtnText, style.fontWeightMedium]}>{JOB_ACTIONS.EDIT}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderPostedJobsHeader = () => (
    <View>
      {renderJobStats()}
      {renderJobsSubTabs()}
      {isJobsInitialLoading ? (
        <View style={styles.jobsInitialLoader}>
          <ActivityIndicator size="small" color={redColor} />
        </View>
      ) : null}
    </View>
  );

  const renderPostedJobsFooter = () => {
    if (!isJobsLoadingMore) return <View style={{ height: hp(3) + keyboardBottom }} />;
    return (
      <View style={styles.jobsMoreLoader}>
        <ActivityIndicator size="small" color={redColor} />
      </View>
    );
  };

  const renderPostedJobsEmpty = () => {
    if (isJobsInitialLoading) return null;
    return (
      <EmptyState
        icon="briefcase"
        title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_JOBS_TITLE}
        message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_JOBS_MESSAGE}
        actionLabel={!searchQuery.trim() ? MY_JOBS_POST_NEW_TAB : undefined}
        onAction={
          !searchQuery.trim() ? () => setJobsSubTab(MY_JOBS_SUB_TABS.NEW_JOB) : undefined
        }
      />
    );
  };

  const renderPostedJobsList = () => (
    <View style={flex}>
      <View style={styles.jobsFixedHeader}>
        {renderHeader()}
        {renderSearch()}
        {renderMainTabs()}
      </View>
      <FlatList
        data={jobs}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => renderJobCard(item)}
        ListHeaderComponent={renderPostedJobsHeader}
        ListFooterComponent={renderPostedJobsFooter}
        ListEmptyComponent={renderPostedJobsEmpty}
        onEndReached={handleLoadMoreJobs}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.jobsListContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
      />
    </View>
  );

  const renderInfoCard = (title, icon, iconColor, children) => (
    <View style={styles.infoCard}>
      <View style={[flexDirectionRow, alignItemsCenter, styles.infoCardHeader]}>
        <Icon name={icon} size={16} color={iconColor} />
        <Text style={[styles.infoCardTitle, style.fontWeightMedium]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderPostJobForm = () => {
    const selectedDeadline = parseIsoDate(postJobForm.deadline) || getTodayStart();

    return (
    <View>
      {renderJobsSubTabs()}

      <View style={styles.formCard}>
        <View style={[flexDirectionRow, alignItemsCenter, styles.formHeader]}>
          <View style={[styles.formIconWrap, alignJustifyCenter]}>
            <Icon name={editingJobId ? 'edit-2' : 'plus'} size={16} color={whiteColor} />
          </View>
          <View style={flex}>
            <Text style={[styles.formTitle, style.fontWeightMedium]}>
              {editingJobId ? UPDATE_JOB_BTN : POST_JOB_TITLE}
            </Text>
            <Text style={[styles.formSubtitle, style.fontWeightThin]}>{POST_JOB_SUBTITLE}</Text>
          </View>
        </View>

        {isLoadingJobDetail ? (
          <View style={styles.jobDetailLoader}>
            <ActivityIndicator size="small" color={redColor} />
            <Text style={[styles.jobDetailLoaderText, style.fontWeightThin]}>Loading job details...</Text>
          </View>
        ) : null}

        <CustomTextInput
          label={POST_JOB_LABELS.title}
          required
          value={postJobForm.title}
          onChangeText={v => updateForm('title', v)}
          placeholder={POST_JOB_PLACEHOLDERS.title}
          leftIcon="edit-2"
          onFocus={handleInputFocus}
        />

        <CustomTextInput
          label={POST_JOB_LABELS.description}
          value={postJobForm.description}
          onChangeText={v => updateForm('description', v)}
          placeholder={POST_JOB_PLACEHOLDERS.description}
          leftIcon="file-text"
          onFocus={handleInputFocus}
          style={styles.formField}
        />

        <CustomDropdown
          label={POST_JOB_LABELS.category}
          value={postJobForm.category}
          options={JOB_CATEGORIES}
          onSelect={v => updateForm('category', v)}
          style={styles.formField}
        />

        <CustomDropdown
          label={POST_JOB_LABELS.jobType}
          value={postJobForm.jobType}
          options={JOB_TYPES}
          onSelect={v => updateForm('jobType', v)}
          style={styles.formField}
        />

        <View style={[flexDirectionRow, styles.budgetRow]}>
          <CustomTextInput
            label={POST_JOB_LABELS.budgetMin}
            value={postJobForm.budgetMin}
            onChangeText={v => updateForm('budgetMin', v)}
            placeholder={POST_JOB_PLACEHOLDERS.budgetMin}
            keyboardType="numeric"
            leftIcon="dollar-sign"
            onFocus={handleInputFocus}
            style={styles.budgetField}
          />
          <CustomTextInput
            label={POST_JOB_LABELS.budgetMax}
            value={postJobForm.budgetMax}
            onChangeText={v => updateForm('budgetMax', v)}
            placeholder={POST_JOB_PLACEHOLDERS.budgetMax}
            keyboardType="numeric"
            leftIcon="dollar-sign"
            onFocus={handleInputFocus}
            style={styles.budgetField}
          />
        </View>

        <View style={styles.formField}>
          <FormLabel label={POST_JOB_LABELS.deadline} />
          <TouchableOpacity
            style={[styles.deadlineField, flexDirectionRow, alignItemsCenter]}
            activeOpacity={0.8}
            onPress={() => setShowDeadlinePicker(true)}
            disabled={isLoadingJobDetail}>
            <Icon name="calendar" size={16} color={grayColor} />
            <Text
              style={[
                styles.deadlineText,
                style.fontWeightThin,
                !postJobForm.deadline && styles.deadlinePlaceholder,
              ]}>
              {postJobForm.deadline
                ? formatDeadlineForDisplay(postJobForm.deadline)
                : POST_JOB_PLACEHOLDERS.deadline}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'android' && showDeadlinePicker ? (
          <DateTimePicker
            value={selectedDeadline}
            mode="date"
            display="default"
            minimumDate={getTodayStart()}
            onChange={handleDeadlineChange}
          />
        ) : null}

        {Platform.OS === 'ios' ? (
          <Modal
            visible={showDeadlinePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDeadlinePicker(false)}>
            <View style={styles.deadlineModalOverlay}>
              <View style={styles.deadlineModalCard}>
                <View
                  style={[
                    styles.deadlineModalHeader,
                    flexDirectionRow,
                    justifyContentSpaceBetween,
                    alignItemsCenter,
                  ]}>
                  <TouchableOpacity onPress={() => setShowDeadlinePicker(false)}>
                    <Text style={[styles.deadlineModalAction, style.fontWeightMedium]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowDeadlinePicker(false)}>
                    <Text
                      style={[
                        styles.deadlineModalAction,
                        styles.deadlineModalDone,
                        style.fontWeightMedium,
                      ]}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDeadline}
                  mode="date"
                  display="spinner"
                  minimumDate={getTodayStart()}
                  onChange={handleDeadlineChange}
                  style={styles.deadlineIosPicker}
                />
              </View>
            </View>
          </Modal>
        ) : null}

        <CustomDropdown
          label={POST_JOB_LABELS.experienceLevel}
          value={postJobForm.experienceLevel}
          options={EXPERIENCE_LEVELS}
          onSelect={v => updateForm('experienceLevel', v)}
          style={styles.formField}
        />

        <CustomTextInput
          label={POST_JOB_LABELS.skills}
          value={postJobForm.skills}
          onChangeText={v => updateForm('skills', v)}
          placeholder={POST_JOB_PLACEHOLDERS.skills}
          leftIcon="code"
          onFocus={handleInputFocus}
          style={styles.formField}
        />

        {postJobError ? <Text style={styles.postJobError}>{postJobError}</Text> : null}

        <CustomButton
          title={editingJobId ? UPDATE_JOB_BTN : POST_JOB_BTN}
          iconName="send"
          onPress={handlePostJob}
          loading={isPostingJob || isLoadingJobDetail}
          disabled={isPostingJob || isLoadingJobDetail}
          style={styles.postJobBtn}
        />
      </View>

      {renderInfoCard(TIPS_TITLE, 'zap', goldColor, (
        <View style={styles.tipsList}>
          {POST_JOB_TIPS.map((tip, index) => (
            <View key={index} style={[flexDirectionRow, alignItemsCenter, styles.tipRow]}>
              <Icon name="check-circle" size={14} color={greenColor} />
              <Text style={[styles.tipText, style.fontWeightThin]}>{tip}</Text>
            </View>
          ))}
        </View>
      ))}

      {renderInfoCard(PLATFORM_STATS_TITLE, 'bar-chart-2', blueColor, (
        <View style={styles.platformStats}>
          {PLATFORM_STATS.map(stat => (
            <View key={stat.id} style={[flexDirectionRow, justifyContentSpaceBetween, styles.platformStatRow]}>
              <Text style={[styles.platformStatLabel, style.fontWeightThin]}>{stat.label}</Text>
              <Text style={[styles.platformStatValue, style.fontWeightMedium, { color: stat.color }]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.protectionCard}>
        <View style={[flexDirectionRow, alignItemsCenter, styles.protectionHeader]}>
          <Icon name="shield" size={18} color={whiteColor} />
          <Text style={[styles.protectionTitle, style.fontWeightMedium]}>{BUYER_PROTECTION.title}</Text>
        </View>
        <Text style={[styles.protectionText, style.fontWeightThin]}>{BUYER_PROTECTION.text}</Text>
      </View>
    </View>
    );
  };

  const renderBookingFilters = () => (
    <View style={[styles.filterRow, flexDirectionRow]}>
      {Object.values(BOOKINGS_FILTER_TABS).map(key => (
        <TouchableOpacity
          key={key}
          style={[styles.filterTab, alignJustifyCenter, bookingFilter === key && styles.filterTabActive]}
          onPress={() => setBookingFilter(key)}>
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

  const renderBookingActions = booking => {
    if (booking.apiStatus === 'pending' || booking.apiStatus === 'ongoing') {
      return (
        <TouchableOpacity
          style={[styles.cancelBtn, flexDirectionRow, alignItemsCenter]}
          onPress={() => openConfirmModal('cancel', booking.id)}
          disabled={isConfirmingBooking}>
          <Icon name="alert-circle" size={14} color="#C27803" />
          <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.CANCEL}</Text>
        </TouchableOpacity>
      );
    }
    if (
      booking.apiStatus === 'amidst_completion' ||
      booking.apiStatus === 'amidst_completion_process' ||
      booking.apiStatus === 'delivery_submitted' ||
      booking.apiStatus === 'awaiting_acceptance'
    ) {
      return (
        <View style={[flexDirectionRow, styles.bookingActionGroup]}>
          <TouchableOpacity
            style={[styles.acceptBtn, flexDirectionRow, alignItemsCenter]}
            onPress={() => openConfirmModal('accept', booking.id)}
            disabled={isConfirmingBooking}>
            <Icon name="check" size={14} color={whiteColor} />
            <Text style={[styles.acceptBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.ACCEPT}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectBtn, flexDirectionRow, alignItemsCenter]}
            onPress={() => openConfirmModal('reject', booking.id)}
            disabled={isConfirmingBooking}>
            <Icon name="x" size={14} color={whiteColor} />
            <Text style={[styles.rejectBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.REJECT}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderBookingCard = booking => {
    const statusStyle = getBookingStatusStyle(booking.status);

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={[flexDirectionRow, alignItemsCenter]}>
          <View style={[styles.sellerAvatar, alignJustifyCenter]}>
            <Text style={[styles.sellerAvatarText, style.fontWeightMedium]}>{booking.sellerInitials}</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={[styles.bookingTitle, style.fontWeightMedium]}>{booking.title}</Text>
            <Text style={[styles.sellerName, style.fontWeightThin]}>
              {SELLER_PREFIX} {booking.sellerName}
            </Text>
            <Text style={styles.bookingDate}>{booking.date}</Text>
          </View>
          <View style={styles.bookingPriceWrap}>
            <Text style={[styles.bookingPrice, style.fontWeightMedium]}>
              {formatCurrency(booking.total, booking.currency)}
            </Text>
            <Text style={styles.bookingFee}>
              {FEE_INCL_PREFIX} {formatCurrency(booking.fee, booking.currency)} {FEE_SUFFIX}
            </Text>
          </View>
        </View>

        <View style={[styles.bookingFooter, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{booking.status}</Text>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter, styles.bookingActions]}>
            <TouchableOpacity
              style={[styles.outlineBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() => handleViewBooking(booking)}>
              <Icon name="eye" size={14} color={blackColor} />
              <Text style={[styles.outlineBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.DETAILS}</Text>
            </TouchableOpacity>
            {renderBookingActions(booking)}
          </View>
        </View>
      </View>
    );
  };

  const renderBookings = () => (
    <View>
      {renderBookingFilters()}
      {isBookingsLoading ? (
        <View style={styles.bookingsLoader}>
          <ActivityIndicator size="large" color={redColor} />
        </View>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon="calendar"
          title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_BOOKINGS_TITLE}
          message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_BOOKINGS_MESSAGE}
        />
      ) : (
        filteredBookings.map(renderBookingCard)
      )}
    </View>
  );

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
      <KeyboardAvoidingView style={flex} behavior={keyboardAvoidingBehavior}>
        {isPostedJobsView ? (
          renderPostedJobsList()
        ) : (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              screenContentStyles.scrollContent,
              jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB && styles.formScrollContent,
              {
                paddingBottom:
                  (jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB ? hp(12) : hp(3)) + keyboardBottom,
              },
            ]}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {renderHeader()}
            {renderSearch()}
            {renderMainTabs()}

            {isJobsTab ? renderPostJobForm() : renderBookings()}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

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
        loading={isConfirmingBooking}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmModal}
      />

      <JobDetailModal
        visible={jobDetailModal.visible}
        loading={jobDetailModal.loading}
        error={jobDetailModal.error}
        job={jobDetailModal.job}
        onClose={closeJobDetailModal}
      />

      <BookingDetailModal
        visible={bookingDetailModal.visible}
        loading={bookingDetailModal.loading}
        error={bookingDetailModal.error}
        booking={bookingDetailModal.booking}
        onClose={closeBookingDetailModal}
      />
    </SafeAreaView>
  );
};

export default JobsBookingsScreen;

const styles = StyleSheet.create({
  formScrollContent: {
    paddingBottom: hp(12),
  },
  jobsFixedHeader: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  jobsListContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    flexGrow: 1,
  },
  jobsInitialLoader: {
    paddingVertical: spacings.large,
    alignItems: 'center',
  },
  bookingsLoader: {
    paddingVertical: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobsMoreLoader: {
    paddingVertical: spacings.xLarge,
    alignItems: 'center',
    marginBottom: hp(3),
  },
  tabRow: {
    backgroundColor: tabBgColor,
    borderRadius: 10,
    padding: 4,
    marginBottom: hp(2),
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: redColor },
  tabText: { fontSize: style.fontSizeNormal2x.fontSize, color: grayColor },
  tabTextActive: { color: whiteColor },
  statsGrid: {
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  statCard: {
    width: (wp(90) - spacings.normal) / 2,
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    gap: spacings.normal,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  statValue: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  statLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  subTabRow: {
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  subTab: {
    flex: 1,
    paddingVertical: spacings.medium,
    paddingHorizontal: spacings.normal,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
    gap: spacings.xsmall,
  },
  subTabActive: {
    backgroundColor: redColor,
    borderColor: redColor,
  },
  subTabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  subTabTextActive: { color: whiteColor },
  jobCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  jobTitle: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginRight: spacings.normal,
  },
  statusBadge: {
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.xsmall,
    borderRadius: 20,
  },
  statusText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: '600',
  },
  jobMetaRow: {
    marginTop: spacings.normal,
    gap: spacings.xsmall,
  },
  jobMetaText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginLeft: 2,
  },
  jobMetaDot: {
    color: grayColor,
    marginHorizontal: spacings.xsmall,
  },
  jobDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: spacings.normal,
    lineHeight: 18,
  },
  jobFooter: {
    marginTop: spacings.large,
    flexWrap: 'wrap',
    gap: spacings.normal,
  },
  budgetText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  bidCountText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
    marginTop: 2,
  },
  jobActions: { gap: spacings.normal },
  outlineBtn: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  outlineBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  editBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  editBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  formCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  formHeader: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  formIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: redColor,
  },
  formTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  formSubtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  formField: { marginTop: spacings.large },
  budgetRow: {
    gap: spacings.normal,
    marginTop: spacings.large,
  },
  budgetField: { flex: 1 },
  postJobBtn: { marginTop: spacings.xLarge },
  postJobError: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginTop: spacings.normal,
  },
  jobDetailLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  jobDetailLoaderText: {
    color: grayColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  deadlineField: {
    minHeight: hp(6),
    borderRadius: 10,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    gap: spacings.normal,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deadlineText: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  deadlinePlaceholder: {
    color: grayColor,
  },
  deadlineModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  deadlineModalCard: {
    backgroundColor: whiteColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: hp(2),
  },
  deadlineModalHeader: {
    paddingHorizontal: spacings.xLarge,
    paddingVertical: spacings.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  deadlineModalAction: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
  },
  deadlineModalDone: {
    color: redColor,
  },
  deadlineIosPicker: {
    alignSelf: 'center',
  },
  infoCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  infoCardHeader: {
    gap: spacings.normal,
    marginBottom: spacings.normal,
  },
  infoCardTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  tipsList: { gap: spacings.normal },
  tipRow: { gap: spacings.normal },
  tipText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  platformStats: { gap: spacings.normal },
  platformStatRow: { paddingVertical: spacings.xsmall },
  platformStatLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  platformStatValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  protectionCard: {
    backgroundColor: redColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  protectionHeader: {
    gap: spacings.normal,
    marginBottom: spacings.normal,
  },
  protectionTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: whiteColor,
  },
  protectionText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
    lineHeight: 20,
    opacity: 0.9,
  },
  filterRow: {
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 8,
    backgroundColor: tabBgColor,
  },
  filterTabActive: { backgroundColor: redColor },
  filterTabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  filterTabTextActive: { color: whiteColor },
  bookingCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: redColor,
    marginRight: spacings.normal,
  },
  sellerAvatarText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  bookingInfo: { flex: 1 },
  bookingTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  sellerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  bookingDate: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  bookingPriceWrap: { alignItems: 'flex-end' },
  bookingPrice: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  bookingFee: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  bookingFooter: {
    marginTop: spacings.large,
    flexWrap: 'wrap',
    gap: spacings.normal,
  },
  bookingActions: {
    gap: spacings.normal,
    flexWrap: 'wrap',
  },
  bookingActionGroup: { gap: spacings.normal },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#C27803',
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  cancelBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: '#C27803',
  },
  acceptBtn: {
    backgroundColor: greenColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  acceptBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  rejectBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  rejectBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  emptyWrap: {
    paddingVertical: hp(8),
    gap: spacings.normal,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: screenBgColor,
  },
  emptyTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
});
