import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DatabaseService } from '../database/database.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

export interface UserContent {
  id: string;
  user_id: string;
  content_type: 'image' | 'video' | 'logo' | 'pdf' | 'audio' | 'text';
  url: string;
  thumbnail_url?: string;
  filename?: string;
  title?: string;
  prompt?: string;
  model?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  metadata?: Record<string, any>;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContentDto {
  contentType: 'image' | 'video' | 'logo' | 'pdf' | 'audio' | 'text';
  url: string;
  thumbnailUrl?: string;
  filename?: string;
  title?: string;
  prompt?: string;
  model?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  metadata?: Record<string, any>;
}

export interface ContentQueryOptions {
  contentType?: string;
  isFavorite?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.initializeR2();
  }

  private initializeR2() {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME', 'fluxez');
    this.publicUrl = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL', `https://pub-${accountId}.r2.dev`);

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`✅ Cloudflare R2 initialized - Bucket: ${this.bucketName}`);
    } else {
      this.logger.warn('⚠️ Cloudflare R2 not configured - content will use external URLs only');
    }
  }

  // ============================================
  // CONTENT CRUD OPERATIONS
  // ============================================

  async createContent(userId: string, dto: CreateContentDto): Promise<UserContent> {
    try {
      // If R2 is configured and URL is external, upload to R2
      let finalUrl = dto.url;
      let finalThumbnailUrl = dto.thumbnailUrl;

      if (this.s3Client && dto.url && !dto.url.includes(this.publicUrl)) {
        try {
          // Download and re-upload to R2 for persistence
          const uploadedUrl = await this.uploadFromUrl(dto.url, dto.contentType, userId);
          if (uploadedUrl) {
            finalUrl = uploadedUrl;
          }
        } catch (uploadError) {
          this.logger.warn(`Failed to upload to R2, using original URL: ${uploadError.message}`);
        }
      }

      const content = await this.db.insert<UserContent>('user_content', {
        user_id: userId,
        content_type: dto.contentType,
        url: finalUrl,
        thumbnail_url: finalThumbnailUrl,
        filename: dto.filename,
        title: dto.title || this.generateTitle(dto.prompt, dto.contentType),
        prompt: dto.prompt,
        model: dto.model,
        width: dto.width,
        height: dto.height,
        duration: dto.duration,
        size: dto.size,
        metadata: dto.metadata || {},
        is_favorite: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      this.logger.log(`Content created for user ${userId}: ${content.id} (${dto.contentType})`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to create content: ${error.message}`);
      throw error;
    }
  }

  async getContent(userId: string, contentId: string): Promise<UserContent> {
    const content = await this.db.findOne<UserContent>('user_content', {
      id: contentId,
      user_id: userId,
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content;
  }

  async listContent(userId: string, options: ContentQueryOptions = {}): Promise<{
    items: UserContent[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const orderBy = options.orderBy || 'created_at';
    const order = options.order || 'DESC';

    // Build where clause
    let whereClause = 'user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (options.contentType) {
      whereClause += ` AND content_type = $${paramIndex}`;
      params.push(options.contentType);
      paramIndex++;
    }

    if (options.isFavorite !== undefined) {
      whereClause += ` AND is_favorite = $${paramIndex}`;
      params.push(options.isFavorite);
      paramIndex++;
    }

    // Get total count
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_content WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    // Get items
    const result = await this.db.query<UserContent>(
      `SELECT * FROM user_content WHERE ${whereClause} ORDER BY "${orderBy}" ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return {
      items: result.rows,
      total,
      limit,
      offset,
    };
  }

  async updateContent(
    userId: string,
    contentId: string,
    data: Partial<Pick<UserContent, 'title' | 'is_favorite' | 'metadata'>>,
  ): Promise<UserContent> {
    const content = await this.getContent(userId, contentId);

    const updateData: any = { updated_at: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.is_favorite !== undefined) updateData.is_favorite = data.is_favorite;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const [updated] = await this.db.update<UserContent>(
      'user_content',
      { id: contentId, user_id: userId },
      updateData,
    );

    return updated;
  }

  async deleteContent(userId: string, contentId: string): Promise<void> {
    const content = await this.getContent(userId, contentId);

    // Delete from R2 if stored there
    if (this.s3Client && content.url.includes(this.publicUrl)) {
      try {
        const key = content.url.replace(`${this.publicUrl}/`, '');
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }));
      } catch (error) {
        this.logger.warn(`Failed to delete from R2: ${error.message}`);
      }
    }

    await this.db.delete('user_content', { id: contentId, user_id: userId });
    this.logger.log(`Content deleted: ${contentId}`);
  }

  async toggleFavorite(userId: string, contentId: string): Promise<UserContent> {
    const content = await this.getContent(userId, contentId);
    return this.updateContent(userId, contentId, { is_favorite: !content.is_favorite });
  }

  // ============================================
  // CONTENT STATISTICS
  // ============================================

  async getContentStats(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    favorites: number;
    recentCount: number;
  }> {
    // Total count
    const totalResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM user_content WHERE user_id = $1',
      [userId],
    );

    // By type
    const typeResult = await this.db.query<{ content_type: string; count: string }>(
      'SELECT content_type, COUNT(*) as count FROM user_content WHERE user_id = $1 GROUP BY content_type',
      [userId],
    );

    // Favorites
    const favResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM user_content WHERE user_id = $1 AND is_favorite = true',
      [userId],
    );

    // Recent (last 7 days)
    const recentResult = await this.db.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM user_content WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'",
      [userId],
    );

    const byType: Record<string, number> = {};
    for (const row of typeResult.rows) {
      byType[row.content_type] = parseInt(row.count, 10);
    }

    return {
      total: parseInt(totalResult.rows[0]?.count || '0', 10),
      byType,
      favorites: parseInt(favResult.rows[0]?.count || '0', 10),
      recentCount: parseInt(recentResult.rows[0]?.count || '0', 10),
    };
  }

  // ============================================
  // R2 STORAGE OPERATIONS
  // ============================================

  private async uploadFromUrl(
    sourceUrl: string,
    contentType: string,
    userId: string,
  ): Promise<string | null> {
    if (!this.s3Client) return null;

    try {
      // Download the file
      const response = await firstValueFrom(
        this.httpService.get(sourceUrl, { responseType: 'arraybuffer' }),
      );

      const buffer = Buffer.from(response.data);
      const mimeType = response.headers['content-type'] || this.getMimeType(contentType);
      const extension = this.getExtension(mimeType, contentType);
      const filename = `${uuidv4()}.${extension}`;
      const key = `wants/${userId}/${contentType}s/${filename}`;

      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }));

      return `${this.publicUrl}/${key}`;
    } catch (error) {
      this.logger.error(`Upload from URL failed: ${error.message}`);
      return null;
    }
  }

  async uploadFile(
    userId: string,
    buffer: Buffer,
    contentType: string,
    mimeType: string,
    originalFilename?: string,
  ): Promise<string> {
    if (!this.s3Client) {
      throw new Error('R2 storage not configured');
    }

    const extension = this.getExtension(mimeType, contentType);
    const filename = `${uuidv4()}.${extension}`;
    const key = `wants/${userId}/${contentType}s/${filename}`;

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: originalFilename ? { originalFilename } : undefined,
    }));

    return `${this.publicUrl}/${key}`;
  }

  async getSignedUrl(userId: string, contentId: string, expiresIn = 3600): Promise<string> {
    const content = await this.getContent(userId, contentId);

    if (!this.s3Client || !content.url.includes(this.publicUrl)) {
      return content.url;
    }

    const key = content.url.replace(`${this.publicUrl}/`, '');
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private generateTitle(prompt?: string, contentType?: string): string {
    if (prompt) {
      // Take first 50 chars of prompt
      return prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
    }
    const typeNames: Record<string, string> = {
      image: 'AI Image',
      video: 'AI Video',
      logo: 'AI Logo',
      audio: 'AI Audio',
      pdf: 'Document',
      text: 'AI Text',
    };
    return `${typeNames[contentType || 'image']} ${new Date().toLocaleDateString()}`;
  }

  private getMimeType(contentType: string): string {
    const mimeTypes: Record<string, string> = {
      image: 'image/jpeg',
      video: 'video/mp4',
      logo: 'image/png',
      audio: 'audio/mpeg',
      pdf: 'application/pdf',
      text: 'text/plain',
    };
    return mimeTypes[contentType] || 'application/octet-stream';
  }

  private getExtension(mimeType: string, contentType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
    };

    if (mimeToExt[mimeType]) {
      return mimeToExt[mimeType];
    }

    const typeToExt: Record<string, string> = {
      image: 'jpg',
      video: 'mp4',
      logo: 'png',
      audio: 'mp3',
      pdf: 'pdf',
      text: 'txt',
    };

    return typeToExt[contentType] || 'bin';
  }
}
