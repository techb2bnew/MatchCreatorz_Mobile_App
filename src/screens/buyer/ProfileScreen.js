import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';
import {
  getBuyerProfileApi,
  updateBuyerProfileApi,
  getBuyerStatsApi,
  deleteBuyerAccountApi,
} from '../../services/buyerService';
import { formatAppCurrency } from '../../utils/currency';
import { getApiErrorMessage } from '../../services/apiClient';
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
  purpleColor,
  goldColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
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
  PROFILE_DELETE_REASON_PLACEHOLDER,
  ERROR_DELETE_REASON_REQUIRED,
  ERROR_DELETE_ACCOUNT_FAILED,
  PROFILE_DELETE_MESSAGE,
  PROFILE_DELETE_TITLE,
  PROFILE_EDIT,
  PROFILE_EMAIL,
  PROFILE_EMAIL_LOGIN_HINT,
  PROFILE_ACCOUNT_SETTINGS,
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
  BUYER_STAT_ACTIVE_BOOKINGS,
  BUYER_STAT_COMPLETED_BOOKINGS,
  BUYER_STAT_OPEN_JOBS,
  BUYER_STAT_TOTAL_JOBS,
  BUYER_STAT_TOTAL_SPENT,
  PROFILE_TITLE,
  PROFILE_UPLOAD_PHOTO,
  ERROR_FULL_NAME_REQUIRED,
  ERROR_PHONE_REQUIRED,
  ERROR_PROFILE_UPDATE_FAILED,
} from '../../constans/Constants';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import FormLabel from '../../components/FormLabel';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import SuccessModal from '../../components/modal/SuccessModal';
import NotificationSettingsModal from '../../components/modal/NotificationSettingsModal';
import UploadOptionsModal from '../../components/modal/UploadOptionsModal';
import { pickImageFromCamera, pickImagesFromGallery, isImageFile } from '../../utils/filePicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import {
  keyboardAvoidingBehavior,
  scrollInputAboveKeyboard,
  useKeyboardBottomInset,
} from '../../utils/keyboard';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const EMPTY_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  initials: '',
  photoUri: null,
};

const EMPTY_PROFILE_STATS = {
  activeBookings: '0',
  completedBookings: '0',
  totalSpent: formatAppCurrency(0, { whole: true }),
  totalJobs: '0',
  openJobs: '0',
};

