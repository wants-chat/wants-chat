import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface VectorDocument {
  id: string;
  vector: number[];
  payload?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  payload?: Record<string, any>;
}

export interface CollectionInfo {
  name: string;
  vectorSize: number;
  distance: 'cosine' | 'euclid' | 'dot';
  points: number;
  status: string;
}

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private hostConfigured = false;

  constructor(private configService: ConfigService) {
    // Check if host is configured at construction time
    this.hostConfigured = !!this.configService.get<string>('QDRANT_HOST');
  }

  // All collections required by the application
  private readonly REQUIRED_COLLECTIONS = [
    { name: 'app-types', vectorSize: 1536, distance: 'Cosine' as const },
    { name: 'research_findings', vectorSize: 1536, distance: 'Cosine' as const },
    { name: 'wants_intent_patterns', vectorSize: 1536, distance: 'Cosine' as const },
    { name: 'wants_tool_discovery', vectorSize: 1536, distance: 'Cosine' as const },
  ];

  async onModuleInit() {
    // Initialize Qdrant in background to not block app startup
    this.initializeQdrantAsync();
  }

  private initializeQdrantAsync(): void {
    if (!this.hostConfigured) {
      return; // Silently skip - no warning needed during init
    }

    // Store promise so services can wait for it
    this.initPromise = this.initializeQdrant()
      .then(() => this.ensureRequiredCollections())
      .catch(error => {
        this.logger.error('Qdrant initialization failed:', error.message);
      });
  }

  /**
   * Ensures all required collections exist on startup
   */
  private async ensureRequiredCollections(): Promise<void> {
    if (!this.client || !this.initialized) {
      return;
    }

    this.logger.log('Ensuring all required Qdrant collections exist...');

    for (const collection of this.REQUIRED_COLLECTIONS) {
      try {
        await this.createCollection(collection.name, collection.vectorSize, collection.distance);
      } catch (error) {
        this.logger.warn(`Failed to ensure collection ${collection.name}: ${error.message}`);
      }
    }

    this.logger.log(`✅ All ${this.REQUIRED_COLLECTIONS.length} Qdrant collections ready`);
  }

  private async initializeQdrant(): Promise<void> {
    const host = this.configService.get<string>('QDRANT_HOST');
    const port = this.configService.get<number>('QDRANT_PORT', 6333);
    const apiKey = this.configService.get<string>('QDRANT_API_KEY');

    // Store original console.warn outside try/catch for proper restoration
    const originalWarn = console.warn;

    try {
      let url: string;
      if (host.startsWith('http://') || host.startsWith('https://')) {
        url = port === 6333 ? host : `${host}:${port}`;
      } else {
        url = `http://${host}:${port}`;
      }

      const clientConfig: any = {
        url,
        checkCompatibility: false, // Server v1.12.5, client v1.16.2
        timeout: 5000, // 5 second timeout
      };

      // Temporarily suppress console.warn for Qdrant's "unsecure connection" message
      // This warning is expected when using API key over HTTP for internal servers
      if (apiKey && url.startsWith('http://')) {
        console.warn = (...args) => {
          if (!args[0]?.includes?.('unsecure connection')) {
            originalWarn.apply(console, args);
          }
        };
      }

      if (apiKey) {
        clientConfig.apiKey = apiKey;
      }

      this.client = new QdrantClient(clientConfig);

      // Restore console.warn
      console.warn = originalWarn;

      // Validate connection
      await this.client.getCollections();
      this.initialized = true;

      this.logger.log(`✅ Qdrant connected: ${url}`);
    } catch (error) {
      // Restore console.warn in case of error
      console.warn = originalWarn;
      this.logger.error('Failed to connect to Qdrant:', error.message);
      this.client = null;
    }
  }

  /**
   * Check if Qdrant host is configured in env
   */
  isHostConfigured(): boolean {
    return this.hostConfigured;
  }

  /**
   * Check if Qdrant is ready to use (initialized and connected)
   */
  isConfigured(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Wait for Qdrant to be initialized (max 10 seconds)
   * Returns true if initialized, false if timeout or not configured
   */
  async waitForInit(timeoutMs = 10000): Promise<boolean> {
    if (!this.hostConfigured) {
      return false;
    }

    if (this.initialized) {
      return true;
    }

    if (this.initPromise) {
      // Wait for init with timeout
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
      await Promise.race([this.initPromise, timeout]);
    }

    return this.initialized;
  }

  // ============================================
  // Collection Management
  // ============================================

  async createCollection(
    name: string,
    vectorSize: number = 1536,
    distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine',
  ): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Qdrant not initialized');
      return false;
    }

    try {
      // Check if exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c) => c.name === name);

      if (exists) {
        this.logger.debug(`Collection ${name} already exists`);
        return true;
      }

      await this.client.createCollection(name, {
        vectors: {
          size: vectorSize,
          distance,
        },
        on_disk_payload: true,
      });

      this.logger.log(`Created collection: ${name} (${vectorSize} dimensions, ${distance})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to create collection ${name}:`, error.message);
      return false;
    }
  }

  async deleteCollection(name: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.deleteCollection(name);
      this.logger.log(`Deleted collection: ${name}`);
      return true;
    } catch (error) {
      if (error.message?.includes('not found')) {
        return true;
      }
      this.logger.error(`Failed to delete collection ${name}:`, error.message);
      return false;
    }
  }

  async listCollections(): Promise<string[]> {
    if (!this.client) return [];

    try {
      const result = await this.client.getCollections();
      return result.collections.map((c) => c.name);
    } catch (error) {
      this.logger.error('Failed to list collections:', error.message);
      return [];
    }
  }

  async getCollectionInfo(name: string): Promise<CollectionInfo | null> {
    if (!this.client) return null;

    try {
      const info = await this.client.getCollection(name);
      return {
        name,
        vectorSize: (info.config?.params?.vectors as any)?.size || 0,
        distance: ((info.config?.params?.vectors as any)?.distance || 'cosine').toLowerCase() as any,
        points: info.points_count || 0,
        status: info.status,
      };
    } catch (error) {
      this.logger.error(`Failed to get collection info ${name}:`, error.message);
      return null;
    }
  }

  // ============================================
  // Vector Operations
  // ============================================

  async upsertVectors(collectionName: string, documents: VectorDocument[]): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Qdrant not initialized');
      return false;
    }

    try {
      const points = documents.map((doc) => ({
        id: this.formatPointId(doc.id),
        vector: doc.vector,
        payload: doc.payload || {},
      }));

      await this.client.upsert(collectionName, {
        wait: true,
        points,
      });

      this.logger.debug(`Upserted ${documents.length} vectors to ${collectionName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to upsert vectors to ${collectionName}:`, error.message);
      return false;
    }
  }

  async bulkInsertVectors(
    collectionName: string,
    documents: VectorDocument[],
    batchSize: number = 100,
  ): Promise<boolean> {
    if (!this.client) return false;

    try {
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await this.upsertVectors(collectionName, batch);
        this.logger.debug(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
      }
      return true;
    } catch (error) {
      this.logger.error('Bulk insert failed:', error.message);
      return false;
    }
  }

  async searchVectors(
    collectionName: string,
    queryVector: number[],
    limit: number = 10,
    scoreThreshold?: number,
    filter?: Record<string, any>,
  ): Promise<VectorSearchResult[]> {
    if (!this.client) {
      this.logger.warn('Qdrant not initialized');
      return [];
    }

    try {
      const searchParams: any = {
        vector: queryVector,
        limit,
        with_payload: true,
      };

      if (scoreThreshold !== undefined) {
        searchParams.score_threshold = scoreThreshold;
      }

      if (filter) {
        searchParams.filter = this.buildFilter(filter);
      }

      const results = await this.client.search(collectionName, searchParams);

      return results.map((result) => ({
        id: String(result.id),
        score: result.score,
        payload: result.payload as Record<string, any>,
      }));
    } catch (error) {
      if (error.message?.includes('not found')) {
        return [];
      }
      this.logger.error(`Search failed in ${collectionName}:`, error.message);
      return [];
    }
  }

  async getVector(collectionName: string, id: string): Promise<VectorDocument | null> {
    if (!this.client) return null;

    try {
      const result = await this.client.retrieve(collectionName, {
        ids: [this.formatPointId(id)],
        with_vector: true,
        with_payload: true,
      });

      if (result.length === 0) return null;

      const point = result[0];
      return {
        id: String(point.id),
        vector: point.vector as number[],
        payload: point.payload as Record<string, any>,
      };
    } catch (error) {
      this.logger.error(`Failed to get vector ${id}:`, error.message);
      return null;
    }
  }

  async deleteVector(collectionName: string, id: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.delete(collectionName, {
        wait: true,
        points: [this.formatPointId(id)],
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete vector ${id}:`, error.message);
      return false;
    }
  }

  async deleteByFilter(collectionName: string, filter: Record<string, any>): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.delete(collectionName, {
        wait: true,
        filter: this.buildFilter(filter),
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete by filter:', error.message);
      return false;
    }
  }

  async countVectors(collectionName: string, filter?: Record<string, any>): Promise<number> {
    if (!this.client) return 0;

    try {
      const countParams: any = { exact: true };
      if (filter) {
        countParams.filter = this.buildFilter(filter);
      }

      const result = await this.client.count(collectionName, countParams);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to count vectors in ${collectionName}:`, error.message);
      return 0;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private buildFilter(filter: Record<string, any>): any {
    const must: any[] = [];

    for (const [key, value] of Object.entries(filter)) {
      if (Array.isArray(value)) {
        must.push({
          key,
          match: { any: value },
        });
      } else if (typeof value === 'object' && value.range) {
        must.push({
          key,
          range: value.range,
        });
      } else {
        must.push({
          key,
          match: { value },
        });
      }
    }

    return { must };
  }

  private formatPointId(id: string): string | number {
    // UUID format
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return id;
    }

    // Numeric string
    if (/^\d+$/.test(id)) {
      return parseInt(id, 10);
    }

    // Hash to UUID for other strings
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(id).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  }

  async getHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'disabled';
    collections?: string[];
    error?: string;
  }> {
    if (!this.client) {
      return { status: 'disabled' };
    }

    try {
      const collections = await this.listCollections();
      return { status: 'healthy', collections };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
