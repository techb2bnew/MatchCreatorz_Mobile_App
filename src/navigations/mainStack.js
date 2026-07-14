import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import BuyerTabNavigator from './buyer/buyerTabNavigator';
import SellerTabNavigator from './seller/sellerTabNavigator';
import NotificationsScreen from '../screens/NotificationsScreen';
import BookingDetailsScreen from '../screens/buyer/BookingDetailsScreen';
import { SCREEN_NAMES, USER_ROLES } from '../constans/Constants';
import { selectAppRole } from '../redux/slices/authSlice';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const role = useSelector(selectAppRole);
  const isSeller = role === USER_ROLES.CREATOR;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen
        name={isSeller ? SCREEN_NAMES.SELLER_TABS : SCREEN_NAMES.BUYER_TABS}
        component={isSeller ? SellerTabNavigator : BuyerTabNavigator}
      />
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
