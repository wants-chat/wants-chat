import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  numberResults?: number;
  steps?: number;
  CFGScale?: number;
  scheduler?: string;
  outputQuality?: number;
  negativePrompt?: string;
  model?: string;
}

export interface LogoGenerationOptions extends ImageGenerationOptions {}

export interface ImageEnhanceOptions {
  imageUrl: string;
  enhanceType?: 'auto' | 'face' | 'general';
  upscaleFactor?: number;
}

export interface BackgroundRemoveOptions {
  imageUrl: string;
  backgroundColor?: string;
}

export interface ImageUpscaleOptions {
  imageUrl: string;
  upscaleFactor: 2 | 4;
}

export interface GeneratedImage {
  url: string;
  cost?: number;
  taskUUID?: string;
}

@Injectable()
export class ImageAIService {
  private readonly logger = new Logger(ImageAIService.name);

  // Runware API Configuration
  private runwareApiKey: string | null = null;
  private runwareApiUrl: string;

  // Juggernaut Pro Flux (default model)
  private defaultModelId: string;
  private defaultModelName: string;
  private defaultWidth: number;
  private defaultHeight: number;
  private defaultSteps: number;
  private defaultCfgScale: number;
  private defaultScheduler: string;
  private defaultOutputQuality: number;

  // FLUX.1 Schnell (fast/logo generation)
  private fluxSchnellModelId: string;
  private fluxSchnellModelName: string;
  private fluxSchnellSteps: number;
  private fluxSchnellCfgScale: number;
  private fluxSchnellScheduler: string;

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

    // Juggernaut Pro Flux Configuration
    this.defaultModelId = this.configService.get<string>('RUNWARE_MODEL_ID', 'rundiffusion:130@100');
    this.defaultModelName = this.configService.get<string>('RUNWARE_MODEL_NAME', 'Juggernaut Pro Flux');
    this.defaultWidth = Number(this.configService.get<number>('RUNWARE_DEFAULT_WIDTH', 1024));
    this.defaultHeight = Number(this.configService.get<number>('RUNWARE_DEFAULT_HEIGHT', 1024));
    this.defaultSteps = Number(this.configService.get<number>('RUNWARE_DEFAULT_STEPS', 33));
    this.defaultCfgScale = Number(this.configService.get<number>('RUNWARE_DEFAULT_CFG_SCALE', 3));
    this.defaultScheduler = this.configService.get<string>('RUNWARE_DEFAULT_SCHEDULER', 'Euler Beta');
    this.defaultOutputQuality = Number(this.configService.get<number>('RUNWARE_DEFAULT_OUTPUT_QUALITY', 85));

    // FLUX.1 Schnell Configuration
    this.fluxSchnellModelId = this.configService.get<string>('RUNWARE_FLUX_SCHNELL_MODEL_ID', 'runware:100@1');
    this.fluxSchnellModelName = this.configService.get<string>('RUNWARE_FLUX_SCHNELL_MODEL_NAME', 'FLUX.1 Schnell');
    this.fluxSchnellSteps = Number(this.configService.get<number>('RUNWARE_FLUX_SCHNELL_DEFAULT_STEPS', 4));
    this.fluxSchnellCfgScale = Number(this.configService.get<number>('RUNWARE_FLUX_SCHNELL_DEFAULT_CFG_SCALE', 1));
    this.fluxSchnellScheduler = this.configService.get<string>('RUNWARE_FLUX_SCHNELL_DEFAULT_SCHEDULER', 'FlowMatchEulerDiscreteScheduler');

