import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
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
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  CHAT_EMPTY_CONVERSATION_MESSAGE,
  CHAT_ONLINE,
  CHAT_PRESS_ENTER,
  CHAT_TODAY,
  CHAT_TYPE_MESSAGE,
  CHAT_VIEW_ORDER,
  EMPTY_CHATS_TITLE,
  SCREEN_NAMES,
  BUYER_TABS,
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

const INITIAL_MESSAGES = {
  '1': [
    {
      id: '1',
      text: "Hi! I've started working on your logo design.",
      isMine: false,
      time: '10:30 AM',
      read: true,
    },
    {
      id: '2',
      text: "I've uploaded the first draft. Please have a look when you get a chance.",
      isMine: false,
      time: '10:32 AM',
      read: true,
    },
    {
      id: '3',
      text: 'Looks great! Can you try a warmer color palette?',
      isMine: true,
      time: '10:45 AM',
      read: true,
    },
    {
      id: '4',
      text: "Sure, I'll revise and send the updated version shortly.",
      isMine: false,
      time: '10:48 AM',
      read: true,
    },
  ],
  '2': [
    {
      id: '1',
      text: 'The homepage mockup is ready for review.',
      isMine: false,
      time: '9:15 AM',
      read: true,
    },
    {
      id: '2',
      text: 'Great, I will check it tonight.',
      isMine: true,
      time: '9:20 AM',
      read: true,
    },
  ],
};

