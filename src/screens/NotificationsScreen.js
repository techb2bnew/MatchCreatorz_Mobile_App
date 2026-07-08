import React, { useMemo, useState } from 'react';
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
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
  tabBgColor,
  whiteColor,
  blueColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  MARK_ALL_READ,
  NOTIFICATION_FILTER_LABELS,
  NOTIFICATION_FILTER_TABS,
  NOTIFICATIONS_TITLE,
  EMPTY_NOTIFICATIONS_MESSAGE,
  EMPTY_NOTIFICATIONS_TITLE,
} from '../constans/Constants';
import EmptyState from '../components/EmptyState';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const NotificationsScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState(NOTIFICATION_FILTER_TABS.ALL);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Booking Confirmed',
      message: 'Your booking for Logo Design with Bob Smith is confirmed.',
      time: '5m ago',
      category: 'bookings',
      read: false,
      icon: 'calendar',
      iconColor: blueColor,
      iconBg: '#E8F0F8',
    },
    {
      id: '2',
      title: 'Order Delivered',
      message: 'Bob Smith has delivered your Logo Design order. Please review.',
      time: '2h ago',
      category: 'bookings',
      read: false,
      icon: 'calendar',
      iconColor: blueColor,
      iconBg: '#E8F0F8',
    },
    {
      id: '3',
      title: 'Payment Successful',
      message: 'Your payment of $75 for Logo Design was successful.',
      time: '3h ago',
      category: 'payments',
      read: true,
      icon: 'credit-card',
      iconColor: greenColor,
      iconBg: '#E8F8EE',
    },
    {
      id: '4',
      title: 'New Offer Received',
      message: 'Frank Miller sent you an offer for your WordPress job post.',
      time: '6h ago',
      category: 'system',
      read: false,
      icon: 'bell',
      iconColor: redColor,
      iconBg: lightPink,
    },
    {
      id: '5',
      title: 'Booking Cancelled',
      message: 'Your booking #B-2031 has been cancelled and refunded.',
      time: '1d ago',
      category: 'bookings',
      read: true,
      icon: 'calendar',
      iconColor: blueColor,
      iconBg: '#E8F0F8',
    },
    {
      id: '6',
      title: 'Refund Processed',
      message: 'Refund of $120 has been credited to your wallet.',
      time: '2d ago',
      category: 'payments',
      read: true,
      icon: 'credit-card',
      iconColor: greenColor,
      iconBg: '#E8F8EE',
    },
    {
      id: '7',
      title: 'Job Post Closed',
      message: "Your job post 'Logo Design for My Bakery' has been auto-closed.",
      time: '3d ago',
      category: 'system',
      read: true,
      icon: 'bell',
      iconColor: redColor,
      iconBg: lightPink,
    },
    {
      id: '8',
      title: 'New Proposal',
      message: 'You have 3 new proposals on your WordPress job post.',
      time: '5d ago',
      category: 'bookings',
      read: true,
      icon: 'calendar',
      iconColor: blueColor,
      iconBg: '#E8F0F8',
    },
  ]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === NOTIFICATION_FILTER_TABS.ALL) return notifications;
    return notifications.filter(n => n.category === activeFilter);
  }, [notifications, activeFilter]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationPress = id => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>

          <Text
            style={[styles.title, style.fontWeightMedium]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {NOTIFICATIONS_TITLE}
          </Text>

          <TouchableOpacity
            style={[styles.markAllBtn, flexDirectionRow, alignItemsCenter]}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}>
            <Icon name="check" size={11} color={redColor} />
            <Text
              style={[styles.markAllText, style.fontWeightMedium]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}>
              {MARK_ALL_READ}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
            {Object.values(NOTIFICATION_FILTER_TABS).map(key => (
              <TouchableOpacity
                key={key}
                style={[styles.filterTab, alignJustifyCenter, activeFilter === key && styles.filterTabActive]}
                onPress={() => setActiveFilter(key)}>
                <Text
                  style={[
                    styles.filterTabText,
                    style.fontWeightMedium,
                    activeFilter === key && styles.filterTabTextActive,
                  ]}>
                  {NOTIFICATION_FILTER_LABELS[key.toUpperCase()]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon="bell"
              title={EMPTY_NOTIFICATIONS_TITLE}
              message={EMPTY_NOTIFICATIONS_MESSAGE}
            />
          ) : (
            filteredNotifications.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleNotificationPress(item.id)}
                style={[
                  styles.notifCard,
                  flexDirectionRow,
                  !item.read && styles.notifCardUnread,
                ]}>
                {!item.read ? <View style={styles.unreadBar} /> : null}
                <View style={[styles.notifIconWrap, alignJustifyCenter, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon} size={16} color={item.iconColor} />
                </View>
                <View style={styles.notifContent}>
                  <View style={[flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
                    <Text style={[styles.notifTitle, style.fontWeightMedium]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                  <Text style={[styles.notifMessage, style.fontWeightThin]} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

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
    marginBottom: hp(1),
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
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
  },
  markAllBtn: {
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: wp(2),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.7),
    gap: wp(1),
    flexShrink: 0,
    maxWidth: wp(34),
    minWidth: wp(22),
  },
  markAllText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: redColor,
    flexShrink: 1,
  },
  filterRow: {
    width: '100%',
    marginBottom: hp(1.5),
  },
  filterTabs: {
    gap: wp(2),
  },
  filterTab: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    backgroundColor: tabBgColor,
    marginRight: wp(2),
  },
  filterTabActive: {
    backgroundColor: redColor,
  },
  filterTabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  filterTabTextActive: {
    color: whiteColor,
  },
  listContent: {
    paddingBottom: hp(3),
    gap: spacings.normal,
  },
  notifCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    gap: spacings.normal,
    overflow: 'hidden',
  },
  notifCardUnread: {
    backgroundColor: lightPink,
    borderColor: '#FFD6D6',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: redColor,
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginRight: spacings.normal,
  },
  notifTime: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    flexShrink: 0,
  },
  notifMessage: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyWrap: {
    paddingVertical: hp(10),
    gap: spacings.large,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: inputBgColor,
  },
  emptyText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
  },
});
