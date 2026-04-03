import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../../ai/ai.service';
import { MemoryService } from '../../memory/memory.service';
import { BaseLearningAgent, UserContext } from './base-learning.agent';
import {
  WritingRequestDto,
  WritingResponseDto,
  WritingAnalysisDto,
  WritingType,
  ToneType,
} from '../dto/learning.dto';
import {
  EMAIL_PROMPT,
  ESSAY_PROMPT,
  REPORT_PROMPT,
  PROOFREAD_PROMPT,
  TONE_ADJUSTMENT_PROMPT,
} from '../prompts/learning.prompts';

@Injectable()
export class WriterAgent extends BaseLearningAgent {
  constructor(
    aiService: AiService,
    memoryService: MemoryService,
    configService: ConfigService,
  ) {
    super(aiService, memoryService, configService);
  }

  async process(
    input: WritingRequestDto,
    context: UserContext,
  ): Promise<WritingResponseDto> {
    const { writingType, tone = 'professional' } = input;

    this.logger.log(`Writing request: ${writingType} with ${tone} tone`);

    let result: WritingResponseDto;

    switch (writingType) {
      case 'email':
        result = await this.composeEmail(input, tone, context);
        break;
      case 'essay':
        result = await this.writeEssay(input, context);
        break;
      case 'report':
        result = await this.generateReport(input, context);
        break;
      case 'proofread':
        result = await this.proofreadText(input, context);
        break;
      case 'adjust_tone':
        result = await this.adjustTone(input, context);
        break;
      default:
        result = await this.generalWriting(input, tone, context);
    }

    // Store writing activity
    await this.storeProgress(context.userId, `Writing: ${writingType}`, {
      writingType,
      tone,
    });

    return result;
  }

