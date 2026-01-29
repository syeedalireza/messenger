/**
 * @fileoverview Media Service
 * @description Handles file processing and metadata management
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { encode } from 'blurhash';
import { MinioService } from './minio.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly maxFileSize: number;

  constructor(
    private minioService: MinioService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.maxFileSize = parseInt(
      this.configService.get<string>('MAX_FILE_SIZE') || '52428800',
    ); // 50MB default
  }

  /**
   * Upload and process file
   * @param file - Multer file object
   * @param messageId - Associated message ID
   * @param type - Attachment type
   * @returns Attachment record
   */
  async uploadFile(
    file: Express.Multer.File,
    messageId: string,
    type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER',
  ): Promise<any> {
    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1048576}MB`,
      );
    }

    const fileId = uuidv4();
    const extension = file.originalname.split('.').pop();
    const fileName = `${fileId}.${extension}`;

    let thumbnailUrl: string | null = null;
    let processedBuffer = file.buffer;

    // Process based on type
    if (type === 'IMAGE') {
      const result = await this.processImage(file.buffer, fileId);
      processedBuffer = result.buffer;
      thumbnailUrl = result.thumbnailUrl;
    }

    // Upload to MinIO
    const fileUrl = await this.minioService.uploadFile(
      fileName,
      processedBuffer,
      file.mimetype,
    );

    // Create attachment record
    const attachment = await this.prisma.attachment.create({
      data: {
        messageId,
        fileName: file.originalname,
        fileUrl,
        fileSize: processedBuffer.length,
        mimeType: file.mimetype,
        type,
        thumbnailUrl,
      },
    });

    this.logger.log(`File uploaded: ${fileName} (${file.size} bytes)`);

    return attachment;
  }

  /**
   * Process image - compress, resize, and generate thumbnail
   * @param buffer - Image buffer
   * @param fileId - File ID
   * @returns Processed image buffer and thumbnail URL
   */
  private async processImage(
    buffer: Buffer,
    fileId: string,
  ): Promise<{ buffer: Buffer; thumbnailUrl: string | null }> {
    try {
      // Get image metadata
      const metadata = await sharp(buffer).metadata();

      // Resize if too large (max 1920px width)
      let processedImage = sharp(buffer);
      
      if (metadata.width && metadata.width > 1920) {
        processedImage = processedImage.resize(1920, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Optimize image
      const optimizedBuffer = await processedImage
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      // Generate thumbnail
      const thumbnailBuffer = await sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();

      const thumbnailFileName = `${fileId}_thumb.jpg`;
      const thumbnailUrl = await this.minioService.uploadFile(
        thumbnailFileName,
        thumbnailBuffer,
        'image/jpeg',
      );

      // Generate BlurHash for progressive loading
      const blurHashData = await sharp(buffer)
        .resize(32, 32, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const blurhash = encode(
        new Uint8ClampedArray(blurHashData.data),
        blurHashData.info.width,
        blurHashData.info.height,
        4,
        4,
      );

      this.logger.debug(`Generated BlurHash: ${blurhash}`);

      return {
        buffer: optimizedBuffer,
        thumbnailUrl,
      };
    } catch (error) {
      this.logger.error(`Error processing image: ${error.message}`);
      return { buffer, thumbnailUrl: null };
    }
  }

  /**
   * Delete file and its attachment record
   * @param attachmentId - Attachment ID
   */
  async deleteFile(attachmentId: string): Promise<void> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new BadRequestException('Attachment not found');
    }

    // Extract file name from URL
    const fileName = attachment.fileUrl.split('/').pop();
    
    if (fileName) {
      await this.minioService.deleteFile(fileName);
      
      // Delete thumbnail if exists
      if (attachment.thumbnailUrl) {
        const thumbFileName = attachment.thumbnailUrl.split('/').pop();
        if (thumbFileName) {
          await this.minioService.deleteFile(thumbFileName);
        }
      }
    }

    // Delete attachment record
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    this.logger.log(`File deleted: ${fileName}`);
  }

  /**
   * Get file URL
   * @param attachmentId - Attachment ID
   * @returns File URL
   */
  async getFileUrl(attachmentId: string): Promise<string> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new BadRequestException('Attachment not found');
    }

    return attachment.fileUrl;
  }
}
