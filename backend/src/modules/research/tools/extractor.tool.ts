import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  ExtractedSource,
  SourceMetadata,
  ContentChunk,
  SearchResult,
} from '../interfaces/research.interface';
import { ContentExtractorService } from '../../web/content-extractor.service';

// ============================================
// Jina Reader Tool
// ============================================

interface JinaReaderResponse {
  code: number;
  status: number;
  data: {
    title: string;
    description?: string;
    url: string;
    content: string;
    text?: string;
    html?: string;
    usage?: {
      tokens: number;
    };
  };
}

@Injectable()
export class JinaReaderTool {
  private readonly logger = new Logger(JinaReaderTool.name);
  private readonly baseUrl = 'https://r.jina.ai';
  private readonly apiKey: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('JINA_API_KEY', '');
    this.isConfigured = true; // Jina Reader works without API key (with rate limits)

    if (!this.apiKey) {
      this.logger.warn('JINA_API_KEY not configured - using rate-limited access');
    }
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  async extract(url: string, options?: { timeout?: number }): Promise<ExtractedSource | null> {
    try {
      this.logger.debug(`Jina Reader extracting: ${url}`);

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.get<JinaReaderResponse>(
        `${this.baseUrl}/${url}`,
        {
          headers,
          timeout: options?.timeout || 60000, // Increased timeout for slow sites
        },
      );

      const data = response.data.data;

      if (!data || !data.content) {
        this.logger.warn(`Jina Reader returned empty content for: ${url}`);
        return null;
      }

      // Clean and process the content
      const textContent = this.cleanText(data.content);
      const wordCount = textContent.split(/\s+/).filter((w) => w.length > 0).length;

      return {
        id: `jina-${Date.now()}-${this.hashUrl(url)}`,
        url: data.url || url,
        title: data.title || 'Untitled',
        content: data.content,
        markdown: data.content, // Jina returns markdown by default
        textContent,
        wordCount,
        metadata: {
          description: data.description,
        },
        extractionMethod: 'jina',
        extractedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`Jina Reader extraction failed for ${url}: ${error.message}`);
      return null;
    }
  }

  async extractBatch(
    urls: string[],
    options?: { concurrency?: number; timeout?: number },
  ): Promise<ExtractedSource[]> {
    const concurrency = options?.concurrency || 5;
    const results: ExtractedSource[] = [];

    // Process in batches for rate limiting
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((url) => this.extract(url, { timeout: options?.timeout })),
      );
      results.push(...batchResults.filter((r): r is ExtractedSource => r !== null));

      // Small delay between batches for rate limiting
      if (i + concurrency < urls.length) {
        await this.delay(500);
      }
    }

    return results;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/[#*_`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ')
      .trim();
  }

  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// Content Extraction Aggregator
// ============================================

@Injectable()
export class ContentExtractorTool {
  private readonly logger = new Logger(ContentExtractorTool.name);

  // File extensions that are not extractable web content
  private readonly NON_EXTRACTABLE_EXTENSIONS = [
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp',
    // Archives
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
    // Media
    '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.wav', '.ogg', '.webm',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.webp', '.tiff',
    // Code/data
    '.exe', '.msi', '.dmg', '.apk', '.ipa', '.deb', '.rpm',
    '.csv', '.json', '.xml', '.yaml', '.yml',
  ];

  // URL patterns that indicate download/non-content URLs
  private readonly NON_EXTRACTABLE_PATTERNS = [
    /download\.php/i,
    /action=download/i,
    /file_download/i,
    /getfile/i,
    /attachment/i,
    /\/download\//i,
    /export.*format=/i,
  ];

  constructor(
    private jinaReader: JinaReaderTool,
    @Inject(forwardRef(() => ContentExtractorService))
    private cheerioExtractor: ContentExtractorService,
  ) {}

  /**
   * Check if a URL is likely to be extractable web content
   */
  private isExtractableUrl(url: string): { extractable: boolean; reason?: string } {
    try {
      const urlLower = url.toLowerCase();
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname.toLowerCase();

      // Check for non-extractable file extensions
      for (const ext of this.NON_EXTRACTABLE_EXTENSIONS) {
        if (pathname.endsWith(ext)) {
          return { extractable: false, reason: `File extension ${ext} is not web content` };
        }
      }

      // Check for download patterns in URL
      for (const pattern of this.NON_EXTRACTABLE_PATTERNS) {
        if (pattern.test(url)) {
          return { extractable: false, reason: `URL matches download pattern: ${pattern}` };
        }
      }

      // Check for suspicious query parameters
      const params = parsedUrl.searchParams;
      if (params.has('download') || params.has('export') || params.has('attachment')) {
        return { extractable: false, reason: 'URL has download-related query parameter' };
      }

      return { extractable: true };
    } catch {
      // If URL parsing fails, still try to extract
      return { extractable: true };
    }
  }

