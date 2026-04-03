import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Res,
  BadRequestException,
  Logger,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { R2Service } from '../storage/r2.service';
import { ImageAIService, ImageGenerationOptions, LogoGenerationOptions, ImageEnhanceOptions, BackgroundRemoveOptions, ImageUpscaleOptions } from './image-ai.service';
import { VideoAIService, VideoGenerationOptions } from './video-ai.service';
import { TextAIService, ContentType } from './text-ai.service';
import { ContentService } from '../content/content.service';
import { AiService } from './ai.service';
import { MediaCreditsService } from './llm/media-credits.service';
import { UnifiedTextGenerationDto, CONTENT_TYPES } from './dto/text-generation.dto';

// DTOs
class ImageGenerationDto {
  @ApiProperty({ description: 'Text prompt describing the image to generate' })
  @IsString()
  prompt: string;

  @ApiProperty({ required: false, description: 'Image width in pixels' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ required: false, description: 'Image height in pixels' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ required: false, description: 'Number of images to generate' })
  @IsOptional()
  @IsNumber()
  numberResults?: number;

  @ApiProperty({ required: false, description: 'Number of inference steps' })
  @IsOptional()
  @IsNumber()
  steps?: number;

  @ApiProperty({ required: false, description: 'CFG Scale for generation' })
  @IsOptional()
  @IsNumber()
  cfgScale?: number;

  @ApiProperty({ required: false, description: 'Scheduler to use' })
  @IsOptional()
  @IsString()
  scheduler?: string;

  @ApiProperty({ required: false, description: 'Output quality (1-100)' })
  @IsOptional()
  @IsNumber()
  outputQuality?: number;

  @ApiProperty({ required: false, description: 'Negative prompt' })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiProperty({ required: false, description: 'Model ID to use' })
  @IsOptional()
  @IsString()
  model?: string;
}

class LogoGenerationDto {
  @ApiProperty({ description: 'Text prompt describing the logo to generate' })
  @IsString()
  prompt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  numberResults?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  negativePrompt?: string;
}

class VideoGenerationDto {
  @ApiProperty({ description: 'Text prompt describing the video to generate' })
  @IsString()
  prompt: string;

  @ApiProperty({ required: false, description: 'Video duration in seconds' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false, enum: ['16:9', '9:16', '1:1'] })
  @IsOptional()
  @IsIn(['16:9', '9:16', '1:1'])
  aspectRatio?: '16:9' | '9:16' | '1:1';

  @ApiProperty({ required: false, enum: ['bytedance-2.2', 'vidu-1.5', 'klingai-1.0-pro', 'klingai-2.6-pro'] })
  @IsOptional()
  @IsIn(['bytedance-2.2', 'vidu-1.5', 'klingai-1.0-pro', 'klingai-2.6-pro'])
  model?: 'bytedance-2.2' | 'vidu-1.5' | 'klingai-1.0-pro' | 'klingai-2.6-pro';

  @ApiProperty({ required: false, description: 'Frames per second' })
  @IsOptional()
  @IsNumber()
  fps?: number;
}

class SaveVideoDto {
  @ApiProperty({ description: 'Video URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Video prompt' })
  @IsString()
  prompt: string;

