import { api } from '../lib/api';

/**
 * Tool Prefill Service
 * Extracts structured data from AI responses or uploaded files
 * to prefill tool forms based on tool type and form fields
 *
 * NOTE: For topic-based tools (generators, writers, planners), prefill should
 * come from the backend LLM extraction endpoint, not from regex patterns.
 * Simple regex cannot handle multilingual input or varied phrasing.
 */

// Backend extraction response type
interface ToolPrefillApiResponse {
  statusCode: number;
  message: string;
  data: {
    tool_id: string;
    prefill_values: Array<{
      field: string;
      value: any;
      confidence: number;
      source: 'user_query' | 'llm_response' | 'context';
    }>;
    extracted_topic?: string;
    extracted_intent?: string;
  };
}

/**
 * Extract tool prefill using backend LLM extraction (async)
 * This is the proper way to extract user intent - handles any language/phrasing
 */
export async function extractToolPrefillFromBackend(
  toolId: string,
  userQuery: string,
  llmResponse?: string,
): Promise<ToolPrefillData> {
  try {
    const response = await api.post<ToolPrefillApiResponse>('/context/tool-prefill', {
      tool_id: toolId,
      user_query: userQuery,
      llm_response: llmResponse,
    });

    // Response structure: { statusCode, message, data: { toolId, prefillValues, ... } }
    // Note: Backend uses CamelCaseInterceptor so all properties are camelCase
    const result = response.data || response;
    console.log('Tool prefill response:', response);
    console.log('Tool prefill result:', result);
    const prefillData: ToolPrefillData = {};

    // Safely get prefillValues array (camelCase from backend interceptor)
    const prefillValues = result.prefillValues || result.prefill_values || [];

    // Map extracted values to prefill data
    for (const value of prefillValues) {
      switch (value.field) {
        case 'topic':
        case 'content':
          prefillData.content = value.value;
          prefillData.text = value.value;
          break;
        case 'title':
          prefillData.title = value.value;
          break;
        case 'subject':
          prefillData.subject = value.value;
          break;
        case 'tone':
          prefillData.tone = value.value;
          break;
        case 'targetAudience':
          prefillData.description = value.value;
          break;
        default:
          // Store in metadata for tool-specific handling
          if (!prefillData.metadata) prefillData.metadata = {};
          prefillData.metadata[value.field] = value.value;
      }
    }

    // Also store extracted topic/intent in metadata (handle both camelCase and snake_case)
    const extractedTopic = result.extractedTopic || result.extracted_topic;
    const extractedIntent = result.extractedIntent || result.extracted_intent;

    if (extractedTopic) {
      prefillData.content = prefillData.content || extractedTopic;
      prefillData.text = prefillData.text || extractedTopic;
      if (!prefillData.metadata) prefillData.metadata = {};
      prefillData.metadata.topic = extractedTopic;
    }

    if (extractedIntent) {
      if (!prefillData.metadata) prefillData.metadata = {};
      prefillData.metadata.intent = extractedIntent;
    }

    console.log('Extracted prefillData:', prefillData);

    return prefillData;
  } catch (error) {
    console.error('Backend tool prefill extraction failed:', error);
    // Return empty on error - better than garbage prefill
    return {};
  }
}

/**
 * Tools that should use backend LLM extraction instead of frontend regex
 */
const BACKEND_EXTRACTION_TOOLS = [
  'how-to-guide',
  'business-plan',
  'essay-writer',
  'blog-post-generator',
  'article-summarizer',
  'story-generator',
  'poetry-generator',
  'speech-writer',
  'proposal-generator',
  'tutorial-writer',
  'product-description',
  'ad-copy-generator',
  'slogan-creator',
  'headline-generator',
  'faq-generator',
  'newsletter',
  'press-release',
  'review-writer',
  'video-script',
  'podcast-script',
  'social-media-post',
  'tweet',
  'linkedin-bio',
  'youtube-description',
  'recipe-writer',
  'workout-planner',
  'meal-planner',
  'travel-budget',
  'budget-planner',
  'study-planner',
];

/**
 * Check if a tool should use backend LLM extraction
 */
export function shouldUseBackendExtraction(toolId: string): boolean {
  return BACKEND_EXTRACTION_TOOLS.includes(toolId) ||
    toolId.includes('generator') ||
    toolId.includes('writer') ||
    toolId.includes('creator') ||
    toolId.includes('planner') ||
    toolId.includes('builder');
}

