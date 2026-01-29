/**
 * @fileoverview Blocking Service
 * @description Manages user blocking operations
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BlockingService {
  private readonly logger = new Logger(BlockingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Block a user
   * @param blockerId - ID of user doing the blocking
   * @param blockedId - ID of user being blocked
   */
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }

    // Check if already blocked
    const existing = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('User is already blocked');
    }

    await this.prisma.blockedUser.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    this.logger.log(`User ${blockerId} blocked user ${blockedId}`);
  }

  /**
   * Unblock a user
   * @param blockerId - ID of user doing the unblocking
   * @param blockedId - ID of user being unblocked
   */
  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const blocked = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (!blocked) {
      throw new BadRequestException('User is not blocked');
    }

    await this.prisma.blockedUser.delete({
      where: {
        id: blocked.id,
      },
    });

    this.logger.log(`User ${blockerId} unblocked user ${blockedId}`);
  }

  /**
   * Get list of blocked users
   * @param userId - User ID
   * @returns List of blocked users
   */
  async getBlockedUsers(userId: string): Promise<any[]> {
    const blocked = await this.prisma.blockedUser.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return blocked.map(b => ({
      id: b.id,
      blockedAt: b.blockedAt,
      user: b.blocked,
    }));
  }

  /**
   * Check if user A has blocked user B
   * @param blockerId - User A ID
   * @param blockedId - User B ID
   * @returns True if blocked
   */
  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blocked = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    return !!blocked;
  }

  /**
   * Check if there's any block between two users (either direction)
   * @param userAId - User A ID
   * @param userBId - User B ID
   * @returns True if either user has blocked the other
   */
  async isBlockedMutual(userAId: string, userBId: string): Promise<boolean> {
    const [aBlockedB, bBlockedA] = await Promise.all([
      this.isBlocked(userAId, userBId),
      this.isBlocked(userBId, userAId),
    ]);

    return aBlockedB || bBlockedA;
  }
}
<!-- blocking -->
<!-- test -->
