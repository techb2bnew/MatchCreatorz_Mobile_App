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
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
  screenBgColor,
  whiteColor,
  goldColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  BUYER_STATIC_USER,
  BUYER_TABS,
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
} from '../constans/Constants';
import SearchBar from '../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const getStatusStyle = status => {
  if (status === 'Completed') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'In Review') return { bg: '#FFF4E5', text: '#C27803' };
  return { bg: lightPink, text: redColor };
};

const DashboardScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [promoStats] = useState([
    { id: '1', value: '12,000+', label: 'Creators' },
    { id: '2', value: '4.8', label: 'Avg Rating' },
    { id: '3', value: '98%', label: 'Satisfied' },
  ]);
  const [countCards] = useState([
    {
      id: 'wallet',
      title: 'Wallet Balance',
      value: '₹2,500',
      subtitle: 'Available to spend',
      icon: 'credit-card',
    },
    {
      id: 'bookings',
      title: 'Active Bookings',
      value: '3',
      subtitle: '1 needs attention',
      icon: 'calendar',
    },
    {
      id: 'jobs',
      title: 'Jobs Posted',
      value: '5',
      subtitle: '2 receiving bids',
      icon: 'briefcase',
    },
  ]);
  const [quickActions] = useState([
    { id: '1', title: 'Post a New Job', icon: 'plus-circle', color: '#E94545' },
    { id: '2', title: 'Browse Creators', icon: 'search', color: '#3B6981' },
    { id: '3', title: 'View Bookings', icon: 'calendar', color: '#9B51E0' },
    { id: '4', title: 'Add Wallet Money', icon: 'credit-card', color: '#FFA928' },
  ]);
  const [recentBookings] = useState([
    {
      id: '1',
      title: 'Logo Design',
      creator: 'Alex Johnson',
      date: '05 Jul 2026',
      price: '₹2,500',
      status: 'Ongoing',
    },
    {
      id: '2',
      title: 'Website Redesign',
      creator: 'Priya Sharma',
      date: '02 Jul 2026',
      price: '₹8,000',
      status: 'In Review',
    },
    {
      id: '3',
      title: 'Social Media Kit',
      creator: 'Rahul Mehta',
      date: '28 Jun 2026',
      price: '₹3,200',
      status: 'Completed',
    },
    {
      id: '4',
      title: 'Product Shoot',
      creator: 'Anita Verma',
      date: '20 Jun 2026',
      price: '₹4,500',
      status: 'Completed',
    },
  ]);
  const [topCreators] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      specialty: 'UI/UX Design',
      price: '₹1,500',
      rating: '4.9',
      initials: 'AJ',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      specialty: 'Brand Design',
      price: '₹2,000',
      rating: '4.8',
      initials: 'PS',
    },
    {
      id: '3',
      name: 'Rahul Mehta',
      specialty: 'Video Editing',
      price: '₹1,800',
      rating: '4.7',
      initials: 'RM',
    },
    {
      id: '4',
      name: 'Anita Verma',
      specialty: 'Photography',
      price: '₹2,200',
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
            {DASHBOARD_WELCOME_PREFIX} {BUYER_STATIC_USER.name} 👋
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

        {/* Count cards — 2 on top, Jobs Posted full width */}
        <View style={styles.countGrid}>
          <View style={[styles.countTopRow, flexDirectionRow]}>
            {countCards.slice(0, 2).map(card => (
              <View key={card.id} style={styles.countCard}>
                <View style={[styles.countIconWrap, alignJustifyCenter]}>
                  <Icon name={card.icon} size={16} color={redColor} />
                </View>
                <Text style={[styles.countTitle, style.fontWeightThin]} numberOfLines={1}>
                  {card.title}
                </Text>
                <Text style={[styles.countValue, style.fontWeightMedium]} numberOfLines={1}>
                  {card.value}
                </Text>
                <Text style={[styles.countSubtitle, style.fontWeightThin]} numberOfLines={2}>
                  {card.subtitle}
                </Text>
              </View>
            ))}
          </View>

          {countCards[2] ? (
            <View
              style={[
                styles.countCard,
                styles.countCardFull,
                flexDirectionRow,
                alignItemsCenter,
                justifyContentSpaceBetween,
              ]}>
              <View style={[flexDirectionRow, alignItemsCenter, styles.countFullLeft]}>
                <View style={[styles.countIconWrap, styles.countIconWrapFull, alignJustifyCenter]}>
                  <Icon name={countCards[2].icon} size={16} color={redColor} />
                </View>
                <View style={styles.countTextWrap}>
                  <Text style={[styles.countTitle, styles.countTitleFull, style.fontWeightThin]} numberOfLines={1}>
                    {countCards[2].title}
                  </Text>
                  <Text style={[styles.countSubtitle, style.fontWeightThin]} numberOfLines={1}>
                    {countCards[2].subtitle}
                  </Text>
                </View>
              </View>
              <Text style={[styles.countValue, styles.countValueFull, style.fontWeightMedium]}>
                {countCards[2].value}
              </Text>
            </View>
          ) : null}
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
          {recentBookings.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={EMPTY_DASHBOARD_BOOKINGS_TITLE}
              message={EMPTY_DASHBOARD_BOOKINGS_MESSAGE}
              actionLabel={DASHBOARD_POST_JOB}
              onAction={goToPostJob}
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
  countGrid: {
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  countTopRow: {
    gap: spacings.normal,
  },
  countCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
  },
  countCardFull: {
    flex: 0,
    width: '100%',
  },
  countFullLeft: {
    flex: 1,
    gap: spacings.normal,
    minWidth: 0,
    paddingRight: spacings.normal,
  },
  countIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: lightPink,
    marginBottom: spacings.normal,
  },
  countIconWrapFull: {
    marginBottom: 0,
    flexShrink: 0,
  },
  countTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  countTitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: 4,
  },
  countTitleFull: {
    marginBottom: 2,
  },
  countValue: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  countValueFull: {
    marginBottom: 0,
    flexShrink: 0,
  },
  countSubtitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
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
