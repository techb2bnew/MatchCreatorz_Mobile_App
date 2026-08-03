import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert, Text, TextInput } from 'react-native';
import RootNavigator from './src/navigations/RootNavigator';
import store from './src/redux/store';
import {
  initializeNotifications,
  subscribeToTokenRefresh,
} from './src/services/notificationService';
import { configureGoogleSignIn } from './src/services/googleAuthService';
import { setSessionExpiredHandler } from './src/services/sessionExpiry';
import { logoutUser } from './src/redux/slices/authSlice';
import { SESSION_EXPIRED_MESSAGE, SESSION_EXPIRED_TITLE } from './src/constans/Constants';

// Lock all app text to its designed size — ignore the device's system
// font-size / accessibility "large text" setting so layouts never break.
// @ts-ignore - RN honours defaultProps.allowFontScaling on Text/TextInput
Text.defaultProps = Text.defaultProps || {};
// @ts-ignore
Text.defaultProps.allowFontScaling = false;
// @ts-ignore
TextInput.defaultProps = TextInput.defaultProps || {};
// @ts-ignore
TextInput.defaultProps.allowFontScaling = false;

const App = () => {
  useEffect(() => {
    configureGoogleSignIn();
    initializeNotifications();
    const unsubscribeFromTokenRefresh = subscribeToTokenRefresh();

    // Any API call that comes back 401 (expired/invalid token) kicks the user
    // back to login instead of leaving them on a screen that can't load data.
    setSessionExpiredHandler(() => {
      if (!store.getState()?.auth?.token) return;
      store.dispatch(logoutUser() as any);
      Alert.alert(SESSION_EXPIRED_TITLE, SESSION_EXPIRED_MESSAGE);
    });

    return () => {
      setSessionExpiredHandler(null);
      unsubscribeFromTokenRefresh?.();
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
