/**
 * @fileoverview Create Chat DTO
 * @description Data transfer object for creating direct chat
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'User ID to chat with',
    example: 'uuid-of-user',
  })
  @IsString()
  @IsUUID('4', { message: 'Please provide a valid user ID' })
  participantId: string;
}
