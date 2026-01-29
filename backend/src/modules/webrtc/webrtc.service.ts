/**
 * @fileoverview WebRTC Service
 * @description Manages WebRTC call sessions and state
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

export interface CallSession {
  callId: string;
  callerId: string;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
}

@Injectable()
export class WebRTCService {
  private readonly logger = new Logger(WebRTCService.name);
  private readonly CALL_KEY_PREFIX = 'call:';
  private readonly CALL_TTL = 3600; // 1 hour

  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new call session
   */
  async createCall(
    callId: string,
    callerId: string,
    receiverId: string,
    type: 'audio' | 'video',
  ): Promise<CallSession> {
    const session: CallSession = {
      callId,
      callerId,
      receiverId,
      type,
      status: 'ringing',
    };

    await this.redisService.set(
      `${this.CALL_KEY_PREFIX}${callId}`,
      JSON.stringify(session),
      this.CALL_TTL,
    );

    this.logger.log(`Call created: ${callId} (${type})`);
    return session;
  }

  /**
   * Accept a call
   */
  async acceptCall(callId: string): Promise<CallSession | null> {
    const session = await this.getCall(callId);
    if (!session) return null;

    session.status = 'active';
    session.startedAt = new Date();

    await this.redisService.set(
      `${this.CALL_KEY_PREFIX}${callId}`,
      JSON.stringify(session),
      this.CALL_TTL,
    );

    this.logger.log(`Call accepted: ${callId}`);
    return session;
  }

  /**
   * End a call
   */
  async endCall(callId: string): Promise<void> {
    const session = await this.getCall(callId);
    if (!session) return;

    session.status = 'ended';
    session.endedAt = new Date();

    await this.redisService.set(
      `${this.CALL_KEY_PREFIX}${callId}`,
      JSON.stringify(session),
      60, // Keep for 1 minute for cleanup
    );

    this.logger.log(`Call ended: ${callId}`);
  }

  /**
   * Get call session
   */
  async getCall(callId: string): Promise<CallSession | null> {
    const data = await this.redisService.get(`${this.CALL_KEY_PREFIX}${callId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Delete call session
   */
  async deleteCall(callId: string): Promise<void> {
    await this.redisService.del(`${this.CALL_KEY_PREFIX}${callId}`);
  }
}
<!-- peer -->
