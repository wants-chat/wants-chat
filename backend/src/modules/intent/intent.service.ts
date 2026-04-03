import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantService } from '../qdrant/qdrant.service';
import { AiService } from '../ai/ai.service';

// UI Component Types
export type UIType =
  | 'chat'           // Simple chat response
  | 'converter'      // Left↔Right transformation
  | 'generator'      // Create from prompt (image, video, audio)
  | 'calculator'     // Numeric computation
  | 'editor'         // Modify content (docs, code)
  | 'table'          // Data display/comparison
  | 'chart'          // Data visualization
  | 'form'           // Collect structured data
  | 'builder'        // Visual construction (apps, workflows)
  | 'player'         // Media playback
  | 'scanner'        // Extract/read data
  | 'timeline'       // Sequential display
  | 'canvas'         // Freeform creation
  | 'splitter'       // Before/After view
  | 'list'           // List display
  | 'cards'          // Card gallery
  | 'quiz'           // Interactive quiz
  | 'dashboard'      // Dashboard view
  | 'bot-builder'    // Chatbot builder
  | 'app-builder'    // App builder
  | 'web-action';    // Web actions (screenshot, summarize, research, etc.)

// Service backends
export type ServiceBackend =
  | 'wants'          // Local wants backend
  | 'widest-life'    // Utility tools
  | 'imagitar'       // Image/video generation
  | 'fluxturn'       // Workflow automation
  | 'promoatonce'    // Promotions, analytics, email
  | 'openai';        // General AI response

export interface IntentPattern {
  id: string;
  pattern: string;           // Example: "convert PDF to Word"
  category: string;          // Example: "conversion", "generation", "calculation"
  subCategory?: string;      // Example: "document", "image", "currency"
  uiType: UIType;
  serviceBackend: ServiceBackend;
  endpoint?: string;         // API endpoint to call
  title: string;             // Display title
  description: string;       // Description for the UI
  icon?: string;             // Icon name
  metadata?: Record<string, any>;
}

export interface IntentMatch {
  matched: boolean;
  confidence: number;
  pattern?: IntentPattern;
  fallbackToAI: boolean;
}

export interface IntentResult {
  intent: IntentMatch;
  userMessage: string;
  suggestedResponse?: string;
  uiConfig?: {
    type: UIType;
    toolId?: string;  // Direct toolId for frontend routing
    title: string;
    description: string;
    icon?: string;
    serviceBackend: ServiceBackend;
    endpoint?: string;
    metadata?: Record<string, any>;
  };
}

const COLLECTION_NAME = 'wants_intent_patterns';
const VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small
const CONFIDENCE_THRESHOLD = 0.65; // Minimum score to consider a match (lowered for better semantic matching)

// Web action types that can be detected via LLM
type WebActionType = 'screenshot' | 'summarize' | 'research' | 'none';

interface WebActionClassification {
  action: WebActionType;
  confidence: number;
  url?: string;
  reason?: string;
}

// App creation intent detection
interface AppCreationClassification {
  isAppCreation: boolean;
  confidence: number;
  appDescription?: string;
  appType?: string;
  reason?: string;
}

// ============================================
// UNIFIED INTENT CLASSIFICATION
// Single LLM call to detect all intent types
// ============================================

export type UnifiedIntentCategory =
  | 'app_creation'         // User wants to build/create a new app
  | 'web_action'           // Screenshot, summarize, research a URL
  | 'contextual_ui'        // User needs a specific tool (calculator, converter, etc.)
  | 'workflow'             // Create AI workflow/agent/automation
  | 'existing_app'         // Reference to existing deployed app (show, open, use)
  | 'file_action'          // File-based actions (convert, compress, etc.)
  | 'learning_productivity' // Tutoring, summarization, planning, writing assistance
  | 'chat';                // General conversation/question

export interface UnifiedIntentClassification {
  category: UnifiedIntentCategory;
  confidence: number;

  // App creation specific
  appDescription?: string;
  appType?: string;
  appFeatures?: string[];
  appVariant?: string;      // web, mobile, desktop, fullstack
  appColors?: string[];     // Brand colors if mentioned

  // Web action specific
  webAction?: 'screenshot' | 'summarize' | 'research';
  url?: string;

  // Contextual UI specific
  toolQuery?: string;       // Search query for tool matching
  toolCategory?: string;    // Suggested tool category

  // Workflow specific
  workflowDescription?: string;
  workflowSteps?: string[];

  // Existing app specific
  existingAppQuery?: string; // Search query to find the app

