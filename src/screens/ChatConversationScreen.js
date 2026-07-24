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
  Image,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  blueColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style } from '../constans/Fonts';
import {
  CHAT_EMPTY_CONVERSATION_MESSAGE,
  CHAT_OFFLINE,
  CHAT_ONLINE,
  CHAT_SEEN,
  CHAT_SENDING_ERROR,
  CHAT_TODAY,
  CHAT_TYPE_MESSAGE,
  ERROR_LOAD_MESSAGES_FAILED,
  EMPTY_CHATS_TITLE,
} from '../constans/Constants';
import EmptyState from '../components/EmptyState';
import UploadOptionsModal from '../components/modal/UploadOptionsModal';
import { selectAuth } from '../redux/slices/authSlice';
import { fetchChatUnreadCount } from '../redux/slices/chatSlice';
import { getApiErrorMessage } from '../services/apiClient';
import {
  getConversationMessagesApi,
  sendChatMessageApi,
  markConversationReadApi,
  uploadChatAttachmentApi,
} from '../services/chatService';
import { getSocket } from '../services/socketService';
import { pickImagesFromGallery, pickImageFromCamera, pickDocuments } from '../utils/filePicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flex, flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const isImageUrl = url => /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(String(url || ''));

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

const mapApiMessageToUi = (msg, currentUserId) => {
  const senderId = msg?.sender_id ?? msg?.senderId ?? msg?.sender?.id;
  const isMine = currentUserId != null && senderId != null && String(senderId) === String(currentUserId);

  return {
    id: String(msg?.id ?? msg?._id ?? `${senderId}-${msg?.created_at || Date.now()}`),
    text: msg?.body || msg?.text || '',
    isMine,
    time: formatMessageTime(msg?.created_at || msg?.createdAt),
    read: Boolean(msg?.read ?? msg?.is_read),
    attachment: msg?.attachment || null,
  };
};

