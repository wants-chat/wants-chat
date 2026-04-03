import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import type * as puppeteer from 'puppeteer';

// Lazy-loaded puppeteer to avoid slow startup
let puppeteerModule: typeof import('puppeteer') | null = null;
async function getPuppeteer(): Promise<typeof import('puppeteer')> {
  if (!puppeteerModule) {
    puppeteerModule = await import('puppeteer');
  }
  return puppeteerModule;
}
import {
  QUEUE_NAMES,
  BROWSER_JOB_TYPES,
  QUEUE_EVENTS,
  DEFAULT_WORKER_OPTIONS,
  REDIS_CONNECTION_OPTIONS,
  BrowserJobData,
  BrowserJobResult,
} from '../queue.constants';

@Injectable()
export class BrowserProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BrowserProcessor.name);
  private worker: Worker;
  private connectionConfig: ConnectionOptions;
  private browser: puppeteer.Browser | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    if (!redisHost) {
      this.logger.warn('REDIS_HOST not configured - browser processor disabled');
      return;
    }
    // Initialize worker in background to not block app startup
    this.initializeWorker().then(() => {
      this.logger.log('Browser processor initialized');
    }).catch(err => {
      this.logger.error('Failed to initialize browser processor:', err.message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Puppeteer browser closed');
    }
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Browser worker closed');
    }
  }

  private async initializeWorker(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB', 0);

    this.connectionConfig = {
      host,
      port,
      password: password || undefined,
      db,
      ...REDIS_CONNECTION_OPTIONS,
    };

    this.worker = new Worker<BrowserJobData, BrowserJobResult>(
      QUEUE_NAMES.BROWSER_TASKS,
      async (job) => this.processJob(job),
      {
        connection: this.connectionConfig,
        concurrency: 2, // Lower concurrency for browser tasks
        limiter: {
          max: 5,
          duration: 1000,
        },
      },
    );

    this.setupWorkerEvents();
  }

  private setupWorkerEvents(): void {
    this.worker.on('completed', (job, result) => {
      this.logger.log(`Browser job ${job.id} completed`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_COMPLETED, {
        queue: QUEUE_NAMES.BROWSER_TASKS,
        jobId: job.id,
        result,
      });
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Browser job ${job?.id} failed: ${error.message}`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_FAILED, {
        queue: QUEUE_NAMES.BROWSER_TASKS,
        jobId: job?.id,
        error: error.message,
      });
    });

    this.worker.on('progress', (job, progress) => {
      this.logger.debug(`Browser job ${job.id} progress: ${JSON.stringify(progress)}`);
    });

    this.worker.on('error', (error) => {
      this.logger.error(`Browser worker error: ${error.message}`);
    });

    this.worker.on('stalled', (jobId) => {
      this.logger.warn(`Browser job ${jobId} stalled`);
    });
  }

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser || !this.browser.connected) {
      this.logger.debug('Launching new Puppeteer browser instance');
      const pptr = await getPuppeteer();
      this.browser = await pptr.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  private async processJob(
    job: Job<BrowserJobData>,
  ): Promise<BrowserJobResult> {
    const startTime = Date.now();
    this.logger.log(
      `Processing browser job ${job.id}: ${job.data.type} - ${job.data.url}`,
    );

    try {
      // Check for cancellation
      const progress = job.progress as any;
      if (progress?.cancelled) {
        return {
          success: false,
          error: 'Job was cancelled',
          duration: Date.now() - startTime,
        };
      }

      await job.updateProgress({ status: 'starting', percentage: 0 });

      let result: BrowserJobResult;

      switch (job.data.type) {
        case BROWSER_JOB_TYPES.SCREENSHOT:
          result = await this.handleScreenshot(job);
          break;
        case BROWSER_JOB_TYPES.PDF_GENERATION:
          result = await this.handlePdfGeneration(job);
          break;
        case BROWSER_JOB_TYPES.FORM_FILL:
          result = await this.handleFormFill(job);
          break;
        case BROWSER_JOB_TYPES.SCRAPE_PAGE:
          result = await this.handleScrapePage(job);
          break;
        case BROWSER_JOB_TYPES.MONITOR_PAGE:
          result = await this.handleMonitorPage(job);
          break;
        case BROWSER_JOB_TYPES.AUTOMATION_SCRIPT:
          result = await this.handleAutomationScript(job);
          break;
        default:
          throw new Error(`Unknown browser job type: ${job.data.type}`);
      }

      await job.updateProgress({ status: 'completed', percentage: 100 });

      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(
        `Browser job ${job.id} error: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // =============================================
  // JOB HANDLERS
  // =============================================

  private async handleScreenshot(
    job: Job<BrowserJobData>,
  ): Promise<BrowserJobResult> {
    await job.updateProgress({ status: 'launching_browser', percentage: 10 });

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const { url, viewport, waitFor, selector } = job.data;

      // Set viewport if specified
      if (viewport) {
        await page.setViewport(viewport);
      } else {
        await page.setViewport({ width: 1920, height: 1080 });
      }

      await job.updateProgress({ status: 'navigating', percentage: 30 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for additional time if specified
      if (waitFor) {
        await new Promise((resolve) => setTimeout(resolve, waitFor));
      }

      await job.updateProgress({ status: 'capturing', percentage: 70 });

      let screenshotOptions: puppeteer.ScreenshotOptions = {
        encoding: 'base64',
        fullPage: !selector,
      };

      if (selector) {
        const element = await page.$(selector);
        if (element) {
          screenshotOptions = {
            ...screenshotOptions,
            clip: await element.boundingBox() || undefined,
          };
        }
      }

      const screenshotResult = await page.screenshot(screenshotOptions);
      const screenshot = typeof screenshotResult === 'string'
        ? screenshotResult
        : Buffer.from(screenshotResult).toString('base64');

      await job.updateProgress({ status: 'finalizing', percentage: 90 });

      return {
        success: true,
        screenshot,
        metadata: {
          url,
          viewport: viewport || { width: 1920, height: 1080 },
          capturedAt: new Date().toISOString(),
        },
      };
    } finally {
      await page.close();
    }
  }

  private async handlePdfGeneration(
    job: Job<BrowserJobData>,
  ): Promise<BrowserJobResult> {
    await job.updateProgress({ status: 'launching_browser', percentage: 10 });

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const { url, waitFor, options } = job.data;

      await job.updateProgress({ status: 'navigating', percentage: 30 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      if (waitFor) {
        await new Promise((resolve) => setTimeout(resolve, waitFor));
      }

      await job.updateProgress({ status: 'generating_pdf', percentage: 60 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        ...options,
      });

      await job.updateProgress({ status: 'finalizing', percentage: 90 });

      return {
        success: true,
        pdf: Buffer.from(pdfBuffer).toString('base64'),
        metadata: {
          url,
          generatedAt: new Date().toISOString(),
          pageCount: 1, // Would need to parse PDF to get actual count
        },
      };
    } finally {
      await page.close();
    }
  }

  private async handleFormFill(
    job: Job<BrowserJobData>,
  ): Promise<BrowserJobResult> {
    await job.updateProgress({ status: 'launching_browser', percentage: 10 });

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const { url, options } = job.data;
      const formData = options?.formData || {};

      await job.updateProgress({ status: 'navigating', percentage: 20 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await job.updateProgress({ status: 'filling_form', percentage: 40 });

      // Fill in form fields
      for (const [selector, value] of Object.entries(formData)) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.type(selector, String(value));
        } catch (error) {
          this.logger.warn(`Could not fill field ${selector}: ${error.message}`);
        }
      }

      await job.updateProgress({ status: 'submitting', percentage: 70 });

      // Submit if submit selector is provided
      if (options?.submitSelector) {
        await page.click(options.submitSelector);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }

      await job.updateProgress({ status: 'capturing_result', percentage: 85 });

      const screenshot = await page.screenshot({ encoding: 'base64' });
      const html = await page.content();

      return {
        success: true,
        screenshot: screenshot as string,
        html,
        metadata: {
          url,
          fieldsProcessed: Object.keys(formData).length,
          submittedAt: new Date().toISOString(),
        },
      };
    } finally {
      await page.close();
    }
  }

  private async handleScrapePage(
    job: Job<BrowserJobData>,
  ): Promise<BrowserJobResult> {
    await job.updateProgress({ status: 'launching_browser', percentage: 10 });

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const { url, selector, waitFor, options } = job.data;

      await job.updateProgress({ status: 'navigating', percentage: 25 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      if (waitFor) {
        await new Promise((resolve) => setTimeout(resolve, waitFor));
      }

      await job.updateProgress({ status: 'extracting_data', percentage: 50 });

      let extractedData: any;

      if (selector) {
        // Extract specific elements
        extractedData = await page.evaluate((sel) => {
          const elements = document.querySelectorAll(sel);
          return Array.from(elements).map((el) => ({
            text: el.textContent?.trim(),
            html: el.innerHTML,
            attributes: Object.fromEntries(
              Array.from(el.attributes).map((attr) => [attr.name, attr.value]),
            ),
          }));
        }, selector);
      } else {
        // Extract full page content
        extractedData = await page.evaluate(() => {
          return {
            title: document.title,
            description:
              document
                .querySelector('meta[name="description"]')
                ?.getAttribute('content') || '',
            text: document.body.innerText,
            links: Array.from(document.querySelectorAll('a[href]')).map(
              (a) => ({
                text: a.textContent?.trim(),
                href: a.getAttribute('href'),
              }),
            ),
            images: Array.from(document.querySelectorAll('img[src]')).map(
              (img) => ({
                alt: img.getAttribute('alt'),
                src: img.getAttribute('src'),
              }),
            ),
          };
        });
      }

      await job.updateProgress({ status: 'finalizing', percentage: 90 });

      return {
        success: true,
        extractedData,
        html: await page.content(),
        metadata: {
          url,
          selector,
          scrapedAt: new Date().toISOString(),
        },
      };
    } finally {
      await page.close();
    }
  }

  private async handleMonitorPage(
    job: Job<BrowserJobData>,
  ): Promise<BrowserJobResult> {
    await job.updateProgress({ status: 'launching_browser', percentage: 10 });

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const { url, selector, options } = job.data;
      const checkInterval = options?.checkInterval || 5000;
      const maxChecks = options?.maxChecks || 10;

      await job.updateProgress({ status: 'navigating', percentage: 20 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await job.updateProgress({ status: 'monitoring', percentage: 30 });

      let checksPerformed = 0;
      let previousContent = '';
      const changes: Array<{ timestamp: string; content: string }> = [];

      while (checksPerformed < maxChecks) {
        const progress = job.progress as any;
        if (progress?.cancelled) {
          break;
        }

        const currentContent = selector
          ? await page.$eval(selector, (el) => el.textContent || '')
          : await page.content();

        if (previousContent && currentContent !== previousContent) {
          changes.push({
            timestamp: new Date().toISOString(),
            content: currentContent.substring(0, 500),
          });
        }

        previousContent = currentContent;
        checksPerformed++;

        const progressPercentage = 30 + (checksPerformed / maxChecks) * 60;
        await job.updateProgress({
          status: 'monitoring',
          percentage: progressPercentage,
          checksPerformed,
          changesDetected: changes.length,
        });

        if (checksPerformed < maxChecks) {
          await new Promise((resolve) => setTimeout(resolve, checkInterval));
          await page.reload({ waitUntil: 'networkidle2' });
        }
      }

      return {
        success: true,
        extractedData: {
          checksPerformed,
          changesDetected: changes.length,
          changes,
        },
        metadata: {
          url,
          selector,
          monitoredAt: new Date().toISOString(),
        },
      };
    } finally {
      await page.close();
    }
  }

  private async handleAutomationScript(
    job: Job<BrowserJobData>,
  ): Promise<BrowserJobResult> {
    await job.updateProgress({ status: 'launching_browser', percentage: 10 });

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const { url, script, options } = job.data;

      if (!script) {
        throw new Error('Automation script is required');
      }

      await job.updateProgress({ status: 'navigating', percentage: 20 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await job.updateProgress({ status: 'executing_script', percentage: 40 });

      // Execute the automation script
      // Note: In production, you should validate and sandbox the script
      const result = await page.evaluate(script);

      await job.updateProgress({ status: 'capturing_result', percentage: 80 });

      const screenshot = await page.screenshot({ encoding: 'base64' });

      return {
        success: true,
        screenshot: screenshot as string,
        extractedData: result,
        metadata: {
          url,
          executedAt: new Date().toISOString(),
          scriptLength: script.length,
        },
      };
    } finally {
      await page.close();
    }
  }
}
