/**
 * @fileoverview Blocking Module
 * @description Handles user blocking/unblocking functionality
 */

import { Module } from '@nestjs/common';
import { BlockingService } from './blocking.service';
import { BlockingController } from './blocking.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BlockingController],
  providers: [BlockingService],
  exports: [BlockingService],
})
export class BlockingModule {}
