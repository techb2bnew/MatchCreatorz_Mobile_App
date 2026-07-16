import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { selectAuth } from '../../redux/slices/authSlice';
import {
  getBuyerStatsApi,
  getBuyerBookingsApi,
} from '../../services/buyerService';
import { formatAppCurrency } from '../../utils/currency';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
  screenBgColor,
  whiteColor,
  goldColor,
  blueColor,
  purpleColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BUYER_TABS,
  BUYER_STAT_ACTIVE_BOOKINGS,
  BUYER_STAT_TOTAL_JOBS,
  BUYER_STAT_TOTAL_SPENT,
  DASHBOARD_POST_JOB,
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_RECENT_BOOKINGS,
  DASHBOARD_SEARCH_PLACEHOLDER,
  DASHBOARD_SEE_ALL,
  DASHBOARD_TITLE,
  DASHBOARD_TOP_CREATORS,
  DASHBOARD_WELCOME_PREFIX,
  EMPTY_DASHBOARD_BOOKINGS_MESSAGE,
  EMPTY_DASHBOARD_BOOKINGS_TITLE,
  EMPTY_DASHBOARD_CREATORS_MESSAGE,
  EMPTY_DASHBOARD_CREATORS_TITLE,
  JOBS_BOOKINGS_TABS,
  MY_JOBS_SUB_TABS,
  SCREEN_NAMES,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { heightPercentageToDP as hp } from '../../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const RECENT_BOOKINGS_LIMIT = 4;

const getStatusStyle = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (normalized === 'completed') return { bg: '#E8F8EE', text: greenColor };
  if (normalized === 'pending' || normalized === 'ongoing' || normalized === 'active') {
    return { bg: '#E8F0F8', text: blueColor };
  }
  if (
    normalized === 'amidst_completion' ||
    normalized === 'amidst_completion_process' ||
    normalized === 'in_review' ||
    normalized === 'delivery_submitted' ||
    normalized === 'awaiting_acceptance'
  ) {
    return { bg: '#F3E8FF', text: purpleColor };
  }
  if (normalized === 'in_dispute' || normalized === 'disputed') {
    return { bg: '#FFEBEB', text: redColor };
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return { bg: '#F3F4F6', text: grayColor };
  }
  return { bg: lightPink, text: redColor };
};

const formatDashboardBookingStatus = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'ongoing' || normalized === 'active' || normalized === 'in_progress') {
    return 'Ongoing';
  }
  if (normalized === 'amidst_completion' || normalized === 'amidst_completion_process') {
    return 'In Review';
  }
  if (normalized === 'completed') return 'Completed';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled';
  if (normalized === 'in_dispute' || normalized === 'disputed') return 'In Dispute';
  if (!normalized) return '—';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, ' ');
};

const formatDashboardBookingDate = dateStr => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const mapDashboardBooking = booking => {
  const amount = Number(booking?.amount ?? booking?.total ?? 0) || 0;
  const sellerName = booking?.seller?.name || booking?.seller_name || 'Seller';
  const title =
    booking?.title || booking?.service?.title || booking?.job?.title || 'Booking';

  return {
    id: String(booking.id),
    title,
    creator: sellerName,
    date: formatDashboardBookingDate(booking.createdAt || booking.created_at),
    price: `$${amount.toFixed(0)}`,
    status: formatDashboardBookingStatus(booking.status),
    createdAt: booking.createdAt || booking.created_at || '',
  };
};

const mergeUniqueBookings = lists => {
  const byId = new Map();

  lists.flat().forEach(booking => {
    if (!booking?.id) return;
    const key = String(booking.id);
    if (!byId.has(key)) {
      byId.set(key, booking);
    }
  });

  return Array.from(byId.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
    const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
    return timeB - timeA;
  });
};

const INITIAL_COUNT_CARDS = [
  {
    id: 'activeBookings',
    title: BUYER_STAT_ACTIVE_BOOKINGS,
    value: '0',
    icon: 'calendar',
    iconColor: redColor,
    iconBg: lightPink,
  },
  {
    id: 'totalSpent',
    title: BUYER_STAT_TOTAL_SPENT,
    value: formatAppCurrency(0, { whole: true }),
    icon: 'dollar-sign',
    iconColor: blueColor,
    iconBg: '#E8F0F8',
  },
  {
    id: 'totalJobs',
    title: BUYER_STAT_TOTAL_JOBS,
    value: '0',
    icon: 'briefcase',
    iconColor: purpleColor,
    iconBg: '#F3E8FF',
  },
];

