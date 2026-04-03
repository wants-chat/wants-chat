import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsEnum,
  IsObject,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ============================================
// ENUMS
// ============================================

export enum BrowserType {
  CHROMIUM = 'chromium',
  FIREFOX = 'firefox',
  WEBKIT = 'webkit',
}

export enum SessionStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  CLOSED = 'closed',
  ERROR = 'error',
}

export enum ActionType {
  CLICK = 'click',
  TYPE = 'type',
  NAVIGATE = 'navigate',
  SCREENSHOT = 'screenshot',
  EXTRACT = 'extract',
  EVALUATE = 'evaluate',
  WAIT = 'wait',
  SCROLL = 'scroll',
  HOVER = 'hover',
  SELECT = 'select',
}

// ============================================
// SESSION DTOs
// ============================================

export class CreateSessionDto {
  @ApiPropertyOptional({ description: 'Browser type to use', enum: BrowserType })
  @IsOptional()
  @IsEnum(BrowserType)
  browserType?: BrowserType;

  @ApiPropertyOptional({ description: 'Run in headless mode', default: true })
  @IsOptional()
  @IsBoolean()
  headless?: boolean;

  @ApiPropertyOptional({ description: 'Viewport width', default: 1280 })
  @IsOptional()
  @IsNumber()
  @Min(320)
  @Max(3840)
  viewportWidth?: number;

  @ApiPropertyOptional({ description: 'Viewport height', default: 800 })
  @IsOptional()
  @IsNumber()
  @Min(240)
  @Max(2160)
  viewportHeight?: number;

  @ApiPropertyOptional({ description: 'Custom user agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Session timeout in milliseconds', default: 300000 })
  @IsOptional()
  @IsNumber()
  @Min(30000)
  @Max(1800000)
  timeout?: number;

  @ApiPropertyOptional({ description: 'Enable JavaScript', default: true })
  @IsOptional()
  @IsBoolean()
  javaScriptEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Block images for faster loading' })
  @IsOptional()
  @IsBoolean()
  blockImages?: boolean;

  @ApiPropertyOptional({ description: 'Proxy server URL' })
  @IsOptional()
  @IsString()
  proxy?: string;
}

export class SessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  browserType: BrowserType;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  currentUrl?: string;

  @ApiPropertyOptional()
  pageTitle?: string;

  @ApiProperty()
  viewportWidth: number;

  @ApiProperty()
  viewportHeight: number;
}

export class SessionListResponseDto {
  @ApiProperty({ type: [SessionResponseDto] })
  sessions: SessionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  active: number;
}

// ============================================
// NAVIGATION DTOs
// ============================================

export class NavigateDto {
  @ApiProperty({ description: 'URL to navigate to' })
  @IsUrl({}, { message: 'Must be a valid URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Wait until page is fully loaded', default: 'networkidle2' })
  @IsOptional()
  @IsString()
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';

  @ApiPropertyOptional({ description: 'Navigation timeout in ms', default: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(5000)
  @Max(120000)
  timeout?: number;
}

export class NavigateResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  url: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  statusCode?: number;

  @ApiProperty()
  loadTime: number;
}

// ============================================
// INTERACTION DTOs
// ============================================

export class ClickDto {
  @ApiProperty({ description: 'CSS selector or XPath' })
  @IsString()
  selector: string;

  @ApiPropertyOptional({ description: 'Button to click', default: 'left' })
  @IsOptional()
  @IsString()
  button?: 'left' | 'right' | 'middle';

