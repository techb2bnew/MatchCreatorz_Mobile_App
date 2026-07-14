import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import OTPTextInput from 'react-native-otp-textinput';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import FormLabel from '../components/FormLabel';
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
  CONFIRM_PASSWORD,
  CONTINUE,
  EMAIL_ADDRESS,
  ERROR_FORGOT_PASSWORD_FAILED,
  ERROR_RESET_PASSWORD_FAILED,
  ERROR_VERIFY_OTP_FAILED,
  FORGOT_PASSWORD_EMAIL_HEADING,
  FORGOT_PASSWORD_EMAIL_NOTE,
  FORGOT_PASSWORD_EMAIL_SUBTITLE,
  FORGOT_PASSWORD_NEW_PASSWORD_HEADING,
  FORGOT_PASSWORD_NEW_PASSWORD_SUBTITLE,
  FORGOT_PASSWORD_OTP_HEADING,
  FORGOT_PASSWORD_OTP_NOTE,
  FORGOT_PASSWORD_OTP_SENT_TO,
  FORGOT_PASSWORD_OTP_SUBTITLE,
  FORGOT_PASSWORD_PASSWORD_HINT,
  FORGOT_PASSWORD_SECURE_NOTE,
  FORGOT_PASSWORD_TITLE,
  LABEL_CONFIRM_PASSWORD,
  LABEL_EMAIL_ADDRESS,
  LABEL_OTP,
  LABEL_PASSWORD,
  NEXT,
  OTP_LENGTH,
  PASSWORD,
  PASSWORD_RESET_SUCCESS_MESSAGE,
  PASSWORD_RESET_SUCCESS_TITLE,
  RESEND_OTP,
  RESEND_OTP_IN,
  RESEND_OTP_SECONDS,
  SCREEN_NAMES,
} from '../constans/Constants';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  validateConfirmPassword,
  validateEmail,
  validateOtp,
  validatePassword,
} from '../utils';
import { getApiErrorMessage } from '../services/apiClient';
import { forgotPasswordApi, resetPasswordApi, verifyForgotOtpApi } from '../services/authService';

const { alignItemsCenter, alignJustifyCenter, flexDirectionRow, textAlign } = BaseStyle;

const STEPS = {
  EMAIL: 1,
  OTP: 2,
  PASSWORD: 3,
};

const STEP_CONTENT = {
  [STEPS.EMAIL]: {
    icon: 'mail',
    heading: FORGOT_PASSWORD_EMAIL_HEADING,
    subtitle: FORGOT_PASSWORD_EMAIL_SUBTITLE,
    note: FORGOT_PASSWORD_EMAIL_NOTE,
  },
  [STEPS.OTP]: {
    icon: 'shield',
    heading: FORGOT_PASSWORD_OTP_HEADING,
    subtitle: FORGOT_PASSWORD_OTP_SUBTITLE,
    note: FORGOT_PASSWORD_OTP_NOTE,
  },
  [STEPS.PASSWORD]: {
    icon: 'lock',
    heading: FORGOT_PASSWORD_NEW_PASSWORD_HEADING,
    subtitle: FORGOT_PASSWORD_NEW_PASSWORD_SUBTITLE,
    note: FORGOT_PASSWORD_SECURE_NOTE,
  },
};

