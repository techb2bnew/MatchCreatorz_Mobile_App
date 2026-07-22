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
  blackColor,
  blueColor,
  borderLightColor,
  grayColor,
  greenColor,
  lightPink,
  purpleColor,
  redColor,
  screenBgColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  EMPTY_DASHBOARD_BOOKINGS_MESSAGE,
  EMPTY_DASHBOARD_BOOKINGS_TITLE,
  SCREEN_NAMES,
  SELLER_DASHBOARD_ACTIVE_BOOKINGS,
  SELLER_DASHBOARD_BROWSE_JOBS,
  SELLER_DASHBOARD_BUY_CONNECTS,
  SELLER_DASHBOARD_CONNECTS,
  SELLER_DASHBOARD_CONNECTS_REMAINING,
  SELLER_DASHBOARD_MY_SERVICES,
  SELLER_DASHBOARD_QUICK_ACTIONS,
  SELLER_DASHBOARD_SEARCH_PLACEHOLDER,
  SELLER_DASHBOARD_SEE_ALL,
  SELLER_DASHBOARD_TITLE,
  SELLER_DASHBOARD_WELCOME_PREFIX,
  SELLER_STAT_BOOKINGS,
  SELLER_STAT_COMPLETED_BOOKINGS,
  SELLER_STAT_EARNINGS,
  SELLER_STAT_RATING,
  SELLER_TABS,
  SELLER_WORK_TABS,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { getSellerConnectsBalanceApi, getSellerStatsApi } from '../../services/sellerService';
import { heightPercentageToDP as hp } from '../../utils';
import { formatAppCurrency, formatAppPrice } from '../../utils/currency';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const ACTIVE_BOOKINGS_LIMIT = 4;

const getStatusStyle = status => {
  if (status === 'Completed') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'Pending') return { bg: '#FFF4E5', text: '#C27803' };
  if (status === 'Amidst-Completion') return { bg: '#F0E8FF', text: purpleColor };
  return { bg: '#E8F0F8', text: '#3B6981' };
};

const formatDashboardStatus = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'ongoing' || normalized === 'active' || normalized === 'in_progress') {
    return 'Ongoing';
  }
  if (normalized === 'amidst_completion' || normalized === 'amidst_completion_process') {
    return 'Amidst-Completion';
  }
  if (normalized === 'completed') return 'Completed';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled';
  if (!normalized) return '—';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, ' ');
};

const formatDashboardDate = dateStr => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const capitalizeTitle = value => {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const isActiveBookingStatus = status => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  return (
    normalized === 'pending' ||
    normalized === 'ongoing' ||
    normalized === 'active' ||
    normalized === 'in_progress'
  );
};

const mapActiveBooking = booking => {
  const amount = Number(booking?.amount ?? booking?.total ?? 0) || 0;
  const buyerName = booking?.buyer?.name || booking?.buyer_name || 'Buyer';
  const title =
    booking?.title || booking?.service?.title || booking?.job?.title || 'Booking';

  return {
    id: String(booking.id),
    title: capitalizeTitle(title),
    client: buyerName,
    status: formatDashboardStatus(booking.status),
    price: formatAppPrice(amount),
    meta: formatDashboardDate(booking.createdAt || booking.created_at),
  };
};

const INITIAL_STAT_CARDS = [
  {
    id: 'bookings',
    title: SELLER_STAT_BOOKINGS,
    value: '0',
    icon: 'calendar',
    iconColor: redColor,
    iconBg: lightPink,
  },
  {
    id: 'earnings',
    title: SELLER_STAT_EARNINGS,
    value: formatAppCurrency(0, { whole: true }),
    icon: 'trending-up',
    iconColor: blueColor,
    iconBg: '#E8F0F8',
  },
  {
    id: 'rating',
    title: SELLER_STAT_RATING,
    value: '0',
    icon: 'star',
    iconColor: purpleColor,
    iconBg: '#F3E8FF',
  },
  {
    id: 'completed',
    title: SELLER_STAT_COMPLETED_BOOKINGS,
    value: '0',
    icon: 'check-circle',
    iconColor: greenColor,
    iconBg: '#E8F8EE',
  },
];

const mapSellerStatsToDashboardCards = stats =>
  INITIAL_STAT_CARDS.map(card => {
    switch (card.id) {
      case 'bookings':
        return { ...card, value: String(stats?.activeBookings ?? 0) };
      case 'earnings':
        return {
          ...card,
          value: formatAppCurrency(stats?.totalEarnings ?? 0, { whole: true }),
        };
      case 'rating':
        return { ...card, value: String(stats?.avgRating ?? '0') };
      case 'completed':
        return { ...card, value: String(stats?.completedBookings ?? 0) };
      default:
        return card;
    }
  });

