/**
 * AI Tools Service
 * Handles all AI Tools API calls that sync with backend (ai_generations table)
 * Matches backend/src/modules/ai/ai-tools.controller.ts endpoints
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

// Types for AI Tools
export interface AIGeneration {
  id: string;
  userId: string;
  toolType: string;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
  tokensUsed?: number;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIToolResponse<T = any> {
  success: boolean;
  data: T;
  generation?: AIGeneration;
  message?: string;
}

// Resume Builder Types
export interface ResumeInput {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  targetJob?: string;
}

export interface ResumeOutput {
  summary: string;
  experienceDescriptions: Array<{
    company: string;
    position: string;
    enhancedDescription: string;
    bulletPoints: string[];
  }>;
  skillsGrouped: Record<string, string[]>;
  suggestions: string[];
  atsScore?: number;
}

// Cover Letter Types
export interface CoverLetterInput {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  yourExperience: string;
  keySkills: string[];
  tone?: 'professional' | 'enthusiastic' | 'conversational';
}

export interface CoverLetterOutput {
  coverLetter: string;
  highlights: string[];
  suggestions: string[];
}

// Email Composer Types
export interface EmailInput {
  purpose: 'inquiry' | 'follow-up' | 'thank-you' | 'complaint' | 'request' | 'introduction' | 'other';
  recipient: string;
  context: string;
  keyPoints?: string[];
  tone?: 'formal' | 'semi-formal' | 'friendly' | 'urgent';
}

export interface EmailOutput {
  subject: string;
  body: string;
  suggestions: string[];
}

// Social Captions Types
export interface SocialCaptionInput {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok';
  topic: string;
  tone?: 'casual' | 'professional' | 'humorous' | 'inspirational';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  maxLength?: number;
}

export interface SocialCaptionOutput {
  captions: Array<{
    text: string;
    hashtags?: string[];
    characterCount: number;
  }>;
  tips: string[];
}

// Hashtag Generator Types
export interface HashtagInput {
  topic: string;
  platform?: 'instagram' | 'twitter' | 'tiktok' | 'all';
  niche?: string;
  count?: number;
}

export interface HashtagOutput {
  hashtags: Array<{
    tag: string;
    popularity: 'high' | 'medium' | 'low';
    category: string;
  }>;
  combinations: string[][];
}

// Video Script Types
export interface VideoScriptInput {
  topic: string;
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'other';
  duration?: number; // in seconds
  style?: 'educational' | 'entertaining' | 'promotional' | 'vlog';
  targetAudience?: string;
}

export interface VideoScriptOutput {
  hook: string;
  script: Array<{
    timestamp: string;
    content: string;
    visualSuggestion?: string;
  }>;
  callToAction: string;
  tips: string[];
}

// Meeting Notes Types
export interface MeetingNotesInput {
  rawNotes: string;
  meetingType?: 'team' | 'client' | 'standup' | 'review' | 'other';
  participants?: string[];
}

export interface MeetingNotesOutput {
  summary: string;
  keyDecisions: string[];
  actionItems: Array<{
    task: string;
    assignee?: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  followUps: string[];
}

// Study Notes Types
export interface StudyNotesInput {
  content: string;
  subject?: string;
  format?: 'summary' | 'flashcards' | 'quiz' | 'outline';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface StudyNotesOutput {
  summary?: string;
  keyPoints: string[];
  flashcards?: Array<{
    question: string;
    answer: string;
  }>;
  quiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

// Contract Analyzer Types
export interface ContractAnalysisInput {
  contractText: string;
  contractType?: 'employment' | 'nda' | 'lease' | 'service' | 'other';
  focusAreas?: string[];
}

export interface ContractAnalysisOutput {
  summary: string;
  keyTerms: Array<{
    term: string;
    explanation: string;
    location: string;
  }>;
  risks: Array<{
    description: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  obligations: Array<{
    party: string;
    obligation: string;
  }>;
  recommendations: string[];
}

// Legal Document Types
export interface LegalDocumentInput {
  documentType: 'nda' | 'contract' | 'terms' | 'privacy' | 'agreement';
  parties: Array<{
    name: string;
    role: string;
    address?: string;
  }>;
  keyTerms: Record<string, any>;
  jurisdiction?: string;
}

export interface LegalDocumentOutput {
  document: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  warnings: string[];
}

// Tax Calculator Types
export interface TaxCalculatorInput {
  income: number;
  country: string;
  state?: string;
  filingStatus?: 'single' | 'married' | 'head_of_household';
  deductions?: Array<{
    type: string;
    amount: number;
  }>;
  otherIncome?: Array<{
    type: string;
    amount: number;
  }>;
}

export interface TaxCalculatorOutput {
  estimatedTax: number;
  effectiveRate: number;
  breakdown: Array<{
    bracket: string;
    rate: number;
    amount: number;
  }>;
  deductionsSummary: {
    standard: number;
    itemized: number;
    recommended: string;
  };
  tips: string[];
}

// Investment Advisor Types
export interface InvestmentInput {
  portfolio?: Array<{
    asset: string;
    type: string;
    value: number;
    allocation: number;
  }>;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  timeHorizon: number; // in years
  currentAge?: number;
}

export interface InvestmentOutput {
  analysis: {
    diversificationScore: number;
    riskLevel: string;
    expectedReturn: string;
  };
  recommendations: Array<{
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  suggestedAllocation: Record<string, number>;
  warnings: string[];
}

// Text to Speech Types
export interface TextToSpeechInput {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

export interface TextToSpeechOutput {
  audioUrl: string;
  duration: number;
  format: string;
}

// Speech to Text Types
export interface SpeechToTextInput {
  audioUrl?: string;
  audioData?: string; // base64
  language?: string;
}

export interface SpeechToTextOutput {
  text: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

// Translation Types
export interface TranslationInput {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface TranslationOutput {
  translation: string;
  detectedLanguage?: string;
  confidence: number;
}

// Image Generation Types
export interface ImageGenerationInput {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'abstract';
  size?: '256x256' | '512x512' | '1024x1024';
  count?: number;
}

export interface ImageGenerationOutput {
  images: Array<{
    url: string;
    revisedPrompt?: string;
  }>;
}

class AIToolsService {
  private baseUrl = '/ai-tools';

  /**
   * Get user's AI generation history
   */
  async getHistory(params?: {
    toolType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AIGeneration[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.toolType) queryParams.append('toolType', params.toolType);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const url = `${this.baseUrl}/history${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await api.request(url);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AI_HISTORY_FETCH_FAILED'
      );
    }
  }

  /**
   * Get a specific generation by ID
   */
  async getGeneration(id: string): Promise<AIGeneration> {
    try {
      return await api.request(`${this.baseUrl}/generation/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AI_GENERATION_FETCH_FAILED'
      );
    }
  }

  /**
   * Delete a generation
   */
  async deleteGeneration(id: string): Promise<void> {
    try {
      await api.request(`${this.baseUrl}/generation/${id}`, { method: 'DELETE' });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AI_GENERATION_DELETE_FAILED'
      );
    }
  }

  // Resume Builder
  async generateResume(input: ResumeInput): Promise<AIToolResponse<ResumeOutput>> {
    try {
      return await api.request(`${this.baseUrl}/resume`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'RESUME_GENERATION_FAILED'
      );
    }
  }

  // Cover Letter
  async generateCoverLetter(input: CoverLetterInput): Promise<AIToolResponse<CoverLetterOutput>> {
    try {
      return await api.request(`${this.baseUrl}/cover-letter`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'COVER_LETTER_GENERATION_FAILED'
      );
    }
  }

  // Email Composer
  async composeEmail(input: EmailInput): Promise<AIToolResponse<EmailOutput>> {
    try {
      return await api.request(`${this.baseUrl}/email`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMAIL_COMPOSITION_FAILED'
      );
    }
  }

  // Social Captions
  async generateSocialCaptions(input: SocialCaptionInput): Promise<AIToolResponse<SocialCaptionOutput>> {
    try {
      return await api.request(`${this.baseUrl}/social-captions`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SOCIAL_CAPTIONS_GENERATION_FAILED'
      );
    }
  }

  // Hashtag Generator
  async generateHashtags(input: HashtagInput): Promise<AIToolResponse<HashtagOutput>> {
    try {
      return await api.request(`${this.baseUrl}/hashtags`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HASHTAG_GENERATION_FAILED'
      );
    }
  }

  // Video Script
  async generateVideoScript(input: VideoScriptInput): Promise<AIToolResponse<VideoScriptOutput>> {
    try {
      return await api.request(`${this.baseUrl}/video-script`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VIDEO_SCRIPT_GENERATION_FAILED'
      );
    }
  }

  // Meeting Notes
  async organizeMeetingNotes(input: MeetingNotesInput): Promise<AIToolResponse<MeetingNotesOutput>> {
    try {
      return await api.request(`${this.baseUrl}/meeting-notes`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEETING_NOTES_ORGANIZATION_FAILED'
      );
    }
  }

  // Study Notes
  async generateStudyNotes(input: StudyNotesInput): Promise<AIToolResponse<StudyNotesOutput>> {
    try {
      return await api.request(`${this.baseUrl}/study-notes`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'STUDY_NOTES_GENERATION_FAILED'
      );
    }
  }

  // Contract Analyzer
  async analyzeContract(input: ContractAnalysisInput): Promise<AIToolResponse<ContractAnalysisOutput>> {
    try {
      return await api.request(`${this.baseUrl}/contract-analysis`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CONTRACT_ANALYSIS_FAILED'
      );
    }
  }

  // Legal Document Generator
  async generateLegalDocument(input: LegalDocumentInput): Promise<AIToolResponse<LegalDocumentOutput>> {
    try {
      return await api.request(`${this.baseUrl}/legal-document`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LEGAL_DOCUMENT_GENERATION_FAILED'
      );
    }
  }

  // Tax Calculator
  async calculateTax(input: TaxCalculatorInput): Promise<AIToolResponse<TaxCalculatorOutput>> {
    try {
      return await api.request(`${this.baseUrl}/tax-calculator`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TAX_CALCULATION_FAILED'
      );
    }
  }

  // Investment Advisor
  async getInvestmentAdvice(input: InvestmentInput): Promise<AIToolResponse<InvestmentOutput>> {
    try {
      return await api.request(`${this.baseUrl}/investment-advice`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INVESTMENT_ADVICE_FAILED'
      );
    }
  }

  // Text to Speech
  async textToSpeech(input: TextToSpeechInput): Promise<AIToolResponse<TextToSpeechOutput>> {
    try {
      return await api.request(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEXT_TO_SPEECH_FAILED'
      );
    }
  }

  // Speech to Text
  async speechToText(input: SpeechToTextInput): Promise<AIToolResponse<SpeechToTextOutput>> {
    try {
      return await api.request(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SPEECH_TO_TEXT_FAILED'
      );
    }
  }

  // Translator
  async translate(input: TranslationInput): Promise<AIToolResponse<TranslationOutput>> {
    try {
      return await api.request(`${this.baseUrl}/translate`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSLATION_FAILED'
      );
    }
  }

  // Image Generator
  async generateImage(input: ImageGenerationInput): Promise<AIToolResponse<ImageGenerationOutput>> {
    try {
      return await api.request(`${this.baseUrl}/generate-image`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'IMAGE_GENERATION_FAILED'
      );
    }
  }
}

export const aiToolsService = new AIToolsService();
