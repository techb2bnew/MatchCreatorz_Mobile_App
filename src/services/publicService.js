import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from '../constans/Constants';

/**
 * GET /api/v1/public/pages/{slug} — static page (about/privacy/terms/faq/contact).
 * Response: { data: { id, slug, title, content, createdAt, updatedAt } }
 */
export const getPublicPageApi = async slug => {
  const endpoint = `${API_ENDPOINTS.PUBLIC_PAGES}/${slug}`;
  try {
    const response = await apiRequest(endpoint, { method: 'GET' });
    console.log('[PublicPage] Response <<<', JSON.stringify(response));
    return response;
  } catch (error) {
    console.log('[PublicPage] Error <<<', { status: error?.status, message: error?.message });
    throw error;
  }
};

/**
 * GET /api/v1/public/stats — platform-wide stats (no auth).
 * Response: { data: { total_creators, avg_rating, satisfaction_pct, avg_bids_per_job } }
 */
export const getPublicStatsApi = async () => {
  try {
    const response = await apiRequest(API_ENDPOINTS.PUBLIC_STATS, { method: 'GET' });
    console.log('[PublicStats] Response <<<', JSON.stringify(response));
    return response;
  } catch (error) {
    console.log('[PublicStats] Error <<<', { status: error?.status, message: error?.message });
    throw error;
  }
};

/**
 * GET /api/v1/banners — active promotional banners (no auth).
 * Optional position filter, e.g. "Home Top".
 * Response: { data: [{ id, title, image_url, link_url, position, display_order }] }
 */
export const getBannersApi = async (position = '') => {
  const endpoint = position
    ? `${API_ENDPOINTS.BANNERS}?position=${encodeURIComponent(position)}`
    : API_ENDPOINTS.BANNERS;
  try {
    const response = await apiRequest(endpoint, { method: 'GET' });
    console.log('[Banners] Response <<<', JSON.stringify(response));
    return response;
  } catch (error) {
    console.log('[Banners] Error <<<', { status: error?.status, message: error?.message });
    throw error;
  }
};
