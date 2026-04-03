import { Injectable, BadRequestException } from '@nestjs/common';
import {
  LengthUnit,
  WeightUnit,
  TemperatureUnit,
  FileSizeUnit,
  LengthConvertDto,
  WeightConvertDto,
  TemperatureConvertDto,
  ColorConvertDto,
  TimezoneConvertDto,
  FileSizeConvertDto,
  UnitConvertResponseDto,
  ColorConvertResponseDto,
  TimezoneConvertResponseDto,
} from './dto/units.dto';

@Injectable()
export class UnitsService {
  // Length conversion factors (all relative to meters)
  private lengthToMeter: Record<LengthUnit, number> = {
    [LengthUnit.METER]: 1,
    [LengthUnit.KILOMETER]: 1000,
    [LengthUnit.CENTIMETER]: 0.01,
    [LengthUnit.MILLIMETER]: 0.001,
    [LengthUnit.MILE]: 1609.344,
    [LengthUnit.YARD]: 0.9144,
    [LengthUnit.FOOT]: 0.3048,
    [LengthUnit.INCH]: 0.0254,
  };

  // Weight conversion factors (all relative to kilograms)
  private weightToKg: Record<WeightUnit, number> = {
    [WeightUnit.KILOGRAM]: 1,
    [WeightUnit.GRAM]: 0.001,
    [WeightUnit.MILLIGRAM]: 0.000001,
    [WeightUnit.POUND]: 0.453592,
    [WeightUnit.OUNCE]: 0.0283495,
    [WeightUnit.TON]: 1000,
    [WeightUnit.STONE]: 6.35029,
  };

  // File size conversion (in bytes)
  private sizeToBytes: Record<FileSizeUnit, number> = {
    [FileSizeUnit.BYTE]: 1,
    [FileSizeUnit.KILOBYTE]: 1000,
    [FileSizeUnit.MEGABYTE]: 1000000,
    [FileSizeUnit.GIGABYTE]: 1000000000,
    [FileSizeUnit.TERABYTE]: 1000000000000,
    [FileSizeUnit.KIBIBYTE]: 1024,
    [FileSizeUnit.MEBIBYTE]: 1048576,
    [FileSizeUnit.GIBIBYTE]: 1073741824,
    [FileSizeUnit.TEBIBYTE]: 1099511627776,
  };

  convertLength(dto: LengthConvertDto): UnitConvertResponseDto {
    const meters = dto.value * this.lengthToMeter[dto.from];
    const result = meters / this.lengthToMeter[dto.to];

    return {
      input: dto.value,
      output: this.roundToSignificant(result),
      fromUnit: dto.from,
      toUnit: dto.to,
      formula: `${dto.value} ${dto.from} × ${this.lengthToMeter[dto.from]} / ${this.lengthToMeter[dto.to]}`,
    };
  }

  convertWeight(dto: WeightConvertDto): UnitConvertResponseDto {
    const kg = dto.value * this.weightToKg[dto.from];
    const result = kg / this.weightToKg[dto.to];

    return {
      input: dto.value,
      output: this.roundToSignificant(result),
      fromUnit: dto.from,
      toUnit: dto.to,
      formula: `${dto.value} ${dto.from} × ${this.weightToKg[dto.from]} / ${this.weightToKg[dto.to]}`,
    };
  }

  convertTemperature(dto: TemperatureConvertDto): UnitConvertResponseDto {
    let result: number;
    let formula: string;

    // Convert to Celsius first, then to target
    let celsius: number;

    switch (dto.from) {
      case TemperatureUnit.CELSIUS:
        celsius = dto.value;
        break;
      case TemperatureUnit.FAHRENHEIT:
        celsius = (dto.value - 32) * (5 / 9);
        break;
      case TemperatureUnit.KELVIN:
        celsius = dto.value - 273.15;
        break;
    }

    switch (dto.to) {
      case TemperatureUnit.CELSIUS:
        result = celsius;
        break;
      case TemperatureUnit.FAHRENHEIT:
        result = celsius * (9 / 5) + 32;
        break;
      case TemperatureUnit.KELVIN:
        result = celsius + 273.15;
        break;
    }

    formula = this.getTemperatureFormula(dto.from, dto.to);

    return {
      input: dto.value,
      output: this.roundToSignificant(result),
      fromUnit: dto.from,
      toUnit: dto.to,
      formula,
    };
  }

