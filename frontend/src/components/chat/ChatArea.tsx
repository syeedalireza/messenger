/**
 * @fileoverview Chat area component
 * @description Main messaging area with header, messages, and input
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { apiHelper } from '@/lib/api';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Loader2 } from 'lucide-react';

export function ChatArea() {
  const { user } = useAuthStore();
  const {
    activeChat,
    messages,
    setMessages,
    isLoadingMessages,
    setLoadingMessages,
  } = useChatStore();
  const loadedChatsRef = useRef<Set<string>>(new Set());

  // Load messages when active chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat || loadedChatsRef.current.has(activeChat.id)) {
        return;
      }

      try {
        setLoadingMessages(true);
        const response = await apiHelper.getMessages(activeChat.id);
        setMessages(activeChat.id, response.data);
        loadedChatsRef.current.add(activeChat.id);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeChat, setMessages, setLoadingMessages]);

  if (!activeChat) return null;

  const chatMessages = messages[activeChat.id] || [];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <ChatHeader chat={activeChat} currentUserId={user?.id || ''} />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <MessageList
            messages={chatMessages}
            currentUserId={user?.id || ''}
          />
        )}
      </div>

      {/* Input */}
      <MessageInput chatId={activeChat.id} />
    </div>
  );
}
<!-- ui -->
