import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './authStack';
import MainStack from './mainStack';
import { SCREEN_NAMES } from '../constans/Constants';

const RootStack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name={SCREEN_NAMES.MAIN} component={MainStack} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
