import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface VideoGenerationOptions {
  prompt: string;
  duration?: number;
  width?: number;
  height?: number;
  numberResults?: number;
  model?: string;
  fps?: number;
}

export interface VideoGenerationResult {
  taskUUID: string;
  status: string;
  videoUrl?: string;
  cost?: number;
  modelUsed?: string;
}

export interface VideoStatusResult {
  status: string;
  videoUrl?: string;
  cost?: number;
  error?: string;
  progress?: number;
}

@Injectable()
export class VideoAIService {
  private readonly logger = new Logger(VideoAIService.name);

  // Runware API Configuration
  private runwareApiKey: string | null = null;
  private runwareApiUrl: string;

  // Video Models Configuration
  private byteDanceModelId: string;
  private byteDanceModelName: string;
  private viduModelId: string;
  private viduModelName: string;
  private klingModelId: string;
  private klingModelName: string;
  private kling26ModelId: string;
  private kling26ModelName: string;

  // Default video settings
  private defaultDuration: number;
  private defaultWidth: number;
  private defaultHeight: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Runware API
    this.runwareApiKey = this.configService.get<string>('RUNWARE_API_KEY');
    this.runwareApiUrl = this.configService.get<string>('RUNWARE_API_URL', 'https://api.runware.ai/v1');

    // ByteDance 2.2 Video Model
    this.byteDanceModelId = this.configService.get<string>('BYTEDANCE_MODEL_ID', 'bytedance:2@2');
    this.byteDanceModelName = this.configService.get<string>('BYTEDANCE_MODEL_NAME', 'ByteDance 2.2');

    // Vidu 2.0 Video Model
    this.viduModelId = this.configService.get<string>('VIDU_MODEL_ID', 'vidu:2@0');
    this.viduModelName = this.configService.get<string>('VIDU_MODEL_NAME', 'Vidu 2.0');

    // KlingAI 1.0 Pro Video Model
    this.klingModelId = this.configService.get<string>('KLING_MODEL_ID', 'klingai:1@2');
    this.klingModelName = this.configService.get<string>('KLING_MODEL_NAME', 'KlingAI 1.0 Pro');

    // KlingAI 2.6 Pro Video Model
    this.kling26ModelId = this.configService.get<string>('KLING_2_6_MODEL_ID', 'klingai:2@6');
    this.kling26ModelName = this.configService.get<string>('KLING_2_6_MODEL_NAME', 'KlingAI 2.6 Pro');

    // Default settings
    this.defaultDuration = Number(this.configService.get<number>('VIDEO_DEFAULT_DURATION', 5));
    this.defaultWidth = Number(this.configService.get<number>('VIDU_DEFAULT_WIDTH', 1080));
    this.defaultHeight = Number(this.configService.get<number>('VIDU_DEFAULT_HEIGHT', 1080));

    if (this.runwareApiKey) {
      this.logger.log(`✅ Runware Video initialized`);
      this.logger.log(`   ByteDance: ${this.byteDanceModelName} (${this.byteDanceModelId})`);
      this.logger.log(`   Vidu: ${this.viduModelName} (${this.viduModelId})`);
      this.logger.log(`   KlingAI: ${this.klingModelName} (${this.klingModelId})`);
    } else {
      this.logger.warn('⚠️ RUNWARE_API_KEY not configured - video generation disabled');
    }
  }

  isConfigured(): boolean {
    return this.runwareApiKey !== null;
  }

  private getModelConfig(model: string): { modelId: string; modelName: string } {
    switch (model) {
      case 'vidu-1.5':
      case 'vidu-2.0':
        return { modelId: this.viduModelId, modelName: this.viduModelName };
      case 'klingai-1.0-pro':
        return { modelId: this.klingModelId, modelName: this.klingModelName };
      case 'klingai-2.6-pro':
        return { modelId: this.kling26ModelId, modelName: this.kling26ModelName };
      case 'bytedance-2.2':
      default:
        return { modelId: this.byteDanceModelId, modelName: this.byteDanceModelName };
    }
  }

  /**
   * Generate video using Runware API
   */
  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    if (!this.runwareApiKey) {
      throw new Error('Runware API key not configured');
    }

    const {
      prompt,
      duration = this.defaultDuration,
      width = 864,
      height = 480,
      numberResults = 1,
      model = 'bytedance-2.2',
      fps = 24,
    } = options;

    const { modelId, modelName } = this.getModelConfig(model);

    // Adjust duration for KlingAI models (only 5 or 10 seconds supported)
    let finalDuration = duration;
    if (model === 'klingai-1.0-pro' || model === 'klingai-2.6-pro') {
      finalDuration = duration <= 7 ? 5 : 10;
      this.logger.log(`KlingAI duration adjusted to ${finalDuration}s`);
    }

    const taskUUID = uuidv4();

    try {
      const requestPayload: any = {
        taskType: 'videoInference',
        taskUUID,
        duration: finalDuration,
        model: modelId,
        outputFormat: 'mp4',
        height,
        width,
        numberResults,
        includeCost: true,
        positivePrompt: prompt,
      };

      // Add fps for ByteDance and KlingAI models
      if (model === 'bytedance-2.2' || model === 'klingai-1.0-pro' || model === 'klingai-2.6-pro') {
        requestPayload.fps = fps;
      }

      const requestData = [requestPayload];

      this.logger.log(`🎬 Generating video with ${modelName}: "${prompt.substring(0, 50)}..."`);
      this.logger.log(`   Duration: ${finalDuration}s, Dimensions: ${width}x${height}, FPS: ${fps}`);

      const response = await firstValueFrom(
        this.httpService.post(this.runwareApiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${this.runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 300000, // 5 minutes timeout for video generation
        }),
      );

      // Parse the response - Runware returns an array
      const result = Array.isArray(response.data) ? response.data[0] : response.data;

      if (result.errors) {
        throw new Error(`Runware API error: ${JSON.stringify(result.errors)}`);
      }

      // Extract video from the response
      const video = result.data?.videos?.[0] || result.videos?.[0];
      const videoUrl = video?.videoURL || video?.url;
      const videoCost = video?.cost || result.cost || result.data?.cost || 0;

      this.logger.log(`✅ Video generation started - taskUUID: ${taskUUID}`);

      return {
        taskUUID: result.taskUUID || taskUUID,
        status: result.status || 'processing',
        videoUrl,
        cost: videoCost,
        modelUsed: modelName,
      };
    } catch (error: any) {
      this.logger.error('❌ Video generation failed:', error.message);
      if (error.response?.data) {
        this.logger.error('API Response:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(taskUUID: string): Promise<VideoStatusResult> {
    if (!this.runwareApiKey) {
      throw new Error('Runware API key not configured');
    }

    try {
      const requestData = [
        {
          taskType: 'getResponse',
          taskUUID,
        },
      ];

      const response = await firstValueFrom(
        this.httpService.post(this.runwareApiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${this.runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }),
      );

      const result = Array.isArray(response.data) ? response.data[0] : response.data;

      // Handle the data structure
      const taskData = result?.data?.[0] || result;
      const video = taskData?.videoURL || taskData?.imageURL;
      const videoCost = taskData?.cost || result.cost || result.data?.cost || 0;

      return {
        status: taskData?.status || 'unknown',
        videoUrl: video,
        cost: videoCost,
        error: result.error || result.errors?.[0],
      };
    } catch (error: any) {
      this.logger.error('❌ Video status check failed:', error.message);
      throw error;
    }
  }
}
