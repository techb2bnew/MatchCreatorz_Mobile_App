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
 * DELETE /api/v1/buyer/account
 * Soft delete buyer account
 * Body: { reason }
 * Auth header: Bearer token
 */
export const deleteBuyerAccountApi = async (token, reason) => {
  const payload = { reason: String(reason || '').trim() };
  console.log('[BuyerDeleteAccount] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_ACCOUNT, {
      method: 'DELETE',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[BuyerDeleteAccount] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerDeleteAccount] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/buyer/stats
 * Auth header: Bearer token
 */
export const getBuyerStatsApi = async token => {
  console.log('[BuyerStats] Payload >>>', {
    endpoint: API_ENDPOINTS.BUYER_STATS,
    method: 'GET',
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_STATS, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerStats] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerStats] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/buyer/jobs?search=&status=&page=1&limit=20
 * Auth header: Bearer token
 */
export const getBuyerJobsApi = async (token, params = {}) => {
  const { search, status, page = 1, limit = 20 } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (search) query.set('search', String(search));
  if (status) query.set('status', String(status));

  const endpoint = `${API_ENDPOINTS.BUYER_JOBS}?${query.toString()}`;
  console.log('[BuyerJobs] Payload >>>', {
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
    console.log('[BuyerJobs] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerJobs] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

const mapJobTypeToApi = jobType => {
  const normalized = String(jobType || '')
    .trim()
    .toLowerCase();
  if (normalized.includes('hourly')) return 'hourly';
  return 'fixed';
};

const mapExperienceLevelToApi = level => {
  const normalized = String(level || '')
    .trim()
    .toLowerCase();
  if (normalized.includes('entry') || normalized.includes('beginner')) return 'beginner';
  if (normalized.includes('intermediate')) return 'intermediate';
  if (normalized.includes('expert')) return 'expert';
  return 'any';
};

const formatDeadlineForApi = value => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const ddmmyyyy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return trimmed;
};

const capitalizeFirstLetter = value => {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const buildCreateJobPayload = form => {
  const skills = String(form.skills || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  const payload = {
    title: capitalizeFirstLetter(form.title),
    description: String(form.description || '').trim(),
    category: form.category,
    job_type: mapJobTypeToApi(form.jobType),
    budget_min: Number(form.budgetMin) || 0,
    budget_max: Number(form.budgetMax) || 0,
    experience_level: mapExperienceLevelToApi(form.experienceLevel),
    skills,
  };

  const deadline = formatDeadlineForApi(form.deadline);
  if (deadline) payload.deadline = deadline;

  return payload;
};

export const buildUpdateJobPayload = form => {
  const payload = {
    title: capitalizeFirstLetter(form.title),
    description: String(form.description || '').trim(),
    category: form.category,
    job_type: mapJobTypeToApi(form.jobType),
    budget_min: Number(form.budgetMin) || 0,
    budget_max: Number(form.budgetMax) || 0,
    experience_level: mapExperienceLevelToApi(form.experienceLevel),
  };

  const deadline = formatDeadlineForApi(form.deadline);
  if (deadline) payload.deadline = deadline;

  return payload;
};

/**
 * GET /api/v1/buyer/jobs/:id/bids
 * Auth header: Bearer token
 */
export const getBuyerJobBidsApi = async (token, jobId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_JOBS}/${jobId}/bids`;
  console.log('[BuyerJobBids] Payload >>>', {
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
    console.log('[BuyerJobBids] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerJobBids] Error response <<<',
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
 * PATCH /api/v1/buyer/jobs/:id/bids/:bidId/accept
 * Accept a bid on a job (creates a booking automatically).
 * Auth header: Bearer token
 */
export const acceptBuyerJobBidApi = async (token, jobId, bidId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_JOBS}/${jobId}/bids/${bidId}/accept`;
  console.log('[BuyerAcceptBid] Payload >>>', {
    endpoint,
    method: 'PATCH',
    jobId,
    bidId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerAcceptBid] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerAcceptBid] Error response <<<',
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
 * PATCH /api/v1/buyer/jobs/:id/bids/:bidId/reject
 * Reject a specific bid on a job.
 * Auth header: Bearer token
 */
export const rejectBuyerJobBidApi = async (token, jobId, bidId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_JOBS}/${jobId}/bids/${bidId}/reject`;
  console.log('[BuyerRejectBid] Payload >>>', {
    endpoint,
    method: 'PATCH',
    jobId,
    bidId,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerRejectBid] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerRejectBid] Error response <<<',
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
 * GET /api/v1/buyer/jobs/:id
 * Auth header: Bearer token
 */
export const getBuyerJobByIdApi = async (token, jobId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_JOBS}/${jobId}`;
  console.log('[BuyerJobDetail] Payload >>>', {
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
    console.log('[BuyerJobDetail] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerJobDetail] Error response <<<',
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
 * POST /api/v1/buyer/jobs
 * Body: { title, description, category, job_type, budget_min, budget_max, deadline, skills, experience_level }
 * Auth header: Bearer token
 */
export const createBuyerJobApi = async (token, form) => {
  const payload = buildCreateJobPayload(form);
  console.log('[BuyerPostJob] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_JOBS, {
      method: 'POST',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[BuyerPostJob] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerPostJob] Error response <<<',
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
 * PUT /api/v1/buyer/jobs/:id
 * Body: { title, description, category, job_type, budget_min, budget_max, deadline, experience_level }
 * Auth header: Bearer token
 */
export const updateBuyerJobApi = async (token, jobId, form) => {
  const payload = buildUpdateJobPayload(form);
  const endpoint = `${API_ENDPOINTS.BUYER_JOBS}/${jobId}`;
  console.log('[BuyerUpdateJob] Payload >>>', JSON.stringify({ jobId, ...payload }, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[BuyerUpdateJob] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerUpdateJob] Error response <<<',
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
 * GET /api/v1/buyer/bookings?tab=active&page=1&limit=20
 * Auth header: Bearer token
 * tab: active | completed | cancelled
 */
export const getBuyerBookingsApi = async (token, params = {}) => {
  const { tab = 'active', page = 1, limit = 20 } = params;
  const query = new URLSearchParams();
  query.set('tab', String(tab));
  query.set('page', String(page));
  query.set('limit', String(limit));

  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}?${query.toString()}`;
  console.log('[BuyerBookings] Payload >>>', {
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
    console.log('[BuyerBookings] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerBookings] Error response <<<',
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
 * GET /api/v1/buyer/services
 * Search / browse active services
 * Query: search, category, price_min, price_max, rating, delivery_days, sort, page, limit
 */
export const getBuyerServicesApi = async (token, params = {}) => {
  const {
    search,
    category,
    price_min,
    price_max,
    rating,
    delivery_days,
    sort,
    page = 1,
    limit = 12,
  } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (search) query.set('search', String(search));
  if (category) query.set('category', String(category));
  if (price_min != null && price_min !== '') query.set('price_min', String(price_min));
  if (price_max != null && price_max !== '') query.set('price_max', String(price_max));
  if (rating != null && rating !== '') query.set('rating', String(rating));
  if (delivery_days != null && delivery_days !== '') {
    query.set('delivery_days', String(delivery_days));
  }
  if (sort) query.set('sort', String(sort));

  const endpoint = `${API_ENDPOINTS.BUYER_SERVICES}?${query.toString()}`;
  console.log('[BuyerServices] Payload >>>', {
    endpoint,
    method: 'GET',
    page,
    limit,
    search: search || null,
    category: category || null,
    sort: sort || null,
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerServices] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerServices] Error response <<<',
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
 * POST /api/v1/buyer/bookings
 * Create a new booking (from service or job)
 * Body: { seller_id, title, amount, service_id?, job_id?, delivery_days?, notes? }
 */
export const createBuyerBookingApi = async (token, payload = {}) => {
  const body = {
    seller_id: Number(payload.seller_id),
    title: String(payload.title || '').trim(),
    amount: Number(payload.amount),
  };
  if (payload.service_id != null && payload.service_id !== '') {
    body.service_id = Number(payload.service_id);
  }
  if (payload.job_id != null && payload.job_id !== '') {
    body.job_id = Number(payload.job_id);
  }
  if (payload.delivery_days != null && payload.delivery_days !== '') {
    body.delivery_days = Number(payload.delivery_days);
  }
  if (payload.notes != null && String(payload.notes).trim()) {
    body.notes = String(payload.notes).trim();
  }

  console.log(
    '[BuyerCreateBooking] Payload >>>',
    JSON.stringify({ endpoint: API_ENDPOINTS.BUYER_BOOKINGS, ...body }, null, 2),
  );

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_BOOKINGS, {
      method: 'POST',
      headers: { Accept: '*/*' },
      body,
      token,
    });
    console.log('[BuyerCreateBooking] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerCreateBooking] Error response <<<',
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
 * GET /api/v1/buyer/bookings/:id
 * Get booking detail
 * Auth header: Bearer token
 */
export const getBuyerBookingByIdApi = async (token, bookingId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}`;
  console.log('[BuyerBookingDetail] Payload >>>', {
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
    console.log('[BuyerBookingDetail] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerBookingDetail] Error response <<<',
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
 * PATCH /api/v1/buyer/bookings/:id/accept
 * Accept completed work (amidst_completion -> completed)
 */
export const acceptBuyerBookingApi = async (token, bookingId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/accept`;
  console.log('[BuyerBookingAccept] Payload >>>', {
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
    console.log('[BuyerBookingAccept] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerBookingAccept] Error response <<<',
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
 * PATCH /api/v1/buyer/bookings/:id/reject
 * Body: { dispute_reason } — optional in API schema (example field); we send when provided
 * Reject submitted work (amidst_completion -> in_dispute)
 */
export const rejectBuyerBookingApi = async (token, bookingId, disputeReason = '') => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/reject`;
  const body = { dispute_reason: String(disputeReason || '').trim() };
  console.log('[BuyerBookingReject] Payload >>>', JSON.stringify({ endpoint, bookingId, ...body }, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      body,
      token,
    });
    console.log('[BuyerBookingReject] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerBookingReject] Error response <<<',
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
 * PATCH /api/v1/buyer/bookings/:id/cancel
 * Body: { cancel_reason } — optional in API schema (example field); we send when provided
 * Cancel a booking (pending or ongoing only)
 */
export const cancelBuyerBookingApi = async (token, bookingId, cancelReason = '') => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/cancel`;
  const body = { cancel_reason: String(cancelReason || '').trim() };
  console.log('[BuyerBookingCancel] Payload >>>', JSON.stringify({ endpoint, bookingId, ...body }, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      body,
      token,
    });
    console.log('[BuyerBookingCancel] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerBookingCancel] Error response <<<',
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
 * POST /api/v1/buyer/reviews
 * Submit a review for a completed booking
 * Body: { booking_id, rating, comment? }
 */
export const createBuyerReviewApi = async (token, payload = {}) => {
  const body = {
    booking_id: Number(payload.booking_id),
    rating: Number(payload.rating),
  };
  if (payload.comment != null && String(payload.comment).trim()) {
    body.comment = String(payload.comment).trim();
  }

  console.log(
    '[BuyerCreateReview] Payload >>>',
    JSON.stringify({ endpoint: API_ENDPOINTS.BUYER_REVIEWS, ...body }, null, 2),
  );

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_REVIEWS, {
      method: 'POST',
      headers: { Accept: '*/*' },
      body,
      token,
    });
    console.log('[BuyerCreateReview] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerCreateReview] Error response <<<',
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
 * GET /api/v1/buyer/reviews?page=1&limit=20
 * List reviews given by this buyer
 */
export const getBuyerReviewsApi = async (token, params = {}) => {
  const { page = 1, limit = 50 } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  const endpoint = `${API_ENDPOINTS.BUYER_REVIEWS}?${query.toString()}`;

  console.log('[BuyerReviews] Payload >>>', {
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
    console.log('[BuyerReviews] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log(
      '[BuyerReviews] Error response <<<',
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
