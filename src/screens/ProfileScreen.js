import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  blueColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  NOTIF_BOOKING_UPDATES,
  NOTIF_BOOKING_UPDATES_DESC,
  NOTIF_CHAT_MESSAGES,
  NOTIF_CHAT_MESSAGES_DESC,
  NOTIF_EMAIL,
  NOTIF_EMAIL_DESC,
  NOTIF_NEW_OFFERS,
  NOTIF_NEW_OFFERS_DESC,
  NOTIF_PAYMENT_ALERTS,
  NOTIF_PAYMENT_ALERTS_DESC,
  NOTIF_SMS,
  NOTIF_SMS_DESC,
  PROFILE_BIO,
  PROFILE_BUYER_ROLE,
  PROFILE_CANCEL,
  PROFILE_DELETE_ACCOUNT,
  PROFILE_DELETE_CONFIRM,
  PROFILE_DELETE_MESSAGE,
  PROFILE_DELETE_TITLE,
  PROFILE_EDIT,
  PROFILE_EMAIL,
  PROFILE_FULL_NAME,
  PROFILE_LOCATION,
  PROFILE_LOGOUT,
  PROFILE_LOGOUT_CONFIRM,
  PROFILE_LOGOUT_MESSAGE,
  PROFILE_LOGOUT_TITLE,
  PROFILE_NOTIFICATION_SETTINGS,
  PROFILE_NOTIFICATION_SETTINGS_DESC,
  PROFILE_PERSONAL_INFO,
  PROFILE_PHONE,
  PROFILE_SAVE,
  PROFILE_SAVED_MESSAGE,
  PROFILE_SAVED_TITLE,
  PROFILE_STAT_BOOKINGS,
  PROFILE_STAT_JOBS,
  PROFILE_STAT_WALLET,
  PROFILE_TITLE,
  PROFILE_UPLOAD_PHOTO,
  SCREEN_NAMES,
} from '../constans/Constants';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import FormLabel from '../components/FormLabel';
import ScreenHeader, { screenContentStyles } from '../components/ScreenHeader';
import ConfirmationModal from '../components/ConfirmationModal';
import SuccessModal from '../components/SuccessModal';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
import UploadOptionsModal from '../components/UploadOptionsModal';
import { pickImageFromCamera, pickImagesFromGallery, isImageFile } from '../utils/filePicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const INITIAL_PROFILE = {
  fullName: 'Sarah Williams',
  email: 'buyer@matchcreatorz.com',
  phone: '5551234567',
  location: 'New Delhi, India',
  bio: 'Entrepreneur looking for talented creators to help grow my brand presence online.',
  initials: 'SW',
  photoUri: null,
};

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const [savedProfile, setSavedProfile] = useState(INITIAL_PROFILE);
  const [profileForm, setProfileForm] = useState(INITIAL_PROFILE);

  const [profileStats] = useState({
    wallet: '₹2,500',
    bookings: '12',
    jobsPosted: '5',
  });

  const [notificationSettings, setNotificationSettings] = useState([
    { key: 'email', title: NOTIF_EMAIL, description: NOTIF_EMAIL_DESC, enabled: true },
    { key: 'sms', title: NOTIF_SMS, description: NOTIF_SMS_DESC, enabled: true },
    { key: 'newOffers', title: NOTIF_NEW_OFFERS, description: NOTIF_NEW_OFFERS_DESC, enabled: true },
    {
      key: 'bookingUpdates',
      title: NOTIF_BOOKING_UPDATES,
      description: NOTIF_BOOKING_UPDATES_DESC,
      enabled: true,
    },
    {
      key: 'paymentAlerts',
      title: NOTIF_PAYMENT_ALERTS,
      description: NOTIF_PAYMENT_ALERTS_DESC,
      enabled: false,
    },
    {
      key: 'chatMessages',
      title: NOTIF_CHAT_MESSAGES,
      description: NOTIF_CHAT_MESSAGES_DESC,
      enabled: true,
    },
  ]);

  const updateProfileField = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleNotification = key => {
    setNotificationSettings(prev =>
      prev.map(item => (item.key === key ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const handlePhotoOption = async option => {
    let files = [];
    if (option === 'gallery') {
      files = await pickImagesFromGallery(false);
    } else if (option === 'camera') {
      files = await pickImageFromCamera();
    }

    const photo = files.find(isImageFile) || files[0];
    if (photo?.uri) {
      updateProfileField('photoUri', photo.uri);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setProfileForm(savedProfile);
    setIsEditing(false);
  };

  const handleSave = () => {
    const initials = profileForm.fullName
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const updatedProfile = { ...profileForm, initials };
    setSavedProfile(updatedProfile);
    setProfileForm(updatedProfile);
    setIsEditing(false);
    setShowSaveSuccess(true);
  };

  const resetToLogin = () => {
    let rootNavigation = navigation;
    while (rootNavigation.getParent()) {
      rootNavigation = rootNavigation.getParent();
    }

    rootNavigation.reset({
      index: 0,
      routes: [
        {
          name: 'Auth',
          state: {
            index: 0,
            routes: [{ name: SCREEN_NAMES.LOGIN }],
          },
        },
      ],
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    resetToLogin();
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    resetToLogin();
  };

  const statItems = [
    { id: 'wallet', label: PROFILE_STAT_WALLET, value: profileStats.wallet, icon: 'credit-card', color: greenColor },
    { id: 'bookings', label: PROFILE_STAT_BOOKINGS, value: profileStats.bookings, icon: 'calendar', color: blueColor },
    { id: 'jobs', label: PROFILE_STAT_JOBS, value: profileStats.jobsPosted, icon: 'briefcase', color: redColor },
  ];

  const actionItems = [
    {
      id: 'notifications',
      title: PROFILE_NOTIFICATION_SETTINGS,
      desc: PROFILE_NOTIFICATION_SETTINGS_DESC,
      icon: 'bell',
      iconBg: lightPink,
      iconColor: redColor,
      onPress: () => setShowNotificationModal(true),
    },
    {
      id: 'logout',
      title: PROFILE_LOGOUT,
      icon: 'log-out',
      iconBg: '#E8F0F8',
      iconColor: blueColor,
      onPress: () => setShowLogoutModal(true),
    },
    {
      id: 'delete',
      title: PROFILE_DELETE_ACCOUNT,
      icon: 'trash-2',
      iconBg: lightPink,
      iconColor: redColor,
      onPress: () => setShowDeleteModal(true),
      danger: true,
    },
  ];

  const renderViewField = (label, value) => (
    <View style={styles.fieldGap}>
      <FormLabel label={label} />
      <Text style={[styles.viewValue, style.fontWeightThin]}>{value}</Text>
    </View>
  );

  const renderProfileFields = () => {
    if (isEditing) {
      return (
        <>
          <CustomTextInput
            label={PROFILE_FULL_NAME}
            value={profileForm.fullName}
            onChangeText={value => updateProfileField('fullName', value)}
            style={styles.fieldGap}
          />
          <CustomTextInput
            label={PROFILE_EMAIL}
            value={profileForm.email}
            onChangeText={value => updateProfileField('email', value)}
            keyboardType="email-address"
            style={styles.fieldGap}
          />
          <CustomTextInput
            label={PROFILE_PHONE}
            value={profileForm.phone}
            onChangeText={value => updateProfileField('phone', value)}
            keyboardType="phone-pad"
            style={styles.fieldGap}
          />
          <CustomTextInput
            label={PROFILE_LOCATION}
            value={profileForm.location}
            onChangeText={value => updateProfileField('location', value)}
            style={styles.fieldGap}
          />
          <View style={styles.fieldGap}>
            <FormLabel label={PROFILE_BIO} />
            <TextInput
              value={profileForm.bio}
              onChangeText={value => updateProfileField('bio', value)}
              multiline
              textAlignVertical="top"
              placeholderTextColor={grayColor}
              style={[styles.bioInput, style.fontSizeNormal2x]}
            />
          </View>
        </>
      );
    }

    return (
      <>
        {renderViewField(PROFILE_FULL_NAME, savedProfile.fullName)}
        {renderViewField(PROFILE_EMAIL, savedProfile.email)}
        {renderViewField(PROFILE_PHONE, savedProfile.phone)}
        {renderViewField(PROFILE_LOCATION, savedProfile.location)}
        {renderViewField(PROFILE_BIO, savedProfile.bio)}
      </>
    );
  };

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
      <KeyboardAvoidingView
        style={flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            screenContentStyles.scrollContent,
            isEditing && styles.editScrollContent,
          ]}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets>
          <ScreenHeader title={PROFILE_TITLE} navigation={navigation} />

        <View style={styles.profileCard}>
          <View style={[styles.profileTop, flexDirectionRow]}>
            <View style={styles.avatarWrap}>
              <TouchableOpacity
                activeOpacity={isEditing ? 0.8 : 1}
                disabled={!isEditing}
                onPress={() => setShowPhotoOptions(true)}>
                {(isEditing ? profileForm.photoUri : savedProfile.photoUri) ? (
                  <Image
                    source={{ uri: isEditing ? profileForm.photoUri : savedProfile.photoUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={[styles.avatar, alignJustifyCenter]}>
                    <Text style={[styles.avatarText, style.fontWeightMedium]}>
                      {isEditing ? profileForm.initials : savedProfile.initials}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {isEditing ? (
                <TouchableOpacity
                  style={[styles.cameraBtn, alignJustifyCenter]}
                  onPress={() => setShowPhotoOptions(true)}>
                  <Icon name="camera" size={12} color={whiteColor} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, style.fontWeightMedium]}>
                {isEditing ? profileForm.fullName : savedProfile.fullName}
              </Text>
              <Text style={[styles.profileEmail, style.fontWeightThin]}>
                {isEditing ? profileForm.email : savedProfile.email}
              </Text>
              <View style={[styles.roleBadge, flexDirectionRow, alignItemsCenter]}>
                <Icon name="briefcase" size={11} color={blueColor} />
                <Text style={[styles.roleText, style.fontWeightMedium]}>{PROFILE_BUYER_ROLE}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statsGrid, flexDirectionRow]}>
            {statItems.map(item => (
              <View key={item.id} style={styles.statItem}>
                <View style={[flexDirectionRow, alignItemsCenter, styles.statTop]}>
                  <Icon name={item.icon} size={12} color={item.color} />
                  <Text style={[styles.statLabel, style.fontWeightThin]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
                <Text style={[styles.statValue, style.fontWeightMedium]} numberOfLines={1}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={[styles.cardHeader, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <View style={[flexDirectionRow, alignItemsCenter, styles.cardHeaderLeft]}>
              <Icon name="user" size={16} color={redColor} />
              <Text style={[styles.cardTitle, style.fontWeightMedium]}>{PROFILE_PERSONAL_INFO}</Text>
            </View>

            {isEditing ? (
              <View style={[flexDirectionRow, styles.editActions]}>
                <TouchableOpacity style={[styles.cancelBtn, alignJustifyCenter]} onPress={handleCancel}>
                  <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{PROFILE_CANCEL}</Text>
                </TouchableOpacity>
                <CustomButton
                  title={PROFILE_SAVE}
                  iconName="save"
                  onPress={handleSave}
                  style={styles.saveBtn}
                  textStyle={styles.saveBtnText}
                />
              </View>
            ) : (
              <TouchableOpacity style={[styles.editBtn, flexDirectionRow, alignItemsCenter]} onPress={handleEdit}>
                <Icon name="edit-2" size={14} color={redColor} />
                <Text style={[styles.editBtnText, style.fontWeightMedium]}>{PROFILE_EDIT}</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderProfileFields()}
        </View>

        <View style={styles.contentCard}>
          {actionItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.actionRow,
                flexDirectionRow,
                alignItemsCenter,
                justifyContentSpaceBetween,
                index < actionItems.length - 1 && styles.actionBorder,
              ]}
              onPress={item.onPress}>
              <View style={[flexDirectionRow, alignItemsCenter, styles.actionLeft]}>
                <View style={[styles.actionIconWrap, alignJustifyCenter, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon} size={16} color={item.iconColor} />
                </View>
                <View style={styles.actionTextWrap}>
                  <Text
                    style={[
                      styles.actionTitle,
                      style.fontWeightMedium,
                      item.danger && styles.actionTitleDanger,
                    ]}>
                    {item.title}
                  </Text>
                  {item.desc ? (
                    <Text style={[styles.actionDesc, style.fontWeightThin]}>{item.desc}</Text>
                  ) : null}
                </View>
              </View>
              <Icon name="chevron-right" size={18} color={grayColor} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <UploadOptionsModal
        visible={showPhotoOptions}
        onClose={() => setShowPhotoOptions(false)}
        onSelect={handlePhotoOption}
        title={PROFILE_UPLOAD_PHOTO}
        photoOnly
      />

      <NotificationSettingsModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        settings={notificationSettings}
        onToggle={handleToggleNotification}
      />

      <SuccessModal
        visible={showSaveSuccess}
        title={PROFILE_SAVED_TITLE}
        message={PROFILE_SAVED_MESSAGE}
        onPress={() => setShowSaveSuccess(false)}
      />

      <ConfirmationModal
        visible={showLogoutModal}
        title={PROFILE_LOGOUT_TITLE}
        message={PROFILE_LOGOUT_MESSAGE}
        confirmText={PROFILE_LOGOUT_CONFIRM}
        iconName="log-out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ConfirmationModal
        visible={showDeleteModal}
        title={PROFILE_DELETE_TITLE}
        message={PROFILE_DELETE_MESSAGE}
        confirmText={PROFILE_DELETE_CONFIRM}
        iconName="trash-2"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  editScrollContent: {
    paddingBottom: hp(12),
  },
  profileCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.xLarge,
    marginBottom: hp(2),
  },
  profileTop: {
    gap: spacings.large,
    marginBottom: spacings.large,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: wp(18),
    height: wp(18),
    borderRadius: 12,
    backgroundColor: redColor,
  },
  avatarImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: 12,
  },
  avatarText: {
    color: whiteColor,
    fontSize: style.fontSizeLarge.fontSize,
  },
  cameraBtn: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: blackColor,
    borderWidth: 2,
    borderColor: whiteColor,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.small,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#E8F0F8',
    paddingHorizontal: spacings.normal,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: blueColor,
  },
  statsGrid: {
    gap: spacings.small,
  },
  statItem: {
    flex: 1,
    backgroundColor: inputBgColor,
    borderRadius: 10,
    padding: spacings.normal,
  },
  statTop: {
    gap: 3,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    flexShrink: 1,
  },
  statValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  contentCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.xLarge,
    marginBottom: hp(2),
  },
  cardHeader: {
    marginBottom: spacings.large,
    gap: spacings.normal,
  },
  cardHeaderLeft: {
    gap: spacings.normal,
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  editBtn: {
    gap: 4,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderLightColor,
    flexShrink: 0,
  },
  editBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  editActions: {
    gap: spacings.small,
    flexShrink: 0,
  },
  cancelBtn: {
    minHeight: hp(5),
    paddingHorizontal: spacings.large,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
  },
  cancelBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  saveBtn: {
    width: 'auto',
    minHeight: hp(5),
    paddingHorizontal: spacings.large,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  fieldGap: {
    marginBottom: spacings.large,
  },
  viewValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    lineHeight: 22,
  },
  bioInput: {
    minHeight: hp(12),
    borderRadius: 10,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    color: blackColor,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionRow: {
    paddingVertical: spacings.large,
    gap: spacings.normal,
  },
  actionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  actionLeft: {
    flex: 1,
    gap: spacings.normal,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
  },
  actionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  actionTitleDanger: {
    color: redColor,
  },
  actionDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
});
