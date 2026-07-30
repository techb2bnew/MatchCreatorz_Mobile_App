import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native';
import RootNavigator from './src/navigations/RootNavigator';
import store from './src/redux/store';
import {
  initializeNotifications,
  subscribeToTokenRefresh,
} from './src/services/notificationService';
import { configureGoogleSignIn } from './src/services/googleAuthService';

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

    return unsubscribeFromTokenRefresh;
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
