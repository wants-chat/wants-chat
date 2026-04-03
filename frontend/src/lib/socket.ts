/**
 * Socket.io client for wants.chat
 * Follows fluxez-app pattern for WebSocket connections
 */

import { io, Socket } from 'socket.io-client';

// Token storage key - matches fluxez pattern
const ACCESS_TOKEN_KEY = 'accessToken';

let socketInstance: Socket | null = null;

/**
 * Get the socket URL from environment or default
 */
const getSocketUrl = (): string => {
  return import.meta.env.VITE_SOCKET_URL ||
         import.meta.env.VITE_API_URL?.replace('/api/v1', '') ||
         'http://localhost:3188';
};

/**
 * Initialize the main socket connection
 * @param token Optional JWT token for authentication
 */
export const initSocket = (token?: string): Socket => {
  if (!socketInstance) {
    const socketUrl = getSocketUrl();

    socketInstance = io(socketUrl, {
      auth: {
        token: token || localStorage.getItem(ACCESS_TOKEN_KEY),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socketInstance;
};

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => {
  return socketInstance;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Chat namespace socket instance
 */
let chatSocketInstance: Socket | null = null;

/**
 * Initialize the chat namespace socket connection
 * @param token Optional JWT token for authentication
 */
export const initChatSocket = (token?: string): Socket => {
  if (!chatSocketInstance) {
    const socketUrl = getSocketUrl();

    console.log('Connecting to chat socket:', socketUrl + '/chat');

    chatSocketInstance = io(socketUrl + '/chat', {
      auth: {
        token: token || localStorage.getItem(ACCESS_TOKEN_KEY),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return chatSocketInstance;
};

/**
 * Get the current chat socket instance
 */
export const getChatSocket = (): Socket | null => {
  return chatSocketInstance;
};

/**
 * Disconnect the chat socket
 */
export const disconnectChatSocket = (): void => {
  if (chatSocketInstance) {
    chatSocketInstance.disconnect();
    chatSocketInstance = null;
  }
};
