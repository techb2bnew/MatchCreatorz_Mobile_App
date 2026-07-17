
import { Dimensions, PixelRatio } from 'react-native';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import {
  ERROR_CITY_REQUIRED,
  ERROR_CONFIRM_PASSWORD_REQUIRED,
  ERROR_COUNTRY_REQUIRED,
  ERROR_EMAIL_INVALID,
  ERROR_EMAIL_REQUIRED,
  ERROR_FULL_NAME_MIN,
  ERROR_FULL_NAME_REQUIRED,
  ERROR_HOURLY_RATE_INVALID,
  ERROR_HOURLY_RATE_REQUIRED,
  ERROR_OTP_INVALID,
  ERROR_OTP_REQUIRED,
  ERROR_PASSWORD_MIN,
  ERROR_PASSWORD_MISMATCH,
  ERROR_PASSWORD_REQUIRED,
  ERROR_PASSWORD_STRENGTH,
  ERROR_PHONE_INVALID,
  ERROR_PHONE_REQUIRED,
  ERROR_SKILLS_REQUIRED,
  ERROR_TERMS_REQUIRED,
  MIN_PASSWORD_LENGTH,
  OTP_LENGTH,
  PHONE_MAX_LENGTH,
} from './constans/Constants';

export const widthPercentageToDP = widthPercent => {
  const screenWidth = Dimensions.get('window').width;
  const elemWidth = parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

export const heightPercentageToDP = heightPercent => {
  const screenHeight = Dimensions.get('window').height;
  const elemHeight = parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

export const formatPhoneInput = (text: string) =>
  text.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH);

export const validatePhone = (phone: string, { required = true } = {}) => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return required ? ERROR_PHONE_REQUIRED : '';
  if (digits.length !== PHONE_MAX_LENGTH) return ERROR_PHONE_INVALID;
  return '';
};

export const validateEmail = (email: string) => {
  if (!email.trim()) return ERROR_EMAIL_REQUIRED;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return ERROR_EMAIL_INVALID;
  return '';
};

export const validatePassword = (password: string) => {
  if (!password) return ERROR_PASSWORD_REQUIRED;
  if (password.length < MIN_PASSWORD_LENGTH) return ERROR_PASSWORD_MIN;
  if (!/[A-Z]/.test(password) || !/\d/.test(password)) return ERROR_PASSWORD_STRENGTH;
  return '';
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) return ERROR_CONFIRM_PASSWORD_REQUIRED;
  if (password !== confirmPassword) return ERROR_PASSWORD_MISMATCH;
  return '';
};

export const validateFullName = (name: string) => {
  if (!name.trim()) return ERROR_FULL_NAME_REQUIRED;
  if (name.trim().length < 2) return ERROR_FULL_NAME_MIN;
  return '';
};

export const validateTerms = (accepted: boolean) => {
  if (!accepted) return ERROR_TERMS_REQUIRED;
  return '';
};

export const validateOtp = (otp: string) => {
  const digits = otp.replace(/\D/g, '');
  if (!digits) return ERROR_OTP_REQUIRED;
  if (digits.length !== OTP_LENGTH) return ERROR_OTP_INVALID;
  return '';
};

export const validateCity = (city: string) => {
  if (!city.trim()) return ERROR_CITY_REQUIRED;
  return '';
};

export const validateCountry = (country: string) => {
  if (!country.trim()) return ERROR_COUNTRY_REQUIRED;
  return '';
};

export const validateSkills = (skills: string | string[] = '') => {
  const list =
    typeof skills === 'string'
      ? skills.split(',').map(item => item.trim()).filter(Boolean)
      : skills;
  if (!list.length) return ERROR_SKILLS_REQUIRED;
  return '';
};

export const validateHourlyRate = (rate: string | number) => {
  const value = String(rate ?? '').trim();
  if (!value) return ERROR_HOURLY_RATE_REQUIRED;
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric <= 0) return ERROR_HOURLY_RATE_INVALID;
  return '';
};
