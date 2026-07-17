import { API_BASE_URL, ERROR_REGISTER_FAILED, ERROR_UPLOAD_TOO_LARGE } from '../constans/Constants';

export const buildApiUrl = (endpoint = '') => `${API_BASE_URL}${endpoint}`;

const parseResponseBody = async response => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : {};
};

const getFirstValidationError = errors => {
  if (!errors) return '';

  // API format: [{ field, message }, ...]
  if (Array.isArray(errors)) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    if (first?.message) return String(first.message);
    return '';
  }

  // Object map format: { email: ['...'], name: '...' }
  if (typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstError = errors[firstKey];
    if (Array.isArray(firstError) && firstError[0]) return String(firstError[0]);
    if (typeof firstError === 'string') return firstError;
    if (firstError?.message) return String(firstError.message);
  }

  return '';
};

const isEntityTooLargeMessage = message =>
  typeof message === 'string' &&
  (message.includes('413') || /request entity too large/i.test(message));

export const getApiErrorMessage = (payload, fallback = ERROR_REGISTER_FAILED, status) => {
  if (status === 413) return ERROR_UPLOAD_TOO_LARGE;
  if (!payload) return fallback;

  if (isEntityTooLargeMessage(payload.message) || isEntityTooLargeMessage(payload.error)) {
    return ERROR_UPLOAD_TOO_LARGE;
  }

  const fieldError = getFirstValidationError(payload.errors);
  if (fieldError) return fieldError;

  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;

  return fallback;
};

export const apiRequest = async (endpoint, options = {}) => {
  const { method = 'GET', headers = {}, body, token } = options;

  const requestHeaders = {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let requestBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  // JSON body needs Content-Type; FormData must leave it unset for boundary.
  if (requestBody != null && !isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
  }

  const response = await fetch(buildApiUrl(endpoint), {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const error = new Error(getApiErrorMessage(data, ERROR_REGISTER_FAILED, response.status));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