const formatTimer = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    form: '',
  });
  const [resendTimer, setResendTimer] = useState(RESEND_OTP_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const otpRef = useRef(null);

  useEffect(() => {
    if (step !== STEPS.OTP || resendTimer <= 0) return undefined;

    const interval = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_OTP_SECONDS);
  }, []);

  const handleBack = () => {
    if (isSubmitting) return;

    if (step === STEPS.EMAIL) {
      navigation.goBack();
      return;
    }
    if (step === STEPS.OTP) {
      setStep(STEPS.EMAIL);
      setOtp('');
      setResetToken('');
      setErrors(prev => ({ ...prev, otp: '', form: '' }));
      return;
    }
    setStep(STEPS.OTP);
    setPassword('');
    setConfirmPassword('');
    setErrors(prev => ({ ...prev, password: '', confirmPassword: '', form: '' }));
  };

  const handleEmailChange = value => {
    setEmail(value);
    if (errors.email || errors.form) {
      setErrors(prev => ({ ...prev, email: '', form: '' }));
    }
  };

  const handlePasswordChange = value => {
    setPassword(value);
    if (errors.password || errors.form) {
      setErrors(prev => ({ ...prev, password: '', form: '' }));
    }
  };

  const handleConfirmPasswordChange = value => {
    setConfirmPassword(value);
    if (errors.confirmPassword || errors.form) {
      setErrors(prev => ({ ...prev, confirmPassword: '', form: '' }));
    }
  };

  const sendForgotOtp = async () => {
    await forgotPasswordApi({ email });
  };

  const handleEmailNext = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError, form: '' }));
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, email: '', form: '' }));

    try {
      await sendForgotOtp();
      setStep(STEPS.OTP);
      startResendTimer();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: getApiErrorMessage(error?.data, error?.message || ERROR_FORGOT_PASSWORD_FAILED),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpNext = async () => {
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors(prev => ({ ...prev, otp: otpError, form: '' }));
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, otp: '', form: '' }));

    try {
      const response = await verifyForgotOtpApi({ email, otp });
      const token = response?.data?.reset_token;
      if (!token) {
        setErrors(prev => ({ ...prev, form: ERROR_VERIFY_OTP_FAILED }));
        return;
      }
      setResetToken(token);
      setStep(STEPS.PASSWORD);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: getApiErrorMessage(error?.data, error?.message || ERROR_VERIFY_OTP_FAILED),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, otp: '', form: '' }));

    try {
      await sendForgotOtp();
      otpRef.current?.clear();
      setOtp('');
      startResendTimer();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: getApiErrorMessage(error?.data, error?.message || ERROR_FORGOT_PASSWORD_FAILED),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    if (passwordError || confirmPasswordError) {
      setErrors(prev => ({
        ...prev,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        form: '',
      }));
      return;
    }

    if (!resetToken) {
      setErrors(prev => ({ ...prev, form: ERROR_RESET_PASSWORD_FAILED }));
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, password: '', confirmPassword: '', form: '' }));

    try {
      await resetPasswordApi({ token: resetToken, password });
      setShowSuccessModal(true);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: getApiErrorMessage(error?.data, error?.message || ERROR_RESET_PASSWORD_FAILED),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigation.navigate(SCREEN_NAMES.LOGIN);
  };

  const stepContent = STEP_CONTENT[step];

  const renderFormError = () =>
    errors.form ? <Text style={[styles.formErrorText, textAlign]}>{errors.form}</Text> : null;

  const renderStepContent = () => {
    if (step === STEPS.EMAIL) {
      return (
        <>
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
          {renderFormError()}
          <CustomButton
            title={NEXT}
            iconName="arrow-right"
            iconPosition="right"
            onPress={handleEmailNext}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </>
      );
    }

    if (step === STEPS.OTP) {
      return (
        <>
          <FormLabel label={LABEL_OTP} required />
          <OTPTextInput
            ref={otpRef}
            inputCount={OTP_LENGTH}
            handleTextChange={value => {
              setOtp(value);
              if (errors.otp || errors.form) {
                setErrors(prev => ({ ...prev, otp: '', form: '' }));
              }
            }}
            tintColor={redColor}
            offTintColor={borderLightColor}
            autoFocus
            textInputStyle={[styles.otpInput, { fontSize: style.fontSizeLarge.fontSize }]}
            containerStyle={[styles.otpContainer, alignJustifyCenter]}
          />
          {errors.otp ? <Text style={[styles.errorText, textAlign]}>{errors.otp}</Text> : null}

          <View style={[styles.resendRow, alignJustifyCenter]}>
            {resendTimer > 0 ? (
              <Text style={[styles.resendTimerText, style.fontWeightThin]}>
                {RESEND_OTP_IN} {formatTimer(resendTimer)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7} disabled={isSubmitting}>
                <Text style={[styles.resendText, style.fontWeightMedium]}>{RESEND_OTP}</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderFormError()}
          <CustomButton
            title={NEXT}
            iconName="arrow-right"
            iconPosition="right"
            onPress={handleOtpNext}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </>
      );
    }

    return (
      <>
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
        <CustomTextInput
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          label={LABEL_CONFIRM_PASSWORD}
          required
          placeholder={CONFIRM_PASSWORD}
          leftIcon="lock"
          secureTextEntry
          error={errors.confirmPassword}
          style={styles.inputSpacing}
        />
        <Text style={[styles.passwordHint, style.fontWeightThin, textAlign]}>{FORGOT_PASSWORD_PASSWORD_HINT}</Text>
        {renderFormError()}
        <CustomButton
          title={CONTINUE}
          iconName="arrow-right"
          iconPosition="right"
          onPress={handleResetPassword}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, style.fontWeightBold]}>{FORGOT_PASSWORD_TITLE}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.contentBox}>
            <View style={[styles.iconCircle, alignJustifyCenter]}>
              <Icon name={stepContent.icon} size={28} color={redColor} />
            </View>

            <Text style={[styles.heading, style.fontWeightBold, textAlign]}>{stepContent.heading}</Text>
            <Text style={[styles.subtitle, style.fontWeightThin, textAlign]}>{stepContent.subtitle}</Text>

            {step === STEPS.OTP && email ? (
              <View style={[styles.emailBadge, alignItemsCenter]}>
                <Text style={[styles.emailBadgeLabel, style.fontWeightThin, textAlign]}>{FORGOT_PASSWORD_OTP_SENT_TO}</Text>
                <Text style={[styles.emailHint, style.fontWeightMedium, textAlign]}>{email}</Text>
              </View>
            ) : null}

            {renderStepContent()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        title={PASSWORD_RESET_SUCCESS_TITLE}
        message={PASSWORD_RESET_SUCCESS_MESSAGE}
        onPress={handleSuccessOk}
      />
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: spacings.large,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: inputBgColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacings.large,
  },
  headerTitle: {
    flex: 1,
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
  },
  contentBox: {
    width: '100%',
    paddingVertical: hp(1),
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightPink,
    alignSelf: 'center',
    marginBottom: spacings.xLarge,
  },
  heading: {
    fontSize: style.fontSizeLargeXX.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
    paddingHorizontal: wp(2),
  },
  subtitle: {
    fontSize: style.fontSizeNormal1x.fontSize,
    color: grayColor,
    lineHeight: 22,
    marginBottom: spacings.xxLarge,
    paddingHorizontal: wp(2),
  },
  emailBadge: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.xLarge,
    marginBottom: spacings.xxLarge,
  },
  emailBadgeLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.xsmall,
  },
  emailHint: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  passwordHint: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: -spacings.normal,
    marginBottom: spacings.xLarge,
  },
  inputSpacing: {
    marginBottom: spacings.xLarge,
  },
  otpContainer: {
    marginBottom: spacings.small,
  },
  otpInput: {
    width: wp(12),
    height: hp(6.5),
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: inputBgColor,
    color: blackColor,
  },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: spacings.large,
  },
  formErrorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: spacings.large,
  },
  resendRow: {
    marginBottom: spacings.xxLarge,
    marginTop: spacings.normal,
  },
  resendText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: redColor,
  },
  resendTimerText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
  },
});