  // File action specific
  fileAction?: string;      // convert, compress, resize, etc.
  fileType?: string;        // input file type
  targetType?: string;      // output file type

  // Learning & productivity specific
  learningSubType?: 'tutoring' | 'summarize' | 'organize' | 'writing';
  learningTopic?: string;     // Topic for tutoring
  planType?: 'schedule' | 'goals' | 'project' | 'study';
  writingType?: 'email' | 'essay' | 'report' | 'proofread';
  contentToProcess?: string;  // Text/URL/file reference for summarization

  reason?: string;
}

// Unified classifier prompt - handles ALL intent types in one call
const UNIFIED_INTENT_CLASSIFIER_PROMPT = `You are a unified intent classifier for a multi-purpose platform. Classify user messages into ONE of these categories:

CATEGORIES:
1. app_creation - User wants to BUILD/CREATE/GENERATE a new application
   - "create a time tracker app"
   - "build me an e-commerce website"
   - "I need a booking system for my salon"
   - "make a fitness app with calorie tracking"
   Extract: appDescription, appType, appFeatures[], appVariant (web/mobile/desktop/fullstack), appColors[]

2. web_action - User wants to interact with a URL/webpage
   - "take a screenshot of google.com"
   - "summarize this article"
   - "research about Tesla stock"
   Extract: webAction (screenshot/summarize/research), url (if mentioned)

3. contextual_ui - User needs a UTILITY TOOL (calculator, converter, generator, etc.)
   - "convert this PDF to Word"
   - "calculate my BMI"
   - "generate a QR code"
   - "what's the tip for $50?"
   Extract: toolQuery, toolCategory

4. workflow - User wants to create an AI WORKFLOW/AUTOMATION/AGENT
   - "create a workflow that..."
   - "automate sending emails when..."
   - "build an agent that monitors..."
   Extract: workflowDescription, workflowSteps[]

5. existing_app - User wants to USE/OPEN/SHOW an EXISTING deployed app
   - "show me the time tracker app"
   - "open my expense tracker"
   - "tell me about the fitness app"
   Extract: existingAppQuery

6. file_action - User has a FILE and needs to do something with it
   - "compress this image"
   - "convert this video to MP4"
   - "resize my photo"
   Extract: fileAction, fileType, targetType

7. learning_productivity - User wants LEARNING help, PLANNING, or WRITING assistance
   - TUTORING: "explain quantum physics", "teach me about React", "how does photosynthesis work"
   - SUMMARIZE: "summarize this document", "give me the key points", "TLDR"
   - ORGANIZE: "plan my week", "create a study schedule", "set goals for Q1", "make a project timeline"
   - WRITING: "write an email to my boss", "draft an essay about climate change", "create a report"
   Extract: learningSubType (tutoring/summarize/organize/writing), learningTopic, planType, writingType

8. chat - General conversation, question, or unclear intent
   - "hello"
   - "how are you?"
   - "what can you do?"

IMPORTANT DISTINCTIONS:
- "create a time tracker app" → app_creation (building NEW app)
- "show me the time tracker" → existing_app (referencing EXISTING app)
- "I need a timer" → contextual_ui (needs UTILITY tool)
- "how do I track time?" → chat (general question)
- "explain time management" → learning_productivity (tutoring)
- "plan my time this week" → learning_productivity (organize)
- "write an email about scheduling" → learning_productivity (writing)

Respond ONLY with valid JSON:
{
  "category": "app_creation|web_action|contextual_ui|workflow|existing_app|file_action|learning_productivity|chat",
  "confidence": 0.0-1.0,
  "appDescription": "string or null",
  "appType": "string or null",
  "appFeatures": ["feature1", "feature2"] or null,
  "appVariant": "web|mobile|desktop|fullstack or null",
  "appColors": ["#hex1", "#hex2"] or null,
  "webAction": "screenshot|summarize|research or null",
  "url": "string or null",
  "toolQuery": "string or null",
  "toolCategory": "string or null",
  "workflowDescription": "string or null",
  "workflowSteps": ["step1", "step2"] or null,
  "existingAppQuery": "string or null",
  "fileAction": "string or null",
  "fileType": "string or null",
  "targetType": "string or null",
  "learningSubType": "tutoring|summarize|organize|writing or null",
  "learningTopic": "string or null",
  "planType": "schedule|goals|project|study or null",
  "writingType": "email|essay|report|proofread or null",
  "reason": "brief explanation"
}`;

