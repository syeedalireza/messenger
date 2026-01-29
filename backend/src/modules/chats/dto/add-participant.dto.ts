/**
 * @fileoverview Add Participant DTO
 * @description Data transfer object for adding participant to chat
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AddParticipantDto {
  @ApiProperty({
    description: 'User ID to add',
    example: 'uuid-of-user',
  })
  @IsString()
  @IsUUID('4', { message: 'Please provide a valid user ID' })
  userId: string;
}
