import { APP_CURRENCY } from '../constans/Constants';

export const CURRENCY_LOCALE = 'en-US';

export const formatAppCurrency = (value, { decimals = 2, whole = false } = {}) => {
  const num = Number(value);
  if (Number.isNaN(num)) return `${APP_CURRENCY}—`;
  if (whole) {
    return `${APP_CURRENCY}${num.toLocaleString(CURRENCY_LOCALE, { maximumFractionDigits: 0 })}`;
  }
  return `${APP_CURRENCY}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatAppPrice = value => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith(APP_CURRENCY) || trimmed.startsWith('₹')) {
      return trimmed.replace(/^₹/, APP_CURRENCY);
    }
  }
  return formatAppCurrency(value, { whole: true });
};

export const stripCurrencySymbol = value =>
  String(value ?? '')
    .replace(/[$₹,\s]/g, '')
    .trim();
