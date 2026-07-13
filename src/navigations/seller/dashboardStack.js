import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SellerDashboardScreen from '../../screens/seller/SellerDashboardScreen';
import { SCREEN_NAMES } from '../../constans/Constants';

const Stack = createNativeStackNavigator();

const SellerDashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.SELLER_DASHBOARD} component={SellerDashboardScreen} />
    </Stack.Navigator>
  );
};

export default SellerDashboardStack;
