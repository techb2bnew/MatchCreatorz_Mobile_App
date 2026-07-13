import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SellerWorkScreen from '../../screens/seller/SellerWorkScreen';
import { SCREEN_NAMES } from '../../constans/Constants';

const Stack = createNativeStackNavigator();

const SellerWorkStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.SELLER_WORK} component={SellerWorkScreen} />
    </Stack.Navigator>
  );
};

export default SellerWorkStack;
