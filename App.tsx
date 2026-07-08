import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigation from './src/navigations/auth';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthNavigation />
    </SafeAreaProvider>
  );
};

export default App;