const mapBuyerStatsToUi = stats => ({
  activeBookings: String(stats?.activeBookings ?? 0),
  completedBookings: String(stats?.completedBookings ?? 0),
  totalSpent: formatAppCurrency(stats?.totalSpent ?? 0, { whole: true }),
  totalJobs: String(stats?.totalJobs ?? 0),
  openJobs: String(stats?.openJobs ?? 0),
});

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const mapBuyerProfileToUi = data => {
  const fullName = data?.name || '';
  return {
    fullName,
    email: data?.email || '',
    phone: data?.phone || '',
    location: data?.location || '',
    bio: data?.bio || '',
    initials: getInitials(fullName),
    photoUri: data?.avatar || null,
  };
};

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token } = useSelector(selectAuth);
  const scrollRef = useRef(null);
  const keyboardBottom = useKeyboardBottomInset(40);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteReasonError, setDeleteReasonError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const [savedProfile, setSavedProfile] = useState(EMPTY_PROFILE);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);

  const [profileStats, setProfileStats] = useState(EMPTY_PROFILE_STATS);

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

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchBuyerProfile = async () => {
        if (!token) {
          console.log('[BuyerProfile] Skipped — no token');
          return;
        }
        try {
          const [profileResponse, statsResponse] = await Promise.all([
            getBuyerProfileApi(token),
            getBuyerStatsApi(token),
          ]);
          if (cancelled) return;

          const mapped = mapBuyerProfileToUi(profileResponse?.data);
          setSavedProfile(mapped);
          if (!isEditing) {
            setProfileForm(mapped);
          }

          setProfileStats(mapBuyerStatsToUi(statsResponse?.data?.stats || {}));
        } catch (error) {
          // Logged inside buyer service APIs
          if (!cancelled) {
            setProfileStats(EMPTY_PROFILE_STATS);
          }
        }
      };

      fetchBuyerProfile();

      return () => {
        cancelled = true;
      };
    }, [token, isEditing]),
  );

  const updateProfileField = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    if (saveError) setSaveError('');
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

  const handleEdit = () => {
    setSaveError('');
    setIsEditing(true);
  };

  const handleInputFocus = event => {
    scrollInputAboveKeyboard(scrollRef, event, 160);
  };

  const handleCancel = () => {
    setProfileForm(savedProfile);
    setSaveError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const name = String(profileForm.fullName || '').trim();
    const phone = String(profileForm.phone || '').trim();
    const bio = String(profileForm.bio || '').trim();
    const location = String(profileForm.location || '').trim();

    if (!name) {
      setSaveError(ERROR_FULL_NAME_REQUIRED);
      return;
    }
    if (!phone) {
      setSaveError(ERROR_PHONE_REQUIRED);
      return;
    }
    if (!token) {
      setSaveError(ERROR_PROFILE_UPDATE_FAILED);
      return;
    }

    const payload = { name, phone, bio, location };
    setIsSaving(true);
    setSaveError('');

    try {
      const response = await updateBuyerProfileApi(token, payload);
      const fromApi = response?.data ? mapBuyerProfileToUi(response.data) : null;
      const nextProfile = {
        ...savedProfile,
        fullName: fromApi?.fullName || name,
        phone: fromApi?.phone || phone,
        bio: fromApi ? fromApi.bio : bio,
        location: fromApi ? fromApi.location : location,
        email: fromApi?.email || savedProfile.email,
        photoUri: fromApi?.photoUri || savedProfile.photoUri,
        initials: getInitials(fromApi?.fullName || name),
      };
      setSavedProfile(nextProfile);
      setProfileForm(nextProfile);
      setIsEditing(false);
      setShowSaveSuccess(true);
    } catch (error) {
      setSaveError(getApiErrorMessage(error?.data, error?.message || ERROR_PROFILE_UPDATE_FAILED));
    } finally {
      setIsSaving(false);
    }
  };

  const resetToLogin = async () => {
    await dispatch(logoutUser());
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    resetToLogin();
  };

  const openDeleteModal = () => {
    setDeleteReason('');
    setDeleteReasonError('');
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setDeleteReason('');
    setDeleteReasonError('');
  };

  const handleDeleteAccount = async () => {
    const reason = String(deleteReason || '').trim();
    if (!reason) {
      setDeleteReasonError(ERROR_DELETE_REASON_REQUIRED);
      return;
    }

    if (!token) return;

    setIsDeleting(true);
    setDeleteReasonError('');

    try {
      await deleteBuyerAccountApi(token, reason);
      setShowDeleteModal(false);
      setDeleteReason('');
      await resetToLogin();
    } catch (error) {
      setDeleteReasonError(
        getApiErrorMessage(error?.data, error?.message || ERROR_DELETE_ACCOUNT_FAILED),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const hasLocation = Boolean(String(savedProfile.location || '').trim());
  const hasBio = Boolean(String(savedProfile.bio || '').trim());

  const statItems = [
    {
      id: 'activeBookings',
      label: BUYER_STAT_ACTIVE_BOOKINGS,
      value: profileStats.activeBookings,
      icon: 'calendar',
      iconColor: blueColor,
      iconBg: '#E8F0F8',
    },
    {
      id: 'completedBookings',
      label: BUYER_STAT_COMPLETED_BOOKINGS,
      value: profileStats.completedBookings,
      icon: 'check-circle',
      iconColor: greenColor,
      iconBg: '#E8F8EE',
    },
    {
      id: 'totalSpent',
      label: BUYER_STAT_TOTAL_SPENT,
      value: profileStats.totalSpent,
      icon: 'dollar-sign',
      iconColor: redColor,
      iconBg: lightPink,
    },
    {
      id: 'openJobs',
      label: BUYER_STAT_OPEN_JOBS,
      value: profileStats.openJobs,
      icon: 'folder',
      iconColor: purpleColor,
      iconBg: '#F3E8FF',
    },
    {
      id: 'totalJobs',
      label: BUYER_STAT_TOTAL_JOBS,
      value: profileStats.totalJobs,
      icon: 'briefcase',
      iconColor: goldColor,
      iconBg: '#FFF8E8',
    },
  ];

  const renderStatsRow = items => (
    <View style={[styles.statsRow, flexDirectionRow, alignItemsCenter]}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <View style={[styles.statItem, alignItemsCenter]}>
            {/* <View
              style={[
                styles.statIconWrap,
                alignJustifyCenter,
                { backgroundColor: item.iconBg },
              ]}>
              <Icon name={item.icon} size={15} color={item.iconColor} />
            </View> */}
            <Text style={[styles.statValue, style.fontWeightMedium]} numberOfLines={1}>
              {item.value}
            </Text>
            <Text style={[styles.statLabel, style.fontWeightThin]} numberOfLines={2}>
              {item.label}
            </Text>
          </View>
          {index < items.length - 1 ? <View style={styles.statDivider} /> : null}
        </React.Fragment>
      ))}
    </View>
  );

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
      id: 'delete',
      title: PROFILE_DELETE_ACCOUNT,
      icon: 'trash-2',
      iconBg: lightPink,
      iconColor: redColor,
      onPress: openDeleteModal,
      danger: true,
    },
    {
      id: 'logout',
      title: PROFILE_LOGOUT,
      icon: 'log-out',
      iconBg: '#E8F0F8',
      iconColor: blueColor,
      onPress: () => setShowLogoutModal(true),
    }
    
  ];

  const renderViewField = (label, value) => (
    <View style={styles.fieldGap}>
      <FormLabel label={label} />
      <Text style={[styles.viewValue, style.fontWeightThin]}>{value}</Text>
    </View>
  );

  const renderReadOnlyEmailField = () => (
    <View style={styles.fieldGap}>
      <FormLabel label={PROFILE_EMAIL} />
      <View style={[styles.readOnlyField, flexDirectionRow, alignItemsCenter]}>
        <Icon name="mail" size={16} color={grayColor} />
        <Text style={[styles.readOnlyText, style.fontWeightThin]} numberOfLines={1}>
          {profileForm.email}
        </Text>
        <Icon name="lock" size={14} color={grayColor} />
      </View>
      <Text style={[styles.fieldHint, style.fontWeightThin]}>{PROFILE_EMAIL_LOGIN_HINT}</Text>
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
            onFocus={handleInputFocus}
            style={styles.fieldGap}
          />
          {renderReadOnlyEmailField()}
          <CustomTextInput
            label={PROFILE_PHONE}
            value={profileForm.phone}
            onChangeText={value => updateProfileField('phone', value)}
            keyboardType="phone-pad"
            onFocus={handleInputFocus}
            style={styles.fieldGap}
          />
          <CustomTextInput
            label={PROFILE_LOCATION}
            value={profileForm.location}
            onChangeText={value => updateProfileField('location', value)}
            onFocus={handleInputFocus}
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
              onFocus={handleInputFocus}
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
        {hasLocation ? renderViewField(PROFILE_LOCATION, savedProfile.location) : null}
        {hasBio ? renderViewField(PROFILE_BIO, savedProfile.bio) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
      <KeyboardAvoidingView style={flex} behavior={keyboardAvoidingBehavior}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            screenContentStyles.scrollContent,
            isEditing && styles.editScrollContent,
            { paddingBottom: (isEditing ? hp(12) : hp(3)) + keyboardBottom },
          ]}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
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
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, style.fontWeightMedium]} numberOfLines={1}>
                {isEditing ? profileForm.fullName : savedProfile.fullName}
              </Text>
              <Text style={[styles.profileEmail, style.fontWeightThin]} numberOfLines={1}>
                {isEditing ? profileForm.email : savedProfile.email}
              </Text>
              <View style={[styles.roleBadge, flexDirectionRow, alignItemsCenter]}>
                <Icon name="briefcase" size={11} color={blueColor} />
                <Text style={[styles.roleText, style.fontWeightMedium]}>{PROFILE_BUYER_ROLE}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsSummaryCard}>
          {renderStatsRow(statItems.slice(0, 3))}
          <View style={styles.statsRowSeparator} />
          <View style={styles.statsRowBottom}>{renderStatsRow(statItems.slice(3))}</View>
        </View>

        <View style={styles.contentCard}>
          <View style={[styles.cardHeader, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <View style={[flexDirectionRow, alignItemsCenter, styles.cardHeaderLeft]}>
              <Icon name="user" size={16} color={redColor} />
              <Text style={[styles.cardTitle, style.fontWeightMedium]}>{PROFILE_PERSONAL_INFO}</Text>
            </View>

            {isEditing ? null : (
              <TouchableOpacity style={[styles.editBtn, flexDirectionRow, alignItemsCenter]} onPress={handleEdit}>
                <Icon name="edit-2" size={14} color={redColor} />
                <Text style={[styles.editBtnText, style.fontWeightMedium]}>{PROFILE_EDIT}</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderProfileFields()}
          {isEditing ? (
            <>
              {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
              <View style={[styles.formActions, flexDirectionRow]}>
                <TouchableOpacity
                  style={[styles.cancelBtnFull, flex, alignJustifyCenter]}
                  onPress={handleCancel}
                  disabled={isSaving}>
                  <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{PROFILE_CANCEL}</Text>
                </TouchableOpacity>
                <CustomButton
                  title={PROFILE_SAVE}
                  iconName="save"
                  onPress={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                  style={[styles.saveBtnFull, flex]}
                  textStyle={styles.saveBtnText}
                />
              </View>
            </>
          ) : null}
        </View>

        {!isEditing ? (
        <View style={styles.contentCard}>
          <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{PROFILE_ACCOUNT_SETTINGS}</Text>
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
        ) : null}
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
        showReasonInput
        reasonValue={deleteReason}
        onReasonChange={text => {
          setDeleteReason(text);
          if (deleteReasonError) setDeleteReasonError('');
        }}
        reasonPlaceholder={PROFILE_DELETE_REASON_PLACEHOLDER}
        reasonError={deleteReasonError}
        loading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={handleCancelDelete}
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
    marginBottom: spacings.normal,
  },
  profileTop: {
    gap: spacings.large,
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
  statsSummaryCard: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingVertical: spacings.xLarge,
    paddingHorizontal: spacings.small,
    marginBottom: hp(1.5),
  },
  statsRow: {
    width: '100%',
  },
  statsRowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: borderLightColor,
    marginVertical: spacings.large,
    marginHorizontal: spacings.normal,
  },
  statsRowBottom: {
    paddingHorizontal: wp(10),
  },
  statItem: {
    flex: 1,
    paddingHorizontal: spacings.xsmall,
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: borderLightColor,
    marginVertical: spacings.small,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginBottom: spacings.xsmall,
  },
  statLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    textAlign: 'center',
    lineHeight: 14,
  },
  statValue: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
    textAlign: 'center',
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
  formActions: {
    gap: spacings.normal,
    marginTop: spacings.small,
  },
  cancelBtnFull: {
    minHeight: hp(5.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
  },
  saveBtnFull: {
    minHeight: hp(5.5),
    borderRadius: 10,
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
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: spacings.normal,
  },
  readOnlyField: {
    borderRadius: 10,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    minHeight: hp(6),
    gap: spacings.normal,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  readOnlyText: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
  },
  fieldHint: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginTop: spacings.xsmall,
    marginLeft: spacings.xsmall,
  },
  sectionTitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacings.normal,
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
