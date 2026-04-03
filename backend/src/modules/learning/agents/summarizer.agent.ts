import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../../ai/ai.service';
import { MemoryService } from '../../memory/memory.service';
import { BaseLearningAgent, UserContext } from './base-learning.agent';
import {
  SummarizeRequestDto,
  SummaryResponseDto,
  KeyPointDto,
  ThemeDto,
} from '../dto/learning.dto';
import {
  SUMMARIZER_BRIEF_PROMPT,
  SUMMARIZER_DETAILED_PROMPT,
  SUMMARIZER_EXECUTIVE_PROMPT,
  SUMMARIZER_BULLET_PROMPT,
} from '../prompts/learning.prompts';

@Injectable()
export class SummarizerAgent extends BaseLearningAgent {
  constructor(
    aiService: AiService,
    memoryService: MemoryService,
    configService: ConfigService,
  ) {
    super(aiService, memoryService, configService);
  }

  async process(
    input: SummarizeRequestDto,
    context: UserContext,
  ): Promise<SummaryResponseDto> {
    const {
      text,
      url,
      fileId,
      summaryType = 'detailed',
      extractActions = false,
    } = input;

    this.logger.log(`Summarization request: type=${summaryType}`);

    // 1. Extract content based on source
    let content: string;
    let sourceTitle: string | undefined;

    if (text) {
      content = text;
    } else if (url) {
      const extracted = await this.extractFromUrl(url);
      content = extracted.content;
      sourceTitle = extracted.title;
    } else if (fileId) {
      const extracted = await this.extractFromFile(fileId);
      content = extracted.content;
      sourceTitle = extracted.title;
    } else {
      throw new Error('No content provided for summarization');
    }

    // 2. Check content length and decide on chunking strategy
    const tokenCount = this.estimateTokens(content);
    this.logger.debug(`Content tokens: ~${tokenCount}`);

    let summary: string;
    let keyPoints: KeyPointDto[];
    let themes: ThemeDto[];

    if (tokenCount > 8000) {
      // Use chunked summarization for large documents
      const result = await this.summarizeLargeDocument(content, summaryType);
      summary = result.summary;
      keyPoints = result.keyPoints;
      themes = result.themes;
    } else {
      // Direct summarization for smaller content
      summary = await this.generateSummary(content, summaryType);
      keyPoints = await this.extractKeyPoints(content);
      themes = await this.identifyThemes(content);
    }

    // 3. Extract action items if requested
    let actionItems: string[] | undefined;
    if (extractActions) {
      actionItems = await this.extractActionItems(content);
    }

    // 4. Calculate metrics
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // ~200 words per minute

    // 5. Format the response
    const formattedContent = this.formatSummaryResponse(
      summary,
      keyPoints,
      themes,
      actionItems,
      sourceTitle,
    );

    return {
      summary: formattedContent,
      keyPoints,
      themes,
      actionItems,
      wordCount,
      readingTime,
      sourceTitle,
      suggestedTools: this.getToolSuggestions('document export pdf'),
    };
  }

  /**
   * Extract content from URL
   */
  private async extractFromUrl(url: string): Promise<{ content: string; title?: string }> {
    // This would typically use the web service or browser module
    // For now, we'll use a simple prompt to acknowledge the URL
    this.logger.log(`Extracting content from URL: ${url}`);

    // In a real implementation, this would fetch and parse the URL
    // Using Jina Reader, Puppeteer, or similar
    return {
      content: `Content from URL: ${url}`,
      title: url,
    };
  }

  /**
   * Extract content from file
   */
  private async extractFromFile(fileId: string): Promise<{ content: string; title?: string }> {
    // This would use the document service to extract text
    this.logger.log(`Extracting content from file: ${fileId}`);

    // In a real implementation, this would parse PDF, DOCX, etc.
    return {
      content: `Content from file: ${fileId}`,
      title: fileId,
    };
  }

  /**
   * Generate summary using appropriate prompt
   */
  private async generateSummary(
    content: string,
    summaryType: string,
  ): Promise<string> {
    const promptMap: Record<string, string> = {
      brief: SUMMARIZER_BRIEF_PROMPT,
      detailed: SUMMARIZER_DETAILED_PROMPT,
      executive: SUMMARIZER_EXECUTIVE_PROMPT,
      bullet_points: SUMMARIZER_BULLET_PROMPT,
    };

    const systemPrompt = promptMap[summaryType] || SUMMARIZER_DETAILED_PROMPT;

    return this.generateResponse(
      systemPrompt,
      `Please summarize the following content:\n\n${content}`,
      {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 2000,
      },
    );
  }

