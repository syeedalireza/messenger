/**
 * @fileoverview Chat header component
 * @description Header with chat info and actions
 */

'use client';

import { ArrowLeft, Phone, Video, MoreVertical, Users } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Avatar } from '@/components/ui/Avatar';
import {
  getChatDisplayName,
  getChatAvatar,
  formatLastSeen,
} from '@/lib/utils';

interface ChatHeaderProps {
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
        lastSeenAt?: string | null;
      };
    }>;
  };
  currentUserId: string;
}

export function ChatHeader({ chat, currentUserId }: ChatHeaderProps) {
  const { setActiveChat, typingUsers } = useChatStore();

  const displayName = getChatDisplayName(chat, currentUserId);
  const avatarUrl = getChatAvatar(chat, currentUserId);

  // Get status for direct chats
  const otherParticipant = !chat.isGroup
    ? chat.participants.find((p) => p.userId !== currentUserId)
    : null;
  const isOnline = otherParticipant?.user.isOnline;
  const lastSeen = otherParticipant?.user.lastSeenAt;

  // Check if someone is typing
  const typingInChat = typingUsers.filter(
    (t) => t.chatId === chat.id && t.userId !== currentUserId
  );
  const isTyping = typingInChat.length > 0;

  // Get status text
  const getStatusText = () => {
    if (isTyping) {
      const names = typingInChat.map((t) => t.username).join(', ');
      return `${names} ${typingInChat.length === 1 ? 'is' : 'are'} typing...`;
    }

    if (chat.isGroup) {
      return `${chat.participants.length} members`;
    }

    if (isOnline) {
      return 'online';
    }

    return formatLastSeen(lastSeen || null);
  };

  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
      {/* Back button (mobile) */}
      <button
        onClick={() => setActiveChat(null)}
        className="lg:hidden p-2 -ml-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg"
      >
        <ArrowLeft className="w-5 h-5 text-light-text dark:text-dark-text" />
      </button>

      {/* Avatar */}
      <div className="relative">
        <Avatar
          src={avatarUrl}
          name={displayName}
          size="md"
          isGroup={chat.isGroup}
        />
        {isOnline && !chat.isGroup && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-light-card dark:border-dark-card rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-light-text dark:text-dark-text truncate">
          {displayName}
        </h2>
        <p
          className={`text-sm truncate ${
            isTyping || isOnline
              ? 'text-primary-500'
              : 'text-light-muted dark:text-dark-muted'
          }`}
        >
          {getStatusText()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
          <Phone className="w-5 h-5 text-light-muted dark:text-dark-muted" />
        </button>
        <button className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
          <Video className="w-5 h-5 text-light-muted dark:text-dark-muted" />
        </button>
        <button className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
          <MoreVertical className="w-5 h-5 text-light-muted dark:text-dark-muted" />
        </button>
      </div>
    </div>
  );
}
