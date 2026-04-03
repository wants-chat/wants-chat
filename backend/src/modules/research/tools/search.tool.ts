import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  SearchResult,
  AggregatedSearchResults,
  SearchToolInput,
  DomainConfig,
  ResearchDepth,
} from '../interfaces/research.interface';

// ============================================
// Tavily Search Tool
// ============================================

interface TavilySearchOptions {
  query: string;
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeAnswer?: boolean;
  includeRawContent?: boolean;
  topic?: 'general' | 'news';
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
  response_time: number;
}

@Injectable()
export class TavilySearchTool {
  private readonly logger = new Logger(TavilySearchTool.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TAVILY_API_KEY', '');
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      this.logger.warn('TAVILY_API_KEY not configured - Tavily search disabled');
    }

    this.client = axios.create({
      baseURL: 'https://api.tavily.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  async search(options: TavilySearchOptions): Promise<SearchResult[]> {
    if (!this.isConfigured) {
      this.logger.warn('Tavily search called but not configured');
      return [];
    }

    try {
      this.logger.debug(`Tavily search: ${options.query}`);

      const response = await this.client.post<TavilyResponse>('/search', {
        api_key: this.apiKey,
        query: options.query,
        search_depth: options.searchDepth || 'basic',
        max_results: options.maxResults || 10,
        include_domains: options.includeDomains,
        exclude_domains: options.excludeDomains,
        include_answer: options.includeAnswer ?? false,
        include_raw_content: options.includeRawContent ?? true,
        topic: options.topic || 'general',
      });

      const results = response.data.results.map((r, index) => ({
        id: `tavily-${Date.now()}-${index}`,
        url: r.url,
        title: r.title,
        snippet: r.content,
        rawContent: r.raw_content,
        publishedDate: r.published_date,
        score: r.score,
        source: 'tavily' as const,
        metadata: {
          responseTime: response.data.response_time,
          answer: response.data.answer,
        },
      }));

      this.logger.debug(`Tavily found ${results.length} results`);
      return results;
    } catch (error: any) {
      this.logger.error(`Tavily search failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`Tavily error details: ${JSON.stringify(error.response.data)}`);
      }
      return [];
    }
  }
}

// ============================================
// Exa Search Tool
// ============================================

interface ExaSearchOptions {
  query: string;
  type?: 'neural' | 'keyword' | 'auto';
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  startPublishedDate?: string;
  endPublishedDate?: string;
  useAutoprompt?: boolean;
  category?: string;
}

interface ExaResult {
  url: string;
  id: string;
  title: string;
  text?: string;
  author?: string;
  publishedDate?: string;
  score?: number;
}

interface ExaResponse {
  results: ExaResult[];
  autopromptString?: string;
}

@Injectable()
export class ExaSearchTool {
  private readonly logger = new Logger(ExaSearchTool.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('EXA_API_KEY', '');
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      this.logger.warn('EXA_API_KEY not configured - Exa search disabled');
    }

    this.client = axios.create({
      baseURL: 'https://api.exa.ai',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  async search(options: ExaSearchOptions): Promise<SearchResult[]> {
    if (!this.isConfigured) {
      this.logger.warn('Exa search called but not configured');
      return [];
    }

    try {
      this.logger.debug(`Exa search: ${options.query}`);

      const response = await this.client.post<ExaResponse>('/search', {
        query: options.query,
        type: options.type || 'auto',
        numResults: options.numResults || 10,
        includeDomains: options.includeDomains,
        excludeDomains: options.excludeDomains,
        startPublishedDate: options.startPublishedDate,
        endPublishedDate: options.endPublishedDate,
        useAutoprompt: options.useAutoprompt ?? true,
        contents: {
          text: {
            maxCharacters: 3000,
          },
        },
      });

      const results = response.data.results.map((r, index) => ({
        id: r.id || `exa-${Date.now()}-${index}`,
        url: r.url,
        title: r.title,
        snippet: r.text || '',
        author: r.author,
        publishedDate: r.publishedDate,
        score: r.score || 0.5,
        source: 'exa' as const,
        metadata: {
          autopromptString: response.data.autopromptString,
        },
      }));

      this.logger.debug(`Exa found ${results.length} results`);
      return results;
    } catch (error: any) {
      this.logger.error(`Exa search failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`Exa error details: ${JSON.stringify(error.response.data)}`);
      }
      return [];
    }
  }

