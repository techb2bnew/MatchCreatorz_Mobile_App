import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import RNPhoneInput from 'react-native-phone-number-input';
import { MATCH_CREATORZ_LOGO } from '../assests/images';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import FormLabel from '../components/FormLabel';
import SocialButton from '../components/SocialButton';
import StepIndicator from '../components/StepIndicator';
import ProfileDetailsStep from '../components/ProfileDetailsStep';
import PortfolioStep from '../components/PortfolioStep';
import SuccessModal from '../components/modal/SuccessModal';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  ACCEPT_TERMS,
  ALREADY_HAVE_ACCOUNT,
  BUYER_CLIENT,
  BUYER_SUBTITLE,
  CHOOSE_ACCOUNT_TYPE,
  COMPANY_NAME,
  CONFIRM_PASSWORD,
  CONNECT_CREATE,
  CONTINUE_WITH_FACEBOOK,
  CONTINUE_WITH_GOOGLE,
  CREATE_ACCOUNT,
  CREATOR_SELLER,
  CREATOR_SUBTITLE,
  EMAIL_ADDRESS,
  FULL_NAME,
  JOIN_PLATFORM_TEXT,
  LABEL_COMPANY_NAME,
  LABEL_CONFIRM_PASSWORD,
  LABEL_EMAIL_ADDRESS,
  LABEL_FULL_NAME,
  LABEL_PASSWORD,
  LABEL_PHONE_NUMBER,
  OR_SIGN_UP_WITH,
  PASSWORD,
  PHONE_MAX_LENGTH,
  PHONE_NUMBER,
  SCREEN_NAMES,
  SELECTED,
  SIGN_IN,
  SMS_CONSENT,
  SUCCEED,
  TERMS_AND_CONDITIONS,
  USER_ROLES,
  SIGNUP_STEPS,
  JOIN_CREATORS_SUBTITLE,
  NEXT_PROFILE,
  NEXT_PORTFOLIO,
  SUBMIT_PROFILE,
  BACK,
  ACCOUNT_CREATED_TITLE,
  ACCOUNT_CREATED_MESSAGE,
  SELLER_ACCOUNT_SUBTITLE,
  SELLER_PASSWORD_HINT,
  GENDER_OPTIONS,
  CATEGORY_OPTIONS,
  RESPONSE_TIME_OPTIONS,
  ERROR_REGISTER_FAILED,
} from '../constans/Constants';
import { getDefaultStateForCountry, DEFAULT_COUNTRY } from '../utils/locationData';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  formatPhoneInput,
  validateCity,
  validateConfirmPassword,
  validateCountry,
  validateEmail,
  validateFullName,
  validateHourlyRate,
  validatePassword,
  validatePhone,
  validateSkills,
  validateTerms,
} from '../utils';
import {
  keyboardAvoidingBehavior,
  scrollInputAboveKeyboard,
  useKeyboardBottomInset,
} from '../utils/keyboard';
import { registerUserApi } from '../services/authService';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
  resizeModeContain,
  textAlign,
} = BaseStyle;

const ROLE_OPTIONS = [
  { id: USER_ROLES.CREATOR, title: CREATOR_SELLER, subtitle: CREATOR_SUBTITLE, icon: 'briefcase' },
  { id: USER_ROLES.BUYER, title: BUYER_CLIENT, subtitle: BUYER_SUBTITLE, icon: 'shopping-bag' },
];

const createInitialProfileForm = () => ({
  hourlyRate: '',
  dateOfBirth: '',
  country: DEFAULT_COUNTRY,
  state: getDefaultStateForCountry(DEFAULT_COUNTRY),
  city: '',
  zipCode: '',
  gender: GENDER_OPTIONS[0],
  category: CATEGORY_OPTIONS[0],
  tags: [],
  bio: '',
  responseTime: RESPONSE_TIME_OPTIONS[2],
  resumeFile: null,
});

const INITIAL_PORTFOLIO_FORM = {
  portfolioLink: '',
  portfolioLinks: [],
  portfolioFiles: [],
};

const EMPTY_ERRORS = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  terms: '',
  city: '',
  country: '',
  skills: '',
  hourlyRate: '',
};

const CreateAccountScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const keyboardBottom = useKeyboardBottomInset(32);
  const [currentStep, setCurrentStep] = useState(SIGNUP_STEPS.ACCOUNT);
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.BUYER);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptSms, setAcceptSms] = useState(false);
  const [profileForm, setProfileForm] = useState(createInitialProfileForm);
  const [portfolioForm, setPortfolioForm] = useState(INITIAL_PORTFOLIO_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [apiError, setApiError] = useState('');

  const isSeller = selectedRole === USER_ROLES.CREATOR;
  const isAccountStep = currentStep === SIGNUP_STEPS.ACCOUNT;
  const isProfileStep = currentStep === SIGNUP_STEPS.PROFILE;
  const isPortfolioStep = currentStep === SIGNUP_STEPS.PORTFOLIO;
  const showStepper = isSeller && !isAccountStep;

  const clearError = field => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhoneChange = text => {
    setPhone(formatPhoneInput(text));
    clearError('phone');
  };

  const validateAccountStep = () => {
    const newErrors = {
      ...EMPTY_ERRORS,
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone, { required: false }),
      password: isSeller ? '' : validatePassword(password),
      confirmPassword: isSeller ? '' : validateConfirmPassword(password, confirmPassword),
      terms: isSeller ? '' : validateTerms(acceptTerms),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const validateProfileStep = () => {
    const newErrors = {
      city: validateCity(profileForm.city),
      country: validateCountry(profileForm.country),
      skills: validateSkills(profileForm.tags),
      hourlyRate: validateHourlyRate(profileForm.hourlyRate),
    };
    setErrors(prev => ({ ...prev, ...newErrors }));
    return !Object.values(newErrors).some(Boolean);
  };

  const validatePortfolioStep = () => {
    const newErrors = {
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      terms: validateTerms(acceptTerms),
    };
    setErrors(prev => ({ ...prev, ...newErrors }));
    return !Object.values(newErrors).some(Boolean);
  };

  const submitRegister = async () => {
    setApiError('');
    setSubmitting(true);
    try {
      const response = await registerUserApi({
        role: selectedRole,
        fullName,
        email,
        password,
        phone,
        companyName: isSeller ? '' : companyName,
        profile: profileForm,
        portfolio: portfolioForm,
      });

      if (!response?.success) {
        setApiError(response?.message || ERROR_REGISTER_FAILED);
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      setApiError(error?.message || ERROR_REGISTER_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTag = tag => {
    setProfileForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
    clearError('skills');
  };

  const handleAddPortfolioLink = () => {
    const link = portfolioForm.portfolioLink.trim();
    if (!link) return;
    setPortfolioForm(prev => ({
      portfolioLink: '',
      portfolioLinks: [...prev.portfolioLinks, link],
    }));
  };

  const handleRemovePortfolioLink = index => {
    setPortfolioForm(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index),
    }));
  };

  const handleRemovePortfolioFile = index => {
    setPortfolioForm(prev => ({
      ...prev,
      portfolioFiles: prev.portfolioFiles.filter((_, i) => i !== index),
    }));
  };

  const handleBack = () => {
    if (isProfileStep) setCurrentStep(SIGNUP_STEPS.ACCOUNT);
    else if (isPortfolioStep) setCurrentStep(SIGNUP_STEPS.PROFILE);
  };

  const handleInputFocus = event => {
    scrollInputAboveKeyboard(scrollRef, event, 160);
  };

  const handlePrimaryAction = async () => {
    if (submitting) return;

    if (isAccountStep) {
      if (!validateAccountStep()) return;
      if (isSeller) {
        setCurrentStep(SIGNUP_STEPS.PROFILE);
        return;
      }
      await submitRegister();
      return;
    }

    if (isProfileStep) {
      if (!validateProfileStep()) return;
      setCurrentStep(SIGNUP_STEPS.PORTFOLIO);
      return;
    }

    if (isPortfolioStep) {
      if (!validatePortfolioStep()) return;
      await submitRegister();
    }
  };

  const getPrimaryButtonTitle = () => {
    if (!isSeller || isAccountStep) return isSeller ? NEXT_PROFILE : CREATE_ACCOUNT;
    if (isProfileStep) return NEXT_PORTFOLIO;
    return SUBMIT_PROFILE;
  };

  const getPrimaryButtonIcon = () => {
    if (isPortfolioStep) return 'check';
    return 'arrow-right';
  };

  const handleRoleChange = role => {
    setSelectedRole(role);
    setCurrentStep(SIGNUP_STEPS.ACCOUNT);
    setProfileForm(createInitialProfileForm());
    setPortfolioForm(INITIAL_PORTFOLIO_FORM);
    setCompanyName('');
    setAcceptTerms(false);
    setAcceptSms(false);
    setPassword('');
    setConfirmPassword('');
    setErrors(EMPTY_ERRORS);
    setApiError('');
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={flex} behavior={keyboardAvoidingBehavior}>
        <ScrollView
          ref={scrollRef}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: spacings.xxLarge + keyboardBottom }]}>
          {isAccountStep ? (
            <View style={styles.promoCard}>
              <View style={styles.logoBox}>
                <Image source={MATCH_CREATORZ_LOGO} style={[styles.logo, resizeModeContain]} />
              </View>
              <Text style={[styles.promoHeading, style.fontWeightThin, textAlign]}>
                {CONNECT_CREATE} <Text style={styles.highlight}>{SUCCEED}</Text>
              </Text>
              <Text style={[styles.promoText, style.fontWeightThin, textAlign]}>{JOIN_PLATFORM_TEXT}</Text>
            </View>
          ) : null}

          <Text style={[styles.title, style.fontWeightThin]}>{CREATE_ACCOUNT}</Text>
          <Text style={[styles.subtitle, style.fontWeightThin]}>
            {showStepper
              ? JOIN_CREATORS_SUBTITLE
              : isSeller && isAccountStep
                ? SELLER_ACCOUNT_SUBTITLE
                : CHOOSE_ACCOUNT_TYPE}
          </Text>

          {showStepper ? <StepIndicator currentStep={currentStep} /> : null}

          {isAccountStep ? (
            <>
              <View style={[styles.roleRow, flexDirectionRow, justifyContentSpaceBetween]}>
                {ROLE_OPTIONS.map(role => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <TouchableOpacity
                      key={role.id}
                      activeOpacity={0.85}
                      onPress={() => handleRoleChange(role.id)}
                      style={[styles.roleCard, alignItemsCenter, isSelected && styles.roleCardSelected]}>
                      {isSelected ? (
                        <View style={styles.selectedBadge}>
                          <Text style={[styles.selectedBadgeText, style.fontWeightMedium]}>{SELECTED}</Text>
                        </View>
                      ) : null}
                      <View style={[styles.roleIconBox, isSelected && styles.roleIconBoxSelected]}>
                        <Icon name={role.icon} size={18} color={isSelected ? redColor : grayColor} />
                      </View>
                      <Text style={[styles.roleTitle, style.fontWeightMedium, isSelected && styles.roleTitleSelected]}>
                        {role.title}
                      </Text>
                      <Text style={[styles.roleSubtitle, style.fontWeightThin]}>{role.subtitle}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <SocialButton type="google" title={CONTINUE_WITH_GOOGLE} onPress={() => {}} style={styles.socialBtn} />
              <SocialButton type="facebook" title={CONTINUE_WITH_FACEBOOK} onPress={() => {}} style={styles.socialBtn} />

              <View style={[styles.dividerRow, flexDirectionRow, alignItemsCenter]}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, style.fontWeightThin]}>{OR_SIGN_UP_WITH}</Text>
                <View style={styles.dividerLine} />
              </View>

              <CustomTextInput
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  clearError('fullName');
                }}
                label={LABEL_FULL_NAME}
                required
                placeholder={FULL_NAME}
                leftIcon="user"
                error={errors.fullName}
                onFocus={handleInputFocus}
                style={styles.inputSpacing}
              />
              <CustomTextInput
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  clearError('email');
                }}
                label={LABEL_EMAIL_ADDRESS}
                required
                placeholder={EMAIL_ADDRESS}
                keyboardType="email-address"
                leftIcon="mail"
                error={errors.email}
                onFocus={handleInputFocus}
                style={styles.inputSpacing}
              />

              {!isSeller ? (
                <CustomTextInput
                  value={companyName}
                  onChangeText={setCompanyName}
                  label={LABEL_COMPANY_NAME}
                  placeholder={COMPANY_NAME}
                  leftIcon="briefcase"
                  onFocus={handleInputFocus}
                  style={styles.inputSpacing}
                />
              ) : null}

              <View style={styles.inputSpacing}>
                <FormLabel label={LABEL_PHONE_NUMBER} />
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
                  textInputProps={{
                    placeholderTextColor: grayColor,
                    maxLength: PHONE_MAX_LENGTH,
                    onFocus: handleInputFocus,
                  }}
                />
                {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              </View>

              {!isSeller ? (
                <>
                  <CustomTextInput
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      clearError('password');
                    }}
                    label={LABEL_PASSWORD}
                    required
                    placeholder={PASSWORD}
                    leftIcon="lock"
                    secureTextEntry
                    error={errors.password}
                    onFocus={handleInputFocus}
                    style={styles.inputSpacing}
                  />
                  <CustomTextInput
                    value={confirmPassword}
                    onChangeText={text => {
                      setConfirmPassword(text);
                      clearError('confirmPassword');
                    }}
                    label={LABEL_CONFIRM_PASSWORD}
                    required
                    placeholder={CONFIRM_PASSWORD}
                    leftIcon="lock"
                    secureTextEntry
                    error={errors.confirmPassword}
                    onFocus={handleInputFocus}
                    style={styles.inputSpacing}
                  />
                </>
              ) : (
                <Text style={[styles.sellerHint, style.fontWeightThin]}>{SELLER_PASSWORD_HINT}</Text>
              )}

              {!isSeller ? (
                <>
                  <TouchableOpacity
                    style={[styles.checkboxRow, flexDirectionRow]}
                    onPress={() => {
                      setAcceptTerms(p => !p);
                      clearError('terms');
                    }}>
                    <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                      {acceptTerms ? <Icon name="check" size={12} color={whiteColor} /> : null}
                    </View>
                    <Text style={[styles.checkboxText, style.fontWeightThin]}>
                      {ACCEPT_TERMS} <Text style={styles.linkText}>{TERMS_AND_CONDITIONS}</Text>
                      <Text style={styles.requiredMark}> *</Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.terms ? <Text style={styles.termsError}>{errors.terms}</Text> : null}

                  <TouchableOpacity style={[styles.checkboxRow, flexDirectionRow]} onPress={() => setAcceptSms(p => !p)}>
                    <View style={[styles.checkbox, acceptSms && styles.checkboxChecked]}>
                      {acceptSms ? <Icon name="check" size={12} color={whiteColor} /> : null}
                    </View>
                    <Text style={[styles.checkboxText, style.fontWeightThin]}>{SMS_CONSENT}</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </>
          ) : null}

          {isProfileStep ? (
            <ProfileDetailsStep
              form={profileForm}
              onChange={next => {
                setProfileForm(next);
                if (errors.city || errors.country || errors.skills || errors.hourlyRate) {
                  setErrors(prev => ({
                    ...prev,
                    city: '',
                    country: '',
                    skills: '',
                    hourlyRate: '',
                  }));
                }
              }}
              onToggleTag={handleToggleTag}
              errors={errors}
            />
          ) : null}

          {isPortfolioStep ? (
            <PortfolioStep
              form={portfolioForm}
              onChange={setPortfolioForm}
              onAddLink={handleAddPortfolioLink}
              onRemoveLink={handleRemovePortfolioLink}
              onRemoveFile={handleRemovePortfolioFile}
              password={password}
              confirmPassword={confirmPassword}
              onPasswordChange={text => {
                setPassword(text);
                clearError('password');
              }}
              onConfirmPasswordChange={text => {
                setConfirmPassword(text);
                clearError('confirmPassword');
              }}
              passwordError={errors.password}
              confirmPasswordError={errors.confirmPassword}
              acceptTerms={acceptTerms}
              acceptSms={acceptSms}
              onToggleTerms={() => {
                setAcceptTerms(p => !p);
                clearError('terms');
              }}
              onToggleSms={() => setAcceptSms(p => !p)}
              termsError={errors.terms}
            />
          ) : null}

          {apiError ? <Text style={[styles.apiErrorText, style.fontWeightThin]}>{apiError}</Text> : null}

          {showStepper ? (
            <View style={[styles.navRow, flexDirectionRow, justifyContentSpaceBetween]}>
              <CustomButton
                title={BACK}
                iconName="arrow-left"
                iconPosition="left"
                backgroundColor={whiteColor}
                textColor={blackColor}
                borderColor={borderLightColor}
                borderWidth={1}
                onPress={handleBack}
                disabled={submitting}
                style={styles.backBtn}
              />
              <CustomButton
                title={getPrimaryButtonTitle()}
                iconName={getPrimaryButtonIcon()}
                iconPosition="right"
                backgroundColor={redColor}
                onPress={handlePrimaryAction}
                loading={submitting && isPortfolioStep}
                style={styles.nextBtn}
              />
            </View>
          ) : (
            <CustomButton
              title={getPrimaryButtonTitle()}
              iconName="arrow-right"
              iconPosition="right"
              backgroundColor={redColor}
              onPress={handlePrimaryAction}
              loading={submitting && !isSeller}
              style={styles.createBtn}
            />
          )}

          {isAccountStep ? (
            <View style={[styles.footer, alignJustifyCenter]}>
              <Text style={[styles.footerText, style.fontWeightThin]}>
                {ALREADY_HAVE_ACCOUNT}{' '}
                <Text
                  style={[styles.footerLink, style.fontWeightMedium]}
                  onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}>
                  {SIGN_IN}
                </Text>
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccess}
        title={ACCOUNT_CREATED_TITLE}
        message={ACCOUNT_CREATED_MESSAGE}
        onPress={() => {
          setShowSuccess(false);
          navigation.navigate(SCREEN_NAMES.LOGIN);
        }}
      />
    </SafeAreaView>
  );
};

