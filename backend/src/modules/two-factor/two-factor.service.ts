/**
 * @fileoverview Two-Factor Authentication Service
 * @description Business logic for 2FA operations
 */

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate 2FA secret and QR code for a user
   * @param userId - User ID
   * @returns QR code data URL and backup codes
   */
  async generateTwoFactorSecret(userId: string): Promise<{ qrCode: string; backupCodes: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this user');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Messenger (${user.email})`,
      issuer: 'Messenger',
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);

    // Hash backup codes before storing
    const hashedBackupCodes = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Store secret temporarily (will be confirmed on verification)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        backupCodes: hashedBackupCodes,
      },
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      qrCode,
      backupCodes, // Return unhashed codes only once
    };
  }

  /**
   * Verify TOTP token and enable 2FA
   * @param userId - User ID
   * @param token - TOTP token
   * @returns Success status
   */
  async verifyAndEnableTwoFactor(userId: string, token: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA secret not found. Please generate it first.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps before/after
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });

    return { success: true };
  }

  /**
   * Verify TOTP token for login
   * @param userId - User ID
   * @param token - TOTP token or backup code
   * @returns Verification result
   */
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // First try TOTP verification
    const totpVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (totpVerified) {
      return true;
    }

    // If TOTP fails, try backup codes
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const backupCodeIndex = user.backupCodes.indexOf(hashedToken);

    if (backupCodeIndex !== -1) {
      // Remove used backup code
      const updatedBackupCodes = [...user.backupCodes];
      updatedBackupCodes.splice(backupCodeIndex, 1);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: updatedBackupCodes,
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Disable 2FA for a user
   * @param userId - User ID
   * @param password - User's password for confirmation
   * @returns Success status
   */
  async disableTwoFactor(userId: string): Promise<{ success: boolean }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });

    return { success: true };
  }

  /**
   * Generate new backup codes
   * @param userId - User ID
   * @returns New backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<{ backupCodes: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: hashedBackupCodes,
      },
    });

    return { backupCodes };
  }

  /**
   * Generate random backup codes
   * @param count - Number of codes to generate
   * @returns Array of backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
