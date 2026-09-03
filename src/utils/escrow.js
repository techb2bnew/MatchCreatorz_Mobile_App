/**
 * Escrow payment mode — an optional layer on top of the existing wallet flow.
 *
 * wallet mode (default): the buyer's pre-funded wallet is debited the moment
 * they accept. No card, no redirect.
 *
 * escrow mode: the buyer's card is charged through Stripe Checkout instead —
 * the wallet is never touched. Fixed-price bookings authorise a hold right
 * after the booking is created and capture it on accept; milestone bookings
 * take one charge per milestone at accept time.
 *
 * payment_mode is fixed when the booking is created and never changes.
 * Hourly bookings are always wallet — escrow only applies to fixed-price and
 * milestone bookings.
 */

const str = value => String(value ?? '').trim().toLowerCase();

export const PAYMENT_MODES = { WALLET: 'wallet', ESCROW: 'escrow' };

export const getPaymentMode = booking =>
  str(booking?.payment_mode ?? booking?.paymentMode) || PAYMENT_MODES.WALLET;

export const isEscrowBooking = booking => getPaymentMode(booking) === PAYMENT_MODES.ESCROW;

export const getPaymentStatus = booking =>
  str(booking?.payment_status ?? booking?.paymentStatus);

/** Escrow booking whose card hold hasn't been placed yet → show "Complete payment". */
export const needsEscrowPayment = booking =>
  isEscrowBooking(booking) && getPaymentStatus(booking) === 'unpaid';

/** Hold is placed (money authorised, not captured) → show "Escrow protected". */
export const isEscrowHeld = booking =>
  isEscrowBooking(booking) && getPaymentStatus(booking) === 'held';

/**
 * Backend rejects an accept on an escrow booking whose hold is missing with a
 * 400 — that's the cue to send the buyer to checkout instead of showing an error.
 */
export const isEscrowPaymentRequiredError = error => {
  if (error?.status !== 400) return false;
  const message = str(error?.message) + ' ' + str(error?.data?.message);
  return message.includes('escrow') && /complete|payment|first|pending/.test(message);
};

/**
 * A milestone accept response carrying `escrow: true` means nothing was settled
 * yet — the buyer has to pay through the returned checkout_url. No `escrow` key
 * at all means it settled normally from the wallet.
 */
export const extractEscrowCheckout = response => {
  const data = response?.data ?? response ?? {};
  const flagged = data.escrow === true || response?.escrow === true;
  const url = data.checkout_url || data.checkoutUrl || response?.checkout_url || '';
  if (!flagged && !url) return null;
  return { checkoutUrl: String(url || ''), sessionId: data.session_id || data.sessionId || '' };
};