  /**
   * Compose an email
   */
  private async composeEmail(
    input: WritingRequestDto,
    tone: ToneType,
    context: UserContext,
  ): Promise<WritingResponseDto> {
    const { emailDetails } = input;

    if (!emailDetails) {
      throw new Error('Email details are required');
    }

    const userMessage = `Write an email with the following details:
Recipient: ${emailDetails.recipient}
Purpose: ${emailDetails.purpose}
Key Points: ${emailDetails.keyPoints?.join(', ') || 'as needed'}
Urgency: ${emailDetails.urgency || 'normal'}
Sender: ${emailDetails.senderName || 'the user'}
Tone: ${tone}

Provide:
1. Subject line
2. Full email body
3. Professional closing`;

    const response = await this.generateResponse(
      EMAIL_PROMPT,
      userMessage,
      {
        model: 'gpt-4o-mini',
        temperature: 0.6,
        maxTokens: 1500,
      },
    );

    // Analyze the email
    const analysis = await this.analyzeWriting(response, 'email');

    // Extract subject line
    const subjectMatch = response.match(/Subject:?\s*(.+?)(?:\n|$)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : undefined;

    const content = this.formatEmailContent(response, emailDetails.recipient, subject);

    return {
      type: 'email',
      content,
      subject,
      analysis,
      metadata: {
        wordCount: response.split(/\s+/).length,
        readingTime: 1,
      },
      suggestedTools: this.getToolSuggestions('email compose'),
    };
  }

  /**
   * Write an essay
   */
  private async writeEssay(
    input: WritingRequestDto,
    context: UserContext,
  ): Promise<WritingResponseDto> {
    const { essayDetails, tone = 'professional' } = input;

    if (!essayDetails) {
      throw new Error('Essay details are required');
    }

    // First, generate an outline
    const outlinePrompt = `Create an outline for an essay:
Topic: ${essayDetails.topic}
Type: ${essayDetails.essayType || 'argumentative'}
Thesis: ${essayDetails.thesis || 'to be developed'}
Key Points: ${essayDetails.keyPoints?.join(', ') || 'as appropriate'}

Return a structured outline with introduction, body paragraphs, and conclusion.`;

    const outlineResponse = await this.generateResponse(
      'You are an expert essay writer. Create a detailed outline.',
      outlinePrompt,
      {
        model: 'gpt-4o-mini',
        temperature: 0.5,
        maxTokens: 1000,
      },
    );

    // Then write the full essay
    const essayPrompt = `Write an essay based on this outline:
${outlineResponse}

Topic: ${essayDetails.topic}
Target length: ${essayDetails.wordCount || 750} words
Tone: ${tone}

Write a complete, well-structured essay.`;

    const essay = await this.generateResponse(
      ESSAY_PROMPT,
      essayPrompt,
      {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: essayDetails.wordCount ? Math.ceil(essayDetails.wordCount * 1.5) : 3000,
      },
    );

    const analysis = await this.analyzeWriting(essay, 'essay');

    const content = this.formatEssayContent(essay, essayDetails.topic, outlineResponse);

    return {
      type: 'essay',
      content,
      analysis,
      outline: { raw: outlineResponse },
      metadata: {
        wordCount: essay.split(/\s+/).length,
        readingTime: Math.ceil(essay.split(/\s+/).length / 200),
        paragraphs: essay.split(/\n\n+/).length,
      },
      suggestedTools: this.getToolSuggestions('essay write document'),
    };
  }

  /**
   * Generate a report
   */
  private async generateReport(
    input: WritingRequestDto,
    context: UserContext,
  ): Promise<WritingResponseDto> {
    const { reportDetails, tone = 'professional' } = input;

    if (!reportDetails) {
      throw new Error('Report details are required');
    }

    const userMessage = `Generate a ${reportDetails.reportType || 'business'} report:
Topic: ${reportDetails.topic}
Findings: ${reportDetails.findings?.join('\n- ') || 'to be developed'}
Include recommendations: ${reportDetails.includeRecommendations !== false}
Tone: ${tone}

Create a professional report with:
1. Executive Summary
2. Introduction
3. Findings/Analysis
4. Recommendations (if applicable)
5. Conclusion`;

    const report = await this.generateResponse(
      REPORT_PROMPT,
      userMessage,
      {
        model: 'gpt-4o',
        temperature: 0.5,
        maxTokens: 4000,
      },
    );

    const analysis = await this.analyzeWriting(report, 'report');

    const content = this.formatReportContent(report, reportDetails.topic);

    return {
      type: 'report',
      content,
      analysis,
      metadata: {
        wordCount: report.split(/\s+/).length,
        readingTime: Math.ceil(report.split(/\s+/).length / 200),
      },
      suggestedTools: this.getToolSuggestions('report document export pdf'),
    };
  }

  /**
   * Proofread text
   */
  private async proofreadText(
    input: WritingRequestDto,
    context: UserContext,
  ): Promise<WritingResponseDto> {
    const { text } = input;

    if (!text) {
      throw new Error('Text is required for proofreading');
    }

    const userMessage = `Proofread and improve this text:

${text}

Provide:
1. Corrected version
2. List of changes made
3. Suggestions for improvement`;

    const response = await this.generateResponse(
      PROOFREAD_PROMPT,
      userMessage,
      {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: Math.max(text.length * 2, 2000),
      },
    );

    const analysis = await this.analyzeWriting(response, 'proofread');

    return {
      type: 'proofread',
      content: response,
      analysis,
      metadata: {
        wordCount: response.split(/\s+/).length,
        readingTime: Math.ceil(response.split(/\s+/).length / 200),
      },
      suggestedTools: this.getToolSuggestions('proofread grammar'),
    };
  }

  /**
   * Adjust tone of text
   */
  private async adjustTone(
    input: WritingRequestDto,
    context: UserContext,
  ): Promise<WritingResponseDto> {
    const { text, targetTone } = input;

    if (!text || !targetTone) {
      throw new Error('Text and target tone are required');
    }

    const userMessage = `Rewrite this text in a ${targetTone} tone:

Original text:
${text}

Maintain the original meaning while adjusting the tone to be ${targetTone}.`;

    const response = await this.generateResponse(
      TONE_ADJUSTMENT_PROMPT,
      userMessage,
      {
        model: 'gpt-4o-mini',
        temperature: 0.6,
        maxTokens: Math.max(text.length * 1.5, 1500),
      },
    );

    const analysis = await this.analyzeWriting(response, 'tone');

    return {
      type: 'adjust_tone',
      content: response,
      analysis,
      metadata: {
        wordCount: response.split(/\s+/).length,
        readingTime: Math.ceil(response.split(/\s+/).length / 200),
      },
      suggestedTools: this.getToolSuggestions('tone writing'),
    };
  }

  /**
   * General writing assistance
   */
  private async generalWriting(
    input: WritingRequestDto,
    tone: ToneType,
    context: UserContext,
  ): Promise<WritingResponseDto> {
    const { text } = input;

    const userMessage = text
      ? `Help with this writing:\n\n${text}`
      : 'Please provide the text you need help with.';

    const response = await this.generateResponse(
      `You are a professional writer. Help with the user's writing request. Use a ${tone} tone.`,
      userMessage,
      {
        model: 'gpt-4o-mini',
        temperature: 0.6,
        maxTokens: 2000,
      },
    );

    return {
      type: 'email', // Default type
      content: response,
      metadata: {
        wordCount: response.split(/\s+/).length,
        readingTime: Math.ceil(response.split(/\s+/).length / 200),
      },
      suggestedTools: this.getToolSuggestions('writing'),
    };
  }

  /**
   * Analyze writing for tone, formality, and suggestions
   */
  private async analyzeWriting(
    text: string,
    type: string,
  ): Promise<WritingAnalysisDto> {
    const prompt = `Analyze this ${type} writing. Return as JSON:
{
  "tone": "detected tone",
  "formalityLevel": 1-10,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "grammarIssues": 0,
  "readability": "easy|medium|difficult"
}

Text:
${text.substring(0, 2000)}`;

    try {
      const response = await this.generateResponse(
        'You are a writing analyst.',
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          responseFormat: 'json_object',
        },
      );

      return this.parseJsonResponse<WritingAnalysisDto>(response, {
        tone: 'professional',
        formalityLevel: 7,
        suggestions: [],
      });
    } catch {
      return {
        tone: 'professional',
        formalityLevel: 7,
        suggestions: [],
      };
    }
  }

