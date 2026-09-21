/**
 * Escrow payment mode — an optional layer on top of the existing wallet flow.
 *
 * wallet mode (default): the buyer's pre-funded wallet is debited the moment
 * they accept. No card, no redirect.
 *
 * escrow mode: the buyer pays by card through Stripe Checkout instead — the
 * wallet is never touched. payment_mode is fixed when the booking is created
 * and never changes.
 *
 * Within escrow mode the buyer picks HOW to pay, per booking / milestone /
 * work entry, the first time they accept:
 *
 *   direct — charged and released to the seller straight away.
 *   hold   — "Pay & Hold": the card is authorised (manual capture) but nothing
 *            is taken. Accepting a second time captures it and pays the seller;
 *            cancelling the hold releases the authorisation with no charge.
 *
 * "Pay & Hold" only exists while the admin's Delayed Payments toggle is on
 * (wallet config -> hold_payments_enabled); the backend enforces this too.
 */

const str = value => String(value ?? '').trim().toLowerCase();

export const PAYMENT_MODES = { WALLET: 'wallet', ESCROW: 'escrow' };
export const PAYMENT_TYPES = { DIRECT: 'direct', HOLD: 'hold' };

export const getPaymentMode = booking =>
  str(booking?.payment_mode ?? booking?.paymentMode) || PAYMENT_MODES.WALLET;

export const isEscrowBooking = booking => getPaymentMode(booking) === PAYMENT_MODES.ESCROW;

export const getPaymentStatus = booking =>
  str(booking?.payment_status ?? booking?.paymentStatus);

/** 'direct' | 'hold' | '' — only set once the buyer has chosen at accept time. */
export const getPaymentType = booking =>
  str(booking?.payment_type ?? booking?.paymentType);

/**
 * Escrow booking the buyer can pay for RIGHT NOW → show "Complete payment".
 *
 * Every booking is created escrow + unpaid and stays that way while the seller
 * works, so "unpaid" alone is not a prompt to pay — payment happens when the
 * seller has submitted and the booking is awaiting the buyer's acceptance.
 * Prompting any earlier would ask the buyer to pay for work that hasn't been
 * delivered (and milestone / hourly bookings are paid per stage, never as a
 * whole, so they're excluded here too).
 */
export const needsEscrowPayment = (booking, { hasMilestones = false, isHourly = false } = {}) =>
  isEscrowBooking(booking) &&
  getPaymentStatus(booking) === 'unpaid' &&
  !hasMilestones &&
  !isHourly &&
  /amidst|await|review/.test(str(booking?.status));

/** Money is authorised on the card but not captured → releasable or cancellable. */
export const isEscrowHeld = booking =>
  isEscrowBooking(booking) && getPaymentStatus(booking) === 'held';

/**
 * Milestones and work entries carry their own payment_status/payment_type, so
 * the same check works for them — but they have no payment_mode of their own,
 * which lives on the parent booking.
 */
export const isHoldHeld = item =>
  getPaymentStatus(item) === 'held' && getPaymentType(item) === PAYMENT_TYPES.HOLD;

/** Unpaid escrow item → the buyer still has to choose direct vs hold. */
export const needsPaymentChoice = (booking, item = booking) =>
  isEscrowBooking(booking) && getPaymentStatus(item) === 'unpaid';

/**
 * Backend rejects an accept on an escrow booking whose payment is missing with a
 * 400 — that's the cue to send the buyer to checkout instead of showing an error.
 */
export const isEscrowPaymentRequiredError = error => {
  if (error?.status !== 400) return false;
  const message = str(error?.message) + ' ' + str(error?.data?.message);
  return message.includes('escrow') && /complete|payment|first|pending/.test(message);
};

/**
 * An accept/approve response carrying `escrow: true` means nothing was settled
 * yet — the buyer has to pay first. No `escrow` key at all means it settled
 * normally (wallet mode, or a hold being captured on the second accept).
 *
 * The backend serves two Stripe session shapes from the same endpoints: hosted
 * (`checkout_url`, opened directly) and embedded (`client_secret`, mounted via
 * Stripe.js). StripeCheckoutScreen handles both, so callers just pass whichever
 * one came back.
 */
export const extractEscrowCheckout = response => {
  const data = response?.data ?? response ?? {};
  const flagged = data.escrow === true || response?.escrow === true;
  const url = data.checkout_url || data.checkoutUrl || response?.checkout_url || '';
  const clientSecret = data.client_secret || data.clientSecret || '';
  if (!flagged && !url && !clientSecret) return null;
  return {
    checkoutUrl: String(url || ''),
    clientSecret: String(clientSecret || ''),
    sessionId: data.session_id || data.sessionId || '',
    payable: Boolean(url || clientSecret),
  };
};
