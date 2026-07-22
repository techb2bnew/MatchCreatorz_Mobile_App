import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
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
  BUYER_TABS,
  DELETE_NOTIFICATION_MESSAGE,
  DELETE_NOTIFICATION_TITLE,
  ERROR_DELETE_NOTIFICATION_FAILED,
  JOBS_BOOKINGS_TABS,
  MARK_ALL_READ,
  MY_JOBS_SUB_TABS,
  NOTIFICATION_FILTER_LABELS,
  NOTIFICATION_FILTER_TABS,
  NOTIFICATIONS_TITLE,
  EMPTY_NOTIFICATIONS_MESSAGE,
  EMPTY_NOTIFICATIONS_TITLE,
  SCREEN_NAMES,
  SELLER_TABS,
  SELLER_WORK_TABS,
  USER_ROLES,
} from '../constans/Constants';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import { getApiErrorMessage } from '../services/apiClient';
import { selectAuth, selectAppRole } from '../redux/slices/authSlice';
import { fetchUnreadNotificationsCount } from '../redux/slices/notificationsSlice';
import {
  getBuyerNotificationsApi,
  markBuyerNotificationReadApi,
  markAllBuyerNotificationsReadApi,
  deleteBuyerNotificationApi,
} from '../services/buyerService';
import {
  getSellerNotificationsApi,
  markSellerNotificationReadApi,
  markAllSellerNotificationsReadApi,
  deleteSellerNotificationApi,
} from '../services/sellerService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const NOTIFICATIONS_PAGE_LIMIT = 50;

const CATEGORY_ICON_CONFIG = {
  bookings: { icon: 'calendar', iconColor: blueColor, iconBg: '#E8F0F8' },
  payments: { icon: 'credit-card', iconColor: greenColor, iconBg: '#E8F8EE' },
  jobs: { icon: 'briefcase', iconColor: blueColor, iconBg: '#E8F0F8' },
  system: { icon: 'bell', iconColor: redColor, iconBg: lightPink },
};

const normalizeCategory = value => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized.includes('book')) return 'bookings';
  if (normalized.includes('pay') || normalized.includes('wallet') || normalized.includes('refund')) {
    return 'payments';
  }
  if (normalized.includes('job') || normalized.includes('bid') || normalized.includes('offer')) {
    return 'jobs';
  }
  return 'system';
};

const extractReferenceId = (n, keys) => {
  for (const key of keys) {
    const value = n?.[key];
    if (value != null && value !== '') return String(value);
  }
  return null;
};

const extractNotificationsList = response => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(response?.notifications)) return response.notifications;
  return [];
};

