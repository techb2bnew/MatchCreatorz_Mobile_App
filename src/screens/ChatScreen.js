import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
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
} from '../constans/Constants';
import SearchBar from '../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { selectAuth } from '../redux/slices/authSlice';
import { getConversationsApi } from '../services/chatService';
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

const ChatScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);

  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

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

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <ScreenHeader
          title={CHAT_MESSAGES_TITLE}
          navigation={navigation}
          leftAccessory={
            totalUnread > 0 ? (
              <View style={[styles.unreadPill, flexDirectionRow, alignItemsCenter]}>
                <Icon name="message-circle" size={12} color={redColor} />
                <Text style={[styles.unreadPillText, style.fontWeightMedium]}>
                  {totalUnread} {CHAT_UNREAD_LABEL}
                </Text>
              </View>
            ) : null
          }
        />

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
      </View>
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
