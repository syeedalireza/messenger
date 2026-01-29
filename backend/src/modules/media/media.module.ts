/**
 * @fileoverview Media Module
 * @description Handles file uploads, storage, and processing
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MinioService } from './minio.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, MinioService],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
