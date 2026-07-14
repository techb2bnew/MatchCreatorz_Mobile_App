import { API_BASE_URL, ERROR_REGISTER_FAILED } from '../constans/Constants';

export const buildApiUrl = (endpoint = '') => `${API_BASE_URL}${endpoint}`;

const parseResponseBody = async response => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : {};
};

export const getApiErrorMessage = (payload, fallback = ERROR_REGISTER_FAILED) => {
  if (!payload) return fallback;
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;

  if (payload.errors && typeof payload.errors === 'object') {
    const firstKey = Object.keys(payload.errors)[0];
    const firstError = payload.errors[firstKey];
    if (Array.isArray(firstError) && firstError[0]) return String(firstError[0]);
    if (typeof firstError === 'string') return firstError;
  }

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
    const error = new Error(getApiErrorMessage(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
