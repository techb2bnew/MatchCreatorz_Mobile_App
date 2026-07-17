import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigations/RootNavigator';
import store from './src/redux/store';
import {
  initializeNotifications,
  subscribeToTokenRefresh,
} from './src/services/notificationService';

const App = () => {
  useEffect(() => {
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
