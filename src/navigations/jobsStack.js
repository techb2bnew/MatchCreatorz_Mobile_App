import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobsBookingsScreen from '../screens/JobsBookingsScreen';
import ViewBidsScreen from '../screens/ViewBidsScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import { SCREEN_NAMES } from '../constans/Constants';

const Stack = createNativeStackNavigator();

const JobsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.JOBS_BOOKINGS} component={JobsBookingsScreen} />
      <Stack.Screen name={SCREEN_NAMES.VIEW_BIDS} component={ViewBidsScreen} />
      <Stack.Screen name={SCREEN_NAMES.BOOKING_DETAILS} component={BookingDetailsScreen} />
    </Stack.Navigator>
  );
};

export default JobsStack;
