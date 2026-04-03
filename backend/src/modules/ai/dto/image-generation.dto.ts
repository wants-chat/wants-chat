import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ImageStyle {
  REALISTIC = 'realistic',
  CARTOON = 'cartoon',
  ANIME = 'anime',
  DIGITAL_ART = 'digital_art',
  OIL_PAINTING = 'oil_painting',
  WATERCOLOR = 'watercolor',
  SKETCH = 'sketch',
  PHOTOGRAPHIC = 'photographic',
  CINEMATIC = 'cinematic',
  ABSTRACT = 'abstract',
  MINIMALIST = 'minimalist',
  VINTAGE = 'vintage',
  CYBERPUNK = 'cyberpunk',
  FANTASY = 'fantasy'
}

export enum ImageSize {
  SQUARE_256 = '256x256',
  SQUARE_512 = '512x512',
  SQUARE_1024 = '1024x1024',
  PORTRAIT_512_768 = '512x768',
  PORTRAIT_768_1024 = '768x1024',
  LANDSCAPE_768_512 = '768x512',
  LANDSCAPE_1024_768 = '1024x768',
  WIDE_1024_576 = '1024x576',
  ULTRA_WIDE_1344_768 = '1344x768'
}

export enum ImageQuality {
  DRAFT = 'draft',
  STANDARD = 'standard',
  HIGH = 'high',
  ULTRA = 'ultra'
}

export enum ImageType {
  LOGO = 'logo',
  ARTWORK = 'artwork',
  ILLUSTRATION = 'illustration',
  PHOTO = 'photo',
  BANNER = 'banner',
  SOCIAL_MEDIA = 'social_media',
  PRODUCT = 'product',
  CHARACTER = 'character',
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
  ABSTRACT = 'abstract',
  ICON = 'icon'
}

export class GenerateImageDto {
  @ApiProperty({ description: 'The prompt describing the image to generate', example: 'A serene mountain landscape with a lake at sunset' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: 'Negative prompt - what to avoid in the image', example: 'blurry, low quality, watermark' })
  @IsOptional()
  @IsString()
  negative_prompt?: string;

  @ApiProperty({ 
    description: 'Type of image to generate',
    enum: ImageType,
    example: ImageType.ARTWORK
  })
  @IsEnum(ImageType)
  image_type: ImageType;

  @ApiPropertyOptional({ 
    description: 'Style of the image',
    enum: ImageStyle,
    example: ImageStyle.DIGITAL_ART
  })
  @IsOptional()
  @IsEnum(ImageStyle)
  style?: ImageStyle;

  @ApiPropertyOptional({ 
    description: 'Size of the generated image',
    enum: ImageSize,
    example: ImageSize.SQUARE_1024,
    default: ImageSize.SQUARE_512
  })
  @IsOptional()
  @IsEnum(ImageSize)
  size?: ImageSize;

  @ApiPropertyOptional({ 
    description: 'Quality of the generated image',
    enum: ImageQuality,
    example: ImageQuality.HIGH,
    default: ImageQuality.STANDARD
  })
  @IsOptional()
  @IsEnum(ImageQuality)
  quality?: ImageQuality;

  @ApiPropertyOptional({ description: 'Number of images to generate', example: 1, default: 1 })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  count?: number;

  @ApiPropertyOptional({ description: 'Color palette keywords', example: ['warm', 'vibrant', 'sunset colors'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  color_palette?: string[];

  @ApiPropertyOptional({ description: 'Mood or atmosphere keywords', example: ['peaceful', 'mysterious', 'energetic'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mood?: string[];

  @ApiPropertyOptional({ description: 'Lighting conditions', example: 'golden hour lighting' })
  @IsOptional()
  @IsString()
  lighting?: string;

  @ApiPropertyOptional({ description: 'Camera angle or perspective', example: 'bird\'s eye view' })
  @IsOptional()
  @IsString()
  perspective?: string;

  @ApiPropertyOptional({ description: 'Art medium or technique', example: 'digital painting' })
  @IsOptional()
  @IsString()
  medium?: string;

  @ApiPropertyOptional({ description: 'Artist or art style reference', example: 'in the style of Van Gogh' })
  @IsOptional()
  @IsString()
  artist_reference?: string;

  @ApiPropertyOptional({ description: 'Seed for reproducible results', example: 12345 })
  @IsOptional()
  @IsNumber()
  seed?: number;

  @ApiPropertyOptional({ description: 'Steps for generation process', example: 30 })
  @IsOptional()
  @IsNumber()
  steps?: number;

  @ApiPropertyOptional({ description: 'Guidance scale for prompt adherence', example: 7.5 })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  guidance_scale?: number;

  @ApiPropertyOptional({ description: 'Enable upscaling', default: false })
  @IsOptional()
  @IsBoolean()
  upscale?: boolean;

  @ApiPropertyOptional({ description: 'Enable face enhancement', default: false })
  @IsOptional()
  @IsBoolean()
  enhance_face?: boolean;
}