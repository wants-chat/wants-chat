import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ContentExtractorService, ExtractedContent } from './content-extractor.service';
import { ScreenshotService, ScreenshotOptions } from './screenshot.service';
import { AiService } from '../ai/ai.service';
import { R2Service } from '../storage/r2.service';
import { ContentService, UserContent } from '../content/content.service';

export interface UrlSummary {
  url: string;
  title: string;
  summary: string;
  keyPoints: string[];
  quotes?: string[];
  contentId?: string;
}

export interface ScreenshotResult {
  url: string;
  imageUrl: string;
  width: number;
  height: number;
  fullPage: boolean;
  capturedAt: string;
  contentId?: string;
}

@Injectable()
export class WebService {
  private readonly logger = new Logger(WebService.name);

  constructor(
    private readonly contentExtractor: ContentExtractorService,
    private readonly screenshotService: ScreenshotService,
    @Inject(forwardRef(() => AiService))
    private readonly aiService: AiService,
    private readonly r2Service: R2Service,
    private readonly contentService: ContentService,
  ) {}

  /**
   * Fetch URL metadata (title, description, image, etc.)
   */
  async getMetadata(url: string) {
    this.logger.log(`Getting metadata for: ${url}`);
    return this.contentExtractor.getMetadata(url);
  }

  /**
   * Fetch and extract content from URL
   */
  async fetchContent(url: string): Promise<ExtractedContent> {
    this.logger.log(`Fetching content from: ${url}`);
    return this.contentExtractor.extractFromUrl(url);
  }

  /**
   * Summarize a URL using LLM
   * @param url - The URL to summarize
   * @param userId - Optional user ID for saving to content library
   */
  async summarizeUrl(url: string, userId?: string): Promise<UrlSummary> {
    this.logger.log(`Summarizing URL: ${url}`);

    // First extract the content
    const extracted = await this.contentExtractor.extractFromUrl(url);

    // Truncate content if too long (avoid token limits)
    const maxContentLength = 15000;
    let contentToSummarize = extracted.textContent;
    if (contentToSummarize.length > maxContentLength) {
      contentToSummarize = contentToSummarize.slice(0, maxContentLength) + '...';
    }

    // Create summarization prompt
    const prompt = `Summarize the following web page content. Provide:
1. A concise summary (2-3 sentences)
2. 3-5 key points as bullet points
3. Any notable quotes or statistics (if present)

URL: ${url}
Title: ${extracted.title}

Content:
${contentToSummarize}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["point 1", "point 2", ...],
  "quotes": ["quote 1", ...] // optional, only if notable quotes exist
}`;

    let contentId: string | undefined;

    try {
      const response = await this.aiService.generateText(prompt, {
        systemMessage: 'You are a helpful assistant that summarizes web content. Always respond with valid JSON.',
        maxTokens: 1000,
        responseFormat: 'json_object',
      });

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse summary response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // If userId is provided, save summary to content library
      if (userId) {
        try {
          const hostname = new URL(url).hostname;
          const content = await this.contentService.createContent(userId, {
            contentType: 'text',
            url: url, // Original URL for reference
            filename: `summary-${hostname}.md`,
            title: `Summary: ${extracted.title || hostname}`,
            prompt: `Summary of ${url}`,
            model: 'llm-summarizer',
            metadata: {
              sourceUrl: url,
              type: 'summary',
              summary: parsed.summary,
              keyPoints: parsed.keyPoints || [],
              quotes: parsed.quotes || [],
              extractedAt: new Date().toISOString(),
            },
          });
          contentId = content.id;
          this.logger.log(`Summary saved to content library: ${contentId}`);
        } catch (error: any) {
          this.logger.error(`Failed to save summary to content library: ${error.message}`);
        }
      }

      return {
        url,
        title: extracted.title,
        summary: parsed.summary,
        keyPoints: parsed.keyPoints || [],
        quotes: parsed.quotes,
        contentId,
      };
    } catch (error: any) {
      this.logger.error(`Summarization failed: ${error.message}`);

      // Return a basic summary on error
      return {
        url,
        title: extracted.title,
        summary: extracted.metadata.description || 'Failed to generate summary.',
        keyPoints: [],
      };
    }
  }

  /**
   * Capture and upload screenshot
   * @param url - The URL to capture
   * @param options - Screenshot options (fullPage, width, height, selector)
   * @param userId - Optional user ID for saving to content library
   */
  async captureScreenshot(
    url: string,
    options?: ScreenshotOptions,
    userId?: string
  ): Promise<ScreenshotResult> {
    this.logger.log(`Capturing screenshot: ${url}`);

    const result = await this.screenshotService.captureScreenshot(url, options);

    // Upload to storage
    const filename = `screenshots/${Date.now()}-${this.sanitizeFilename(url)}.png`;
    const imageUrl = await this.r2Service.uploadBuffer(
      result.buffer,
      filename,
      'image/png',
      { isPublic: true }
    );

    const capturedAt = new Date().toISOString();
    let contentId: string | undefined;

    // If userId is provided, save to user's content library
    if (userId) {
      try {
        const hostname = new URL(url).hostname;
        const content = await this.contentService.createContent(userId, {
          contentType: 'image',
          url: imageUrl,
          filename: `screenshot-${hostname}.png`,
          title: `Screenshot of ${hostname}`,
          prompt: `Screenshot captured from ${url}`,
          model: 'screenshot-capture',
          width: result.width,
          height: result.height,
          size: result.buffer.length,
          metadata: {
            sourceUrl: url,
            fullPage: result.fullPage,
            capturedAt,
            type: 'screenshot',
          },
        });
        contentId = content.id;
        this.logger.log(`Screenshot saved to content library: ${contentId}`);
      } catch (error: any) {
        this.logger.error(`Failed to save screenshot to content library: ${error.message}`);
      }
    }

    return {
      url,
      imageUrl,
      width: result.width,
      height: result.height,
      fullPage: result.fullPage,
      capturedAt,
      contentId,
    };
  }

  /**
   * Sanitize URL for use as filename
   */
  private sanitizeFilename(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/[^a-z0-9]/gi, '-').slice(0, 50);
    } catch {
      return 'screenshot';
    }
  }

  /**
   * Normalize URL by adding protocol if missing
   */
  normalizeUrl(url: string): string {
    let normalizedUrl = url.trim();

    // Add https:// if no protocol specified
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    return normalizedUrl;
  }

  /**
   * Validate URL is safe to fetch
   */
  isValidUrl(url: string): boolean {
    try {
      // Normalize URL first (add protocol if missing)
      const normalizedUrl = this.normalizeUrl(url);
      const parsed = new URL(normalizedUrl);

      // Only allow http/https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }

      // Block localhost and private IPs
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.endsWith('.local')
      ) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
