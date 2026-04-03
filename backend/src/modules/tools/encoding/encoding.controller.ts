import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EncodingService } from './encoding.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import {
  Base64EncodeDto,
  Base64DecodeDto,
  UrlEncodeDto,
  UrlDecodeDto,
  HashGenerateDto,
  UuidGenerateDto,
  JwtDecodeDto,
  UuidVersion,
  Base64EncodeResponseDto,
  Base64DecodeResponseDto,
  UrlEncodeResponseDto,
  UrlDecodeResponseDto,
  HashGenerateResponseDto,
  UuidGenerateResponseDto,
  JwtDecodeResponseDto,
} from './dto/encoding.dto';

@ApiTags('Tools - Encoding')
@Controller('tools/encoding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EncodingController {
  constructor(
    private readonly encodingService: EncodingService,
    private readonly toolLogger: ToolLoggerService,
  ) {}

  @Post('base64/encode')
  @ApiOperation({ summary: 'Encode text to Base64' })
  @ApiResponse({ status: 200, type: Base64EncodeResponseDto })
  async encodeBase64(
    @Body() dto: Base64EncodeDto,
    @Request() req: any,
  ): Promise<{ data: Base64EncodeResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.encodingService.encodeBase64(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'base64-encode',
      inputSizeBytes: Buffer.byteLength(dto.text, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.encoded, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
    });

    return { data: result };
  }

  @Post('base64/decode')
  @ApiOperation({ summary: 'Decode Base64 to text' })
  @ApiResponse({ status: 200, type: Base64DecodeResponseDto })
  async decodeBase64(
    @Body() dto: Base64DecodeDto,
    @Request() req: any,
  ): Promise<{ data: Base64DecodeResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.encodingService.decodeBase64(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'base64-decode',
      inputSizeBytes: Buffer.byteLength(dto.base64, 'utf8'),
      outputSizeBytes: result.valid ? Buffer.byteLength(result.decoded, 'utf8') : 0,
      processingTimeMs: Date.now() - startTime,
      status: result.valid ? 'completed' : 'failed',
      errorMessage: result.error,
    });

    return { data: result };
  }

  @Post('url/encode')
  @ApiOperation({ summary: 'URL encode text' })
  @ApiResponse({ status: 200, type: UrlEncodeResponseDto })
  async encodeUrl(
    @Body() dto: UrlEncodeDto,
    @Request() req: any,
  ): Promise<{ data: UrlEncodeResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.encodingService.encodeUrl(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'url-encode',
      inputSizeBytes: Buffer.byteLength(dto.text, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.encoded, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
    });

    return { data: result };
  }

  @Post('url/decode')
  @ApiOperation({ summary: 'URL decode text' })
  @ApiResponse({ status: 200, type: UrlDecodeResponseDto })
  async decodeUrl(
    @Body() dto: UrlDecodeDto,
    @Request() req: any,
  ): Promise<{ data: UrlDecodeResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.encodingService.decodeUrl(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'url-decode',
      inputSizeBytes: Buffer.byteLength(dto.encoded, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.decoded, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
    });

    return { data: result };
  }

  @Post('hash')
  @ApiOperation({ summary: 'Generate hash (MD5, SHA256, etc.)' })
  @ApiResponse({ status: 200, type: HashGenerateResponseDto })
  async generateHash(
    @Body() dto: HashGenerateDto,
    @Request() req: any,
  ): Promise<{ data: HashGenerateResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.encodingService.generateHash(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'hash',
      inputSizeBytes: Buffer.byteLength(dto.text, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.hash, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { algorithm: dto.algorithm },
    });

    return { data: result };
  }

  @Post('hash/all')
  @ApiOperation({ summary: 'Generate all common hashes for text' })
  @ApiResponse({ status: 200 })
  async generateAllHashes(
    @Body() dto: { text: string },
    @Request() req: any,
  ): Promise<{ data: Record<string, string> }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.encodingService.generateMultipleHashes(dto.text);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'hash-all',
      inputSizeBytes: Buffer.byteLength(dto.text, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
    });

    return { data: result };
  }

  @Get('uuid')
  @ApiOperation({ summary: 'Generate UUID(s)' })
  @ApiQuery({ name: 'version', enum: ['v4', 'v7'], required: false, description: 'UUID version (v4 or v7)' })
  @ApiQuery({ name: 'count', type: Number, required: false })
  @ApiResponse({ status: 200, type: UuidGenerateResponseDto })
  async generateUuid(
    @Query('version') version?: string,
    @Query('count') count?: number,
    @Request() req?: any,
  ): Promise<{ data: UuidGenerateResponseDto }> {
    const startTime = Date.now();
    const userId = req?.user?.sub || req?.user?.userId || 'anonymous';

    const dto: UuidGenerateDto = {
      version: (version as UuidVersion) || UuidVersion.V4,
      count: count ? Number(count) : 1,
    };

    const result = this.encodingService.generateUuid(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'uuid',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { version: dto.version, count: dto.count },
    });

    return { data: result };
  }

  @Post('jwt/decode')
  @ApiOperation({ summary: 'Decode JWT token (without verification)' })
  @ApiResponse({ status: 200, type: JwtDecodeResponseDto })
  async decodeJwt(
    @Body() dto: JwtDecodeDto,
    @Request() req: any,
  ): Promise<{ data: JwtDecodeResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.encodingService.decodeJwt(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'encoding',
      toolName: 'jwt-decode',
      inputSizeBytes: Buffer.byteLength(dto.token, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { expired: result.expired },
    });

    return { data: result };
  }
}