const mapBuyerStatsToCards = stats =>
  INITIAL_COUNT_CARDS.map(card => {
    switch (card.id) {
      case 'activeBookings':
        return { ...card, value: String(stats?.activeBookings ?? 0) };
      case 'totalSpent':
        return { ...card, value: formatAppCurrency(stats?.totalSpent ?? 0, { whole: true }) };
      case 'totalJobs':
        return { ...card, value: String(stats?.totalJobs ?? 0) };
      default:
        return card;
    }
  });

const DashboardScreen = ({ navigation }) => {
  const { token, user } = useSelector(selectAuth);
  const [searchQuery, setSearchQuery] = useState('');
  const [countCards, setCountCards] = useState(INITIAL_COUNT_CARDS);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const welcomeName = user?.name || user?.fullName || 'there';

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchDashboardData = async () => {
        if (!token) {
          console.log('[BuyerDashboard] Skipped — no token');
          return;
        }

        setIsBookingsLoading(true);
        try {
          const [statsResponse, activeRes, completedRes, cancelledRes] = await Promise.all([
              getBuyerStatsApi(token),
              getBuyerBookingsApi(token, { tab: 'active', page: 1, limit: RECENT_BOOKINGS_LIMIT }),
              getBuyerBookingsApi(token, { tab: 'completed', page: 1, limit: RECENT_BOOKINGS_LIMIT }),
              getBuyerBookingsApi(token, { tab: 'cancelled', page: 1, limit: RECENT_BOOKINGS_LIMIT }),
            ]);
          if (cancelled) return;

          const stats = statsResponse?.data?.stats || {};
          setCountCards(mapBuyerStatsToCards(stats));

          const merged = mergeUniqueBookings([
            Array.isArray(activeRes?.data) ? activeRes.data : [],
            Array.isArray(completedRes?.data) ? completedRes.data : [],
            Array.isArray(cancelledRes?.data) ? cancelledRes.data : [],
          ]);

          setRecentBookings(
            merged.slice(0, RECENT_BOOKINGS_LIMIT).map(mapDashboardBooking),
          );
        } catch (error) {
          if (!cancelled) setRecentBookings([]);
        } finally {
          if (!cancelled) setIsBookingsLoading(false);
        }
      };

      fetchDashboardData();

      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  const [promoStats] = useState([
    { id: '1', value: '12,000+', label: 'Creators' },
    { id: '2', value: '4.8', label: 'Avg Rating' },
    { id: '3', value: '98%', label: 'Satisfied' },
  ]);
  const [quickActions] = useState([
    { id: '1', title: 'Post a New Job', icon: 'plus-circle', color: '#E94545' },
    { id: '2', title: 'Browse Creators', icon: 'search', color: '#3B6981' },
    { id: '3', title: 'View Bookings', icon: 'calendar', color: '#9B51E0' },
    { id: '4', title: 'Add Wallet Money', icon: 'credit-card', color: '#FFA928' },
  ]);
  const [topCreators] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      specialty: 'UI/UX Design',
      price: '$1,500',
      rating: '4.9',
      initials: 'AJ',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      specialty: 'Brand Design',
      price: '$2,000',
      rating: '4.8',
      initials: 'PS',
    },
    {
      id: '3',
      name: 'Rahul Mehta',
      specialty: 'Video Editing',
      price: '$1,800',
      rating: '4.7',
      initials: 'RM',
    },
    {
      id: '4',
      name: 'Anita Verma',
      specialty: 'Photography',
      price: '$2,200',
      rating: '4.9',
      initials: 'AV',
    },
  ]);

  const tabNavigation = navigation.getParent();

  const goToPostJob = () => {
    tabNavigation?.navigate(BUYER_TABS.JOBS_STACK, {
      screen: SCREEN_NAMES.JOBS_BOOKINGS,
      params: {
        initialTab: JOBS_BOOKINGS_TABS.JOBS,
        initialJobsSubTab: MY_JOBS_SUB_TABS.NEW_JOB,
      },
    });
  };

  const goToBookings = () => {
    tabNavigation?.navigate(BUYER_TABS.JOBS_STACK, {
      screen: SCREEN_NAMES.JOBS_BOOKINGS,
      params: {
        initialTab: JOBS_BOOKINGS_TABS.BOOKINGS,
      },
    });
  };

  const goToWallet = () => {
    tabNavigation?.navigate(BUYER_TABS.WALLET_STACK, {
      screen: SCREEN_NAMES.WALLET,
    });
  };

  const handleQuickAction = actionId => {
    if (actionId === '1') goToPostJob();
    else if (actionId === '3') goToBookings();
    else if (actionId === '4') goToWallet();
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}>
        <ScreenHeader title={DASHBOARD_TITLE} navigation={navigation} />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={DASHBOARD_SEARCH_PLACEHOLDER}
        />

        {/* Welcome banner */}
        <View style={styles.welcomeCard}>
          <Text style={[styles.welcomeText, style.fontWeightMedium]}>
            {DASHBOARD_WELCOME_PREFIX} {welcomeName} 👋
          </Text>
          <TouchableOpacity
            style={[styles.postJobBtn, flexDirectionRow, alignItemsCenter]}
            onPress={goToPostJob}>
            <Icon name="plus" size={14} color={redColor} />
            <Text style={[styles.postJobText, style.fontWeightMedium]}>{DASHBOARD_POST_JOB}</Text>
          </TouchableOpacity>

          <View style={[styles.promoStatsRow, flexDirectionRow]}>
            {promoStats.map(item => (
              <View key={item.id} style={[styles.promoStat, alignItemsCenter]}>
                <Text style={[styles.promoValue, style.fontWeightMedium]}>{item.value}</Text>
                <Text style={[styles.promoLabel, style.fontWeightThin]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Count cards */}
        <View style={[styles.countSummaryCard, flexDirectionRow, alignItemsCenter]}>
          {countCards.map((card, index) => (
            <React.Fragment key={card.id}>
              <View style={[styles.countStat, alignItemsCenter]}>
                <View
                  style={[
                    styles.countIconWrap,
                    alignJustifyCenter,
                    { backgroundColor: card.iconBg },
                  ]}>
                  <Icon name={card.icon} size={15} color={card.iconColor} />
                </View>
                <Text style={[styles.countValue, style.fontWeightMedium]} numberOfLines={1}>
                  {card.value}
                </Text>
                <Text style={[styles.countTitle, style.fontWeightThin]} numberOfLines={2}>
                  {card.title}
                </Text>
              </View>
              {index < countCards.length - 1 ? <View style={styles.countDivider} /> : null}
            </React.Fragment>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{DASHBOARD_QUICK_ACTIONS}</Text>
        <View style={styles.quickActionsCard}>
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.quickActionRow,
                flexDirectionRow,
                alignItemsCenter,
                index < quickActions.length - 1 && styles.quickActionBorder,
              ]}
              onPress={() => handleQuickAction(item.id)}>
              <View style={[styles.quickIconWrap, alignJustifyCenter, { backgroundColor: `${item.color}18` }]}>
                <Icon name={item.icon} size={16} color={item.color} />
              </View>
              <Text style={[styles.quickActionText, style.fontWeightMedium]}>{item.title}</Text>
              <Icon name="chevron-right" size={16} color={grayColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Bookings */}
        <View style={[styles.sectionHeader, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <Text style={[styles.sectionTitle, style.fontWeightMedium, styles.sectionTitleNoMargin]}>
            {DASHBOARD_RECENT_BOOKINGS}
          </Text>
          <TouchableOpacity onPress={goToBookings}>
            <Text style={[styles.seeAll, style.fontWeightMedium]}>{DASHBOARD_SEE_ALL}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {isBookingsLoading ? (
            <View style={styles.bookingsLoader}>
              <ActivityIndicator size="small" color={redColor} />
            </View>
          ) : recentBookings.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={EMPTY_DASHBOARD_BOOKINGS_TITLE}
              message={EMPTY_DASHBOARD_BOOKINGS_MESSAGE}
              compact
            />
          ) : (
            recentBookings.map((item, index) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.bookingRow,
                    flexDirectionRow,
                    alignItemsCenter,
                    index < recentBookings.length - 1 && styles.rowBorder,
                  ]}>
                  <View style={styles.bookingInfo}>
                    <Text style={[styles.bookingTitle, style.fontWeightMedium]}>{item.title}</Text>
                    <Text style={[styles.bookingMeta, style.fontWeightThin]}>
                      {item.creator} · {item.date}
                    </Text>
                  </View>
                  <View style={styles.bookingRight}>
                    <Text style={[styles.bookingPrice, style.fontWeightMedium]}>{item.price}</Text>
                    <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Top Creators */}
        <View style={[styles.sectionHeader, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <Text style={[styles.sectionTitle, style.fontWeightMedium, styles.sectionTitleNoMargin]}>
            {DASHBOARD_TOP_CREATORS}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, style.fontWeightMedium]}>{DASHBOARD_SEE_ALL}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {topCreators.length === 0 ? (
            <EmptyState
              icon="users"
              title={EMPTY_DASHBOARD_CREATORS_TITLE}
              message={EMPTY_DASHBOARD_CREATORS_MESSAGE}
              compact
            />
          ) : (
            topCreators.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.creatorRow,
                flexDirectionRow,
                alignItemsCenter,
                index < topCreators.length - 1 && styles.rowBorder,
              ]}>
              <View style={[styles.creatorAvatar, alignJustifyCenter]}>
                <Text style={[styles.creatorInitials, style.fontWeightMedium]}>{item.initials}</Text>
              </View>
              <View style={styles.creatorInfo}>
                <Text style={[styles.creatorName, style.fontWeightMedium]}>{item.name}</Text>
                <Text style={[styles.creatorSpecialty, style.fontWeightThin]}>{item.specialty}</Text>
              </View>
              <View style={styles.creatorRight}>
                <Text style={[styles.creatorPrice, style.fontWeightMedium]}>from {item.price}</Text>
                <View style={[flexDirectionRow, alignItemsCenter, styles.ratingRow]}>
                  <Icon name="star" size={12} color={goldColor} />
                  <Text style={[styles.ratingText, style.fontWeightMedium]}>{item.rating}</Text>
                </View>
              </View>
            </View>
          ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  welcomeCard: {
    backgroundColor: redColor,
    borderRadius: 16,
    padding: spacings.xLarge,
    marginBottom: hp(1.8),
  },
  welcomeText: {
    color: whiteColor,
    fontSize: style.fontSizeMedium1x.fontSize,
    marginBottom: spacings.large,
  },
  postJobBtn: {
    alignSelf: 'flex-start',
    backgroundColor: whiteColor,
    borderRadius: 8,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    gap: 6,
    marginBottom: spacings.xLarge,
  },
  postJobText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  promoStatsRow: {
    gap: spacings.normal,
  },
  promoStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: spacings.medium,
  },
  promoValue: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  promoLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: style.fontSizeExtraSmall.fontSize,
    marginTop: 2,
  },
  countSummaryCard: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingVertical: spacings.xLarge,
    paddingHorizontal: spacings.small,
    marginBottom: hp(1.8),
  },
  countStat: {
    flex: 1,
    paddingHorizontal: spacings.xsmall,
    gap: 4,
  },
  countDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: borderLightColor,
    marginVertical: spacings.small,
  },
  countIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginBottom: spacings.xsmall,
  },
  countTitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    textAlign: 'center',
    lineHeight: 14,
  },
  countValue: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: spacings.normal,
  },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
  },
  sectionTitleNoMargin: {
    marginBottom: 0,
  },
  seeAll: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  quickActionsCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    marginBottom: hp(2),
    overflow: 'hidden',
  },
  quickActionRow: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.large,
    gap: spacings.large,
  },
  quickActionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  quickActionText: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  listCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    marginBottom: hp(2),
    overflow: 'hidden',
  },
  bookingsLoader: {
    paddingVertical: spacings.xxLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingRow: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.large,
    gap: spacings.normal,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  bookingInfo: { flex: 1 },
  bookingTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  bookingMeta: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  bookingRight: { alignItems: 'flex-end', gap: 4 },
  bookingPrice: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  statusChip: {
    borderRadius: 10,
    paddingHorizontal: spacings.normal,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '600',
  },
  creatorRow: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.large,
    gap: spacings.normal,
  },
  creatorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: inputBgColor,
  },
  creatorInitials: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  creatorInfo: { flex: 1 },
  creatorName: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  creatorSpecialty: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  creatorRight: { alignItems: 'flex-end' },
  creatorPrice: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  ratingRow: { gap: 3 },
  ratingText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
});