  convertColor(dto: ColorConvertDto): ColorConvertResponseDto {
    let r: number, g: number, b: number;

    // Parse input color
    const color = dto.color.trim();

    if (color.startsWith('#') || /^[0-9a-fA-F]{6}$/.test(color)) {
      // HEX format
      const hex = color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      // RGB format: rgb(r, g, b) or rgba(r, g, b, a)
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) throw new BadRequestException('Invalid RGB format');
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else if (color.startsWith('hsl')) {
      // HSL format: hsl(h, s%, l%) or hsla(h, s%, l%, a)
      const match = color.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?/);
      if (!match) throw new BadRequestException('Invalid HSL format');
      const h = parseInt(match[1]);
      const s = parseInt(match[2]) / 100;
      const l = parseInt(match[3]) / 100;
      const rgb = this.hslToRgb(h, s, l);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    } else {
      throw new BadRequestException(
        'Invalid color format. Use HEX (#RRGGBB), RGB (rgb(r,g,b)), or HSL (hsl(h,s%,l%))',
      );
    }

    // Validate RGB values
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new BadRequestException('RGB values must be between 0 and 255');
    }

    // Calculate all formats
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    const hsl = this.rgbToHsl(r, g, b);

    return {
      hex,
      rgb: { r, g, b },
      hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) },
      rgbString: `rgb(${r}, ${g}, ${b})`,
      hslString: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    };
  }

  convertTimezone(dto: TimezoneConvertDto): TimezoneConvertResponseDto {
    try {
      const inputDate = new Date(dto.datetime);
      if (isNaN(inputDate.getTime())) {
        throw new BadRequestException('Invalid datetime format');
      }

      // Format in source timezone
      const inputFormatted = inputDate.toLocaleString('en-US', {
        timeZone: dto.fromTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // Format in target timezone
      const outputFormatted = inputDate.toLocaleString('en-US', {
        timeZone: dto.toTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // Calculate offset difference
      const fromOffset = this.getTimezoneOffset(inputDate, dto.fromTimezone);
      const toOffset = this.getTimezoneOffset(inputDate, dto.toTimezone);
      const offsetDiff = (toOffset - fromOffset) / 60;

      return {
        inputDatetime: inputFormatted,
        outputDatetime: outputFormatted,
        fromTimezone: dto.fromTimezone,
        toTimezone: dto.toTimezone,
        offsetDifferenceHours: offsetDiff,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Invalid timezone or datetime: ${error.message}`);
    }
  }

  convertFileSize(dto: FileSizeConvertDto): UnitConvertResponseDto {
    const bytes = dto.value * this.sizeToBytes[dto.from];
    const result = bytes / this.sizeToBytes[dto.to];

    return {
      input: dto.value,
      output: this.roundToSignificant(result),
      fromUnit: dto.from,
      toUnit: dto.to,
    };
  }

  // Get all supported units
  getSupportedUnits(): {
    length: string[];
    weight: string[];
    temperature: string[];
    fileSize: string[];
  } {
    return {
      length: Object.values(LengthUnit),
      weight: Object.values(WeightUnit),
      temperature: Object.values(TemperatureUnit),
      fileSize: Object.values(FileSizeUnit),
    };
  }

  // Helper methods
  private roundToSignificant(num: number, digits = 10): number {
    if (num === 0) return 0;
    const magnitude = Math.floor(Math.log10(Math.abs(num)));
    const factor = Math.pow(10, digits - magnitude - 1);
    return Math.round(num * factor) / factor;
  }

  private getTemperatureFormula(from: TemperatureUnit, to: TemperatureUnit): string {
    const formulas: Record<string, string> = {
      'C_F': '(°C × 9/5) + 32',
      'C_K': '°C + 273.15',
      'F_C': '(°F - 32) × 5/9',
      'F_K': '(°F - 32) × 5/9 + 273.15',
      'K_C': 'K - 273.15',
      'K_F': '(K - 273.15) × 9/5 + 32',
    };
    return formulas[`${from}_${to}`] || '';
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  private getTimezoneOffset(date: Date, timezone: string): number {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
  }
}