  @ApiPropertyOptional({ description: 'Number of clicks', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  clickCount?: number;

  @ApiPropertyOptional({ description: 'Wait for navigation after click' })
  @IsOptional()
  @IsBoolean()
  waitForNavigation?: boolean;

  @ApiPropertyOptional({ description: 'Timeout for finding element', default: 10000 })
  @IsOptional()
  @IsNumber()
  timeout?: number;
}

export class TypeDto {
  @ApiProperty({ description: 'CSS selector or XPath' })
  @IsString()
  selector: string;

  @ApiProperty({ description: 'Text to type' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Delay between keystrokes in ms' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  delay?: number;

  @ApiPropertyOptional({ description: 'Clear existing content before typing' })
  @IsOptional()
  @IsBoolean()
  clear?: boolean;

  @ApiPropertyOptional({ description: 'Press Enter after typing' })
  @IsOptional()
  @IsBoolean()
  pressEnter?: boolean;
}

export class SelectDto {
  @ApiProperty({ description: 'CSS selector for select element' })
  @IsString()
  selector: string;

  @ApiProperty({ description: 'Value(s) to select' })
  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class HoverDto {
  @ApiProperty({ description: 'CSS selector' })
  @IsString()
  selector: string;
}

export class ScrollDto {
  @ApiPropertyOptional({ description: 'CSS selector to scroll to' })
  @IsOptional()
  @IsString()
  selector?: string;

  @ApiPropertyOptional({ description: 'Scroll by X pixels' })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiPropertyOptional({ description: 'Scroll by Y pixels' })
  @IsOptional()
  @IsNumber()
  y?: number;

  @ApiPropertyOptional({ description: 'Smooth scrolling' })
  @IsOptional()
  @IsBoolean()
  smooth?: boolean;
}

export class WaitDto {
  @ApiPropertyOptional({ description: 'CSS selector to wait for' })
  @IsOptional()
  @IsString()
  selector?: string;

  @ApiPropertyOptional({ description: 'Wait for navigation' })
  @IsOptional()
  @IsBoolean()
  navigation?: boolean;

  @ApiPropertyOptional({ description: 'Fixed time to wait in ms' })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(60000)
  time?: number;

  @ApiPropertyOptional({ description: 'Wait for text to appear' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Timeout in ms', default: 30000 })
  @IsOptional()
  @IsNumber()
  timeout?: number;
}

export class InteractionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  action: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  duration?: number;
}

// ============================================
// SCREENSHOT DTOs
// ============================================

export class BrowserScreenshotDto {
  @ApiPropertyOptional({ description: 'Capture full page', default: false })
  @IsOptional()
  @IsBoolean()
  fullPage?: boolean;

  @ApiPropertyOptional({ description: 'CSS selector to capture specific element' })
  @IsOptional()
  @IsString()
  selector?: string;

  @ApiPropertyOptional({ description: 'Image format', default: 'png' })
  @IsOptional()
  @IsString()
  format?: 'png' | 'jpeg' | 'webp';

  @ApiPropertyOptional({ description: 'JPEG/WebP quality (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({ description: 'Include transparent background' })
  @IsOptional()
  @IsBoolean()
  omitBackground?: boolean;

  @ApiPropertyOptional({ description: 'Clip area' })
  @IsOptional()
  @IsObject()
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class BrowserScreenshotResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ description: 'Base64 encoded image' })
  imageBase64: string;

  @ApiProperty()
  format: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  fullPage: boolean;

  @ApiPropertyOptional()
  url?: string;

  @ApiPropertyOptional()
  title?: string;
}

// ============================================
// EVALUATION DTOs
// ============================================

export class EvaluateDto {
  @ApiProperty({ description: 'JavaScript code to evaluate in page context' })
  @IsString()
  script: string;

  @ApiPropertyOptional({ description: 'Arguments to pass to the script' })
  @IsOptional()
  @IsArray()
  args?: any[];
}

export class EvaluateResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  result?: any;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  duration: number;
}

// ============================================
// STAGEHAND AI DTOs
// ============================================

export class StagehandActDto {
  @ApiProperty({ description: 'Natural language instruction for action' })
  @IsString()
  instruction: string;

  @ApiPropertyOptional({ description: 'Maximum retries for the action', default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Timeout for the action in ms', default: 30000 })
  @IsOptional()
  @IsNumber()
  timeout?: number;
}

export class StagehandExtractDto {
  @ApiProperty({ description: 'Natural language description of what to extract' })
  @IsString()
  instruction: string;

  @ApiPropertyOptional({ description: 'Schema for structured extraction' })
  @IsOptional()
  @IsObject()
  schema?: Record<string, any>;

  @ApiPropertyOptional({ description: 'CSS selector to limit extraction scope' })
  @IsOptional()
  @IsString()
  selector?: string;
}

export class StagehandObserveDto {
  @ApiPropertyOptional({ description: 'Instruction for what to observe' })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional({ description: 'Include interactive elements' })
  @IsOptional()
  @IsBoolean()
  includeInteractive?: boolean;
}

export class StagehandActResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  instruction: string;

  @ApiPropertyOptional()
  actionsTaken?: string[];

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  duration: number;
}

export class StagehandExtractResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  instruction: string;

  @ApiPropertyOptional()
  data?: any;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  duration: number;
}

export class PageElementDto {
  @ApiProperty()
  tag: string;

  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  className?: string;

  @ApiPropertyOptional()
  text?: string;

  @ApiPropertyOptional()
  href?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  value?: string;

  @ApiProperty()
  isVisible: boolean;

  @ApiProperty()
  isInteractive: boolean;

  @ApiPropertyOptional()
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class StagehandObserveResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  url: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: [PageElementDto] })
  elements: PageElementDto[];

  @ApiPropertyOptional()
  screenshot?: string;

  @ApiProperty()
  duration: number;
}

// ============================================
// BATCH ACTIONS DTOs
// ============================================

export class ActionItemDto {
  @ApiProperty({ enum: ActionType })
  @IsEnum(ActionType)
  type: ActionType;

  @ApiProperty({ description: 'Action-specific parameters' })
  @IsObject()
  params: Record<string, any>;
}

export class BatchActionsDto {
  @ApiProperty({ type: [ActionItemDto] })
  @ValidateNested({ each: true })
  @Type(() => ActionItemDto)
  @IsArray()
  actions: ActionItemDto[];

  @ApiPropertyOptional({ description: 'Stop on first error', default: false })
  @IsOptional()
  @IsBoolean()
  stopOnError?: boolean;
}

export class ActionResultDto {
  @ApiProperty({ enum: ActionType })
  type: ActionType;

  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  result?: any;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  duration: number;
}

export class BatchActionsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  totalActions: number;

  @ApiProperty()
  successfulActions: number;

  @ApiProperty()
  failedActions: number;

  @ApiProperty({ type: [ActionResultDto] })
  results: ActionResultDto[];

  @ApiProperty()
  totalDuration: number;
}

// ============================================
// COOKIES & STORAGE DTOs
// ============================================

export class CookieDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  expires?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  httpOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export class SetCookiesDto {
  @ApiProperty({ type: [CookieDto] })
  @ValidateNested({ each: true })
  @Type(() => CookieDto)
  @IsArray()
  cookies: CookieDto[];
}

export class GetCookiesResponseDto {
  @ApiProperty({ type: [CookieDto] })
  cookies: CookieDto[];
}

export class StorageItemDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;
}

export class SetStorageDto {
  @ApiProperty({ description: 'Storage type', default: 'local' })
  @IsOptional()
  @IsString()
  type?: 'local' | 'session';

  @ApiProperty({ type: [StorageItemDto] })
  @ValidateNested({ each: true })
  @Type(() => StorageItemDto)
  @IsArray()
  items: StorageItemDto[];
}

// ============================================
// NETWORK DTOs
// ============================================

export class NetworkRequestDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  method: string;

  @ApiPropertyOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional()
  postData?: string;

  @ApiProperty()
  resourceType: string;
}

export class NetworkResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  status: number;

  @ApiPropertyOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional()
  body?: string;
}

export class InterceptRequestDto {
  @ApiProperty({ description: 'URL pattern to intercept (regex supported)' })
  @IsString()
  urlPattern: string;

  @ApiPropertyOptional({ description: 'Block matching requests' })
  @IsOptional()
  @IsBoolean()
  block?: boolean;

  @ApiPropertyOptional({ description: 'Modify request headers' })
  @IsOptional()
  @IsObject()
  modifyHeaders?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Mock response body' })
  @IsOptional()
  @IsString()
  mockBody?: string;

  @ApiPropertyOptional({ description: 'Mock response status' })
  @IsOptional()
  @IsNumber()
  mockStatus?: number;
}