const ChatConversationScreen = ({ navigation, route }) => {
  const { token, user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const conversationId = route.params?.conversationId;
  const otherUser = route.params?.otherUser || {};
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isOtherOnline, setIsOtherOnline] = useState(Boolean(otherUser.isOnline));
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!token || !conversationId) return;

    setIsLoading(true);
    setLoadError('');
    try {
      const response = await getConversationMessagesApi(token, conversationId, { page: 1, limit: 50 });
      const list = extractMessagesList(response);
      // API returns newest-first; reverse to oldest-first for normal top-to-bottom rendering.
      setMessages([...list].reverse().map(m => mapApiMessageToUi(m, user?.id)));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 60);
    } catch (error) {
      setLoadError(getApiErrorMessage(error?.data, error?.message || ERROR_LOAD_MESSAGES_FAILED));
    } finally {
      setIsLoading(false);
    }
  }, [token, conversationId, user?.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const scrollDown = () => listRef.current?.scrollToEnd({ animated: true });
    // On iOS, nudge while the keyboard is animating in (keyboardWillShow) so it
    // moves together with the keyboard, then scroll AGAIN on keyboardDidShow once
    // the layout has actually resized — otherwise the last message stays hidden
    // behind the input. Android's adjustPan handles positioning natively.
    const subs = [];
    if (Platform.OS === 'ios') {
      subs.push(Keyboard.addListener('keyboardWillShow', scrollDown));
      subs.push(Keyboard.addListener('keyboardDidShow', () => setTimeout(scrollDown, 30)));
    } else {
      subs.push(Keyboard.addListener('keyboardDidShow', () => setTimeout(scrollDown, 50)));
    }
    return () => subs.forEach(s => s.remove());
  }, []);

  useEffect(() => {
    if (!token || !conversationId) return;
    markConversationReadApi(token, conversationId)
      .then(() => dispatch(fetchChatUnreadCount({ token })))
      .catch(() => {});
    getSocket()?.emit('messageRead', { conversationId });
  }, [token, conversationId, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return undefined;

    const handleReceive = payload => {
      const incomingConvoId = payload?.conversationId ?? payload?.conversation_id;
      if (String(incomingConvoId) !== String(conversationId)) return;

      const uiMsg = mapApiMessageToUi(payload?.message || payload, user?.id);
      setMessages(prev => (prev.some(m => m.id === uiMsg.id) ? prev : [...prev, uiMsg]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

      if (!uiMsg.isMine) {
        markConversationReadApi(token, conversationId)
          .then(() => dispatch(fetchChatUnreadCount({ token })))
          .catch(() => {});
        socket.emit('messageRead', { conversationId });
      }
    };

    const matchesOtherUser = userId =>
      otherUser?.id != null && userId != null && String(userId) === String(otherUser.id);

    const handleTyping = payload => {
      const cId = payload?.conversationId ?? payload?.conversation_id;
      if (String(cId) !== String(conversationId)) return;
      if (matchesOtherUser(payload?.userId ?? payload?.user_id)) setIsOtherTyping(true);
    };

    const handleStopTyping = payload => {
      const cId = payload?.conversationId ?? payload?.conversation_id;
      if (String(cId) !== String(conversationId)) return;
      if (matchesOtherUser(payload?.userId ?? payload?.user_id)) setIsOtherTyping(false);
    };

    const handlePresence = payload => {
      if (matchesOtherUser(payload?.userId ?? payload?.user_id)) {
        setIsOtherOnline(Boolean(payload?.online));
      }
    };

    const handleMessageRead = payload => {
      const cId = payload?.conversationId ?? payload?.conversation_id;
      if (String(cId) !== String(conversationId)) return;
      // Only flip my messages to "Seen" when the OTHER party read them, not when my
      // own read syncs from another device.
      const readerId = payload?.readerId ?? payload?.reader_id;
      if (readerId != null && user?.id != null && String(readerId) === String(user.id)) return;
      setMessages(prev => prev.map(m => (m.isMine ? { ...m, read: true } : m)));
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('presence', handlePresence);
    socket.on('messageRead', handleMessageRead);

    // Ask the server for the other user's current online status right away, and again
    // on (re)connect, so the header shows Online/Offline without waiting for a change.
    const queryPresence = () => {
      if (otherUser?.id == null) return;
      // Server signature: socket.emit('isOnline', userId, ack) → ack = { userId, online }.
      socket.emit('isOnline', otherUser.id, res => {
        if (res && typeof res === 'object' && 'online' in res) setIsOtherOnline(Boolean(res.online));
      });
    };
    queryPresence();
    socket.on('connect', queryPresence);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('presence', handlePresence);
      socket.off('messageRead', handleMessageRead);
      socket.off('connect', queryPresence);
    };
  }, [conversationId, otherUser?.id, token, user?.id, dispatch]);

  const emitTyping = useCallback(
    eventName => {
      const socket = getSocket();
      if (socket?.connected && conversationId) socket.emit(eventName, { conversationId });
    },
    [conversationId],
  );

  const handleChangeText = text => {
    setMessageText(text);
    emitTyping('typing');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping('stopTyping'), 1500);
  };

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    },
    [],
  );

  const handleUploadOption = async option => {
    setShowUploadOptions(false);
    let files = [];
    if (option === 'gallery') files = await pickImagesFromGallery(false);
    if (option === 'camera') files = await pickImageFromCamera();
    if (option === 'files') files = await pickDocuments(false);

    const file = files?.[0];
    if (!file?.uri || !token) return;

    setIsUploadingAttachment(true);
    try {
      const response = await uploadChatAttachmentApi(token, file);
      const uploaded = response?.data || response;
      setPendingAttachment({
        url: uploaded?.url,
        name: uploaded?.name || file.name || 'attachment',
        type: uploaded?.type || file.type,
      });
    } catch (error) {
      Alert.alert('Upload failed', getApiErrorMessage(error?.data, error?.message));
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const removePendingAttachment = () => setPendingAttachment(null);

  const handleSend = async () => {
    const text = messageText.trim();
    const body = text || pendingAttachment?.name || '';
    if (!body || isSending || !conversationId || !token) return;

    const attachmentPayload = pendingAttachment
      ? { url: pendingAttachment.url, name: pendingAttachment.name }
      : undefined;

    setIsSending(true);
    emitTyping('stopTyping');

    try {
      const socket = getSocket();
      let sentMessage = null;

      if (socket?.connected) {
        sentMessage = await new Promise(resolve => {
          let settled = false;
          const timeout = setTimeout(() => {
            if (!settled) {
              settled = true;
              resolve(null);
            }
          }, 6000);

          socket.emit('sendMessage', { conversationId, body, attachment: attachmentPayload }, res => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            resolve(res?.ok ? res.message : null);
          });
        });
      }

      if (!sentMessage) {
        const response = await sendChatMessageApi(token, conversationId, { body, attachment: attachmentPayload });
        sentMessage = extractSentMessage(response);
      }

      const uiMsg = sentMessage
        ? mapApiMessageToUi(sentMessage, user?.id)
        : {
            id: `local-${Date.now()}`,
            text: body,
            isMine: true,
            time: formatMessageTime(new Date().toISOString()),
            read: false,
            attachment: attachmentPayload,
          };

      setMessages(prev => (prev.some(m => m.id === uiMsg.id) ? prev : [...prev, uiMsg]));
      setMessageText('');
      setPendingAttachment(null);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      Alert.alert('Message failed', getApiErrorMessage(error?.data, error?.message || CHAT_SENDING_ERROR));
    } finally {
      setIsSending(false);
    }
  };

  // Index of my most recent message — only that one shows the "Seen"/"Sent" label,
  // WhatsApp-style, so the whole thread isn't cluttered with status text.
  let lastOwnIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].isMine) {
      lastOwnIndex = i;
      break;
    }
  }

  const renderMessage = ({ item, index }) => {
    const showAvatar = !item.isMine && (index === 0 || messages[index - 1]?.isMine);
    const isLastOwn = item.isMine && index === lastOwnIndex;

    return (
      <View
        style={[
          styles.messageRow,
          flexDirectionRow,
          item.isMine ? styles.messageRowMine : styles.messageRowOther,
        ]}>
        {!item.isMine && showAvatar ? (
          <View style={[styles.msgAvatar, alignJustifyCenter, { backgroundColor: otherUser?.avatarColor || redColor }]}>
            <Text style={[styles.msgAvatarText, style.fontWeightMedium]}>
              {otherUser?.initials || '?'}
            </Text>
          </View>
        ) : !item.isMine ? (
          <View style={styles.msgAvatarSpacer} />
        ) : null}

        <View style={[styles.bubbleWrap, item.isMine && styles.bubbleWrapMine]}>
          <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleOther]}>
            {item.attachment?.url ? (
              isImageUrl(item.attachment.url) ? (
                <TouchableOpacity onPress={() => Linking.openURL(item.attachment.url)} activeOpacity={0.85}>
                  <Image source={{ uri: item.attachment.url }} style={styles.attachmentImage} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => Linking.openURL(item.attachment.url)}
                  activeOpacity={0.85}
                  style={[styles.attachmentFileChip, flexDirectionRow, alignItemsCenter]}>
                  <Icon name="file" size={13} color={item.isMine ? whiteColor : redColor} />
                  <Text
                    style={[styles.attachmentFileName, item.isMine && styles.bubbleTextMine]}
                    numberOfLines={1}>
                    {item.attachment.name || 'File'}
                  </Text>
                </TouchableOpacity>
              )
            ) : null}
            {item.text && item.text !== item.attachment?.name ? (
              <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine, item.attachment?.url && styles.bubbleTextCaption]}>
                {item.text}
              </Text>
            ) : null}
          </View>
          <View style={[styles.metaRow, flexDirectionRow, alignItemsCenter, item.isMine && styles.metaRowMine]}>
            <Text style={styles.metaTime}>{item.time}</Text>
            {item.isMine ? (
              <View style={[flexDirectionRow, alignItemsCenter, styles.ticksWrap]}>
                <Icon name="check" size={13} color={item.read ? blueColor : grayColor} style={styles.readIcon} />
                {item.read ? (
                  <Icon name="check" size={13} color={blueColor} style={styles.readIconSecond} />
                ) : null}
                {isLastOwn && item.read ? (
                  <Text style={[styles.seenLabel, style.fontWeightMedium]}>{CHAT_SEEN}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  if (!conversationId) {
    return null;
  }

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top', 'bottom']}>
      {/* Header stays OUTSIDE KeyboardAvoidingView so it stays pinned when the
          keyboard opens — only the list + input area move. */}
      <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={blackColor} />
        </TouchableOpacity>

        <View style={[styles.headerInfo, flexDirectionRow, alignItemsCenter]}>
          <View style={styles.headerAvatarWrap}>
            <View style={[styles.headerAvatar, alignJustifyCenter, { backgroundColor: otherUser.avatarColor || redColor }]}>
              <Text style={[styles.headerAvatarText, style.fontWeightMedium]}>{otherUser.initials || '?'}</Text>
            </View>
            {isOtherOnline ? <View style={styles.headerOnlineDot} /> : null}
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerName, style.fontWeightMedium]} numberOfLines={1}>
              {otherUser.name || 'User'}
            </Text>
            <View style={[flexDirectionRow, alignItemsCenter, styles.headerStatusRow]}>
              {!isOtherTyping ? (
                <View style={[styles.statusDot, isOtherOnline ? styles.statusDotOnline : styles.statusDotOffline]} />
              ) : null}
              <Text
                style={[
                  styles.headerStatus,
                  style.fontWeightThin,
                  !isOtherTyping && !isOtherOnline && styles.headerStatusMuted,
                ]}>
                {isOtherTyping ? 'typing…' : isOtherOnline ? CHAT_ONLINE : CHAT_OFFLINE}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        {isLoading ? (
          <View style={[flex, alignJustifyCenter]}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
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
                message={loadError || CHAT_EMPTY_CONVERSATION_MESSAGE}
                compact
              />
            }
          />
        )}

        <View style={styles.inputSection}>
          {pendingAttachment ? (
            <View style={[styles.pendingAttachmentRow, flexDirectionRow, alignItemsCenter]}>
              <Icon name="paperclip" size={13} color={grayColor} />
              <Text style={styles.pendingAttachmentText} numberOfLines={1}>
                {pendingAttachment.name}
              </Text>
              <TouchableOpacity onPress={removePendingAttachment} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={14} color={grayColor} />
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={[styles.inputRow, flexDirectionRow, styles.inputRowAlign]}>
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => setShowUploadOptions(true)}
              disabled={isUploadingAttachment}>
              {isUploadingAttachment ? (
                <ActivityIndicator size="small" color={grayColor} />
              ) : (
                <Icon name="paperclip" size={18} color={grayColor} />
              )}
            </TouchableOpacity>
            <TextInput
              value={messageText}
              onChangeText={handleChangeText}
              placeholder={CHAT_TYPE_MESSAGE}
              placeholderTextColor={grayColor}
              style={[styles.textInput, style.fontSizeNormal2x]}
              multiline
              maxLength={500}
              blurOnSubmit={false}
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
      </KeyboardAvoidingView>

      <UploadOptionsModal
        visible={showUploadOptions}
        onClose={() => setShowUploadOptions(false)}
        onSelect={handleUploadOption}
      />
    </SafeAreaView>
  );
};

