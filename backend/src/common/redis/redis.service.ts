/**
 * @fileoverview Redis service for caching and presence
 * @description Handles user online status and caching operations
 */

import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);
  
  /** Key prefix for user online status */
  private readonly PRESENCE_PREFIX = 'presence:';
  
  /** Key prefix for user socket mapping */
  private readonly SOCKET_PREFIX = 'socket:';
  
  /** TTL for presence data in seconds */
  private readonly PRESENCE_TTL = 300; // 5 minutes

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });
  }

  /**
   * Clean up Redis connection on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Set user as online
   * @param userId - User ID
   * @param socketId - Socket connection ID
   */
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    pipeline.set(
      `${this.PRESENCE_PREFIX}${userId}`,
      JSON.stringify({ status: 'online', socketId, lastSeen: new Date().toISOString() }),
      'EX',
      this.PRESENCE_TTL,
    );
    
    pipeline.set(`${this.SOCKET_PREFIX}${socketId}`, userId);
    
    await pipeline.exec();
  }

  /**
   * Set user as offline
   * @param userId - User ID
   * @param socketId - Socket connection ID
   */
  async setUserOffline(userId: string, socketId: string): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    pipeline.set(
      `${this.PRESENCE_PREFIX}${userId}`,
      JSON.stringify({ status: 'offline', lastSeen: new Date().toISOString() }),
      'EX',
      this.PRESENCE_TTL,
    );
    
    pipeline.del(`${this.SOCKET_PREFIX}${socketId}`);
    
    await pipeline.exec();
  }

  /**
   * Check if user is online
   * @param userId - User ID
   * @returns Boolean indicating online status
   */
  async isUserOnline(userId: string): Promise<boolean> {
    const data = await this.redis.get(`${this.PRESENCE_PREFIX}${userId}`);
    if (!data) return false;
    
    try {
      const parsed = JSON.parse(data);
      return parsed.status === 'online';
    } catch {
      return false;
    }
  }

  /**
   * Get user presence data
   * @param userId - User ID
   * @returns Presence data object or null
   */
  async getUserPresence(userId: string): Promise<{
    status: 'online' | 'offline';
    lastSeen: string;
    socketId?: string;
  } | null> {
    const data = await this.redis.get(`${this.PRESENCE_PREFIX}${userId}`);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Get multiple users' presence data
   * @param userIds - Array of user IDs
   * @returns Map of user ID to presence data
   */
  async getMultipleUsersPresence(
    userIds: string[],
  ): Promise<Map<string, { status: 'online' | 'offline'; lastSeen: string }>> {
    const keys = userIds.map((id) => `${this.PRESENCE_PREFIX}${id}`);
    const values = await this.redis.mget(...keys);
    
    const result = new Map();
    userIds.forEach((userId, index) => {
      const data = values[index];
      if (data) {
        try {
          result.set(userId, JSON.parse(data));
        } catch {
          result.set(userId, { status: 'offline', lastSeen: new Date().toISOString() });
        }
      } else {
        result.set(userId, { status: 'offline', lastSeen: new Date().toISOString() });
      }
    });
    
    return result;
  }

  /**
   * Get user ID by socket ID
   * @param socketId - Socket connection ID
   * @returns User ID or null
   */
  async getUserIdBySocketId(socketId: string): Promise<string | null> {
    return this.redis.get(`${this.SOCKET_PREFIX}${socketId}`);
  }

  /**
   * Refresh presence TTL (heartbeat)
   * @param userId - User ID
   */
  async refreshPresence(userId: string): Promise<void> {
    const data = await this.redis.get(`${this.PRESENCE_PREFIX}${userId}`);
    if (data) {
      await this.redis.expire(`${this.PRESENCE_PREFIX}${userId}`, this.PRESENCE_TTL);
    }
  }

  /**
   * Generic cache set operation
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  /**
   * Generic cache get operation
   * @param key - Cache key
   * @returns Cached value or null
   */
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * Delete cache entry
   * @param key - Cache key
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Publish message to a channel
   * @param channel - Channel name
   * @param message - Message to publish
   */
  async publish(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message);
  }
}