  /**
   * Summarize large documents using chunking
   */
  private async summarizeLargeDocument(
    content: string,
    summaryType: string,
  ): Promise<{ summary: string; keyPoints: KeyPointDto[]; themes: ThemeDto[] }> {
    // 1. Chunk the content
    const chunks = this.chunkByParagraphs(content, 3000);
    this.logger.debug(`Document chunked into ${chunks.length} parts`);

    // 2. Summarize each chunk
    const chunkSummaries = await Promise.all(
      chunks.map((chunk, index) =>
        this.summarizeChunk(chunk, index + 1, chunks.length),
      ),
    );

    // 3. Synthesize final summary
    const synthesisPrompt = `You have been given summaries of different sections of a document.
Create a cohesive final summary that:
1. Captures the main message of the entire document
2. Highlights the most important points
3. Maintains logical flow

Section summaries:
${chunkSummaries.join('\n\n---\n\n')}`;

    const summary = await this.generateResponse(
      'You are an expert at synthesizing information into clear, comprehensive summaries.',
      synthesisPrompt,
      {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 2000,
      },
    );

    // 4. Extract key points and themes from the synthesis
    const keyPoints = await this.extractKeyPoints(summary);
    const themes = await this.identifyThemes(summary);

    return { summary, keyPoints, themes };
  }

  /**
   * Summarize a single chunk
   */
  private async summarizeChunk(
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
  ): Promise<string> {
    return this.generateResponse(
      'Summarize this section concisely, preserving key information.',
      `Section ${chunkIndex} of ${totalChunks}:\n\n${chunk}`,
      {
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 500,
      },
    );
  }

  /**
   * Extract key points from content
   */
  private async extractKeyPoints(content: string): Promise<KeyPointDto[]> {
    const prompt = `Extract 5-7 key points from this content. Return as JSON:
{
  "keyPoints": [
    { "point": "Key point text", "importance": "high|medium|low", "category": "optional category" }
  ]
}

Content:
${content.substring(0, 4000)}`;

    try {
      const response = await this.generateResponse(
        'You are an expert at identifying key information.',
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          responseFormat: 'json_object',
        },
      );

      const parsed = this.parseJsonResponse<{ keyPoints: KeyPointDto[] }>(
        response,
        { keyPoints: [] },
      );

      return parsed.keyPoints;
    } catch {
      return [];
    }
  }

  /**
   * Identify main themes in content
   */
  private async identifyThemes(content: string): Promise<ThemeDto[]> {
    const prompt = `Identify 3-5 main themes in this content. Return as JSON:
{
  "themes": [
    { "theme": "Theme name", "description": "Brief description", "relevance": "high|medium|low" }
  ]
}

Content:
${content.substring(0, 4000)}`;

    try {
      const response = await this.generateResponse(
        'You are an expert at thematic analysis.',
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          responseFormat: 'json_object',
        },
      );

      const parsed = this.parseJsonResponse<{ themes: ThemeDto[] }>(response, {
        themes: [],
      });

      return parsed.themes;
    } catch {
      return [];
    }
  }

  /**
   * Extract action items from content
   */
  private async extractActionItems(content: string): Promise<string[]> {
    const prompt = `Extract any action items, tasks, or to-dos mentioned in this content. Return as JSON:
{
  "actionItems": ["Action 1", "Action 2", ...]
}

If no action items are present, return an empty array.

Content:
${content.substring(0, 4000)}`;

    try {
      const response = await this.generateResponse(
        'You are an expert at identifying actionable items.',
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          responseFormat: 'json_object',
        },
      );

      const parsed = this.parseJsonResponse<{ actionItems: string[] }>(
        response,
        { actionItems: [] },
      );

      return parsed.actionItems;
    } catch {
      return [];
    }
  }

  /**
   * Format the summary response with markdown
   */
  private formatSummaryResponse(
    summary: string,
    keyPoints: KeyPointDto[],
    themes: ThemeDto[],
    actionItems: string[] | undefined,
    sourceTitle: string | undefined,
  ): string {
    let content = '';

    if (sourceTitle) {
      content += `# Summary: ${sourceTitle}\n\n`;
    } else {
      content += '# Document Summary\n\n';
    }

    content += '## Executive Summary\n';
    content += summary + '\n\n';

    if (keyPoints.length > 0) {
      content += '## Key Points\n';
      keyPoints.forEach((kp) => {
        const badge = kp.importance === 'high' ? '**' : '';
        content += `- ${badge}${kp.point}${badge}\n`;
      });
      content += '\n';
    }

    if (themes.length > 0) {
      content += '## Main Themes\n';
      content += '| Theme | Description | Relevance |\n';
      content += '|-------|-------------|----------|\n';
      themes.forEach((t) => {
        content += `| ${t.theme} | ${t.description} | ${t.relevance || 'medium'} |\n`;
      });
      content += '\n';
    }

    if (actionItems && actionItems.length > 0) {
      content += '## Action Items\n';
      actionItems.forEach((item) => {
        content += `- [ ] ${item}\n`;
      });
      content += '\n';
    }

    content += '---\n\n';
    content += '**What would you like to do?**\n';
    content += '**Ask Questions** - Query this document\n';
    content += '**Export Summary** - Save as PDF/DOCX\n';

    return content;
  }
}
