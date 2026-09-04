import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
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
  lightPink,
  redColor,
  whiteColor,
  blueColor,
  purpleColor,
} from '../constans/Color';
import { style } from '../constans/Fonts';
import {
  CHAT_MESSAGES_TITLE,
  CHAT_SEARCH_PLACEHOLDER,
  CHAT_UNREAD_LABEL,
  EMPTY_CHATS_MESSAGE,
  EMPTY_CHATS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  SCREEN_NAMES,
  CHAT_TAB_CHAT,
  CHAT_TAB_SUPPORT,
  SUPPORT_NEW_TICKET,
  SUPPORT_EMPTY_TITLE,
  SUPPORT_EMPTY_MESSAGE,
  SUPPORT_STATUS_META,
  ERROR_CREATE_TICKET_FAILED,
} from '../constans/Constants';
import SearchBar from '../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { useModeration } from '../utils/useModeration';
import SupportNewTicketModal from '../components/modal/SupportNewTicketModal';
import { selectAuth } from '../redux/slices/authSlice';
import { getConversationsApi } from '../services/chatService';
import { createSupportTicketApi, getSupportTicketsApi } from '../services/supportService';
import { fetchSupportUnreadCount } from '../redux/slices/supportSlice';
import { getApiErrorMessage } from '../services/apiClient';
import { getSocket } from '../services/socketService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const AVATAR_COLORS = [redColor, blueColor, greenColor, purpleColor, '#3B6981', '#9B51E0'];

const pickAvatarColor = seed => {
  const str = String(seed || '0');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';

const formatRelativeTime = dateStr => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

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

const extractConversationsList = response => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(response?.conversations)) return response.conversations;
  return [];
};

const mapApiConversationToUi = convo => {
  const otherUser = convo?.other_user || convo?.otherUser || convo?.user || convo?.participant || {};
  const name = otherUser.name || otherUser.full_name || convo?.other_user_name || 'User';
  const otherUserId = otherUser.id ?? convo?.other_user_id ?? convo?.recipient_id ?? null;

  const lastMessageRaw = convo?.last_message || convo?.lastMessage || null;
  const lastMessage =
    typeof lastMessageRaw === 'string'
      ? lastMessageRaw
      : lastMessageRaw?.body || lastMessageRaw?.text || lastMessageRaw?.message || '';
  const lastMessageAt =
    (typeof lastMessageRaw === 'object' && lastMessageRaw?.created_at) ||
    convo?.updated_at ||
    convo?.last_message_at ||
    convo?.created_at;

  return {
    id: String(convo?.id),
    otherUserId,
    name,
    initials: getInitials(name),
    avatarColor: pickAvatarColor(otherUserId ?? convo?.id),
    lastMessage,
    time: formatRelativeTime(lastMessageAt),
    unreadCount: Number(convo?.unread_count ?? convo?.unreadCount ?? 0) || 0,
    isOnline: Boolean(otherUser.is_online ?? otherUser.isOnline),
  };
};

const extractTicketsList = response => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tickets)) return data.tickets;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(response?.tickets)) return response.tickets;
  return [];
};

const mapApiTicketToUi = ticket => {
  const lastRaw = ticket?.last_message || ticket?.lastMessage || null;
  const lastMessage =
    typeof lastRaw === 'string' ? lastRaw : lastRaw?.body || lastRaw?.text || lastRaw?.message || '';
  const statusKey = String(ticket?.status || 'OPEN').toUpperCase();
  return {
    id: String(ticket?.id),
    subject: ticket?.subject || 'Support ticket',
    status: statusKey,
    lastMessage,
    time: formatRelativeTime(
      ticket?.last_message_at || ticket?.updated_at || ticket?.created_at,
    ),
    unreadCount: Number(ticket?.unread_count ?? ticket?.unreadCount ?? 0) || 0,
  };
};

const ChatScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const { blockedIds } = useModeration();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ---- Support tickets state ----
  const [tickets, setTickets] = useState([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  const [isTicketsRefreshing, setIsTicketsRefreshing] = useState(false);
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  const fetchConversations = useCallback(
    async ({ isRefresh = false, silent = false } = {}) => {
      if (!token) return;

      if (silent) {
        // no loading/refresh indicators — background socket-triggered update
      } else if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const response = await getConversationsApi(token, { page: 1, limit: 50 });
        setConversations(extractConversationsList(response).map(mapApiConversationToUi));
      } catch (error) {
        if (!isRefresh && !silent) setConversations([]);
      } finally {
        if (isRefresh) setIsRefreshing(false);
        else if (!silent) setIsLoading(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations]),
  );

  // Keep the latest fetch fn in a ref so socket listeners stay attached across
  // renders without re-subscribing on every token/state change.
  const fetchRef = useRef(fetchConversations);
  useEffect(() => {
    fetchRef.current = fetchConversations;
  }, [fetchConversations]);

  const refreshDebounceRef = useRef(null);
  useEffect(() => {
    if (!token) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;

    // Debounce: chat servers can emit several events in quick succession (message +
    // conversationUpdated + read). A silent refetch (no isRefresh spinner) at most once
    // per second avoids a re-render storm that would otherwise swallow row taps.
    const refresh = () => {
      if (refreshDebounceRef.current) return;
      refreshDebounceRef.current = setTimeout(() => {
        refreshDebounceRef.current = null;
        fetchRef.current?.({ silent: true });
      }, 1000);
    };
    socket.on('receiveMessage', refresh);
    socket.on('conversationUpdated', refresh);
    socket.on('messageRead', refresh);
    socket.on('conversationRead', refresh);

    return () => {
      socket.off('receiveMessage', refresh);
      socket.off('conversationUpdated', refresh);
      socket.off('messageRead', refresh);
      socket.off('conversationRead', refresh);
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
    };
  }, [token]);

  // ---- Support: fetch tickets ----
  const fetchTickets = useCallback(
    async ({ isRefresh = false, silent = false } = {}) => {
      if (!token) return;
      if (silent) {
        // background socket-triggered refresh
      } else if (isRefresh) setIsTicketsRefreshing(true);
      else setIsTicketsLoading(true);
      try {
        const response = await getSupportTicketsApi(token, { page: 1, limit: 30 });
        setTickets(extractTicketsList(response).map(mapApiTicketToUi));
      } catch (error) {
        if (!isRefresh && !silent) setTickets([]);
      } finally {
        if (isRefresh) setIsTicketsRefreshing(false);
        else if (!silent) setIsTicketsLoading(false);
      }
    },
    [token],
  );

  // Load tickets the first time the Support tab is opened (and refresh on focus after).
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'support') fetchTickets();
    }, [activeTab, fetchTickets]),
  );

  const ticketsFetchRef = useRef(fetchTickets);
  useEffect(() => {
    ticketsFetchRef.current = fetchTickets;
  }, [fetchTickets]);

  // Live support updates → refresh ticket list + support badge.
  const supportDebounceRef = useRef(null);
  useEffect(() => {
    if (!token) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;

    const refresh = () => {
      dispatch(fetchSupportUnreadCount({ token }));
      if (supportDebounceRef.current) return;
      supportDebounceRef.current = setTimeout(() => {
        supportDebounceRef.current = null;
        ticketsFetchRef.current?.({ silent: true });
      }, 1000);
    };
    socket.on('supportMessage', refresh);
    socket.on('supportTicketUpdated', refresh);
    return () => {
      socket.off('supportMessage', refresh);
      socket.off('supportTicketUpdated', refresh);
      if (supportDebounceRef.current) clearTimeout(supportDebounceRef.current);
    };
  }, [token, dispatch]);

  const openTicket = ticket => {
    navigation.navigate(SCREEN_NAMES.SUPPORT_CHAT, {
      ticketId: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
    });
  };

  const handleCreateTicket = async ({ subject, body }) => {
    if (!token || isCreatingTicket) return;
    setIsCreatingTicket(true);
    try {
      const response = await createSupportTicketApi(token, { subject, body });
      const ticket = response?.data?.ticket || response?.data || response;
      setNewTicketModal(false);
      fetchTickets({ silent: true });
      if (ticket?.id) {
        navigation.navigate(SCREEN_NAMES.SUPPORT_CHAT, {
          ticketId: String(ticket.id),
          subject: ticket.subject || subject,
          status: String(ticket.status || 'OPEN').toUpperCase(),
        });
      }
    } catch (error) {
      Alert.alert('', getApiErrorMessage(error?.data, error?.message || ERROR_CREATE_TICKET_FAILED));
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  const supportUnread = useMemo(
    () => tickets.reduce((sum, t) => sum + t.unreadCount, 0),
    [tickets],
  );

  const filteredConversations = useMemo(() => {
    // Blocked users disappear from the list immediately (App Store 1.2).
    const visible = conversations.filter(
      c => !c.otherUserId || !blockedIds.includes(String(c.otherUserId)),
    );
    if (!searchQuery.trim()) return visible;
    const q = searchQuery.trim().toLowerCase();
    return visible.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery, blockedIds]);

  const openConversation = conversation => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c,
      ),
    );
    navigation.navigate(SCREEN_NAMES.CHAT_CONVERSATION, {
      conversationId: conversation.id,
      otherUser: {
        id: conversation.otherUserId,
        name: conversation.name,
        initials: conversation.initials,
        avatarColor: conversation.avatarColor,
        isOnline: conversation.isOnline,
      },
    });
  };

  const renderConversation = ({ item }) => {
    const hasUnread = item.unreadCount > 0;
    return (
      <TouchableOpacity
        style={[
          styles.conversationCard,
          flexDirectionRow,
          alignItemsCenter,
          hasUnread && styles.conversationCardUnread,
        ]}
        activeOpacity={0.8}
        onPress={() => openConversation(item)}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, alignJustifyCenter, { backgroundColor: item.avatarColor }]}>
            <Text style={[styles.avatarText, style.fontWeightMedium]}>{item.initials}</Text>
          </View>
          {item.isOnline ? <View style={styles.onlineDot} /> : null}
        </View>

        <View style={styles.conversationInfo}>
          <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <Text
              style={[styles.name, hasUnread ? style.fontWeightBold : style.fontWeightMedium]}
              numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>{item.time}</Text>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter, styles.previewRow]}>
            <Text
              style={[styles.preview, hasUnread ? style.fontWeightMedium : style.fontWeightThin, hasUnread && styles.previewUnread]}
              numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {hasUnread ? (
              <View style={[styles.unreadBadge, alignJustifyCenter]}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTicket = ({ item }) => {
    const hasUnread = item.unreadCount > 0;
    const meta = SUPPORT_STATUS_META[item.status] || SUPPORT_STATUS_META.OPEN;
    return (
      <TouchableOpacity
        style={[styles.conversationCard, flexDirectionRow, alignItemsCenter, hasUnread && styles.conversationCardUnread]}
        activeOpacity={0.8}
        onPress={() => openTicket(item)}>
        <View style={[styles.ticketIcon, alignJustifyCenter]}>
          <Icon name="life-buoy" size={20} color={redColor} />
        </View>
        <View style={styles.conversationInfo}>
          <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <Text
              style={[styles.name, hasUnread ? style.fontWeightBold : style.fontWeightMedium]}
              numberOfLines={1}>
              {item.subject}
            </Text>
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>{item.time}</Text>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter, styles.previewRow]}>
            <Text
              style={[styles.preview, hasUnread ? style.fontWeightMedium : style.fontWeightThin, hasUnread && styles.previewUnread]}
              numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {hasUnread ? (
              <View style={[styles.unreadBadge, alignJustifyCenter]}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.ticketStatusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.ticketStatusText, { color: meta.text }]}>{meta.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabs = () => (
    <View style={[styles.tabRow, flexDirectionRow]}>
      {[
        { key: 'chat', label: CHAT_TAB_CHAT, badge: totalUnread },
        { key: 'support', label: CHAT_TAB_SUPPORT, badge: supportUnread },
      ].map(tab => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, alignJustifyCenter, flexDirectionRow, active && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabText, style.fontWeightMedium, active && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.badge > 0 ? (
              <View style={[styles.tabBadge, alignJustifyCenter]}>
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <ScreenHeader
          title={CHAT_MESSAGES_TITLE}
          navigation={navigation}
          leftAccessory={
            activeTab === 'chat' && totalUnread > 0 ? (
              <View style={[styles.unreadPill, flexDirectionRow, alignItemsCenter]}>
                <Icon name="message-circle" size={12} color={redColor} />
                <Text style={[styles.unreadPillText, style.fontWeightMedium]}>
                  {totalUnread} {CHAT_UNREAD_LABEL}
                </Text>
              </View>
            ) : null
          }
        />

        {renderTabs()}

        {activeTab === 'chat' ? (
          <>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={CHAT_SEARCH_PLACEHOLDER}
            />
            {isLoading ? (
              <View style={[flex, alignJustifyCenter]}>
                <ActivityIndicator size="large" color={redColor} />
              </View>
            ) : (
              <FlatList
                data={filteredConversations}
                keyExtractor={item => item.id}
                renderItem={renderConversation}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => fetchConversations({ isRefresh: true })}
                    colors={[redColor]}
                    tintColor={redColor}
                  />
                }
                ListEmptyComponent={
                  <EmptyState
                    icon="message-circle"
                    title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_CHATS_TITLE}
                    message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_CHATS_MESSAGE}
                  />
                }
              />
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.newTicketBtn, flexDirectionRow, alignJustifyCenter]}
              activeOpacity={0.85}
              onPress={() => setNewTicketModal(true)}>
              <Icon name="plus" size={16} color={whiteColor} />
              <Text style={[styles.newTicketText, style.fontWeightMedium]}>{SUPPORT_NEW_TICKET}</Text>
            </TouchableOpacity>
            {isTicketsLoading ? (
              <View style={[flex, alignJustifyCenter]}>
                <ActivityIndicator size="large" color={redColor} />
              </View>
            ) : (
              <FlatList
                data={tickets}
                keyExtractor={item => item.id}
                renderItem={renderTicket}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isTicketsRefreshing}
                    onRefresh={() => fetchTickets({ isRefresh: true })}
                    colors={[redColor]}
                    tintColor={redColor}
                  />
                }
                ListEmptyComponent={
                  <EmptyState icon="life-buoy" title={SUPPORT_EMPTY_TITLE} message={SUPPORT_EMPTY_MESSAGE} />
                }
              />
            )}
          </>
        )}
      </View>

      <SupportNewTicketModal
        visible={newTicketModal}
        loading={isCreatingTicket}
        onClose={() => setNewTicketModal(false)}
        onSubmit={handleCreateTicket}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(3),
  },
  unreadPill: {
    marginTop: hp(0.4),
    alignSelf: 'flex-start',
    backgroundColor: lightPink,
    borderRadius: wp(4),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    gap: wp(1),
  },
  tabRow: {
    backgroundColor: '#F3F4F6',
    borderRadius: wp(3),
    padding: wp(1),
    marginBottom: hp(1.2),
    gap: wp(1),
  },
  tab: {
    flex: 1,
    paddingVertical: hp(1),
    borderRadius: wp(2.4),
    gap: wp(1.5),
  },
  tabActive: {
    backgroundColor: whiteColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  tabTextActive: {
    color: redColor,
  },
  tabBadge: {
    minWidth: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(2.25),
    backgroundColor: redColor,
    paddingHorizontal: wp(1),
  },
  tabBadgeText: {
    color: whiteColor,
    fontSize: 10,
    fontWeight: '700',
  },
  newTicketBtn: {
    backgroundColor: redColor,
    borderRadius: wp(3),
    paddingVertical: hp(1.4),
    gap: wp(1.5),
    marginBottom: hp(1.2),
  },
  newTicketText: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  ticketIcon: {
    width: wp(13.5),
    height: wp(13.5),
    borderRadius: wp(6.75),
    backgroundColor: lightPink,
    flexShrink: 0,
  },
  ticketStatusBadge: {
    alignSelf: 'flex-start',
    marginTop: hp(0.6),
    paddingHorizontal: wp(2.2),
    paddingVertical: hp(0.3),
    borderRadius: wp(4),
  },
  ticketStatusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '600',
  },
  unreadPillText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: redColor,
  },
  listContent: {
    paddingBottom: hp(2),
    paddingTop: hp(0.5),
  },
  conversationCard: {
    backgroundColor: whiteColor,
    borderRadius: wp(4),
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.2),
    gap: wp(3),
    borderWidth: 1,
    borderColor: borderLightColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  conversationCardUnread: {
    borderColor: lightPink,
    backgroundColor: '#FFFBFB',
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: wp(13.5),
    height: wp(13.5),
    borderRadius: wp(6.75),
  },
  avatarText: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(3.2),
    height: wp(3.2),
    borderRadius: wp(1.6),
    backgroundColor: greenColor,
    borderWidth: 2,
    borderColor: whiteColor,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginRight: wp(2),
  },
  time: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    flexShrink: 0,
  },
  timeUnread: {
    color: redColor,
    fontWeight: '600',
  },
  previewRow: {
    marginTop: hp(0.5),
    gap: wp(2),
  },
  preview: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  previewUnread: {
    color: blackColor,
  },
  unreadBadge: {
    minWidth: wp(5.5),
    height: wp(5.5),
    borderRadius: wp(2.75),
    backgroundColor: redColor,
    paddingHorizontal: wp(1.2),
    flexShrink: 0,
  },
  unreadText: {
    color: whiteColor,
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '700',
  },
});
