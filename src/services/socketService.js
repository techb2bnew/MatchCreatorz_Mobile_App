import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../constans/Constants';

let socket = null;

/**
 * Singleton chat socket. Connect once after login (or on hydrated session),
 * disconnect on logout. Do NOT create a new instance per screen/render.
 */
export const connectSocket = token => {
  if (!token) return null;

  if (socket) {
    if (socket.connected) return socket;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_BASE_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on('connect_error', error => {
    console.log('[Socket] connect_error:', error?.message || error);
  });

  return socket;
};

export const getSocket = () => socket;

export const isSocketConnected = () => Boolean(socket?.connected);

/** Call when the app comes to foreground — reconnects a dropped connection. */
export const reconnectSocketIfNeeded = () => {
  if (socket && !socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
};
