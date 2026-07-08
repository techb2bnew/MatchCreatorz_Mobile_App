import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import RNPhoneInput from 'react-native-phone-number-input';
import { MATCH_CREATORZ_LOGO } from '../assests/images';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import FormLabel from '../components/FormLabel';
import SocialButton from '../components/SocialButton';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  CONTINUE_WITH_FACEBOOK,
  CONTINUE_WITH_GOOGLE,
  DONT_HAVE_ACCOUNT,
  EMAIL,
  EMAIL_ADDRESS,
  FORGOT_PASSWORD,
  LABEL_EMAIL_ADDRESS,
  LABEL_PASSWORD,
  LABEL_PHONE_NUMBER,
  LOGIN_TABS,
  OR_SIGN_IN_WITH,
  PASSWORD,
  PHONE,
  PHONE_MAX_LENGTH,
  PHONE_NUMBER,
  PROMO_TAGLINE,
  SCREEN_NAMES,
  SIGN_IN,
  SIGN_IN_SUBTITLE,
  SIGN_UP,
  STAT_CREATORS_LABEL,
  STAT_CREATORS_VALUE,
  STAT_PROJECTS_LABEL,
  STAT_PROJECTS_VALUE,
  STAT_SATISFACTION_LABEL,
  STAT_SATISFACTION_VALUE,
  WELCOME_BACK,
} from '../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, formatPhoneInput, validateEmail, validatePassword, validatePhone } from '../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
  resizeModeContain,
  textAlign,
} = BaseStyle;

