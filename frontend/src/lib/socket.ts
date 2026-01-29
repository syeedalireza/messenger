/**
 * @fileoverview Socket.io client
 * @description WebSocket connection management for real-time features
 */

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost';

let socket: Socket | null = null;

/**
 * Initialize socket connection
 */
export const initializeSocket = (): Socket | null => {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    console.warn('No token available for socket connection');
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  // Message events
  socket.on('message:new', (message) => {
    const store = useChatStore.getState();
    const currentUser = useAuthStore.getState().user;

    // Don't add if it's our own message (handled by optimistic update)
    if (message.senderId !== currentUser?.id) {
      store.addMessage(message);
    }
  });

  socket.on('message:sent', ({ tempId, message }) => {
    useChatStore.getState().confirmOptimisticMessage(tempId, message);
  });

  socket.on('message:error', ({ tempId, error }) => {
    console.error('Message send error:', error);
    // Could mark message as failed
  });

  socket.on('message:read', ({ chatId, userId, messageIds }) => {
    // Update read status in store
    messageIds.forEach((messageId: string) => {
      useChatStore.getState().updateMessage(messageId, { status: 'READ' });
    });
  });

  // Typing events
  socket.on('typing:update', ({ chatId, userId, isTyping }) => {
    const store = useChatStore.getState();
    const chat = store.chats.find((c) => c.id === chatId);
    const participant = chat?.participants.find((p) => p.userId === userId);

    if (participant) {
      store.setTypingUser(
        {
          chatId,
          userId,
          username: participant.user.displayName || participant.user.username,
        },
        isTyping
      );
    }
  });

  // Presence events
  socket.on('presence:update', ({ userId, status }) => {
    useChatStore.getState().updateUserPresence(userId, status === 'online');
  });

  // Heartbeat to keep presence alive
  const heartbeatInterval = setInterval(() => {
    if (socket?.connected) {
      socket.emit('presence:heartbeat');
    }
  }, 30000);

  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Send message through socket
 */
export const sendMessage = (
  chatId: string,
  content: string,
  tempId: string,
  replyToId?: string
): void => {
  socket?.emit('message:send', {
    chatId,
    content,
    tempId,
    replyToId,
  });
};

/**
 * Start typing indicator
 */
export const startTyping = (chatId: string): void => {
  socket?.emit('typing:start', { chatId });
};

/**
 * Stop typing indicator
 */
export const stopTyping = (chatId: string): void => {
  socket?.emit('typing:stop', { chatId });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = (chatId: string, messageIds: string[]): void => {
  socket?.emit('message:read', { chatId, messageIds });
};

/**
 * Join a chat room
 */
export const joinChat = (chatId: string): void => {
  socket?.emit('chat:join', { chatId });
};

/**
 * Leave a chat room
 */
export const leaveChat = (chatId: string): void => {
  socket?.emit('chat:leave', { chatId });
};

export default socket;
