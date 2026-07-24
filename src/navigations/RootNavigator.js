import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, AppState } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import AuthStack from './authStack';
import MainStack from './mainStack';
import { SCREEN_NAMES, USER_ROLES } from '../constans/Constants';
import { redColor, whiteColor } from '../constans/Color';
import { hydrateSession, selectAuth } from '../redux/slices/authSlice';
import { fetchUnreadNotificationsCount } from '../redux/slices/notificationsSlice';
import { fetchChatUnreadCount } from '../redux/slices/chatSlice';
import {
  getCurrentFcmToken,
  subscribeToForegroundMessages,
  subscribeToTokenRefresh,
} from '../services/notificationService';
import { registerBuyerFcmTokenApi } from '../services/buyerService';
import { registerSellerFcmTokenApi } from '../services/sellerService';
import { connectSocket, disconnectSocket, reconnectSocketIfNeeded, getSocket } from '../services/socketService';
import ForegroundNotificationBanner from '../components/ForegroundNotificationBanner';

const RootStack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const FOREGROUND_BANNER_DURATION_MS = 4500;

const BootLoader = () => (
  <View style={styles.boot}>
    <ActivityIndicator size="large" color={redColor} />
  </View>
);

const registerFcmTokenForRole = (token, role, fcmToken) => {
  if (!token || !fcmToken) return Promise.resolve();
  const registerApi = role === USER_ROLES.CREATOR ? registerSellerFcmTokenApi : registerBuyerFcmTokenApi;
  return registerApi(token, fcmToken).catch(error => {
    console.log('[FCM] Failed to register push token', error?.message || error);
  });
};

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { token, role, hydrated } = useSelector(selectAuth);
  const sessionRef = useRef({ token, role });
  const bannerTimeoutRef = useRef(null);
  const [foregroundNotification, setForegroundNotification] = useState({
    visible: false,
    title: '',
    body: '',
  });

  useEffect(() => {
    dispatch(hydrateSession());
  }, [dispatch]);

  useEffect(() => {
    sessionRef.current = { token, role };
  }, [token, role]);

  useEffect(() => {
    if (!hydrated) return;
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [hydrated, token]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        reconnectSocketIfNeeded();
        const latest = sessionRef.current;
        if (latest.token) dispatch(fetchChatUnreadCount({ token: latest.token }));
      }
    });
    return () => subscription.remove();
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated || !token) return undefined;

    dispatch(fetchChatUnreadCount({ token }));

    const socket = getSocket();
    if (!socket) return undefined;

    const refreshChatUnread = () => {
      const latest = sessionRef.current;
      if (latest.token) dispatch(fetchChatUnreadCount({ token: latest.token }));
    };

    socket.on('receiveMessage', refreshChatUnread);
    socket.on('messageRead', refreshChatUnread);
    socket.on('conversationUpdated', refreshChatUnread);
    // Fired on my OTHER devices when I read a chat elsewhere — reset the tab badge.
    socket.on('conversationRead', refreshChatUnread);

    return () => {
      socket.off('receiveMessage', refreshChatUnread);
      socket.off('messageRead', refreshChatUnread);
      socket.off('conversationUpdated', refreshChatUnread);
      socket.off('conversationRead', refreshChatUnread);
    };
  }, [dispatch, hydrated, token]);

  const dismissForegroundBanner = () => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
      bannerTimeoutRef.current = null;
    }
    setForegroundNotification(prev => ({ ...prev, visible: false }));
  };

  const handleForegroundBannerPress = () => {
    dismissForegroundBanner();
    if (navigationRef.isReady()) {
      navigationRef.navigate(SCREEN_NAMES.MAIN, { screen: SCREEN_NAMES.NOTIFICATIONS });
    }
  };

  useEffect(() => {
    if (!hydrated || !token || !role) return;

    dispatch(fetchUnreadNotificationsCount({ token, role }));

    let cancelled = false;
    getCurrentFcmToken().then(fcmToken => {
      if (!cancelled) registerFcmTokenForRole(token, role, fcmToken);
    });

    const unsubscribeTokenRefresh = subscribeToTokenRefresh(newFcmToken => {
      const latest = sessionRef.current;
      registerFcmTokenForRole(latest.token, latest.role, newFcmToken);
    });

    const unsubscribeForegroundMessages = subscribeToForegroundMessages(remoteMessage => {
      const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'New notification';
      const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';

      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
      setForegroundNotification({ visible: true, title, body });
      bannerTimeoutRef.current = setTimeout(dismissForegroundBanner, FOREGROUND_BANNER_DURATION_MS);

      const latest = sessionRef.current;
      if (latest.token && latest.role) {
        dispatch(fetchUnreadNotificationsCount({ token: latest.token, role: latest.role }));
      }
    });

    return () => {
      cancelled = true;
      unsubscribeTokenRefresh?.();
      unsubscribeForegroundMessages?.();
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    };
  }, [dispatch, hydrated, token, role]);

  if (!hydrated) {
    return <BootLoader />;
  }

  return (
    <View style={styles.flex}>
      <NavigationContainer ref={navigationRef}>
        <RootStack.Navigator
          key={token ? 'app' : 'auth'}
          initialRouteName={token ? SCREEN_NAMES.MAIN : 'Auth'}
          screenOptions={{ headerShown: false, animation: 'fade' }}>
          {token ? (
            <RootStack.Screen name={SCREEN_NAMES.MAIN} component={MainStack} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthStack} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>

      <ForegroundNotificationBanner
        visible={foregroundNotification.visible}
        title={foregroundNotification.title}
        message={foregroundNotification.body}
        onPress={handleForegroundBannerPress}
        onDismiss={dismissForegroundBanner}
      />
    </View>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: whiteColor,
  },
});
