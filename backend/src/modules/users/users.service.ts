/**
 * @fileoverview Users service
 * @description Handles user-related business logic
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or null
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   * @param username - Username
   * @returns User or null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Search users by username or display name
   * @param query - Search query
   * @param currentUserId - Current user ID to exclude
   * @param limit - Maximum results
   * @returns Array of users
   */
  async searchUsers(
    query: string,
    currentUserId: string,
    limit: number = 20,
  ): Promise<Partial<User>[]> {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        isOnline: true,
        lastSeenAt: true,
      },
      take: limit,
    });

    // Get online status from Redis
    const userIds = users.map((u) => u.id);
    const presenceMap = await this.redisService.getMultipleUsersPresence(userIds);

    return users.map((user) => ({
      ...user,
      isOnline: presenceMap.get(user.id)?.status === 'online',
    }));
  }

  /**
   * Update user profile
   * @param userId - User ID
   * @param updateUserDto - Update data
   * @returns Updated user
   */
  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  /**
   * Update user online status
   * @param userId - User ID
   * @param isOnline - Online status
   */
  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeenAt: isOnline ? null : new Date(),
      },
    });
  }

  /**
   * Get user's public profile
   * @param userId - User ID
   * @returns Public user data
   */
  async getPublicProfile(userId: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get real-time online status from Redis
    const presence = await this.redisService.getUserPresence(userId);

    return {
      ...user,
      isOnline: presence?.status === 'online',
    };
  }
}
