import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { SCREEN_NAMES, UNREAD_NOTIFICATIONS_COUNT } from '../constans/Constants';
import { selectAuth } from '../redux/slices/authSlice';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const { flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } =
  BaseStyle;

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const ScreenHeader = ({
  title,
  navigation,
  showNotifications = true,
  showAvatar = true,
  leftAccessory = null,
  onBack,
  user,
}) => {
  const { user: authUser } = useSelector(selectAuth);

  const headerUser = useMemo(() => {
    const source = user || authUser;
    const name = source?.name || source?.fullName || '';
    const initials = source?.initials || getInitials(name) || '—';
    return { name, initials };
  }, [user, authUser]);

  const openNotifications = () => {
    navigation.getParent()?.getParent()?.navigate(SCREEN_NAMES.NOTIFICATIONS);
  };

  return (
    <View style={[styles.headerRow, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
      <View style={[styles.headerLeft, flexDirectionRow, alignItemsCenter]}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleWrap}>
          <Text style={[styles.headerTitle, style.fontWeightMedium]} numberOfLines={1}>
            {title}
          </Text>
          {leftAccessory}
        </View>
      </View>

      {(showNotifications || showAvatar) && (
        <View style={[flexDirectionRow, alignItemsCenter, styles.headerRight]}>
          {showNotifications ? (
            <TouchableOpacity style={styles.iconBtn} onPress={openNotifications} activeOpacity={0.7}>
              <Icon name="bell" size={20} color={blackColor} />
              {UNREAD_NOTIFICATIONS_COUNT > 0 ? (
                <View style={[styles.badge, alignJustifyCenter]}>
                  <Text style={styles.badgeText}>{UNREAD_NOTIFICATIONS_COUNT}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}
          {showAvatar ? (
            <View style={[styles.avatar, alignJustifyCenter]}>
              <Text style={[styles.avatarText, style.fontWeightMedium]}>
                {headerUser.initials}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export const screenContentStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(3),
  },
  safeArea: {
    flex: 1,
    backgroundColor: whiteColor,
  },
});

export default ScreenHeader;

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: hp(1.5),
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    gap: spacings.normal,
    marginRight: spacings.normal,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    flexShrink: 0,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
  },
  headerRight: {
    gap: spacings.normal,
    flexShrink: 0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: borderLightColor,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: redColor,
    paddingHorizontal: 3,
  },
  badgeText: {
    color: whiteColor,
    fontSize: 9,
    fontWeight: '700',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightPink,
  },
  avatarText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
