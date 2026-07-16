import { API_ENDPOINTS } from '../constans/Constants';
import { apiRequest } from './apiClient';

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
 * PUT /api/v1/seller/profile
 * Body: { name, phone, bio, location }
 * Auth header: Bearer token
 */
export const updateSellerProfileApi = async (token, payload) => {
  console.log('[SellerProfileUpdate] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_PROFILE, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: payload,
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
