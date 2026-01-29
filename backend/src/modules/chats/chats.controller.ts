/**
 * @fileoverview Chats controller
 * @description Handles chat-related HTTP endpoints
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Chats')
@Controller('chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * Get all chats for current user
   * @param user - Current user
   * @returns Array of chats
   */
  @Get()
  @ApiOperation({ summary: 'Get all chats for current user' })
  @ApiResponse({ status: 200, description: 'Chats retrieved' })
  async getChats(@CurrentUser() user: User) {
    return this.chatsService.getUserChats(user.id);
  }

  /**
   * Create or get direct chat
   * @param user - Current user
   * @param createChatDto - Chat data
   * @returns Chat object
   */
  @Post()
  @ApiOperation({ summary: 'Create or get direct chat' })
  @ApiResponse({ status: 201, description: 'Chat created/retrieved' })
  async createChat(
    @CurrentUser() user: User,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatsService.createOrGetDirectChat(user.id, createChatDto);
  }

  /**
   * Create group chat
   * @param user - Current user
   * @param createGroupChatDto - Group chat data
   * @returns Created group chat
   */
  @Post('group')
  @ApiOperation({ summary: 'Create group chat' })
  @ApiResponse({ status: 201, description: 'Group chat created' })
  async createGroupChat(
    @CurrentUser() user: User,
    @Body() createGroupChatDto: CreateGroupChatDto,
  ) {
    return this.chatsService.createGroupChat(user.id, createGroupChatDto);
  }

  /**
   * Get chat by ID
   * @param user - Current user
   * @param chatId - Chat ID
   * @returns Chat with participants
   */
  @Get(':chatId')
  @ApiOperation({ summary: 'Get chat by ID' })
  @ApiResponse({ status: 200, description: 'Chat retrieved' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async getChat(
    @CurrentUser() user: User,
    @Param('chatId') chatId: string,
  ) {
    return this.chatsService.getChatById(chatId, user.id);
  }

  /**
   * Add participant to group chat
   * @param user - Current user
   * @param chatId - Chat ID
   * @param addParticipantDto - Participant data
   * @returns Added participant
   */
  @Post(':chatId/participants')
  @ApiOperation({ summary: 'Add participant to group chat' })
  @ApiResponse({ status: 201, description: 'Participant added' })
  async addParticipant(
    @CurrentUser() user: User,
    @Param('chatId') chatId: string,
    @Body() addParticipantDto: AddParticipantDto,
  ) {
    return this.chatsService.addParticipant(
      chatId,
      addParticipantDto.userId,
      user.id,
    );
  }

  /**
   * Remove participant from group chat
   * @param user - Current user
   * @param chatId - Chat ID
   * @param userId - User ID to remove
   */
  @Delete(':chatId/participants/:userId')
  @ApiOperation({ summary: 'Remove participant from group chat' })
  @ApiResponse({ status: 200, description: 'Participant removed' })
  async removeParticipant(
    @CurrentUser() user: User,
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    await this.chatsService.removeParticipant(chatId, userId, user.id);
    return { message: 'Participant removed successfully' };
  }
}
