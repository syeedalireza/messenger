/**
 * @fileoverview Mark As Read DTO
 * @description Data transfer object for marking messages as read
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class MarkAsReadDto {
  @ApiProperty({
    description: 'Chat ID',
    example: 'uuid-of-chat',
  })
  @IsString()
  @IsUUID('4', { message: 'Please provide a valid chat ID' })
  chatId: string;

  @ApiProperty({
    description: 'Array of message IDs to mark as read',
    example: ['uuid-1', 'uuid-2'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one message ID is required' })
  @IsUUID('4', { each: true, message: 'Each message ID must be a valid UUID' })
  messageIds: string[];
}
