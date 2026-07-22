import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTH_ROLE_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  ERROR_REGISTER_FAILED,
  USER_ROLES,
  mapApiRoleToAppRole,
} from '../../constans/Constants';
import { getApiErrorMessage } from '../../services/apiClient';
import { registerUserApi, logoutUserApi } from '../../services/authService';
import { clearBuyerFcmTokenApi } from '../../services/buyerService';
import { clearSellerFcmTokenApi } from '../../services/sellerService';
import { setAppBadgeCount } from '../../services/notificationService';

const AUTH_STORAGE_KEYS = [AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_ROLE_KEY];

const initialState = {
  token: null,
  user: null,
  role: null, // app role: buyer | creator
  loading: false,
  hydrated: false,
  error: null,
  _pendingSession: null,
};

const persistSession = async ({ token, user, role }) => {
  const entries = {};
  if (token) entries[AUTH_TOKEN_KEY] = String(token);
  if (user) entries[AUTH_USER_KEY] = JSON.stringify(user);
  if (role) entries[AUTH_ROLE_KEY] = String(role);

  if (!Object.keys(entries).length) return;

  // AsyncStorage v3: setMany / getMany / removeMany (multiSet removed)
  if (typeof AsyncStorage.setMany === 'function') {
    await AsyncStorage.setMany(entries);
    return;
  }

  if (typeof AsyncStorage.setItem !== 'function') {
    throw new Error('AsyncStorage.setItem is not available');
  }

  await Promise.all(
    Object.entries(entries).map(([key, value]) => AsyncStorage.setItem(key, value)),
  );
};

const clearPersistedSession = async () => {
  try {
    if (typeof AsyncStorage.removeMany === 'function') {
      await AsyncStorage.removeMany(AUTH_STORAGE_KEYS);
      return;
    }

    await Promise.all(AUTH_STORAGE_KEYS.map(key => AsyncStorage.removeItem(key)));
  } catch (error) {
    console.log('[Auth] Failed to clear session', error?.message || error);
  }
};

const readPersistedSession = async () => {
  try {
    if (typeof AsyncStorage.getMany === 'function') {
      const values = await AsyncStorage.getMany(AUTH_STORAGE_KEYS);
      return {
        token: values[AUTH_TOKEN_KEY] || null,
        userRaw: values[AUTH_USER_KEY] || null,
        roleRaw: values[AUTH_ROLE_KEY] || null,
      };
    }

    const [token, userRaw, roleRaw] = await Promise.all(
      AUTH_STORAGE_KEYS.map(key => AsyncStorage.getItem(key)),
    );
    return { token, userRaw, roleRaw };
  } catch (error) {
    console.log('[Auth] Failed to read session', error?.message || error);
    return { token: null, userRaw: null, roleRaw: null };
  }
};

const normalizeSession = (token, user, roleOverride) => {
  const apiRole = roleOverride || user?.role || null;
  const appRole = apiRole ? mapApiRoleToAppRole(apiRole) : null;
  return {
    token: token || null,
    user: user || null,
    role: appRole,
  };
};

export const hydrateSession = createAsyncThunk('auth/hydrateSession', async () => {
  const { token, userRaw, roleRaw } = await readPersistedSession();

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  if (!token) {
    return { token: null, user: null, role: null };
  }

  return normalizeSession(token, user, roleRaw || user?.role);
});

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await registerUserApi(payload);

      if (!response?.success) {
        return rejectWithValue(getApiErrorMessage(response, ERROR_REGISTER_FAILED));
      }

      // No token / session save on register — approval + login flow handles that later.
      return {
        message: response?.message || 'Registered successfully',
        user: response?.data?.user || null,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error?.data, error?.message || ERROR_REGISTER_FAILED));
    }
  },
);

/** Persist session after successful login */
export const setAuthSession = createAsyncThunk('auth/setAuthSession', async ({ token, user, role }) => {
  const session = normalizeSession(token, user, role || user?.role);
  await persistSession(session);
  console.log('[Auth] Session persisted', {
    hasToken: Boolean(session.token),
    role: session.role,
    userId: session.user?.id,
  });
  return session;
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { getState }) => {
  const token = getState()?.auth?.token;
  const role = getState()?.auth?.role;

  if (token) {
    try {
      const clearFcmTokenApi = role === USER_ROLES.CREATOR ? clearSellerFcmTokenApi : clearBuyerFcmTokenApi;
      await clearFcmTokenApi(token);
    } catch (error) {
      console.log('[Logout] Failed to clear push token', error?.message || error);
    }

    try {
      await logoutUserApi(token);
    } catch (error) {
      // Still clear local session even if API logout fails
      console.log('[Logout] API failed, clearing local session anyway', error?.message || error);
    }
  }

  await setAppBadgeCount(0);
  await clearPersistedSession();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.hydrated = true;
      })
      .addCase(hydrateSession.rejected, state => {
        state.token = null;
        state.user = null;
        state.role = null;
        state.hydrated = true;
      })
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, state => {
        state.loading = false;
        state.error = null;
        state._pendingSession = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || ERROR_REGISTER_FAILED;
        state._pendingSession = null;
      })
      .addCase(setAuthSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.error = null;
        state._pendingSession = null;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.token = null;
        state.user = null;
        state.role = null;
        state.error = null;
        state.loading = false;
        state._pendingSession = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const selectAuth = state => state.auth;
export const selectIsAuthenticated = state => Boolean(state.auth.token);
export const selectAppRole = state => state.auth.role;
export const selectPendingSession = state => state.auth._pendingSession;
export default authSlice.reducer;
