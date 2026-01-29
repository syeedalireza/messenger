/**
 * @fileoverview Chat page
 * @description Main chat interface with sidebar and message area
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { apiHelper } from '@/lib/api';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { EmptyChat } from '@/components/chat/EmptyChat';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { activeChat, setChats, setLoadingChats } = useChatStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      if (!isAuthenticated) return;

      try {
        setLoadingChats(true);
        const response = await apiHelper.getChats();
        setChats(response.data);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };

    loadChats();
  }, [isAuthenticated, setChats, setLoadingChats]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="animate-pulse text-light-muted dark:text-dark-muted">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex bg-light-bg dark:bg-dark-bg">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Main chat area */}
      <div className="flex-1 flex">
        {activeChat ? <ChatArea /> : <EmptyChat />}
      </div>
    </div>
  );
}
