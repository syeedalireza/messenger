/**
 * @fileoverview Message input component
 * @description Input field with send button and typing indicator
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { sendMessage, startTyping, stopTyping } from '@/lib/socket';
import { generateTempId, debounce, cn } from '@/lib/utils';

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const { user } = useAuthStore();
  const { addOptimisticMessage } = useChatStore();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Debounced stop typing
  const debouncedStopTyping = useCallback(
    debounce(() => {
      stopTyping(chatId);
      setIsTyping(false);
    }, 2000),
    [chatId]
  );

  const handleTyping = () => {
    if (!isTyping) {
      startTyping(chatId);
      setIsTyping(true);
    }
    debouncedStopTyping();
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !user) return;

    const tempId = generateTempId();

    // Optimistic update
    const optimisticMessage = {
      id: '',
      chatId,
      senderId: user.id,
      content: trimmedMessage,
      messageType: 'TEXT',
      status: 'SENDING',
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      tempId,
    };

    addOptimisticMessage(optimisticMessage);

    // Send through socket
    sendMessage(chatId, trimmedMessage, tempId);

    // Clear input
    setMessage('');
    stopTyping(chatId);
    setIsTyping(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
          <Paperclip className="w-5 h-5 text-light-muted dark:text-dark-muted" />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-10 rounded-2xl resize-none',
              'bg-light-bg dark:bg-dark-bg',
              'text-light-text dark:text-dark-text',
              'placeholder-light-muted dark:placeholder-dark-muted',
              'border border-light-border dark:border-dark-border',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'max-h-[150px]'
            )}
          />

          {/* Emoji button */}
          <button className="absolute right-3 bottom-3 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text">
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={cn(
            'p-3 rounded-full transition-colors',
            message.trim()
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-light-border dark:bg-dark-border text-light-muted dark:text-dark-muted'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
