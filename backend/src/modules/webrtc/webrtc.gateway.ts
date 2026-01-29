/**
 * @fileoverview WebRTC Gateway
 * @description WebSocket gateway for WebRTC signaling
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebRTCService } from './webrtc.service';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  namespace: 'webrtc',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class WebRTCGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebRTCGateway.name);

  constructor(private readonly webrtcService: WebRTCService) {}

  afterInit(server: Server) {
    this.logger.log('WebRTC Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user:${userId}`);
      this.logger.log(`WebRTC client connected: ${client.id} (User: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WebRTC client disconnected: ${client.id}`);
  }

  /**
   * Initiate a call
   */
  @SubscribeMessage('call:initiate')
  async handleCallInitiate(
    @MessageBody() data: { receiverId: string; type: 'audio' | 'video' },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    const callId = uuidv4();

    const session = await this.webrtcService.createCall(
      callId,
      userId,
      data.receiverId,
      data.type,
    );

    // Notify receiver about incoming call
    this.server.to(`user:${data.receiverId}`).emit('call:incoming', {
      callId,
      callerId: userId,
      type: data.type,
    });

    // Confirm to caller
    client.emit('call:initiated', { callId, session });

    this.logger.log(`Call initiated: ${callId} (${userId} -> ${data.receiverId})`);
  }

  /**
   * Accept a call
   */
  @SubscribeMessage('call:accept')
  async handleCallAccept(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = await this.webrtcService.acceptCall(data.callId);
    
    if (session) {
      // Notify caller that call was accepted
      this.server.to(`user:${session.callerId}`).emit('call:accepted', {
        callId: data.callId,
      });

      // Confirm to receiver
      client.emit('call:accepted', { callId: data.callId });

      this.logger.log(`Call accepted: ${data.callId}`);
    }
  }

  /**
   * Reject a call
   */
  @SubscribeMessage('call:reject')
  async handleCallReject(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = await this.webrtcService.getCall(data.callId);
    
    if (session) {
      // Notify caller that call was rejected
      this.server.to(`user:${session.callerId}`).emit('call:rejected', {
        callId: data.callId,
      });

      await this.webrtcService.endCall(data.callId);
      this.logger.log(`Call rejected: ${data.callId}`);
    }
  }

  /**
   * End a call
   */
  @SubscribeMessage('call:end')
  async handleCallEnd(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = await this.webrtcService.getCall(data.callId);
    
    if (session) {
      const userId = client.handshake.query.userId as string;
      const otherUserId =
        session.callerId === userId ? session.receiverId : session.callerId;

      // Notify other party
      this.server.to(`user:${otherUserId}`).emit('call:ended', {
        callId: data.callId,
      });

      await this.webrtcService.endCall(data.callId);
      this.logger.log(`Call ended: ${data.callId}`);
    }
  }

  /**
   * Exchange ICE candidates
   */
  @SubscribeMessage('webrtc:ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { callId: string; candidate: any; targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`user:${data.targetUserId}`).emit('webrtc:ice-candidate', {
      callId: data.callId,
      candidate: data.candidate,
    });
  }

  /**
   * Exchange SDP offer
   */
  @SubscribeMessage('webrtc:offer')
  handleOffer(
    @MessageBody() data: { callId: string; offer: any; targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`user:${data.targetUserId}`).emit('webrtc:offer', {
      callId: data.callId,
      offer: data.offer,
    });

    this.logger.log(`WebRTC offer sent for call: ${data.callId}`);
  }

  /**
   * Exchange SDP answer
   */
  @SubscribeMessage('webrtc:answer')
  handleAnswer(
    @MessageBody() data: { callId: string; answer: any; targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`user:${data.targetUserId}`).emit('webrtc:answer', {
      callId: data.callId,
      answer: data.answer,
    });

    this.logger.log(`WebRTC answer sent for call: ${data.callId}`);
  }
}
