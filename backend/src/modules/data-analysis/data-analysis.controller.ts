import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataAnalysisService } from './data-analysis.service';
import {
  ParseOptionsDto,
  ParsedDataResponseDto,
  AnalyzeDataDto,
  AnalysisResponseDto,
  GenerateChartDataDto,
  ChartDataResponseDto,
  AggregateDataDto,
  AggregationResponseDto,
  DetectPatternsDto,
  PatternDetectionResponseDto,
  SummarizeDataDto,
  DataSummaryResponseDto,
} from './dto/data-analysis.dto';

@ApiTags('Data Analysis')
@Controller('data-analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataAnalysisController {
  private readonly logger = new Logger(DataAnalysisController.name);

  constructor(private readonly dataAnalysisService: DataAnalysisService) {}

  @Post('parse/csv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv|txt)$/i)) {
          return cb(new BadRequestException('Only CSV files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Parse CSV file',
    description: 'Upload and parse a CSV file, returning structured data with metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV file to parse' },
        delimiter: { type: 'string', description: 'Delimiter character (default: ,)' },
        hasHeader: { type: 'boolean', description: 'Whether file has header row (default: true)' },
        maxRows: { type: 'number', description: 'Maximum rows to parse' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'CSV parsed successfully', type: ParsedDataResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or parsing error' })
  async parseCSV(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: ParseOptionsDto,
  ): Promise<ParsedDataResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.logger.log(`Parsing CSV file: ${file.originalname} (${file.size} bytes)`);

    try {
      return this.dataAnalysisService.parseCSV(file.buffer, options);
    } catch (error: any) {
      this.logger.error(`CSV parsing failed: ${error.message}`);
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }

  @Post('parse/csv/text')
  @ApiOperation({
    summary: 'Parse CSV text',
    description: 'Parse CSV content from a text string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'CSV content as text' },
        delimiter: { type: 'string', description: 'Delimiter character (default: ,)' },
        hasHeader: { type: 'boolean', description: 'Whether content has header row (default: true)' },
        maxRows: { type: 'number', description: 'Maximum rows to parse' },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 200, description: 'CSV parsed successfully', type: ParsedDataResponseDto })
  async parseCSVText(
    @Body() body: { content: string } & ParseOptionsDto,
  ): Promise<ParsedDataResponseDto> {
    const { content, ...options } = body;

    if (!content) {
      throw new BadRequestException('No CSV content provided');
    }

    this.logger.log(`Parsing CSV text (${content.length} characters)`);

    try {
      return this.dataAnalysisService.parseCSV(content, options);
    } catch (error: any) {
      this.logger.error(`CSV parsing failed: ${error.message}`);
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }

  @Post('parse/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls|xlsm)$/i)) {
          return cb(new BadRequestException('Only Excel files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Parse Excel file',
    description: 'Upload and parse an Excel file (xlsx, xls), returning structured data with metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Excel file to parse' },
        sheet: { type: 'string', description: 'Sheet name or index (default: first sheet)' },
        hasHeader: { type: 'boolean', description: 'Whether sheet has header row (default: true)' },
        maxRows: { type: 'number', description: 'Maximum rows to parse' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Excel parsed successfully', type: ParsedDataResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or parsing error' })
  async parseExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: ParseOptionsDto,
  ): Promise<ParsedDataResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.logger.log(`Parsing Excel file: ${file.originalname} (${file.size} bytes)`);

    try {
      return await this.dataAnalysisService.parseExcel(file.buffer, options);
    } catch (error: any) {
      this.logger.error(`Excel parsing failed: ${error.message}`);
      throw new BadRequestException(`Failed to parse Excel: ${error.message}`);
    }
  }

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze data with AI',
    description: 'Use AI to analyze data and answer questions about it',
  })
  @ApiBody({ type: AnalyzeDataDto })
  @ApiResponse({ status: 200, description: 'Analysis completed', type: AnalysisResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data or query' })
  async analyzeData(@Body() dto: AnalyzeDataDto): Promise<AnalysisResponseDto> {
    this.logger.log(`Analyzing data with query: "${dto.query}"`);

    if (!dto.data || dto.data.length === 0) {
      throw new BadRequestException('No data provided for analysis');
    }

    if (!dto.query || dto.query.trim() === '') {
      throw new BadRequestException('No query provided');
    }

    try {
      return await this.dataAnalysisService.analyzeData(dto);
    } catch (error: any) {
      this.logger.error(`Analysis failed: ${error.message}`);
      throw new BadRequestException(`Analysis failed: ${error.message}`);
    }
  }

  @Post('chart')
  @ApiOperation({
    summary: 'Generate chart data',
    description: 'Transform data into chart-ready format for visualization',
  })
  @ApiBody({ type: GenerateChartDataDto })
  @ApiResponse({ status: 200, description: 'Chart data generated', type: ChartDataResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data or chart configuration' })
  generateChartData(@Body() dto: GenerateChartDataDto): ChartDataResponseDto {
    this.logger.log(`Generating ${dto.chartType} chart data`);

    if (!dto.data || dto.data.length === 0) {
      throw new BadRequestException('No data provided for chart generation');
    }

    try {
      return this.dataAnalysisService.generateChartData(dto);
    } catch (error: any) {
      this.logger.error(`Chart generation failed: ${error.message}`);
      throw new BadRequestException(`Chart generation failed: ${error.message}`);
    }
  }

  @Post('aggregate')
  @ApiOperation({
    summary: 'Aggregate data',
    description: 'Perform grouping and aggregation operations on data (sum, avg, count, etc.)',
  })
  @ApiBody({ type: AggregateDataDto })
  @ApiResponse({ status: 200, description: 'Aggregation completed', type: AggregationResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data or aggregation configuration' })
  aggregateData(@Body() dto: AggregateDataDto): AggregationResponseDto {
    this.logger.log(`Aggregating data with ${dto.aggregations.length} aggregations`);

    if (!dto.data || dto.data.length === 0) {
      throw new BadRequestException('No data provided for aggregation');
    }

    if (!dto.aggregations || dto.aggregations.length === 0) {
      throw new BadRequestException('No aggregations specified');
    }

    try {
      return this.dataAnalysisService.aggregateData(dto);
    } catch (error: any) {
      this.logger.error(`Aggregation failed: ${error.message}`);
      throw new BadRequestException(`Aggregation failed: ${error.message}`);
    }
  }

  @Post('patterns')
  @ApiOperation({
    summary: 'Detect patterns',
    description: 'Analyze data to detect patterns, trends, correlations, and outliers',
  })
  @ApiBody({ type: DetectPatternsDto })
  @ApiResponse({ status: 200, description: 'Pattern detection completed', type: PatternDetectionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async detectPatterns(@Body() dto: DetectPatternsDto): Promise<PatternDetectionResponseDto> {
    this.logger.log('Detecting patterns in data');

    if (!dto.data || dto.data.length === 0) {
      throw new BadRequestException('No data provided for pattern detection');
    }

    try {
      return await this.dataAnalysisService.detectPatterns(dto);
    } catch (error: any) {
      this.logger.error(`Pattern detection failed: ${error.message}`);
      throw new BadRequestException(`Pattern detection failed: ${error.message}`);
    }
  }

  @Post('summarize')
  @ApiOperation({
    summary: 'Summarize data',
    description: 'Generate comprehensive statistics and summary for a dataset',
  })
  @ApiBody({ type: SummarizeDataDto })
  @ApiResponse({ status: 200, description: 'Summary generated', type: DataSummaryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async summarizeData(@Body() dto: SummarizeDataDto): Promise<DataSummaryResponseDto> {
    this.logger.log('Summarizing data');

    if (!dto.data || dto.data.length === 0) {
      throw new BadRequestException('No data provided for summarization');
    }

    try {
      return await this.dataAnalysisService.summarizeData(dto);
    } catch (error: any) {
      this.logger.error(`Summarization failed: ${error.message}`);
      throw new BadRequestException(`Summarization failed: ${error.message}`);
    }
  }

  @Post('parse-and-analyze')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv|xlsx|xls|xlsm|txt)$/i)) {
          return cb(new BadRequestException('Only CSV and Excel files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Parse and analyze file',
    description: 'Upload a file, parse it, and optionally analyze it with AI in one step',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV or Excel file' },
        query: { type: 'string', description: 'Analysis query (optional)' },
        delimiter: { type: 'string', description: 'CSV delimiter (default: ,)' },
        sheet: { type: 'string', description: 'Excel sheet name or index' },
        hasHeader: { type: 'boolean', description: 'Whether file has header row' },
        maxRows: { type: 'number', description: 'Maximum rows to parse' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File parsed and analyzed',
    schema: {
      type: 'object',
      properties: {
        parsed: { $ref: '#/components/schemas/ParsedDataResponseDto' },
        analysis: { $ref: '#/components/schemas/AnalysisResponseDto' },
        summary: { $ref: '#/components/schemas/DataSummaryResponseDto' },
      },
    },
  })
  async parseAndAnalyze(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ParseOptionsDto & { query?: string },
  ): Promise<{
    parsed: ParsedDataResponseDto;
    analysis?: AnalysisResponseDto;
    summary: DataSummaryResponseDto;
  }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const { query, ...parseOptions } = body;
    const isExcel = file.originalname.match(/\.(xlsx|xls|xlsm)$/i);

    this.logger.log(`Parse and analyze: ${file.originalname}`);

    try {
      // Parse the file
      const parsed = isExcel
        ? await this.dataAnalysisService.parseExcel(file.buffer, parseOptions)
        : this.dataAnalysisService.parseCSV(file.buffer, parseOptions);

      // Generate summary
      const summary = await this.dataAnalysisService.summarizeData({
        data: parsed.data,
        columns: parsed.columns,
      });

      // Analyze if query provided
      let analysis: AnalysisResponseDto | undefined;
      if (query && query.trim()) {
        analysis = await this.dataAnalysisService.analyzeData({
          data: parsed.data,
          query,
          columns: parsed.columns,
        });
      }

      return { parsed, analysis, summary };
    } catch (error: any) {
      this.logger.error(`Parse and analyze failed: ${error.message}`);
      throw new BadRequestException(`Operation failed: ${error.message}`);
    }
  }
}