  async findSimilar(url: string, numResults: number = 10): Promise<SearchResult[]> {
    if (!this.isConfigured) {
      return [];
    }

    try {
      this.logger.debug(`Exa find similar: ${url}`);

      const response = await this.client.post<ExaResponse>('/findSimilar', {
        url,
        numResults,
        contents: {
          text: {
            maxCharacters: 3000,
          },
        },
      });

      return response.data.results.map((r, index) => ({
        id: r.id || `exa-similar-${Date.now()}-${index}`,
        url: r.url,
        title: r.title,
        snippet: r.text || '',
        author: r.author,
        publishedDate: r.publishedDate,
        score: r.score || 0.5,
        source: 'exa' as const,
      }));
    } catch (error: any) {
      this.logger.error(`Exa findSimilar failed: ${error.message}`);
      return [];
    }
  }
}

// ============================================
// Brave Search Tool (Backup/Budget)
// ============================================

interface BraveSearchOptions {
  query: string;
  count?: number;
  freshness?: 'pd' | 'pw' | 'pm' | 'py'; // past day, week, month, year
  safesearch?: 'off' | 'moderate' | 'strict';
}

interface BraveWebResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

interface BraveResponse {
  web: {
    results: BraveWebResult[];
  };
  query: {
    original: string;
  };
}

@Injectable()
export class BraveSearchTool {
  private readonly logger = new Logger(BraveSearchTool.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BRAVE_SEARCH_API_KEY', '');
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      this.logger.warn('BRAVE_SEARCH_API_KEY not configured - Brave search disabled');
    }

    this.client = axios.create({
      baseURL: 'https://api.search.brave.com/res/v1',
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': this.apiKey,
      },
    });
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  async search(options: BraveSearchOptions): Promise<SearchResult[]> {
    if (!this.isConfigured) {
      this.logger.warn('Brave search called but not configured');
      return [];
    }

    try {
      this.logger.debug(`Brave search: ${options.query}`);

      const params = new URLSearchParams({
        q: options.query,
        count: String(options.count || 10),
      });

      if (options.freshness) {
        params.append('freshness', options.freshness);
      }
      if (options.safesearch) {
        params.append('safesearch', options.safesearch);
      }

      const response = await this.client.get<BraveResponse>(`/web/search?${params.toString()}`);

      const results = (response.data.web?.results || []).map((r, index) => ({
        id: `brave-${Date.now()}-${index}`,
        url: r.url,
        title: r.title,
        snippet: r.description,
        publishedDate: r.age,
        score: 0.5, // Brave doesn't provide scores
        source: 'brave' as const,
      }));

      this.logger.debug(`Brave found ${results.length} results`);
      return results;
    } catch (error: any) {
      this.logger.error(`Brave search failed: ${error.message}`);
      return [];
    }
  }
}

// ============================================
// Search Aggregator Service
// ============================================

@Injectable()
export class SearchAggregatorService {
  private readonly logger = new Logger(SearchAggregatorService.name);

