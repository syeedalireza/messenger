/**
 * @fileoverview Chat store
 * @description Zustand store for managing chat state
 */

import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  messageType: string;
  status: string;
  createdAt: string;
  editedAt?: string | null;
  sender: User;
  replyTo?: {
    id: string;
    content: string | null;
    sender: User;
  } | null;
  tempId?: string;
}

interface ChatParticipant {
  id: string;
  userId: string;
  role: string;
  user: User;
}

interface Chat {
  id: string;
  name: string | null;
  isGroup: boolean;
  avatarUrl: string | null;
  participants: ChatParticipant[];
  lastMessage?: Message | null;
  updatedAt: string;
}

interface TypingUser {
  chatId: string;
  userId: string;
  username: string;
}

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
}

interface ChatActions {
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string, chatId: string) => void;
  addOptimisticMessage: (message: Message) => void;
  confirmOptimisticMessage: (tempId: string, message: Message) => void;
  setTypingUser: (user: TypingUser, isTyping: boolean) => void;
  updateUserPresence: (userId: string, isOnline: boolean) => void;
  setLoadingChats: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  clearChat: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: [],
  isLoadingChats: false,
  isLoadingMessages: false,

  // Actions
  setChats: (chats) => set({ chats }),

  setActiveChat: (chat) => set({ activeChat: chat }),

  addChat: (chat) => {
    const { chats } = get();
    const exists = chats.find((c) => c.id === chat.id);
    if (!exists) {
      set({ chats: [chat, ...chats] });
    }
  },

  updateChat: (chatId, updates) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
      activeChat:
        state.activeChat?.id === chatId
          ? { ...state.activeChat, ...updates }
          : state.activeChat,
    }));
  },

  setMessages: (chatId, messages) => {
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    }));
  },

  addMessage: (message) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];
      const exists = chatMessages.find((m) => m.id === message.id);
      
      if (exists) return state;

      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message],
        },
        chats: state.chats.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
            : chat
        ),
      };
    });
  },

  updateMessage: (messageId, updates) => {
    set((state) => {
      const newMessages = { ...state.messages };
      
      for (const chatId in newMessages) {
        newMessages[chatId] = newMessages[chatId].map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
      }

      return { messages: newMessages };
    });
  },

  removeMessage: (messageId, chatId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId]?.filter((m) => m.id !== messageId) || [],
      },
    }));
  },

  addOptimisticMessage: (message) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];
      
      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message],
        },
      };
    });
  },

  confirmOptimisticMessage: (tempId, message) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];
      
      return {
        messages: {
          ...state.messages,
          [message.chatId]: chatMessages.map((msg) =>
            msg.tempId === tempId ? message : msg
          ),
        },
        chats: state.chats.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
            : chat
        ),
      };
    });
  },

  setTypingUser: (user, isTyping) => {
    set((state) => {
      if (isTyping) {
        const exists = state.typingUsers.find(
          (u) => u.chatId === user.chatId && u.userId === user.userId
        );
        if (exists) return state;
        return { typingUsers: [...state.typingUsers, user] };
      } else {
        return {
          typingUsers: state.typingUsers.filter(
            (u) => !(u.chatId === user.chatId && u.userId === user.userId)
          ),
        };
      }
    });
  },

  updateUserPresence: (userId, isOnline) => {
    set((state) => ({
      chats: state.chats.map((chat) => ({
        ...chat,
        participants: chat.participants.map((p) =>
          p.userId === userId ? { ...p, user: { ...p.user, isOnline } } : p
        ),
      })),
      activeChat: state.activeChat
        ? {
            ...state.activeChat,
            participants: state.activeChat.participants.map((p) =>
              p.userId === userId ? { ...p, user: { ...p.user, isOnline } } : p
            ),
          }
        : null,
    }));
  },

  setLoadingChats: (loading) => set({ isLoadingChats: loading }),

  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),

  clearChat: () =>
    set({
      chats: [],
      activeChat: null,
      messages: {},
      typingUsers: [],
    }),
}));
