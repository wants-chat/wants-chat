import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type * as puppeteer from 'puppeteer';
import { AiService } from '../ai/ai.service';
import {
  StagehandActDto,
  StagehandExtractDto,
  StagehandObserveDto,
  StagehandActResponseDto,
  StagehandExtractResponseDto,
  StagehandObserveResponseDto,
  PageElementDto,
} from './dto';

interface ActionPlan {
  steps: ActionStep[];
  reasoning: string;
}

interface ActionStep {
  action: 'click' | 'type' | 'scroll' | 'hover' | 'select' | 'wait' | 'navigate';
  selector?: string;
  value?: string;
  description: string;
}

interface ExtractionResult {
  data: any;
  confidence: number;
  source: string;
}

@Injectable()
export class StagehandService {
  private readonly logger = new Logger(StagehandService.name);
  private readonly isConfigured: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
  ) {
    this.isConfigured = this.aiService.isConfigured();
    if (!this.isConfigured) {
      this.logger.warn('AI service not configured - Stagehand AI features will be limited');
    }
  }

  /**
   * Perform an AI-powered action on the page using natural language
   */
  async act(
    page: puppeteer.Page,
    dto: StagehandActDto,
  ): Promise<StagehandActResponseDto> {
    const startTime = Date.now();
    const actionsTaken: string[] = [];
    let lastError: string | undefined;

    this.logger.log(`Stagehand act: "${dto.instruction}"`);

    const maxRetries = dto.maxRetries || 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get current page state
        const pageState = await this.getPageState(page);

        // Generate action plan using AI
        const actionPlan = await this.generateActionPlan(
          dto.instruction,
          pageState,
        );

        this.logger.debug(`Action plan: ${JSON.stringify(actionPlan)}`);

        // Execute each step in the plan
        for (const step of actionPlan.steps) {
          await this.executeStep(page, step, dto.timeout || 30000);
          actionsTaken.push(step.description);
        }

        // Verify action completed (if possible)
        const success = await this.verifyAction(page, dto.instruction);

        return {
          success,
          instruction: dto.instruction,
          actionsTaken,
          duration: Date.now() - startTime,
        };
      } catch (error: any) {
        lastError = error.message;
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      success: false,
      instruction: dto.instruction,
      actionsTaken,
      error: lastError || 'Action failed after all retries',
      duration: Date.now() - startTime,
    };
  }

  /**
   * Extract data from the page using natural language
   */
  async extract(
    page: puppeteer.Page,
    dto: StagehandExtractDto,
  ): Promise<StagehandExtractResponseDto> {
    const startTime = Date.now();

    this.logger.log(`Stagehand extract: "${dto.instruction}"`);

    try {
      // Get page content
      let content: string;
      if (dto.selector) {
        content = await this.getElementContent(page, dto.selector);
      } else {
        content = await this.getPageContent(page);
      }

      // Use AI to extract the requested data
      const extractedData = await this.extractWithAI(
        dto.instruction,
        content,
        dto.schema,
      );

      return {
        success: true,
        instruction: dto.instruction,
        data: extractedData,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Extraction failed: ${error.message}`);
      return {
        success: false,
        instruction: dto.instruction,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Observe the current page state
   */
  async observe(
    page: puppeteer.Page,
    dto: StagehandObserveDto = {},
  ): Promise<StagehandObserveResponseDto> {
    const startTime = Date.now();

    this.logger.log('Stagehand observe');

    try {
      const url = page.url();
      const title = await page.title();

      // Get interactive elements
      const elements = await this.getInteractiveElements(
        page,
        dto.includeInteractive !== false,
      );

      // Optionally take a screenshot
      let screenshot: string | undefined;
      if (dto.instruction) {
        // If specific observation requested, include screenshot for AI analysis
        const buffer = await page.screenshot({ type: 'png', encoding: 'base64' });
        screenshot = buffer as string;
      }

      return {
        success: true,
        url,
        title,
        elements,
        screenshot,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Observation failed: ${error.message}`);
      return {
        success: false,
        url: page.url(),
        title: '',
        elements: [],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate an action plan using AI
   */
  private async generateActionPlan(
    instruction: string,
    pageState: string,
  ): Promise<ActionPlan> {
    if (!this.isConfigured) {
      // Fallback: try to interpret instruction directly
      return this.generateBasicActionPlan(instruction);
    }

    const systemPrompt = `You are a browser automation assistant. Given a user instruction and the current page state, generate a step-by-step action plan.

Available actions:
- click: Click on an element (requires selector)
- type: Type text into an input (requires selector and value)
- scroll: Scroll the page (optional selector to scroll to)
- hover: Hover over an element (requires selector)
- select: Select from dropdown (requires selector and value)
- wait: Wait for an element or time (optional selector or time in ms)
- navigate: Navigate to URL (requires value as URL)

Respond ONLY with valid JSON in this format:
{
  "steps": [
    {
      "action": "click",
      "selector": "CSS or XPath selector",
      "value": "optional value for type/select actions",
      "description": "Human readable description"
    }
  ],
  "reasoning": "Brief explanation of the plan"
}

Prefer robust selectors like IDs, data attributes, or unique text content.`;

    const prompt = `Instruction: ${instruction}

Current page state:
${pageState}

Generate the action plan:`;

    try {
      const response = await this.aiService.generateText(prompt, {
        systemMessage: systemPrompt,
        responseFormat: 'json_object',
        temperature: 0.1,
      });

      const plan = JSON.parse(response);
      return plan as ActionPlan;
    } catch (error: any) {
      this.logger.error(`Failed to generate action plan: ${error.message}`);
      return this.generateBasicActionPlan(instruction);
    }
  }

  /**
   * Generate a basic action plan without AI (fallback)
   */
  private generateBasicActionPlan(instruction: string): ActionPlan {
    const lowerInstruction = instruction.toLowerCase();
    const steps: ActionStep[] = [];

    // Try to parse common patterns
    if (lowerInstruction.includes('click')) {
      // Extract selector from instruction
      const selectorMatch = instruction.match(/(?:on|button|link|element)\s+["']?([^"'\s]+)["']?/i);
      if (selectorMatch) {
        steps.push({
          action: 'click',
          selector: selectorMatch[1],
          description: `Click on ${selectorMatch[1]}`,
        });
      }
    } else if (lowerInstruction.includes('type') || lowerInstruction.includes('enter')) {
      const textMatch = instruction.match(/["']([^"']+)["']/);
      const selectorMatch = instruction.match(/(?:into|in)\s+["']?([^"'\s]+)["']?/i);
      if (textMatch) {
        steps.push({
          action: 'type',
          selector: selectorMatch?.[1] || 'input',
          value: textMatch[1],
          description: `Type "${textMatch[1]}"`,
        });
      }
    } else if (lowerInstruction.includes('scroll')) {
      steps.push({
        action: 'scroll',
        description: 'Scroll the page',
      });
    } else if (lowerInstruction.includes('wait')) {
      const timeMatch = instruction.match(/(\d+)\s*(?:ms|milliseconds|seconds|s)/i);
      let waitTime = 1000;
      if (timeMatch) {
        waitTime = parseInt(timeMatch[1]);
        if (instruction.toLowerCase().includes('second')) {
          waitTime *= 1000;
        }
      }
      steps.push({
        action: 'wait',
        value: waitTime.toString(),
        description: `Wait for ${waitTime}ms`,
      });
    }

    if (steps.length === 0) {
      throw new Error(`Could not parse instruction: ${instruction}. Please provide a more specific instruction or ensure AI service is configured.`);
    }

    return {
      steps,
      reasoning: 'Basic pattern matching (AI not available)',
    };
  }

  /**
   * Execute a single action step
   */
  private async executeStep(
    page: puppeteer.Page,
    step: ActionStep,
    timeout: number,
  ): Promise<void> {
    this.logger.debug(`Executing step: ${step.description}`);

    switch (step.action) {
      case 'click':
        if (!step.selector) throw new Error('Click action requires selector');
        await page.waitForSelector(step.selector, { timeout, visible: true });
        await page.click(step.selector);
        break;

      case 'type':
        if (!step.selector) throw new Error('Type action requires selector');
        if (!step.value) throw new Error('Type action requires value');
        await page.waitForSelector(step.selector, { timeout, visible: true });
        await page.click(step.selector, { clickCount: 3 }); // Select all
        await page.type(step.selector, step.value, { delay: 50 });
        break;

      case 'scroll':
        if (step.selector) {
          const element = await page.$(step.selector);
          if (element) {
            await element.scrollIntoView();
          }
        } else {
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
          });
        }
        break;

      case 'hover':
        if (!step.selector) throw new Error('Hover action requires selector');
        await page.waitForSelector(step.selector, { timeout, visible: true });
        await page.hover(step.selector);
        break;

      case 'select':
        if (!step.selector) throw new Error('Select action requires selector');
        if (!step.value) throw new Error('Select action requires value');
        await page.waitForSelector(step.selector, { timeout, visible: true });
        await page.select(step.selector, step.value);
        break;

      case 'wait':
        if (step.selector) {
          await page.waitForSelector(step.selector, { timeout, visible: true });
        } else if (step.value) {
          await new Promise((resolve) => setTimeout(resolve, parseInt(step.value)));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        break;

      case 'navigate':
        if (!step.value) throw new Error('Navigate action requires URL');
        await page.goto(step.value, { waitUntil: 'networkidle2', timeout });
        break;

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }

    // Small delay between actions
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  /**
   * Verify that an action completed successfully
   */
  private async verifyAction(
    page: puppeteer.Page,
    instruction: string,
  ): Promise<boolean> {
    // For now, assume success if no error was thrown
    // Could be enhanced with AI verification
    return true;
  }

  /**
   * Get the current page state for AI analysis
   */
  private async getPageState(page: puppeteer.Page): Promise<string> {
    const state = await page.evaluate(() => {
      const elements: string[] = [];

      // Get all interactive elements
      const interactiveSelectors = [
        'button',
        'a',
        'input',
        'select',
        'textarea',
        '[role="button"]',
        '[onclick]',
      ];

      const allElements = document.querySelectorAll(interactiveSelectors.join(','));

      allElements.forEach((el, index) => {
        if (index > 100) return; // Limit to first 100 elements

        const tagName = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
        const text = (el as HTMLElement).innerText?.slice(0, 50) || '';
        const type = (el as HTMLInputElement).type || '';
        const placeholder = (el as HTMLInputElement).placeholder || '';
        const href = (el as HTMLAnchorElement).href || '';
        const name = (el as HTMLInputElement).name || '';

        let description = `<${tagName}`;
        if (id) description += id;
        if (classes) description += classes;
        if (type) description += ` type="${type}"`;
        if (name) description += ` name="${name}"`;
        if (placeholder) description += ` placeholder="${placeholder}"`;
        if (href) description += ` href="${href.slice(0, 50)}"`;
        if (text) description += `>${text.trim()}`;
        description += `>`;

        elements.push(description);
      });

      return {
        url: window.location.href,
        title: document.title,
        elements: elements.slice(0, 50),
      };
    });

    return `URL: ${state.url}
Title: ${state.title}
Interactive elements:
${state.elements.join('\n')}`;
  }

  /**
   * Get page content for extraction
   */
  private async getPageContent(page: puppeteer.Page): Promise<string> {
    return await page.evaluate(() => {
      // Get main content, removing scripts and styles
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('script, style, noscript, svg, path').forEach((el) => el.remove());

      // Get text content with some structure
      const getText = (el: HTMLElement, depth = 0): string => {
        if (depth > 10) return '';
        const indent = '  '.repeat(depth);
        const tagName = el.tagName?.toLowerCase() || '';

        let result = '';

        // Add heading markers
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          const level = parseInt(tagName[1]);
          result += `\n${'#'.repeat(level)} `;
        }

        // Add list markers
        if (tagName === 'li') {
          result += '\n- ';
        }

        // Add link markers
        if (tagName === 'a') {
          const href = (el as HTMLAnchorElement).href;
          if (href) {
            result += '[';
          }
        }

        // Add text content
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            result += child.textContent?.trim() || '';
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            result += getText(child as HTMLElement, depth + 1);
          }
        }

        // Close link markers
        if (tagName === 'a') {
          const href = (el as HTMLAnchorElement).href;
          if (href) {
            result += `](${href})`;
          }
        }

        // Add newlines for block elements
        if (['p', 'div', 'br', 'tr', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          result += '\n';
        }

        return result;
      };

      return getText(clone).slice(0, 10000); // Limit to 10k chars
    });
  }

  /**
   * Get content from a specific element
   */
  private async getElementContent(page: puppeteer.Page, selector: string): Promise<string> {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return await page.evaluate((el) => {
      return (el as HTMLElement).innerText || el.textContent || '';
    }, element);
  }

  /**
   * Extract data using AI
   */
  private async extractWithAI(
    instruction: string,
    content: string,
    schema?: Record<string, any>,
  ): Promise<any> {
    if (!this.isConfigured) {
      // Return raw content if AI not available
      return { rawContent: content.slice(0, 5000) };
    }

    let systemPrompt = `You are a data extraction assistant. Extract the requested information from the provided web page content.`;

    if (schema) {
      systemPrompt += `

The extracted data should match this schema:
${JSON.stringify(schema, null, 2)}`;
    }

    systemPrompt += `

Respond ONLY with valid JSON containing the extracted data. If you cannot find the requested information, return null for that field.`;

    const prompt = `Extract the following: ${instruction}

Page content:
${content.slice(0, 8000)}

Extracted data:`;

    try {
      const response = await this.aiService.generateText(prompt, {
        systemMessage: systemPrompt,
        responseFormat: 'json_object',
        temperature: 0.1,
      });

      return JSON.parse(response);
    } catch (error: any) {
      this.logger.error(`AI extraction failed: ${error.message}`);
      throw new Error(`Failed to extract data: ${error.message}`);
    }
  }

  /**
   * Get interactive elements from the page
   */
  private async getInteractiveElements(
    page: puppeteer.Page,
    includeInteractive: boolean,
  ): Promise<PageElementDto[]> {
    const elements = await page.evaluate((interactive) => {
      const result: any[] = [];

      const selectors = interactive
        ? ['button', 'a', 'input', 'select', 'textarea', '[role="button"]', '[onclick]']
        : ['*'];

      const allElements = document.querySelectorAll(selectors.join(','));

      allElements.forEach((el, index) => {
        if (index > 100) return;

        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();

        // Check visibility
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          window.getComputedStyle(htmlEl).visibility !== 'hidden' &&
          window.getComputedStyle(htmlEl).display !== 'none';

        if (!isVisible && interactive) return;

        result.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          className: el.className || undefined,
          text: htmlEl.innerText?.slice(0, 100) || undefined,
          href: (el as HTMLAnchorElement).href || undefined,
          type: (el as HTMLInputElement).type || undefined,
          name: (el as HTMLInputElement).name || undefined,
          value: (el as HTMLInputElement).value || undefined,
          isVisible,
          isInteractive: interactive,
          boundingBox: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        });
      });

      return result;
    }, includeInteractive);

    return elements as PageElementDto[];
  }
}
