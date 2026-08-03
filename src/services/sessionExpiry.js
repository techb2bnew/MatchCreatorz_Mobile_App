// Central place to react to an expired / invalid auth token.
// apiClient reports it; App.tsx registers the handler that logs the user out.
// Kept in its own module so apiClient never has to import the redux store
// (which would create a circular import: store -> slices -> services -> apiClient).

let handler = null;
let notifying = false;

const TOKEN_ERROR_REGEX =
  /(token\s*(is\s*)?(expired|invalid|malformed|missing))|(expired\s*token)|(jwt\s*(expired|malformed))|(session\s*expired)|(invalid\s*signature)/i;

export const setSessionExpiredHandler = fn => {
  handler = typeof fn === 'function' ? fn : null;
};

const matchesTokenError = payload => {
  if (!payload) return false;
  const text = [payload.message, payload.error].filter(v => typeof v === 'string').join(' ');
  return TOKEN_ERROR_REGEX.test(text);
};

// Only treat it as an expired session when the request actually carried a token —
// otherwise a wrong password on login (also 401) would trigger a "logout".
export const isSessionExpiredResponse = ({ status, data, hadToken }) => {
  if (!hadToken) return false;
  if (status === 401) return true;
  if (status === 403) return matchesTokenError(data);
  return false;
};

// Debounced: several parallel requests can fail at once, we only log out once.
export const notifySessionExpired = () => {
  if (!handler || notifying) return;
  notifying = true;
  try {
    handler();
  } catch (error) {
    console.log('[SessionExpiry] Handler failed', error?.message || error);
  } finally {
    setTimeout(() => {
      notifying = false;
    }, 5000);
  }
};