export interface ToolPrefillData {
  // General
  content?: string;           // Raw content for text-based tools

  // Email/Writing tools
  subject?: string;
  recipientType?: string;
  tone?: string;
  purpose?: string;
  keyPoints?: string;
  body?: string;
  greeting?: string;
  closing?: string;

  // Image tools
  imageUrl?: string;
  imageFile?: File;
  imagePreview?: string;      // base64 or object URL
  imageName?: string;
  imageMimeType?: string;

  // Text tools
  text?: string;
  sourceText?: string;
  targetText?: string;

  // Translation
  sourceLanguage?: string;
  targetLanguage?: string;

  // Calculator tools
  amount?: number;
  numbers?: number[];

  // Code tools
  code?: string;
  language?: string;

  // Grammar/Writing
  sentence?: string;
  paragraph?: string;

  // Cover Letter
  jobTitle?: string;
  company?: string;
  skills?: string[];
  experience?: string;

  // Bill splitting
  total?: number;
  people?: number;
  tipPercentage?: number;

  // Generic metadata
  title?: string;
  description?: string;
  metadata?: Record<string, any>;

  // Business/Professional tools
  projectName?: string;
  client?: string;
  rate?: number;
  hours?: number;
  location?: string;
  type?: string;
  caseName?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  propertyName?: string;
  address?: string;
  rent?: number;

  // Chore Chart tool
  familyMembers?: any[];
  chores?: any[];
}

// Patterns for extracting structured data from AI responses
const EMAIL_PATTERNS = {
  subject: /(?:Subject:|Re:|Fwd:)\s*(.+?)(?:\n|$)/i,
  greeting: /^((?:Dear|Hi|Hello|Hey|Good (?:morning|afternoon|evening))[^,\n]*)/im,
  closing: /((?:Best|Regards|Sincerely|Thanks|Thank you|Cheers|Kind regards|Best regards|Warm regards)[,\s]*\n?[\w\s]*?)$/im,
  recipientName: /(?:Dear|Hi|Hello|Hey)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
};

const CODE_PATTERNS = {
  codeBlock: /```(\w+)?\n([\s\S]*?)```/g,
  inlineCode: /`([^`]+)`/g,
  language: /```(\w+)/,
};

const NUMBER_PATTERNS = {
  currency: /\$[\d,]+(?:\.\d{2})?/g,
  percentage: /(\d+(?:\.\d+)?)\s*%/g,
  decimal: /\d+\.\d+/g,
  integer: /\d+/g,
};

/**
 * Extract prefill data from AI response content based on the target tool
 *
 * NOTE: For topic-based tools (generators, writers, planners), this function
 * should NOT be used. Instead, use the backend LLM extraction endpoint which
 * can properly understand user intent across languages and phrasings.
 *
 * This function is suitable for:
 * - Structured data extraction (code blocks, emails with clear format)
 * - Numeric data (amounts, percentages)
 * - Explicit fields (language names, company names in clear context)
 */
export function extractPrefillFromResponse(
  responseContent: string,
  userQuery: string,
  toolId: string
): ToolPrefillData {
  const prefillData: ToolPrefillData = {};

  // Get tool category from toolId
  const toolCategory = getToolCategory(toolId);

  switch (toolCategory) {
    case 'email':
      return extractEmailData(responseContent, userQuery, prefillData);

    case 'writing':
      // For writing tools, only prefill if content is actual written content
      // (not an LLM explanation about how to write)
      if (responseContent && responseContent.includes('```')) {
        return extractWritingData(responseContent, userQuery, prefillData);
      }
      return prefillData; // Return empty - let backend handle intent extraction

    case 'code':
      return extractCodeData(responseContent, prefillData);

    case 'translation':
      return extractTranslationData(responseContent, userQuery, prefillData);

    case 'calculator':
      return extractCalculatorData(responseContent, userQuery, prefillData);

    case 'text':
      return extractTextData(responseContent, prefillData);

    case 'grammar':
      return extractGrammarData(responseContent, prefillData);

    case 'cover-letter':
      return extractCoverLetterData(responseContent, userQuery, prefillData);

    case 'bill-split':
      return extractBillSplitData(responseContent, userQuery, prefillData);

    case 'image':
      // Image tools: don't prefill with text content
      return prefillData;

    default:
      // For unknown/topic-based tools: return empty
      // The backend LLM extraction endpoint should be used for these
      // Don't blindly pass LLM response as content - it's usually an explanation
      return prefillData;
  }
}

