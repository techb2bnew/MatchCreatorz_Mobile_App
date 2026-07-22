import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import SellerDashboardStack from './dashboardStack';
import SellerJobsStack from './jobsStack';
import SellerWorkStack from './workStack';
import SellerChatStack from './chatStack';
import SellerProfileStack from './profileStack';
import {
  SCREEN_NAMES,
  SELLER_TABS,
  TAB_CHAT,
  TAB_DASHBOARD,
  TAB_PROFILE,
  TAB_SELLER_JOBS,
  TAB_SELLER_WORK,
} from '../../constans/Constants';
import { grayColor, redColor, whiteColor } from '../../constans/Color';
import { style } from '../../constans/Fonts';

const Tab = createBottomTabNavigator();
const TAB_BAR_CONTENT_HEIGHT = 56;

const TAB_ICONS = {
  [SELLER_TABS.DASHBOARD_STACK]: 'grid',
  [SELLER_TABS.JOBS_STACK]: 'briefcase',
  [SELLER_TABS.WORK_STACK]: 'clipboard',
  [SELLER_TABS.CHAT_STACK]: 'message-circle',
  [SELLER_TABS.PROFILE_STACK]: 'user',
};

const TAB_LABELS = {
  [SELLER_TABS.DASHBOARD_STACK]: TAB_DASHBOARD,
  [SELLER_TABS.JOBS_STACK]: TAB_SELLER_JOBS,
  [SELLER_TABS.WORK_STACK]: TAB_SELLER_WORK,
  [SELLER_TABS.CHAT_STACK]: TAB_CHAT,
  [SELLER_TABS.PROFILE_STACK]: TAB_PROFILE,
};

const TAB_ROOT_SCREENS = {
  [SELLER_TABS.DASHBOARD_STACK]: SCREEN_NAMES.SELLER_DASHBOARD,
  [SELLER_TABS.JOBS_STACK]: SCREEN_NAMES.SELLER_JOBS,
  [SELLER_TABS.WORK_STACK]: SCREEN_NAMES.SELLER_WORK,
  [SELLER_TABS.CHAT_STACK]: SCREEN_NAMES.CHAT,
  [SELLER_TABS.PROFILE_STACK]: SCREEN_NAMES.SELLER_PROFILE,
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

const SellerTabNavigator = () => {
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
        name={SELLER_TABS.DASHBOARD_STACK}
        component={SellerDashboardStack}
        options={{ tabBarLabel: TAB_LABELS[SELLER_TABS.DASHBOARD_STACK] }}
        listeners={createTabListeners(SELLER_TABS.DASHBOARD_STACK)}
      />
      <Tab.Screen
        name={SELLER_TABS.JOBS_STACK}
        component={SellerJobsStack}
        options={{ tabBarLabel: TAB_LABELS[SELLER_TABS.JOBS_STACK] }}
        listeners={createTabListeners(SELLER_TABS.JOBS_STACK)}
      />
      <Tab.Screen
        name={SELLER_TABS.WORK_STACK}
        component={SellerWorkStack}
        options={{ tabBarLabel: TAB_LABELS[SELLER_TABS.WORK_STACK] }}
        listeners={createTabListeners(SELLER_TABS.WORK_STACK)}
      />
      <Tab.Screen
        name={SELLER_TABS.CHAT_STACK}
        component={SellerChatStack}
        options={({ route }) => ({
          tabBarLabel: TAB_LABELS[SELLER_TABS.CHAT_STACK],
          tabBarStyle: getTabBarStyle(route, insets),
        })}
        listeners={createTabListeners(SELLER_TABS.CHAT_STACK)}
      />
      <Tab.Screen
        name={SELLER_TABS.PROFILE_STACK}
        component={SellerProfileStack}
        options={{ tabBarLabel: TAB_LABELS[SELLER_TABS.PROFILE_STACK] }}
        listeners={createTabListeners(SELLER_TABS.PROFILE_STACK)}
      />
    </Tab.Navigator>
  );
};

export default SellerTabNavigator;
