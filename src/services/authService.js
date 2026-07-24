import { API_ENDPOINTS, ERROR_UPLOAD_TOO_LARGE, mapAppRoleToApiRole, USER_ROLES } from '../constans/Constants';
import { apiRequest } from './apiClient';
import { getFilesTotalSize, MAX_TOTAL_UPLOAD_BYTES } from '../utils/filePicker';

const appendFile = (formData, field, file) => {
  if (!file?.uri) return;
  formData.append(field, {
    uri: file.uri,
    name: file.name || `${field}_${Date.now()}`,
    type: file.type || 'application/octet-stream',
  });
};

/**
 * Build multipart/form-data for POST /api/v1/auth/register
 *
 * Required all roles: name, email, password, role (SELLER|BUYER)
 * Optional all: phone, profile_image
 * Required SELLER: skills, hourly_rate, city, country
 * Optional SELLER: bio, resume, portfolio_files, portfolio_links
 * Optional BUYER: company_name, city, country
 */
export const buildRegisterFormData = ({
  role,
  fullName,
  email,
  password,
  phone,
  companyName,
  profileImage,
  profile = {},
  portfolio = {},
}) => {
  const formData = new FormData();
  const isSeller = role === USER_ROLES.CREATOR;
  const apiRole = mapAppRoleToApiRole(role);
  const phoneDigits = (phone || '').replace(/\D/g, '');
  const formattedPhone = phoneDigits
    ? phone.startsWith('+')
      ? phone
      : `+91${phoneDigits}`
    : '';
  const skills =
    typeof profile.skills === 'string'
      ? profile.skills
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      : Array.isArray(profile.tags)
        ? profile.tags
        : [];
  const portfolioFiles = Array.isArray(portfolio.portfolioFiles) ? portfolio.portfolioFiles : [];
  const portfolioLinks = Array.isArray(portfolio.portfolioLinks) ? portfolio.portfolioLinks : [];

  const uploadFiles = [
    profileImage,
    profile.resumeFile,
    ...portfolioFiles,
  ].filter(Boolean);
  const totalUploadBytes = getFilesTotalSize(uploadFiles);

  if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
    const error = new Error(ERROR_UPLOAD_TOO_LARGE);
    error.status = 413;
    throw error;
  }

  const debugPayload = {
    name: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: apiRole,
    phone: formattedPhone || undefined,
    profile_image: profileImage
      ? { name: profileImage.name, type: profileImage.type, uri: profileImage.uri, size: profileImage.size }
      : undefined,
    total_upload_bytes: totalUploadBytes,
  };

  formData.append('name', debugPayload.name);
  formData.append('email', debugPayload.email);
  formData.append('password', password);
  formData.append('role', apiRole);

  if (formattedPhone) {
    formData.append('phone', formattedPhone);
  }

  appendFile(formData, 'profile_image', profileImage);

  if (isSeller) {
    debugPayload.skills = skills.join(',');
    debugPayload.hourly_rate = String(Number(profile.hourlyRate));
    debugPayload.city = (profile.city || '').trim();
    debugPayload.country = (profile.country || '').trim();
    debugPayload.bio = profile.bio?.trim() || undefined;
    debugPayload.resume = profile.resumeFile
      ? {
          name: profile.resumeFile.name,
          type: profile.resumeFile.type,
          uri: profile.resumeFile.uri,
          size: profile.resumeFile.size,
        }
      : undefined;
    debugPayload.portfolio_files = portfolioFiles.map(file => ({
      name: file.name,
      type: file.type,
      uri: file.uri,
      size: file.size,
    }));
    debugPayload.portfolio_links = portfolioLinks.length ? portfolioLinks : undefined;

    formData.append('skills', debugPayload.skills);
    formData.append('hourly_rate', debugPayload.hourly_rate);
    formData.append('city', debugPayload.city);
    formData.append('country', debugPayload.country);

    if (debugPayload.bio) {
      formData.append('bio', debugPayload.bio);
    }

    appendFile(formData, 'resume', profile.resumeFile);

    portfolioFiles.slice(0, 10).forEach(file => {
      appendFile(formData, 'portfolio_files', file);
    });

    if (portfolioLinks.length) {
      formData.append('portfolio_links', JSON.stringify(portfolioLinks));
    }
  } else if (companyName?.trim()) {
    debugPayload.company_name = companyName.trim();
    formData.append('company_name', debugPayload.company_name);
  }

  console.log('[Register] Payload >>>', JSON.stringify(debugPayload, null, 2));

  return formData;
};