/**
 * Create prefill data from uploaded file
 */
export function createPrefillFromFile(
  file: File,
  fileUrl?: string,
  preview?: string
): ToolPrefillData {
  return {
    imageUrl: fileUrl,
    imageFile: file,
    imagePreview: preview,
    imageName: file.name,
    imageMimeType: file.type,
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
  };
}

// Tool category mapping
function getToolCategory(toolId: string): string {
  const categoryMap: Record<string, string[]> = {
    email: ['email-composer', 'email-generator', 'email-writer', 'business-email'],
    writing: ['ai-writer', 'content-writer', 'article-writer', 'blog-writer', 'essay-writer', 'story-writer', 'linkedin-post', 'social-media-post'],
    code: ['code-formatter', 'code-beautifier', 'json-formatter', 'html-formatter', 'css-formatter', 'javascript-formatter', 'python-formatter', 'code-minifier'],
    translation: ['translator', 'language-translator', 'text-translator'],
    calculator: ['calculator', 'percentage-calculator', 'tip-calculator', 'discount-calculator', 'loan-calculator', 'mortgage-calculator', 'bmi-calculator', 'age-calculator'],
    text: ['word-counter', 'character-counter', 'text-reverser', 'text-sorter', 'case-converter', 'find-replace', 'remove-duplicates', 'text-compare', 'paraphraser'],
    grammar: ['grammar-checker', 'spell-checker', 'punctuation-checker', 'sentence-checker'],
    'cover-letter': ['cover-letter', 'cover-letter-generator', 'resume-writer'],
    'bill-split': ['split-bill', 'tip-calculator', 'expense-splitter'],
    image: ['image-resizer', 'image-compressor', 'image-converter', 'image-cropper', 'background-remover', 'photo-enhancer', 'image-upscaler', 'color-picker'],
  };

  for (const [category, tools] of Object.entries(categoryMap)) {
    if (tools.includes(toolId)) {
      return category;
    }
  }

  // Try to infer from tool ID
  if (toolId.includes('email')) return 'email';
  if (toolId.includes('image') || toolId.includes('photo')) return 'image';
  if (toolId.includes('code') || toolId.includes('format')) return 'code';
  if (toolId.includes('translat')) return 'translation';
  if (toolId.includes('calculator') || toolId.includes('calc')) return 'calculator';
  if (toolId.includes('grammar') || toolId.includes('spell')) return 'grammar';
  if (toolId.includes('cover') || toolId.includes('letter')) return 'cover-letter';
  if (toolId.includes('split') || toolId.includes('bill')) return 'bill-split';
  if (toolId.includes('text') || toolId.includes('word')) return 'text';

  return 'unknown';
}

