import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLOCKED_USERS_KEY } from '../../constans/Constants';

/**
 * Users the current user has blocked. Their jobs, services, profiles, bids,
 * reviews and chats are hidden everywhere in the app the moment they're blocked
 * (App Store guideline 1.2: "should remove it from the user's feed instantly").
 *
 * Persisted on the device so the block survives restarts. The backend has no
 * block endpoint yet — the developer is notified through a support ticket
 * (see moderationService) — so this list is the source of truth for hiding.
 */
const initialState = {
  ids: [],
  hydrated: false,
};

export const hydrateBlockedUsers = createAsyncThunk('blockedUsers/hydrate', async () => {
  const raw = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return Array.isArray(parsed) ? parsed.map(String) : [];
});

const persist = ids => {
  AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(ids)).catch(error => {
    console.log('[BlockedUsers] Failed to persist', error?.message || error);
  });
};

const blockedUsersSlice = createSlice({
  name: 'blockedUsers',
  initialState,
  reducers: {
    blockUser: (state, action) => {
      const id = String(action.payload ?? '').trim();
      if (!id || state.ids.includes(id)) return;
      state.ids.push(id);
      persist(state.ids);
    },
    unblockUser: (state, action) => {
      const id = String(action.payload ?? '').trim();
      state.ids = state.ids.filter(item => item !== id);
      persist(state.ids);
    },
    clearBlockedUsers: state => {
      state.ids = [];
      persist(state.ids);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateBlockedUsers.fulfilled, (state, action) => {
        state.ids = action.payload;
        state.hydrated = true;
      })
      .addCase(hydrateBlockedUsers.rejected, state => {
        state.hydrated = true;
      });
  },
});

export const { blockUser, unblockUser, clearBlockedUsers } = blockedUsersSlice.actions;

export const selectBlockedUserIds = state => state.blockedUsers.ids;
export const selectIsUserBlocked = userId => state =>
  Boolean(userId) && state.blockedUsers.ids.includes(String(userId));

/** Drops anything created by a blocked user from a list. */
export const filterBlocked = (items = [], blockedIds = [], getUserId) => {
  if (!blockedIds.length) return items;
  return items.filter(item => {
    const id = getUserId ? getUserId(item) : item?.userId;
    return !id || !blockedIds.includes(String(id));
  });
};

export default blockedUsersSlice.reducer;
