/**
 * @fileoverview Two-Factor Authentication Controller
 * @description REST endpoints for 2FA management
 */

import { Controller, Post, Get, Delete, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EnableTwoFactorDto, VerifyTwoFactorDto } from './dto/two-factor.dto';

@ApiTags('2FA')
@ApiBearerAuth('JWT-auth')
@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({ status: 200, description: 'QR code and backup codes generated successfully' })
  async generateSecret(@CurrentUser() user: any) {
    return this.twoFactorService.generateTwoFactorSecret(user.sub);
  }

  @Post('enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify token and enable 2FA' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA token' })
  async enableTwoFactor(
    @CurrentUser() user: any,
    @Body() dto: EnableTwoFactorDto,
  ) {
    return this.twoFactorService.verifyAndEnableTwoFactor(user.sub, dto.token);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA token during login' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verifyToken(
    @CurrentUser() user: any,
    @Body() dto: VerifyTwoFactorDto,
  ) {
    const isValid = await this.twoFactorService.verifyTwoFactorToken(user.sub, dto.token);
    return { valid: isValid };
  }

  @Delete('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disableTwoFactor(@CurrentUser() user: any) {
    return this.twoFactorService.disableTwoFactor(user.sub);
  }

  @Post('backup-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated successfully' })
  async regenerateBackupCodes(@CurrentUser() user: any) {
    return this.twoFactorService.regenerateBackupCodes(user.sub);
  }
}
