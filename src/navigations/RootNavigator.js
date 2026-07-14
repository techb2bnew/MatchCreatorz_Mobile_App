import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import AuthStack from './authStack';
import MainStack from './mainStack';
import { SCREEN_NAMES } from '../constans/Constants';
import { redColor, whiteColor } from '../constans/Color';
import { hydrateSession, selectAuth } from '../redux/slices/authSlice';

const RootStack = createNativeStackNavigator();

const BootLoader = () => (
  <View style={styles.boot}>
    <ActivityIndicator size="large" color={redColor} />
  </View>
);

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { token, hydrated } = useSelector(selectAuth);

  useEffect(() => {
    dispatch(hydrateSession());
  }, [dispatch]);

  if (!hydrated) {
    return <BootLoader />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        key={token ? 'app' : 'auth'}
        initialRouteName={token ? SCREEN_NAMES.MAIN : 'Auth'}
        screenOptions={{ headerShown: false, animation: 'fade' }}>
        {token ? (
          <RootStack.Screen name={SCREEN_NAMES.MAIN} component={MainStack} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: whiteColor,
  },
});
