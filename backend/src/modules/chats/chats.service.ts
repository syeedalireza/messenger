/**
 * @fileoverview Chats service
 * @description Handles chat-related business logic
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Chat, ChatParticipant, ChatRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Get all chats for a user
   * @param userId - User ID
   * @returns Array of chats with last message
   */
  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get online status for all participants
    const allUserIds = new Set<string>();
    chats.forEach((chat) => {
      chat.participants.forEach((p) => allUserIds.add(p.userId));
    });

    const presenceMap = await this.redisService.getMultipleUsersPresence(
      Array.from(allUserIds),
    );

    return chats.map((chat) => ({
      id: chat.id,
      name: chat.name,
      isGroup: chat.isGroup,
      avatarUrl: chat.avatarUrl,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      participants: chat.participants.map((p) => ({
        ...p,
        user: {
          ...p.user,
          isOnline: presenceMap.get(p.userId)?.status === 'online',
        },
      })),
      lastMessage: chat.messages[0] || null,
    }));
  }

  /**
   * Get or create a direct chat between two users
   * @param userId - Current user ID
   * @param createChatDto - Chat creation data
   * @returns Chat object
   */
  async createOrGetDirectChat(
    userId: string,
    createChatDto: CreateChatDto,
  ): Promise<Chat> {
    const { participantId } = createChatDto;

    if (userId === participantId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }

    // Check if direct chat already exists
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    // Create new direct chat
    return this.prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId, role: ChatRole.MEMBER },
            { userId: participantId, role: ChatRole.MEMBER },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a group chat
   * @param userId - Creator user ID
   * @param createGroupChatDto - Group chat data
   * @returns Created group chat
   */
  async createGroupChat(
    userId: string,
    createGroupChatDto: CreateGroupChatDto,
  ): Promise<Chat> {
    const { name, participantIds, avatarUrl } = createGroupChatDto;

    // Ensure creator is included and deduplicate
    const uniqueParticipants = [...new Set([userId, ...participantIds])];

    return this.prisma.chat.create({
      data: {
        name,
        isGroup: true,
        avatarUrl,
        participants: {
          create: uniqueParticipants.map((id) => ({
            userId: id,
            role: id === userId ? ChatRole.OWNER : ChatRole.MEMBER,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get chat by ID
   * @param chatId - Chat ID
   * @param userId - User ID for authorization
   * @returns Chat with participants
   */
  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    // Get online status
    const userIds = chat.participants.map((p) => p.userId);
    const presenceMap = await this.redisService.getMultipleUsersPresence(userIds);

    return {
      ...chat,
      participants: chat.participants.map((p) => ({
        ...p,
        user: {
          ...p.user,
          isOnline: presenceMap.get(p.userId)?.status === 'online',
        },
      })),
    };
  }

  /**
   * Check if user is a member of a chat
   * @param chatId - Chat ID
   * @param userId - User ID
   * @returns Boolean
   */
  async isUserInChat(chatId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });
    return !!participant;
  }

  /**
   * Add participant to group chat
   * @param chatId - Chat ID
   * @param userId - User ID to add
   * @param addedBy - User adding the participant
   */
  async addParticipant(
    chatId: string,
    userId: string,
    addedBy: string,
  ): Promise<ChatParticipant> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException('Cannot add participants to direct chat');
    }

    // Check if adder has permission
    const adderParticipant = chat.participants.find((p) => p.userId === addedBy);
    if (!adderParticipant || adderParticipant.role === ChatRole.MEMBER) {
      throw new ForbiddenException('You do not have permission to add members');
    }

    // Check if user is already a participant
    if (chat.participants.some((p) => p.userId === userId)) {
      throw new BadRequestException('User is already a member');
    }

    return this.prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
        role: ChatRole.MEMBER,
      },
    });
  }

  /**
   * Remove participant from group chat
   * @param chatId - Chat ID
   * @param userId - User ID to remove
   * @param removedBy - User removing the participant
   */
  async removeParticipant(
    chatId: string,
    userId: string,
    removedBy: string,
  ): Promise<void> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException('Cannot remove participants from direct chat');
    }

    const removerParticipant = chat.participants.find(
      (p) => p.userId === removedBy,
    );
    const targetParticipant = chat.participants.find((p) => p.userId === userId);

    if (!removerParticipant || !targetParticipant) {
      throw new NotFoundException('Participant not found');
    }

    // Check permissions
    if (userId !== removedBy) {
      if (removerParticipant.role === ChatRole.MEMBER) {
        throw new ForbiddenException('You do not have permission');
      }
      if (
        removerParticipant.role === ChatRole.ADMIN &&
        targetParticipant.role !== ChatRole.MEMBER
      ) {
        throw new ForbiddenException('Admins can only remove members');
      }
    }

    await this.prisma.chatParticipant.delete({
      where: {
        chatId_userId: { chatId, userId },
      },
    });
  }

  /**
   * Get chat participant IDs
   * @param chatId - Chat ID
   * @returns Array of user IDs
   */
  async getChatParticipantIds(chatId: string): Promise<string[]> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { chatId },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  }
}
