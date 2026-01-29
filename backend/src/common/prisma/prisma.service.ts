/**
 * @fileoverview Prisma service for database operations
 * @description Extends PrismaClient with lifecycle hooks
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  /**
   * Connect to the database when the module initializes
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Disconnect from the database when the module is destroyed
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Clean up database for testing purposes
   * @description Deletes all data from tables in correct order
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase is only available in test environment');
    }

    await this.$transaction([
      this.readReceipt.deleteMany(),
      this.attachment.deleteMany(),
      this.message.deleteMany(),
      this.chatParticipant.deleteMany(),
      this.chat.deleteMany(),
      this.refreshToken.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
