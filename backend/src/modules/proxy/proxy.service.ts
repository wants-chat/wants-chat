import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export type ServiceBackend =
  | 'wants'
  | 'widest-life'
  | 'imagitar'
  | 'fluxturn'
  | 'promoatonce';

export interface ServiceConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface ProxyRequest {
  service: ServiceBackend;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  service: ServiceBackend;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private clients: Map<ServiceBackend, AxiosInstance> = new Map();
  private configs: Map<ServiceBackend, ServiceConfig> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeClients();
  }

  private initializeClients(): void {
    // Widest Life - Utility tools (Port 3001)
    this.registerService('widest-life', {
      baseUrl: this.configService.get<string>('WIDEST_LIFE_URL', 'http://localhost:3001'),
      timeout: 30000,
    });

    // Imagitar - Image/Video generation (Port 4500)
    this.registerService('imagitar', {
      baseUrl: this.configService.get<string>('IMAGITAR_URL', 'http://localhost:4500'),
      timeout: 120000, // Longer timeout for media generation
    });

    // FluxTurn - Workflow automation (Port 3004)
    this.registerService('fluxturn', {
      baseUrl: this.configService.get<string>('FLUXTURN_URL', 'http://localhost:3004'),
      timeout: 60000,
    });

    // PromoAtOnce - Promotions, analytics, email (Port 3004)
    this.registerService('promoatonce', {
      baseUrl: this.configService.get<string>('PROMOATONCE_URL', 'http://localhost:3004'),
      timeout: 30000,
    });

    this.logger.log(`✅ Proxy service initialized with ${this.clients.size} backends`);
  }

  private registerService(name: ServiceBackend, config: ServiceConfig): void {
    this.configs.set(name, config);

    const client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Request interceptor for logging
    client.interceptors.request.use(
      (request) => {
        this.logger.debug(`→ ${name}: ${request.method?.toUpperCase()} ${request.url}`);
        return request;
      },
      (error) => {
        this.logger.error(`Request error for ${name}:`, error.message);
        return Promise.reject(error);
      },
    );

    // Response interceptor for logging
    client.interceptors.response.use(
      (response) => {
        this.logger.debug(`← ${name}: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(`Response error from ${name}: ${error.response.status}`);
        } else if (error.request) {
          this.logger.error(`No response from ${name}:`, error.message);
        }
        return Promise.reject(error);
      },
    );

    this.clients.set(name, client);
    this.logger.log(`   📡 ${name}: ${config.baseUrl}`);
  }

  // ============================================
  // Main Request Methods
  // ============================================

  async request<T = any>(req: ProxyRequest): Promise<ProxyResponse<T>> {
    const client = this.clients.get(req.service);

    if (!client) {
      return {
        success: false,
        error: `Unknown service: ${req.service}`,
        statusCode: HttpStatus.BAD_REQUEST,
        service: req.service,
      };
    }

    try {
      const config: AxiosRequestConfig = {
        method: req.method,
        url: req.endpoint,
        headers: req.headers,
        params: req.params,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        config.data = req.data;
      }

      const response = await client.request<T>(config);

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        service: req.service,
      };
    } catch (error) {
      const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage = error.response?.data?.message || error.message;

      return {
        success: false,
        error: errorMessage,
        statusCode,
        service: req.service,
      };
    }
  }

  async get<T = any>(service: ServiceBackend, endpoint: string, params?: Record<string, any>): Promise<ProxyResponse<T>> {
    return this.request<T>({
      service,
      method: 'GET',
      endpoint,
      params,
    });
  }

  async post<T = any>(service: ServiceBackend, endpoint: string, data?: any): Promise<ProxyResponse<T>> {
    return this.request<T>({
      service,
      method: 'POST',
      endpoint,
      data,
    });
  }

  async put<T = any>(service: ServiceBackend, endpoint: string, data?: any): Promise<ProxyResponse<T>> {
    return this.request<T>({
      service,
      method: 'PUT',
      endpoint,
      data,
    });
  }

  async delete<T = any>(service: ServiceBackend, endpoint: string): Promise<ProxyResponse<T>> {
    return this.request<T>({
      service,
      method: 'DELETE',
      endpoint,
    });
  }

  // ============================================
  // Service-Specific Methods
  // ============================================

  // Widest Life - Tools
  async convertDocument(from: string, to: string, file: Buffer): Promise<ProxyResponse> {
    return this.post('widest-life', `/api/v1/tools/docs/${from}-to-${to}`, { file });
  }

  async generateQRCode(content: string, options?: any): Promise<ProxyResponse> {
    return this.post('widest-life', '/api/v1/tools/qr-barcode/generate', { content, ...options });
  }

  async convertUnits(from: string, to: string, value: number, category: string): Promise<ProxyResponse> {
    return this.post('widest-life', `/api/v1/tools/units/${category}`, { from, to, value });
  }

  // Imagitar - Image/Video
  async generateImage(prompt: string, options?: any): Promise<ProxyResponse> {
    return this.post('imagitar', '/api/v1/ai/image-ai/generate', { prompt, ...options });
  }

  async generateVideo(prompt: string, options?: any): Promise<ProxyResponse> {
    return this.post('imagitar', '/api/v1/ai/video-ai/generate', { prompt, ...options });
  }

  async textToSpeech(text: string, voice?: string): Promise<ProxyResponse> {
    return this.post('imagitar', '/api/v1/ai/audio/tts', { text, voice });
  }

  async speechToText(audio: Buffer, language?: string): Promise<ProxyResponse> {
    return this.post('imagitar', '/api/v1/ai/audio/stt', { audio, language });
  }

  async removeBackground(imageUrl: string): Promise<ProxyResponse> {
    return this.post('imagitar', '/api/v1/images/remove-background', { imageUrl });
  }

  async upscaleImage(imageUrl: string, scale?: number): Promise<ProxyResponse> {
    return this.post('imagitar', '/api/v1/images/upscale', { imageUrl, scale });
  }

  // FluxTurn - Workflows
  async createWorkflow(name: string, nodes: any[], edges: any[]): Promise<ProxyResponse> {
    return this.post('fluxturn', '/api/v1/workflow', { name, nodes, edges });
  }

  async executeWorkflow(workflowId: string, input?: any): Promise<ProxyResponse> {
    return this.post('fluxturn', `/api/v1/workflow/${workflowId}/execute`, { input });
  }

  async getWorkflowTemplates(): Promise<ProxyResponse> {
    return this.get('fluxturn', '/api/v1/workflow/templates');
  }

  // PromoAtOnce - Marketing
  async getAnalytics(type: string, dateRange?: any): Promise<ProxyResponse> {
    return this.get('promoatonce', '/api/v1/analytics', { type, ...dateRange });
  }

  async createEmailCampaign(campaign: any): Promise<ProxyResponse> {
    return this.post('promoatonce', '/api/v1/email/campaigns', campaign);
  }

  async createPromotion(promotion: any): Promise<ProxyResponse> {
    return this.post('promoatonce', '/api/v1/promotatonce', promotion);
  }

  // ============================================
  // Health Check
  // ============================================

  async checkHealth(): Promise<Record<ServiceBackend, { status: string; url: string }>> {
    const results: Record<string, { status: string; url: string }> = {};

    for (const [name, config] of this.configs.entries()) {
      try {
        const client = this.clients.get(name);
        if (client) {
          await client.get('/health', { timeout: 5000 });
          results[name] = { status: 'healthy', url: config.baseUrl };
        }
      } catch (error) {
        results[name] = { status: 'unhealthy', url: config.baseUrl };
      }
    }

    return results as Record<ServiceBackend, { status: string; url: string }>;
  }

  getServiceUrl(service: ServiceBackend): string | undefined {
    return this.configs.get(service)?.baseUrl;
  }
}
