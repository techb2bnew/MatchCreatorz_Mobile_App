import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './authStack';

const AuthNavigation = () => {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
};

export default AuthNavigation;
