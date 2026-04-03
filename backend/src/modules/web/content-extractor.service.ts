import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScreenshotService } from './screenshot.service';

export interface ExtractedContent {
  title: string;
  content: string;
  textContent: string;
  wordCount: number;
  readingTime: number;
  headings?: Array<{ level: number; text: string }>;
  links?: Array<{ text: string; href: string }>;
  metadata: {
    description?: string;
    author?: string;
    publishedTime?: string;
    siteName?: string;
    image?: string;
    favicon?: string;
    type?: string;
  };
}

export interface ExtractionOptions {
  usePuppeteer?: boolean; // Default: true - use Puppeteer for JS-rendered content
  timeout?: number;
}

@Injectable()
export class ContentExtractorService {
  private readonly logger = new Logger(ContentExtractorService.name);

  constructor(
    @Inject(forwardRef(() => ScreenshotService))
    private readonly screenshotService: ScreenshotService,
  ) {}

  /**
   * Fetch and extract content from a URL
   * Uses Puppeteer by default for JS-heavy sites, falls back to axios+cheerio
   */
  async extractFromUrl(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<ExtractedContent> {
    const { usePuppeteer = true, timeout = 45000 } = options;

    this.logger.log(`Extracting content from: ${url} (puppeteer: ${usePuppeteer})`);

    // Try Puppeteer first for better JS support
    if (usePuppeteer) {
      try {
        const puppeteerContent = await this.screenshotService.extractContent(url);

        // Calculate stats
        const wordCount = this.countWords(puppeteerContent.textContent);
        const readingTime = Math.ceil(wordCount / 200);

        this.logger.log(`Puppeteer extraction successful: ${wordCount} words from ${url}`);

        return {
          title: puppeteerContent.title || puppeteerContent.metadata.ogTitle || 'Untitled',
          content: puppeteerContent.html,
          textContent: puppeteerContent.textContent,
          wordCount,
          readingTime,
          headings: puppeteerContent.headings,
          links: puppeteerContent.links,
          metadata: {
            description: puppeteerContent.description || puppeteerContent.metadata.ogDescription,
            author: puppeteerContent.metadata.author,
            publishedTime: puppeteerContent.metadata.publishedTime,
            image: puppeteerContent.metadata.ogImage,
          },
        };
      } catch (error: any) {
        this.logger.warn(`Puppeteer extraction failed, falling back to axios: ${error.message}`);
        // Fall through to axios+cheerio
      }
    }

    // Fallback: Use axios + cheerio (lightweight, no JS rendering)
    return this.extractWithAxios(url, timeout);
  }

  /**
   * Extract content using axios + cheerio (lightweight, no JS rendering)
   */
  private async extractWithAxios(url: string, timeout = 30000): Promise<ExtractedContent> {
    this.logger.log(`Using axios+cheerio for: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout,
        maxRedirects: 5,
      });

      const html = response.data;
      return this.extractFromHtml(html, url);
    } catch (error: any) {
      this.logger.error(`Failed to fetch URL: ${error.message}`);
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }

  /**
   * Extract content from HTML string
   */
  extractFromHtml(html: string, url: string): ExtractedContent {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $(
      'script, style, nav, footer, header, aside, .advertisement, .ad, .ads, .sidebar, .comment, .comments, .social-share, .related-posts, noscript, iframe'
    ).remove();

    // Extract metadata
    const metadata = this.extractMetadata($, url);

    // Extract title
    const title = this.extractTitle($);

    // Extract main content
    const content = this.extractMainContent($);
    const textContent = this.cleanText(content);

    // Calculate stats
    const wordCount = this.countWords(textContent);
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    return {
      title,
      content,
      textContent,
      wordCount,
      readingTime,
      metadata,
    };
  }

  /**
   * Extract metadata from page
   */
  private extractMetadata(
    $: ReturnType<typeof cheerio.load>,
    url: string
  ): ExtractedContent['metadata'] {
    const getMetaContent = (name: string): string | undefined => {
      return (
        $(`meta[name="${name}"]`).attr('content') ||
        $(`meta[property="${name}"]`).attr('content') ||
        $(`meta[property="og:${name}"]`).attr('content') ||
        $(`meta[name="twitter:${name}"]`).attr('content') ||
        undefined
      );
    };

    // Get favicon
    let favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href');

    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.host}${favicon.startsWith('/') ? '' : '/'}${favicon}`;
    }

    return {
      description: getMetaContent('description'),
      author: getMetaContent('author'),
      publishedTime:
        getMetaContent('article:published_time') ||
        getMetaContent('datePublished'),
      siteName: getMetaContent('site_name'),
      image: getMetaContent('image'),
      favicon,
      type: getMetaContent('type'),
    };
  }

  /**
   * Extract page title
   */
  private extractTitle($: ReturnType<typeof cheerio.load>): string {
    return (
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      'Untitled'
    );
  }

  /**
   * Extract main content from page
   */
  private extractMainContent($: ReturnType<typeof cheerio.load>): string {
    // Try to find article content
    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      '.post',
      '#content',
      '.main-content',
    ];

    for (const selector of selectors) {
      const content = $(selector).first();
      if (content.length && content.text().trim().length > 200) {
        return content.html() || '';
      }
    }

    // Fallback to body
    return $('body').html() || '';
  }

  /**
   * Clean extracted text
   */
  private cleanText(html: string): string {
    const $ = cheerio.load(html);
    let text = $('body').text() || $(':root').text() || '';

    // Clean up whitespace
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return text;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Get just the metadata without full content extraction
   */
  async getMetadata(url: string): Promise<ExtractedContent['metadata'] & { url: string; title: string }> {
    this.logger.log(`Fetching metadata for: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; WantsBot/1.0; +https://wants.app)',
          Accept: 'text/html',
        },
        timeout: 10000,
        maxRedirects: 3,
      });

      const $ = cheerio.load(response.data);
      const metadata = this.extractMetadata($, url);
      const title = this.extractTitle($);

      return {
        url,
        title,
        ...metadata,
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch metadata: ${error.message}`);
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }
}
