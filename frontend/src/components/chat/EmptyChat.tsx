/**
 * @fileoverview Empty chat component
 * @description Displayed when no chat is selected
 */

'use client';

import { MessageCircle } from 'lucide-react';

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg p-8">
      <div className="w-24 h-24 bg-primary-500/10 dark:bg-primary-500/20 rounded-full flex items-center justify-center mb-6">
        <MessageCircle className="w-12 h-12 text-primary-500" />
      </div>
      <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-2">
        Welcome to Messenger
      </h2>
      <p className="text-light-muted dark:text-dark-muted text-center max-w-md">
        Select a conversation from the sidebar or start a new chat to begin messaging
      </p>
    </div>
  );
}
