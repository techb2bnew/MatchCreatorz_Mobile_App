import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
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
  SELLER_STAT_EARNINGS,
  SELLER_STAT_RATING,
  SELLER_STAT_WALLET,
  SELLER_STATIC_USER,
  SELLER_TABS,
  SELLER_WORK_TABS,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import { heightPercentageToDP as hp } from '../../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const getStatusStyle = status => {
  if (status === 'Completed') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'Pending') return { bg: '#FFF4E5', text: '#C27803' };
  if (status === 'Amidst-Completion') return { bg: '#F0E8FF', text: purpleColor };
  return { bg: '#E8F0F8', text: '#3B6981' };
};

const SellerDashboardScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [connects] = useState({ remaining: 48, total: 100 });
  const [statCards] = useState([
    {
      id: 'wallet',
      title: SELLER_STAT_WALLET,
      value: '₹2,36,000',
      subtitle: 'Available to withdraw',
      icon: 'credit-card',
    },
    {
      id: 'bookings',
      title: SELLER_STAT_BOOKINGS,
      value: '7',
      subtitle: '2 need attention',
      icon: 'calendar',
    },
    {
      id: 'earnings',
      title: SELLER_STAT_EARNINGS,
      value: '₹15,10,000',
      subtitle: 'All time',
      icon: 'trending-up',
    },
    {
      id: 'rating',
      title: SELLER_STAT_RATING,
      value: '4.8',
      subtitle: '124 reviews',
      icon: 'star',
    },
  ]);
  const [activeBookings] = useState([
    {
      id: '1',
      title: 'Logo Design',
      client: 'Alice J.',
      status: 'Ongoing',
      price: '₹20,750',
      meta: '3d left',
      action: null,
    },
    {
      id: '2',
      title: 'Website Redesign',
      client: 'Bob S.',
      status: 'Amidst-Completion',
      price: '₹66,000',
      meta: '5d left',
      action: null,
    },
    {
      id: '3',
      title: 'Social Media Kit',
      client: 'Carol M.',
      status: 'Pending',
      price: '₹18,200',
      meta: null,
      action: 'Accept',
    },
  ]);
  const [quickActions] = useState([
    { id: '1', title: SELLER_DASHBOARD_BROWSE_JOBS, icon: 'search', color: redColor },
    { id: '2', title: SELLER_DASHBOARD_MY_SERVICES, icon: 'layers', color: '#3B6981' },
  ]);

  const tabNavigation = navigation.getParent();
  const connectsProgress = connects.remaining / connects.total;

  const goToJobs = () => {
    tabNavigation?.navigate(SELLER_TABS.JOBS_STACK, { screen: SCREEN_NAMES.SELLER_JOBS });
  };

  const goToWorkBookings = () => {
    tabNavigation?.navigate(SELLER_TABS.WORK_STACK, {
      screen: SCREEN_NAMES.SELLER_WORK,
      params: { initialTab: SELLER_WORK_TABS.BOOKINGS },
    });
  };

  const goToWallet = () => {
    tabNavigation?.navigate(SELLER_TABS.PROFILE_STACK, { screen: SCREEN_NAMES.SELLER_WALLET });
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
          user={SELLER_STATIC_USER}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={SELLER_DASHBOARD_SEARCH_PLACEHOLDER}
        />

        <View style={styles.welcomeCard}>
          <Text style={[styles.welcomeText, style.fontWeightMedium]}>
            {SELLER_DASHBOARD_WELCOME_PREFIX} {SELLER_STATIC_USER.name} 👋
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, flexDirectionRow, alignItemsCenter]}
            onPress={goToJobs}>
            <Icon name="briefcase" size={14} color={redColor} />
            <Text style={[styles.browseBtnText, style.fontWeightMedium]}>{SELLER_DASHBOARD_BROWSE_JOBS}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map(card => (
            <TouchableOpacity
              key={card.id}
              style={styles.statCard}
              activeOpacity={card.id === 'wallet' ? 0.7 : 1}
              onPress={card.id === 'wallet' ? goToWallet : undefined}>
              <View style={[styles.statIconWrap, alignJustifyCenter]}>
                <Icon name={card.icon} size={16} color={redColor} />
              </View>
              <Text style={[styles.statTitle, style.fontWeightThin]} numberOfLines={1}>
                {card.title}
              </Text>
              <Text style={[styles.statValue, style.fontWeightMedium]} numberOfLines={1}>
                {card.value}
              </Text>
              <Text style={[styles.statSubtitle, style.fontWeightThin]} numberOfLines={2}>
                {card.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
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
          {activeBookings.map((item, index) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View
                key={item.id}
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
                  {item.action ? (
                    <TouchableOpacity style={styles.acceptBtn}>
                      <Text style={[styles.acceptBtnText, style.fontWeightMedium]}>{item.action}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.bookingMeta, style.fontWeightThin]}>{item.meta}</Text>
                  )}
                </View>
              </View>
            );
          })}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: lightPink,
    marginBottom: spacings.normal,
  },
  statTitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: 4,
  },
  statValue: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
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
