import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SellerJobsScreen from '../../screens/seller/SellerJobsScreen';
import SellerJobDetailsScreen from '../../screens/seller/SellerJobDetailsScreen';
import { SCREEN_NAMES } from '../../constans/Constants';

const Stack = createNativeStackNavigator();

const SellerJobsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.SELLER_JOBS} component={SellerJobsScreen} />
      <Stack.Screen name={SCREEN_NAMES.SELLER_JOB_DETAILS} component={SellerJobDetailsScreen} />
    </Stack.Navigator>
  );
};

export default SellerJobsStack;
