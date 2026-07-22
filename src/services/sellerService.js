import { API_ENDPOINTS } from '../constans/Constants';
import { apiRequest } from './apiClient';

/**
 * GET /api/v1/seller/stats
 * Seller dashboard statistics
 * Auth header: Bearer token
 */
export const getSellerStatsApi = async token => {
  console.log('[SellerStats] Payload >>>', {
    endpoint: API_ENDPOINTS.SELLER_STATS,
    method: 'GET',
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_STATS, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerStats] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerStats] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * DELETE /api/v1/seller/account
 * Soft delete seller account
 * Body: { reason }
 * Auth header: Bearer token
 */
export const deleteSellerAccountApi = async (token, reason) => {
  const payload = { reason: String(reason || '').trim() };
  console.log('[SellerDeleteAccount] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_ACCOUNT, {
      method: 'DELETE',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[SellerDeleteAccount] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerDeleteAccount] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/seller/bookings
 * List seller's bookings
 * Query: tab (active|completed|cancelled), page, limit
 * Auth header: Bearer token
 */
export const getSellerBookingsApi = async (token, params = {}) => {
  const { tab = 'active', page = 1, limit = 20 } = params;
  const query = new URLSearchParams();
  query.set('tab', String(tab));
  query.set('page', String(page));
  query.set('limit', String(limit));

  const endpoint = `${API_ENDPOINTS.SELLER_BOOKINGS}?${query.toString()}`;
  console.log('[SellerBookings] Payload >>>', {
    endpoint,
    method: 'GET',
    tab,
    page,
    limit,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerBookings] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerBookings] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/seller/bookings/{id}
 * Get booking detail
 * Auth header: Bearer token
 */
export const getSellerBookingByIdApi = async (token, bookingId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_BOOKINGS}/${bookingId}`;
  console.log('[SellerBookingDetail] Payload >>>', {
    endpoint,
    method: 'GET',
    bookingId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerBookingDetail] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerBookingDetail] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * PATCH /api/v1/seller/bookings/{id}/accept
 * Accept order (pending -> ongoing)
 */
export const acceptSellerBookingApi = async (token, bookingId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_BOOKINGS}/${bookingId}/accept`;
  console.log('[SellerBookingAccept] Payload >>>', {
    endpoint,
    method: 'PATCH',
    bookingId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerBookingAccept] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerBookingAccept] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * PATCH /api/v1/seller/bookings/{id}/submit
 * Submit work for review (ongoing -> amidst_completion)
 */
export const submitSellerBookingApi = async (token, bookingId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_BOOKINGS}/${bookingId}/submit`;
  console.log('[SellerBookingSubmit] Payload >>>', {
    endpoint,
    method: 'PATCH',
    bookingId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerBookingSubmit] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerBookingSubmit] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * PATCH /api/v1/seller/bookings/{id}/cancel
 * Cancel a booking (pending only)
 * Body: { cancel_reason }
 */
export const cancelSellerBookingApi = async (token, bookingId, cancelReason = '') => {
  const endpoint = `${API_ENDPOINTS.SELLER_BOOKINGS}/${bookingId}/cancel`;
  const payload = { cancel_reason: String(cancelReason || '').trim() };
  console.log('[SellerBookingCancel] Payload >>>', JSON.stringify({ endpoint, bookingId, ...payload }, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[SellerBookingCancel] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerBookingCancel] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/seller/bids
 * List all bids placed by the logged-in seller
 * Query: status, page, limit
 * Auth header: Bearer token
 */
export const getSellerBidsApi = async (token, params = {}) => {
  const { status, page = 1, limit = 20 } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (status) query.set('status', String(status));

  const endpoint = `${API_ENDPOINTS.SELLER_BIDS}?${query.toString()}`;
  console.log('[SellerBids] Payload >>>', {
    endpoint,
    method: 'GET',
    page,
    limit,
    status: status || null,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerBids] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerBids] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/seller/jobs
 * Browse all open jobs
 * Query: search, category, page, limit
 * Auth header: Bearer token
 */
export const getSellerJobsApi = async (token, params = {}) => {
  const { search, category, page = 1, limit = 20 } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (search) query.set('search', String(search));
  if (category) query.set('category', String(category));

  const endpoint = `${API_ENDPOINTS.SELLER_JOBS}?${query.toString()}`;
  console.log('[SellerJobs] Payload >>>', {
    endpoint,
    method: 'GET',
    page,
    limit,
    search: search || null,
    category: category || null,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerJobs] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerJobs] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/seller/jobs/{id}
 * Get a single open job detail
 * Auth header: Bearer token
 */
export const getSellerJobByIdApi = async (token, jobId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_JOBS}/${jobId}`;
  console.log('[SellerJobDetail] Payload >>>', {
    endpoint,
    method: 'GET',
    jobId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerJobDetail] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerJobDetail] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * POST /api/v1/seller/jobs/{id}/bid
 * Place a bid on a job
 * Body: { amount, delivery_days, proposal }
 * Auth header: Bearer token
 */
export const placeSellerJobBidApi = async (token, jobId, form) => {
  const payload = {
    amount: Number(form.amount),
    delivery_days: Number(form.delivery_days),
    proposal: String(form.proposal || '').trim(),
  };
  const endpoint = `${API_ENDPOINTS.SELLER_JOBS}/${jobId}/bid`;

  console.log('[SellerPlaceBid] Payload >>>', JSON.stringify({ endpoint, jobId, ...payload }, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[SellerPlaceBid] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerPlaceBid] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * PATCH /api/v1/seller/jobs/:id/bid/accept
 * Accept the buyer's counter offer (creates a booking)
 * Auth header: Bearer token
 */
export const acceptSellerJobBidApi = async (token, jobId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_JOBS}/${jobId}/bid/accept`;
  console.log('[SellerAcceptCounter] Payload >>>', { endpoint, method: 'PATCH', jobId, hasToken: Boolean(token) });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerAcceptCounter] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerAcceptCounter] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PATCH /api/v1/seller/jobs/:id/bid/counter
 * Counter back after the buyer countered your bid
 * Body: { amount (required), delivery_days?, note? }
 * Auth header: Bearer token
 */
export const counterSellerJobBidApi = async (token, jobId, form = {}) => {
  const payload = { amount: Number(form.amount) };
  if (form.delivery_days != null && form.delivery_days !== '') {
    payload.delivery_days = Number(form.delivery_days);
  }
  if (form.note != null && String(form.note).trim()) {
    payload.note = String(form.note).trim();
  }

  const endpoint = `${API_ENDPOINTS.SELLER_JOBS}/${jobId}/bid/counter`;
  console.log('[SellerCounterBid] Payload >>>', JSON.stringify({ endpoint, jobId, ...payload }, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[SellerCounterBid] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerCounterBid] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/seller/profile
 * Auth header: Bearer token
 */
export const getSellerProfileApi = async token => {
  console.log('[SellerProfile] Payload >>>', {
    endpoint: API_ENDPOINTS.SELLER_PROFILE,
    method: 'GET',
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_PROFILE, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerProfile] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerProfile] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/categories
 * Public categories list (id, name, icon)
 */
export const getCategoriesApi = async () => {
  console.log('[Categories] Payload >>>', {
    endpoint: API_ENDPOINTS.CATEGORIES,
    method: 'GET',
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.CATEGORIES, {
      method: 'GET',
      headers: { Accept: '*/*' },
    });
    console.log('[Categories] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[Categories] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/seller/services
 * List seller's services
 * Query: search, status, page, limit
 */
export const getSellerServicesApi = async (token, params = {}) => {
  const { search, status, page = 1, limit = 20 } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (search) query.set('search', String(search));
  if (status) query.set('status', String(status));

  const endpoint = `${API_ENDPOINTS.SELLER_SERVICES}?${query.toString()}`;
  console.log('[SellerServices] Payload >>>', {
    endpoint,
    method: 'GET',
    page,
    limit,
    search: search || null,
    status: status || null,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerServices] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerServices] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * Build multipart FormData for POST /api/v1/seller/services
 * category_ids & tags sent as JSON strings; images as files (max 5)
 */
export const buildCreateServiceFormData = ({
  title,
  description,
  price,
  delivery_days,
  revisions,
  category_ids = [],
  tags = [],
  images = [],
}) => {
  const formData = new FormData();

  formData.append('title', String(title || '').trim());
  if (description != null && String(description).trim()) {
    formData.append('description', String(description).trim());
  }
  formData.append('price', String(price));
  if (delivery_days != null && delivery_days !== '') {
    formData.append('delivery_days', String(delivery_days));
  }
  if (revisions != null && revisions !== '') {
    formData.append('revisions', String(revisions));
  }
  formData.append('category_ids', JSON.stringify(category_ids.map(Number).filter(n => !Number.isNaN(n))));
  formData.append('tags', JSON.stringify(Array.isArray(tags) ? tags : []));

  (Array.isArray(images) ? images : []).forEach((file, index) => {
    if (!file?.uri) return;
    formData.append('images', {
      uri: file.uri,
      name: file.name || `service_${Date.now()}_${index}.jpg`,
      type: file.type || 'image/jpeg',
    });
  });

  return formData;
};

/**
 * POST /api/v1/seller/services
 * Create a new service (multipart/form-data)
 */
export const createSellerServiceApi = async (token, payload) => {
  const formData = buildCreateServiceFormData(payload);
  const debugPayload = {
    title: payload?.title,
    description: payload?.description,
    price: payload?.price,
    delivery_days: payload?.delivery_days,
    revisions: payload?.revisions,
    category_ids: payload?.category_ids,
    tags: payload?.tags,
    images: (payload?.images || []).map(file => ({
      name: file?.name,
      type: file?.type,
      uri: file?.uri,
      size: file?.size,
    })),
  };

  console.log('[SellerCreateService] Payload >>>', JSON.stringify(debugPayload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_SERVICES, {
      method: 'POST',
      headers: { Accept: '*/*' },
      body: formData,
      token,
    });
    console.log('[SellerCreateService] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerCreateService] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/seller/services/{id}
 * Get my service by ID
 */
export const getSellerServiceByIdApi = async (token, serviceId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_SERVICES}/${serviceId}`;
  console.log('[SellerServiceDetail] Payload >>>', {
    endpoint,
    method: 'GET',
    serviceId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerServiceDetail] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerServiceDetail] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * Build multipart FormData for PUT /api/v1/seller/services/{id}
 * existing_images = JSON URLs to keep; images = new files
 */
export const buildUpdateServiceFormData = ({
  title,
  description,
  price,
  delivery_days,
  revisions,
  category_ids = [],
  tags = [],
  existing_images = [],
  images = [],
}) => {
  const formData = new FormData();

  formData.append('title', String(title || '').trim());
  if (description != null && String(description).trim()) {
    formData.append('description', String(description).trim());
  }
  formData.append('price', String(price));
  if (delivery_days != null && delivery_days !== '') {
    formData.append('delivery_days', String(delivery_days));
  }
  if (revisions != null && revisions !== '') {
    formData.append('revisions', String(revisions));
  }
  formData.append(
    'category_ids',
    JSON.stringify(category_ids.map(Number).filter(n => !Number.isNaN(n))),
  );
  formData.append('tags', JSON.stringify(Array.isArray(tags) ? tags : []));
  formData.append(
    'existing_images',
    JSON.stringify(
      (Array.isArray(existing_images) ? existing_images : [])
        .map(url => String(url || '').trim())
        .filter(Boolean),
    ),
  );

  (Array.isArray(images) ? images : []).forEach((file, index) => {
    if (!file?.uri) return;
    formData.append('images', {
      uri: file.uri,
      name: file.name || `service_${Date.now()}_${index}.jpg`,
      type: file.type || 'image/jpeg',
    });
  });

  return formData;
};

/**
 * PUT /api/v1/seller/services/{id}
 * Update my service (multipart/form-data)
 */
export const updateSellerServiceApi = async (token, serviceId, payload) => {
  const endpoint = `${API_ENDPOINTS.SELLER_SERVICES}/${serviceId}`;
  const formData = buildUpdateServiceFormData(payload);
  const debugPayload = {
    serviceId,
    title: payload?.title,
    description: payload?.description,
    price: payload?.price,
    delivery_days: payload?.delivery_days,
    revisions: payload?.revisions,
    category_ids: payload?.category_ids,
    tags: payload?.tags,
    existing_images: payload?.existing_images,
    images: (payload?.images || []).map(file => ({
      name: file?.name,
      type: file?.type,
      uri: file?.uri,
      size: file?.size,
    })),
  };

  console.log('[SellerUpdateService] Payload >>>', JSON.stringify(debugPayload, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: formData,
      token,
    });
    console.log('[SellerUpdateService] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerUpdateService] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * PATCH /api/v1/seller/services/{id}/publish
 * paused -> active
 */
export const publishSellerServiceApi = async (token, serviceId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_SERVICES}/${serviceId}/publish`;
  console.log('[SellerPublishService] Payload >>>', {
    endpoint,
    method: 'PATCH',
    serviceId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerPublishService] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerPublishService] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * PATCH /api/v1/seller/services/{id}/pause
 * active -> paused
 */
export const pauseSellerServiceApi = async (token, serviceId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_SERVICES}/${serviceId}/pause`;
  console.log('[SellerPauseService] Payload >>>', {
    endpoint,
    method: 'PATCH',
    serviceId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerPauseService] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerPauseService] Error response <<<',
      JSON.stringify(
        { status: error?.status, message: error?.message, data: error?.data },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * GET /api/v1/seller/reviews?page=1&limit=20
 * List reviews received by this seller
 */
export const getSellerReviewsApi = async (token, params = {}) => {
  const { page = 1, limit = 50 } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  const endpoint = `${API_ENDPOINTS.SELLER_REVIEWS}?${query.toString()}`;

  console.log('[SellerReviews] Payload >>>', {
    endpoint,
    method: 'GET',
    page,
    limit,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerReviews] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[SellerReviews] Error response <<<',
      JSON.stringify(
        {
          status: error?.status,
          message: error?.message,
          data: error?.data,
        },
        null,
        2,
      ),
    );
    throw error;
  }
};

/**
 * PUT /api/v1/seller/profile
 * JSON or multipart when resume is added/removed
 */
const appendProfileFile = (formData, field, file) => {
  if (!file?.uri || file.isRemote) return;
  formData.append(field, {
    uri: file.uri,
    name: file.name || `${field}_${Date.now()}`,
    type: file.type || 'application/octet-stream',
  });
};

export const buildUpdateSellerProfileFormData = ({
  name,
  phone,
  bio,
  location,
  city,
  country,
  skills,
  hourly_rate,
  resumeFile,
  removeResume,
  portfolio_links,
}) => {
  const formData = new FormData();

  formData.append('name', String(name || '').trim());
  formData.append('phone', String(phone || '').trim());
  formData.append('bio', String(bio || '').trim());
  if (location) formData.append('location', String(location).trim());
  if (city) formData.append('city', String(city).trim());
  if (country) formData.append('country', String(country).trim());
  if (skills) formData.append('skills', String(skills));
  if (hourly_rate) formData.append('hourly_rate', String(hourly_rate));
  if (removeResume) formData.append('remove_resume', 'true');
  appendProfileFile(formData, 'resume', resumeFile);
  if (Array.isArray(portfolio_links) && portfolio_links.length) {
    formData.append('portfolio_links', JSON.stringify(portfolio_links));
  }

  return formData;
};

export const updateSellerProfileApi = async (token, payload) => {
  const hasNewResume = payload?.resumeFile?.uri && !payload.resumeFile?.isRemote;
  const needsMultipart = Boolean(hasNewResume || payload?.removeResume);
  const debugPayload = needsMultipart
    ? {
        ...payload,
        resumeFile: hasNewResume
          ? {
              name: payload.resumeFile.name,
              type: payload.resumeFile.type,
              uri: payload.resumeFile.uri,
            }
          : null,
      }
    : payload;
  const body = needsMultipart ? buildUpdateSellerProfileFormData(payload) : payload;

  console.log('[SellerProfileUpdate] Payload >>>', JSON.stringify(debugPayload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_PROFILE, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body,
      token,
    });
    console.log('[SellerProfileUpdate] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerProfileUpdate] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/seller/notifications?page=1&limit=20&unread_only=
 * Auth header: Bearer token
 */
export const getSellerNotificationsApi = async (token, params = {}) => {
  const { page = 1, limit = 20, unreadOnly } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (unreadOnly) query.set('unread_only', 'true');

  const endpoint = `${API_ENDPOINTS.SELLER_NOTIFICATIONS}?${query.toString()}`;
  console.log('[SellerNotifications] Payload >>>', {
    endpoint,
    method: 'GET',
    page,
    limit,
    unreadOnly: Boolean(unreadOnly),
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerNotifications] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerNotifications] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/seller/notifications/:id/read
 * Auth header: Bearer token
 */
export const markSellerNotificationReadApi = async (token, notificationId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_NOTIFICATIONS}/${notificationId}/read`;
  console.log('[SellerNotificationRead] Payload >>>', { endpoint, method: 'PUT', notificationId });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerNotificationRead] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerNotificationRead] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/seller/notifications/read-all
 * Auth header: Bearer token
 */
export const markAllSellerNotificationsReadApi = async token => {
  console.log('[SellerNotificationsReadAll] Payload >>>', {
    endpoint: API_ENDPOINTS.SELLER_NOTIFICATIONS,
    method: 'PUT',
  });

  try {
    const response = await apiRequest(`${API_ENDPOINTS.SELLER_NOTIFICATIONS}/read-all`, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerNotificationsReadAll] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerNotificationsReadAll] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * DELETE /api/v1/seller/notifications/:id
 * Auth header: Bearer token
 */
export const deleteSellerNotificationApi = async (token, notificationId) => {
  const endpoint = `${API_ENDPOINTS.SELLER_NOTIFICATIONS}/${notificationId}`;
  console.log('[SellerNotificationDelete] Payload >>>', { endpoint, method: 'DELETE', notificationId });

  try {
    const response = await apiRequest(endpoint, {
      method: 'DELETE',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerNotificationDelete] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerNotificationDelete] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/seller/notifications/unread-count
 * Auth header: Bearer token
 */
export const getSellerUnreadNotificationsCountApi = async token => {
  const endpoint = `${API_ENDPOINTS.SELLER_NOTIFICATIONS}/unread-count`;
  console.log('[SellerUnreadCount] Payload >>>', { endpoint, method: 'GET', hasToken: Boolean(token) });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerUnreadCount] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerUnreadCount] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/seller/preferences
 * Auth header: Bearer token
 */
export const getSellerPreferencesApi = async token => {
  console.log('[SellerPreferences] Payload >>>', {
    endpoint: API_ENDPOINTS.SELLER_PREFERENCES,
    method: 'GET',
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_PREFERENCES, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerPreferences] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerPreferences] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/seller/preferences
 * Body: { notifications?: {...}, privacy?: {...}, payout?: {...} } — shallow-merged per group
 * Auth header: Bearer token
 */
export const updateSellerPreferencesApi = async (token, payload) => {
  console.log('[SellerPreferencesUpdate] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_PREFERENCES, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[SellerPreferencesUpdate] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerPreferencesUpdate] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/seller/fcm-token
 * Body: { platform: 'mobile', token: <FCM device token> }
 * Auth header: Bearer token
 */
export const registerSellerFcmTokenApi = async (token, fcmToken) => {
  const payload = { platform: 'mobile', token: fcmToken };
  console.log('[SellerRegisterFcmToken] Payload >>>', {
    endpoint: API_ENDPOINTS.SELLER_FCM_TOKEN,
    method: 'PUT',
    hasFcmToken: Boolean(fcmToken),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_FCM_TOKEN, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[SellerRegisterFcmToken] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerRegisterFcmToken] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * DELETE /api/v1/seller/fcm-token
 * Body: { platform: 'mobile' } — clears only the mobile token on logout
 * Auth header: Bearer token
 */
export const clearSellerFcmTokenApi = async token => {
  console.log('[SellerClearFcmToken] Payload >>>', {
    endpoint: API_ENDPOINTS.SELLER_FCM_TOKEN,
    method: 'DELETE',
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_FCM_TOKEN, {
      method: 'DELETE',
      headers: { Accept: '*/*' },
      body: { platform: 'mobile' },
      token,
    });
    console.log('[SellerClearFcmToken] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerClearFcmToken] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/seller/connects/balance
 * Auth header: Bearer token
 */
export const getSellerConnectsBalanceApi = async token => {
  const endpoint = `${API_ENDPOINTS.SELLER_CONNECTS}/balance`;
  console.log('[SellerConnectsBalance] Payload >>>', { endpoint, method: 'GET', hasToken: Boolean(token) });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerConnectsBalance] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerConnectsBalance] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/seller/connects/history?page=1&limit=20
 * Auth header: Bearer token
 */
export const getSellerConnectsHistoryApi = async (token, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));

  const endpoint = `${API_ENDPOINTS.SELLER_CONNECTS}/history?${query.toString()}`;
  console.log('[SellerConnectsHistory] Payload >>>', {
    endpoint,
    method: 'GET',
    page,
    limit,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[SellerConnectsHistory] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[SellerConnectsHistory] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};
