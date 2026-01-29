/**
 * @fileoverview Auth Response DTO
 * @description Data transfer object for authentication responses
 */

import { ApiProperty } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Display name', nullable: true })
  displayName: string | null;

  @ApiProperty({ description: 'Avatar URL', nullable: true })
  avatarUrl: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'User information', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}
