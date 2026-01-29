/**
 * @fileoverview Auth provider component
 * @description Handles authentication state and socket connection
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { initializeSocket, disconnectSocket } from '@/lib/socket';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { clearChat } = useChatStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Initialize socket connection when authenticated
      initializeSocket();
    } else {
      // Disconnect socket and clear chat state when logged out
      disconnectSocket();
      clearChat();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken, clearChat]);

  return <>{children}</>;
}
