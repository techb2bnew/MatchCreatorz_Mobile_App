import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from '../constans/Constants';

/**
 * Stripe-based wallet. Top-up / connects-purchase / payout-onboarding all return a
 * hosted Stripe URL that must be opened in a browser; after the user returns we call
 * the matching /confirm endpoint (with the session_id) to settle the balance.
 */

const logErr = (label, error) =>
  console.log(`[Wallet] ${label} Error <<<`, {
    status: error?.status,
    message: error?.message,
    data: error?.data,
  });

/** GET /wallet/config → { publishable key, fee %, min withdrawal, currency } */
export const getWalletConfigApi = async token => {
  try {
    return await apiRequest(API_ENDPOINTS.WALLET_CONFIG, { method: 'GET', token });
  } catch (error) {
    logErr('config', error);
    throw error;
  }
};

/** GET /wallet → { balance, pending, totals } */
export const getWalletSummaryApi = async token => {
  try {
    return await apiRequest(API_ENDPOINTS.WALLET, { method: 'GET', token });
  } catch (error) {
    logErr('summary', error);
    throw error;
  }
};

/**
 * GET /wallet/transactions?page&limit&type&search
 * `type` is a WalletTransaction type (e.g. 'escrow_hold') — the backend filters
 * on it exactly, so an unknown value returns an empty list rather than an error.
 */
export const getWalletTransactionsApi = async (token, { page = 1, limit = 20, type, search } = {}) => {
  const params = [`page=${page}`, `limit=${limit}`];
  if (type) params.push(`type=${encodeURIComponent(type)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  const endpoint = `${API_ENDPOINTS.WALLET_TRANSACTIONS}?${params.join('&')}`;
  try {
    return await apiRequest(endpoint, { method: 'GET', token });
  } catch (error) {
    logErr('transactions', error);
    throw error;
  }
};

/** POST /wallet/topup { amount, success_url?, cancel_url? } → { url, session_id } */
export const startWalletTopupApi = async (token, { amount, successUrl, cancelUrl } = {}) => {
  const body = { amount: Number(amount) };
  if (successUrl) body.success_url = successUrl;
  if (cancelUrl) body.cancel_url = cancelUrl;
  try {
    const response = await apiRequest(API_ENDPOINTS.WALLET_TOPUP, { method: 'POST', body, token });
    console.log('[Wallet] topup Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    logErr('topup', error);
    throw error;
  }
};

/** GET /wallet/topup/confirm?session_id= → credit result */
export const confirmWalletTopupApi = async (token, sessionId) => {
  const endpoint = `${API_ENDPOINTS.WALLET_TOPUP_CONFIRM}?session_id=${encodeURIComponent(sessionId)}`;
  try {
    return await apiRequest(endpoint, { method: 'GET', token });
  } catch (error) {
    logErr('topupConfirm', error);
    throw error;
  }
};

/** POST /wallet/withdraw { amount } — seller, pending admin approval */
export const requestWithdrawalApi = async (token, amount) => {
  try {
    return await apiRequest(API_ENDPOINTS.WALLET_WITHDRAW, {
      method: 'POST',
      body: { amount: Number(amount) },
      token,
    });
  } catch (error) {
    logErr('withdraw', error);
    throw error;
  }
};

/** GET /wallet/withdrawals — seller's withdrawal requests */
export const getWithdrawalsApi = async (token, { page = 1, limit = 20 } = {}) => {
  const endpoint = `${API_ENDPOINTS.WALLET_WITHDRAWALS}?page=${page}&limit=${limit}`;
  try {
    return await apiRequest(endpoint, { method: 'GET', token });
  } catch (error) {
    logErr('withdrawals', error);
    throw error;
  }
};

/** POST /wallet/connect/onboard → { url } (seller Stripe Connect onboarding) */
export const startConnectOnboardingApi = async token => {
  try {
    const response = await apiRequest(API_ENDPOINTS.WALLET_CONNECT_ONBOARD, { method: 'POST', token });
    console.log('[Wallet] connectOnboard Response <<<', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    logErr('connectOnboard', error);
    throw error;
  }
};

/** GET /wallet/connect/status → seller payout status */
export const getConnectStatusApi = async token => {
  try {
    return await apiRequest(API_ENDPOINTS.WALLET_CONNECT_STATUS, { method: 'GET', token });
  } catch (error) {
    logErr('connectStatus', error);
    throw error;
  }
};
