/**
 * @fileoverview Message list component
 * @description Displays messages with auto-scroll and grouping
 */

'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { format, isSameDay } from 'date-fns';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  messageType: string;
  status: string;
  createdAt: string;
  editedAt?: string | null;
  sender: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  replyTo?: {
    id: string;
    content: string | null;
    sender: {
      id: string;
      username: string;
      displayName: string | null;
    };
  } | null;
  tempId?: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
      return groups;
    },
    {} as Record<string, Message[]>
  );

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
      return 'Today';
    }
    if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-4 space-y-4"
    >
      {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          {/* Date header */}
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 bg-light-border dark:bg-dark-border rounded-full text-xs text-light-muted dark:text-dark-muted">
              {formatDateHeader(dateKey)}
            </span>
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {dateMessages.map((message, index) => {
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const nextMessage =
                index < dateMessages.length - 1
                  ? dateMessages[index + 1]
                  : null;

              const isFirstInGroup =
                !prevMessage || prevMessage.senderId !== message.senderId;
              const isLastInGroup =
                !nextMessage || nextMessage.senderId !== message.senderId;

              return (
                <MessageBubble
                  key={message.id || message.tempId}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-light-muted dark:text-dark-muted">
          No messages yet. Start the conversation!
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
