import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';

export interface R2UploadOptions {
  path?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface R2UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimetype: string;
  filename: string;
}

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private r2Client: S3Client;
  private bucket: string;
  private accountId: string;
  private publicUrl: string;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeR2();
  }

  private initializeR2() {
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME') || 'wants';
    this.publicUrl = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL') ||
                     `https://pub-${this.accountId}.r2.dev`;

    if (!this.accountId || !accessKeyId || !secretAccessKey) {
      this.logger.warn('Missing Cloudflare R2 configuration. File upload will be disabled.');
      return;
    }

    const r2Endpoint = `https://${this.accountId}.r2.cloudflarestorage.com`;

    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false,
    });

    this.isConfigured = true;
    this.logger.log('R2 Storage initialized');
    this.logger.log(`Bucket: ${this.bucket}`);
    this.logger.log(`Public URL: ${this.publicUrl}`);
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    options: R2UploadOptions = {},
  ): Promise<R2UploadResult> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    // Build path: users/{userId}/{path}/{filename}
    const filename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;
    const basePath = `users/${userId}`;
    const fullPath = options.path ? `${basePath}/${options.path}` : basePath;
    const key = `${fullPath}/${filename}`;

    const contentType = file.mimetype || mime.lookup(file.originalname) || 'application/octet-stream';

    const putParams = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        ...options.metadata,
        originalName: file.originalname,
        userId,
        uploadedAt: new Date().toISOString(),
      },
    };

    try {
      await this.r2Client.send(new PutObjectCommand(putParams));

      // Generate URL
      let url: string;
      if (options.isPublic) {
        url = `${this.publicUrl}/${key}`;
      } else {
        const getCommand = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        url = await getSignedUrl(this.r2Client, getCommand, {
          expiresIn: 604800, // 7 days
        });
      }

      return {
        url,
        key,
        bucket: this.bucket,
        size: file.size,
        mimetype: contentType,
        filename: file.originalname,
      };
    } catch (error) {
      this.logger.error('R2 upload failed:', error);
      throw error;
    }
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    userId: string,
    options: R2UploadOptions = {},
  ): Promise<R2UploadResult[]> {
    return Promise.all(files.map(file => this.uploadFile(file, userId, options)));
  }

  /**
   * Upload a buffer directly (for screenshots, generated content, etc.)
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string,
    options: { isPublic?: boolean; metadata?: Record<string, string> } = {},
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    const putParams = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
      Metadata: options.metadata || {},
    };

    try {
      await this.r2Client.send(new PutObjectCommand(putParams));

      // Return public URL for screenshots
      if (options.isPublic !== false) {
        return `${this.publicUrl}/${key}`;
      }

      // Return signed URL for private files
      const getCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return getSignedUrl(this.r2Client, getCommand, {
        expiresIn: 604800, // 7 days
      });
    } catch (error) {
      this.logger.error('R2 buffer upload failed:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    try {
      await this.r2Client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      this.logger.log(`Deleted file: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.r2Client, command, { expiresIn });
  }

  async listFiles(userId: string, prefix?: string): Promise<{
    files: Array<{
      key: string;
      size: number;
      lastModified: Date;
      url: string;
    }>;
  }> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    const fullPrefix = prefix ? `users/${userId}/${prefix}` : `users/${userId}/`;

    try {
      const response = await this.r2Client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: fullPrefix,
        MaxKeys: 100,
      }));

      const files = (response.Contents || []).map(file => ({
        key: file.Key || '',
        size: file.Size || 0,
        lastModified: file.LastModified || new Date(),
        url: `${this.publicUrl}/${file.Key}`,
      }));

      return { files };
    } catch (error) {
      this.logger.error('Failed to list files:', error);
      throw error;
    }
  }
}
