import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsHexColor } from 'class-validator';

export enum BarcodeFormat {
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPC = 'UPC',
  ITF14 = 'ITF14',
  ITF = 'ITF',
  MSI = 'MSI',
  PHARMACODE = 'pharmacode',
  CODABAR = 'codabar',
}

export enum QrErrorCorrectionLevel {
  LOW = 'L',
  MEDIUM = 'M',
  QUARTILE = 'Q',
  HIGH = 'H',
}

export class QrGenerateDto {
  @ApiProperty({ description: 'Data to encode in QR code' })
  @IsString()
  data: string;

  @ApiPropertyOptional({ description: 'Size in pixels (default: 300)', example: 300 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(2000)
  size?: number;

  @ApiPropertyOptional({ description: 'Error correction level', enum: QrErrorCorrectionLevel, default: 'M' })
  @IsOptional()
  @IsEnum(QrErrorCorrectionLevel)
  errorCorrectionLevel?: QrErrorCorrectionLevel;

  @ApiPropertyOptional({ description: 'Dark color (hex)', example: '#000000' })
  @IsOptional()
  @IsHexColor()
  darkColor?: string;

  @ApiPropertyOptional({ description: 'Light color (hex)', example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  lightColor?: string;

  @ApiPropertyOptional({ description: 'Margin (quiet zone) in modules', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  margin?: number;

  @ApiPropertyOptional({ description: 'Output format', enum: ['png', 'svg'], default: 'png' })
  @IsOptional()
  @IsString()
  format?: 'png' | 'svg';
}

export class BarcodeGenerateDto {
  @ApiProperty({ description: 'Data to encode in barcode' })
  @IsString()
  data: string;

  @ApiProperty({ description: 'Barcode format', enum: BarcodeFormat })
  @IsEnum(BarcodeFormat)
  format: BarcodeFormat;

  @ApiPropertyOptional({ description: 'Width in pixels', example: 200 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1000)
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(500)
  height?: number;

  @ApiPropertyOptional({ description: 'Display text below barcode', default: true })
  @IsOptional()
  displayValue?: boolean;

  @ApiPropertyOptional({ description: 'Font size for text', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(48)
  fontSize?: number;

  @ApiPropertyOptional({ description: 'Background color (hex)', example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  background?: string;

  @ApiPropertyOptional({ description: 'Line color (hex)', example: '#000000' })
  @IsOptional()
  @IsHexColor()
  lineColor?: string;
}

// Response DTOs
export class QrGenerateResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  data: string;

  @ApiProperty()
  format: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  sizeBytes: number;
}

export class QrScanResponseDto {
  @ApiProperty()
  data: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  version?: number;
}

export class BarcodeGenerateResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  data: string;

  @ApiProperty()
  format: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  sizeBytes: number;
}