const extractConnectsBalance = response => {
  const data = response?.data ?? response ?? {};
  const available =
    Number(data.available ?? data.available_connects ?? data.connects_balance ?? data.balance ?? 0) || 0;
  const purchased = Number(data.total_purchased ?? data.purchased ?? 0) || 0;
  return { remaining: available, total: purchased > 0 ? purchased : Math.max(available, 1) };
};

const SellerDashboardScreen = ({ navigation }) => {
  const { user, token } = useSelector(selectAuth);
  const welcomeName = user?.name || user?.fullName || 'there';
  const [searchQuery, setSearchQuery] = useState('');
  const [connects, setConnects] = useState({ remaining: 0, total: 1 });
  const [statCards, setStatCards] = useState(INITIAL_STAT_CARDS);
  const [activeBookings, setActiveBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [quickActions] = useState([
    { id: '1', title: SELLER_DASHBOARD_BROWSE_JOBS, icon: 'search', color: redColor },
    { id: '2', title: SELLER_DASHBOARD_MY_SERVICES, icon: 'layers', color: '#3B6981' },
  ]);

  const tabNavigation = navigation.getParent();
  const connectsProgress = connects.remaining / connects.total;
  const heroStat = statCards.find(card => card.id === 'earnings') || statCards[0];
  const secondaryStats = statCards.filter(card => card.id !== 'earnings');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchDashboardData = async () => {
        if (!token) {
          console.log('[SellerDashboard] Skipped — no token');
          return;
        }

        setIsBookingsLoading(true);
        try {
          const [statsResponse, connectsResponse] = await Promise.all([
            getSellerStatsApi(token),
            getSellerConnectsBalanceApi(token).catch(() => null),
          ]);
          if (cancelled) return;

          if (connectsResponse) {
            setConnects(extractConnectsBalance(connectsResponse));
          }

          console.log(
            '[SellerDashboard] Stats response <<<',
            JSON.stringify(statsResponse, null, 2),
          );

          const stats = statsResponse?.data?.stats || {};
          const recentBookings = Array.isArray(statsResponse?.data?.recentBookings)
            ? statsResponse.data.recentBookings
            : [];

          setStatCards(mapSellerStatsToDashboardCards(stats));
          setActiveBookings(
            recentBookings
              .filter(booking => isActiveBookingStatus(booking?.status))
              .slice(0, ACTIVE_BOOKINGS_LIMIT)
              .map(mapActiveBooking),
          );
        } catch (error) {
          if (!cancelled) {
            setActiveBookings([]);
            setStatCards(INITIAL_STAT_CARDS);
          }
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

  const goToJobs = () => {
    tabNavigation?.navigate(SELLER_TABS.JOBS_STACK, { screen: SCREEN_NAMES.SELLER_JOBS });
  };

  const goToWorkBookings = () => {
    tabNavigation?.navigate(SELLER_TABS.WORK_STACK, {
      screen: SCREEN_NAMES.SELLER_WORK,
      params: { initialTab: SELLER_WORK_TABS.BOOKINGS },
    });
  };

  const goToConnects = () => {
    tabNavigation?.navigate(SELLER_TABS.PROFILE_STACK, { screen: SCREEN_NAMES.SELLER_CONNECTS });
  };

  const goToServices = () => {
    tabNavigation?.navigate(SELLER_TABS.PROFILE_STACK, { screen: SCREEN_NAMES.SELLER_MY_SERVICES });
  };

  const handleQuickAction = actionId => {
    if (actionId === '1') goToJobs();
    else if (actionId === '2') goToServices();
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}>
        <ScreenHeader
          title={SELLER_DASHBOARD_TITLE}
          navigation={navigation}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={SELLER_DASHBOARD_SEARCH_PLACEHOLDER}
        />

        <View style={styles.welcomeCard}>
          <Text style={[styles.welcomeText, style.fontWeightMedium]}>
            {SELLER_DASHBOARD_WELCOME_PREFIX} {welcomeName} 👋
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, flexDirectionRow, alignItemsCenter]}
            onPress={goToJobs}>
            <Icon name="briefcase" size={14} color={redColor} />
            <Text style={[styles.browseBtnText, style.fontWeightMedium]}>{SELLER_DASHBOARD_BROWSE_JOBS}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={[styles.countSummaryCard, flexDirectionRow, alignItemsCenter]}>
            {secondaryStats.map((card, index) => (
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
                {index < secondaryStats.length - 1 ? <View style={styles.countDivider} /> : null}
              </React.Fragment>
            ))}
          </View>

          <View style={[styles.heroStatCard, flexDirectionRow, alignItemsCenter]}>
            <View
              style={[
                styles.heroIconWrap,
                alignJustifyCenter,
                { backgroundColor: heroStat.iconBg },
              ]}>
              <Icon name={heroStat.icon} size={20} color={heroStat.iconColor} />
            </View>
            <View style={styles.heroStatInfo}>
              <Text style={[styles.heroStatLabel, style.fontWeightThin]}>{heroStat.title}</Text>
              <Text style={[styles.heroStatValue, style.fontWeightMedium]} numberOfLines={1}>
                {heroStat.value}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.connectsCard}>
          <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <View>
              <Text style={[styles.connectsTitle, style.fontWeightMedium]}>{SELLER_DASHBOARD_CONNECTS}</Text>
              <Text style={[styles.connectsValue, style.fontWeightMedium]}>
                {connects.remaining} {SELLER_DASHBOARD_CONNECTS_REMAINING}
              </Text>
            </View>
            <Icon name="link" size={22} color={redColor} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${connectsProgress * 100}%` }]} />
          </View>
          <TouchableOpacity style={[styles.buyConnectsBtn, alignJustifyCenter]} onPress={goToConnects}>
            <Text style={[styles.buyConnectsText, style.fontWeightMedium]}>{SELLER_DASHBOARD_BUY_CONNECTS}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{SELLER_DASHBOARD_QUICK_ACTIONS}</Text>
        <View style={styles.quickActionsCard}>
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.quickActionRow,
                flexDirectionRow,
                alignItemsCenter,
                index < quickActions.length - 1 && styles.rowBorder,
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

        <View style={[styles.sectionHeader, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <Text style={[styles.sectionTitle, style.fontWeightMedium, styles.sectionTitleNoMargin]}>
            {SELLER_DASHBOARD_ACTIVE_BOOKINGS}
          </Text>
          <TouchableOpacity onPress={goToWorkBookings}>
            <Text style={[styles.seeAll, style.fontWeightMedium]}>{SELLER_DASHBOARD_SEE_ALL}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {isBookingsLoading ? (
            <View style={styles.bookingsLoader}>
              <ActivityIndicator size="small" color={redColor} />
            </View>
          ) : activeBookings.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={EMPTY_DASHBOARD_BOOKINGS_TITLE}
              message={EMPTY_DASHBOARD_BOOKINGS_MESSAGE}
              compact
            />
          ) : (
            activeBookings.map((item, index) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={goToWorkBookings}
                  style={[
                    styles.bookingRow,
                    flexDirectionRow,
                    alignItemsCenter,
                    index < activeBookings.length - 1 && styles.rowBorder,
                  ]}>
                  <View style={styles.bookingInfo}>
                    <Text style={[styles.bookingTitle, style.fontWeightMedium]}>{item.title}</Text>
                    <Text style={[styles.bookingMeta, style.fontWeightThin]}>Client: {item.client}</Text>
                    <View style={[styles.statusChip, { backgroundColor: statusStyle.bg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.bookingRight}>
                    <Text style={[styles.bookingPrice, style.fontWeightMedium]}>{item.price}</Text>
                    <Text style={[styles.bookingMeta, style.fontWeightThin]}>{item.meta}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerDashboardScreen;

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
  browseBtn: {
    alignSelf: 'flex-start',
    backgroundColor: whiteColor,
    borderRadius: 8,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    gap: 6,
  },
  browseBtnText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  statsSection: {
    marginBottom: hp(1.8),
    gap: spacings.normal,
  },
  heroStatCard: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.xLarge,
    paddingVertical: spacings.large,
    gap: spacings.large,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  heroStatInfo: {
    flex: 1,
    minWidth: 0,
  },
  heroStatLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: style.fontSizeLargeXX.fontSize,
    color: blackColor,
  },
  countSummaryCard: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingVertical: spacings.xLarge,
    paddingHorizontal: spacings.small,
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
  sectionHeader: { marginBottom: spacings.normal },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
  },
  sectionTitleNoMargin: { marginBottom: 0 },
  seeAll: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  connectsCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
    marginBottom: hp(2),
    gap: spacings.normal,
  },
  connectsTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 4,
  },
  connectsValue: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: redColor,
  },
  buyConnectsBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
  },
  buyConnectsText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
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
    paddingVertical: hp(3),
    alignItems: 'center',
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
  bookingInfo: { flex: 1, gap: 4 },
  bookingTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  bookingMeta: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  bookingRight: { alignItems: 'flex-end', gap: 6 },
  bookingPrice: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  statusChip: {
    borderRadius: 10,
    paddingHorizontal: spacings.normal,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '600',
  },
  acceptBtn: {
    backgroundColor: greenColor,
    borderRadius: 6,
    paddingHorizontal: spacings.normal,
    paddingVertical: 4,
  },
  acceptBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeExtraSmall.fontSize,
  },
});
