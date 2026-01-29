/**
 * @fileoverview Search Service
 * @description Manages search indexing and querying with MeiliSearch
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;
  private messagesIndex = 'messages';
  private usersIndex = 'users';
  private chatsIndex = 'chats';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const host = this.configService.get<string>('MEILISEARCH_HOST') || 'http://meilisearch:7700';
    const apiKey = this.configService.get<string>('MEILISEARCH_MASTER_KEY') || '';

    this.client = new MeiliSearch({
      host,
      apiKey,
    });
  }

  async onModuleInit() {
    await this.setupIndexes();
  }

  /**
   * Setup MeiliSearch indexes with configuration
   */
  private async setupIndexes(): Promise<void> {
    try {
      // Messages index
      await this.client.createIndex(this.messagesIndex, { primaryKey: 'id' });
      const messagesIdx = this.client.index(this.messagesIndex);
      await messagesIdx.updateSettings({
        searchableAttributes: ['content', 'senderName'],
        filterableAttributes: ['chatId', 'senderId', 'messageType', 'createdAt'],
        sortableAttributes: ['createdAt'],
      });

      // Users index
      await this.client.createIndex(this.usersIndex, { primaryKey: 'id' });
      const usersIdx = this.client.index(this.usersIndex);
      await usersIdx.updateSettings({
        searchableAttributes: ['username', 'displayName', 'email'],
        filterableAttributes: ['isOnline', 'createdAt'],
      });

      // Chats index
      await this.client.createIndex(this.chatsIndex, { primaryKey: 'id' });
      const chatsIdx = this.client.index(this.chatsIndex);
      await chatsIdx.updateSettings({
        searchableAttributes: ['name'],
        filterableAttributes: ['isGroup', 'updatedAt'],
        sortableAttributes: ['updatedAt'],
      });

      this.logger.log('MeiliSearch indexes configured successfully');
    } catch (error) {
      this.logger.warn(`MeiliSearch setup: ${error.message}`);
    }
  }

  /**
   * Index a message
   * @param message - Message object
   */
  async indexMessage(message: any): Promise<void> {
    try {
      const index = this.client.index(this.messagesIndex);
      await index.addDocuments([{
        id: message.id,
        content: message.content,
        chatId: message.chatId,
        senderId: message.senderId,
        senderName: message.sender?.displayName || message.sender?.username,
        messageType: message.messageType,
        createdAt: message.createdAt.getTime(),
      }]);
    } catch (error) {
      this.logger.error(`Error indexing message: ${error.message}`);
    }
  }

  /**
   * Index a user
   * @param user - User object
   */
  async indexUser(user: any): Promise<void> {
    try {
      const index = this.client.index(this.usersIndex);
      await index.addDocuments([{
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        isOnline: user.isOnline,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.getTime(),
      }]);
    } catch (error) {
      this.logger.error(`Error indexing user: ${error.message}`);
    }
  }

  /**
   * Search messages
   * @param query - Search query
   * @param chatId - Optional chat ID filter
   * @param limit - Max results
   * @returns Search results
   */
  async searchMessages(query: string, chatId?: string, limit = 20): Promise<any[]> {
    try {
      const index = this.client.index(this.messagesIndex);
      const filter = chatId ? `chatId = ${chatId}` : undefined;
      
      const results = await index.search(query, {
        filter,
        limit,
        sort: ['createdAt:desc'],
      });

      return results.hits;
    } catch (error) {
      this.logger.error(`Error searching messages: ${error.message}`);
      return [];
    }
  }

  /**
   * Search users
   * @param query - Search query
   * @param limit - Max results
   * @returns Search results
   */
  async searchUsers(query: string, limit = 10): Promise<any[]> {
    try {
      const index = this.client.index(this.usersIndex);
      
      const results = await index.search(query, {
        limit,
      });

      return results.hits;
    } catch (error) {
      this.logger.error(`Error searching users: ${error.message}`);
      return [];
    }
  }

  /**
   * Search chats
   * @param query - Search query
   * @param limit - Max results
   * @returns Search results
   */
  async searchChats(query: string, limit = 10): Promise<any[]> {
    try {
      const index = this.client.index(this.chatsIndex);
      
      const results = await index.search(query, {
        limit,
        sort: ['updatedAt:desc'],
      });

      return results.hits;
    } catch (error) {
      this.logger.error(`Error searching chats: ${error.message}`);
      return [];
    }
  }

  /**
   * Global search across all indexes
   * @param query - Search query
   * @returns Combined search results
   */
  async globalSearch(query: string): Promise<{
    messages: any[];
    users: any[];
    chats: any[];
  }> {
    const [messages, users, chats] = await Promise.all([
      this.searchMessages(query, undefined, 10),
      this.searchUsers(query, 5),
      this.searchChats(query, 5),
    ]);

    return { messages, users, chats };
  }

  /**
   * Delete message from index
   * @param messageId - Message ID
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const index = this.client.index(this.messagesIndex);
      await index.deleteDocument(messageId);
    } catch (error) {
      this.logger.error(`Error deleting message from index: ${error.message}`);
    }
  }

  /**
   * Bulk index messages (for initial setup)
   * @param chatId - Optional chat ID to index
   */
  async bulkIndexMessages(chatId?: string): Promise<void> {
    try {
      const messages = await this.prisma.message.findMany({
        where: chatId ? { chatId } : {},
        include: {
          sender: {
            select: {
              displayName: true,
              username: true,
            },
          },
        },
        take: 10000, // Index in batches
      });

      const documents = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        chatId: msg.chatId,
        senderId: msg.senderId,
        senderName: msg.sender.displayName || msg.sender.username,
        messageType: msg.messageType,
        createdAt: msg.createdAt.getTime(),
      }));

      const index = this.client.index(this.messagesIndex);
      await index.addDocuments(documents);

      this.logger.log(`Indexed ${documents.length} messages`);
    } catch (error) {
      this.logger.error(`Error bulk indexing messages: ${error.message}`);
    }
  }
}
<!-- meili -->
