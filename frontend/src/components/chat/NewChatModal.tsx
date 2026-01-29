/**
 * @fileoverview New chat modal component
 * @description Modal for creating new direct or group chats
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, UserPlus, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { apiHelper } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { cn, debounce } from '@/lib/utils';

interface NewChatModalProps {
  onClose: () => void;
}

interface SearchUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isOnline: boolean;
}

export function NewChatModal({ onClose }: NewChatModalProps) {
  const { user } = useAuthStore();
  const { addChat, setActiveChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [mode, setMode] = useState<'search' | 'group'>('search');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);

  // Search users
  useEffect(() => {
    const search = debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await apiHelper.searchUsers(query);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    search(searchQuery);
  }, [searchQuery]);

  const handleStartChat = async (targetUser: SearchUser) => {
    try {
      setIsCreating(true);
      const response = await apiHelper.createChat(targetUser.id);
      const chat = response.data;
      addChat(chat);
      setActiveChat(chat);
      onClose();
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleUser = (targetUser: SearchUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === targetUser.id);
      if (exists) {
        return prev.filter((u) => u.id !== targetUser.id);
      }
      return [...prev, targetUser];
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      setIsCreating(true);
      const response = await apiHelper.createGroupChat(
        groupName.trim(),
        selectedUsers.map((u) => u.id)
      );
      const chat = response.data;
      addChat(chat);
      setActiveChat(chat);
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md mx-4 bg-light-card dark:bg-dark-card rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
            {mode === 'search' ? 'New Chat' : 'New Group'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg"
          >
            <X className="w-5 h-5 text-light-muted dark:text-dark-muted" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex p-2 gap-2 border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => setMode('search')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors',
              mode === 'search'
                ? 'bg-primary-500 text-white'
                : 'text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg'
            )}
          >
            <UserPlus className="w-4 h-4" />
            Direct
          </button>
          <button
            onClick={() => setMode('group')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors',
              mode === 'group'
                ? 'bg-primary-500 text-white'
                : 'text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg'
            )}
          >
            <Users className="w-4 h-4" />
            Group
          </button>
        </div>

        {/* Group name input */}
        {mode === 'group' && (
          <div className="p-4 border-b border-light-border dark:border-dark-border">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-light-bg dark:bg-dark-bg',
                'border border-light-border dark:border-dark-border',
                'text-light-text dark:text-dark-text',
                'placeholder-light-muted dark:placeholder-dark-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          </div>
        )}

        {/* Selected users for group */}
        {mode === 'group' && selectedUsers.length > 0 && (
          <div className="p-4 border-b border-light-border dark:border-dark-border">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 rounded-full"
                >
                  <span className="text-sm text-primary-600 dark:text-primary-400">
                    {u.displayName || u.username}
                  </span>
                  <button
                    onClick={() => handleToggleUser(u)}
                    className="text-primary-500 hover:text-primary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search input */}
        <div className="p-4 border-b border-light-border dark:border-dark-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted dark:text-dark-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
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

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-light-muted dark:text-dark-muted">
              {searchQuery.length < 2
                ? 'Type to search users'
                : 'No users found'}
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((searchUser) => {
                const isSelected = selectedUsers.some((u) => u.id === searchUser.id);
                
                return (
                  <button
                    key={searchUser.id}
                    onClick={() =>
                      mode === 'search'
                        ? handleStartChat(searchUser)
                        : handleToggleUser(searchUser)
                    }
                    disabled={isCreating}
                    className={cn(
                      'w-full px-4 py-3 flex items-center gap-3 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors',
                      isSelected && 'bg-primary-500/10'
                    )}
                  >
                    <div className="relative">
                      <Avatar
                        src={searchUser.avatarUrl}
                        name={searchUser.displayName || searchUser.username}
                        size="md"
                      />
                      {searchUser.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-light-card dark:border-dark-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-light-text dark:text-dark-text">
                        {searchUser.displayName || searchUser.username}
                      </h3>
                      <p className="text-sm text-light-muted dark:text-dark-muted">
                        @{searchUser.username}
                      </p>
                    </div>
                    {mode === 'group' && isSelected && (
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create group button */}
        {mode === 'group' && (
          <div className="p-4 border-t border-light-border dark:border-dark-border">
            <button
              onClick={handleCreateGroup}
              disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
              className={cn(
                'w-full py-3 px-4 rounded-xl font-medium text-white',
                'bg-primary-500 hover:bg-primary-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors flex items-center justify-center gap-2'
              )}
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Create Group ({selectedUsers.length} members)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
