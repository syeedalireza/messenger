/**
 * @fileoverview Blocking Controller
 * @description REST endpoints for blocking operations
 */

import { Controller, Post, Delete, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockingService } from './blocking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Blocking')
@ApiBearerAuth('JWT-auth')
@Controller('blocking')
@UseGuards(JwtAuthGuard)
export class BlockingController {
  constructor(private readonly blockingService: BlockingService) {}

  @Post('block/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Block a user' })
  @ApiResponse({ status: 204, description: 'User blocked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async blockUser(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.blockingService.blockUser(user.sub, userId);
  }

  @Delete('unblock/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiResponse({ status: 204, description: 'User unblocked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async unblockUser(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.blockingService.unblockUser(user.sub, userId);
  }

  @Get('blocked')
  @ApiOperation({ summary: 'Get list of blocked users' })
  @ApiResponse({ status: 200, description: 'List of blocked users' })
  async getBlockedUsers(@CurrentUser() user: any) {
    const blocked = await this.blockingService.getBlockedUsers(user.sub);
    return { blocked, count: blocked.length };
  }

  @Get('is-blocked/:userId')
  @ApiOperation({ summary: 'Check if a user is blocked' })
  @ApiResponse({ status: 200, description: 'Block status' })
  async isBlocked(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    const blocked = await this.blockingService.isBlocked(user.sub, userId);
    return { blocked };
  }
}