// System prompt for app creation classification
const APP_CREATION_CLASSIFIER_PROMPT = `You are a classifier that detects when users want to CREATE or BUILD an application/app/software.

Classify if the user's message is requesting to CREATE/BUILD/GENERATE an application.

POSITIVE SIGNALS (app creation intent):
- "create an app for..."
- "build me a... application"
- "I need an app that..."
- "generate a... system"
- "make an application for..."
- "develop a... platform"
- "I want to build a... app"
- "can you create a... website/app"
- "build a booking system for my salon"
- "create a restaurant ordering app"
- "I need an e-commerce store"
- "make me a fitness tracking app"

NEGATIVE SIGNALS (NOT app creation):
- Asking about existing apps
- Asking how to use something
- General questions
- Web actions (screenshot, summarize)
- File conversions
- Calculations

Extract:
1. isAppCreation: true/false
2. appDescription: What kind of app they want (if applicable)
3. appType: Category like "ecommerce", "booking", "fitness", "restaurant", etc.

Respond ONLY with valid JSON:
{"isAppCreation": true/false, "confidence": 0.0-1.0, "appDescription": "description or null", "appType": "type or null", "reason": "brief_reason"}`;

// System prompt for web action classification - works in any language
// Includes conversation context so LLM can resolve "this website", "that page", etc.
const WEB_ACTION_CLASSIFIER_PROMPT = `You are a classifier that detects web action intents from user messages.

You will receive:
1. Recent conversation history (for context)
2. The current user message

Classify the CURRENT message into ONE of these actions:
- screenshot: User wants to capture/screenshot/snapshot a webpage
- summarize: User wants to read/summarize/extract content from a webpage
- research: User wants deep research on a topic from multiple sources
- none: Not a web action request

CRITICAL: Extract the URL from:
1. The current message (if URL is present)
2. OR from conversation history if user says "this website", "that page", "the same URL", etc.

The message can be in ANY language. Understand intent, not just keywords.

Examples:
- "take a screenshot of google.com" → screenshot, url: "https://google.com"
- "now take a screenshot of it" (after discussing example.com) → screenshot, url from context
- "ouvre ce site et fais une capture" (French) → screenshot
- "can you summarize this page too" (after previous URL) → summarize, url from context

Respond ONLY with valid JSON:
{"action": "screenshot|summarize|research|none", "confidence": 0.0-1.0, "url": "extracted_url_or_null", "reason": "brief_reason"}`

@Injectable()
export class IntentService implements OnModuleInit {
  private readonly logger = new Logger(IntentService.name);
  private initialized = false;

  constructor(
    private qdrantService: QdrantService,
    private aiService: AiService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Initialize collection in background to not block app startup
    this.initializeAsync();
    // Note: Web action patterns are no longer needed - using LLM-based classification instead
    // Keeping seedWebActionPatterns for backward compatibility but it's optional now
  }

  private async initializeAsync(): Promise<void> {
    // Wait for Qdrant to be ready (with 5s timeout)
    const qdrantReady = await this.qdrantService.waitForInit(5000);
    if (!qdrantReady) {
      if (!this.qdrantService.isHostConfigured()) {
        this.logger.warn('QDRANT_HOST not configured - intent detection will use AI fallback only');
      }
      return;
    }

    try {
      await this.ensureCollection();
    } catch (err) {
      this.logger.warn(`Failed to ensure collection: ${err.message}`);
    }
  }

  // ============================================
  // LLM-Based Web Action Classification
  // ============================================

