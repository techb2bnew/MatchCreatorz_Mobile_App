import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
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
  lightPink,
  redColor,
  whiteColor,
  blueColor,
  purpleColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const ChatScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: '1',
      name: 'Bob Smith',
      initials: 'BS',
      avatarColor: redColor,
      lastMessage: "I've uploaded the first draft. Please have a look when you get a chance.",
      time: '3m ago',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Diana Prince',
      initials: 'DP',
      avatarColor: blueColor,
      lastMessage: 'The website is ready for your review.',
      time: '1h ago',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: '3',
      name: 'Grace Hopper',
      initials: 'GH',
      avatarColor: purpleColor,
      lastMessage: 'Thanks for the feedback on the video edit!',
      time: '2d ago',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '4',
      name: 'Alex Johnson',
      initials: 'AJ',
      avatarColor: '#3B6981',
      lastMessage: 'When can we schedule a call to discuss the design?',
      time: '3d ago',
      unreadCount: 1,
      isOnline: false,
    },
    {
      id: '5',
      name: 'Priya Sharma',
      initials: 'PS',
      avatarColor: '#9B51E0',
      lastMessage: 'Sent the revised brand kit files.',
      time: '5d ago',
      unreadCount: 0,
      isOnline: false,
    },
  ]);

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
    navigation.navigate(SCREEN_NAMES.CHAT_CONVERSATION, { conversation });
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationRow, flexDirectionRow, alignItemsCenter]}
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
          <Text style={[styles.name, style.fontWeightMedium]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={[flexDirectionRow, alignItemsCenter, styles.previewRow]}>
          <Text style={[styles.preview, style.fontWeightThin]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 ? (
            <View style={[styles.unreadBadge, alignJustifyCenter]}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

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

        <FlatList
          data={filteredConversations}
          keyExtractor={item => item.id}
          renderItem={renderConversation}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="message-circle"
              title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_CHATS_TITLE}
              message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_CHATS_MESSAGE}
            />
          }
        />
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
  },
  conversationRow: {
    paddingVertical: hp(1.5),
    gap: wp(3),
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
  },
  avatarText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
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
  previewRow: {
    marginTop: hp(0.4),
    gap: wp(2),
  },
  preview: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  unreadBadge: {
    minWidth: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
    backgroundColor: redColor,
    paddingHorizontal: wp(1),
    flexShrink: 0,
  },
  unreadText: {
    color: whiteColor,
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '700',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: borderLightColor,
  },
});