export default ChatConversationScreen;

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
  headerAvatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  headerAvatar: {
    width: wp(10.5),
    height: wp(10.5),
    borderRadius: wp(5.25),
  },
  headerAvatarText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  headerOnlineDot: {
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
  headerTextWrap: { flex: 1, minWidth: 0 },
  headerName: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  headerStatusRow: {
    gap: wp(1.2),
    marginTop: hp(0.2),
  },
  statusDot: {
    width: wp(1.6),
    height: wp(1.6),
    borderRadius: wp(0.8),
  },
  statusDotOnline: {
    backgroundColor: greenColor,
  },
  statusDotOffline: {
    backgroundColor: grayColor,
  },
  headerStatus: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: greenColor,
  },
  headerStatusMuted: {
    color: grayColor,
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
    width: wp(7.5),
    height: wp(7.5),
    borderRadius: wp(3.75),
    marginRight: wp(2),
    flexShrink: 0,
  },
  msgAvatarText: {
    color: whiteColor,
    fontSize: 9,
  },
  msgAvatarSpacer: {
    width: wp(7.5),
    marginRight: wp(2),
  },
  bubbleWrap: {
    maxWidth: '80%',
  },
  bubbleWrapMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: wp(4),
    paddingHorizontal: wp(3.8),
    paddingVertical: hp(1.1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMine: {
    backgroundColor: redColor,
    borderBottomRightRadius: wp(1.2),
  },
  bubbleOther: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderBottomLeftRadius: wp(1.2),
  },
  bubbleText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: whiteColor,
  },
  bubbleTextCaption: {
    marginTop: hp(0.5),
  },
  attachmentImage: {
    width: wp(45),
    height: wp(45),
    borderRadius: wp(2),
    marginBottom: hp(0.5),
  },
  attachmentFileChip: {
    gap: wp(1.5),
    marginBottom: hp(0.5),
  },
  attachmentFileName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    maxWidth: wp(40),
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
  ticksWrap: {
    marginLeft: wp(1),
  },
  readIcon: {},
  readIconSecond: {
    marginLeft: -wp(1.8),
  },
  seenLabel: {
    marginLeft: wp(1),
    fontSize: 9,
    color: blueColor,
  },
  inputSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
    paddingHorizontal: wp(4),
    paddingTop: hp(1.2),
    paddingBottom: hp(1.2),
    backgroundColor: whiteColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingAttachmentRow: {
    backgroundColor: inputBgColor,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    marginBottom: hp(1),
    gap: wp(2),
  },
  pendingAttachmentText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
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
  inputRowAlign: {
    alignItems: 'flex-end',
  },
  attachBtn: {
    padding: wp(1),
    marginBottom: hp(0.5),
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    color: blackColor,
    maxHeight: hp(12),
    paddingVertical: hp(0.7),
    lineHeight: 20,
  },
  sendBtn: {
    width: wp(9.5),
    height: wp(9.5),
    borderRadius: wp(4.75),
    backgroundColor: redColor,
    flexShrink: 0,
    marginBottom: hp(0.3),
    shadowColor: redColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
});
