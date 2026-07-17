import { PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
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

export const subscribeToTokenRefresh = () =>
  onTokenRefresh(messaging, token => {
    console.log(`[FCM] ${Platform.OS} refreshed token:`, token);
  });
