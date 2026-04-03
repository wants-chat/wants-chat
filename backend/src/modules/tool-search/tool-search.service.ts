import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantService, VectorSearchResult } from '../qdrant/qdrant.service';
import { AiService } from '../ai/ai.service';
import {
  ToolSearchResult,
  ToolEmbeddingPayload,
  ToolSearchResponse,
} from './dto/tool-search.dto';

const COLLECTION_NAME = 'wants_tool_discovery';
const VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small
const SUGGESTION_THRESHOLD = 0.20; // Low threshold for suggestions (supports multilingual)

@Injectable()
export class ToolSearchService implements OnModuleInit {
  private readonly logger = new Logger(ToolSearchService.name);
  private initialized = false;

  constructor(
    private qdrantService: QdrantService,
    private aiService: AiService,
  ) {}

  async onModuleInit() {
    // Initialize collection in background to not block app startup
    this.initializeAsync();
  }

  private async initializeAsync(): Promise<void> {
    // Wait for Qdrant to be ready (with 5s timeout)
    const qdrantReady = await this.qdrantService.waitForInit(5000);
    if (!qdrantReady) {
      if (!this.qdrantService.isHostConfigured()) {
        this.logger.warn('QDRANT_HOST not configured - tool search will use fallback');
      }
      return;
    }

    try {
      await this.ensureCollection();
    } catch (err) {
      this.logger.warn(`Failed to ensure collection: ${err.message}`);
    }
  }

  private async ensureCollection(): Promise<void> {
    if (!this.qdrantService.isConfigured()) {
      return; // Already logged by initializeAsync
    }

    try {
      const collections = await this.qdrantService.listCollections();
      if (!collections.includes(COLLECTION_NAME)) {
        await this.qdrantService.createCollection(
          COLLECTION_NAME,
          VECTOR_SIZE,
          'Cosine',
        );
        this.logger.log(`Created tool discovery collection: ${COLLECTION_NAME}`);
      }

      const count = await this.qdrantService.countVectors(COLLECTION_NAME);
      this.logger.log(`Tool discovery collection has ${count} tools`);
      this.initialized = count > 0;
    } catch (error) {
      this.logger.error('Failed to initialize tool search collection:', error.message);
    }
  }

