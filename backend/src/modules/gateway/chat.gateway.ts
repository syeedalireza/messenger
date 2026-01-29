/**
 * @fileoverview Chat WebSocket Gateway
 * @description Handles real-time messaging and presence using Socket.io
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../common/redis/redis.service';
import { ChatsService } from '../chats/chats.service';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { MessageType } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Handle new WebSocket connection
   * @param client - Socket client
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      client.userId = userId;

      // Set user online
      await this.redisService.setUserOnline(userId, client.id);
      await this.usersService.updateOnlineStatus(userId, true);

      // Join user's chat rooms
      const chats = await this.chatsService.getUserChats(userId);
      chats.forEach((chat) => {
        client.join(`chat:${chat.id}`);
      });

      // Notify contacts about online status
      this.broadcastPresence(userId, 'online');

      this.logger.log(`Client connected: ${client.id} (User: ${client.userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   * @param client - Socket client
   */
  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    if (client.userId) {
      await this.redisService.setUserOffline(client.userId, client.id);
      await this.usersService.updateOnlineStatus(client.userId, false);

      // Notify contacts about offline status
      this.broadcastPresence(client.userId, 'offline');

      this.logger.log(`Client disconnected: ${client.id} (User: ${client.userId})`);
    }
  }

  /**
   * Handle sending messages
   * @param client - Socket client
   * @param payload - Message payload
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: {
      chatId: string;
      content: string;
      messageType?: MessageType;
      replyToId?: string;
      tempId?: string;
    },
  ): Promise<void> {
    try {
      const message = await this.messagesService.createMessage(client.userId!, {
        chatId: payload.chatId,
        content: payload.content,
        messageType: payload.messageType,
        replyToId: payload.replyToId,
      });

      // Emit to all participants in the chat
      this.server.to(`chat:${payload.chatId}`).emit('message:new', {
        ...message,
        tempId: payload.tempId,
      });

      // Acknowledge to sender
      client.emit('message:sent', {
        tempId: payload.tempId,
        message,
      });
    } catch (error) {
      client.emit('message:error', {
        tempId: payload.tempId,
        error: error.message,
      });
    }
  }

  /**
   * Handle typing indicator
   * @param client - Socket client
   * @param payload - Typing payload
   */
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ): Promise<void> {
    client.to(`chat:${payload.chatId}`).emit('typing:update', {
      chatId: payload.chatId,
      userId: client.userId,
      isTyping: true,
    });
  }

  /**
   * Handle stop typing
   * @param client - Socket client
   * @param payload - Typing payload
   */
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ): Promise<void> {
    client.to(`chat:${payload.chatId}`).emit('typing:update', {
      chatId: payload.chatId,
      userId: client.userId,
      isTyping: false,
    });
  }

  /**
   * Handle marking messages as read
   * @param client - Socket client
   * @param payload - Read payload
   */
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string; messageIds: string[] },
  ): Promise<void> {
    try {
      await this.messagesService.markAsRead(
        payload.chatId,
        client.userId!,
        payload.messageIds,
      );

      // Notify sender about read receipts
      this.server.to(`chat:${payload.chatId}`).emit('message:read', {
        chatId: payload.chatId,
        userId: client.userId,
        messageIds: payload.messageIds,
      });
    } catch (error) {
      this.logger.error(`Read error: ${error.message}`);
    }
  }

  /**
   * Handle joining a chat room
   * @param client - Socket client
   * @param payload - Join payload
   */
  @SubscribeMessage('chat:join')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ): Promise<void> {
    const isInChat = await this.chatsService.isUserInChat(
      payload.chatId,
      client.userId!,
    );

    if (isInChat) {
      client.join(`chat:${payload.chatId}`);
      client.emit('chat:joined', { chatId: payload.chatId });
    }
  }

  /**
   * Handle leaving a chat room
   * @param client - Socket client
   * @param payload - Leave payload
   */
  @SubscribeMessage('chat:leave')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string },
  ): Promise<void> {
    client.leave(`chat:${payload.chatId}`);
    client.emit('chat:left', { chatId: payload.chatId });
  }

  /**
   * Handle presence heartbeat
   * @param client - Socket client
   */
  @SubscribeMessage('presence:heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    if (client.userId) {
      await this.redisService.refreshPresence(client.userId);
    }
  }

  /**
   * Broadcast presence change to user's contacts
   * @param userId - User ID
   * @param status - Online/offline status
   */
  private async broadcastPresence(
    userId: string,
    status: 'online' | 'offline',
  ): Promise<void> {
    const chats = await this.chatsService.getUserChats(userId);
    
    chats.forEach((chat) => {
      this.server.to(`chat:${chat.id}`).emit('presence:update', {
        userId,
        status,
        lastSeen: status === 'offline' ? new Date().toISOString() : null,
      });
    });
  }

  /**
   * Notify chat participants about new chat/member
   * @param chatId - Chat ID
   * @param event - Event type
   * @param data - Event data
   */
  async notifyChatUpdate(
    chatId: string,
    event: string,
    data: any,
  ): Promise<void> {
    this.server.to(`chat:${chatId}`).emit(event, data);
  }

  /**
   * Extract JWT token from socket handshake
   * @param client - Socket client
   * @returns Token string or null
   */
  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return client.handshake.auth?.token || null;
  }
}
<!-- ws -->