const formatRelativeTime = dateStr => {
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

const mapApiNotificationToUi = n => {
  const category = normalizeCategory(n?.type || n?.category || n?.notification_type);
  const config = CATEGORY_ICON_CONFIG[category];
  const data = n?.data || {};

  return {
    id: String(n?.id),
    title: n?.title || n?.subject || 'Notification',
    message: n?.message || n?.body || n?.description || '',
    time: formatRelativeTime(n?.created_at || n?.createdAt),
    category,
    read: Boolean(n?.read ?? n?.is_read ?? n?.isRead),
    icon: config.icon,
    iconColor: config.iconColor,
    iconBg: config.iconBg,
    bookingId: extractReferenceId(n, ['booking_id', 'bookingId']) || extractReferenceId(data, ['booking_id', 'bookingId']),
    jobId: extractReferenceId(n, ['job_id', 'jobId']) || extractReferenceId(data, ['job_id', 'jobId']),
  };
};

const NotificationsScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);
  const role = useSelector(selectAppRole);
  const dispatch = useDispatch();
  const isSeller = role === USER_ROLES.CREATOR;

  const [activeFilter, setActiveFilter] = useState(NOTIFICATION_FILTER_TABS.ALL);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ visible: false, item: null, loading: false, error: '' });

  const refreshUnreadBadge = useCallback(() => {
    if (token && role) dispatch(fetchUnreadNotificationsCount({ token, role }));
  }, [dispatch, token, role]);

  const fetchNotifications = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!token) return;

      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const getApi = isSeller ? getSellerNotificationsApi : getBuyerNotificationsApi;
        const response = await getApi(token, { page: 1, limit: NOTIFICATIONS_PAGE_LIMIT });
        setNotifications(extractNotificationsList(response).map(mapApiNotificationToUi));
      } catch (error) {
        if (!isRefresh) setNotifications([]);
      } finally {
        if (isRefresh) setIsRefreshing(false);
        else setIsLoading(false);
      }
    },
    [token, isSeller],
  );

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      refreshUnreadBadge();
    }, [fetchNotifications, refreshUnreadBadge]),
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === NOTIFICATION_FILTER_TABS.ALL) return notifications;
    return notifications.filter(n => n.category === activeFilter);
  }, [notifications, activeFilter]);

  const handleMarkAllRead = async () => {
    if (!token || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      const markAllApi = isSeller ? markAllSellerNotificationsReadApi : markAllBuyerNotificationsReadApi;
      await markAllApi(token);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refreshUnreadBadge();
    } catch (error) {
      // Best-effort — list stays as-is, user can retry via the button again.
    } finally {
      setIsMarkingAll(false);
    }
  };

  const routeToNotificationTarget = item => {
    if (isSeller) {
      if (item.category === 'bookings') {
        navigation.navigate(SCREEN_NAMES.SELLER_TABS, {
          screen: SELLER_TABS.WORK_STACK,
          params: { screen: SCREEN_NAMES.SELLER_WORK, params: { initialTab: SELLER_WORK_TABS.BOOKINGS } },
        });
      } else if (item.category === 'jobs') {
        navigation.navigate(SCREEN_NAMES.SELLER_TABS, {
          screen: SELLER_TABS.WORK_STACK,
          params: { screen: SCREEN_NAMES.SELLER_WORK, params: { initialTab: SELLER_WORK_TABS.BIDS } },
        });
      } else if (item.category === 'payments') {
        navigation.navigate(SCREEN_NAMES.SELLER_TABS, {
          screen: SELLER_TABS.PROFILE_STACK,
          params: { screen: SCREEN_NAMES.SELLER_WALLET },
        });
      }
      return;
    }

    if (item.category === 'bookings') {
      navigation.navigate(SCREEN_NAMES.BUYER_TABS, {
        screen: BUYER_TABS.JOBS_STACK,
        params: { screen: SCREEN_NAMES.JOBS_BOOKINGS, params: { initialTab: JOBS_BOOKINGS_TABS.BOOKINGS } },
      });
    } else if (item.category === 'jobs') {
      navigation.navigate(SCREEN_NAMES.BUYER_TABS, {
        screen: BUYER_TABS.JOBS_STACK,
        params: {
          screen: SCREEN_NAMES.JOBS_BOOKINGS,
          params: { initialTab: JOBS_BOOKINGS_TABS.JOBS, initialJobsSubTab: MY_JOBS_SUB_TABS.POSTED },
        },
      });
    } else if (item.category === 'payments') {
      navigation.navigate(SCREEN_NAMES.BUYER_TABS, {
        screen: BUYER_TABS.WALLET_STACK,
        params: { screen: SCREEN_NAMES.WALLET },
      });
    }
    // 'system' category has no specific destination — stays on the Notifications screen.
  };

  const handleNotificationPress = async item => {
    if (!item.read && token) {
      setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, read: true } : n)));
      refreshUnreadBadge();

      try {
        const markReadApi = isSeller ? markSellerNotificationReadApi : markBuyerNotificationReadApi;
        await markReadApi(token, item.id);
      } catch (error) {
        // Best-effort — UI already reflects read state optimistically.
      }
    }

    routeToNotificationTarget(item);
  };

  const openDeleteConfirm = item => {
    setDeleteModal({ visible: true, item, loading: false, error: '' });
  };

  const closeDeleteConfirm = () => {
    if (deleteModal.loading) return;
    setDeleteModal({ visible: false, item: null, loading: false, error: '' });
  };

  const handleConfirmDelete = async () => {
    const item = deleteModal.item;
    if (!item || !token || deleteModal.loading) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const deleteApi = isSeller ? deleteSellerNotificationApi : deleteBuyerNotificationApi;
      await deleteApi(token, item.id);
      setNotifications(prev => prev.filter(n => n.id !== item.id));
      if (!item.read) refreshUnreadBadge();
      setDeleteModal({ visible: false, item: null, loading: false, error: '' });
    } catch (error) {
      setDeleteModal(prev => ({
        ...prev,
        loading: false,
        error: getApiErrorMessage(error?.data, error?.message || ERROR_DELETE_NOTIFICATION_FAILED),
      }));
    }
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
            disabled={isMarkingAll}
            activeOpacity={0.7}>
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={redColor} />
            ) : (
              <>
                <Icon name="check" size={11} color={redColor} />
                <Text
                  style={[styles.markAllText, style.fontWeightMedium]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}>
                  {MARK_ALL_READ}
                </Text>
              </>
            )}
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

        {isLoading ? (
          <View style={[flex, alignJustifyCenter]}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchNotifications({ isRefresh: true })}
                colors={[redColor]}
                tintColor={redColor}
              />
            }>
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
                  onPress={() => handleNotificationPress(item)}
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
                      <View style={[flexDirectionRow, alignItemsCenter, styles.notifTopRight]}>
                        <Text style={styles.notifTime}>{item.time}</Text>
                        <TouchableOpacity
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => openDeleteConfirm(item)}
                          style={styles.deleteIconBtn}>
                          <Icon name="trash-2" size={14} color={grayColor} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={[styles.notifMessage, style.fontWeightThin]} numberOfLines={2}>
                      {item.message}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <ConfirmationModal
        visible={deleteModal.visible}
        title={DELETE_NOTIFICATION_TITLE}
        message={deleteModal.error || DELETE_NOTIFICATION_MESSAGE}
        confirmText="Yes, Delete"
        iconName="trash-2"
        loading={deleteModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteConfirm}
      />
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
    justifyContent: 'center',
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
    flexGrow: 1,
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
  notifTopRight: {
    gap: spacings.small,
    flexShrink: 0,
  },
  notifTime: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    flexShrink: 0,
  },
  deleteIconBtn: {
    padding: 2,
  },
  notifMessage: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 4,
    lineHeight: 18,
  },
});
