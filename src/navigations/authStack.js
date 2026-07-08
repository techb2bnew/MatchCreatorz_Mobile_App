import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { SCREEN_NAMES } from '../constans/Constants';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREEN_NAMES.SPLASH}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name={SCREEN_NAMES.SPLASH}
        component={SplashScreen}
        options={{ statusBarStyle: 'dark' }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.LOGIN}
        component={LoginScreen}
        options={{ statusBarStyle: 'dark' }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CREATE_ACCOUNT}
        component={CreateAccountScreen}
        options={{ statusBarStyle: 'dark' }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
        options={{ statusBarStyle: 'dark' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
