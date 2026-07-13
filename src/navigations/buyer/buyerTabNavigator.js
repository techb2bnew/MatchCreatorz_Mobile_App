import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import DashboardStack from './dashboardStack';
import JobsStack from './jobsStack';
import ChatStack from './chatStack';
import WalletStack from './walletStack';
import ProfileStack from './profileStack';
import {
  BUYER_TABS,
  SCREEN_NAMES,
  TAB_CHAT,
  TAB_DASHBOARD,
  TAB_JOBS,
  TAB_PROFILE,
  TAB_WALLET,
} from '../../constans/Constants';
import { grayColor, redColor, whiteColor } from '../../constans/Color';
import { style } from '../../constans/Fonts';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  [BUYER_TABS.DASHBOARD_STACK]: 'grid',
  [BUYER_TABS.JOBS_STACK]: 'briefcase',
  [BUYER_TABS.CHAT_STACK]: 'message-circle',
  [BUYER_TABS.WALLET_STACK]: 'credit-card',
  [BUYER_TABS.PROFILE_STACK]: 'user',
};

const TAB_LABELS = {
  [BUYER_TABS.DASHBOARD_STACK]: TAB_DASHBOARD,
  [BUYER_TABS.JOBS_STACK]: TAB_JOBS,
  [BUYER_TABS.CHAT_STACK]: TAB_CHAT,
  [BUYER_TABS.WALLET_STACK]: TAB_WALLET,
  [BUYER_TABS.PROFILE_STACK]: TAB_PROFILE,
};

const TAB_ROOT_SCREENS = {
  [BUYER_TABS.DASHBOARD_STACK]: SCREEN_NAMES.DASHBOARD,
  [BUYER_TABS.JOBS_STACK]: SCREEN_NAMES.JOBS_BOOKINGS,
  [BUYER_TABS.CHAT_STACK]: SCREEN_NAMES.CHAT,
  [BUYER_TABS.WALLET_STACK]: SCREEN_NAMES.WALLET,
  [BUYER_TABS.PROFILE_STACK]: SCREEN_NAMES.PROFILE,
};

const createTabListeners = tabName => ({ navigation, route }) => ({
  tabPress: e => {
    const nestedIndex = route.state?.index ?? 0;
    if (nestedIndex > 0) {
      e.preventDefault();
      navigation.navigate(tabName, {
        screen: TAB_ROOT_SCREENS[tabName],
      });
    }
  },
});

const TAB_BAR_CONTENT_HEIGHT = 56;

const HIDE_TAB_BAR_SCREENS = [SCREEN_NAMES.CHAT_CONVERSATION];

const getDefaultTabBarStyle = insets => {
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : 0;

  return {
    backgroundColor: whiteColor,
    borderTopColor: '#E5E5EA',
    height: Platform.OS === 'ios' ? TAB_BAR_CONTENT_HEIGHT + bottomInset : 62,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? (bottomInset > 0 ? bottomInset : 8) : 8,
  };
};

const getTabBarStyle = (route, insets) => {
  if (route) {
    const nestedRoute = getFocusedRouteNameFromRoute(route);
    if (nestedRoute && HIDE_TAB_BAR_SCREENS.includes(nestedRoute)) {
      return { display: 'none' };
    }
  }

  return getDefaultTabBarStyle(insets);
};

const BuyerTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const defaultTabBarStyle = getDefaultTabBarStyle(insets);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        unmountOnBlur: true,
        tabBarActiveTintColor: redColor,
        tabBarInactiveTintColor: grayColor,
        tabBarStyle: defaultTabBarStyle,
        tabBarHideOnKeyboard: false,
        tabBarLabelStyle: {
          fontSize: style.fontSizeExtraSmall.fontSize,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => (
          <Icon name={TAB_ICONS[route.name] || 'circle'} size={size - 2} color={color} />
        ),
      })}>
      <Tab.Screen
        name={BUYER_TABS.DASHBOARD_STACK}
        component={DashboardStack}
        options={{ tabBarLabel: TAB_LABELS[BUYER_TABS.DASHBOARD_STACK] }}
        listeners={createTabListeners(BUYER_TABS.DASHBOARD_STACK)}
      />
      <Tab.Screen
        name={BUYER_TABS.JOBS_STACK}
        component={JobsStack}
        options={{ tabBarLabel: TAB_LABELS[BUYER_TABS.JOBS_STACK] }}
        listeners={createTabListeners(BUYER_TABS.JOBS_STACK)}
      />
      <Tab.Screen
        name={BUYER_TABS.CHAT_STACK}
        component={ChatStack}
        options={({ route }) => ({
          tabBarLabel: TAB_LABELS[BUYER_TABS.CHAT_STACK],
          tabBarStyle: getTabBarStyle(route, insets),
        })}
        listeners={createTabListeners(BUYER_TABS.CHAT_STACK)}
      />
      <Tab.Screen
        name={BUYER_TABS.WALLET_STACK}
        component={WalletStack}
        options={{ tabBarLabel: TAB_LABELS[BUYER_TABS.WALLET_STACK] }}
        listeners={createTabListeners(BUYER_TABS.WALLET_STACK)}
      />
      <Tab.Screen
        name={BUYER_TABS.PROFILE_STACK}
        component={ProfileStack}
        options={{ tabBarLabel: TAB_LABELS[BUYER_TABS.PROFILE_STACK] }}
        listeners={createTabListeners(BUYER_TABS.PROFILE_STACK)}
      />
    </Tab.Navigator>
  );
};

export default BuyerTabNavigator;