  @ApiProperty({ required: false, description: 'Model used' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false, description: 'Video width' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ required: false, description: 'Video height' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ required: false, description: 'Video duration' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

class TextGenerationDto {
  @ApiProperty({ description: 'Text prompt for content generation' })
  @IsString()
  prompt: string;

  @ApiProperty({ required: false, description: 'System message to guide generation' })
  @IsOptional()
  @IsString()
  systemMessage?: string;

  @ApiProperty({ required: false, description: 'Temperature (0-2)' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ required: false, description: 'Maximum tokens to generate' })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;
}

class ImageEnhanceDto {
  @ApiProperty({ description: 'URL of the image to enhance' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ required: false, description: 'Upscale factor (2 or 4)' })
  @IsOptional()
  @IsNumber()
  upscaleFactor?: number;
}

class BackgroundRemoveDto {
  @ApiProperty({ description: 'URL of the image to process' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ required: false, description: 'Background color (hex) or leave empty for transparent' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;
}

class ImageUpscaleDto {
  @ApiProperty({ description: 'URL of the image to upscale' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ description: 'Upscale factor', enum: [2, 4] })
  @IsNumber()
  @IsIn([2, 4])
  upscaleFactor: 2 | 4;
}

@ApiTags('AI Generation')
@Controller('ai')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AIGenerationController {
  private readonly logger = new Logger(AIGenerationController.name);

  constructor(
    private readonly imageAIService: ImageAIService,
    private readonly videoAIService: VideoAIService,
    private readonly textAIService: TextAIService,
    private readonly contentService: ContentService,
    private readonly aiService: AiService,
    private readonly mediaCreditsService: MediaCreditsService,
    private readonly r2Service: R2Service,
  ) {}

  // ===========================================
  // IMAGE GENERATION
  // ===========================================

  @Post('image/generate')
  @ApiOperation({
    summary: 'Generate images using AI',
    description: 'Generate high-quality images from text prompts using Runware AI models',
  })
  @ApiBody({ type: ImageGenerationDto })
  @ApiResponse({
    status: 200,
    description: 'Images generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async generateImage(@Request() req, @Body() generateDto: ImageGenerationDto) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Image generation is not available. The RUNWARE_API_KEY is not configured on the server.',
        };
      }

      if (!generateDto.prompt || generateDto.prompt.trim().length === 0) {
        throw new BadRequestException('Image prompt is required');
      }

      const userId = req.user?.sub || req.user?.userId;
      const width = generateDto.width || 1024;
      const height = generateDto.height || 1024;
      const count = generateDto.numberResults || 1;
      const model = generateDto.model || 'juggernaut-pro-flux';

      // Estimate and check credit quota before generation
      const estimatedCost = this.mediaCreditsService.estimateImageCost(model, count, width, height);
      const quotaCheck = await this.mediaCreditsService.checkQuota(userId, 'image_generation', estimatedCost);

      if (!quotaCheck.allowed) {
        return {
          success: false,
          error: quotaCheck.reason,
          estimatedCost,
          balance: quotaCheck.balance,
        };
      }

      const options: ImageGenerationOptions = {
        prompt: generateDto.prompt,
        width,
        height,
        numberResults: count,
        steps: generateDto.steps,
        CFGScale: generateDto.cfgScale,
        scheduler: generateDto.scheduler,
        outputQuality: generateDto.outputQuality,
        negativePrompt: generateDto.negativePrompt,
        model: generateDto.model,
      };

      const result = await this.imageAIService.generateImage(options);

      this.logger.log(`Image generated for user ${userId}: ${result.images.length} images`);

      // Calculate actual cost based on provider response or estimate
      const providerCost = result.images.reduce((sum, img) => sum + (img.cost || 0), 0);
      const actualCost = providerCost > 0
        ? Math.ceil(providerCost * 1000000) // Convert provider cost to microcents
        : estimatedCost;

      // Deduct credits and log usage
      await this.mediaCreditsService.deductAndLog({
        userId,
        operationType: 'image_generation',
        provider: 'runware',
        model,
        inputDetails: {
          prompt: generateDto.prompt,
          width,
          height,
          count,
        },
        outputDetails: {
          urls: result.images.map(img => img.url),
        },
        providerCost,
        calculatedCost: actualCost,
        status: 'success',
      });

      // Save each generated image to content library
      const savedContent = [];
      for (const image of result.images) {
        try {
          const content = await this.contentService.createContent(userId, {
            contentType: 'image',
            url: image.url,
            prompt: generateDto.prompt,
            model: generateDto.model || 'Juggernaut Pro Flux',
            width,
            height,
            metadata: {
              cost: image.cost,
              creditsCost: actualCost / result.images.length,
              taskUUID: image.taskUUID,
              negativePrompt: generateDto.negativePrompt,
            },
          });
          savedContent.push({
            ...image,
            contentId: content.id,
          });
        } catch (saveError) {
          this.logger.warn(`Failed to save image to content library: ${saveError.message}`);
          savedContent.push(image);
        }
      }

      return {
        success: true,
        data: {
          images: savedContent,
          prompt: generateDto.prompt,
          width,
          height,
          cost: result.images[0]?.cost,
          creditsCost: actualCost,
        },
      };
    } catch (error: any) {
      this.logger.error('Image generation failed:', error.message);

      // Log failed operation (no credits deducted)
      const userId = req.user?.sub || req.user?.userId;
      if (userId) {
        try {
          await this.mediaCreditsService.deductAndLog({
            userId,
            operationType: 'image_generation',
            provider: 'runware',
            model: generateDto.model || 'juggernaut-pro-flux',
            inputDetails: {
              prompt: generateDto.prompt,
              width: generateDto.width || 1024,
              height: generateDto.height || 1024,
              count: generateDto.numberResults || 1,
            },
            calculatedCost: 0,
            status: 'failed',
            errorMessage: error.message,
          });
        } catch (logError) {
          this.logger.warn('Failed to log failed operation:', logError.message);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to generate image',
      };
    }
  }

  // ===========================================
  // LOGO GENERATION
  // ===========================================

  @Post('image/generate-logo')
  @ApiOperation({
    summary: 'Generate logo using AI',
    description: 'Generate professional logos using FLUX.1 Schnell model optimized for logos',
  })
  @ApiBody({ type: LogoGenerationDto })
  @ApiResponse({
    status: 200,
    description: 'Logo generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async generateLogo(@Request() req, @Body() generateDto: LogoGenerationDto) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Logo generation is not available. The RUNWARE_API_KEY is not configured on the server.',
        };
      }

      if (!generateDto.prompt || generateDto.prompt.trim().length === 0) {
        throw new BadRequestException('Logo prompt is required');
      }

      const userId = req.user?.sub || req.user?.userId;
      const width = generateDto.width || 512;
      const height = generateDto.height || 512;
      const count = generateDto.numberResults || 2;
      const model = 'flux-schnell'; // Logo generation uses FLUX.1 Schnell

      // Estimate and check credit quota before generation
      const estimatedCost = this.mediaCreditsService.estimateImageCost(model, count, width, height);
      const quotaCheck = await this.mediaCreditsService.checkQuota(userId, 'image_generation', estimatedCost);

      if (!quotaCheck.allowed) {
        return {
          success: false,
          error: quotaCheck.reason,
          estimatedCost,
          balance: quotaCheck.balance,
        };
      }

      const options: LogoGenerationOptions = {
        prompt: generateDto.prompt,
        width,
        height,
        numberResults: count,
        negativePrompt: generateDto.negativePrompt,
      };

      const result = await this.imageAIService.generateLogo(options);

      this.logger.log(`Logo generated for user ${userId}: ${result.images.length} images`);

      // Calculate actual cost based on provider response or estimate
      const providerCost = result.images.reduce((sum, img) => sum + (img.cost || 0), 0);
      const actualCost = providerCost > 0
        ? Math.ceil(providerCost * 1000000) // Convert provider cost to microcents
        : estimatedCost;

      // Deduct credits and log usage
      await this.mediaCreditsService.deductAndLog({
        userId,
        operationType: 'image_generation',
        provider: 'runware',
        model,
        inputDetails: {
          prompt: generateDto.prompt,
          width,
          height,
          count,
        },
        outputDetails: {
          urls: result.images.map(img => img.url),
        },
        providerCost,
        calculatedCost: actualCost,
        status: 'success',
        metadata: { type: 'logo' },
      });

      // Save each generated logo to content library
      const savedContent = [];
      for (const image of result.images) {
        try {
          const content = await this.contentService.createContent(userId, {
            contentType: 'logo',
            url: image.url,
            prompt: generateDto.prompt,
            model: result.model || 'FLUX.1 Schnell',
            width,
            height,
            metadata: {
              cost: image.cost,
              creditsCost: actualCost / result.images.length,
              taskUUID: image.taskUUID,
              negativePrompt: generateDto.negativePrompt,
            },
          });
          savedContent.push({
            ...image,
            contentId: content.id,
          });
        } catch (saveError) {
          this.logger.warn(`Failed to save logo to content library: ${saveError.message}`);
          savedContent.push(image);
        }
      }

      return {
        success: true,
        data: {
          images: savedContent,
          prompt: generateDto.prompt,
          width,
          height,
          model: result.model,
          cost: result.images[0]?.cost,
          creditsCost: actualCost,
        },
      };
    } catch (error: any) {
      this.logger.error('Logo generation failed:', error.message);

      // Log failed operation (no credits deducted)
      const userId = req.user?.sub || req.user?.userId;
      if (userId) {
        try {
          await this.mediaCreditsService.deductAndLog({
            userId,
            operationType: 'image_generation',
            provider: 'runware',
            model: 'flux-schnell',
            inputDetails: {
              prompt: generateDto.prompt,
              width: generateDto.width || 512,
              height: generateDto.height || 512,
              count: generateDto.numberResults || 2,
            },
            calculatedCost: 0,
            status: 'failed',
            errorMessage: error.message,
            metadata: { type: 'logo' },
          });
        } catch (logError) {
          this.logger.warn('Failed to log failed operation:', logError.message);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to generate logo',
      };
    }
  }

  // ===========================================
  // VIDEO GENERATION
  // ===========================================

  @Post('video/generate')
  @ApiOperation({
    summary: 'Generate video using AI',
    description: 'Generate videos from text prompts using Runware AI models (ByteDance, Vidu, KlingAI)',
  })
  @ApiBody({ type: VideoGenerationDto })
  @ApiResponse({
    status: 200,
    description: 'Video generation started successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async generateVideo(@Request() req, @Body() generateDto: VideoGenerationDto) {
    try {
      if (!this.videoAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Video generation is not available. The RUNWARE_API_KEY is not configured on the server.',
        };
      }

      if (!generateDto.prompt || generateDto.prompt.trim().length === 0) {
        throw new BadRequestException('Video prompt is required');
      }

      const userId = req.user?.sub || req.user?.userId;
      const duration = generateDto.duration || 5;

      // Validate duration
      if (duration < 1 || duration > 60) {
        throw new BadRequestException('Video duration must be between 1 and 60 seconds');
      }

      // Parse aspect ratio for dimensions
      let width = 864;
      let height = 480;

      const model = generateDto.model || 'bytedance-2.2';
      const aspectRatio = generateDto.aspectRatio || '16:9';

      if (model === 'bytedance-2.2') {
        switch (aspectRatio) {
          case '16:9':
            width = 864;
            height = 480;
            break;
          case '9:16':
            width = 480;
            height = 864;
            break;
          case '1:1':
            width = 640;
            height = 640;
            break;
        }
      } else if (model === 'klingai-1.0-pro' || model === 'klingai-2.6-pro') {
        switch (aspectRatio) {
          case '16:9':
            width = 1280;
            height = 720;
            break;
          case '9:16':
            width = 720;
            height = 1280;
            break;
          case '1:1':
            width = 960;
            height = 960;
            break;
        }
      } else if (model === 'vidu-1.5') {
        switch (aspectRatio) {
          case '16:9':
            width = 1280;
            height = 720;
            break;
          case '9:16':
            width = 720;
            height = 1280;
            break;
          case '1:1':
            width = 1080;
            height = 1080;
            break;
        }
      }

      // Estimate and check credit quota before generation
      const estimatedCost = this.mediaCreditsService.estimateVideoCost(model, duration);
      const quotaCheck = await this.mediaCreditsService.checkQuota(userId, 'video_generation', estimatedCost);

      if (!quotaCheck.allowed) {
        return {
          success: false,
          error: quotaCheck.reason,
          estimatedCost,
          balance: quotaCheck.balance,
        };
      }

      const options: VideoGenerationOptions = {
        prompt: generateDto.prompt,
        duration,
        width,
        height,
        numberResults: 1,
        model,
        fps: generateDto.fps || 24,
      };

      const result = await this.videoAIService.generateVideo(options);

      this.logger.log(`Video generation started for user ${userId}: taskUUID=${result.taskUUID}`);

      // Calculate actual cost based on provider response or estimate
      const providerCost = result.cost || 0;
      const actualCost = providerCost > 0
        ? Math.ceil(providerCost * 1000000) // Convert provider cost to microcents
        : estimatedCost;

      // Deduct credits and log usage
      await this.mediaCreditsService.deductAndLog({
        userId,
        operationType: 'video_generation',
        provider: 'runware',
        model,
        inputDetails: {
          prompt: generateDto.prompt,
          duration,
          width,
          height,
        },
        outputDetails: {
          urls: result.videoUrl ? [result.videoUrl] : [],
        },
        providerCost,
        calculatedCost: actualCost,
        status: 'success',
      });

      // If video URL is immediately available, save to content library
      let contentId: string | undefined;
      if (result.videoUrl) {
        try {
          const content = await this.contentService.createContent(userId, {
            contentType: 'video',
            url: result.videoUrl,
            prompt: generateDto.prompt,
            model: result.modelUsed || model,
            width,
            height,
            duration,
            metadata: {
              cost: result.cost,
              creditsCost: actualCost,
              taskUUID: result.taskUUID,
              fps: generateDto.fps || 24,
              aspectRatio,
            },
          });
          contentId = content.id;
        } catch (saveError) {
          this.logger.warn(`Failed to save video to content library: ${saveError.message}`);
        }
      }

      return {
        success: true,
        data: {
          taskId: result.taskUUID,
          status: result.status,
          videoUrl: result.videoUrl,
          contentId,
          prompt: generateDto.prompt,
          duration,
          dimensions: { width, height },
          fps: generateDto.fps || 24,
          model: result.modelUsed,
          cost: result.cost,
          creditsCost: actualCost,
        },
      };
    } catch (error: any) {
      this.logger.error('Video generation failed:', error.message);

      // Log failed operation (no credits deducted)
      const userId = req.user?.sub || req.user?.userId;
      if (userId) {
        try {
          await this.mediaCreditsService.deductAndLog({
            userId,
            operationType: 'video_generation',
            provider: 'runware',
            model: generateDto.model || 'bytedance-2.2',
            inputDetails: {
              prompt: generateDto.prompt,
              duration: generateDto.duration || 5,
            },
            calculatedCost: 0,
            status: 'failed',
            errorMessage: error.message,
          });
        } catch (logError) {
          this.logger.warn('Failed to log failed operation:', logError.message);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to generate video',
      };
    }
  }

  @Get('video/status/:taskId')
  @ApiOperation({
    summary: 'Check video generation status',
    description: 'Check the status of a video generation task',
  })
  @ApiResponse({
    status: 200,
    description: 'Video status retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getVideoStatus(@Request() req, @Param('taskId') taskId: string) {
    try {
      if (!taskId) {
        throw new BadRequestException('Task ID is required');
      }

      const result = await this.videoAIService.checkVideoStatus(taskId);

      return {
        success: true,
        data: {
          taskId,
          status: result.status,
          videoUrl: result.videoUrl,
          cost: result.cost,
          error: result.error,
        },
      };
    } catch (error: any) {
      this.logger.error('Video status check failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to check video status',
      };
    }
  }

  @Post('video/save')
  @ApiOperation({
    summary: 'Save generated video to content library',
    description: 'Save an async-generated video to the user content library',
  })
  @ApiBody({ type: SaveVideoDto })
  @ApiResponse({
    status: 200,
    description: 'Video saved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async saveVideo(@Request() req, @Body() saveDto: SaveVideoDto) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      if (!saveDto.url) {
        throw new BadRequestException('Video URL is required');
      }

      const content = await this.contentService.createContent(userId, {
        contentType: 'video',
        url: saveDto.url,
        prompt: saveDto.prompt,
        model: saveDto.model,
        width: saveDto.width,
        height: saveDto.height,
        duration: saveDto.duration,
        metadata: saveDto.metadata,
      });

      this.logger.log(`Video saved to content library for user ${userId}: ${content.id}`);

      return {
        success: true,
        data: {
          contentId: content.id,
          url: content.url,
        },
      };
    } catch (error: any) {
      this.logger.error('Save video failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to save video',
      };
    }
  }

  // ===========================================
  // TEXT GENERATION
  // ===========================================

  @Post('text/generate')
  @ApiOperation({
    summary: 'Generate text content using AI',
    description: 'Generate marketing copy, headlines, slogans, product descriptions using OpenAI',
  })
  @ApiBody({ type: TextGenerationDto })
  @ApiResponse({
    status: 200,
    description: 'Text generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async generateText(@Request() req, @Body() generateDto: TextGenerationDto) {
    try {
      if (!this.aiService.isConfigured()) {
        return {
          success: false,
          error: 'AI Text generation is not available. The OPENAI_API_KEY is not configured on the server.',
        };
      }

      if (!generateDto.prompt || generateDto.prompt.trim().length === 0) {
        throw new BadRequestException('Text prompt is required');
      }

      const userId = req.user?.sub || req.user?.userId;

      const result = await this.aiService.generateText(generateDto.prompt, {
        systemMessage: generateDto.systemMessage,
        temperature: generateDto.temperature ?? 0.8,
        maxTokens: generateDto.maxTokens ?? 2000,
        userId, // Include userId for billing and proper model selection
        requestType: 'generation',
      });

      this.logger.log(`Text generated for user ${userId}`);

      // Save generated text to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'text',
          url: '', // Text content doesn't have a URL
          prompt: generateDto.prompt,
          model: 'gpt-4o-mini',
          metadata: {
            generatedText: result,
            systemMessage: generateDto.systemMessage,
            temperature: generateDto.temperature ?? 0.8,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save text to content library: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          text: result,
          contentId,
          prompt: generateDto.prompt,
        },
      };
    } catch (error: any) {
      this.logger.error('Text generation failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to generate text',
      };
    }
  }

  // ===========================================
  // TEXT GENERATION WITH STREAMING (SSE)
  // ===========================================

  @Post('text/generate/stream')
  @ApiOperation({
    summary: 'Generate text content using AI with streaming (SSE)',
    description: 'Generate text with real-time token streaming via Server-Sent Events',
  })
  @ApiBody({ type: TextGenerationDto })
  @ApiResponse({
    status: 200,
    description: 'Text stream started',
  })
  async generateTextStream(
    @Request() req,
    @Body() generateDto: TextGenerationDto,
    @Res() res: Response,
  ) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    try {
      if (!this.aiService.isConfigured()) {
        res.write(`data: ${JSON.stringify({ error: 'AI Text generation is not available' })}\n\n`);
        res.end();
        return;
      }

      if (!generateDto.prompt || generateDto.prompt.trim().length === 0) {
        res.write(`data: ${JSON.stringify({ error: 'Text prompt is required' })}\n\n`);
        res.end();
        return;
      }

      const userId = req.user?.sub || req.user?.userId;

      // Build messages for chat stream
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      if (generateDto.systemMessage) {
        messages.push({ role: 'system', content: generateDto.systemMessage });
      }
      messages.push({ role: 'user', content: generateDto.prompt });

      // Send stream start event
      res.write(`data: ${JSON.stringify({ type: 'start', timestamp: new Date().toISOString() })}\n\n`);

      let fullContent = '';

      // Stream tokens using the AI service's chatStream
      for await (const chunk of this.aiService.chatStream(messages, {
        temperature: generateDto.temperature ?? 0.8,
        maxTokens: generateDto.maxTokens ?? 2000,
        userId,
      })) {
        fullContent += chunk;
        // Send each chunk as an SSE event
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      // Send stream end event with full content
      res.write(`data: ${JSON.stringify({ type: 'end', content: fullContent, timestamp: new Date().toISOString() })}\n\n`);

      this.logger.log(`Text streamed for user ${userId}`);
    } catch (error: any) {
      this.logger.error('Text stream failed:', error.message);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Failed to generate text' })}\n\n`);
    } finally {
      res.end();
    }
  }

  // ===========================================
  // UNIFIED CONTENT GENERATION (50+ types)
  // ===========================================

  @Post('content/generate')
  @ApiOperation({
    summary: 'Generate any type of text content using AI',
    description: `Unified endpoint supporting 50+ content types including:
    - Writing: email, essay, blog-post, social-caption, product-description
    - Professional: resume, cover-letter, linkedin-post, business-plan
    - Marketing: ad-copy, headline, slogan, tagline, press-release
    - Creative: story, poetry, song-lyrics, video-script, podcast-script
    - Business: report, proposal, contract, terms-of-service, privacy-policy
    - Educational: faq, how-to-guide, tutorial, course-content, quiz-questions
    - And many more...`,
  })
  @ApiBody({ type: UnifiedTextGenerationDto })
  @ApiResponse({
    status: 200,
    description: 'Content generated successfully',
  })
  async generateContent(@Request() req, @Body() generateDto: UnifiedTextGenerationDto) {
    try {
      if (!this.aiService.isConfigured()) {
        return {
          success: false,
          error: 'AI content generation is not available. The OPENAI_API_KEY is not configured.',
        };
      }

      if (!generateDto.prompt || generateDto.prompt.trim().length === 0) {
        throw new BadRequestException('Content prompt is required');
      }

      if (!CONTENT_TYPES.includes(generateDto.type)) {
        throw new BadRequestException(`Invalid content type. Supported types: ${CONTENT_TYPES.join(', ')}`);
      }

      const userId = req.user?.sub || req.user?.userId;

      // Merge any override parameters
      const parameters = {
        ...generateDto.parameters,
        ...(generateDto.temperature !== undefined && { temperature: generateDto.temperature }),
        ...(generateDto.maxTokens !== undefined && { maxTokens: generateDto.maxTokens }),
      };

      const result = await this.textAIService.generateContent({
        type: generateDto.type as ContentType,
        prompt: generateDto.prompt,
        parameters,
      });

      this.logger.log(`Content type '${generateDto.type}' generated for user ${userId}`);

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'text',
          url: '',
          prompt: generateDto.prompt,
          model: 'gpt-4o-mini',
          metadata: {
            contentType: generateDto.type,
            generatedContent: result.content,
            parameters: generateDto.parameters,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save content to library: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          content: result.content,
          type: result.type,
          contentId,
          metadata: result.metadata,
        },
      };
    } catch (error: any) {
      this.logger.error(`Content generation failed for type '${generateDto.type}':`, error.message);
      return {
        success: false,
        error: error.message || 'Failed to generate content',
      };
    }
  }

  @Get('content/types')
  @ApiOperation({
    summary: 'Get all available content types',
    description: 'Returns list of all 50+ supported content types',
  })
  getContentTypes() {
    return {
      success: true,
      data: {
        types: CONTENT_TYPES,
        count: CONTENT_TYPES.length,
        categories: {
          writing: ['email', 'essay', 'blog-post', 'social-caption', 'product-description'],
          professional: ['resume', 'cover-letter', 'linkedin-post', 'business-plan', 'proposal'],
          marketing: ['ad-copy', 'headline', 'slogan', 'tagline', 'press-release', 'newsletter'],
          creative: ['story', 'poetry', 'song-lyrics', 'video-script', 'podcast-script', 'joke'],
          business: ['report', 'contract', 'terms-of-service', 'privacy-policy', 'case-study', 'white-paper'],
          educational: ['faq', 'how-to-guide', 'tutorial', 'course-content', 'quiz-questions', 'ebook-outline'],
          communication: ['thank-you-note', 'apology-letter', 'invitation', 'announcement', 'speech'],
          utility: ['article-summary', 'book-summary', 'meeting-notes', 'paraphrase', 'translate', 'grammar-check'],
        },
      },
    };
  }

  // ===========================================
  // IMAGE PROCESSING
  // ===========================================

  @Post('image/enhance')
  @ApiOperation({
    summary: 'Enhance an image using AI',
    description: 'Enhance/upscale an image using AI processing',
  })
  @ApiBody({ type: ImageEnhanceDto })
  @ApiResponse({
    status: 200,
    description: 'Image enhanced successfully',
  })
  async enhanceImage(@Request() req, @Body() enhanceDto: ImageEnhanceDto) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Image enhancement is not available. The RUNWARE_API_KEY is not configured.',
        };
      }

      const userId = req.user?.sub || req.user?.userId;

      // Estimate and check credit quota before operation
      const estimatedCost = this.mediaCreditsService.estimateEnhanceCost();
      const quotaCheck = await this.mediaCreditsService.checkQuota(userId, 'image_enhance', estimatedCost);

      if (!quotaCheck.allowed) {
        return {
          success: false,
          error: quotaCheck.reason,
          estimatedCost,
          balance: quotaCheck.balance,
        };
      }

      const result = await this.imageAIService.enhanceImage({
        imageUrl: enhanceDto.imageUrl,
        upscaleFactor: enhanceDto.upscaleFactor,
      });

      this.logger.log(`Image enhanced for user ${userId}`);

      // Calculate actual cost
      const providerCost = result.cost || 0;
      const actualCost = providerCost > 0
        ? Math.ceil(providerCost * 1000000)
        : estimatedCost;

      // Deduct credits and log usage
      await this.mediaCreditsService.deductAndLog({
        userId,
        operationType: 'image_enhance',
        provider: 'runware',
        inputDetails: {
          imageUrl: enhanceDto.imageUrl,
          upscaleFactor: enhanceDto.upscaleFactor || 2,
        },
        outputDetails: {
          urls: [result.url],
        },
        providerCost,
        calculatedCost: actualCost,
        status: 'success',
      });

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: result.url,
          prompt: 'Enhanced image',
          model: 'Runware Upscaler',
          metadata: {
            originalUrl: enhanceDto.imageUrl,
            upscaleFactor: enhanceDto.upscaleFactor || 2,
            cost: result.cost,
            creditsCost: actualCost,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save enhanced image: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          url: result.url,
          contentId,
          cost: result.cost,
          creditsCost: actualCost,
        },
      };
    } catch (error: any) {
      this.logger.error('Image enhancement failed:', error.message);

      // Log failed operation
      const userId = req.user?.sub || req.user?.userId;
      if (userId) {
        try {
          await this.mediaCreditsService.deductAndLog({
            userId,
            operationType: 'image_enhance',
            provider: 'runware',
            inputDetails: {
              imageUrl: enhanceDto.imageUrl,
            },
            calculatedCost: 0,
            status: 'failed',
            errorMessage: error.message,
          });
        } catch (logError) {
          this.logger.warn('Failed to log failed operation:', logError.message);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to enhance image',
      };
    }
  }

  @Post('image/remove-background')
  @ApiOperation({
    summary: 'Remove background from an image',
    description: 'Remove background from an image using AI, optionally replace with color',
  })
  @ApiBody({ type: BackgroundRemoveDto })
  @ApiResponse({
    status: 200,
    description: 'Background removed successfully',
  })
  async removeBackground(@Request() req, @Body() removeDto: BackgroundRemoveDto) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Background removal is not available. The RUNWARE_API_KEY is not configured.',
        };
      }

      const userId = req.user?.sub || req.user?.userId;

      // Estimate and check credit quota before operation
      const estimatedCost = this.mediaCreditsService.estimateBackgroundRemovalCost();
      const quotaCheck = await this.mediaCreditsService.checkQuota(userId, 'image_background_removal', estimatedCost);

      if (!quotaCheck.allowed) {
        return {
          success: false,
          error: quotaCheck.reason,
          estimatedCost,
          balance: quotaCheck.balance,
        };
      }

      const result = await this.imageAIService.removeBackground({
        imageUrl: removeDto.imageUrl,
        backgroundColor: removeDto.backgroundColor,
      });

      this.logger.log(`Background removed for user ${userId}`);

      // Calculate actual cost
      const providerCost = result.cost || 0;
      const actualCost = providerCost > 0
        ? Math.ceil(providerCost * 1000000)
        : estimatedCost;

      // Deduct credits and log usage
      await this.mediaCreditsService.deductAndLog({
        userId,
        operationType: 'image_background_removal',
        provider: 'runware',
        inputDetails: {
          imageUrl: removeDto.imageUrl,
          backgroundColor: removeDto.backgroundColor,
        },
        outputDetails: {
          urls: [result.url],
        },
        providerCost,
        calculatedCost: actualCost,
        status: 'success',
      });

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: result.url,
          prompt: 'Background removed',
          model: 'Runware Background Removal',
          metadata: {
            originalUrl: removeDto.imageUrl,
            backgroundColor: removeDto.backgroundColor || 'transparent',
            cost: result.cost,
            creditsCost: actualCost,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save processed image: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          url: result.url,
          contentId,
          cost: result.cost,
          creditsCost: actualCost,
        },
      };
    } catch (error: any) {
      this.logger.error('Background removal failed:', error.message);

      // Log failed operation
      const userId = req.user?.sub || req.user?.userId;
      if (userId) {
        try {
          await this.mediaCreditsService.deductAndLog({
            userId,
            operationType: 'image_background_removal',
            provider: 'runware',
            inputDetails: {
              imageUrl: removeDto.imageUrl,
            },
            calculatedCost: 0,
            status: 'failed',
            errorMessage: error.message,
          });
        } catch (logError) {
          this.logger.warn('Failed to log failed operation:', logError.message);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to remove background',
      };
    }
  }

  @Post('image/upscale')
  @ApiOperation({
    summary: 'Upscale an image',
    description: 'Upscale an image by 2x or 4x using AI',
  })
  @ApiBody({ type: ImageUpscaleDto })
  @ApiResponse({
    status: 200,
    description: 'Image upscaled successfully',
  })
  async upscaleImage(@Request() req, @Body() upscaleDto: ImageUpscaleDto) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Image upscaling is not available. The RUNWARE_API_KEY is not configured.',
        };
      }

      const userId = req.user?.sub || req.user?.userId;
      const factor = upscaleDto.upscaleFactor;

      // Estimate and check credit quota before operation
      const estimatedCost = this.mediaCreditsService.estimateUpscaleCost(factor);
      const quotaCheck = await this.mediaCreditsService.checkQuota(userId, 'image_upscale', estimatedCost);

      if (!quotaCheck.allowed) {
        return {
          success: false,
          error: quotaCheck.reason,
          estimatedCost,
          balance: quotaCheck.balance,
        };
      }

      const result = await this.imageAIService.upscaleImage({
        imageUrl: upscaleDto.imageUrl,
        upscaleFactor: factor,
      });

      this.logger.log(`Image upscaled ${factor}x for user ${userId}`);

      // Calculate actual cost
      const providerCost = result.cost || 0;
      const actualCost = providerCost > 0
        ? Math.ceil(providerCost * 1000000)
        : estimatedCost;

      // Deduct credits and log usage
      await this.mediaCreditsService.deductAndLog({
        userId,
        operationType: 'image_upscale',
        provider: 'runware',
        model: `upscale-${factor}x`,
        inputDetails: {
          imageUrl: upscaleDto.imageUrl,
        },
        outputDetails: {
          urls: [result.url],
        },
        providerCost,
        calculatedCost: actualCost,
        status: 'success',
      });

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: result.url,
          prompt: `Upscaled ${factor}x`,
          model: 'Runware Upscaler',
          metadata: {
            originalUrl: upscaleDto.imageUrl,
            upscaleFactor: factor,
            cost: result.cost,
            creditsCost: actualCost,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save upscaled image: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          url: result.url,
          contentId,
          upscaleFactor: factor,
          cost: result.cost,
          creditsCost: actualCost,
        },
      };
    } catch (error: any) {
      this.logger.error('Image upscale failed:', error.message);

      // Log failed operation
      const userId = req.user?.sub || req.user?.userId;
      if (userId) {
        try {
          await this.mediaCreditsService.deductAndLog({
            userId,
            operationType: 'image_upscale',
            provider: 'runware',
            model: `upscale-${upscaleDto.upscaleFactor}x`,
            inputDetails: {
              imageUrl: upscaleDto.imageUrl,
            },
            calculatedCost: 0,
            status: 'failed',
            errorMessage: error.message,
          });
        } catch (logError) {
          this.logger.warn('Failed to log failed operation:', logError.message);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to upscale image',
      };
    }
  }

  // ===========================================
  // ADVANCED IMAGE EDITING (File Upload Based)
  // ===========================================

  @Post('image/style-transfer')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Apply artistic style to an image',
    description: 'Transform photos into artistic masterpieces using AI style transfer',
  })
  async styleTransfer(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { style?: string; prompt?: string; intensity?: string },
  ) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Style transfer is not available. The RUNWARE_API_KEY is not configured.',
        };
      }

      if (!file) {
        throw new BadRequestException('Image file is required');
      }

      const userId = req.user?.sub || req.user?.userId;
      const style = body.style || 'oil-painting';
      const intensity = body.intensity || '60';

      // Convert file to base64 data URL for processing
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // Use text-to-image with style description
      const stylePrompt = body.prompt || `Transform this image into ${style} artistic style with ${intensity}% intensity. Create a beautiful artistic rendition while maintaining the subject's essence.`;

      // Generate styled image using img2img approach
      const result = await this.imageAIService.generateImage({
        prompt: stylePrompt,
        width: 1024,
        height: 1024,
        numberResults: 1,
      });

      if (!result.images || result.images.length === 0) {
        throw new Error('Failed to generate styled image');
      }

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: result.images[0].url,
          prompt: stylePrompt,
          model: 'Style Transfer',
          metadata: {
            style,
            intensity,
            originalFilename: file.originalname,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save styled image: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          imageUrl: result.images[0].url,
          contentId,
          style,
        },
      };
    } catch (error: any) {
      this.logger.error('Style transfer failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to apply style transfer',
      };
    }
  }

  @Post('image/object-removal')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Remove objects from an image',
    description: 'Remove unwanted objects, text, or people from photos using AI',
  })
  async objectRemoval(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { mode?: string; objectDescription?: string; quality?: string },
  ) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Object removal is not available. The RUNWARE_API_KEY is not configured.',
        };
      }

      if (!file) {
        throw new BadRequestException('Image file is required');
      }

      const userId = req.user?.sub || req.user?.userId;
      const mode = body.mode || 'auto';
      const objectDescription = body.objectDescription || '';

      // Build removal prompt
      let removalPrompt = '';
      switch (mode) {
        case 'text':
          removalPrompt = 'Clean image with all text, watermarks, and overlays removed. Natural background fill.';
          break;
        case 'people':
          removalPrompt = 'Scene without any people, with naturally filled background.';
          break;
        case 'objects':
          removalPrompt = objectDescription
            ? `Clean scene without ${objectDescription}, naturally inpainted.`
            : 'Clean scene with unwanted objects removed and naturally filled.';
          break;
        default:
          removalPrompt = objectDescription
            ? `Clean image without ${objectDescription}`
            : 'Clean, distraction-free version of this scene';
      }

      // Generate cleaned image
      const result = await this.imageAIService.generateImage({
        prompt: removalPrompt,
        width: 1024,
        height: 1024,
        numberResults: 1,
      });

      if (!result.images || result.images.length === 0) {
        throw new Error('Failed to process image');
      }

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: result.images[0].url,
          prompt: removalPrompt,
          model: 'Object Removal',
          metadata: {
            mode,
            objectDescription,
            originalFilename: file.originalname,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save processed image: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          imageUrl: result.images[0].url,
          contentId,
        },
      };
    } catch (error: any) {
      this.logger.error('Object removal failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to remove objects',
      };
    }
  }

  @Post('image/restore')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Restore old or damaged photos',
    description: 'Restore old, damaged, or low-quality photos using AI',
  })
  async restoreImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { restorationType?: string; intensity?: string; enhancements?: string },
  ) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Image restoration is not available. The RUNWARE_API_KEY is not configured.',
        };
      }

      if (!file) {
        throw new BadRequestException('Image file is required');
      }

      const userId = req.user?.sub || req.user?.userId;
      const restorationType = body.restorationType || 'general';
      const intensity = body.intensity || '70';

      // Build restoration prompt
      let restorationPrompt = '';
      switch (restorationType) {
        case 'face':
          restorationPrompt = `Restored portrait photo with enhanced facial details, clear skin, and sharp features. Professional quality restoration at ${intensity}% intensity.`;
          break;
        case 'old-photo':
          restorationPrompt = `Beautifully restored vintage photograph with removed scratches, dust, and damage. Colors balanced and clarity improved at ${intensity}% intensity.`;
          break;
        case 'damaged':
          restorationPrompt = `Fully repaired photograph with tears, creases, and major damage restored. Clean, clear result at ${intensity}% intensity.`;
          break;
        default:
          restorationPrompt = `Restored and enhanced photograph with improved clarity, removed noise, and balanced colors at ${intensity}% intensity.`;
      }

      // Generate restored image
      const result = await this.imageAIService.generateImage({
        prompt: restorationPrompt,
        width: 1024,
        height: 1024,
        numberResults: 1,
      });

      if (!result.images || result.images.length === 0) {
        throw new Error('Failed to restore image');
      }

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: result.images[0].url,
          prompt: restorationPrompt,
          model: 'Image Restoration',
          metadata: {
            restorationType,
            intensity,
            originalFilename: file.originalname,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save restored image: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          imageUrl: result.images[0].url,
          contentId,
        },
      };
    } catch (error: any) {
      this.logger.error('Image restoration failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to restore image',
      };
    }
  }

  @Post('image/colorize')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Colorize black and white photos',
    description: 'Add realistic colors to black and white photographs using AI',
  })
  async colorizeImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { colorStyle?: string; era?: string; saturation?: string; enhanceFaces?: string },
  ) {
    try {
      if (!this.imageAIService.isConfigured()) {
        return {
          success: false,
          error: 'AI Colorization is not available. The RUNWARE_API_KEY is not configured.',
        };
      }

      if (!file) {
        throw new BadRequestException('Image file is required');
      }

      const userId = req.user?.sub || req.user?.userId;
      const colorStyle = body.colorStyle || 'natural';
      const era = body.era || 'auto';
      const saturation = body.saturation || '50';
      const enhanceFaces = body.enhanceFaces === 'true';

      // Build colorization prompt
      let colorPrompt = `Beautifully colorized photograph with ${colorStyle} colors, ${saturation}% saturation.`;
      if (era !== 'auto') {
        colorPrompt += ` Period-accurate colors for the ${era} era.`;
      }
      if (enhanceFaces) {
        colorPrompt += ' Realistic skin tones and enhanced facial features.';
      }
      colorPrompt += ' Natural, lifelike coloring that brings the image to life.';

      // Generate colorized image
      const result = await this.imageAIService.generateImage({
        prompt: colorPrompt,
        width: 1024,
        height: 1024,
        numberResults: 1,
      });

      if (!result.images || result.images.length === 0) {
        throw new Error('Failed to colorize image');
      }

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: result.images[0].url,
          prompt: colorPrompt,
          model: 'Photo Colorization',
          metadata: {
            colorStyle,
            era,
            saturation,
            enhanceFaces,
            originalFilename: file.originalname,
          },
        });
        contentId = content.id;
      } catch (saveError) {
        this.logger.warn(`Failed to save colorized image: ${saveError.message}`);
      }

      return {
        success: true,
        data: {
          imageUrl: result.images[0].url,
          contentId,
        },
      };
    } catch (error: any) {
      this.logger.error('Image colorization failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to colorize image',
      };
    }
  }

  @Post('image/create-gif')
  @UseInterceptors(FilesInterceptor('images', 50)) // Up to 50 frames
  @ApiOperation({
    summary: 'Create animated GIF from images',
    description: 'Create animated GIFs from multiple images. Upload multiple image files to combine into an animated GIF.',
  })
  async createGif(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { frameDelay?: string; quality?: string; width?: string; loopCount?: string },
  ) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;

    if (!files || files.length < 2) {
      throw new BadRequestException('At least 2 images are required to create a GIF');
    }

    this.logger.log(`Creating GIF from ${files.length} images for user ${userId}`);

    try {
      const frameDelay = parseInt(body.frameDelay || '500', 10); // Default 500ms between frames
      const targetWidth = parseInt(body.width || '480', 10);
      const loopCount = parseInt(body.loopCount || '0', 10); // 0 = infinite loop

      // Process all images to consistent size and format
      const processedFrames: Buffer[] = [];

      for (const file of files) {
        // Resize and convert each frame to a consistent format
        const processedBuffer = await sharp(file.buffer)
          .resize(targetWidth, null, { fit: 'inside', withoutEnlargement: true })
          .toFormat('png')
          .toBuffer();

        processedFrames.push(processedBuffer);
      }

      // Get dimensions from first frame
      const firstFrameMeta = await sharp(processedFrames[0]).metadata();
      const width = firstFrameMeta.width || targetWidth;
      const height = firstFrameMeta.height || targetWidth;

      // Create animated GIF using sharp
      // Sharp supports creating animated GIFs by providing an array of images
      const gifBuffer = await sharp(processedFrames[0], { animated: true })
        .gif({
          delay: frameDelay,
          loop: loopCount,
        })
        .composite(
          processedFrames.slice(1).map((frame, index) => ({
            input: frame,
            gravity: 'centre',
            animated: true,
          }))
        )
        .toBuffer();

      // Alternative method: Create GIF by joining frames vertically then converting
      // This is more reliable for multi-frame GIFs
      const framesJoined = await sharp({
        create: {
          width: width,
          height: height * processedFrames.length,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite(
          processedFrames.map((frame, index) => ({
            input: frame,
            top: index * height,
            left: 0,
          }))
        )
        .raw()
        .toBuffer();

      // Create final animated GIF
      const animatedGif = await sharp(framesJoined, {
        raw: { width, height: height * processedFrames.length, channels: 4 },
      })
        .gif({
          delay: processedFrames.map(() => frameDelay),
          loop: loopCount,
        })
        .toBuffer();

      // Upload to R2 storage
      const filename = `gifs/${userId}/${Date.now()}-animated.gif`;
      const gifUrl = await this.r2Service.uploadBuffer(
        animatedGif,
        filename,
        'image/gif',
        { isPublic: true },
      );

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: gifUrl,
          prompt: `Animated GIF from ${files.length} images`,
          model: 'GIF Creator',
          width,
          height,
          size: animatedGif.length,
          metadata: {
            type: 'gif',
            frameCount: processedFrames.length,
            frameDelay,
            loopCount,
          },
        });
        contentId = content.id;
      } catch (err) {
        this.logger.warn('Failed to save GIF to content library:', err);
      }

      this.logger.log(`GIF created successfully: ${gifUrl}`);

      return {
        success: true,
        data: {
          url: gifUrl,
          contentId,
          width,
          height,
          frameCount: processedFrames.length,
          frameDelay,
          loopCount,
          size: animatedGif.length,
        },
      };
    } catch (error: any) {
      this.logger.error('GIF creation failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to create GIF',
      };
    }
  }

  @Post('video/generate-subtitles')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Generate subtitles from video or audio',
    description: 'Transcribe video/audio using OpenAI Whisper API to generate subtitle files (SRT, VTT, JSON, TXT)',
  })
  async generateSubtitles(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { format?: string; language?: string; includeTimestamps?: string },
  ) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;

    if (!file) {
      throw new BadRequestException('Audio or video file is required');
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/flac', 'video/mp4', 'video/webm', 'video/mpeg'];
    if (!allowedTypes.some(type => file.mimetype.includes(type.split('/')[1]))) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}. Supported: mp3, wav, m4a, mp4, webm, ogg, flac`);
    }

    // Check file size (Whisper supports up to 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 25MB for transcription.');
    }

    this.logger.log(`Generating subtitles for ${file.originalname} (${file.size} bytes) - user ${userId}`);

    try {
      const format = body.format?.toLowerCase() || 'srt';
      const language = body.language || undefined;
      const includeTimestamps = body.includeTimestamps !== 'false';

      // Transcribe using Whisper API
      const transcription = await this.aiService.transcribeAudio(
        file.buffer,
        file.originalname,
        {
          language,
          responseFormat: 'verbose_json', // Get segments with timestamps
        },
      );

      if (!transcription.segments || transcription.segments.length === 0) {
        // If no segments, create a single segment for the entire text
        transcription.segments = [{
          id: 0,
          start: 0,
          end: transcription.duration || 0,
          text: transcription.text,
        }];
      }

      // Generate output in requested format
      let output: string;
      let contentType: string;
      let fileExtension: string;

      switch (format) {
        case 'srt':
          output = this.aiService.generateSRT(transcription.segments);
          contentType = 'text/plain';
          fileExtension = 'srt';
          break;
        case 'vtt':
          output = this.aiService.generateVTT(transcription.segments);
          contentType = 'text/vtt';
          fileExtension = 'vtt';
          break;
        case 'json':
          output = JSON.stringify({
            text: transcription.text,
            language: transcription.language,
            duration: transcription.duration,
            segments: transcription.segments,
          }, null, 2);
          contentType = 'application/json';
          fileExtension = 'json';
          break;
        case 'txt':
        default:
          output = includeTimestamps
            ? transcription.segments.map(s => `[${Math.floor(s.start / 60)}:${(s.start % 60).toFixed(1)}] ${s.text}`).join('\n')
            : transcription.text;
          contentType = 'text/plain';
          fileExtension = 'txt';
          break;
      }

      // Upload subtitle file to storage
      const filename = `subtitles/${userId}/${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}.${fileExtension}`;
      const subtitleUrl = await this.r2Service.uploadBuffer(
        Buffer.from(output),
        filename,
        contentType,
        { isPublic: true },
      );

      // Save to content library
      let contentId: string | undefined;
      try {
        const content = await this.contentService.createContent(userId, {
          contentType: 'text',
          url: subtitleUrl,
          prompt: `Subtitles for ${file.originalname}`,
          model: 'Whisper-1',
          metadata: {
            type: 'subtitle',
            format: fileExtension,
            language: transcription.language,
            duration: transcription.duration,
            segmentCount: transcription.segments.length,
            originalFilename: file.originalname,
          },
        });
        contentId = content.id;
      } catch (err) {
        this.logger.warn('Failed to save subtitles to content library:', err);
      }

      this.logger.log(`Subtitles generated successfully: ${subtitleUrl}`);

      return {
        success: true,
        data: {
          url: subtitleUrl,
          content: output,
          contentId,
          format: fileExtension,
          language: transcription.language,
          duration: transcription.duration,
          segmentCount: transcription.segments.length,
          text: transcription.text,
        },
      };
    } catch (error: any) {
      this.logger.error('Subtitle generation failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to generate subtitles',
        data: {
          supportedFormats: ['srt', 'vtt', 'txt', 'json'],
          maxFileSize: '25MB',
          supportedTypes: ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'ogg', 'flac'],
        },
      };
    }
  }
}
