import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UnitsService } from './units.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import {
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

@ApiTags('Tools - Units')
@Controller('tools/units')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnitsController {
  constructor(
    private readonly unitsService: UnitsService,
    private readonly toolLogger: ToolLoggerService,
  ) {}

  @Post('length')
  @ApiOperation({ summary: 'Convert length units' })
  @ApiResponse({ status: 200, type: UnitConvertResponseDto })
  async convertLength(
    @Body() dto: LengthConvertDto,
    @Request() req: any,
  ): Promise<{ data: UnitConvertResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.unitsService.convertLength(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'units',
      toolName: 'length',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { from: dto.from, to: dto.to, value: dto.value },
    });

    return { data: result };
  }

  @Post('weight')
  @ApiOperation({ summary: 'Convert weight units' })
  @ApiResponse({ status: 200, type: UnitConvertResponseDto })
  async convertWeight(
    @Body() dto: WeightConvertDto,
    @Request() req: any,
  ): Promise<{ data: UnitConvertResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.unitsService.convertWeight(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'units',
      toolName: 'weight',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { from: dto.from, to: dto.to, value: dto.value },
    });

    return { data: result };
  }

  @Post('temperature')
  @ApiOperation({ summary: 'Convert temperature units' })
  @ApiResponse({ status: 200, type: UnitConvertResponseDto })
  async convertTemperature(
    @Body() dto: TemperatureConvertDto,
    @Request() req: any,
  ): Promise<{ data: UnitConvertResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.unitsService.convertTemperature(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'units',
      toolName: 'temperature',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { from: dto.from, to: dto.to, value: dto.value },
    });

    return { data: result };
  }

  @Post('color')
  @ApiOperation({ summary: 'Convert color formats (HEX, RGB, HSL)' })
  @ApiResponse({ status: 200, type: ColorConvertResponseDto })
  async convertColor(
    @Body() dto: ColorConvertDto,
    @Request() req: any,
  ): Promise<{ data: ColorConvertResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.unitsService.convertColor(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'units',
      toolName: 'color',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { input: dto.color, output: result.hex },
    });

    return { data: result };
  }

  @Post('timezone')
  @ApiOperation({ summary: 'Convert datetime between timezones' })
  @ApiResponse({ status: 200, type: TimezoneConvertResponseDto })
  async convertTimezone(
    @Body() dto: TimezoneConvertDto,
    @Request() req: any,
  ): Promise<{ data: TimezoneConvertResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.unitsService.convertTimezone(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'units',
      toolName: 'timezone',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: {
        from: dto.fromTimezone,
        to: dto.toTimezone,
      },
    });

    return { data: result };
  }

  @Post('file-size')
  @ApiOperation({ summary: 'Convert file size units (KB, MB, GB, etc.)' })
  @ApiResponse({ status: 200, type: UnitConvertResponseDto })
  async convertFileSize(
    @Body() dto: FileSizeConvertDto,
    @Request() req: any,
  ): Promise<{ data: UnitConvertResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.unitsService.convertFileSize(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'units',
      toolName: 'file-size',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { from: dto.from, to: dto.to, value: dto.value },
    });

    return { data: result };
  }

  @Get('supported')
  @ApiOperation({ summary: 'Get all supported unit types' })
  @ApiResponse({ status: 200 })
  async getSupportedUnits(): Promise<{ data: any }> {
    const result = this.unitsService.getSupportedUnits();
    return { data: result };
  }
}
