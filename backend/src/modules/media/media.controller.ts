/**
 * @fileoverview Media Controller
 * @description REST endpoints for file upload and management
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Media')
@ApiBearerAuth('JWT-auth')
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        messageId: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('messageId') messageId: string,
    @Body('type') type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!messageId) {
      throw new BadRequestException('Message ID is required');
    }

    return this.mediaService.uploadFile(file, messageId, type || 'OTHER');
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get file URL' })
  @ApiResponse({ status: 200, description: 'File URL retrieved' })
  async getFileUrl(@Param('id') id: string) {
    const url = await this.mediaService.getFileUrl(id);
    return { url };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  async deleteFile(@Param('id') id: string) {
    await this.mediaService.deleteFile(id);
    return { success: true };
  }
}
<!-- upload -->
