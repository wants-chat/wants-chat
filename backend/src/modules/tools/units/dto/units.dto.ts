import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum LengthUnit {
  METER = 'm',
  KILOMETER = 'km',
  CENTIMETER = 'cm',
  MILLIMETER = 'mm',
  MILE = 'mi',
  YARD = 'yd',
  FOOT = 'ft',
  INCH = 'in',
}

export enum WeightUnit {
  KILOGRAM = 'kg',
  GRAM = 'g',
  MILLIGRAM = 'mg',
  POUND = 'lb',
  OUNCE = 'oz',
  TON = 'ton',
  STONE = 'st',
}

export enum TemperatureUnit {
  CELSIUS = 'C',
  FAHRENHEIT = 'F',
  KELVIN = 'K',
}

export enum FileSizeUnit {
  BYTE = 'B',
  KILOBYTE = 'KB',
  MEGABYTE = 'MB',
  GIGABYTE = 'GB',
  TERABYTE = 'TB',
  KIBIBYTE = 'KiB',
  MEBIBYTE = 'MiB',
  GIBIBYTE = 'GiB',
  TEBIBYTE = 'TiB',
}

export class LengthConvertDto {
  @ApiProperty({ description: 'Value to convert' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Source unit', enum: LengthUnit })
  @IsEnum(LengthUnit)
  from: LengthUnit;

  @ApiProperty({ description: 'Target unit', enum: LengthUnit })
  @IsEnum(LengthUnit)
  to: LengthUnit;
}

export class WeightConvertDto {
  @ApiProperty({ description: 'Value to convert' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Source unit', enum: WeightUnit })
  @IsEnum(WeightUnit)
  from: WeightUnit;

  @ApiProperty({ description: 'Target unit', enum: WeightUnit })
  @IsEnum(WeightUnit)
  to: WeightUnit;
}

export class TemperatureConvertDto {
  @ApiProperty({ description: 'Value to convert' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Source unit', enum: TemperatureUnit })
  @IsEnum(TemperatureUnit)
  from: TemperatureUnit;

  @ApiProperty({ description: 'Target unit', enum: TemperatureUnit })
  @IsEnum(TemperatureUnit)
  to: TemperatureUnit;
}

export class ColorConvertDto {
  @ApiProperty({ description: 'Color value (hex, rgb, hsl format)' })
  @IsString()
  color: string;

  @ApiPropertyOptional({ description: 'Input format hint', enum: ['hex', 'rgb', 'hsl'] })
  @IsOptional()
  @IsString()
  inputFormat?: 'hex' | 'rgb' | 'hsl';
}

export class TimezoneConvertDto {
  @ApiProperty({ description: 'Date/time string or timestamp' })
  @IsString()
  datetime: string;

  @ApiProperty({ description: 'Source timezone (e.g., America/New_York)' })
  @IsString()
  fromTimezone: string;

  @ApiProperty({ description: 'Target timezone (e.g., Europe/London)' })
  @IsString()
  toTimezone: string;
}

export class FileSizeConvertDto {
  @ApiProperty({ description: 'Value to convert' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Source unit', enum: FileSizeUnit })
  @IsEnum(FileSizeUnit)
  from: FileSizeUnit;

  @ApiProperty({ description: 'Target unit', enum: FileSizeUnit })
  @IsEnum(FileSizeUnit)
  to: FileSizeUnit;
}

// Response DTOs
export class UnitConvertResponseDto {
  @ApiProperty()
  input: number;

  @ApiProperty()
  output: number;

  @ApiProperty()
  fromUnit: string;

  @ApiProperty()
  toUnit: string;

  @ApiProperty()
  formula?: string;
}

export class ColorConvertResponseDto {
  @ApiProperty()
  hex: string;

  @ApiProperty()
  rgb: { r: number; g: number; b: number };

  @ApiProperty()
  hsl: { h: number; s: number; l: number };

  @ApiProperty()
  rgbString: string;

  @ApiProperty()
  hslString: string;
}

export class TimezoneConvertResponseDto {
  @ApiProperty()
  inputDatetime: string;

  @ApiProperty()
  outputDatetime: string;

  @ApiProperty()
  fromTimezone: string;

  @ApiProperty()
  toTimezone: string;

  @ApiProperty()
  offsetDifferenceHours: number;
}
