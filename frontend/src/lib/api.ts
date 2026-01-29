/**
 * @fileoverview API client
 * @description Axios instance with interceptors for authentication
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

/**
 * Create and configure Axios instance
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Request interceptor - adds auth token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handles token refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshAccessToken();
        
        // Retry original request with new token
        const token = useAuthStore.getState().accessToken;
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API helper functions
 */
export const apiHelper = {
  /**
   * Get user chats
   */
  getChats: () => api.get('/chats'),

  /**
   * Get chat by ID
   */
  getChat: (chatId: string) => api.get(`/chats/${chatId}`),

  /**
   * Create direct chat
   */
  createChat: (participantId: string) =>
    api.post('/chats', { participantId }),

  /**
   * Create group chat
   */
  createGroupChat: (name: string, participantIds: string[]) =>
    api.post('/chats/group', { name, participantIds }),

  /**
   * Get messages for a chat
   */
  getMessages: (chatId: string, limit?: number, before?: string) =>
    api.get(`/messages/chat/${chatId}`, { params: { limit, before } }),

  /**
   * Send message
   */
  sendMessage: (chatId: string, content: string, replyToId?: string) =>
    api.post('/messages', { chatId, content, replyToId }),

  /**
   * Search users
   */
  searchUsers: (query: string) =>
    api.get('/users/search', { params: { q: query } }),

  /**
   * Get user profile
   */
  getUserProfile: (userId: string) => api.get(`/users/${userId}`),

  /**
   * Update profile
   */
  updateProfile: (data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
    api.put('/users/me', data),
};

export default api;
