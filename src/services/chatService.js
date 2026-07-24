import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from '../constans/Constants';

/**
 * POST /api/v1/chat/conversations
 * Body: { recipient_id }
 * Opens (or creates) a 1:1 conversation with another user.
 * Response shape not documented beyond "conversation (existing or newly created)" — parsed defensively by caller.
 */
export const createOrGetConversationApi = async (token, recipientId) => {
  const payload = { recipient_id: recipientId };
  console.log('[Chat] createOrGetConversation Payload >>>', payload);
  try {
    const response = await apiRequest(API_ENDPOINTS.CHAT_CONVERSATIONS, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('[Chat] createOrGetConversation Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[Chat] createOrGetConversation Error <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * GET /api/v1/chat/conversations?page&limit
 * Response shape not documented beyond "paginated conversation list with other_user, last_message, unread_count".
 */
export const getConversationsApi = async (token, { page = 1, limit = 20 } = {}) => {
  const endpoint = `${API_ENDPOINTS.CHAT_CONVERSATIONS}?page=${page}&limit=${limit}`;
  try {
    const response = await apiRequest(endpoint, { method: 'GET', token });
    console.log('[Chat] getConversations Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[Chat] getConversations Error <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/** GET /api/v1/chat/conversations/{id} */
export const getConversationApi = async (token, conversationId) =>
  apiRequest(`${API_ENDPOINTS.CHAT_CONVERSATIONS}/${conversationId}`, { method: 'GET', token });

/** DELETE /api/v1/chat/conversations/{id} — archives it for me only */
export const archiveConversationApi = async (token, conversationId) =>
  apiRequest(`${API_ENDPOINTS.CHAT_CONVERSATIONS}/${conversationId}`, { method: 'DELETE', token });

/**
 * GET /api/v1/chat/conversations/{id}/messages?page&limit
 * Response shape not documented beyond "paginated messages (newest first)".
 */
export const getConversationMessagesApi = async (token, conversationId, { page = 1, limit = 30 } = {}) => {
  const endpoint = `${API_ENDPOINTS.CHAT_CONVERSATIONS}/${conversationId}/messages?page=${page}&limit=${limit}`;
  try {
    const response = await apiRequest(endpoint, { method: 'GET', token });
    console.log('[Chat] getConversationMessages Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[Chat] getConversationMessages Error <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/**
 * POST /api/v1/chat/conversations/{id}/messages
 * Body: { body, attachment?: { url, name } }
 * REST fallback — backend also emits this over a socket for real-time delivery.
 */
export const sendChatMessageApi = async (token, conversationId, { body, attachment } = {}) => {
  const payload = { body };
  if (attachment) payload.attachment = attachment;

  try {
    const response = await apiRequest(`${API_ENDPOINTS.CHAT_CONVERSATIONS}/${conversationId}/messages`, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('[Chat] sendMessage Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('[Chat] sendMessage Error <<<', {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

/** PATCH /api/v1/chat/conversations/{id}/read */
export const markConversationReadApi = async (token, conversationId) =>
  apiRequest(`${API_ENDPOINTS.CHAT_CONVERSATIONS}/${conversationId}/read`, { method: 'PATCH', token });

/** GET /api/v1/chat/unread-count — { count } */
export const getChatUnreadCountApi = async token => apiRequest(API_ENDPOINTS.CHAT_UNREAD_COUNT, { method: 'GET', token });

/**
 * POST /api/v1/chat/upload (multipart/form-data, field: file)
 * Response: { url, name, type }
 */
export const uploadChatAttachmentApi = async (token, file) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || `chat_${Date.now()}`,
    type: file.type || 'application/octet-stream',
  });

  return apiRequest(API_ENDPOINTS.CHAT_UPLOAD, {
    method: 'POST',
    headers: { Accept: '*/*' },
    body: formData,
    token,
  });
};
