import { Platform } from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';

/**
 * Native "Sign in with Apple" (iOS only).
 * Returns the credential we'd send to the backend: identityToken + nonce + user info.
 * For now the caller just console.logs this; backend /auth/apple wiring comes later.
 */
export const signInWithApple = async () => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS.');
  }
  if (!appleAuth.isSupported) {
    // Requires iOS 13+
    throw new Error('Apple Sign-In is not supported on this device (needs iOS 13+).');
  }

  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  // Confirm the credential is still authorized.
  const credentialState = await appleAuth.getCredentialStateForUser(response.user);

  const result = {
    identityToken: response.identityToken,
    authorizationCode: response.authorizationCode,
    nonce: response.nonce,
    user: response.user, // stable Apple user id
    email: response.email, // only returned on first sign-in
    fullName: response.fullName, // only returned on first sign-in
    realUserStatus: response.realUserStatus,
    credentialState, // 1 = AUTHORIZED
  };

  console.log('[AppleSignIn] SUCCESS >>>', JSON.stringify(result, null, 2));
  return result;
};
