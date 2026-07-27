import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { spacings, style } from '../constans/Fonts';
import {
  SUPPORT_TITLE,
  SUPPORT_TYPE_MESSAGE,
  SUPPORT_CLOSED_NOTICE,
  SUPPORT_STATUS_META,
  CHAT_TODAY,
  CHAT_SENDING_ERROR,
  ERROR_LOAD_MESSAGES_FAILED,
} from '../constans/Constants';
import EmptyState from '../components/EmptyState';
import { selectAuth } from '../redux/slices/authSlice';
import { fetchSupportUnreadCount } from '../redux/slices/supportSlice';
import { getApiErrorMessage } from '../services/apiClient';
import {
  getSupportMessagesApi,
  sendSupportMessageApi,
  markSupportTicketReadApi,
} from '../services/supportService';
import { getSocket } from '../services/socketService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const formatMessageTime = dateStr => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const extractMessagesList = response => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(response?.messages)) return response.messages;
  return [];
};

const extractSentMessage = response => response?.data?.message || response?.message || response?.data || response;

const mapMessageToUi = (msg, myId) => {
  const senderId = msg?.sender_id ?? msg?.senderId ?? msg?.sender?.id;
  const isMine = myId != null && senderId != null && String(senderId) === String(myId);
  return {
    id: String(msg?.id ?? `${senderId}-${msg?.created_at || Date.now()}`),
    text: msg?.body || msg?.text || '',
    isMine,
    senderName: msg?.sender?.name || '',
    time: formatMessageTime(msg?.created_at || msg?.createdAt),
  };
};

