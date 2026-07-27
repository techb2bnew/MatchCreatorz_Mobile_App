import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';
import chatReducer from './slices/chatSlice';
import supportReducer from './slices/supportSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    support: supportReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
