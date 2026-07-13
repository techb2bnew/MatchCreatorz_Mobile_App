import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SellerProfileScreen from '../../screens/seller/SellerProfileScreen';
import SellerWalletScreen from '../../screens/seller/SellerWalletScreen';
import SellerMyServicesScreen from '../../screens/seller/SellerMyServicesScreen';
import SellerConnectsScreen from '../../screens/seller/SellerConnectsScreen';
import { SCREEN_NAMES } from '../../constans/Constants';

const Stack = createNativeStackNavigator();

const SellerProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.SELLER_PROFILE} component={SellerProfileScreen} />
      <Stack.Screen name={SCREEN_NAMES.SELLER_WALLET} component={SellerWalletScreen} />
      <Stack.Screen name={SCREEN_NAMES.SELLER_MY_SERVICES} component={SellerMyServicesScreen} />
      <Stack.Screen name={SCREEN_NAMES.SELLER_CONNECTS} component={SellerConnectsScreen} />
    </Stack.Navigator>
  );
};

export default SellerProfileStack;
