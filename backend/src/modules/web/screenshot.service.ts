import { Injectable, Logger } from '@nestjs/common';
import type * as puppeteer from 'puppeteer';

// Lazy-loaded puppeteer to avoid slow startup
let puppeteerModule: typeof import('puppeteer') | null = null;
async function getPuppeteer(): Promise<typeof import('puppeteer')> {
  if (!puppeteerModule) {
    puppeteerModule = await import('puppeteer');
  }
  return puppeteerModule;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  width?: number;
  height?: number;
  selector?: string;
}

export interface ScreenshotResult {
  buffer: Buffer;
  width: number;
  height: number;
  fullPage: boolean;
}

export interface ExtractedPageContent {
  title: string;
  description: string;
  textContent: string;
  html: string;
  links: Array<{ text: string; href: string }>;
  headings: Array<{ level: number; text: string }>;
  images: Array<{ alt: string; src: string }>;
  metadata: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    author?: string;
    publishedTime?: string;
  };
}

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  private browser: puppeteer.Browser | null = null;

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser || !this.browser.connected) {
      this.logger.log('Launching new browser instance');
      const pptr = await getPuppeteer();
      this.browser = await pptr.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Capture screenshot of a URL
   */
  async captureScreenshot(
    url: string,
    options: ScreenshotOptions = {}
  ): Promise<ScreenshotResult> {
    const { fullPage = false, width = 1280, height = 800, selector } = options;

    this.logger.log(`Capturing screenshot of: ${url}`);

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport
      await page.setViewport({ width, height });

      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait a bit for any lazy-loaded content
      await new Promise(resolve => setTimeout(resolve, 1000));

      let buffer: Buffer;
      let captureWidth = width;
      let captureHeight = height;

      if (selector) {
        // Capture specific element
        const element = await page.$(selector);
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }
        buffer = await element.screenshot({ type: 'png' }) as Buffer;
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          captureWidth = Math.round(boundingBox.width);
          captureHeight = Math.round(boundingBox.height);
        }
      } else {
        // Capture page
        buffer = await page.screenshot({
          type: 'png',
          fullPage,
        }) as Buffer;

        if (fullPage) {
          const bodyHandle = await page.$('body');
          if (bodyHandle) {
            const boundingBox = await bodyHandle.boundingBox();
            if (boundingBox) {
              captureHeight = Math.round(boundingBox.height);
            }
          }
        }
      }

      return {
        buffer,
        width: captureWidth,
        height: captureHeight,
        fullPage,
      };
    } catch (error: any) {
      this.logger.error(`Screenshot failed: ${error.message}`);
      throw new Error(`Screenshot failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Capture viewport only
   */
  async captureViewport(
    url: string,
    width = 1280,
    height = 800
  ): Promise<ScreenshotResult> {
    return this.captureScreenshot(url, { fullPage: false, width, height });
  }

  /**
   * Capture full page
   */
  async captureFullPage(url: string, width = 1280): Promise<ScreenshotResult> {
    return this.captureScreenshot(url, { fullPage: true, width });
  }

  /**
   * Extract content from a URL using Puppeteer (renders JavaScript)
   * This is more accurate than axios+cheerio for JS-heavy sites
   */
  async extractContent(url: string): Promise<ExtractedPageContent> {
    this.logger.log(`Extracting content with Puppeteer from: ${url}`);

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport
      await page.setViewport({ width: 1280, height: 800 });

      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Navigate to URL with longer timeout for JS-heavy sites
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 45000,
      });

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract content from the rendered page
      const content = await page.evaluate(() => {
        // Helper to get meta content
        const getMeta = (name: string): string | undefined => {
          const el = document.querySelector(
            `meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`
          ) as HTMLMetaElement;
          return el?.content || undefined;
        };

        // Remove unwanted elements for text extraction
        const unwantedSelectors = [
          'script', 'style', 'nav', 'footer', 'header', 'aside',
          '.advertisement', '.ad', '.ads', '.sidebar', '.cookie-banner',
          '.popup', '.modal', 'noscript', 'iframe', '[role="navigation"]',
          '.social-share', '.related-posts', '.comments'
        ];

        // Clone body for text extraction (don't modify original)
        const bodyClone = document.body.cloneNode(true) as HTMLElement;
        unwantedSelectors.forEach(selector => {
          bodyClone.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Get main content area
        const mainSelectors = [
          'article', '[role="main"]', 'main', '.post-content',
          '.article-content', '.entry-content', '.content', '.post',
          '#content', '.main-content', '.page-content'
        ];

        let mainContent = '';
        for (const selector of mainSelectors) {
          const el = bodyClone.querySelector(selector);
          if (el && el.textContent && el.textContent.trim().length > 200) {
            mainContent = el.textContent;
            break;
          }
        }

        // Fallback to full body text
        if (!mainContent || mainContent.length < 200) {
          mainContent = bodyClone.textContent || '';
        }

        // Clean up text
        const cleanText = (text: string) => {
          return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
        };

        // Extract headings
        const headings: Array<{ level: number; text: string }> = [];
        document.querySelectorAll('h1, h2, h3, h4').forEach(h => {
          const level = parseInt(h.tagName.charAt(1));
          const text = h.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) {
            headings.push({ level, text });
          }
        });

        // Extract links
        const links: Array<{ text: string; href: string }> = [];
        document.querySelectorAll('a[href]').forEach(a => {
          const text = a.textContent?.trim();
          const href = a.getAttribute('href');
          if (text && href && text.length < 100 && !href.startsWith('#') && !href.startsWith('javascript:')) {
            links.push({ text, href });
          }
        });

        // Extract images
        const images: Array<{ alt: string; src: string }> = [];
        document.querySelectorAll('img[src]').forEach(img => {
          const alt = img.getAttribute('alt') || '';
          const src = img.getAttribute('src') || '';
          if (src && !src.startsWith('data:')) {
            images.push({ alt, src });
          }
        });

        return {
          title: document.title || getMeta('title') || '',
          description: getMeta('description') || '',
          textContent: cleanText(mainContent),
          html: document.body.innerHTML.slice(0, 50000), // Limit HTML size
          links: links.slice(0, 50), // Limit links
          headings: headings.slice(0, 20), // Limit headings
          images: images.slice(0, 20), // Limit images
          metadata: {
            ogTitle: getMeta('og:title'),
            ogDescription: getMeta('og:description'),
            ogImage: getMeta('og:image'),
            author: getMeta('author'),
            publishedTime: getMeta('article:published_time'),
          },
        };
      });

      this.logger.log(`Extracted ${content.textContent.length} chars from ${url}`);

      return content;
    } catch (error: any) {
      this.logger.error(`Puppeteer extraction failed: ${error.message}`);
      throw new Error(`Content extraction failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Cleanup browser on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      this.logger.log('Closing browser instance');
      await this.browser.close();
      this.browser = null;
    }
  }
}
