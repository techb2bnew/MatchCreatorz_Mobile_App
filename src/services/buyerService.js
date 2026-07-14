import { API_ENDPOINTS } from '../constans/Constants';
import { apiRequest } from './apiClient';

/**
 * GET /api/v1/buyer/profile
 * Auth header: Bearer token
 */
export const getBuyerProfileApi = async token => {
  console.log('[BuyerProfile] Payload >>>', {
    endpoint: API_ENDPOINTS.BUYER_PROFILE,
    method: 'GET',
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_PROFILE, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerProfile] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerProfile] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/buyer/profile
 * Body: { name, phone, bio, location }
 * Auth header: Bearer token
 */
export const updateBuyerProfileApi = async (token, payload) => {
  console.log('[BuyerProfileUpdate] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_PROFILE, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[BuyerProfileUpdate] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerProfileUpdate] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};
