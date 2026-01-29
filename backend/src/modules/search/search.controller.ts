/**
 * @fileoverview Search Controller
 * @description REST endpoints for search operations
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Search')
@ApiBearerAuth('JWT-auth')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('messages')
  @ApiOperation({ summary: 'Search messages' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'chatId', required: false, description: 'Filter by chat ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 20)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchMessages(
    @Query('q') query: string,
    @Query('chatId') chatId?: string,
    @Query('limit') limit?: string,
  ) {
    const results = await this.searchService.searchMessages(
      query,
      chatId,
      limit ? parseInt(limit) : 20,
    );
    return { results, count: results.length };
  }

  @Get('users')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const results = await this.searchService.searchUsers(
      query,
      limit ? parseInt(limit) : 10,
    );
    return { results, count: results.length };
  }

  @Get('chats')
  @ApiOperation({ summary: 'Search chats' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchChats(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const results = await this.searchService.searchChats(
      query,
      limit ? parseInt(limit) : 10,
    );
    return { results, count: results.length };
  }

  @Get('global')
  @ApiOperation({ summary: 'Global search across all content' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Combined search results' })
  async globalSearch(@Query('q') query: string) {
    return this.searchService.globalSearch(query);
  }
}
<!-- user search -->
