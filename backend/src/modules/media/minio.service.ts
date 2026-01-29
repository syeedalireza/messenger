/**
 * @fileoverview MinIO Service
 * @description Handles S3-compatible object storage operations
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'messenger-files';
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'minio',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * Ensure bucket exists, create if not
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
        
        // Set bucket policy to allow public read
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error.message}`);
    }
  }

  /**
   * Upload file to MinIO
   * @param fileName - Name to store file as
   * @param buffer - File buffer
   * @param contentType - MIME type
   * @returns File URL
   */
  async uploadFile(
    fileName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const metaData = {
      'Content-Type': contentType,
    };

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      buffer,
      buffer.length,
      metaData,
    );

    // Return URL (adjust based on your MinIO setup)
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<string>('MINIO_PORT');
    return `http://${endpoint}:${port}/${this.bucketName}/${fileName}`;
  }

  /**
   * Get file from MinIO
   * @param fileName - File name
   * @returns File stream
   */
  async getFile(fileName: string): Promise<any> {
    return this.minioClient.getObject(this.bucketName, fileName);
  }

  /**
   * Delete file from MinIO
   * @param fileName - File name
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  /**
   * Get presigned URL for file upload
   * @param fileName - File name
   * @param expiry - URL expiry in seconds (default: 1 hour)
   * @returns Presigned URL
   */
  async getPresignedUploadUrl(fileName: string, expiry = 3600): Promise<string> {
    return this.minioClient.presignedPutObject(this.bucketName, fileName, expiry);
  }

  /**
   * Get presigned URL for file download
   * @param fileName - File name
   * @param expiry - URL expiry in seconds (default: 1 hour)
   * @returns Presigned URL
   */
  async getPresignedDownloadUrl(fileName: string, expiry = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucketName, fileName, expiry);
  }
}
<!-- minio -->
