import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { USER_ROLES } from '../../constans/Constants';
import { getBuyerUnreadNotificationsCountApi } from '../../services/buyerService';
import { getSellerUnreadNotificationsCountApi } from '../../services/sellerService';
import { setAppBadgeCount } from '../../services/notificationService';

const extractUnreadCount = response => {
  const data = response?.data ?? response;
  const count = data?.unread_count ?? data?.unreadCount ?? data?.count ?? 0;
  const num = Number(count);
  return Number.isFinite(num) ? num : 0;
};

export const fetchUnreadNotificationsCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async ({ token, role }) => {
    if (!token) {
      await setAppBadgeCount(0);
      return 0;
    }

    const response =
      role === USER_ROLES.CREATOR
        ? await getSellerUnreadNotificationsCountApi(token)
        : await getBuyerUnreadNotificationsCountApi(token);

    const count = extractUnreadCount(response);
    await setAppBadgeCount(count);
    return count;
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { unreadCount: 0 },
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchUnreadNotificationsCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { setUnreadCount } = notificationsSlice.actions;
export const selectUnreadNotificationsCount = state => state.notifications.unreadCount;
export default notificationsSlice.reducer;
