/**
 * @fileoverview Login DTO
 * @description Data transfer object for user login
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email or username',
    example: 'user@example.com',
  })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecureP@ss123',
  })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
