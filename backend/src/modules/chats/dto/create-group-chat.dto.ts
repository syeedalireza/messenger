/**
 * @fileoverview Create Group Chat DTO
 * @description Data transfer object for creating group chat
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMinSize,
  IsUrl,
} from 'class-validator';

export class CreateGroupChatDto {
  @ApiProperty({
    description: 'Group name',
    example: 'Project Team',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1, { message: 'Group name is required' })
  @MaxLength(100, { message: 'Group name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Array of user IDs to add to the group',
    example: ['uuid-1', 'uuid-2'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one participant is required' })
  @IsUUID('4', { each: true, message: 'Each participant must be a valid UUID' })
  participantIds: string[];

  @ApiPropertyOptional({
    description: 'Group avatar URL',
    example: 'https://example.com/group-avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  avatarUrl?: string;
}