// Email data extraction
function extractEmailData(content: string, userQuery: string, prefillData: ToolPrefillData): ToolPrefillData {
  // Extract subject from content or user query
  const subjectMatch = content.match(EMAIL_PATTERNS.subject);
  if (subjectMatch) {
    prefillData.subject = subjectMatch[1].trim();
  } else {
    // Try to infer subject from user query
    const querySubject = userQuery.match(/(?:about|regarding|for|re:?)\s+(.+?)(?:\.|,|$)/i);
    if (querySubject) {
      prefillData.subject = querySubject[1].trim();
    }
  }

  // Extract greeting
  const greetingMatch = content.match(EMAIL_PATTERNS.greeting);
  if (greetingMatch) {
    prefillData.greeting = greetingMatch[1].trim();

    // Try to extract recipient type from greeting
    const recipientMatch = content.match(EMAIL_PATTERNS.recipientName);
    if (recipientMatch) {
      // Infer recipient type from context
      if (userQuery.toLowerCase().includes('boss') || userQuery.toLowerCase().includes('manager')) {
        prefillData.recipientType = 'manager';
      } else if (userQuery.toLowerCase().includes('client')) {
        prefillData.recipientType = 'client';
      } else if (userQuery.toLowerCase().includes('friend')) {
        prefillData.recipientType = 'friend';
      } else {
        prefillData.recipientType = 'colleague';
      }
    }
  }

  // Extract closing
  const closingMatch = content.match(EMAIL_PATTERNS.closing);
  if (closingMatch) {
    prefillData.closing = closingMatch[1].trim();
  }

  // Extract body (everything between greeting and closing)
  let body = content;
  if (greetingMatch) {
    body = body.substring(body.indexOf(greetingMatch[0]) + greetingMatch[0].length);
  }
  if (closingMatch) {
    body = body.substring(0, body.lastIndexOf(closingMatch[0]));
  }
  prefillData.body = body.trim();

  // Infer tone from user query
  if (userQuery.toLowerCase().includes('formal')) {
    prefillData.tone = 'formal';
  } else if (userQuery.toLowerCase().includes('casual') || userQuery.toLowerCase().includes('friendly')) {
    prefillData.tone = 'friendly';
  } else if (userQuery.toLowerCase().includes('professional')) {
    prefillData.tone = 'professional';
  }

  // Extract key points if present
  const bulletPoints = content.match(/[-•]\s+(.+)/g);
  if (bulletPoints) {
    prefillData.keyPoints = bulletPoints.map(bp => bp.replace(/^[-•]\s+/, '')).join('\n');
  }

  // Extract purpose from user query
  const purposeMatch = userQuery.match(/(?:write|compose|draft|create)\s+(?:an?\s+)?(?:email|message|letter)\s+(?:to|for|about)?\s*(.+)/i);
  if (purposeMatch) {
    prefillData.purpose = purposeMatch[1].trim();
  }

  return prefillData;
}

