/**
 * @fileoverview WebRTC Module
 * @description Handles WebRTC signaling for video/audio calls
 */

import { Module } from '@nestjs/common';
import { WebRTCGateway } from './webrtc.gateway';
import { WebRTCService } from './webrtc.service';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [WebRTCGateway, WebRTCService],
  exports: [WebRTCService],
})
export class WebRTCModule {}
