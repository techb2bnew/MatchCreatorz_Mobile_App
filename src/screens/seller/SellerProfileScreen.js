import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { logoutUser, selectAuth, setAuthSession } from '../../redux/slices/authSlice';
import {
  getSellerProfileApi,
  getSellerStatsApi,
  updateSellerProfileApi,
  deleteSellerAccountApi,
  getSellerPreferencesApi,
  updateSellerPreferencesApi,
} from '../../services/sellerService';
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
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  NOTIF_BOOKING_UPDATES,
  NOTIF_BOOKING_UPDATES_DESC,
  NOTIF_CHAT_MESSAGES,
  NOTIF_CHAT_MESSAGES_DESC,
  NOTIF_EMAIL,
  NOTIF_EMAIL_DESC,
  NOTIF_PAYMENT_ALERTS,
  NOTIF_PAYMENT_ALERTS_DESC,
  NOTIF_SMS,
  NOTIF_SMS_DESC,
  BIO,
  CATEGORY_OPTIONS,
  COUNTRY,
  GENDER_OPTIONS,
  LABEL_CITY,
  LABEL_HOURLY_RATE,
  PORTFOLIO,
  PORTFOLIO_LINK_PLACEHOLDER,
  PORTFOLIO_LINKS,
  PROFILE_CANCEL,
  PROFILE_DELETE_ACCOUNT,
  PROFILE_DELETE_CONFIRM,
  PROFILE_DELETE_REASON_PLACEHOLDER,
  ERROR_DELETE_REASON_REQUIRED,
  ERROR_DELETE_ACCOUNT_FAILED,
  PROFILE_DELETE_MESSAGE,
  PROFILE_DELETE_TITLE,
  PROFILE_DETAILS,
  PROFILE_EDIT,
  PROFILE_EMAIL,
  PROFILE_EMAIL_LOGIN_HINT,
  PROFILE_ACCOUNT_SETTINGS,
  PROFILE_FULL_NAME,
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
  PROFILE_STAT_WALLET,
  PROFILE_UPLOAD_PHOTO,
  RESUME_CV,
  RESPONSE_TIME_OPTIONS,
  SCREEN_NAMES,
  SELLER_NOTIF_BID_RESPONSES,
  SELLER_NOTIF_BID_RESPONSES_DESC,
  SELLER_NOTIF_NEW_JOBS,
  SELLER_NOTIF_NEW_JOBS_DESC,
  SELLER_NOTIF_OFFER_ALERTS,
  SELLER_NOTIF_OFFER_ALERTS_DESC,
  SELLER_PROFILE_CONNECTS,
  SELLER_PROFILE_MY_SERVICES,
  SELLER_PROFILE_QUICK_LINKS,
  SELLER_PROFILE_ROLE,
  SELLER_PROFILE_TITLE,
  SELLER_STAT_BOOKINGS,
  SELLER_STAT_COMPLETED_BOOKINGS,
  SELLER_STAT_EARNINGS,
  SELLER_STAT_PENDING_BIDS,
  SELLER_STAT_TOTAL_SERVICES,
  TAGS_SKILLS,
  ERROR_FULL_NAME_REQUIRED,
  ERROR_PHONE_REQUIRED,
  ERROR_PROFILE_UPDATE_FAILED,
  ERROR_UPDATE_PREFERENCE_FAILED,
} from '../../constans/Constants';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import FormLabel from '../../components/FormLabel';
import ProfileDetailsStep from '../../components/ProfileDetailsStep';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import SuccessModal from '../../components/modal/SuccessModal';
import NotificationSettingsModal from '../../components/modal/NotificationSettingsModal';
import UploadOptionsModal from '../../components/modal/UploadOptionsModal';
import { pickImageFromCamera, pickImagesFromGallery, isImageFile } from '../../utils/filePicker';
import { DEFAULT_COUNTRY } from '../../utils/locationData';
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
  flexWrap,
} = BaseStyle;