// Writing data extraction
function extractWritingData(content: string, userQuery: string, prefillData: ToolPrefillData): ToolPrefillData {
  prefillData.text = content;

  // Extract title if present (first line or heading)
  const lines = content.split('\n');
  if (lines[0] && lines[0].length < 100) {
    prefillData.title = lines[0].replace(/^#\s*/, '').trim();
  }

  // Infer tone from query
  if (userQuery.toLowerCase().includes('professional')) {
    prefillData.tone = 'professional';
  } else if (userQuery.toLowerCase().includes('casual')) {
    prefillData.tone = 'casual';
  } else if (userQuery.toLowerCase().includes('formal')) {
    prefillData.tone = 'formal';
  }

  return prefillData;
}

// Code data extraction
function extractCodeData(content: string, prefillData: ToolPrefillData): ToolPrefillData {
  // Extract code blocks
  const codeMatches = [...content.matchAll(CODE_PATTERNS.codeBlock)];
  if (codeMatches.length > 0) {
    prefillData.language = codeMatches[0][1] || 'text';
    prefillData.code = codeMatches[0][2].trim();
  } else {
    // Try inline code or just use content
    prefillData.code = content;
  }

  return prefillData;
}

// Translation data extraction
function extractTranslationData(content: string, userQuery: string, prefillData: ToolPrefillData): ToolPrefillData {
  prefillData.text = content;

  // Try to extract language from query
  const languages = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean', 'arabic', 'hindi', 'russian', 'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish', 'turkish', 'greek', 'hebrew', 'thai', 'vietnamese', 'indonesian', 'malay', 'bengali', 'urdu', 'persian', 'swahili'];

  const queryLower = userQuery.toLowerCase();
  for (const lang of languages) {
    if (queryLower.includes(`to ${lang}`) || queryLower.includes(`into ${lang}`)) {
      prefillData.targetLanguage = lang;
    }
    if (queryLower.includes(`from ${lang}`)) {
      prefillData.sourceLanguage = lang;
    }
  }

  return prefillData;
}

// Calculator data extraction
function extractCalculatorData(content: string, userQuery: string, prefillData: ToolPrefillData): ToolPrefillData {
  // Extract currency amounts
  const currencyMatches = content.match(NUMBER_PATTERNS.currency);
  if (currencyMatches) {
    const amount = parseFloat(currencyMatches[0].replace(/[$,]/g, ''));
    prefillData.amount = amount;
    prefillData.total = amount;
  }

  // Extract percentages
  const percentMatches = content.match(NUMBER_PATTERNS.percentage);
  if (percentMatches) {
    prefillData.tipPercentage = parseFloat(percentMatches[0]);
  }

  // Extract numbers from query
  const queryNumbers = userQuery.match(NUMBER_PATTERNS.decimal) || userQuery.match(NUMBER_PATTERNS.integer);
  if (queryNumbers) {
    prefillData.numbers = queryNumbers.map(n => parseFloat(n));
    if (!prefillData.amount && prefillData.numbers.length > 0) {
      prefillData.amount = prefillData.numbers[0];
    }
  }

  // Extract people count for bill split
  const peopleMatch = userQuery.match(/(\d+)\s*(?:people|persons|ways|friends)/i);
  if (peopleMatch) {
    prefillData.people = parseInt(peopleMatch[1]);
  }

  return prefillData;
}

// Text tool data extraction
function extractTextData(content: string, prefillData: ToolPrefillData): ToolPrefillData {
  prefillData.text = content;
  prefillData.sourceText = content;
  return prefillData;
}

// Grammar data extraction
function extractGrammarData(content: string, prefillData: ToolPrefillData): ToolPrefillData {
  prefillData.text = content;
  prefillData.sentence = content;
  prefillData.paragraph = content;
  return prefillData;
}

// Cover letter data extraction
function extractCoverLetterData(content: string, userQuery: string, prefillData: ToolPrefillData): ToolPrefillData {
  prefillData.body = content;

  // Extract job title from query
  const jobMatch = userQuery.match(/(?:for|as|position of|role of)\s+(?:a|an|the)?\s*([^,.]+?)(?:\s+(?:at|position|role|job)|\.|,|$)/i);
  if (jobMatch) {
    prefillData.jobTitle = jobMatch[1].trim();
  }

  // Extract company from query
  const companyMatch = userQuery.match(/(?:at|for|with)\s+([A-Z][A-Za-z\s&]+?)(?:\s+(?:for|as|position)|\.|,|$)/i);
  if (companyMatch) {
    prefillData.company = companyMatch[1].trim();
  }

  return prefillData;
}

// Bill split data extraction
function extractBillSplitData(content: string, userQuery: string, prefillData: ToolPrefillData): ToolPrefillData {
  // Extract total amount
  const currencyMatches = userQuery.match(NUMBER_PATTERNS.currency) || content.match(NUMBER_PATTERNS.currency);
  if (currencyMatches) {
    prefillData.total = parseFloat(currencyMatches[0].replace(/[$,]/g, ''));
  }

  // Extract number of people
  const peopleMatch = userQuery.match(/(\d+)\s*(?:people|persons|ways|friends|of us)/i);
  if (peopleMatch) {
    prefillData.people = parseInt(peopleMatch[1]);
  }

  // Extract tip percentage
  const tipMatch = userQuery.match(/(\d+)\s*%?\s*tip/i);
  if (tipMatch) {
    prefillData.tipPercentage = parseInt(tipMatch[1]);
  }

  return prefillData;
}

// Export a singleton service
class ToolPrefillService {
  /**
   * Extract prefill data - uses frontend regex for structured tools,
   * falls back to empty for topic-based tools (backend extraction preferred)
   */
  extractFromResponse(
    responseContent: string,
    userQuery: string,
    toolId: string
  ): ToolPrefillData {
    // For topic-based tools, return empty and let caller use async backend extraction
    if (shouldUseBackendExtraction(toolId)) {
      return {};
    }
    return extractPrefillFromResponse(responseContent, userQuery, toolId);
  }

  /**
   * Extract prefill data using backend LLM (async)
   * Use this for topic-based tools that need intelligent extraction
   */
  async extractFromBackend(
    toolId: string,
    userQuery: string,
    llmResponse?: string
  ): Promise<ToolPrefillData> {
    return extractToolPrefillFromBackend(toolId, userQuery, llmResponse);
  }

  /**
   * Check if a tool should use backend LLM extraction
   */
  shouldUseBackendExtraction(toolId: string): boolean {
    return shouldUseBackendExtraction(toolId);
  }

  createFromFile(
    file: File,
    fileUrl?: string,
    preview?: string
  ): ToolPrefillData {
    return createPrefillFromFile(file, fileUrl, preview);
  }

  getToolCategory(toolId: string): string {
    return getToolCategory(toolId);
  }
}

export const toolPrefillService = new ToolPrefillService();
export default toolPrefillService;