const SupportChatScreen = ({ navigation, route }) => {
  const { token, user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const ticketId = route.params?.ticketId;
  const initialStatus = route.params?.status || 'OPEN';
  const subject = route.params?.subject || SUPPORT_TITLE;

  const listRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const androidKbPad = Platform.OS === 'android' && keyboardHeight > 0
    ? Math.max(keyboardHeight - insets.bottom, 0)
    : 0;

  const isClosed = String(status).toUpperCase() === 'CLOSED';
  const statusMeta = SUPPORT_STATUS_META[String(status).toUpperCase()] || SUPPORT_STATUS_META.OPEN;

  // Android's scrollToEnd on first load often lands halfway — fire it a few times.
  const scrollToBottom = useCallback((animated = false) => {
    const run = () => listRef.current?.scrollToEnd({ animated });
    run();
    [80, 250, 500].forEach(ms => setTimeout(run, ms));
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token || !ticketId) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await getSupportMessagesApi(token, ticketId, { page: 1, limit: 50 });
      const list = extractMessagesList(response);
      // API is newest-first; reverse to oldest-first for normal top-to-bottom rendering.
      setMessages([...list].reverse().map(m => mapMessageToUi(m, user?.id)));
      scrollToBottom(false);
    } catch (error) {
      setLoadError(getApiErrorMessage(error?.data, error?.message || ERROR_LOAD_MESSAGES_FAILED));
    } finally {
      setIsLoading(false);
    }
  }, [token, ticketId, user?.id, scrollToBottom]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Mark read on open + refresh the support badge.
  useEffect(() => {
    if (!token || !ticketId) return;
    markSupportTicketReadApi(token, ticketId)
      .then(() => dispatch(fetchSupportUnreadCount({ token })))
      .catch(() => { });
  }, [token, ticketId, dispatch]);

  useEffect(() => {
    const scrollDown = () => listRef.current?.scrollToEnd({ animated: true });
    const subs = [];
    if (Platform.OS === 'ios') {
      subs.push(Keyboard.addListener('keyboardWillShow', () => setTimeout(scrollDown, 60)));
    } else {
      // Android (RN 0.86 + Android 15 edge-to-edge): adjustResize doesn't resize, so
      // lift the composer manually by the keyboard height.
      subs.push(
        Keyboard.addListener('keyboardDidShow', e => {
          setKeyboardHeight(e?.endCoordinates?.height || 0);
          setTimeout(scrollDown, 50);
        }),
      );
      subs.push(Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0)));
    }
    return () => subs.forEach(s => s.remove());
  }, []);

  // Live: append incoming support messages + track status changes for this ticket.
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !ticketId) return undefined;

    const handleMessage = payload => {
      const tId = payload?.ticketId ?? payload?.ticket_id;
      if (String(tId) !== String(ticketId)) return;
      const uiMsg = mapMessageToUi(payload?.message || payload, user?.id);
      setMessages(prev => (prev.some(m => m.id === uiMsg.id) ? prev : [...prev, uiMsg]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      if (!uiMsg.isMine) {
        markSupportTicketReadApi(token, ticketId)
          .then(() => dispatch(fetchSupportUnreadCount({ token })))
          .catch(() => { });
      }
    };

    const handleTicketUpdated = payload => {
      const tId = payload?.ticketId ?? payload?.ticket_id;
      if (String(tId) !== String(ticketId)) return;
      if (payload?.status) setStatus(payload.status);
    };

    socket.on('supportMessage', handleMessage);
    socket.on('supportTicketUpdated', handleTicketUpdated);
    return () => {
      socket.off('supportMessage', handleMessage);
      socket.off('supportTicketUpdated', handleTicketUpdated);
    };
  }, [ticketId, token, user?.id, dispatch]);

  const handleSend = async () => {
    const body = messageText.trim();
    if (!body || isSending || isClosed || !token || !ticketId) return;

    setIsSending(true);
    try {
      const response = await sendSupportMessageApi(token, ticketId, { body });
      const sent = extractSentMessage(response);
      const uiMsg = sent
        ? mapMessageToUi(sent, user?.id)
        : { id: `local-${Date.now()}`, text: body, isMine: true, time: formatMessageTime(new Date().toISOString()) };
      setMessages(prev => (prev.some(m => m.id === uiMsg.id) ? prev : [...prev, uiMsg]));
      setMessageText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      Alert.alert('', getApiErrorMessage(error?.data, error?.message || CHAT_SENDING_ERROR));
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageRow,
        flexDirectionRow,
        item.isMine ? styles.messageRowMine : styles.messageRowOther,
      ]}>
      <View style={[styles.bubbleWrap, item.isMine && styles.bubbleWrapMine]}>
        {!item.isMine && item.senderName ? (
          <Text style={[styles.senderName, style.fontWeightMedium]}>{item.senderName}</Text>
        ) : null}
        <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>{item.text}</Text>
        </View>
        <Text style={[styles.metaTime, item.isMine && styles.metaTimeMine]}>{item.time}</Text>
      </View>
    </View>
  );

  if (!ticketId) return null;

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={[flex, { paddingBottom: androidKbPad }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
          <View style={[styles.headerInfo, flexDirectionRow, alignItemsCenter]}>
            <View style={[styles.headerAvatar, alignJustifyCenter]}>
              <Icon name="life-buoy" size={18} color={redColor} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerTitle, style.fontWeightMedium]} numberOfLines={1}>
                {subject}
              </Text>
              <Text style={[styles.headerSub, style.fontWeightThin]}>{SUPPORT_TITLE}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.statusText, { color: statusMeta.text }]}>{statusMeta.label}</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={[flex, alignJustifyCenter]}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={flex}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            initialNumToRender={50}
            removeClippedSubviews={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => scrollToBottom(false)}
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
              <EmptyState icon="life-buoy" title={SUPPORT_TITLE} message={loadError || ''} compact />
            }
          />
        )}

        {isClosed ? (
          <View style={styles.closedNotice}>
            <Icon name="lock" size={14} color={grayColor} />
            <Text style={[styles.closedNoticeText, style.fontWeightThin]}>{SUPPORT_CLOSED_NOTICE}</Text>
          </View>
        ) : (
          <View style={styles.inputSection}>
            <View style={[styles.inputRow, flexDirectionRow, alignItemsCenter]}>
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder={SUPPORT_TYPE_MESSAGE}
                placeholderTextColor={grayColor}
                style={[styles.textInput, style.fontSizeNormal2x]}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.sendBtn, alignJustifyCenter]}
                onPress={handleSend}
                disabled={isSending}>
                {isSending ? (
                  <ActivityIndicator size="small" color={whiteColor} />
                ) : (
                  <Icon name="send" size={16} color={whiteColor} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SupportChatScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  header: {
    width: '100%',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
    backgroundColor: whiteColor,
    gap: wp(1.5),
    zIndex: 1,
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
    gap: wp(2.5),
  },
  headerAvatar: {
    width: wp(10.5),
    height: wp(10.5),
    borderRadius: wp(5.25),
    backgroundColor: lightPink,
    flexShrink: 0,
  },
  headerTextWrap: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  headerSub: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  statusBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(4),
    flexShrink: 0,
  },
  statusText: { fontSize: style.fontSizeExtraSmall.fontSize, fontWeight: '600' },
  messagesList: { paddingHorizontal: wp(4), paddingVertical: hp(1.5) },
  dateSeparator: { marginBottom: hp(2), gap: wp(2) },
  dateLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: borderLightColor },
  dateText: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  messageRow: { marginBottom: hp(1.5) },
  messageRowMine: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  bubbleWrap: { maxWidth: '80%' },
  bubbleWrapMine: { alignItems: 'flex-end', alignSelf: 'flex-end' },
  senderName: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: redColor,
    marginBottom: hp(0.3),
    marginLeft: wp(1),
  },
  bubble: {
    borderRadius: wp(4),
    paddingHorizontal: wp(3.8),
    paddingVertical: hp(1.1),
  },
  bubbleMine: { backgroundColor: redColor, borderBottomRightRadius: wp(1.2) },
  bubbleOther: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderBottomLeftRadius: wp(1.2),
  },
  bubbleText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor, lineHeight: 21 },
  bubbleTextMine: { color: whiteColor },
  metaTime: { fontSize: 9, color: grayColor, marginTop: hp(0.3), marginLeft: wp(1) },
  metaTimeMine: { textAlign: 'right', marginRight: wp(1) },
  inputSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
    paddingHorizontal: wp(4),
    paddingTop: hp(1.2),
    paddingBottom: Platform.OS === "ios" ? hp(1.2) : hp(3),
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
  textInput: {
    flex: 1,
    minWidth: 0,
    color: blackColor,
    maxHeight: hp(12),
    paddingVertical: hp(0.7),
  },
  sendBtn: {
    width: wp(9.5),
    height: wp(9.5),
    borderRadius: wp(4.75),
    backgroundColor: redColor,
    flexShrink: 0,
  },
  closedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginHorizontal: wp(4),
    marginVertical: hp(1.5),
    padding: wp(3),
    borderRadius: wp(2),
    backgroundColor: inputBgColor,
  },
  closedNoticeText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
});
