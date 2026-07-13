import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletScreen from '../../screens/buyer/WalletScreen';
import { SCREEN_NAMES } from '../../constans/Constants';

const Stack = createNativeStackNavigator();

const WalletStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.WALLET} component={WalletScreen} />
    </Stack.Navigator>
  );
};

export default WalletStack;
