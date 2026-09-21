import { TXN_TYPE_HOLD, TXN_TYPE_LABELS, TXN_TYPE_PAYMENT } from '../constans/Constants';

/**
 * Wallet transaction rows, shared by the buyer and seller wallet screens.
 *
 * The backend returns the raw WalletTransaction model, so there's no ready-made
 * description — the type has to be turned into a label here, and `note` carries
 * whatever free text the backend wrote ("Hold placed by buyer for booking #12").
 */

const num = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** The backend has paginated under several keys over time — accept all of them. */
export const extractTxnList = response => {
  const d = response?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.transactions)) return d.transactions;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(response?.transactions)) return response.transactions;
  return [];
};

const formatTxnDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Which types count as money coming IN differs by side: a buyer's refund is a
 * credit, a seller's earning is. Everything else is an outgoing movement.
 */
const CREDIT_PATTERNS = {
  buyer: /credit|topup|top_up|refund|deposit|reversal|in\b/,
  seller: /credit|earning|payout_in|refund|reversal|in\b/,
};

/**
 * @param t    raw WalletTransaction row
 * @param role 'buyer' | 'seller' — decides what reads as a credit
 */
export const mapWalletTxn = (t, { role = 'buyer' } = {}) => {
  const amount = num(t?.amount ?? t?.value);
  const rawType = String(t?.type || t?.direction || '').toLowerCase();
  // escrow_hold / escrow_payment are informational receipts of a card payment
  // that never moved the wallet balance: they're written with amount 0, so the
  // credit/debit arrow and the +/- prefix would both be meaningless on them.
  const isRecord = rawType === TXN_TYPE_HOLD || rawType === TXN_TYPE_PAYMENT;
  const isCredit = rawType
    ? (CREDIT_PATTERNS[role] || CREDIT_PATTERNS.buyer).test(rawType)
    : amount >= 0;
  const bookingId = t?.booking_id ?? t?.bookingId;
  const label = TXN_TYPE_LABELS[rawType] || (isCredit ? 'Credit' : 'Debit');
  const note = String(t?.note || t?.description || '').trim();

  // Fee breakdown, present wherever the backend knows it. It reconciles as
  //   gross = platform fee + Stripe fee + net to seller
  // and buyer and seller see the SAME numbers for the same settlement, so a
  // $500 payment and a $425 earning line up against one shared breakdown.
  const hasGross = t?.gross_amount != null || t?.grossAmount != null;
  const gross = hasGross ? num(t?.gross_amount ?? t?.grossAmount) : null;
  const platformFee = t?.platform_fee ?? t?.platformFee;
  const stripeFee = t?.stripe_fee ?? t?.stripeFee;

  return {
    id: String(t?.id ?? t?._id ?? `${t?.created_at}-${amount}`),
    // The backend's own line ("Hold placed by buyer for booking #12 — Logo")
    // says more than the bare type, so it leads when it's there.
    title: note || label,
    typeLabel: label,
    date: formatTxnDate(t?.created_at || t?.createdAt || t?.date),
    bookingId: bookingId == null ? '' : String(bookingId),
    /**
     * What this row moved. Escrow receipts are stored with amount 0 because the
     * money went through Stripe, not the wallet — for those the gross actually
     * paid is the meaningful figure. Everything else uses its real amount: a
     * seller's earning is the NET they received, never the gross.
     */
    amount: amount !== 0 ? Math.abs(amount) : num(gross),
    gross,
    platformFee: platformFee == null ? null : num(platformFee),
    stripeFee: stripeFee == null ? null : num(stripeFee),
    net: gross == null ? null : num(gross) - num(platformFee) - num(stripeFee),
    hasBreakdown: gross != null,
    status: String(t?.status || '').toLowerCase(),
    rawType,
    isHold: rawType === TXN_TYPE_HOLD,
    isRecord,
    // A card payment leaves the buyer's pocket even though the wallet balance
    // never changes, so it reads as outgoing like a debit does.
    type: amount < 0 || rawType === TXN_TYPE_PAYMENT ? 'debit' : isCredit ? 'credit' : 'debit',
  };
};