export const registerUserApi = async payload => {
  console.log('[Register] Incoming screen payload >>>', {
    role: payload.role,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    companyName: payload.companyName,
    profile: payload.profile,
    portfolio: {
      portfolioLinks: payload.portfolio?.portfolioLinks,
      portfolioFiles: (payload.portfolio?.portfolioFiles || []).map(file => ({
        name: file.name,
        type: file.type,
        uri: file.uri,
        size: file.size,
      })),
    },
  });

  const body = buildRegisterFormData(payload);

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH_REGISTER, {
      method: 'POST',
      body,
    });
    console.log('[Register] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[Register] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
      errors: error?.data?.errors,
    });
    throw error;
  }
};

/**
 * POST /api/v1/auth/login
 * JSON body: { email?, phone?, password }
 */
export const loginUserApi = async ({ email, phone, password }) => {
  const phoneDigits = (phone || '').replace(/\D/g, '');
  const payload = {
    password,
  };

  if (email?.trim()) {
    payload.email = email.trim().toLowerCase();
  }

  if (phoneDigits) {
    payload.phone = phone.startsWith('+') ? phone : `+91${phoneDigits}`;
  }

  console.log('[Login] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: payload,
    });
    console.log('[Login] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[Login] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * POST /api/v1/auth/google
 * Sign in / sign up with Google
 * Body: { credential: <Google ID token>, role?: 'BUYER' | 'SELLER' }
 * role is required only to complete a new signup — omit it for a plain login
 * attempt. If the account already exists, role is ignored and the account's
 * real stored role is returned (confirmed against the live API).
 *
 * Response shapes (confirmed against the live API):
 *  - New account, no role sent: { data: { isNew: true, profile: { email, name, avatar } } }
 *    (no account is created and no session token is issued in this case)
 *  - Existing account, or role provided for a new signup:
 *    { data: { token, role, user: { id, name, email, phone, role, is_verified } } }
 */
export const googleAuthApi = async ({ credential, role }) => {
  const payload = { credential };
  if (role) payload.role = role;

  console.log('[GoogleAuth] Payload >>>', {
    endpoint: API_ENDPOINTS.AUTH_GOOGLE,
    hasRole: Boolean(role),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH_GOOGLE, {
      method: 'POST',
      body: payload,
    });
    console.log('[GoogleAuth] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[GoogleAuth] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * POST /api/v1/auth/logout
 * Auth header: Bearer token (empty body)
 */
export const logoutUserApi = async token => {
  console.log('[Logout] Payload >>>', {
    endpoint: API_ENDPOINTS.AUTH_LOGOUT,
    method: 'POST',
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH_LOGOUT, {
      method: 'POST',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[Logout] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[Logout] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

const buildForgotIdentifierPayload = ({ email, phone }) => {
  const payload = {};
  const phoneDigits = (phone || '').replace(/\D/g, '');

  if (email?.trim()) {
    payload.email = email.trim().toLowerCase();
  } else if (phoneDigits) {
    payload.phone = phone.startsWith('+') ? phone : `+91${phoneDigits}`;
  }

  return payload;
};

/**
 * POST /api/v1/auth/forgot-password
 * Body: { email } OR { phone } (exactly one)
 */
export const forgotPasswordApi = async ({ email, phone }) => {
  const payload = buildForgotIdentifierPayload({ email, phone });
  console.log('[ForgotPassword] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
      method: 'POST',
      body: payload,
    });
    console.log('[ForgotPassword] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[ForgotPassword] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * POST /api/v1/auth/verify-forgot-otp
 * Body: { email?, phone?, otp } — same identifier used in forgot-password
 * Returns: data.reset_token
 */
export const verifyForgotOtpApi = async ({ email, phone, otp }) => {
  const payload = {
    ...buildForgotIdentifierPayload({ email, phone }),
    otp: String(otp || '').trim(),
  };
  console.log('[VerifyForgotOtp] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH_VERIFY_FORGOT_OTP, {
      method: 'POST',
      body: payload,
    });
    console.log('[VerifyForgotOtp] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[VerifyForgotOtp] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Body: { token, password } — token from verify-forgot-otp
 */
export const resetPasswordApi = async ({ token, password }) => {
  const payload = {
    token,
    password,
  };
  console.log('[ResetPassword] Payload >>>', JSON.stringify({ ...payload, password: '[hidden]' }, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
      method: 'POST',
      body: payload,
    });
    console.log('[ResetPassword] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[ResetPassword] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};