  // Domain configurations for different research topics
  private readonly domainConfigs: Record<string, DomainConfig> = {
    medical: {
      name: 'Medical/Healthcare',
      preferredDomains: [
        'pubmed.ncbi.nlm.nih.gov',
        'ncbi.nlm.nih.gov',
        'nih.gov',
        'who.int',
        'cdc.gov',
        'nature.com/nm',
        'thelancet.com',
        'nejm.org',
        'bmj.com',
        'jamanetwork.com',
      ],
      blockedDomains: [
        'webmd.com',
        'healthline.com',
        'medicalnewstoday.com',
      ],
      authoritativeDomains: [
        '.gov',
        'nature.com',
        'science.org',
        'pubmed.ncbi.nlm.nih.gov',
      ],
      searchModifiers: ['peer-reviewed', 'clinical study', 'research'],
      citationStyle: 'apa',
      requiresDisclaimer: true,
      disclaimerText: 'This research is for informational purposes only and should not be considered medical advice. Always consult with qualified healthcare professionals.',
    },
    technology: {
      name: 'Technology',
      preferredDomains: [
        'arxiv.org',
        'acm.org',
        'ieee.org',
        'nature.com',
        'science.org',
        'techcrunch.com',
        'wired.com',
        'arstechnica.com',
      ],
      blockedDomains: [],
      authoritativeDomains: [
        'arxiv.org',
        'acm.org',
        'ieee.org',
        '.edu',
      ],
      searchModifiers: ['research', 'study', 'paper'],
      citationStyle: 'ieee',
      requiresDisclaimer: false,
    },
    finance: {
      name: 'Finance/Business',
      preferredDomains: [
        'sec.gov',
        'federalreserve.gov',
        'bloomberg.com',
        'reuters.com',
        'wsj.com',
        'ft.com',
        'economist.com',
      ],
      blockedDomains: [
        'seekingalpha.com',
        'fool.com',
      ],
      authoritativeDomains: [
        '.gov',
        'bloomberg.com',
        'reuters.com',
      ],
      searchModifiers: ['analysis', 'report', 'data'],
      citationStyle: 'chicago',
      requiresDisclaimer: true,
      disclaimerText: 'This research is for informational purposes only and should not be considered financial advice. Past performance is not indicative of future results.',
    },
    legal: {
      name: 'Legal',
      preferredDomains: [
        'law.cornell.edu',
        'supremecourt.gov',
        'uscourts.gov',
        'justice.gov',
        'westlaw.com',
        'lexisnexis.com',
      ],
      blockedDomains: [],
      authoritativeDomains: [
        '.gov',
        'law.cornell.edu',
      ],
      searchModifiers: ['case law', 'statute', 'regulation'],
      citationStyle: 'chicago',
      requiresDisclaimer: true,
      disclaimerText: 'This research is for informational purposes only and should not be considered legal advice. Consult with a qualified attorney for specific legal questions.',
    },
    general: {
      name: 'General',
      preferredDomains: [],
      blockedDomains: [
        'pinterest.com',
        'facebook.com',
        'instagram.com',
        'tiktok.com',
      ],
      authoritativeDomains: [
        '.gov',
        '.edu',
        'nature.com',
        'science.org',
      ],
      searchModifiers: [],
      citationStyle: 'apa',
      requiresDisclaimer: false,
    },
  };

  constructor(
    private tavilySearch: TavilySearchTool,
    private exaSearch: ExaSearchTool,
    private braveSearch: BraveSearchTool,
  ) {}

  getDomainConfig(domain: string): DomainConfig {
    return this.domainConfigs[domain] || this.domainConfigs['general'];
  }

  getAvailableDomains(): string[] {
    return Object.keys(this.domainConfigs);
  }

