import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BuyerTabNavigator from './buyerTabNavigator';
import NotificationsScreen from '../screens/NotificationsScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import { SCREEN_NAMES } from '../constans/Constants';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.BUYER_TABS} component={BuyerTabNavigator} />
      <Stack.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ statusBarStyle: 'dark' }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.BOOKING_DETAILS}
        component={BookingDetailsScreen}
        options={{ statusBarStyle: 'dark' }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