const STAT_ITEMS = [
  { icon: 'users', value: STAT_CREATORS_VALUE, label: STAT_CREATORS_LABEL },
  { icon: 'briefcase', value: STAT_PROJECTS_VALUE, label: STAT_PROJECTS_LABEL },
  { icon: 'star', value: STAT_SATISFACTION_VALUE, label: STAT_SATISFACTION_LABEL },
];

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(LOGIN_TABS.PHONE);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ phone: '', email: '', password: '' });

  const handleTabChange = tab => {
    setActiveTab(tab);
    setErrors({ phone: '', email: '', password: '' });
  };

  const handlePhoneChange = text => {
    setPhone(formatPhoneInput(text));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleEmailChange = text => {
    setEmail(text);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  const handlePasswordChange = text => {
    setPassword(text);
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleSignIn = () => {
    const newErrors = {
      phone: activeTab === LOGIN_TABS.PHONE ? validatePhone(phone) : '',
      email: activeTab === LOGIN_TABS.EMAIL ? validateEmail(email) : '',
      password: validatePassword(password),
    };
    setErrors(newErrors);
    if (newErrors.phone || newErrors.email || newErrors.password) return;

    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: SCREEN_NAMES.MAIN }],
    });
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}>
          {/* Promo card */}
          <View style={styles.promoCard}>
            <View style={styles.logoBox}>
              <Image source={MATCH_CREATORZ_LOGO} style={[styles.logo, resizeModeContain]} />
            </View>
            <Text style={[styles.promoText, style.fontWeightThin, textAlign]}>{PROMO_TAGLINE}</Text>
            <View style={[styles.statsRow, flexDirectionRow, justifyContentSpaceBetween]}>
              {STAT_ITEMS.map(item => (
                <View key={item.label} style={[styles.statCard, alignItemsCenter]}>
                  <Icon name={item.icon} size={14} color={redColor} />
                  <Text style={[styles.statValue, style.fontWeightThin]}>{item.value}</Text>
                  <Text style={[styles.statLabel, style.fontWeightThin]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Header */}
          <Text style={[styles.title, style.fontWeightThin]}>{WELCOME_BACK}</Text>
          <Text style={[styles.subtitle, style.fontWeightThin]}>{SIGN_IN_SUBTITLE}</Text>

          <SocialButton type="google" title={CONTINUE_WITH_GOOGLE} onPress={() => {}} style={styles.socialBtn} />
          <SocialButton type="facebook" title={CONTINUE_WITH_FACEBOOK} onPress={() => {}} style={styles.socialBtn} />

          {/* Divider */}
          <View style={[styles.dividerRow, flexDirectionRow, alignItemsCenter]}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, style.fontWeightThin]}>{OR_SIGN_IN_WITH}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone / Email tabs */}
          <View style={[styles.tabRow, flexDirectionRow]}>
            <TouchableOpacity
              style={[styles.tab, flexDirectionRow, alignJustifyCenter, activeTab === LOGIN_TABS.PHONE && styles.tabActive]}
              onPress={() => handleTabChange(LOGIN_TABS.PHONE)}>
              <Icon name="phone" size={15} color={activeTab === LOGIN_TABS.PHONE ? whiteColor : grayColor} />
              <Text style={[styles.tabText, style.fontWeightMedium, activeTab === LOGIN_TABS.PHONE && styles.tabTextActive]}>
                {PHONE}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, flexDirectionRow, alignJustifyCenter, activeTab === LOGIN_TABS.EMAIL && styles.tabActive]}
              onPress={() => handleTabChange(LOGIN_TABS.EMAIL)}>
              <Icon name="mail" size={15} color={activeTab === LOGIN_TABS.EMAIL ? whiteColor : grayColor} />
              <Text style={[styles.tabText, style.fontWeightMedium, activeTab === LOGIN_TABS.EMAIL && styles.tabTextActive]}>
                {EMAIL}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === LOGIN_TABS.PHONE ? (
            <View style={styles.inputSpacing}>
              <FormLabel label={LABEL_PHONE_NUMBER} required />
              <RNPhoneInput
                defaultCode="IN"
                layout="second"
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder={PHONE_NUMBER}
                withDarkTheme={false}
                withShadow={false}
                flagSize={20}
                containerStyle={[styles.phoneInput, errors.phone && styles.phoneInputError]}
                countryPickerButtonStyle={styles.countryPicker}
                flagButtonStyle={styles.countryPicker}
                textContainerStyle={styles.phoneTextContainer}
                codeTextStyle={[styles.phoneCode, style.fontSizeNormal2x]}
                textInputStyle={[styles.phoneText, style.fontSizeNormal2x]}
                renderDropdownImage={<Icon name="chevron-down" size={14} color={grayColor} />}
                textInputProps={{ placeholderTextColor: grayColor, maxLength: PHONE_MAX_LENGTH }}
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>
          ) : (
            <CustomTextInput
              value={email}
              onChangeText={handleEmailChange}
              label={LABEL_EMAIL_ADDRESS}
              required
              placeholder={EMAIL_ADDRESS}
              keyboardType="email-address"
              leftIcon="mail"
              error={errors.email}
              style={styles.inputSpacing}
            />
          )}

          <CustomTextInput
            value={password}
            onChangeText={handlePasswordChange}
            label={LABEL_PASSWORD}
            required
            placeholder={PASSWORD}
            leftIcon="lock"
            secureTextEntry
            error={errors.password}
            style={styles.inputSpacing}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate(SCREEN_NAMES.FORGOT_PASSWORD)}>
            <Text style={[styles.forgotText, style.fontWeightMedium]}>{FORGOT_PASSWORD}</Text>
          </TouchableOpacity>

          <CustomButton
            title={SIGN_IN}
            iconName="arrow-right"
            iconPosition="right"
            backgroundColor={redColor}
            onPress={handleSignIn}
          />

          <View style={[styles.footer, alignJustifyCenter]}>
            <Text style={[styles.footerText, style.fontWeightThin]}>
              {DONT_HAVE_ACCOUNT}{' '}
              <Text
                style={[styles.footerLink, style.fontWeightMedium]}
                onPress={() => navigation.navigate(SCREEN_NAMES.CREATE_ACCOUNT)}>
                {SIGN_UP}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(3),
  },
  promoCard: {
    backgroundColor: inputBgColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.xLarge,
    paddingVertical: spacings.xxLarge,
    alignItems: 'center',
    marginBottom: spacings.xxLarge,
  },
  logoBox: {
    width: wp(14),
    height: wp(14),
    borderRadius: 12,
    backgroundColor: whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacings.large,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  logo: { width: wp(10), height: wp(10) },
  promoText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.xLarge,
    lineHeight: 20,
    paddingHorizontal: spacings.small,
  },
  statsRow: { width: '100%', gap: spacings.normal },
  statCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.xsmall,
    gap: spacings.xsmall,
  },
  statValue: { fontSize: style.fontSizeNormal1x.fontSize, color: blackColor },
  statLabel: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor, textAlign: 'center' },
  title: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
    marginBottom: spacings.xsmall,
  },
  subtitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
    lineHeight: 22,
    marginBottom: hp(2),
  },
  socialBtn: { marginBottom: spacings.normal },
  dividerRow: { marginVertical: spacings.xLarge, gap: spacings.normal },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: borderLightColor },
  dividerText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor },
  tabRow: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: hp(2),
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: spacings.medium, borderRadius: 8, gap: 6 },
  tabActive: { backgroundColor: redColor },
  tabText: { fontSize: style.fontSizeNormal2x.fontSize, color: grayColor },
  tabTextActive: { color: whiteColor },
  phoneInput: {
    width: '100%',
    backgroundColor: inputBgColor,
    borderRadius: 10,
    minHeight: hp(6),
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phoneInputError: {
    borderColor: redColor,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingLeft: spacings.large,
    paddingRight: spacings.normal,
    height: '100%',
    width: 'auto',
    // minWidth: 108,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: borderLightColor,
  },
  phoneTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: spacings.medium,
    paddingLeft: spacings.large,
    paddingRight: spacings.large,
  },
  phoneCode: { color: blackColor },
  phoneText: { color: blackColor, padding: 0, height: '100%' },
  inputSpacing: { marginBottom: hp(1.2) },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: hp(2),
    paddingVertical: spacings.xsmall,
  },
  forgotText: { color: redColor, fontSize: style.fontSizeSmall1x.fontSize },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginTop: spacings.xsmall,
    marginLeft: spacings.xsmall,
  },
  footer: { paddingVertical: spacings.normal, marginTop: spacings.normal },
  footerText: { fontSize: style.fontSizeNormal2x.fontSize, color: grayColor, textAlign: 'center' },
  footerLink: { color: redColor },
});
