import {
  Controller,
  Post,
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
import { TextService } from './text.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import {
  JsonFormatDto,
  JsonToCsvDto,
  CsvToJsonDto,
  JsonToYamlDto,
  YamlToJsonDto,
  MarkdownPreviewDto,
  TextCaseConvertDto,
  TextCountDto,
  JsonFormatResponseDto,
  JsonToCsvResponseDto,
  CsvToJsonResponseDto,
  JsonToYamlResponseDto,
  YamlToJsonResponseDto,
  MarkdownPreviewResponseDto,
  TextCaseConvertResponseDto,
  TextCountResponseDto,
} from './dto/text.dto';

@ApiTags('Tools - Text')
@Controller('tools/text')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TextController {
  constructor(
    private readonly textService: TextService,
    private readonly toolLogger: ToolLoggerService,
  ) {}

  @Post('json/format')
  @ApiOperation({ summary: 'Format and validate JSON' })
  @ApiResponse({ status: 200, type: JsonFormatResponseDto })
  async formatJson(
    @Body() dto: JsonFormatDto,
    @Request() req: any,
  ): Promise<{ data: JsonFormatResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.formatJson(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'json-format',
      inputSizeBytes: Buffer.byteLength(dto.json, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.formatted, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: result.valid ? 'completed' : 'failed',
      errorMessage: result.error,
    });

    return { data: result };
  }

  @Post('json/validate')
  @ApiOperation({ summary: 'Validate JSON syntax' })
  @ApiResponse({ status: 200 })
  async validateJson(
    @Body() dto: { json: string },
    @Request() req: any,
  ): Promise<{ data: { valid: boolean; error?: string } }> {
    const userId = req.user.sub || req.user.userId;
    const result = this.textService.validateJson(dto.json);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'json-validate',
      inputSizeBytes: Buffer.byteLength(dto.json, 'utf8'),
      status: result.valid ? 'completed' : 'failed',
      errorMessage: result.error,
    });

    return { data: result };
  }

  @Post('json/to-csv')
  @ApiOperation({ summary: 'Convert JSON array to CSV' })
  @ApiResponse({ status: 200, type: JsonToCsvResponseDto })
  async jsonToCsv(
    @Body() dto: JsonToCsvDto,
    @Request() req: any,
  ): Promise<{ data: JsonToCsvResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.jsonToCsv(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'json-to-csv',
      inputSizeBytes: Buffer.byteLength(dto.json, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.csv, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { rowCount: result.rowCount },
    });

    return { data: result };
  }

  @Post('csv/to-json')
  @ApiOperation({ summary: 'Convert CSV to JSON array' })
  @ApiResponse({ status: 200, type: CsvToJsonResponseDto })
  async csvToJson(
    @Body() dto: CsvToJsonDto,
    @Request() req: any,
  ): Promise<{ data: CsvToJsonResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.csvToJson(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'csv-to-json',
      inputSizeBytes: Buffer.byteLength(dto.csv, 'utf8'),
      outputSizeBytes: Buffer.byteLength(JSON.stringify(result.json), 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { rowCount: result.rowCount },
    });

    return { data: result };
  }

  @Post('json/to-yaml')
  @ApiOperation({ summary: 'Convert JSON to YAML' })
  @ApiResponse({ status: 200, type: JsonToYamlResponseDto })
  async jsonToYaml(
    @Body() dto: JsonToYamlDto,
    @Request() req: any,
  ): Promise<{ data: JsonToYamlResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.jsonToYaml(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'json-to-yaml',
      inputSizeBytes: Buffer.byteLength(dto.json, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.yaml, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
    });

    return { data: result };
  }

  @Post('yaml/to-json')
  @ApiOperation({ summary: 'Convert YAML to JSON' })
  @ApiResponse({ status: 200, type: YamlToJsonResponseDto })
  async yamlToJson(
    @Body() dto: YamlToJsonDto,
    @Request() req: any,
  ): Promise<{ data: YamlToJsonResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.yamlToJson(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'yaml-to-json',
      inputSizeBytes: Buffer.byteLength(dto.yaml, 'utf8'),
      outputSizeBytes: Buffer.byteLength(JSON.stringify(result.json), 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
    });

    return { data: result };
  }

  @Post('markdown/preview')
  @ApiOperation({ summary: 'Render Markdown to HTML' })
  @ApiResponse({ status: 200, type: MarkdownPreviewResponseDto })
  async markdownPreview(
    @Body() dto: MarkdownPreviewDto,
    @Request() req: any,
  ): Promise<{ data: MarkdownPreviewResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.markdownPreview(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'markdown-preview',
      inputSizeBytes: Buffer.byteLength(dto.markdown, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.html, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
    });

    return { data: result };
  }

  @Post('case/convert')
  @ApiOperation({ summary: 'Convert text case (camel, snake, pascal, etc.)' })
  @ApiResponse({ status: 200, type: TextCaseConvertResponseDto })
  async convertTextCase(
    @Body() dto: TextCaseConvertDto,
    @Request() req: any,
  ): Promise<{ data: TextCaseConvertResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.convertTextCase(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'case-convert',
      inputSizeBytes: Buffer.byteLength(dto.text, 'utf8'),
      outputSizeBytes: Buffer.byteLength(result.converted, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { targetCase: dto.targetCase },
    });

    return { data: result };
  }

  @Post('count')
  @ApiOperation({ summary: 'Count words, characters, sentences, etc.' })
  @ApiResponse({ status: 200, type: TextCountResponseDto })
  async countText(
    @Body() dto: TextCountDto,
    @Request() req: any,
  ): Promise<{ data: TextCountResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = this.textService.countText(dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'text',
      toolName: 'count',
      inputSizeBytes: Buffer.byteLength(dto.text, 'utf8'),
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: result,
    });

    return { data: result };
  }
}