  /**
   * Classify if user message is a web action request using LLM
   * This handles any language and phrasing naturally
   * Much more robust than pattern matching
   *
   * @param userMessage - The current user message
   * @param conversationContext - Recent messages for context (resolves "this website", etc.)
   */
  async classifyWebAction(
    userMessage: string,
    conversationContext?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<WebActionClassification> {
    if (!this.aiService.isConfigured()) {
      return { action: 'none', confidence: 0 };
    }

    try {
      // Build messages array with context
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: WEB_ACTION_CLASSIFIER_PROMPT },
      ];

      // Add conversation context (last few messages for URL reference)
      if (conversationContext && conversationContext.length > 0) {
        // Take last 6 messages for context (enough to find URLs mentioned)
        const recentContext = conversationContext.slice(-6);
        for (const msg of recentContext) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      // Add the current message to classify
      messages.push({ role: 'user', content: `CLASSIFY THIS MESSAGE: ${userMessage}` });

      // Use a fast, cheap model for classification
      const response = await this.aiService.chat(messages, {
        model: 'gpt-4o-mini', // Fast and cheap for classification
        maxTokens: 150, // Short response needed
        temperature: 0, // Deterministic classification
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('Web action classifier returned non-JSON response');
        return { action: 'none', confidence: 0 };
      }

      const result = JSON.parse(jsonMatch[0]) as WebActionClassification;

      // Validate action type
      if (!['screenshot', 'summarize', 'research', 'none'].includes(result.action)) {
        return { action: 'none', confidence: 0 };
      }

      this.logger.log(`Web action classified: ${result.action} (${(result.confidence * 100).toFixed(0)}%) url=${result.url || 'none'} - ${result.reason || 'no reason'}`);

      return result;
    } catch (error) {
      this.logger.error('Web action classification failed:', error.message);
      return { action: 'none', confidence: 0 };
    }
  }

  /**
   * Classify if user message is an app creation request using LLM
   * Detects when users want to CREATE/BUILD/GENERATE an application
   *
   * @param userMessage - The current user message
   * @param conversationContext - Recent messages for context
   */
  async classifyAppCreation(
    userMessage: string,
    conversationContext?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<AppCreationClassification> {
    if (!this.aiService.isConfigured()) {
      return { isAppCreation: false, confidence: 0 };
    }

    try {
      // Build messages array with context
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: APP_CREATION_CLASSIFIER_PROMPT },
      ];

      // Add conversation context (last few messages)
      if (conversationContext && conversationContext.length > 0) {
        const recentContext = conversationContext.slice(-4);
        for (const msg of recentContext) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      // Add the current message to classify
      messages.push({ role: 'user', content: `CLASSIFY THIS MESSAGE: ${userMessage}` });

      // Use a fast, cheap model for classification
      const response = await this.aiService.chat(messages, {
        model: 'gpt-4o-mini',
        maxTokens: 150,
        temperature: 0,
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('App creation classifier returned non-JSON response');
        return { isAppCreation: false, confidence: 0 };
      }

      const result = JSON.parse(jsonMatch[0]) as AppCreationClassification;

      this.logger.log(`App creation classified: ${result.isAppCreation} (${(result.confidence * 100).toFixed(0)}%) type=${result.appType || 'none'} - ${result.reason || 'no reason'}`);

      return result;
    } catch (error) {
      this.logger.error('App creation classification failed:', error.message);
      return { isAppCreation: false, confidence: 0 };
    }
  }

  // ============================================
  // UNIFIED INTENT CLASSIFICATION
  // Single LLM call for ALL intent types
  // ============================================

  /**
   * Classify user intent using a SINGLE LLM call
   * This is the unified router that handles ALL intent types efficiently
   *
   * Use this instead of calling classifyWebAction + classifyAppCreation separately
   *
   * @param userMessage - The current user message
   * @param conversationContext - Recent messages for context
   * @returns UnifiedIntentClassification with category and extracted data
   */
  async classifyUnifiedIntent(
    userMessage: string,
    conversationContext?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<UnifiedIntentClassification> {
    const startTime = Date.now();

    if (!this.aiService.isConfigured()) {
      this.logger.warn('AI not configured, returning chat fallback');
      return { category: 'chat', confidence: 0.5, reason: 'AI not configured' };
    }

    try {
      // Build messages array with context
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: UNIFIED_INTENT_CLASSIFIER_PROMPT },
      ];

      // Add conversation context (last 4 messages for context)
      if (conversationContext && conversationContext.length > 0) {
        const recentContext = conversationContext.slice(-4);
        for (const msg of recentContext) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      // Add the current message to classify
      messages.push({ role: 'user', content: `CLASSIFY THIS MESSAGE: ${userMessage}` });

      // Use a fast, cheap model for classification
      const response = await this.aiService.chat(messages, {
        model: 'gpt-4o-mini', // Fast and cheap for classification
        maxTokens: 300, // Allow for feature extraction
        temperature: 0, // Deterministic classification
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('Unified classifier returned non-JSON response');
        return { category: 'chat', confidence: 0.5, reason: 'Invalid response format' };
      }

      const result = JSON.parse(jsonMatch[0]) as UnifiedIntentClassification;

      // Validate category
      const validCategories: UnifiedIntentCategory[] = [
        'app_creation', 'web_action', 'contextual_ui', 'workflow',
        'existing_app', 'file_action', 'learning_productivity', 'chat'
      ];

      if (!validCategories.includes(result.category)) {
        this.logger.warn(`Invalid category: ${result.category}, defaulting to chat`);
        return { category: 'chat', confidence: 0.5, reason: 'Invalid category' };
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Unified intent: ${result.category} (${(result.confidence * 100).toFixed(0)}%) ` +
        `in ${duration}ms - ${result.reason || 'no reason'}`
      );

      return result;
    } catch (error) {
      this.logger.error('Unified intent classification failed:', error.message);
      return { category: 'chat', confidence: 0.5, reason: 'Classification error' };
    }
  }

  /**
   * Seed web action patterns for URL-related commands
   * These enable LLM-based detection of screenshot, summarize, research commands
   * Made public for manual reseeding via API endpoint
   */
  async seedWebActionPatterns(): Promise<void> {
    if (!this.initialized) return;

    const webActionPatterns: IntentPattern[] = [
      // Screenshot patterns
      {
        id: 'web-screenshot-1',
        pattern: 'take a screenshot of this website',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-2',
        pattern: 'capture this page as an image',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-3',
        pattern: 'show me what the website looks like',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-4',
        pattern: 'can you take the snapshot',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      // Screenshot patterns with "open", "go to", "visit" variations
      {
        id: 'web-screenshot-5',
        pattern: 'can you open this website and take a screenshot',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-6',
        pattern: 'open this link and capture screenshot',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-7',
        pattern: 'open and take snapshot of this page',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-8',
        pattern: 'go to this URL and take a screenshot',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-9',
        pattern: 'visit this website and capture the page',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-10',
        pattern: 'open this URL and take multiple screenshots',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-11',
        pattern: 'can you open and screenshot this website',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      {
        id: 'web-screenshot-12',
        pattern: 'browse this page and take a snapshot',
        category: 'web-action',
        subCategory: 'screenshot',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/screenshot',
        title: 'Screenshot',
        description: 'Capture a screenshot of the webpage',
        icon: 'camera',
        metadata: { action: 'screenshot' },
      },
      // Summarize patterns
      {
        id: 'web-summarize-1',
        pattern: 'summarize this website for me',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-2',
        pattern: 'can you browse this URL and extract information',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-3',
        pattern: 'what does this page say',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-4',
        pattern: 'give me a tldr of this article',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-5',
        pattern: 'read this page and tell me the key points',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-6',
        pattern: 'can you browse and summarize this website',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-7',
        pattern: 'browse this link and summarize it',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-8',
        pattern: 'can you open this website and summarize',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-9',
        pattern: 'open this link and give me a summary',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-10',
        pattern: 'open and summarize this page',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-11',
        pattern: 'go to this URL and summarize the content',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      {
        id: 'web-summarize-12',
        pattern: 'visit this website and summarize it',
        category: 'web-action',
        subCategory: 'summarize',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/summarize',
        title: 'Page Summary',
        description: 'Extract and summarize the main content',
        icon: 'file-text',
        metadata: { action: 'summarize' },
      },
      // Research patterns
      {
        id: 'web-research-1',
        pattern: 'research this topic for me',
        category: 'web-action',
        subCategory: 'research',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/research',
        title: 'Deep Research',
        description: 'Research a topic from multiple sources',
        icon: 'search',
        metadata: { action: 'research' },
      },
      {
        id: 'web-research-2',
        pattern: 'do a deep dive on this subject',
        category: 'web-action',
        subCategory: 'research',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/research',
        title: 'Deep Research',
        description: 'Research a topic from multiple sources',
        icon: 'search',
        metadata: { action: 'research' },
      },
      {
        id: 'web-research-3',
        pattern: 'find information about this from multiple sources',
        category: 'web-action',
        subCategory: 'research',
        uiType: 'web-action',
        serviceBackend: 'wants',
        endpoint: '/web/research',
        title: 'Deep Research',
        description: 'Research a topic from multiple sources',
        icon: 'search',
        metadata: { action: 'research' },
      },
    ];

    try {
      // Always seed web action patterns - they're critical for URL handling
      // Use upsert so duplicates are just updated, not duplicated
      const result = await this.addPatterns(webActionPatterns);
      this.logger.log(`Seeded/updated ${result.success} web action patterns (${result.failed} failed)`);
    } catch (error) {
      this.logger.warn(`Failed to seed web action patterns: ${error.message}`);
    }
  }

  private async ensureCollection(): Promise<void> {
    if (!this.qdrantService.isConfigured()) {
      return; // Already logged by initializeAsync
    }

    try {
      const collections = await this.qdrantService.listCollections();
      if (!collections.includes(COLLECTION_NAME)) {
        await this.qdrantService.createCollection(COLLECTION_NAME, VECTOR_SIZE, 'Cosine');
        this.logger.log(`Created intent patterns collection: ${COLLECTION_NAME}`);
      }

      const count = await this.qdrantService.countVectors(COLLECTION_NAME);
      this.logger.log(`Intent patterns collection has ${count} patterns`);
      this.initialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize intent collection:', error.message);
    }
  }

  // ============================================
  // Pattern Detection
  // ============================================

  async detectIntent(
    userMessage: string,
    conversationContext?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<IntentResult> {
    const startTime = Date.now();

    try {
      // ============================================
      // STEP 1: UNIFIED LLM classification (SINGLE call for ALL intent types)
      // This replaces separate classifyWebAction + classifyAppCreation calls
      // Reduces latency from 2+ LLM calls to just 1
      // ============================================
      const unifiedIntent = await this.classifyUnifiedIntent(userMessage, conversationContext);

      // Handle web_action intent
      if (unifiedIntent.category === 'web_action' && unifiedIntent.confidence >= 0.7 && unifiedIntent.webAction) {
        this.logger.log(
          `Web action detected via unified LLM: ${unifiedIntent.webAction} (${(unifiedIntent.confidence * 100).toFixed(0)}%) in ${Date.now() - startTime}ms`,
        );

        const actionConfig: Record<string, { title: string; description: string; icon: string; endpoint: string }> = {
          screenshot: {
            title: 'Screenshot',
            description: 'Capture a screenshot of the webpage',
            icon: 'camera',
            endpoint: '/web/screenshot',
          },
          summarize: {
            title: 'Page Summary',
            description: 'Extract and summarize the main content',
            icon: 'file-text',
            endpoint: '/web/summarize',
          },
          research: {
            title: 'Deep Research',
            description: 'Research a topic from multiple sources',
            icon: 'search',
            endpoint: '/web/research',
          },
        };

        const config = actionConfig[unifiedIntent.webAction];

        return {
          intent: {
            matched: true,
            confidence: unifiedIntent.confidence,
            pattern: {
              id: `llm-web-${unifiedIntent.webAction}`,
              pattern: userMessage,
              category: 'web-action',
              subCategory: unifiedIntent.webAction,
              uiType: 'web-action',
              serviceBackend: 'wants',
              endpoint: config.endpoint,
              title: config.title,
              description: config.description,
              icon: config.icon,
              metadata: {
                action: unifiedIntent.webAction,
                url: unifiedIntent.url,
                classifiedByLLM: true,
              },
            },
            fallbackToAI: false,
          },
          userMessage,
          uiConfig: {
            type: 'web-action',
            title: config.title,
            description: config.description,
            icon: config.icon,
            serviceBackend: 'wants',
            endpoint: config.endpoint,
            metadata: {
              action: unifiedIntent.webAction,
              url: unifiedIntent.url,
              classifiedByLLM: true,
            },
          },
        };
      }

      // Handle app_creation intent
      if (unifiedIntent.category === 'app_creation' && unifiedIntent.confidence >= 0.7) {
        this.logger.log(
          `App creation detected via unified LLM: ${unifiedIntent.appType} (${(unifiedIntent.confidence * 100).toFixed(0)}%) in ${Date.now() - startTime}ms`,
        );

        return {
          intent: {
            matched: true,
            confidence: unifiedIntent.confidence,
            pattern: {
              id: `llm-app-creation`,
              pattern: userMessage,
              category: 'app-creation',
              subCategory: unifiedIntent.appType || 'general',
              uiType: 'app-builder',
              serviceBackend: 'wants',
              endpoint: '/app-builder/generate',
              title: 'App Builder',
              description: 'Generate a custom application',
              icon: 'code',
              metadata: {
                appDescription: unifiedIntent.appDescription,
                appType: unifiedIntent.appType,
                appFeatures: unifiedIntent.appFeatures,
                appVariant: unifiedIntent.appVariant,
                appColors: unifiedIntent.appColors,
                classifiedByLLM: true,
              },
            },
            fallbackToAI: false,
          },
          userMessage,
          uiConfig: {
            type: 'app-builder',
            title: 'App Builder',
            description: unifiedIntent.appDescription || 'Generate a custom application',
            icon: 'code',
            serviceBackend: 'wants',
            endpoint: '/app-builder/generate',
            metadata: {
              appDescription: unifiedIntent.appDescription,
              appType: unifiedIntent.appType,
              appFeatures: unifiedIntent.appFeatures,
              appVariant: unifiedIntent.appVariant,
              appColors: unifiedIntent.appColors,
              classifiedByLLM: true,
            },
          },
        };
      }

      // Handle learning_productivity intent
      if (unifiedIntent.category === 'learning_productivity' && unifiedIntent.confidence >= 0.7) {
        const subType = unifiedIntent.learningSubType || 'tutoring';

        const learningConfig: Record<string, { title: string; description: string; icon: string; endpoint: string }> = {
          tutoring: {
            title: 'AI Tutor',
            description: 'Learn and understand concepts',
            icon: 'graduation-cap',
            endpoint: '/learning/tutor',
          },
          summarize: {
            title: 'Summarizer',
            description: 'Summarize documents and content',
            icon: 'file-text',
            endpoint: '/learning/summarize',
          },
          organize: {
            title: 'Life Planner',
            description: 'Plan schedules, goals, and projects',
            icon: 'calendar',
            endpoint: '/learning/plan',
          },
          writing: {
            title: 'Writing Assistant',
            description: 'Help with emails, essays, and reports',
            icon: 'pen-tool',
            endpoint: '/learning/write',
          },
        };

        const config = learningConfig[subType] || learningConfig.tutoring;

        this.logger.log(
          `Learning intent detected: ${subType} (${(unifiedIntent.confidence * 100).toFixed(0)}%) in ${Date.now() - startTime}ms`,
        );

        return {
          intent: {
            matched: true,
            confidence: unifiedIntent.confidence,
            pattern: {
              id: `llm-learning-${subType}`,
              pattern: userMessage,
              category: 'learning',
              subCategory: subType,
              uiType: 'chat', // Learning uses chat interface
              serviceBackend: 'wants',
              endpoint: config.endpoint,
              title: config.title,
              description: config.description,
              icon: config.icon,
              metadata: {
                learningSubType: subType,
                learningTopic: unifiedIntent.learningTopic,
                planType: unifiedIntent.planType,
                writingType: unifiedIntent.writingType,
                classifiedByLLM: true,
              },
            },
            fallbackToAI: false,
          },
          userMessage,
          uiConfig: {
            type: 'chat', // Learning features use chat interface
            title: config.title,
            description: config.description,
            icon: config.icon,
            serviceBackend: 'wants',
            endpoint: config.endpoint,
            metadata: {
              learningSubType: subType,
              learningTopic: unifiedIntent.learningTopic,
              planType: unifiedIntent.planType,
              writingType: unifiedIntent.writingType,
              contentToProcess: unifiedIntent.contentToProcess,
              classifiedByLLM: true,
            },
          },
        };
      }

      // Handle contextual_ui intent - use toolQuery for vector search
      const vectorSearchQuery = unifiedIntent.category === 'contextual_ui' && unifiedIntent.toolQuery
        ? unifiedIntent.toolQuery
        : userMessage;

      // ============================================
      // STEP 2: Vector search for tool patterns (563 tools)
      // Uses toolQuery from unified classifier for better matching
      // ============================================
      this.logger.log(`Intent detection: qdrant=${this.qdrantService.isConfigured()}, ai=${this.aiService.isConfigured()}, initialized=${this.initialized}, query="${vectorSearchQuery.substring(0, 50)}..."`);

      if (this.qdrantService.isConfigured() && this.aiService.isConfigured()) {
        const embedding = await this.aiService.generateEmbedding(vectorSearchQuery);
        this.logger.log(`Embedding generated, searching with threshold=${CONFIDENCE_THRESHOLD}`);

        const results = await this.qdrantService.searchVectors(
          COLLECTION_NAME,
          embedding,
          5,
          CONFIDENCE_THRESHOLD,
        );

        this.logger.log(`Search returned ${results.length} results`);

        if (results.length > 0) {
          const topMatch = results[0];
          const pattern = topMatch.payload as IntentPattern;

          // Skip web-action patterns from vector search (we use LLM for those now)
          if (pattern.uiType === 'web-action') {
            this.logger.log('Skipping vector-matched web-action pattern - LLM classification takes precedence');
          } else {
            this.logger.log(
              `Intent matched: "${pattern.pattern}" (score: ${topMatch.score.toFixed(3)}, uiType: ${pattern.uiType}) in ${Date.now() - startTime}ms`,
            );

            return {
              intent: {
                matched: true,
                confidence: topMatch.score,
                pattern,
                fallbackToAI: false,
              },
              userMessage,
              uiConfig: {
                type: pattern.uiType,
                toolId: pattern.metadata?.toolId as string,  // Extract toolId from metadata
                title: pattern.title,
                description: pattern.description,
                icon: pattern.icon,
                serviceBackend: pattern.serviceBackend,
                endpoint: pattern.endpoint,
                metadata: pattern.metadata,
              },
            };
          }
        }
      }

      // No match found - fallback to AI
      this.logger.log(`No intent match for "${userMessage.substring(0, 50)}..." - using AI fallback`);

      return {
        intent: {
          matched: false,
          confidence: 0,
          fallbackToAI: true,
        },
        userMessage,
        uiConfig: {
          type: 'chat',
          title: 'AI Assistant',
          description: 'General AI response',
          serviceBackend: 'openai',
        },
      };
    } catch (error) {
      this.logger.error('Intent detection failed:', error.message);
      return {
        intent: {
          matched: false,
          confidence: 0,
          fallbackToAI: true,
        },
        userMessage,
        uiConfig: {
          type: 'chat',
          title: 'AI Assistant',
          description: 'General AI response',
          serviceBackend: 'openai',
        },
      };
    }
  }

  // ============================================
  // Pattern Management
  // ============================================

  async addPattern(pattern: IntentPattern): Promise<boolean> {
    if (!this.qdrantService.isConfigured() || !this.aiService.isConfigured()) {
      this.logger.warn('Services not configured');
      return false;
    }

    try {
      const embedding = await this.aiService.generateEmbedding(pattern.pattern);

      await this.qdrantService.upsertVectors(COLLECTION_NAME, [
        {
          id: pattern.id,
          vector: embedding,
          payload: pattern,
        },
      ]);

      this.logger.debug(`Added pattern: ${pattern.id} - "${pattern.pattern}"`);
      return true;
    } catch (error) {
      this.logger.error('Failed to add pattern:', error.message);
      return false;
    }
  }

  async addPatterns(patterns: IntentPattern[]): Promise<{ success: number; failed: number }> {
    if (!this.qdrantService.isConfigured() || !this.aiService.isConfigured()) {
      return { success: 0, failed: patterns.length };
    }

    let success = 0;
    let failed = 0;

    // Process in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < patterns.length; i += batchSize) {
      const batch = patterns.slice(i, i + batchSize);

      try {
        // Generate embeddings for batch
        const embeddings = await this.aiService.generateEmbeddings(
          batch.map((p) => p.pattern),
        );

        // Prepare documents
        const documents = batch.map((pattern, idx) => ({
          id: pattern.id,
          vector: embeddings[idx],
          payload: pattern,
        }));

        await this.qdrantService.upsertVectors(COLLECTION_NAME, documents);
        success += batch.length;

        this.logger.log(`Seeded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(patterns.length / batchSize)} (${success} patterns)`);
      } catch (error) {
        this.logger.error(`Failed to seed batch:`, error.message);
        failed += batch.length;
      }

      // Small delay to avoid rate limits
      if (i + batchSize < patterns.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return { success, failed };
  }

  async deletePattern(id: string): Promise<boolean> {
    if (!this.qdrantService.isConfigured()) {
      return false;
    }

    return this.qdrantService.deleteVector(COLLECTION_NAME, id);
  }

  async getPatternCount(): Promise<number> {
    if (!this.qdrantService.isConfigured()) {
      return 0;
    }

    return this.qdrantService.countVectors(COLLECTION_NAME);
  }

  async getPatternsByCategory(category: string): Promise<IntentPattern[]> {
    if (!this.qdrantService.isConfigured()) {
      return [];
    }

    // Note: This is a simple implementation. For production,
    // you might want to use scroll with filter instead.
    const results = await this.qdrantService.searchVectors(
      COLLECTION_NAME,
      new Array(VECTOR_SIZE).fill(0), // Dummy vector
      100,
      0,
      { category },
    );

    return results.map((r) => r.payload as IntentPattern);
  }

  async clearAllPatterns(): Promise<boolean> {
    if (!this.qdrantService.isConfigured()) {
      return false;
    }

    try {
      await this.qdrantService.deleteCollection(COLLECTION_NAME);
      await this.qdrantService.createCollection(COLLECTION_NAME, VECTOR_SIZE, 'Cosine');
      this.logger.log('Cleared all intent patterns');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear patterns:', error.message);
      return false;
    }
  }

  // ============================================
  // Health Check
  // ============================================

  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    qdrant: boolean;
    ai: boolean;
    patternCount: number;
  }> {
    const qdrant = this.qdrantService.isConfigured();
    const ai = this.aiService.isConfigured();
    const patternCount = await this.getPatternCount();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!qdrant || !ai) {
      status = 'degraded';
    }
    if (!ai) {
      status = 'unhealthy';
    }

    return { status, qdrant, ai, patternCount };
  }
}