  /**
   * Search tools using semantic vector search with keyword boosting
   */
  async searchTools(
    query: string,
    limit: number = 8,
    category?: string,
  ): Promise<ToolSearchResponse> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return { tools: [], query: '', totalMatches: 0 };
    }

    // If Qdrant not available or not seeded, use fallback
    if (!this.qdrantService.isConfigured() || !this.aiService.isConfigured()) {
      this.logger.warn('Services not configured, returning empty results');
      return { tools: [], query: normalizedQuery, totalMatches: 0 };
    }

    if (!this.initialized) {
      this.logger.warn('Tool discovery collection not seeded yet');
      return { tools: [], query: normalizedQuery, totalMatches: 0 };
    }

    try {
      // 1. Generate embedding for user query
      const embedding = await this.aiService.generateEmbedding(normalizedQuery);

      // 2. Build filter if category specified
      const filter = category ? { category } : undefined;

      // 3. Vector search with LOW threshold (get extra for reranking)
      const results = await this.qdrantService.searchVectors(
        COLLECTION_NAME,
        embedding,
        limit * 2,
        SUGGESTION_THRESHOLD,
        filter,
      );

      if (results.length === 0) {
        this.logger.debug(`No results for query: "${normalizedQuery}"`);
        return { tools: [], query: normalizedQuery, totalMatches: 0 };
      }

      // 4. Apply keyword boost and transform results
      const boostedResults = this.applyKeywordBoost(results, normalizedQuery);

      // 5. Return top N results
      const tools = boostedResults.slice(0, limit);

      this.logger.log(
        `Tool search: "${normalizedQuery}" → ${tools.length} results (top: ${tools[0]?.title} @ ${tools[0]?.score.toFixed(3)})`,
      );

      return {
        tools,
        query: normalizedQuery,
        totalMatches: results.length,
      };
    } catch (error) {
      this.logger.error('Tool search failed:', error.message);
      return { tools: [], query: normalizedQuery, totalMatches: 0 };
    }
  }

  /**
   * Apply keyword-based score boost for exact/partial matches
   */
  private applyKeywordBoost(
    results: VectorSearchResult[],
    query: string,
  ): ToolSearchResult[] {
    const queryWords = query.split(/\s+/).filter((w) => w.length > 1);

    return results
      .map((r) => {
        let boost = 0;
        const payload = r.payload as ToolEmbeddingPayload;

        // Title contains query word (+20%)
        const titleLower = payload.title.toLowerCase();
        if (queryWords.some((w) => titleLower.includes(w))) {
          boost += 0.2;
        }

        // Exact title match (+30%)
        if (titleLower.includes(query)) {
          boost += 0.3;
        }

        // Synonym match (+15%)
        if (
          payload.synonyms?.some((s) =>
            queryWords.some((w) => s.includes(w) || w.includes(s)),
          )
        ) {
          boost += 0.15;
        }

        // Use case match (+10%)
        if (
          payload.useCases?.some((uc) =>
            queryWords.some((w) => uc.toLowerCase().includes(w)),
          )
        ) {
          boost += 0.1;
        }

        // Description match (+5%)
        const descLower = payload.description.toLowerCase();
        if (queryWords.some((w) => descLower.includes(w))) {
          boost += 0.05;
        }

        return {
          toolId: payload.toolId,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          categoryName: payload.categoryName,
          icon: payload.icon,
          type: payload.type,
          score: Math.min(r.score + boost, 1.0),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Seed a single tool embedding
   */
  async seedTool(toolData: {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryName: string;
    type: string;
    icon: string;
    synonyms?: string[];
    useCases?: string[];
    multilingual?: string[];
  }): Promise<boolean> {
    if (!this.qdrantService.isConfigured() || !this.aiService.isConfigured()) {
      return false;
    }

    try {
      const synonyms = toolData.synonyms || [];
      const useCases = toolData.useCases || [];
      const multilingual = toolData.multilingual || [];

      // Build rich search text
      const searchText = [
        toolData.title,
        toolData.description,
        toolData.categoryName,
        ...synonyms,
        ...useCases,
        ...multilingual,
      ].join(' | ');

      // Generate embedding
      const embedding = await this.aiService.generateEmbedding(searchText);

      // Store in Qdrant
      await this.qdrantService.upsertVectors(COLLECTION_NAME, [
        {
          id: toolData.id,
          vector: embedding,
          payload: {
            toolId: toolData.id,
            title: toolData.title,
            description: toolData.description,
            category: toolData.category,
            categoryName: toolData.categoryName,
            type: toolData.type,
            icon: toolData.icon,
            searchText,
            synonyms,
            useCases,
            languages: ['en'],
            popularity: 0,
          } as ToolEmbeddingPayload,
        },
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Failed to seed tool ${toolData.id}:`, error.message);
      return false;
    }
  }

  /**
   * Seed multiple tools in batches
   */
  async seedTools(
    tools: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      categoryName: string;
      type: string;
      icon: string;
      synonyms?: string[];
      useCases?: string[];
      multilingual?: string[];
    }>,
  ): Promise<{ success: number; failed: number }> {
    if (!this.qdrantService.isConfigured() || !this.aiService.isConfigured()) {
      return { success: 0, failed: tools.length };
    }

    let success = 0;
    let failed = 0;

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < tools.length; i += batchSize) {
      const batch = tools.slice(i, i + batchSize);

      try {
        // Build search texts
        const searchTexts = batch.map((tool) =>
          [
            tool.title,
            tool.description,
            tool.categoryName,
            ...(tool.synonyms || []),
            ...(tool.useCases || []),
            ...(tool.multilingual || []),
          ].join(' | '),
        );

        // Generate embeddings for batch
        const embeddings = await this.aiService.generateEmbeddings(searchTexts);

        // Prepare documents
        const documents = batch.map((tool, idx) => ({
          id: tool.id,
          vector: embeddings[idx],
          payload: {
            toolId: tool.id,
            title: tool.title,
            description: tool.description,
            category: tool.category,
            categoryName: tool.categoryName,
            type: tool.type,
            icon: tool.icon,
            searchText: searchTexts[idx],
            synonyms: tool.synonyms || [],
            useCases: tool.useCases || [],
            languages: ['en'],
            popularity: 0,
          } as ToolEmbeddingPayload,
        }));

        await this.qdrantService.upsertVectors(COLLECTION_NAME, documents);
        success += batch.length;

        this.logger.log(
          `Seeded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tools.length / batchSize)} (${success} tools)`,
        );
      } catch (error) {
        this.logger.error(`Failed to seed batch:`, error.message);
        failed += batch.length;
      }

      // Small delay to avoid rate limits
      if (i + batchSize < tools.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    this.initialized = success > 0;
    return { success, failed };
  }

  /**
   * Get tool count in the collection
   */
  async getToolCount(): Promise<number> {
    if (!this.qdrantService.isConfigured()) {
      return 0;
    }
    return this.qdrantService.countVectors(COLLECTION_NAME);
  }

  /**
   * Clear all tool embeddings
   */
  async clearAllTools(): Promise<boolean> {
    if (!this.qdrantService.isConfigured()) {
      return false;
    }

    try {
      await this.qdrantService.deleteCollection(COLLECTION_NAME);
      await this.qdrantService.createCollection(COLLECTION_NAME, VECTOR_SIZE, 'Cosine');
      this.initialized = false;
      this.logger.log('Cleared all tool embeddings');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear tools:', error.message);
      return false;
    }
  }

  /**
   * Check if collection is seeded
   */
  isSeeded(): boolean {
    return this.initialized;
  }
}
