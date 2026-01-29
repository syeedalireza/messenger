/**
 * @fileoverview Create Message DTO
 * @description Data transfer object for creating messages
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { MessageType } from '@prisma/client';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Chat ID',
    example: 'uuid-of-chat',
  })
  @IsString()
  @IsUUID('4', { message: 'Please provide a valid chat ID' })
  chatId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you?',
    maxLength: 4000,
  })
  @IsString()
  @MaxLength(4000, { message: 'Message must not exceed 4000 characters' })
  content: string;

  @ApiPropertyOptional({
    description: 'Message type',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiPropertyOptional({
    description: 'ID of message being replied to',
    example: 'uuid-of-message',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Please provide a valid message ID' })
  replyToId?: string;
}
