import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSupportUnreadCountApi } from '../../services/supportService';

const extractCount = response => {
  const data = response?.data ?? response;
  const count = data?.count ?? data?.unread_count ?? data?.unreadCount ?? 0;
  const num = Number(count);
  return Number.isFinite(num) ? num : 0;
};

export const fetchSupportUnreadCount = createAsyncThunk('support/fetchUnreadCount', async ({ token }) => {
  if (!token) return 0;
  const response = await getSupportUnreadCountApi(token);
  return extractCount(response);
});

const supportSlice = createSlice({
  name: 'support',
  initialState: { unreadCount: 0 },
  reducers: {
    setSupportUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchSupportUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { setSupportUnreadCount } = supportSlice.actions;
export const selectSupportUnreadCount = state => state.support.unreadCount;
export default supportSlice.reducer;