  /**
   * Extract content from a single URL using the best available method
   */
  async extractFromUrl(url: string, options?: {
    useJina?: boolean;
    timeout?: number;
  }): Promise<ExtractedSource | null> {
    // Check if URL is extractable before attempting
    const urlCheck = this.isExtractableUrl(url);
    if (!urlCheck.extractable) {
      this.logger.debug(`Skipping non-extractable URL: ${url} (${urlCheck.reason})`);
      return null;
    }

    const useJina = options?.useJina ?? true;

    // Try Jina Reader first (best for article content)
    if (useJina && this.jinaReader.isAvailable()) {
      const jinaResult = await this.jinaReader.extract(url, { timeout: options?.timeout });
      if (jinaResult && jinaResult.textContent.length > 200) {
        return jinaResult;
      }
    }

    // Fallback to Cheerio-based extraction
    try {
      const extracted = await this.cheerioExtractor.extractFromUrl(url);

      return {
        id: `cheerio-${Date.now()}-${this.hashUrl(url)}`,
        url,
        title: extracted.title,
        content: extracted.content,
        textContent: extracted.textContent,
        wordCount: extracted.wordCount,
        metadata: {
          description: extracted.metadata.description,
          author: extracted.metadata.author,
          publishedDate: extracted.metadata.publishedTime,
          siteName: extracted.metadata.siteName,
          image: extracted.metadata.image,
          favicon: extracted.metadata.favicon,
          type: extracted.metadata.type,
        },
        extractionMethod: 'cheerio',
        extractedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`Cheerio extraction failed for ${url}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract content from multiple URLs with rate limiting
   */
  async extractFromUrls(
    urls: string[],
    options?: {
      useJina?: boolean;
      concurrency?: number;
      timeout?: number;
      progressCallback?: (completed: number, total: number) => void;
    },
  ): Promise<ExtractedSource[]> {
    // Filter out non-extractable URLs upfront
    const extractableUrls: string[] = [];
    const skippedUrls: { url: string; reason: string }[] = [];

    for (const url of urls) {
      const check = this.isExtractableUrl(url);
      if (check.extractable) {
        extractableUrls.push(url);
      } else {
        skippedUrls.push({ url, reason: check.reason || 'Unknown' });
      }
    }

    if (skippedUrls.length > 0) {
      this.logger.log(
        `Filtered out ${skippedUrls.length} non-extractable URLs (downloads, files, etc.)`
      );
      this.logger.debug(`Skipped URLs: ${skippedUrls.map(s => s.url).join(', ')}`);
    }

    const concurrency = options?.concurrency || 5;
    const results: ExtractedSource[] = [];
    let completed = 0;
    const totalToProcess = extractableUrls.length;

    // Process in batches
    for (let i = 0; i < extractableUrls.length; i += concurrency) {
      const batch = extractableUrls.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((url) =>
          this.extractFromUrl(url, {
            useJina: options?.useJina,
            timeout: options?.timeout,
          }),
        ),
      );

      for (const result of batchResults) {
        if (result) {
          results.push(result);
        }
        completed++;
        if (options?.progressCallback) {
          // Report progress based on original URL count for consistency
          options.progressCallback(
            completed + skippedUrls.length,
            urls.length
          );
        }
      }

      // Small delay between batches
      if (i + concurrency < extractableUrls.length) {
        await this.delay(300);
      }
    }

    this.logger.log(
      `Extraction complete: ${results.length} successful out of ${extractableUrls.length} attempted (${skippedUrls.length} skipped)`
    );

    return results;
  }

  /**
   * Extract content from search results
   */
  async extractFromSearchResults(
    searchResults: SearchResult[],
    options?: {
      maxResults?: number;
      useJina?: boolean;
      concurrency?: number;
      progressCallback?: (completed: number, total: number) => void;
    },
  ): Promise<ExtractedSource[]> {
    const maxResults = options?.maxResults || searchResults.length;
    const urls = searchResults.slice(0, maxResults).map((r) => r.url);

    return this.extractFromUrls(urls, {
      useJina: options?.useJina,
      concurrency: options?.concurrency,
      progressCallback: options?.progressCallback,
    });
  }

  /**
   * Chunk content for embedding/analysis
   */
  chunkContent(
    content: string,
    options?: {
      chunkSize?: number;
      overlap?: number;
    },
  ): ContentChunk[] {
    const chunkSize = options?.chunkSize || 1000;
    const overlap = options?.overlap || 200;
    const chunks: ContentChunk[] = [];

    // Split into sentences first
    const sentences = content.split(/(?<=[.!?])\s+/);
    let currentChunk = '';
    let startIndex = 0;

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > chunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: `chunk-${chunks.length}`,
          content: currentChunk.trim(),
          startIndex,
          endIndex: startIndex + currentChunk.length,
        });

        // Start new chunk with overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.ceil(overlap / 5));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
        startIndex = startIndex + currentChunk.length - overlapWords.join(' ').length;
      } else {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      }
    }

    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push({
        id: `chunk-${chunks.length}`,
        content: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length,
      });
    }

    return chunks;
  }

  /**
   * Extract key information from content using patterns
   */
  extractKeyInfo(content: string): {
    statistics: string[];
    quotes: string[];
    dates: string[];
    urls: string[];
  } {
    const statistics: string[] = [];
    const quotes: string[] = [];
    const dates: string[] = [];
    const urls: string[] = [];

    // Extract statistics (numbers with context)
    const statPattern = /(\d+(?:\.\d+)?%?)\s*(?:of|in|per|more|less|than|increase|decrease|growth|decline)/gi;
    let match;
    while ((match = statPattern.exec(content)) !== null) {
      const context = content.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50);
      statistics.push(context.trim());
    }

    // Extract quoted text
    const quotePattern = /"([^"]{20,500})"/g;
    while ((match = quotePattern.exec(content)) !== null) {
      quotes.push(match[1]);
    }

    // Extract dates
    const datePattern = /(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})|(?:\d{4})/gi;
    while ((match = datePattern.exec(content)) !== null) {
      if (!dates.includes(match[0])) {
        dates.push(match[0]);
      }
    }

    // Extract URLs
    const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    while ((match = urlPattern.exec(content)) !== null) {
      if (!urls.includes(match[0])) {
        urls.push(match[0]);
      }
    }

    return {
      statistics: statistics.slice(0, 10),
      quotes: quotes.slice(0, 5),
      dates: dates.slice(0, 10),
      urls: urls.slice(0, 10),
    };
  }

  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
