import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../constans/Constants';

export const configureGoogleSignIn = () => {
  const webClientId = GOOGLE_WEB_CLIENT_ID?.trim();

  if (!webClientId) {
    console.warn(
      '[GoogleSignIn] GOOGLE_WEB_CLIENT_ID is empty. Add your Firebase Web client ID in Constants.js',
    );
    return;
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
    scopes: ['email', 'profile'],
  });

  console.log('[GoogleSignIn] Configured');
};

export const signInWithGoogle = async (source = 'login') => {
  const webClientId = GOOGLE_WEB_CLIENT_ID?.trim();

  if (!webClientId) {
    throw new Error('Google Sign-In is not configured. Add GOOGLE_WEB_CLIENT_ID in Constants.js');
  }

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  // Clear any cached Google session first so the account picker shows every
  // time, instead of silently reusing whichever account was picked last.
  try {
    await GoogleSignin.signOut();
  } catch (signOutError) {
    console.warn('[GoogleSignIn] signOut before sign-in failed (ignored):', signOutError);
  }

  const signInResult = await GoogleSignin.signIn();

  if (signInResult.type === 'cancelled') {
    console.log(`[GoogleSignIn] Cancelled (${source})`);
    return { cancelled: true };
  }

  const { user, idToken, serverAuthCode, scopes } = signInResult.data;

  let accessToken = null;
  try {
    const tokens = await GoogleSignin.getTokens();
    accessToken = tokens.accessToken;
  } catch (tokenError) {
    console.warn('[GoogleSignIn] getTokens failed:', tokenError);
  }

  const payload = {
    source,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      givenName: user.givenName,
      familyName: user.familyName,
      photo: user.photo,
    },
    idToken,
    accessToken,
    serverAuthCode,
    scopes,
  };

  console.log('[GoogleSignIn] Success >>>', JSON.stringify(payload, null, 2));

  return {
    cancelled: false,
    ...payload,
  };
};

export const getGoogleSignInErrorMessage = error => {
  if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
    return '';
  }

  if (error?.code === statusCodes.IN_PROGRESS) {
    return 'Google Sign-In is already in progress';
  }

  if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services is not available on this device';
  }

  return error?.message || 'Google Sign-In failed. Please try again.';
};
