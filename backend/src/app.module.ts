/**
 * @fileoverview Root application module
 * @description Imports all feature modules and configures global providers
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChatsModule } from './modules/chats/chats.module';
import { MessagesModule } from './modules/messages/messages.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { TwoFactorModule } from './modules/two-factor/two-factor.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { MediaModule } from './modules/media/media.module';
import { SearchModule } from './modules/search/search.module';
import { BlockingModule } from './modules/blocking/blocking.module';
import { WebRTCModule } from './modules/webrtc/webrtc.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting - 100 requests per minute globally
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // max requests
    }]),

    // Common modules
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    TwoFactorModule,
    CryptoModule,
    MediaModule,
    SearchModule,
    BlockingModule,
    WebRTCModule,
    UsersModule,
    ChatsModule,
    MessagesModule,
    GatewayModule,
  ],
  providers: [
    // Apply throttler globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
