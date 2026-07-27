import { useCallback, useEffect, useRef } from 'react';
import { AppState, Linking } from 'react-native';

/**
 * Stripe Checkout helper (no deep link needed).
 * Opens the hosted Stripe URL in the device browser, then when the user returns to
 * the app (AppState → 'active') calls `onReturn(sessionId)` once so the caller can
 * hit the matching /confirm endpoint and refresh balances.
 *
 * Usage:
 *   const runCheckout = useStripeCheckout(async sessionId => {
 *     await confirmTopupApi(token, sessionId);
 *     refreshWallet();
 *   });
 *   runCheckout(url, session_id);
 */
export const useStripeCheckout = onReturn => {
  const pendingRef = useRef(null); // { sessionId }
  const onReturnRef = useRef(onReturn);

  useEffect(() => {
    onReturnRef.current = onReturn;
  }, [onReturn]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && pendingRef.current) {
        const { sessionId } = pendingRef.current;
        pendingRef.current = null;
        // small delay so the app is fully foregrounded before the network call
        setTimeout(() => onReturnRef.current?.(sessionId), 400);
      }
    });
    return () => sub.remove();
  }, []);

  return useCallback(async (url, sessionId) => {
    if (!url) return;
    pendingRef.current = sessionId ? { sessionId } : null;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      pendingRef.current = null;
    }
  }, []);
};
