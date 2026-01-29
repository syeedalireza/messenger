/**
 * @fileoverview Messages controller
 * @description Handles message-related HTTP endpoints
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Create a new message
   * @param user - Current user
   * @param createMessageDto - Message data
   * @returns Created message
   */
  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async createMessage(
    @CurrentUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(user.id, createMessageDto);
  }

  /**
   * Get messages for a chat
   * @param user - Current user
   * @param chatId - Chat ID
   * @param limit - Number of messages
   * @param before - Cursor for pagination
   * @returns Array of messages
   */
  @Get('chat/:chatId')
  @ApiOperation({ summary: 'Get messages for a chat' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'before', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  async getChatMessages(
    @CurrentUser() user: User,
    @Param('chatId') chatId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.messagesService.getChatMessages(
      chatId,
      user.id,
      limit || 50,
      before,
    );
  }

  /**
   * Update a message
   * @param user - Current user
   * @param messageId - Message ID
   * @param updateMessageDto - Update data
   * @returns Updated message
   */
  @Put(':messageId')
  @ApiOperation({ summary: 'Edit a message' })
  @ApiResponse({ status: 200, description: 'Message updated' })
  async updateMessage(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.updateMessage(
      messageId,
      user.id,
      updateMessageDto,
    );
  }

  /**
   * Delete a message
   * @param user - Current user
   * @param messageId - Message ID
   */
  @Delete(':messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 204, description: 'Message deleted' })
  async deleteMessage(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
  ) {
    await this.messagesService.deleteMessage(messageId, user.id);
  }

  /**
   * Mark messages as read
   * @param user - Current user
   * @param markAsReadDto - Read data
   */
  @Post('read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 204, description: 'Messages marked as read' })
  async markAsRead(
    @CurrentUser() user: User,
    @Body() markAsReadDto: MarkAsReadDto,
  ) {
    await this.messagesService.markAsRead(
      markAsReadDto.chatId,
      user.id,
      markAsReadDto.messageIds,
    );
  }
}