export default CreateAccountScreen;

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
  promoHeading: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
    lineHeight: 30,
  },
  highlight: { color: redColor },
  promoText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, lineHeight: 20 },
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
  roleRow: { gap: spacings.normal, marginBottom: hp(2.5) },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: borderLightColor,
    borderRadius: 12,
    paddingVertical: spacings.xLarge,
    paddingHorizontal: spacings.small,
    backgroundColor: whiteColor,
    gap: 4,
    position: 'relative',
  },
  roleCardSelected: { borderColor: redColor, backgroundColor: lightPink },
  selectedBadge: {
    position: 'absolute',
    top: -10,
    right: 8,
    backgroundColor: redColor,
    borderRadius: 10,
    paddingHorizontal: spacings.normal,
    paddingVertical: 3,
  },
  selectedBadgeText: { fontSize: style.fontSizeExtraSmall.fontSize, color: whiteColor },
  roleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacings.xsmall,
  },
  roleIconBoxSelected: { backgroundColor: 'rgba(229,85,79,0.12)' },
  roleTitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    textAlign: 'center',
    marginTop: spacings.xsmall,
  },
  roleTitleSelected: { color: blackColor },
  roleSubtitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    textAlign: 'center',
    lineHeight: 15,
  },
  socialBtn: { marginBottom: spacings.normal },
  dividerRow: { marginVertical: spacings.xLarge, gap: spacings.normal },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: borderLightColor },
  dividerText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor },
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
  sellerHint: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: hp(1.5),
    fontStyle: 'italic',
  },
  checkboxRow: { alignItems: 'flex-start', marginBottom: hp(1.2), gap: spacings.normal },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: grayColor,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: redColor, borderColor: redColor },
  checkboxText: { flex: 1, fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, lineHeight: 18 },
  linkText: { color: redColor },
  requiredMark: { color: redColor },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginTop: spacings.xsmall,
    marginLeft: spacings.xsmall,
  },
  termsError: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: hp(1),
    marginLeft: spacings.xsmall,
  },
  createBtn: { marginTop: spacings.normal, marginBottom: spacings.small },
  apiErrorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    textAlign: 'center',
    marginTop: spacings.large,
    marginBottom: spacings.small,
  },
  navRow: { marginTop: spacings.xLarge, gap: spacings.normal, marginBottom: spacings.small },
  backBtn: { flex: 0.4 },
  nextBtn: { flex: 0.6 },
  footer: { paddingVertical: spacings.normal },
  footerText: { fontSize: style.fontSizeNormal2x.fontSize, color: grayColor, textAlign: 'center' },
  footerLink: { color: redColor },
});
