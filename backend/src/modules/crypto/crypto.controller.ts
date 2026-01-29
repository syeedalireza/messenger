/**
 * @fileoverview Crypto Controller
 * @description REST endpoints for key management
 */

import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Crypto')
@ApiBearerAuth('JWT-auth')
@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('keys')
  @ApiOperation({ summary: 'Store user public key' })
  @ApiResponse({ status: 200, description: 'Public key stored successfully' })
  async storePublicKey(
    @CurrentUser() user: any,
    @Body() body: { publicKey: string },
  ) {
    await this.cryptoService.storePublicKey(user.sub, body.publicKey);
    return { success: true };
  }

  @Get('keys/:userId')
  @ApiOperation({ summary: 'Get user public key' })
  @ApiResponse({ status: 200, description: 'Public key retrieved' })
  async getPublicKey(@Param('userId') userId: string) {
    const publicKey = await this.cryptoService.getPublicKey(userId);
    return { publicKey };
  }
}
