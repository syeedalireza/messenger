/**
 * @fileoverview Chat list item component
 * @description Individual chat item in the sidebar
 */

'use client';

import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Avatar } from '@/components/ui/Avatar';
import {
  cn,
  formatChatTime,
  getChatDisplayName,
  getChatAvatar,
  truncateText,
} from '@/lib/utils';

interface ChatListItemProps {
  chat: {
    id: string;
    name: string | null;
    isGroup: boolean;
    avatarUrl: string | null;
    participants: Array<{
      userId: string;
      user: {
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        isOnline?: boolean;
      };
    }>;
    lastMessage?: {
      content: string | null;
      createdAt: string;
      sender: {
        id: string;
        username: string;
        displayName: string | null;
      };
    } | null;
    updatedAt: string;
  };
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const { user } = useAuthStore();
  const { activeChat, setActiveChat } = useChatStore();

  const isActive = activeChat?.id === chat.id;
  const displayName = getChatDisplayName(chat, user?.id || '');
  const avatarUrl = getChatAvatar(chat, user?.id || '');

  // Get online status for direct chats
  const otherParticipant = !chat.isGroup
    ? chat.participants.find((p) => p.userId !== user?.id)
    : null;
  const isOnline = otherParticipant?.user.isOnline;

  // Format last message
  const lastMessageText = chat.lastMessage?.content
    ? truncateText(chat.lastMessage.content, 40)
    : 'No messages yet';

  const lastMessageSender =
    chat.lastMessage && chat.isGroup
      ? chat.lastMessage.sender.id === user?.id
        ? 'You'
        : chat.lastMessage.sender.displayName || chat.lastMessage.sender.username
      : null;

  return (
    <button
      onClick={() => setActiveChat(chat as any)}
      className={cn(
        'w-full px-4 py-3 flex items-center gap-3 transition-colors text-left',
        isActive
          ? 'bg-primary-500/10 dark:bg-primary-500/20'
          : 'hover:bg-light-bg dark:hover:bg-dark-bg'
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar
          src={avatarUrl}
          name={displayName}
          size="lg"
          isGroup={chat.isGroup}
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-light-card dark:border-dark-card rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              'font-semibold truncate',
              isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-light-text dark:text-dark-text'
            )}
          >
            {displayName}
          </h3>
          <span className="text-xs text-light-muted dark:text-dark-muted ml-2 flex-shrink-0">
            {formatChatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
          </span>
        </div>
        <p className="text-sm text-light-muted dark:text-dark-muted truncate mt-0.5">
          {lastMessageSender && (
            <span className="font-medium">{lastMessageSender}: </span>
          )}
          {lastMessageText}
        </p>
      </div>
    </button>
  );
}