const createEmptySellerProfile = () => ({
  fullName: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  initials: '',
  photoUri: null,
  hourlyRate: '',
  dateOfBirth: '',
  country: DEFAULT_COUNTRY,
  state: '',
  city: '',
  zipCode: '',
  gender: GENDER_OPTIONS[0],
  category: CATEGORY_OPTIONS[0],
  tags: [],
  responseTime: RESPONSE_TIME_OPTIONS[2],
  resumeUrl: null,
  resumeFile: null,
  resumeRemoved: false,
  portfolioLinks: [],
  portfolioLink: '',
  portfolioFiles: [],
  connectsBalance: 0,
});

const getInitials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';

const parseSkills = skills => {
  if (!Array.isArray(skills)) return [];
  return skills.flatMap(item =>
    String(item || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean),
  );
};

const formatLocation = (city, country, location) => {
  if (String(location || '').trim()) return String(location).trim();
  return [city, country]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(', ');
};

const getFileNameFromUrl = url => {
  if (!url) return 'File';
  const pathname = String(url).split('?')[0];
  return pathname.split('/').pop() || 'File';
};

const isImageUrl = url => /\.(jpe?g|png|gif|webp)(\?|$)/i.test(String(url || ''));

const mapSellerProfileToUi = data => {
  const sellerProfile = data?.seller_profile || {};
  const fullName = data?.name || '';
  const city = sellerProfile.city || '';
  const country = sellerProfile.country || DEFAULT_COUNTRY;
  const resumeUrl = sellerProfile.resume || null;

  return {
    fullName,
    email: data?.email || '',
    phone: data?.phone || '',
    location: formatLocation(city, country, data?.location),
    bio: sellerProfile.bio || data?.bio || '',
    initials: getInitials(fullName),
    photoUri: sellerProfile.profile_image || data?.avatar || null,
    hourlyRate: sellerProfile.hourly_rate ? String(Number(sellerProfile.hourly_rate)) : '',
    dateOfBirth: '',
    country,
    state: '',
    city,
    zipCode: '',
    gender: GENDER_OPTIONS[0],
    category: CATEGORY_OPTIONS[0],
    tags: parseSkills(sellerProfile.skills),
    responseTime: RESPONSE_TIME_OPTIONS[2],
    resumeUrl,
    resumeFile: resumeUrl
      ? { name: getFileNameFromUrl(resumeUrl), uri: resumeUrl, size: null, isRemote: true }
      : null,
    resumeRemoved: false,
    portfolioLinks: Array.isArray(sellerProfile.portfolio_links)
      ? sellerProfile.portfolio_links.filter(Boolean)
      : [],
    portfolioLink: '',
    portfolioFiles: Array.isArray(sellerProfile.portfolio_files)
      ? sellerProfile.portfolio_files.filter(Boolean)
      : [],
    connectsBalance: Number(sellerProfile.connects_balance ?? 0) || 0,
  };
};

const EMPTY_PROFILE_STATS = {
  activeBookings: '0',
  completedBookings: '0',
  totalEarnings: formatAppCurrency(0, { whole: true }),
  totalServices: '0',
  pendingBids: '0',
  connects: '0',
};

const mapSellerStatsToProfile = (stats, connectsBalance = 0) => ({
  activeBookings: String(stats?.activeBookings ?? 0),
  completedBookings: String(stats?.completedBookings ?? 0),
  totalEarnings: formatAppCurrency(stats?.totalEarnings ?? 0, { whole: true }),
  totalServices: String(stats?.totalServices ?? 0),
  pendingBids: String(stats?.pendingBids ?? 0),
  connects: String(connectsBalance ?? 0),
});

const SellerProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token, user, role } = useSelector(selectAuth);
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

  const [savedProfile, setSavedProfile] = useState(createEmptySellerProfile);
  const [profileForm, setProfileForm] = useState(createEmptySellerProfile);
  const [profileStats, setProfileStats] = useState(EMPTY_PROFILE_STATS);

  const [notificationSettings, setNotificationSettings] = useState([
    { key: 'email', title: NOTIF_EMAIL, description: NOTIF_EMAIL_DESC, enabled: true },
    { key: 'sms', title: NOTIF_SMS, description: NOTIF_SMS_DESC, enabled: true },
    { key: 'jobAlert', title: SELLER_NOTIF_NEW_JOBS, description: SELLER_NOTIF_NEW_JOBS_DESC, enabled: true },
    {
      key: 'bidResponses',
      title: SELLER_NOTIF_BID_RESPONSES,
      description: SELLER_NOTIF_BID_RESPONSES_DESC,
      enabled: true,
    },
    {
      key: 'offerAlert',
      title: SELLER_NOTIF_OFFER_ALERTS,
      description: SELLER_NOTIF_OFFER_ALERTS_DESC,
      enabled: true,
    },
    {
      key: 'bookingAlert',
      title: NOTIF_BOOKING_UPDATES,
      description: NOTIF_BOOKING_UPDATES_DESC,
      enabled: true,
    },
    {
      key: 'payAlert',
      title: NOTIF_PAYMENT_ALERTS,
      description: NOTIF_PAYMENT_ALERTS_DESC,
      enabled: false,
    },
    {
      key: 'chatAlert',
      title: NOTIF_CHAT_MESSAGES,
      description: NOTIF_CHAT_MESSAGES_DESC,
      enabled: true,
    },
  ]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchSellerProfile = async () => {
        if (!token) {
          console.log('[SellerProfile] Skipped — no token');
          return;
        }

        try {
          const [profileResponse, statsResponse] = await Promise.all([
            getSellerProfileApi(token),
            getSellerStatsApi(token),
          ]);
          if (cancelled) return;

          const mapped = mapSellerProfileToUi(profileResponse?.data);
          const stats = statsResponse?.data?.stats || {};

          setSavedProfile(mapped);
          setProfileStats(
            mapSellerStatsToProfile(stats, mapped.connectsBalance),
          );
          if (!isEditing) {
            setProfileForm(mapped);
          }
        } catch (error) {
          if (!cancelled) {
            setProfileStats(EMPTY_PROFILE_STATS);
          }
        }

        try {
          const preferencesResponse = await getSellerPreferencesApi(token);
          if (cancelled) return;
          const notifications = preferencesResponse?.data?.notifications || preferencesResponse?.notifications || {};
          setNotificationSettings(prev =>
            prev.map(item =>
              notifications[item.key] != null ? { ...item, enabled: Boolean(notifications[item.key]) } : item,
            ),
          );
        } catch (error) {
          // Keep default toggle state if preferences can't be loaded.
        }
      };

      fetchSellerProfile();

      return () => {
        cancelled = true;
      };
    }, [token, isEditing]),
  );

  const headerUser = {
    name: savedProfile.fullName,
    initials: savedProfile.initials,
    email: savedProfile.email,
  };

  const updateProfileField = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    if (saveError) setSaveError('');
  };

  const handleToggleNotification = async key => {
    const current = notificationSettings.find(item => item.key === key);
    if (!current) return;
    const nextEnabled = !current.enabled;

    setNotificationSettings(prev =>
      prev.map(item => (item.key === key ? { ...item, enabled: nextEnabled } : item)),
    );

    if (!token) return;
    try {
      await updateSellerPreferencesApi(token, { notifications: { [key]: nextEnabled } });
    } catch (error) {
      setNotificationSettings(prev =>
        prev.map(item => (item.key === key ? { ...item, enabled: !nextEnabled } : item)),
      );
      Alert.alert('', getApiErrorMessage(error?.data, error?.message || ERROR_UPDATE_PREFERENCE_FAILED));
    }
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
    setProfileForm(savedProfile);
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
    const city = String(profileForm.city || '').trim();
    const country = String(profileForm.country || '').trim();
    const location =
      formatLocation(city, country, profileForm.location) ||
      [city, country].filter(Boolean).join(', ');
    const hourlyRate = String(profileForm.hourlyRate || '').trim();
    const skills = Array.isArray(profileForm.tags) ? profileForm.tags : [];
    const hasNewResume = profileForm.resumeFile?.uri && !profileForm.resumeFile.isRemote;
    const removeResume = Boolean(profileForm.resumeRemoved);

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

    const payload = {
      name,
      phone,
      bio,
      location,
      city,
      country,
      skills: skills.join(','),
      hourly_rate: hourlyRate ? String(Number(hourlyRate)) : undefined,
      portfolio_links: profileForm.portfolioLinks || [],
      ...(hasNewResume || removeResume
        ? {
            resumeFile: profileForm.resumeFile,
            removeResume,
          }
        : {}),
    };
    setIsSaving(true);
    setSaveError('');

    try {
      const response = await updateSellerProfileApi(token, payload);
      const fromApi = response?.data ? mapSellerProfileToUi(response.data) : null;
      const nextProfile = {
        ...profileForm,
        ...savedProfile,
        fullName: fromApi?.fullName || name,
        phone: fromApi?.phone || phone,
        bio: fromApi ? fromApi.bio : bio,
        location: fromApi ? fromApi.location : location,
        city: fromApi?.city || city,
        country: fromApi?.country || country,
        hourlyRate: fromApi?.hourlyRate || hourlyRate,
        tags: fromApi?.tags || skills,
        email: fromApi?.email || savedProfile.email,
        photoUri: fromApi?.photoUri || savedProfile.photoUri,
        resumeUrl: fromApi?.resumeUrl ?? (removeResume && !hasNewResume ? null : savedProfile.resumeUrl),
        resumeFile: fromApi?.resumeFile ?? (removeResume && !hasNewResume ? null : profileForm.resumeFile),
        resumeRemoved: false,
        portfolioLinks: fromApi?.portfolioLinks ?? savedProfile.portfolioLinks,
        portfolioFiles: fromApi?.portfolioFiles ?? savedProfile.portfolioFiles,
        connectsBalance: fromApi?.connectsBalance ?? savedProfile.connectsBalance,
        initials: getInitials(fromApi?.fullName || name),
      };
      setSavedProfile(nextProfile);
      setProfileForm(nextProfile);
      if (token && user) {
        dispatch(
          setAuthSession({
            token,
            role,
            user: {
              ...user,
              name: nextProfile.fullName,
              phone: nextProfile.phone,
              bio: nextProfile.bio,
              location: nextProfile.location,
              avatar: nextProfile.photoUri,
            },
          }),
        );
      }
      setIsEditing(false);
      setShowSaveSuccess(true);
    } catch (error) {
      setSaveError(getApiErrorMessage(error?.data, error?.message || ERROR_PROFILE_UPDATE_FAILED));
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfessionalChange = updated => {
    setProfileForm(prev => ({ ...prev, ...updated }));
    if (saveError) setSaveError('');
  };

  const handleToggleTag = tag => {
    setProfileForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(item => item !== tag) : [...prev.tags, tag],
    }));
    if (saveError) setSaveError('');
  };

  const handleAddPortfolioLink = () => {
    const link = profileForm.portfolioLink?.trim();
    if (!link) return;
    setProfileForm(prev => ({
      ...prev,
      portfolioLinks: [...(prev.portfolioLinks || []), link],
      portfolioLink: '',
    }));
  };

  const handleRemovePortfolioLink = index => {
    setProfileForm(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, itemIndex) => itemIndex !== index),
    }));
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
      await deleteSellerAccountApi(token, reason);
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

  const statItems = [
    { id: 'activeBookings', label: SELLER_STAT_BOOKINGS, value: profileStats.activeBookings },
    { id: 'completedBookings', label: SELLER_STAT_COMPLETED_BOOKINGS, value: profileStats.completedBookings },
    { id: 'totalEarnings', label: SELLER_STAT_EARNINGS, value: profileStats.totalEarnings },
    { id: 'totalServices', label: SELLER_STAT_TOTAL_SERVICES, value: profileStats.totalServices },
    { id: 'pendingBids', label: SELLER_STAT_PENDING_BIDS, value: profileStats.pendingBids },
  ];

  const renderStatsRow = items => (
    <View style={[styles.statsRow, flexDirectionRow, alignItemsCenter]}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <View style={[styles.statItem, alignItemsCenter]}>
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

  const quickLinkItems = [
    {
      id: 'wallet',
      title: PROFILE_STAT_WALLET,
      desc: 'Manage wallet balance',
      icon: 'credit-card',
      iconBg: '#E8F8EE',
      iconColor: greenColor,
      onPress: () => navigation.navigate(SCREEN_NAMES.SELLER_WALLET),
    },
    {
      id: 'connects',
      title: SELLER_PROFILE_CONNECTS,
      desc: `${profileStats.connects} remaining`,
      icon: 'link',
      iconBg: lightPink,
      iconColor: redColor,
      onPress: () => navigation.navigate(SCREEN_NAMES.SELLER_CONNECTS),
    },
    {
      id: 'services',
      title: SELLER_PROFILE_MY_SERVICES,
      desc: 'Manage your service listings',
      icon: 'layers',
      iconBg: '#E8F0F8',
      iconColor: blueColor,
      onPress: () => navigation.navigate(SCREEN_NAMES.SELLER_MY_SERVICES),
    },
  ];

  const accountItems = [
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
    },
  ];

  const renderDetailItem = (label, value) => (
    <View style={styles.detailItem}>
      <FormLabel label={label} style={styles.compactLabel} />
      <Text style={[styles.detailValue, style.fontWeightThin]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );

  const renderDetailRow = items => (
    <View style={[styles.detailRow, flexDirectionRow]}>
      {items.map(item => (
        <View key={item.label} style={styles.detailCol}>
          {renderDetailItem(item.label, item.value)}
        </View>
      ))}
    </View>
  );

  const renderViewField = (label, value) => (
    <View style={styles.detailBlock}>
      <FormLabel label={label} style={styles.compactLabel} />
      <Text style={[styles.detailValue, style.fontWeightThin]}>{value}</Text>
    </View>
  );

  const renderSectionDivider = () => <View style={styles.sectionDivider} />;

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

  const renderPersonalFields = () => {
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
        </>
      );
    }

    return (
      <>
        {renderViewField(PROFILE_FULL_NAME, savedProfile.fullName)}
        {renderSectionDivider()}
        {renderViewField(PROFILE_EMAIL, savedProfile.email)}
        {renderSectionDivider()}
        {renderViewField(PROFILE_PHONE, savedProfile.phone)}
      </>
    );
  };

  const renderProfessionalView = () => {
    const profile = savedProfile;
    const hasHourlyRate = Boolean(String(profile.hourlyRate || '').trim());
    const hasCountry = Boolean(String(profile.country || '').trim());
    const hasCity = Boolean(String(profile.city || '').trim());
    const hasTags = profile.tags?.length > 0;
    const hasResume = Boolean(profile.resumeUrl);
    const hasBio = Boolean(String(profile.bio || '').trim());

    if (!hasHourlyRate && !hasCountry && !hasCity && !hasTags && !hasResume && !hasBio) {
      return <Text style={[styles.emptyHint, style.fontWeightThin]}>No profile details added</Text>;
    }

    return (
      <>
        {hasHourlyRate ? (
          <>
            {renderViewField(LABEL_HOURLY_RATE, `$${profile.hourlyRate}`)}
            {hasCountry || hasCity || hasTags || hasResume || hasBio ? renderSectionDivider() : null}
          </>
        ) : null}
        {hasCountry || hasCity ? (
          <>
            <View style={[styles.detailRow, flexDirectionRow]}>
              {hasCountry ? (
                <View style={styles.detailCol}>{renderDetailItem(COUNTRY, profile.country)}</View>
              ) : null}
              {hasCity ? (
                <View style={styles.detailCol}>{renderDetailItem(LABEL_CITY, profile.city)}</View>
              ) : null}
            </View>
            {hasTags || hasResume || hasBio ? renderSectionDivider() : null}
          </>
        ) : null}
        {hasTags ? (
          <>
            <FormLabel label={TAGS_SKILLS} style={styles.compactLabel} />
            <View style={[styles.tagsView, flexDirectionRow, flexWrap]}>
              {profile.tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={[styles.tagChipText, style.fontWeightThin]}>{tag}</Text>
                </View>
              ))}
            </View>
            {hasResume || hasBio ? renderSectionDivider() : null}
          </>
        ) : null}
        {hasBio ? (
          <>
            {renderViewField(BIO, profile.bio)}
            {hasResume ? renderSectionDivider() : null}
          </>
        ) : null}
        {hasResume ? (
          <>
            <FormLabel label={RESUME_CV} style={styles.compactLabel} />
            <TouchableOpacity
              style={[styles.resumeRow, flexDirectionRow, alignItemsCenter]}
              activeOpacity={0.7}
              onPress={() => Linking.openURL(profile.resumeUrl)}>
              <View style={[styles.resumeIcon, alignJustifyCenter]}>
                <Icon name="file-text" size={16} color={redColor} />
              </View>
              <Text style={[styles.linkText, style.fontWeightThin, flex]} numberOfLines={1}>
                {getFileNameFromUrl(profile.resumeUrl)}
              </Text>
              <Icon name="external-link" size={14} color={grayColor} />
            </TouchableOpacity>
          </>
        ) : null}
      </>
    );
  };

  const renderPortfolioView = () => {
    const links = savedProfile.portfolioLinks || [];
    const files = savedProfile.portfolioFiles || [];

    if (!links.length && !files.length) {
      return <Text style={[styles.emptyHint, style.fontWeightThin]}>No portfolio added</Text>;
    }

    return (
      <>
        {files.map((url, index) => (
          <View key={`${url}-${index}`}>
            {index > 0 ? <View style={styles.sectionDivider} /> : null}
            <TouchableOpacity
              style={[styles.portfolioLink, flexDirectionRow, alignItemsCenter]}
              activeOpacity={0.7}
              onPress={() => Linking.openURL(url)}>
              {isImageUrl(url) ? (
                <Image source={{ uri: url }} style={styles.portfolioThumb} />
              ) : (
                <View style={[styles.portfolioIcon, alignJustifyCenter]}>
                  <Icon name="image" size={14} color={redColor} />
                </View>
              )}
              <Text style={[styles.portfolioLinkText, style.fontWeightThin, flex]} numberOfLines={1}>
                {getFileNameFromUrl(url)}
              </Text>
              <Icon name="external-link" size={14} color={grayColor} />
            </TouchableOpacity>
          </View>
        ))}
        {links.map((link, index) => (
          <View key={`${link}-${index}`}>
            {index > 0 || files.length ? <View style={styles.sectionDivider} /> : null}
            <TouchableOpacity
              style={[styles.portfolioLink, flexDirectionRow, alignItemsCenter]}
              activeOpacity={0.7}
              onPress={() => Linking.openURL(link)}>
              <View style={[styles.portfolioIcon, alignJustifyCenter]}>
                <Icon name="link" size={14} color={redColor} />
              </View>
              <Text style={[styles.portfolioLinkText, style.fontWeightThin, flex]} numberOfLines={1}>
                {link}
              </Text>
              <Icon name="external-link" size={14} color={grayColor} />
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  };

  const renderPortfolioEdit = () => (
    <>
      {(profileForm.portfolioFiles || []).length ? (
        <View style={styles.fieldGap}>
          <FormLabel label={PORTFOLIO} />
          {(profileForm.portfolioFiles || []).map((url, index) => (
            <TouchableOpacity
              key={`${url}-${index}`}
              style={[styles.linkItem, flexDirectionRow, alignItemsCenter]}
              activeOpacity={0.7}
              onPress={() => Linking.openURL(url)}>
              {isImageUrl(url) ? (
                <Image source={{ uri: url }} style={styles.portfolioThumbSmall} />
              ) : (
                <Icon name="image" size={16} color={grayColor} />
              )}
              <Text style={[styles.linkText, style.fontWeightThin, flex]} numberOfLines={1}>
                {getFileNameFromUrl(url)}
              </Text>
              <Icon name="external-link" size={14} color={grayColor} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      <CustomTextInput
        label={PORTFOLIO_LINKS}
        value={profileForm.portfolioLink}
        onChangeText={value => updateProfileField('portfolioLink', value)}
        placeholder={PORTFOLIO_LINK_PLACEHOLDER}
        keyboardType="url"
        onFocus={handleInputFocus}
        style={styles.fieldGap}
      />
      <TouchableOpacity
        style={[styles.addLinkBtnRow, flexDirectionRow, alignItemsCenter, alignJustifyCenter]}
        onPress={handleAddPortfolioLink}>
        <Icon name="plus" size={16} color={whiteColor} />
        <Text style={[styles.addLinkBtnText, style.fontWeightMedium]}>Add Link</Text>
      </TouchableOpacity>
      {profileForm.portfolioLinks?.map((link, index) => (
        <View key={`${link}-${index}`} style={[styles.linkItem, flexDirectionRow, alignItemsCenter]}>
          <Text style={[styles.linkText, style.fontWeightThin, flex]} numberOfLines={1}>
            {link}
          </Text>
          <TouchableOpacity
            onPress={() => handleRemovePortfolioLink(index)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="x" size={16} color={grayColor} />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );

  const renderFormActions = () => (
    <View>
      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
      <View style={[styles.formActions, flexDirectionRow]}>
        <TouchableOpacity
          style={[styles.cancelBtnFull, flex, alignJustifyCenter]}
          onPress={handleCancel}
          disabled={isSaving}>
          <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{PROFILE_CANCEL}</Text>
        </TouchableOpacity>
        <CustomButton
          title={isSaving ? 'Saving...' : PROFILE_SAVE}
          iconName="save"
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveBtnFull, flex]}
          textStyle={styles.saveBtnText}
        />
      </View>
    </View>
  );

  const renderActionRow = (item, showBorder) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.actionRow,
        flexDirectionRow,
        alignItemsCenter,
        justifyContentSpaceBetween,
        showBorder && styles.actionBorder,
      ]}
      onPress={item.onPress}>
      <View style={[flexDirectionRow, alignItemsCenter, styles.actionLeft]}>
        <View style={[styles.actionIconWrap, alignJustifyCenter, { backgroundColor: item.iconBg }]}>
          <Icon name={item.icon} size={16} color={item.iconColor} />
        </View>
        <View style={styles.actionTextWrap}>
          <Text
            style={[styles.actionTitle, style.fontWeightMedium, item.danger && styles.actionTitleDanger]}>
            {item.title}
          </Text>
          {item.desc ? <Text style={[styles.actionDesc, style.fontWeightThin]}>{item.desc}</Text> : null}
        </View>
      </View>
      <Icon name="chevron-right" size={18} color={grayColor} />
    </TouchableOpacity>
  );

  const displayProfile = isEditing ? profileForm : savedProfile;

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
          <ScreenHeader title={SELLER_PROFILE_TITLE} navigation={navigation} user={headerUser} />

          <View style={styles.profileCard}>
            <View style={[styles.profileTop, flexDirectionRow]}>
              <View style={styles.avatarWrap}>
                <TouchableOpacity
                  activeOpacity={isEditing ? 0.8 : 1}
                  disabled={!isEditing}
                  onPress={() => setShowPhotoOptions(true)}>
                  {displayProfile.photoUri ? (
                    <Image source={{ uri: displayProfile.photoUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={[styles.avatar, alignJustifyCenter]}>
                      <Text style={[styles.avatarText, style.fontWeightMedium]}>{displayProfile.initials}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* {isEditing ? (
                  <TouchableOpacity
                    style={[styles.cameraBtn, alignJustifyCenter]}
                    onPress={() => setShowPhotoOptions(true)}>
                    <Icon name="camera" size={12} color={whiteColor} />
                  </TouchableOpacity>
                ) : null} */}
              </View>

              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, style.fontWeightMedium]}>{displayProfile.fullName}</Text>
                <Text style={[styles.profileEmail, style.fontWeightThin]}>{displayProfile.email}</Text>
                <View style={[styles.roleBadge, flexDirectionRow, alignItemsCenter]}>
                  <Icon name="briefcase" size={11} color={redColor} />
                  <Text style={[styles.roleText, style.fontWeightMedium]}>{SELLER_PROFILE_ROLE}</Text>
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
                <View style={[styles.cardIconWrap, alignJustifyCenter]}>
                  <Icon name="user" size={15} color={redColor} />
                </View>
                <Text style={[styles.cardTitle, style.fontWeightMedium]}>{PROFILE_PERSONAL_INFO}</Text>
              </View>

              {isEditing ? null : (
                <TouchableOpacity style={[styles.editBtn, flexDirectionRow, alignItemsCenter]} onPress={handleEdit}>
                  <Icon name="edit-2" size={14} color={redColor} />
                  <Text style={[styles.editBtnText, style.fontWeightMedium]}>{PROFILE_EDIT}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.cardHeaderDivider} />

            {renderPersonalFields()}
          </View>

          <View style={styles.contentCard}>
            <View style={[styles.cardHeader, flexDirectionRow, alignItemsCenter]}>
              <View style={[flexDirectionRow, alignItemsCenter, styles.cardHeaderLeft]}>
                <View style={[styles.cardIconWrap, alignJustifyCenter]}>
                  <Icon name="sliders" size={15} color={redColor} />
                </View>
                <Text style={[styles.cardTitle, style.fontWeightMedium]}>{PROFILE_DETAILS}</Text>
              </View>
            </View>
            <View style={styles.cardHeaderDivider} />
            {isEditing ? (
              <ProfileDetailsStep
                variant="sellerProfile"
                form={profileForm}
                onChange={handleProfessionalChange}
                onToggleTag={handleToggleTag}
              />
            ) : (
              renderProfessionalView()
            )}
          </View>

          <View style={styles.contentCard}>
            <View style={[styles.cardHeader, flexDirectionRow, alignItemsCenter]}>
              <View style={[flexDirectionRow, alignItemsCenter, styles.cardHeaderLeft]}>
                <View style={[styles.cardIconWrap, alignJustifyCenter]}>
                  <Icon name="image" size={15} color={redColor} />
                </View>
                <Text style={[styles.cardTitle, style.fontWeightMedium]}>{PORTFOLIO}</Text>
              </View>
            </View>
            <View style={styles.cardHeaderDivider} />
            {isEditing ? renderPortfolioEdit() : renderPortfolioView()}
          </View>

          {isEditing ? renderFormActions() : null}

          {!isEditing ? (
            <>
              <View style={styles.contentCard}>
                <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{SELLER_PROFILE_QUICK_LINKS}</Text>
                {quickLinkItems.map((item, index) =>
                  renderActionRow(item, index < quickLinkItems.length - 1),
                )}
              </View>

              <View style={styles.contentCard}>
                <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{PROFILE_ACCOUNT_SETTINGS}</Text>
                {accountItems.map((item, index) =>
                  renderActionRow(item, index < accountItems.length - 1),
                )}
              </View>
            </>
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

export default SellerProfileScreen;

const styles = StyleSheet.create({
  editScrollContent: {
    paddingBottom: hp(12),
  },
  profileCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
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
    backgroundColor: lightPink,
    paddingHorizontal: spacings.normal,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: redColor,
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
    padding: spacings.large,
    marginBottom: hp(1.5),
  },
  cardHeader: {
    marginBottom: spacings.normal,
    gap: spacings.normal,
  },
  cardHeaderDivider: {
    height: 1,
    backgroundColor: borderLightColor,
    marginBottom: spacings.large,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: lightPink,
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
    marginBottom: hp(2),
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
  tagsView: {
    gap: spacings.small,
  },
  tagChip: {
    backgroundColor: lightPink,
    borderRadius: 20,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.xsmall,
  },
  tagChipText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  linkText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    marginLeft: spacings.small,
  },
  emptyHint: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  addLinkBtnRow: {
    alignSelf: 'flex-start',
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    gap: spacings.small,
    marginBottom: spacings.large,
  },
  addLinkBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  linkItem: {
    backgroundColor: inputBgColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.normal,
    marginBottom: spacings.small,
    gap: spacings.normal,
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
  detailRow: {
    gap: spacings.xLarge,
  },
  detailCol: {
    flex: 1,
    minWidth: 0,
  },
  detailItem: {
    flex: 1,
    minWidth: 0,
  },
  detailBlock: {
    width: '100%',
  },
  compactLabel: {
    marginBottom: spacings.xsmall,
  },
  detailValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    lineHeight: 22,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: borderLightColor,
    marginVertical: spacings.large,
  },
  resumeRow: {
    gap: spacings.normal,
    backgroundColor: inputBgColor,
    borderRadius: 10,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.normal,
  },
  resumeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: whiteColor,
  },
  portfolioLink: {
    gap: spacings.normal,
    paddingVertical: spacings.xsmall,
  },
  portfolioIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: lightPink,
  },
  portfolioLinkText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  portfolioThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: inputBgColor,
  },
  portfolioThumbSmall: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: inputBgColor,
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
