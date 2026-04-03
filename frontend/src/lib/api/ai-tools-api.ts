/**
 * AI Tools API Client
 * Handles all AI-powered tool operations
 */

import { api } from '@/lib/api';

// Type definitions for all AI tools

export interface ResumeBuilderData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  professionalSummary?: string;
  generateSummary?: boolean;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string;
  targetJob?: string;
  resumeStyle: 'professional' | 'modern' | 'creative' | 'minimal';
}

export interface CoverLetterData {
  jobTitle: string;
  company: string;
  hiringManager?: string;
  applicantName: string;
  experience: string;
  skills: string;
  motivation: string;
  tone: 'formal' | 'friendly' | 'enthusiastic';
}

export interface SocialCaptionData {
  topic: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok';
  tone: 'casual' | 'professional' | 'humorous' | 'inspirational';
  length: 'short' | 'medium' | 'long';
  includeEmojis: boolean;
  includeHashtags: boolean;
}

export interface HashtagGeneratorData {
  topic: string;
  platform: 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube';
  count: number;
  includeTrending: boolean;
  includeNiche: boolean;
}

export interface VideoScriptData {
  topic: string;
  platform: 'youtube' | 'tiktok' | 'reels' | 'shorts';
  duration: 'short' | 'medium' | 'long';
  tone: 'casual' | 'professional' | 'energetic' | 'educational';
  targetAudience?: string;
  keyPoints?: string;
  includeHook: boolean;
  includeCTA: boolean;
}

export interface EmailComposerData {
  purpose: 'professional' | 'sales' | 'follow-up' | 'apology' | 'request' | 'thank-you' | 'announcement';
  recipient: string;
  subject?: string;
  keyPoints: string;
  senderName?: string;
  tone: 'formal' | 'friendly' | 'urgent';
}

export interface MeetingNotesData {
  title: string;
  attendees?: string;
  rawNotes: string;
  format: 'structured' | 'bullet-points' | 'narrative';
  includeSummary: boolean;
  extractActionItems: boolean;
}

export interface StudyNotesData {
  topic: string;
  content?: string;
  format: 'cornell' | 'outline' | 'mind-map' | 'flashcards';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  includeKeyTerms: boolean;
  includeSummary: boolean;
  includeQuestions: boolean;
}

export interface ContractAnalyzerData {
  contractType: 'general' | 'employment' | 'nda' | 'lease' | 'service' | 'partnership';
  contractText: string;
  highlightRisks: boolean;
  identifyObligations: boolean;
  suggestImprovements: boolean;
}

export interface LegalDocumentData {
  documentType: 'nda' | 'service-agreement' | 'freelance-contract' | 'lease' | 'partnership' | 'terms-of-service' | 'privacy-policy';
  jurisdiction: 'general' | 'us' | 'uk' | 'eu' | 'canada' | 'australia';
  partyA: string;
  partyB: string;
  details: string;
}

export interface TaxCalculatorData {
  country: 'us' | 'uk' | 'canada' | 'australia' | 'germany' | 'india';
  annualIncome: number;
  deductions?: number;
  filingStatus: 'single' | 'married-jointly' | 'married-separately' | 'head-of-household';
  incomeType: 'employment' | 'self-employed' | 'investment' | 'rental';
}

export interface InvestmentAdvisorData {
  investmentAmount: number;
  age: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
  goals?: string;
}

export interface TTSData {
  text: string;
  voice: 'alloy' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer';
  speed: number;
}

export interface STTData {
  audioBase64: string;
  mimeType?: string;
  language?: string;
}

export interface ImageGeneratorData {
  prompt: string;
  negativePrompt?: string;
  size: 'square' | 'portrait' | 'landscape' | 'wide' | 'tall';
  width?: number;
  height?: number;
}

export interface TranslatorData {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Response types
export interface AIToolResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const aiToolsApi = {
  // Resume Builder
  async generateResume(data: ResumeBuilderData): Promise<AIToolResponse<{ resume: string }>> {
    return api.post('/ai-tools/resume', data);
  },

  // Cover Letter
  async generateCoverLetter(data: CoverLetterData): Promise<AIToolResponse<{ coverLetter: string; subject: string }>> {
    return api.post('/ai-tools/cover-letter', data);
  },

  // Social Caption
  async generateSocialCaption(data: SocialCaptionData): Promise<AIToolResponse<{ caption: string; hashtags: string[] }>> {
    return api.post('/ai-tools/social-caption', data);
  },

  // Hashtag Generator
  async generateHashtags(data: HashtagGeneratorData): Promise<AIToolResponse<{ hashtags: string[] }>> {
    return api.post('/ai-tools/hashtags', data);
  },

  // Video Script
  async generateVideoScript(data: VideoScriptData): Promise<AIToolResponse<{ script: string }>> {
    return api.post('/ai-tools/video-script', data);
  },

  // Email Composer
  async composeEmail(data: EmailComposerData): Promise<AIToolResponse<{ subject: string; body: string }>> {
    return api.post('/ai-tools/email', data);
  },

  // Meeting Notes
  async generateMeetingNotes(data: MeetingNotesData): Promise<AIToolResponse<{ summary: string; notes: string; actionItems: string[] }>> {
    return api.post('/ai-tools/meeting-notes', data);
  },

  // Study Notes
  async generateStudyNotes(data: StudyNotesData): Promise<AIToolResponse<{ notes: string; keyTerms: string[]; questions: string[] }>> {
    return api.post('/ai-tools/study-notes', data);
  },

  // Contract Analyzer
  async analyzeContract(data: ContractAnalyzerData): Promise<AIToolResponse<{ summary: string; risks: string[]; obligations: string[]; suggestions: string[] }>> {
    return api.post('/ai-tools/contract-analyzer', data);
  },

  // Legal Document
  async generateLegalDocument(data: LegalDocumentData): Promise<AIToolResponse<{ document: string }>> {
    return api.post('/ai-tools/legal-document', data);
  },

  // Tax Calculator
  async calculateTax(data: TaxCalculatorData): Promise<AIToolResponse<{ estimatedTax: number; effectiveRate: number; breakdown: Record<string, number>; tips: string[] }>> {
    return api.post('/ai-tools/tax-calculator', data);
  },

  // Investment Advisor
  async getInvestmentAdvice(data: InvestmentAdvisorData): Promise<AIToolResponse<{ strategy: string; allocation: Record<string, number>; recommendations: string[]; warnings: string[] }>> {
    return api.post('/ai-tools/investment-advisor', data);
  },

  // Text to Speech
  async textToSpeech(data: TTSData): Promise<AIToolResponse<{ audioBase64: string }>> {
    return api.post('/ai-tools/text-to-speech', data);
  },

  // Speech to Text
  async speechToText(data: STTData): Promise<AIToolResponse<{ text: string; detectedLanguage?: string }>> {
    return api.post('/ai-tools/speech-to-text', data);
  },

  // Image Generator
  async generateImage(data: ImageGeneratorData): Promise<AIToolResponse<{ imageUrl: string }>> {
    return api.post('/ai-tools/generate-image', data);
  },

  // Translator
  async translate(data: TranslatorData): Promise<AIToolResponse<{ translatedText: string; detectedLanguage?: string }>> {
    return api.post('/ai-tools/translate', data);
  },

  // Export PDF
  async exportPdf(data: { content: string; title: string; type: 'resume' | 'cover-letter' | 'document'; metadata?: Record<string, any> }): Promise<{ pdfUrl: string }> {
    return api.post('/ai-tools/export-pdf', data);
  },
};