    if (this.runwareApiKey) {
      this.logger.log(`✅ Runware initialized - Model: ${this.defaultModelName} (${this.defaultModelId})`);
      this.logger.log(`   FLUX Schnell: ${this.fluxSchnellModelName} (${this.fluxSchnellModelId})`);
    } else {
      this.logger.warn('⚠️ RUNWARE_API_KEY not configured - image generation disabled');
    }
  }

  isConfigured(): boolean {
    return this.runwareApiKey !== null;
  }

  /**
   * Generate images using Runware API with Juggernaut Pro Flux
   */
  async generateImage(options: ImageGenerationOptions): Promise<{ images: GeneratedImage[] }> {
    if (!this.runwareApiKey) {
      throw new Error('Runware API key not configured');
    }

    const {
      prompt,
      width = this.defaultWidth,
      height = this.defaultHeight,
      numberResults = 1,
      steps = this.defaultSteps,
      CFGScale = this.defaultCfgScale,
      scheduler = this.defaultScheduler,
      outputQuality = this.defaultOutputQuality,
      negativePrompt = '',
      model = this.defaultModelId,
    } = options;

    // Round dimensions to nearest multiple of 64 (Runware API requirement)
    const roundToMultiple64 = (n: number) => Math.round(n / 64) * 64;
    const finalWidth = Math.min(2048, Math.max(128, roundToMultiple64(width)));
    const finalHeight = Math.min(2048, Math.max(128, roundToMultiple64(height)));

    const taskUUID = uuidv4();

    try {
      const requestData = [
        {
          taskType: 'imageInference',
          taskUUID,
          model,
          positivePrompt: prompt,
          negativePrompt,
          width: finalWidth,
          height: finalHeight,
          numberResults,
          steps,
          CFGScale,
          scheduler,
          outputQuality,
          outputFormat: 'JPEG',
          checkNSFW: true,
          includeCost: true,
          outputType: ['URL'],
        },
      ];

      this.logger.log(`🎨 Generating image with ${this.defaultModelName}: "${prompt.substring(0, 50)}..."`);
      this.logger.log(`   Dimensions: ${finalWidth}x${finalHeight}, Steps: ${steps}, CFG: ${CFGScale}`);

      const response = await firstValueFrom(
        this.httpService.post(this.runwareApiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${this.runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }),
      );

      const runwareData = response.data;

      if (runwareData.errors && runwareData.errors.length > 0) {
        throw new Error(`Runware API error: ${JSON.stringify(runwareData.errors)}`);
      }

      const images = runwareData.data || [];

      this.logger.log(`✅ Generated ${images.length} image(s)`);

      return {
        images: images.map((item: any) => ({
          url: item.imageURL || item.url,
          cost: item.cost,
          taskUUID: item.taskUUID || taskUUID,
        })),
      };
    } catch (error: any) {
      this.logger.error('❌ Image generation failed:', error.message);
      if (error.response?.data) {
        this.logger.error('API Response:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Generate logo using FLUX.1 Schnell model (optimized for fast generation)
   */
  async generateLogo(options: LogoGenerationOptions): Promise<{ images: GeneratedImage[]; model?: string }> {
    if (!this.runwareApiKey) {
      throw new Error('Runware API key not configured');
    }

    const {
      prompt,
      width = 1024,
      height = 1024,
      numberResults = 1,
      negativePrompt = ''
    } = options;

    // Logo-specific prompt augmentation
    const logoStylePrefix = 'Professional logo design, minimalist vector style, clean lines, iconic symbol';
    const logoStyleSuffix = 'logo icon, brand identity, graphic design, scalable vector, transparent background ready, centered composition, simple shapes';
    const enhancedPrompt = `${logoStylePrefix}, ${prompt}, ${logoStyleSuffix}`;

    // Logo-specific negative prompt
    const logoNegativePrompt = negativePrompt
      ? `${negativePrompt}, realistic photo, photograph, 3D render, landscape, portrait, human face, complex scene, detailed background, text, watermark, blurry, low quality, distorted`
      : 'realistic photo, photograph, 3D render, landscape, portrait, human face, complex scene, detailed background, text, watermark, blurry, low quality, distorted, text artifacts';

    // Round dimensions to nearest multiple of 64
    const roundToMultiple64 = (n: number) => Math.round(n / 64) * 64;
    const finalWidth = Math.min(2048, Math.max(128, roundToMultiple64(width)));
    const finalHeight = Math.min(2048, Math.max(128, roundToMultiple64(height)));

    const taskUUID = uuidv4();

    try {
      const requestData = [
        {
          taskType: 'imageInference',
          taskUUID,
          model: this.fluxSchnellModelId,
          positivePrompt: enhancedPrompt,
          negativePrompt: logoNegativePrompt,
          width: finalWidth,
          height: finalHeight,
          numberResults,
          steps: this.fluxSchnellSteps,
          CFGScale: this.fluxSchnellCfgScale,
          scheduler: this.fluxSchnellScheduler,
          outputFormat: 'PNG',
          checkNSFW: true,
          includeCost: true,
          outputType: ['URL'],
        },
      ];

      this.logger.log(`🎨 Generating logo with ${this.fluxSchnellModelName}: "${prompt.substring(0, 50)}..."`);

      const response = await firstValueFrom(
        this.httpService.post(this.runwareApiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${this.runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }),
      );

      const runwareData = response.data;

      if (runwareData.errors && runwareData.errors.length > 0) {
        throw new Error(`Runware API error: ${JSON.stringify(runwareData.errors)}`);
      }

      const images = runwareData.data || [];

      this.logger.log(`✅ Generated ${images.length} logo(s)`);

      return {
        images: images.map((item: any) => ({
          url: item.imageURL || item.url,
          cost: item.cost,
          taskUUID: item.taskUUID || taskUUID,
        })),
        model: this.fluxSchnellModelName,
      };
    } catch (error: any) {
      this.logger.error('❌ Logo generation failed:', error.message);
      if (error.response?.data) {
        this.logger.error('API Response:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Enhance/upscale an image using Runware API
   */
  async enhanceImage(options: ImageEnhanceOptions): Promise<{ url: string; cost?: number }> {
    if (!this.runwareApiKey) {
      throw new Error('Runware API key not configured');
    }

    const { imageUrl, upscaleFactor = 2 } = options;
    const taskUUID = uuidv4();

    try {
      const requestData = [
        {
          taskType: 'imageUpscale',
          taskUUID,
          inputImage: imageUrl,
          upscaleFactor: Math.min(4, Math.max(2, upscaleFactor)),
          includeCost: true,
          outputType: ['URL'],
        },
      ];

      this.logger.log(`🔍 Enhancing image with ${upscaleFactor}x upscale`);

      const response = await firstValueFrom(
        this.httpService.post(this.runwareApiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${this.runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }),
      );

      const runwareData = response.data;

      if (runwareData.errors && runwareData.errors.length > 0) {
        throw new Error(`Runware API error: ${JSON.stringify(runwareData.errors)}`);
      }

      const result = runwareData.data?.[0];
      if (!result) {
        throw new Error('No result returned from image enhancement');
      }

      this.logger.log(`✅ Image enhanced successfully`);

      return {
        url: result.imageURL || result.url,
        cost: result.cost,
      };
    } catch (error: any) {
      this.logger.error('❌ Image enhancement failed:', error.message);
      throw error;
    }
  }

  /**
   * Remove background from an image using Runware API
   */
  async removeBackground(options: BackgroundRemoveOptions): Promise<{ url: string; cost?: number }> {
    if (!this.runwareApiKey) {
      throw new Error('Runware API key not configured');
    }

    const { imageUrl, backgroundColor } = options;
    const taskUUID = uuidv4();

    try {
      const requestData: any = [
        {
          taskType: 'imageBackgroundRemoval',
          taskUUID,
          inputImage: imageUrl,
          outputFormat: 'PNG',
          includeCost: true,
          outputType: ['URL'],
        },
      ];

      // Add background color if specified (otherwise transparent)
      if (backgroundColor) {
        requestData[0].rgba = this.hexToRgba(backgroundColor);
      }

      this.logger.log(`✂️ Removing background from image`);

      const response = await firstValueFrom(
        this.httpService.post(this.runwareApiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${this.runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }),
      );

      const runwareData = response.data;

      if (runwareData.errors && runwareData.errors.length > 0) {
        throw new Error(`Runware API error: ${JSON.stringify(runwareData.errors)}`);
      }

      const result = runwareData.data?.[0];
      if (!result) {
        throw new Error('No result returned from background removal');
      }

      this.logger.log(`✅ Background removed successfully`);

      return {
        url: result.imageURL || result.url,
        cost: result.cost,
      };
    } catch (error: any) {
      this.logger.error('❌ Background removal failed:', error.message);
      throw error;
    }
  }

  /**
   * Upscale an image using Runware API
   */
  async upscaleImage(options: ImageUpscaleOptions): Promise<{ url: string; cost?: number }> {
    if (!this.runwareApiKey) {
      throw new Error('Runware API key not configured');
    }

    const { imageUrl, upscaleFactor } = options;
    const taskUUID = uuidv4();

    try {
      const requestData = [
        {
          taskType: 'imageUpscale',
          taskUUID,
          inputImage: imageUrl,
          upscaleFactor,
          includeCost: true,
          outputType: ['URL'],
        },
      ];

      this.logger.log(`📈 Upscaling image ${upscaleFactor}x`);

      const response = await firstValueFrom(
        this.httpService.post(this.runwareApiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${this.runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 180000,
        }),
      );

      const runwareData = response.data;

      if (runwareData.errors && runwareData.errors.length > 0) {
        throw new Error(`Runware API error: ${JSON.stringify(runwareData.errors)}`);
      }

      const result = runwareData.data?.[0];
      if (!result) {
        throw new Error('No result returned from image upscale');
      }

      this.logger.log(`✅ Image upscaled ${upscaleFactor}x successfully`);

      return {
        url: result.imageURL || result.url,
        cost: result.cost,
      };
    } catch (error: any) {
      this.logger.error('❌ Image upscale failed:', error.message);
      throw error;
    }
  }

  /**
   * Helper to convert hex color to RGBA array
   */
  private hexToRgba(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255,
      ];
    }
    return [255, 255, 255, 255]; // Default to white
  }
}
