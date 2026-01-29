/**
 * @fileoverview Update Message DTO
 * @description Data transfer object for updating messages
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Updated message content',
    example: 'Hello, how are you? (edited)',
    maxLength: 4000,
  })
  @IsString()
  @MaxLength(4000, { message: 'Message must not exceed 4000 characters' })
  content: string;
}
