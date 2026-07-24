import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getChatUnreadCountApi } from '../../services/chatService';

const extractUnreadCount = response => {
  const data = response?.data ?? response;
  const count = data?.count ?? data?.unread_count ?? data?.unreadCount ?? 0;
  const num = Number(count);
  return Number.isFinite(num) ? num : 0;
};

export const fetchChatUnreadCount = createAsyncThunk('chat/fetchUnreadCount', async ({ token }) => {
  if (!token) return 0;
  const response = await getChatUnreadCountApi(token);
  return extractUnreadCount(response);
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: { unreadCount: 0 },
  reducers: {
    setChatUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchChatUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { setChatUnreadCount } = chatSlice.actions;
export const selectChatUnreadCount = state => state.chat.unreadCount;
export default chatSlice.reducer;