  /**
   * Format email content
   */
  private formatEmailContent(
    response: string,
    recipient: string,
    subject?: string,
  ): string {
    let content = '# Email Draft\n\n';
    content += `**To**: ${recipient}\n`;
    if (subject) {
      content += `**Subject**: ${subject}\n`;
    }
    content += '\n---\n\n';
    content += response;
    content += '\n\n---\n\n';
    content += '**Adjust Tone**\n';
    content += '**More Formal** | **More Casual** | **More Direct**\n\n';
    content += '**Copy to Clipboard** - Ready to send\n';
    return content;
  }

  /**
   * Format essay content
   */
  private formatEssayContent(
    essay: string,
    topic: string,
    outline: string,
  ): string {
    let content = `# Essay: ${topic}\n\n`;
    content += '## Outline\n';
    content += outline;
    content += '\n\n---\n\n## Draft\n\n';
    content += essay;
    content += '\n\n---\n\n';
    content += '**Improve Essay**\n';
    content += '**Expand Section** - Add more detail\n';
    content += '**Strengthen Arguments** - Better evidence\n';
    return content;
  }

  /**
   * Format report content
   */
  private formatReportContent(report: string, topic: string): string {
    let content = `# Report: ${topic}\n\n`;
    content += report;
    content += '\n\n---\n\n';
    content += '**Export Report**\n';
    content += '**PDF** | **DOCX** | **Markdown**\n';
    return content;
  }
}
