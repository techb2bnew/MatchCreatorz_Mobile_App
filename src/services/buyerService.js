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

const buildQuestionsPayload = questions =>
  (Array.isArray(questions) ? questions : [])
    .map(q => String(q || '').trim())
    .filter(Boolean)
    .slice(0, 10);

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

  // NOTE: field name unconfirmed — POST /buyer/jobs schema doesn't document an
  // attachments field yet. Included defensively; verify with backend that it's saved.
  if (Array.isArray(form.attachments) && form.attachments.length) {
    payload.attachments = form.attachments;
  }

  const questions = buildQuestionsPayload(form.questions);
  if (questions.length) payload.questions = questions;

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

  // NOTE: field name unconfirmed — see buildCreateJobPayload.
  if (Array.isArray(form.attachments) && form.attachments.length) {
    payload.attachments = form.attachments;
  }

  // Always sent on update — the API replaces the list, so an empty array clears it.
  payload.questions = buildQuestionsPayload(form.questions);

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
 * PATCH /api/v1/buyer/jobs/:id/bids/:bidId/counter
 * Counter a bid with a new amount / delivery (negotiation)
 * Body: { amount (required), delivery_days?, note? }
 * Auth header: Bearer token
 */
export const counterBuyerJobBidApi = async (token, jobId, bidId, form = {}) => {
  const payload = { amount: Number(form.amount) };
  if (form.delivery_days != null && form.delivery_days !== '') {
    payload.delivery_days = Number(form.delivery_days);
  }
  if (form.note != null && String(form.note).trim()) {
    payload.note = String(form.note).trim();
  }

  const endpoint = `${API_ENDPOINTS.BUYER_JOBS}/${jobId}/bids/${bidId}/counter`;
  console.log('[BuyerCounterBid] Payload >>>', JSON.stringify({ endpoint, jobId, bidId, ...payload }, null, 2));

  try {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[BuyerCounterBid] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerCounterBid] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
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
 * POST /api/v1/buyer/jobs/upload
 * Upload job attachment documents to S3 (max 5 files, 10 MB each)
 * Body: multipart/form-data { files: [binary, ...] }
 * Response: { data: [{ url, name }, ...] } (exact shape not confirmed — parsed defensively by caller)
 * Auth header: Bearer token
 */
export const uploadBuyerJobAttachmentsApi = async (token, files = []) => {
  const formData = new FormData();
  files.slice(0, 5).forEach((file, index) => {
    if (!file?.uri) return;
    formData.append('files', {
      uri: file.uri,
      name: file.name || `attachment_${Date.now()}_${index}`,
      type: file.type || 'application/octet-stream',
    });
  });

  console.log('[BuyerJobsUpload] Payload >>>', {
    endpoint: API_ENDPOINTS.BUYER_JOBS_UPLOAD,
    method: 'POST',
    fileCount: files.length,
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_JOBS_UPLOAD, {
      method: 'POST',
      headers: { Accept: '*/*' },
      body: formData,
      token,
    });
    console.log('[BuyerJobsUpload] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerJobsUpload] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
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
 * PATCH /api/v1/buyer/bookings/{id}/pay
 * Pay Now — retry the wallet charge for a whole booking stuck unpaid. No body.
 */
export const payBuyerBookingApi = async (token, bookingId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/pay`;
  console.log('[BuyerBookingPay] Payload >>>', { endpoint, bookingId });
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', headers: { Accept: '*/*' }, token });
    console.log('[BuyerBookingPay] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerBookingPay] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * PATCH /api/v1/buyer/bookings/{id}/milestones/{milestoneId}/accept
 * Accept a submitted milestone — releases that stage's payout. No body.
 */
export const acceptBuyerMilestoneApi = async (token, bookingId, milestoneId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/milestones/${milestoneId}/accept`;
  console.log('[BuyerMilestoneAccept] Payload >>>', { endpoint, bookingId, milestoneId });
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', headers: { Accept: '*/*' }, token });
    console.log('[BuyerMilestoneAccept] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerMilestoneAccept] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * PATCH /api/v1/buyer/bookings/{id}/milestones/{milestoneId}/counter
 * Offer to pay less than the submitted milestone amount.
 * Body: { counter_amount, counter_note? } — counter_amount <= submitted amount.
 */
export const counterBuyerMilestoneApi = async (token, bookingId, milestoneId, { counterAmount, counterNote } = {}) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/milestones/${milestoneId}/counter`;
  const payload = { counter_amount: Number(counterAmount) };
  if (counterNote != null && String(counterNote).trim()) {
    payload.counter_note = String(counterNote).trim();
  }
  console.log('[MilestoneCounter] Payload >>>', JSON.stringify({ endpoint, payload }));
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', body: payload, token });
    console.log('[MilestoneCounter] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[MilestoneCounter] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * POST /api/v1/buyer/bookings/{id}/milestones
 * Split a booking into milestones (buyers can do this too now, and a single
 * milestone is allowed). Body: { milestones: [{ title, amount, duration_days }] }
 * Amounts must add up to booking.amount exactly.
 * 400 → booking not ongoing/in_dispute, hourly booking, already split, or the
 *       amounts don't match (message is user-facing).
 * If the booking is in escrow mode with a hold placed, the backend releases
 * that hold automatically — nothing extra to do here.
 */
export const createBuyerMilestonesApi = async (token, bookingId, milestones) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/milestones`;
  const payload = { milestones };
  console.log('[BuyerMilestonesCreate] Payload >>>', JSON.stringify({ endpoint, payload }));
  try {
    const response = await apiRequest(endpoint, { method: 'POST', body: payload, token });
    console.log('[BuyerMilestonesCreate] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerMilestonesCreate] Error <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * POST /api/v1/buyer/bookings/{id}/escrow/checkout
 * Starts (or retries) the escrow card payment — returns a Stripe Checkout URL.
 * Safe to retry as long as payment_status is still "unpaid".
 * 400 → booking is not in escrow mode, or already paid.
 *
 * NOTE: not documented in swagger yet — path confirmed with the backend team.
 */
export const createEscrowCheckoutApi = async (token, bookingId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}${API_ENDPOINTS.BUYER_ESCROW_CHECKOUT_SUFFIX}`;
  console.log('[EscrowCheckout] Payload >>>', { endpoint, bookingId });
  try {
    const response = await apiRequest(endpoint, { method: 'POST', token });
    console.log('[EscrowCheckout] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[EscrowCheckout] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * GET /api/v1/buyer/bookings/{id}/escrow/confirm
 * Called after returning from Stripe Checkout (webhook fallback) so the hold is
 * recorded even if the webhook is slow.
 */
export const confirmEscrowPaymentApi = async (token, bookingId, sessionId = '') => {
  const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}${API_ENDPOINTS.BUYER_ESCROW_CONFIRM_SUFFIX}${query}`;
  console.log('[EscrowConfirm] Payload >>>', { endpoint, bookingId, sessionId });
  try {
    const response = await apiRequest(endpoint, { method: 'GET', token });
    console.log('[EscrowConfirm] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[EscrowConfirm] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * PATCH /api/v1/buyer/bookings/{id}/work-entries/{entryId}/approve
 * Approve a logged work entry — pays the seller at its full hours.
 * 409 → already processed (duplicate/retry): treat as a soft success, just refresh.
 */
export const approveWorkEntryApi = async (token, bookingId, entryId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/work-entries/${entryId}/approve`;
  console.log('[WorkEntryApprove] Payload >>>', { endpoint, bookingId, entryId });
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', headers: { Accept: '*/*' }, token });
    console.log('[WorkEntryApprove] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[WorkEntryApprove] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * PATCH /api/v1/buyer/bookings/{id}/work-entries/{entryId}/counter
 * Offer to pay for fewer hours than logged. Body: { counter_hours, counter_note? }
 */
export const counterWorkEntryApi = async (token, bookingId, entryId, { counterHours, counterNote } = {}) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/work-entries/${entryId}/counter`;
  const payload = { counter_hours: Number(counterHours) };
  if (counterNote != null && String(counterNote).trim()) {
    payload.counter_note = String(counterNote).trim();
  }
  console.log('[WorkEntryCounter] Payload >>>', JSON.stringify({ endpoint, payload }));
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', body: payload, token });
    console.log('[WorkEntryCounter] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[WorkEntryCounter] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * PATCH /api/v1/buyer/bookings/{id}/work-entries/{entryId}/dispute
 * Escalate just this entry to admin (not the whole booking).
 * Body: { dispute_reason? }
 */
export const disputeWorkEntryApi = async (token, bookingId, entryId, disputeReason = '') => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/work-entries/${entryId}/dispute`;
  const payload = {};
  if (String(disputeReason || '').trim()) payload.dispute_reason = String(disputeReason).trim();
  console.log('[WorkEntryDispute] Payload >>>', JSON.stringify({ endpoint, payload }));
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', body: payload, token });
    console.log('[WorkEntryDispute] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[WorkEntryDispute] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * PATCH /api/v1/buyer/bookings/{id}/milestones/{milestoneId}/reject
 * Reject a submitted milestone (seller can resubmit). Body: { dispute_reason? }
 */
export const rejectBuyerMilestoneApi = async (token, bookingId, milestoneId, disputeReason = '') => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/milestones/${milestoneId}/reject`;
  const body = {};
  if (String(disputeReason || '').trim()) body.dispute_reason = String(disputeReason).trim();
  console.log('[BuyerMilestoneReject] Payload >>>', JSON.stringify({ endpoint, ...body }));
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', body, token });
    console.log('[BuyerMilestoneReject] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerMilestoneReject] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
    throw error;
  }
};

/**
 * PATCH /api/v1/buyer/bookings/{id}/milestones/{milestoneId}/pay
 * Pay Now — retry the charge for a single pending milestone. No body.
 */
export const payBuyerMilestoneApi = async (token, bookingId, milestoneId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_BOOKINGS}/${bookingId}/milestones/${milestoneId}/pay`;
  console.log('[BuyerMilestonePay] Payload >>>', { endpoint, bookingId, milestoneId });
  try {
    const response = await apiRequest(endpoint, { method: 'PATCH', headers: { Accept: '*/*' }, token });
    console.log('[BuyerMilestonePay] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerMilestonePay] Error <<<', { status: error?.status, message: error?.message, data: error?.data });
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

/**
 * GET /api/v1/buyer/notifications?page=1&limit=20&unread_only=
 * Auth header: Bearer token
 */
export const getBuyerNotificationsApi = async (token, params = {}) => {
  const { page = 1, limit = 20, unreadOnly } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (unreadOnly) query.set('unread_only', 'true');

  const endpoint = `${API_ENDPOINTS.BUYER_NOTIFICATIONS}?${query.toString()}`;
  console.log('[BuyerNotifications] Payload >>>', {
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
    console.log('[BuyerNotifications] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerNotifications] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/buyer/notifications/:id/read
 * Auth header: Bearer token
 */
export const markBuyerNotificationReadApi = async (token, notificationId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_NOTIFICATIONS}/${notificationId}/read`;
  console.log('[BuyerNotificationRead] Payload >>>', { endpoint, method: 'PUT', notificationId });

  try {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerNotificationRead] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerNotificationRead] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/buyer/notifications/read-all
 * Auth header: Bearer token
 */
export const markAllBuyerNotificationsReadApi = async token => {
  console.log('[BuyerNotificationsReadAll] Payload >>>', {
    endpoint: API_ENDPOINTS.BUYER_NOTIFICATIONS,
    method: 'PUT',
  });

  try {
    const response = await apiRequest(`${API_ENDPOINTS.BUYER_NOTIFICATIONS}/read-all`, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerNotificationsReadAll] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerNotificationsReadAll] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * DELETE /api/v1/buyer/notifications/:id
 * Auth header: Bearer token
 */
export const deleteBuyerNotificationApi = async (token, notificationId) => {
  const endpoint = `${API_ENDPOINTS.BUYER_NOTIFICATIONS}/${notificationId}`;
  console.log('[BuyerNotificationDelete] Payload >>>', { endpoint, method: 'DELETE', notificationId });

  try {
    const response = await apiRequest(endpoint, {
      method: 'DELETE',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerNotificationDelete] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerNotificationDelete] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/buyer/notifications/unread-count
 * Auth header: Bearer token
 */
export const getBuyerUnreadNotificationsCountApi = async token => {
  const endpoint = `${API_ENDPOINTS.BUYER_NOTIFICATIONS}/unread-count`;
  console.log('[BuyerUnreadCount] Payload >>>', { endpoint, method: 'GET', hasToken: Boolean(token) });

  try {
    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerUnreadCount] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerUnreadCount] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/buyer/preferences
 * Auth header: Bearer token
 */
export const getBuyerPreferencesApi = async token => {
  console.log('[BuyerPreferences] Payload >>>', {
    endpoint: API_ENDPOINTS.BUYER_PREFERENCES,
    method: 'GET',
    hasToken: Boolean(token),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_PREFERENCES, {
      method: 'GET',
      headers: { Accept: '*/*' },
      token,
    });
    console.log('[BuyerPreferences] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerPreferences] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/buyer/preferences
 * Body: { notifications?: {...}, privacy?: {...} } — shallow-merged per group by the backend
 * Auth header: Bearer token
 */
export const updateBuyerPreferencesApi = async (token, payload) => {
  console.log('[BuyerPreferencesUpdate] Payload >>>', JSON.stringify(payload, null, 2));

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_PREFERENCES, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[BuyerPreferencesUpdate] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerPreferencesUpdate] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * PUT /api/v1/buyer/fcm-token
 * Body: { platform: 'mobile', token: <FCM device token> }
 * Auth header: Bearer token
 */
export const registerBuyerFcmTokenApi = async (token, fcmToken) => {
  const payload = { platform: 'mobile', token: fcmToken };
  console.log('[BuyerRegisterFcmToken] Payload >>>', {
    endpoint: API_ENDPOINTS.BUYER_FCM_TOKEN,
    method: 'PUT',
    hasFcmToken: Boolean(fcmToken),
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_FCM_TOKEN, {
      method: 'PUT',
      headers: { Accept: '*/*' },
      body: payload,
      token,
    });
    console.log('[BuyerRegisterFcmToken] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerRegisterFcmToken] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * DELETE /api/v1/buyer/fcm-token
 * Body: { platform: 'mobile' } — clears only the mobile token on logout
 * Auth header: Bearer token
 */
export const clearBuyerFcmTokenApi = async token => {
  console.log('[BuyerClearFcmToken] Payload >>>', {
    endpoint: API_ENDPOINTS.BUYER_FCM_TOKEN,
    method: 'DELETE',
  });

  try {
    const response = await apiRequest(API_ENDPOINTS.BUYER_FCM_TOKEN, {
      method: 'DELETE',
      headers: { Accept: '*/*' },
      body: { platform: 'mobile' },
      token,
    });
    console.log('[BuyerClearFcmToken] Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[BuyerClearFcmToken] Error response <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};
