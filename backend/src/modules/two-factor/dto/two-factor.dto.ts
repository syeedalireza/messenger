/**
 * @fileoverview Two-Factor Authentication DTOs
 */

import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnableTwoFactorDto {
  @ApiProperty({
    description: '6-digit TOTP token',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: '6-digit TOTP token or 8-character backup code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
