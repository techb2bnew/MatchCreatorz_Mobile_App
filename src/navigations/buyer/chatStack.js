import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../../screens/ChatScreen';
import ChatConversationScreen from '../../screens/ChatConversationScreen';
import { SCREEN_NAMES } from '../../constans/Constants';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={SCREEN_NAMES.CHAT} component={ChatScreen} />
      <Stack.Screen name={SCREEN_NAMES.CHAT_CONVERSATION} component={ChatConversationScreen} />
    </Stack.Navigator>
  );
};

export default ChatStack;
