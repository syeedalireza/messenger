/**
 * @fileoverview Message bubble component
 * @description Individual message display with status and reply
 */

'use client';

import { Check, CheckCheck, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatMessageTime } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string | null;
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
  };
  isOwn: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleProps) {
  const isPending = !!message.tempId && !message.id;

  // Status icon
  const StatusIcon = () => {
    if (isPending) {
      return <Clock className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />;
    }

    switch (message.status) {
      case 'READ':
        return <CheckCheck className="w-3.5 h-3.5 text-primary-500" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />;
      case 'SENT':
        return <Check className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex gap-2 animate-fade-in',
        isOwn ? 'justify-end' : 'justify-start',
        !isLastInGroup && 'mb-0.5'
      )}
    >
      {/* Avatar (for others' messages) */}
      {!isOwn && (
        <div className="w-8 flex-shrink-0">
          {isLastInGroup && (
            <Avatar
              src={message.sender.avatarUrl}
              name={message.sender.displayName || message.sender.username}
              size="sm"
            />
          )}
        </div>
      )}

      {/* Message content */}
      <div
        className={cn(
          'max-w-[70%] lg:max-w-[60%]',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name (for group chats) */}
        {!isOwn && isFirstInGroup && (
          <p className="text-xs font-medium text-primary-500 mb-1 ml-3">
            {message.sender.displayName || message.sender.username}
          </p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div
            className={cn(
              'px-3 py-2 mb-1 rounded-t-xl border-l-2 border-primary-500',
              isOwn
                ? 'bg-primary-600/20 dark:bg-primary-500/10'
                : 'bg-light-border/50 dark:bg-dark-border/50'
            )}
          >
            <p className="text-xs font-medium text-primary-500">
              {message.replyTo.sender.displayName ||
                message.replyTo.sender.username}
            </p>
            <p className="text-xs text-light-muted dark:text-dark-muted truncate">
              {message.replyTo.content || 'Message'}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'px-4 py-2 relative',
            isOwn
              ? 'bg-primary-500 text-white'
              : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border',
            // Rounded corners
            isFirstInGroup && isLastInGroup
              ? isOwn
                ? 'rounded-2xl rounded-br-md'
                : 'rounded-2xl rounded-bl-md'
              : isFirstInGroup
                ? isOwn
                  ? 'rounded-2xl rounded-br-md'
                  : 'rounded-2xl rounded-bl-md'
                : isLastInGroup
                  ? isOwn
                    ? 'rounded-2xl rounded-tr-md'
                    : 'rounded-2xl rounded-tl-md'
                  : isOwn
                    ? 'rounded-2xl rounded-r-md'
                    : 'rounded-2xl rounded-l-md',
            isPending && 'opacity-70'
          )}
        >
          {/* Content */}
          <p
            className={cn(
              'text-sm whitespace-pre-wrap break-words',
              isOwn
                ? 'text-white'
                : 'text-light-text dark:text-dark-text'
            )}
          >
            {message.content}
          </p>

          {/* Time and status */}
          <div
            className={cn(
              'flex items-center justify-end gap-1 mt-1 -mb-1',
              isOwn ? 'text-white/70' : 'text-light-muted dark:text-dark-muted'
            )}
          >
            {message.editedAt && (
              <span className="text-[10px]">edited</span>
            )}
            <span className="text-[10px]">
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && <StatusIcon />}
          </div>
        </div>
      </div>
    </div>
  );
}
<!-- bubble -->
