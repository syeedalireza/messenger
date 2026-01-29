/**
 * @fileoverview Messages service
 * @description Handles message-related business logic
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Message, MessageStatus, MessageType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService,
  ) {}

  /**
   * Create a new message
   * @param userId - Sender user ID
   * @param createMessageDto - Message data
   * @returns Created message
   */
  async createMessage(
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message & { sender: any }> {
    const { chatId, content, messageType, replyToId } = createMessageDto;

    // Check if user is in chat
    const isInChat = await this.chatsService.isUserInChat(chatId, userId);
    if (!isInChat) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content,
        messageType: messageType || MessageType.TEXT,
        replyToId,
        status: MessageStatus.SENT,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    // Update chat's updatedAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Get messages for a chat
   * @param chatId - Chat ID
   * @param userId - User ID for authorization
   * @param limit - Number of messages to fetch
   * @param before - Cursor for pagination (message ID)
   * @returns Array of messages
   */
  async getChatMessages(
    chatId: string,
    userId: string,
    limit: number = 50,
    before?: string,
  ) {
    // Check if user is in chat
    const isInChat = await this.chatsService.isUserInChat(chatId, userId);
    if (!isInChat) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    const whereClause: any = {
      chatId,
      deletedAt: null,
    };

    if (before) {
      const cursorMessage = await this.prisma.message.findUnique({
        where: { id: before },
      });
      if (cursorMessage) {
        whereClause.createdAt = { lt: cursorMessage.createdAt };
      }
    }

    const messages = await this.prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        attachments: true,
        readReceipts: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse();
  }

  /**
   * Update a message
   * @param messageId - Message ID
   * @param userId - User ID for authorization
   * @param updateMessageDto - Update data
   * @returns Updated message
   */
  async updateMessage(
    messageId: string,
    userId: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: updateMessageDto.content,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Delete a message (soft delete)
   * @param messageId - Message ID
   * @param userId - User ID for authorization
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Mark messages as read
   * @param chatId - Chat ID
   * @param userId - User ID
   * @param messageIds - Array of message IDs to mark as read
   */
  async markAsRead(
    chatId: string,
    userId: string,
    messageIds: string[],
  ): Promise<void> {
    // Check if user is in chat
    const isInChat = await this.chatsService.isUserInChat(chatId, userId);
    if (!isInChat) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    // Create read receipts
    const data = messageIds.map((messageId) => ({
      messageId,
      userId,
    }));

    await this.prisma.readReceipt.createMany({
      data,
      skipDuplicates: true,
    });

    // Update message status for messages from other users
    await this.prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        senderId: { not: userId },
        status: { not: MessageStatus.READ },
      },
      data: { status: MessageStatus.READ },
    });
  }

  /**
   * Update message delivery status
   * @param messageIds - Array of message IDs
   * @param status - New status
   */
  async updateMessageStatus(
    messageIds: string[],
    status: MessageStatus,
  ): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        id: { in: messageIds },
      },
      data: { status },
    });
  }

  /**
   * Get message by ID
   * @param messageId - Message ID
   * @returns Message or null
   */
  async getMessageById(messageId: string): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
