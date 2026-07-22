import { PermissionsAndroid, Platform } from 'react-native';
import notifee from '@notifee/react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';

const messaging = getMessaging();

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) {
      return true;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await requestPermission(messaging);

  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

export const initializeNotifications = async () => {
  try {
    const permissionGranted = await requestNotificationPermission();

    console.log(
      `[FCM] Notification permission: ${
        permissionGranted ? 'granted' : 'denied'
      }`,
    );

    if (!permissionGranted) {
      return null;
    }

    if (Platform.OS === 'ios') {
      await registerDeviceForRemoteMessages(messaging);
    }

    const token = await getToken(messaging);
    console.log(`[FCM] ${Platform.OS} token:`, token);

    return token;
  } catch (error) {
    console.error('[FCM] Unable to initialize notifications:', error);
    return null;
  }
};

export const subscribeToTokenRefresh = onRefresh =>
  onTokenRefresh(messaging, token => {
    console.log(`[FCM] ${Platform.OS} refreshed token:`, token);
    if (onRefresh) onRefresh(token);
  });

/**
 * Fires when a push notification arrives while the app is in the foreground.
 * FCM/APNs do NOT auto-display a system banner in this case — the app must
 * handle it itself (e.g. show an in-app banner), which is what this is for.
 */
export const subscribeToForegroundMessages = onForegroundMessage =>
  onMessage(messaging, remoteMessage => {
    console.log('[FCM] Foreground message received:', JSON.stringify(remoteMessage, null, 2));
    if (onForegroundMessage) onForegroundMessage(remoteMessage);
  });

/**
 * Reads the current FCM device token without re-requesting permission.
 * Returns null if permission was never granted or Firebase hasn't issued one yet.
 */
export const getCurrentFcmToken = async () => {
  try {
    return await getToken(messaging);
  } catch (error) {
    console.log('[FCM] Unable to read current token:', error?.message || error);
    return null;
  }
};

/**
 * Sets the unread-count badge on the app's home-screen icon (iOS native,
 * Android where the device launcher supports it — no-ops elsewhere).
 */
export const setAppBadgeCount = async count => {
  try {
    await notifee.setBadgeCount(Math.max(0, Number(count) || 0));
  } catch (error) {
    console.log('[Badge] Unable to set app icon badge:', error?.message || error);
  }
};