const ChatConversationScreen = ({ navigation, route }) => {
  const conversation = route.params?.conversation;
  const listRef = useRef(null);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(
    INITIAL_MESSAGES[conversation?.id] || INITIAL_MESSAGES['1'],
  );

  const getBookingFromConversation = () => ({
    id: conversation?.id || '1',
    title: 'Logo Design',
    sellerName: conversation?.name || 'Bob Smith',
    sellerInitials: conversation?.initials || 'BS',
    date: 'Nov 10, 2024',
    total: 275.0,
    fee: 25.0,
    currency: '$',
    status: 'Ongoing',
    filterType: 'active',
  });

  const handleViewOrder = () => {
    const booking = getBookingFromConversation();
    const tabNavigation = navigation.getParent()?.getParent();
    const mainNavigation = tabNavigation?.getParent();

    if (mainNavigation) {
      mainNavigation.navigate(SCREEN_NAMES.BOOKING_DETAILS, { booking });
      return;
    }

    tabNavigation?.navigate(BUYER_TABS.JOBS_STACK, {
      screen: SCREEN_NAMES.BOOKING_DETAILS,
      params: { booking },
    });
  };

  const handleSend = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: String(Date.now()),
      text: messageText.trim(),
      isMine: true,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item, index }) => {
    const showAvatar = !item.isMine && (index === 0 || messages[index - 1]?.isMine);

    return (
      <View
        style={[
          styles.messageRow,
          flexDirectionRow,
          item.isMine ? styles.messageRowMine : styles.messageRowOther,
        ]}>
        {!item.isMine && showAvatar ? (
          <View style={[styles.msgAvatar, alignJustifyCenter, { backgroundColor: conversation?.avatarColor || redColor }]}>
            <Text style={[styles.msgAvatarText, style.fontWeightMedium]}>
              {conversation?.initials || 'BS'}
            </Text>
          </View>
        ) : !item.isMine ? (
          <View style={styles.msgAvatarSpacer} />
        ) : null}

        <View style={[styles.bubbleWrap, item.isMine && styles.bubbleWrapMine]}>
          <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleOther]}>
            <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>{item.text}</Text>
          </View>
          <View style={[styles.metaRow, flexDirectionRow, alignItemsCenter, item.isMine && styles.metaRowMine]}>
            <Text style={styles.metaTime}>{item.time}</Text>
            {item.isMine ? (
              <Icon
                name="check"
                size={12}
                color={item.read ? whiteColor : 'rgba(255,255,255,0.6)'}
                style={styles.readIcon}
              />
            ) : null}
            {item.isMine && item.read ? (
              <Icon name="check" size={12} color={whiteColor} style={styles.readIconSecond} />
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  if (!conversation) {
    return null;
  }

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>

          <View style={[styles.headerInfo, flexDirectionRow, alignItemsCenter]}>
            <View style={[styles.headerAvatar, alignJustifyCenter, { backgroundColor: conversation.avatarColor }]}>
              <Text style={[styles.headerAvatarText, style.fontWeightMedium]}>{conversation.initials}</Text>
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerName, style.fontWeightMedium]} numberOfLines={1}>
                {conversation.name}
              </Text>
              <Text style={[styles.headerStatus, style.fontWeightThin]}>
                {conversation.isOnline ? CHAT_ONLINE : ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.viewOrderBtn, alignJustifyCenter]}
            accessibilityLabel={CHAT_VIEW_ORDER}
            onPress={handleViewOrder}>
            <Icon name="file-text" size={16} color={redColor} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={
            messages.length > 0 ? (
              <View style={[styles.dateSeparator, flexDirectionRow, alignItemsCenter]}>
                <View style={styles.dateLine} />
                <Text style={[styles.dateText, style.fontWeightThin]}>{CHAT_TODAY}</Text>
                <View style={styles.dateLine} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="message-circle"
              title={EMPTY_CHATS_TITLE}
              message={CHAT_EMPTY_CONVERSATION_MESSAGE}
              compact
            />
          }
        />

        <View style={styles.inputSection}>
          <View style={[styles.inputRow, flexDirectionRow, alignItemsCenter]}>
            <TouchableOpacity style={styles.attachBtn}>
              <Icon name="paperclip" size={18} color={grayColor} />
            </TouchableOpacity>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder={CHAT_TYPE_MESSAGE}
              placeholderTextColor={grayColor}
              style={[styles.textInput, style.fontSizeNormal2x]}
              multiline={false}
              maxLength={500}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TouchableOpacity style={[styles.sendBtn, alignJustifyCenter]} onPress={handleSend}>
              <Icon name="send" size={16} color={whiteColor} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.hintText, style.fontWeightThin]}>{CHAT_PRESS_ENTER}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatConversationScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  header: {
    width: '100%',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
    gap: wp(1.5),
  },
  backBtn: {
    width: wp(9),
    height: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
    gap: wp(2),
  },
  headerAvatar: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    flexShrink: 0,
  },
  headerAvatarText: {
    color: whiteColor,
    fontSize: style.fontSizeExtraSmall.fontSize,
  },
  headerTextWrap: { flex: 1, minWidth: 0 },
  headerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  headerStatus: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: greenColor,
  },
  viewOrderBtn: {
    width: wp(9),
    height: wp(9),
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: wp(2),
    flexShrink: 0,
  },
  messagesList: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    paddingBottom: hp(2),
  },
  dateSeparator: {
    marginBottom: hp(2),
    gap: wp(2),
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: borderLightColor,
  },
  dateText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  messageRow: {
    marginBottom: hp(1.5),
    alignItems: 'flex-end',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    marginRight: wp(2),
    flexShrink: 0,
  },
  msgAvatarText: {
    color: whiteColor,
    fontSize: 9,
  },
  msgAvatarSpacer: {
    width: wp(7),
    marginRight: wp(2),
  },
  bubbleWrap: {
    maxWidth: '78%',
  },
  bubbleWrapMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: wp(3),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
  },
  bubbleMine: {
    backgroundColor: redColor,
    borderBottomRightRadius: wp(1),
  },
  bubbleOther: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderBottomLeftRadius: wp(1),
  },
  bubbleText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: whiteColor,
  },
  metaRow: {
    marginTop: hp(0.3),
    gap: wp(1),
  },
  metaRowMine: {
    justifyContent: 'flex-end',
  },
  metaTime: {
    fontSize: 9,
    color: grayColor,
  },
  readIcon: {
    marginLeft: wp(0.5),
  },
  readIconSecond: {
    marginLeft: -wp(1.5),
  },
  inputSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(1),
    backgroundColor: whiteColor,
  },
  inputRow: {
    backgroundColor: inputBgColor,
    borderRadius: wp(6),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    gap: wp(2),
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  attachBtn: {
    padding: wp(1),
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    color: blackColor,
    maxHeight: hp(12),
    paddingVertical: hp(0.5),
  },
  sendBtn: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    backgroundColor: redColor,
    flexShrink: 0,
  },
  hintText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    textAlign: 'center',
    marginTop: hp(0.5),
  },
});