  async search(
    queries: string[],
    domain: string,
    depth: ResearchDepth,
    options?: {
      includeDomains?: string[];
      excludeDomains?: string[];
      dateRange?: { from?: string; to?: string };
    },
  ): Promise<AggregatedSearchResults> {
    const config = this.getDomainConfig(domain);
    const sourcesPerQuery = this.getSourcesPerQuery(depth);
    const searchEnginesUsed: string[] = [];

    this.logger.log(`Starting aggregated search: ${queries.length} queries, depth=${depth}, domain=${domain}`);

    // Execute searches in parallel for all queries
    const allResults = await Promise.all(
      queries.map(async (query) => {
        const enhancedQuery = this.enhanceQuery(query, config);
        const results: SearchResult[] = [];

        // Run Tavily search
        if (this.tavilySearch.isAvailable()) {
          const tavilyResults = await this.tavilySearch.search({
            query: enhancedQuery,
            searchDepth: depth === 'exhaustive' ? 'advanced' : 'basic',
            maxResults: sourcesPerQuery,
            includeDomains: options?.includeDomains || config.preferredDomains.slice(0, 5),
            excludeDomains: options?.excludeDomains || config.blockedDomains,
            includeRawContent: depth !== 'quick',
          });
          results.push(...tavilyResults);
          if (!searchEnginesUsed.includes('tavily')) {
            searchEnginesUsed.push('tavily');
          }
        }

        // Run Exa search (semantic)
        if (this.exaSearch.isAvailable()) {
          const exaResults = await this.exaSearch.search({
            query: enhancedQuery,
            numResults: Math.ceil(sourcesPerQuery / 2),
            includeDomains: options?.includeDomains,
            excludeDomains: options?.excludeDomains,
            startPublishedDate: options?.dateRange?.from,
            endPublishedDate: options?.dateRange?.to,
            useAutoprompt: true,
          });
          results.push(...exaResults);
          if (!searchEnginesUsed.includes('exa')) {
            searchEnginesUsed.push('exa');
          }
        }

        // Fallback to Brave if primary engines didn't return results
        if (results.length < 5 && this.braveSearch.isAvailable()) {
          const braveResults = await this.braveSearch.search({
            query: enhancedQuery,
            count: sourcesPerQuery,
          });
          results.push(...braveResults);
          if (!searchEnginesUsed.includes('brave')) {
            searchEnginesUsed.push('brave');
          }
        }

        return { query, results };
      }),
    );

    // Deduplicate by URL
    const urlMap = new Map<string, SearchResult>();
    let totalFound = 0;

    for (const { results } of allResults) {
      totalFound += results.length;
      for (const result of results) {
        const normalizedUrl = this.normalizeUrl(result.url);
        const existing = urlMap.get(normalizedUrl);
        if (!existing || result.score > existing.score) {
          urlMap.set(normalizedUrl, result);
        }
      }
    }

    // Convert to array and sort by score
    let deduped = Array.from(urlMap.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    // Apply domain preferences (boost authoritative sources)
    deduped = this.applyDomainPreferences(deduped, config);

    const deduplicated = totalFound - deduped.length;

    this.logger.log(
      `Search complete: ${deduped.length} unique results from ${totalFound} total (${deduplicated} duplicates removed)`,
    );

    return {
      results: deduped,
      totalFound: deduped.length,
      queriesExecuted: queries.length,
      searchEnginesUsed,
      deduplicated,
    };
  }

  private getSourcesPerQuery(depth: ResearchDepth): number {
    const map: Record<ResearchDepth, number> = {
      quick: 4,
      standard: 6,
      deep: 10,
      exhaustive: 15,
    };
    return map[depth];
  }

  private enhanceQuery(query: string, config: DomainConfig): string {
    const modifiers = config.searchModifiers || [];
    if (modifiers.length > 0) {
      // Add one random modifier to avoid over-constraining
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      return `${query} ${modifier}`.trim();
    }
    return query;
  }

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove trailing slash, www prefix, and common tracking params
      let normalized = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '');
      normalized = normalized.replace('://www.', '://');
      return normalized.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private applyDomainPreferences(
    results: SearchResult[],
    config: DomainConfig,
  ): SearchResult[] {
    return results.map((result) => {
      let boost = 0;

      // Boost preferred domains
      for (const domain of config.preferredDomains || []) {
        if (result.url.includes(domain)) {
          boost += 0.2;
          break;
        }
      }

      // Boost authoritative sources
      if (this.isAuthoritativeSource(result.url, config)) {
        boost += 0.3;
      }

      return {
        ...result,
        score: (result.score || 0.5) + boost,
      };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private isAuthoritativeSource(url: string, config: DomainConfig): boolean {
    const authoritative = [
      '.gov',
      '.edu',
      'nature.com',
      'science.org',
      'pubmed.ncbi.nlm.nih.gov',
      'arxiv.org',
      'ieee.org',
      'acm.org',
      'springer.com',
      'wiley.com',
      ...(config.authoritativeDomains || []),
    ];
    return authoritative.some((d) => url.includes(d));
  }
}
