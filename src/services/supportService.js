import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from '../constans/Constants';

/**
 * Support = user (buyer/seller) chatting with the Admin team. Ticket-based:
 * the first message opens a ticket; any admin picks it up from a queue.
 * Uses the SAME socket as chat (see socketService) — support messages come
 * back as `supportMessage` / `supportTicketUpdated` events.
 */

const logErr = (label, error) =>
  console.log(`[Support] ${label} Error <<<`, {
    status: error?.status,
    message: error?.message,
    data: error?.data,
  });

/** POST /support/tickets  body { subject?, body, attachment? } → opens a ticket with the first message */
export const createSupportTicketApi = async (token, { subject, body, attachment } = {}) => {
  const payload = { body };
  if (subject) payload.subject = subject;
  if (attachment) payload.attachment = attachment;
  try {
    const response = await apiRequest(API_ENDPOINTS.SUPPORT_TICKETS, { method: 'POST', body: payload, token });
    console.log('[Support] createTicket Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    logErr('createTicket', error);
    throw error;
  }
};

/** GET /support/tickets?page&limit → my tickets (subject, last_message, status, unread_count) */
export const getSupportTicketsApi = async (token, { page = 1, limit = 20 } = {}) => {
  const endpoint = `${API_ENDPOINTS.SUPPORT_TICKETS}?page=${page}&limit=${limit}`;
  try {
    const response = await apiRequest(endpoint, { method: 'GET', token });
    return response;
  } catch (error) {
    logErr('getTickets', error);
    throw error;
  }
};

/** GET /support/tickets/:id */
export const getSupportTicketApi = async (token, ticketId) =>
  apiRequest(`${API_ENDPOINTS.SUPPORT_TICKETS}/${ticketId}`, { method: 'GET', token });

/** GET /support/tickets/:id/messages?page&limit → newest-first (reverse for display) */
export const getSupportMessagesApi = async (token, ticketId, { page = 1, limit = 30 } = {}) => {
  const endpoint = `${API_ENDPOINTS.SUPPORT_TICKETS}/${ticketId}/messages?page=${page}&limit=${limit}`;
  try {
    const response = await apiRequest(endpoint, { method: 'GET', token });
    return response;
  } catch (error) {
    logErr('getMessages', error);
    throw error;
  }
};

/** POST /support/tickets/:id/messages  body { body, attachment? } */
export const sendSupportMessageApi = async (token, ticketId, { body, attachment } = {}) => {
  const payload = { body };
  if (attachment) payload.attachment = attachment;
  try {
    const response = await apiRequest(`${API_ENDPOINTS.SUPPORT_TICKETS}/${ticketId}/messages`, {
      method: 'POST',
      body: payload,
      token,
    });
    return response;
  } catch (error) {
    logErr('sendMessage', error);
    throw error;
  }
};

/** PATCH /support/tickets/:id/read */
export const markSupportTicketReadApi = async (token, ticketId) =>
  apiRequest(`${API_ENDPOINTS.SUPPORT_TICKETS}/${ticketId}/read`, { method: 'PATCH', token });

/** GET /support/unread-count → { count } */
export const getSupportUnreadCountApi = async token =>
  apiRequest(API_ENDPOINTS.SUPPORT_UNREAD_COUNT, { method: 'GET', token });

/** POST /support/upload (multipart field: file) → { url, name, type, size } */
export const uploadSupportAttachmentApi = async (token, file) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || `support_${Date.now()}`,
    type: file.type || 'application/octet-stream',
  });
  return apiRequest(API_ENDPOINTS.SUPPORT_UPLOAD, {
    method: 'POST',
    headers: { Accept: '*/*' },
    body: formData,
    token,
  });
};
