import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { DatabaseService } from '../database/database.service';

export interface GeneratedUi {
  id: string;
  user_id: string;
  conversation_id?: string;
  prompt: string;
  html: string;
  title: string;
  description: string;
  created_at: Date;
}

export interface GenerateUiResult {
  html: string;
  title: string;
  description: string;
}

const GENERATIVE_UI_SYSTEM_PROMPT = `You are an expert frontend developer. The user will describe a tool or UI they need. You must generate a complete, self-contained HTML page that implements it.

RULES:
1. Return a complete <!DOCTYPE html> document with inline CSS and JS.
2. Use modern CSS (flexbox/grid, CSS variables, clean typography).
3. Make it responsive and visually polished with a clean, professional look.
4. All JavaScript must be self-contained - no external imports or CDN links.
5. Do NOT use any references to parent, top, window.opener, or window.parent. The page will be rendered in a sandboxed iframe.
6. Do NOT include any tracking scripts, analytics, or external requests.
7. Include form validation and user feedback where appropriate.
8. Use a consistent color scheme (default to a modern blue/slate palette).

Respond ONLY with the raw HTML. No markdown code fences, no explanation - just the HTML document starting with <!DOCTYPE html>.`;

const TITLE_EXTRACTION_PROMPT = `Given this HTML page, extract a short title (3-8 words) and a one-sentence description. Respond ONLY with valid JSON:
{"title": "...", "description": "..."}`;

/** Score threshold below which generative UI is triggered instead of tool matching. */
const GENERATIVE_UI_THRESHOLD = 0.3;

@Injectable()
export class GenerativeUiService {
  private readonly logger = new Logger(GenerativeUiService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Decide whether to generate a custom UI based on the best tool-match score.
   */
  shouldGenerateUi(userMessage: string, matchedToolScore: number): boolean {
    if (matchedToolScore >= GENERATIVE_UI_THRESHOLD) {
      return false;
    }
    // Avoid generating UI for very short/generic messages
    const trimmed = userMessage.trim();
    if (trimmed.length < 10) {
      return false;
    }
    return true;
  }

  /**
   * Generate a self-contained HTML UI for the user's request.
   */
  async generateUi(
    userId: string,
    prompt: string,
    context?: { conversationId?: string },
  ): Promise<GenerateUiResult> {
    this.logger.log(`Generating UI for user ${userId}: "${prompt.substring(0, 60)}..."`);

    // Generate the HTML page
    const rawHtml = await this.aiService.generateText(prompt, {
      systemMessage: GENERATIVE_UI_SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 8192,
    });

    // Sanitize the output
    const html = this.sanitizeHtml(rawHtml);

    // Extract title and description
    const { title, description } = await this.extractMetadata(html, prompt);

    // Persist to database
    try {
      await this.db.insert<GeneratedUi>('generated_uis', {
        user_id: userId,
        conversation_id: context?.conversationId || null,
        prompt,
        html,
        title,
        description,
        created_at: new Date(),
      });
    } catch (error) {
      // Table may not exist yet; log but don't fail
      this.logger.warn('Failed to persist generated UI (table may not exist):', error.message);
    }

    return { html, title, description };
  }

  /**
   * Retrieve generated UIs for a conversation.
   */
  async getHistory(
    conversationId: string,
    userId: string,
  ): Promise<GeneratedUi[]> {
    try {
      return await this.db.findMany<GeneratedUi>(
        'generated_uis',
        { conversation_id: conversationId, user_id: userId },
        { orderBy: 'created_at', order: 'DESC' },
      );
    } catch (error) {
      this.logger.warn('Failed to query generated UI history:', error.message);
      return [];
    }
  }

  /**
   * Sanitize generated HTML to prevent sandbox escapes.
   * Strips references to parent frame, opener, and top-level window.
   */
  private sanitizeHtml(html: string): string {
    let sanitized = html;

    // Strip any script content that references the parent page
    sanitized = sanitized.replace(/\bparent\./g, '/* sandbox-blocked */');
    sanitized = sanitized.replace(/\btop\./g, '/* sandbox-blocked */');
    sanitized = sanitized.replace(/\bwindow\.opener\b/g, '/* sandbox-blocked */');
    sanitized = sanitized.replace(/\bwindow\.parent\b/g, '/* sandbox-blocked */');
    sanitized = sanitized.replace(/\bwindow\.top\b/g, '/* sandbox-blocked */');

    // Remove postMessage calls to parent
    sanitized = sanitized.replace(/\.postMessage\s*\(/g, '/* sandbox-blocked */(');

    // Add sandbox marker
    if (!sanitized.includes('<!-- sandbox:')) {
      sanitized = sanitized.replace(
        '<!DOCTYPE html>',
        '<!DOCTYPE html>\n<!-- sandbox: no-scripts-accessing-parent -->',
      );
    }

    // If the AI wrapped it in markdown fences, strip those
    sanitized = sanitized.replace(/^```html?\s*/i, '').replace(/\s*```$/i, '');

    return sanitized.trim();
  }

  /**
   * Extract a human-readable title and description from the generated HTML.
   */
  private async extractMetadata(
    html: string,
    originalPrompt: string,
  ): Promise<{ title: string; description: string }> {
    try {
      // Try to extract title from <title> tag first
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1] && titleMatch[1].length < 60) {
        return {
          title: titleMatch[1].trim(),
          description: `Custom UI generated from: ${originalPrompt.substring(0, 120)}`,
        };
      }

      // Fall back to AI extraction
      const snippet = html.substring(0, 2000);
      const response = await this.aiService.generateText(
        `HTML snippet:\n${snippet}`,
        {
          systemMessage: TITLE_EXTRACTION_PROMPT,
          responseFormat: 'json_object',
          maxTokens: 100,
          temperature: 0.3,
        },
      );

      const parsed = JSON.parse(response);
      return {
        title: parsed.title || 'Generated UI',
        description: parsed.description || `Custom UI for: ${originalPrompt.substring(0, 100)}`,
      };
    } catch {
      return {
        title: 'Generated UI',
        description: `Custom UI generated from: ${originalPrompt.substring(0, 120)}`,
      };
    }
  }
}
