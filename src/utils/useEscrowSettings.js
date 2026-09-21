import { useEffect, useState } from 'react';
import { ESCROW_HOLD_DAYS_FALLBACK } from '../constans/Constants';
import { getWalletConfigApi } from '../services/walletService';

/**
 * Platform-wide escrow settings, from GET /wallet/config:
 *   hold_payments_enabled — the admin's "Delayed Payments" toggle. When off,
 *     "Pay & Hold" must not be offered (the backend forces 'direct' anyway).
 *   escrow_hold_days — how long an uncaptured hold may sit before Stripe's
 *     authorisation is cancelled. Shown to the buyer as the hold terms.
 *
 * These change rarely, so the first successful fetch is cached for the whole
 * app session and every later caller reads it without another request.
 */
let cache = null;
let inFlight = null;

const DEFAULTS = { holdEnabled: false, holdDays: ESCROW_HOLD_DAYS_FALLBACK };

const parse = response => {
  const data = response?.data ?? response ?? {};
  const days = Number(data.escrow_hold_days);
  return {
    holdEnabled: data.hold_payments_enabled === true,
    holdDays: Number.isFinite(days) && days > 0 ? days : ESCROW_HOLD_DAYS_FALLBACK,
  };
};

export const useEscrowSettings = token => {
  const [settings, setSettings] = useState(cache || DEFAULTS);

  useEffect(() => {
    if (!token || cache) return undefined;
    let cancelled = false;
    // One request even if several screens mount at once.
    inFlight = inFlight || getWalletConfigApi(token).then(parse);
    inFlight
      .then(value => {
        cache = value;
        if (!cancelled) setSettings(value);
      })
      // Config is optional — on failure "Pay & Hold" just isn't offered, which
      // matches what the backend does when Delayed Payments is off.
      .catch(() => {})
      .finally(() => {
        inFlight = null;
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return settings;
};

/** Forces the next useEscrowSettings() call to refetch (e.g. after re-login). */
export const resetEscrowSettingsCache = () => {
  cache = null;
  inFlight = null;
};
