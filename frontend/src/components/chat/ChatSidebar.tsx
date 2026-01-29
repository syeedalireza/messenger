/**
 * @fileoverview Chat sidebar component
 * @description Displays list of chats with search and new chat options
 */

'use client';

import { useState } from 'react';
import {
  Search,
  Settings,
  Moon,
  Sun,
  LogOut,
  Plus,
  MessageCircle,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useThemeStore } from '@/store/themeStore';
import { ChatListItem } from './ChatListItem';
import { NewChatModal } from './NewChatModal';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export function ChatSidebar() {
  const { user, logout } = useAuthStore();
  const { chats, isLoadingChats } = useChatStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (chat.isGroup) {
      return chat.name?.toLowerCase().includes(query);
    }
    
    return chat.participants.some(
      (p) =>
        p.user.username.toLowerCase().includes(query) ||
        p.user.displayName?.toLowerCase().includes(query)
    );
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="w-80 lg:w-96 h-full flex flex-col border-r border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
        {/* Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.avatarUrl}
                name={user?.displayName || user?.username}
                size="md"
              />
              <div>
                <h2 className="font-semibold text-light-text dark:text-dark-text">
                  {user?.displayName || user?.username}
                </h2>
                <p className="text-sm text-light-muted dark:text-dark-muted">
                  @{user?.username}
                </p>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
              >
                <Settings className="w-5 h-5 text-light-muted dark:text-dark-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card rounded-xl shadow-lg border border-light-border dark:border-dark-border py-2 z-50">
                  <button
                    onClick={toggleTheme}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-light-bg dark:hover:bg-dark-bg text-light-text dark:text-dark-text"
                  >
                    {resolvedTheme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                    <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-light-bg dark:hover:bg-dark-bg text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted dark:text-dark-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl',
                'bg-light-bg dark:bg-dark-bg',
                'border border-light-border dark:border-dark-border',
                'text-light-text dark:text-dark-text',
                'placeholder-light-muted dark:placeholder-dark-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-light-border dark:bg-dark-border" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-light-border dark:bg-dark-border rounded" />
                    <div className="h-3 w-32 bg-light-border dark:bg-dark-border rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageCircle className="w-12 h-12 text-light-muted dark:text-dark-muted mb-3" />
              <p className="text-light-muted dark:text-dark-muted">
                {searchQuery ? 'No chats found' : 'No conversations yet'}
              </p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start a chat
              </button>
            </div>
          ) : (
            <div className="py-2">
              {filteredChats.map((chat) => (
                <ChatListItem key={chat.id} chat={chat} />
              ))}
            </div>
          )}
        </div>

        {/* New chat button */}
        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <button
            onClick={() => setShowNewChat(true)}
            className={cn(
              'w-full py-3 px-4 rounded-xl font-medium',
              'bg-primary-500 text-white',
              'hover:bg-primary-600 transition-colors',
              'flex items-center justify-center gap-2'
            )}
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>
      </div>

      {/* New chat modal */}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
<!-- sidebar -->
