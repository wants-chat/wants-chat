# Deep Research & Autonomous Task Execution
## Complete Implementation Plan

**Stack:** NestJS, TypeScript, PostgreSQL, Qdrant, Redis, BullMQ
**Core Frameworks:** LangGraph.js, Vercel AI SDK, Stagehand
**Design:** Production-grade, scalable, built from scratch

---

# Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Framework Stack](#2-core-framework-stack)
3. [BullMQ Queue Architecture](#3-bullmq-queue-architecture)
4. [Deep Research System](#4-deep-research-system)
5. [Autonomous Task Execution System](#5-autonomous-task-execution-system)
6. [Domain Configurations](#6-domain-configurations)
7. [Database Schema](#7-database-schema)
8. [Qdrant Collections](#8-qdrant-collections)
9. [Module Structure](#9-module-structure)
10. [API & WebSocket Contracts](#10-api--websocket-contracts)
11. [Implementation Phases](#11-implementation-phases)
12. [Package Dependencies](#12-package-dependencies)
13. [Environment Variables](#13-environment-variables)

---

# 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                       │
│                         WebSocket + REST API Connections                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   API LAYER                                          │
│                                                                                      │
│   NestJS Controllers              NestJS WebSocket Gateway                           │
│   • POST /research/start          • research:* events                                │
│   • POST /tasks/create            • task:* events                                    │
│   • GET /research/:id             • browser:* events                                 │
│   • GET /tasks/:id                • Real-time streaming                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            ORCHESTRATION LAYER                                       │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           LangGraph.js Workflows                               │  │
│  │                                                                                │  │
│  │   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐     │  │
│  │   │   Research Graph   │  │   Browser Graph    │  │  Task Exec Graph   │     │  │
│  │   │                    │  │                    │  │                    │     │  │
│  │   │ • Multi-node flow  │  │ • Observe-Act loop │  │ • DAG execution    │     │  │
│  │   │ • Conditional      │  │ • Vision + action  │  │ • Multi-agent      │     │  │
│  │   │   branching        │  │ • Error recovery   │  │   coordination     │     │  │
│  │   │ • Cycles for       │  │ • Screenshot       │  │ • Step deps        │     │  │
│  │   │   refinement       │  │   capture          │  │                    │     │  │
│  │   └────────────────────┘  └────────────────────┘  └────────────────────┘     │  │
│  │                                                                                │  │
│  │   Features:                                                                    │  │
│  │   • State persistence via PostgreSQL Checkpointer                             │  │
│  │   • Resume from any node after failure                                        │  │
│  │   • Human-in-the-loop interrupt points                                        │  │
│  │   • Native streaming for real-time updates                                    │  │
│  │   • Conditional edges for dynamic routing                                     │  │
│  │   • Cycles for iterative refinement                                           │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          ▼                             ▼                             ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│   QUEUE LAYER     │       │    TOOL LAYER     │       │   AGENT LAYER     │
│                   │       │                   │       │                   │
│   BullMQ + Redis  │       │  Vercel AI SDK    │       │   Stagehand       │
│                   │       │                   │       │                   │
│ • research:*      │       │ • streamText()    │       │ • AI browser      │
│ • browser:*       │       │ • generateObject()│       │ • Vision-based    │
│ • tasks:*         │       │ • Tool calling    │       │ • Natural lang    │
│ • documents:*     │       │ • Multi-model     │       │   actions         │
│                   │       │                   │       │ • Self-healing    │
│ Features:         │       │ Search Tools:     │       │                   │
│ • Job progress    │       │ • Tavily          │       │ Extraction:       │
│ • Priority queues │       │ • Exa             │       │ • Jina Reader     │
│ • Rate limiting   │       │ • Brave           │       │ • Firecrawl       │
│ • Retries         │       │                   │       │ • Readability     │
│ • Scheduling      │       │ Doc Generation:   │       │                   │
│ • Dependencies    │       │ • docx            │       │                   │
│                   │       │ • pptxgenjs       │       │                   │
│                   │       │ • pdf-lib         │       │                   │
└───────────────────┘       └───────────────────┘       └───────────────────┘
          │                             │                             │
          └─────────────────────────────┼─────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PERSISTENCE LAYER                                       │
│                                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │   PostgreSQL    │  │     Redis       │  │     Qdrant      │  │  File Storage │  │
│  │                 │  │                 │  │                 │  │   (S3/R2)     │  │
│  │ • Research      │  │ • BullMQ jobs   │  │ • Research      │  │               │  │
│  │   sessions      │  │ • Cache         │  │   embeddings    │  │ • Documents   │  │
│  │ • Task records  │  │ • Rate limits   │  │ • Domain        │  │ • Screenshots │  │
│  │ • LangGraph     │  │ • Sessions      │  │   knowledge     │  │ • Artifacts   │  │
│  │   checkpoints   │  │ • Locks         │  │ • Semantic      │  │               │  │
│  │ • Audit logs    │  │                 │  │   search        │  │               │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └───────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Core Framework Stack

## 2.1 LangGraph.js — Workflow Orchestration (CRITICAL)

**Why LangGraph is essential:**

LangGraph provides stateful, multi-step workflow orchestration that would take months to build correctly from scratch. It handles:

| Capability | Without LangGraph | With LangGraph |
|------------|-------------------|----------------|
| State management | Custom implementation | Built-in channels with reducers |
| Checkpointing | Manual DB saves | PostgreSQL/Redis checkpointer |
| Error recovery | Custom retry logic | Resume from last checkpoint |
| Conditional flow | if/else spaghetti | Declarative conditional edges |
| Loops/cycles | Manual state tracking | First-class cycle support |
| Human approval | Custom pause/resume | Built-in interrupt points |
| Streaming | Custom WebSocket logic | Native `.stream()` method |

**LangGraph Pattern for Research:**

```typescript
import { StateGraph, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

// Define state channels - these persist across nodes
interface ResearchState {
  query: string;
  domain: string | null;
  plan: ResearchPlan | null;
  subQueries: string[];
  sources: Source[];
  findings: Finding[];
  synthesis: string | null;
  factCheckResults: FactCheckResult[];
  outputFormats: OutputFormat[];
  iteration: number;
  maxIterations: number;
}

// Create the graph
const researchGraph = new StateGraph<ResearchState>({
  channels: {
    query: { value: null },
    domain: { value: null },
    plan: { value: null },
    subQueries: { value: [] },
    sources: { 
      value: [],
      reducer: (existing, new) => [...existing, ...new]  // Accumulate sources
    },
    findings: {
      value: [],
      reducer: (existing, new) => [...existing, ...new]  // Accumulate findings
    },
    synthesis: { value: null },
    factCheckResults: { value: [] },
    outputFormats: { value: ['markdown'] },
    iteration: { value: 0 },
    maxIterations: { value: 3 }
  }
})
  // Add nodes (each is an async function)
  .addNode('analyzeQuery', analyzeQueryNode)
  .addNode('createPlan', createPlanNode)
  .addNode('executeSearches', executeSearchesNode)
  .addNode('extractContent', extractContentNode)
  .addNode('analyzeFindings', analyzeFindingsNode)
  .addNode('synthesize', synthesizeNode)
  .addNode('factCheck', factCheckNode)
  .addNode('generateOutputs', generateOutputsNode)
  
  // Define edges (flow between nodes)
  .addEdge('analyzeQuery', 'createPlan')
  .addEdge('createPlan', 'executeSearches')
  .addEdge('executeSearches', 'extractContent')
  .addEdge('extractContent', 'analyzeFindings')
  
  // Conditional edge: need more research or ready to synthesize?
  .addConditionalEdges('analyzeFindings', decideAfterAnalysis, {
    'need_more_sources': 'executeSearches',  // Loop back
    'ready_to_synthesize': 'synthesize'
  })
  
  .addEdge('synthesize', 'factCheck')
  
  // Conditional edge: facts verified or need revision?
  .addConditionalEdges('factCheck', decideAfterFactCheck, {
    'needs_revision': 'synthesize',  // Loop back to fix
    'verified': 'generateOutputs'
  })
  
  .addEdge('generateOutputs', END);

// Compile with PostgreSQL checkpointer for persistence
const checkpointer = new PostgresSaver(connectionString);
const compiledGraph = researchGraph.compile({ checkpointer });

// Execute with streaming
async function runResearch(query: string, sessionId: string) {
  const config = { configurable: { thread_id: sessionId } };
  
  for await (const event of compiledGraph.stream(
    { query, maxIterations: 3 },
    config
  )) {
    // Each event contains the updated state and node that ran
    emitProgress(sessionId, event);
  }
}
```

**LangGraph Pattern for Browser Automation:**

```typescript
// Browser automation needs an observe-act-decide loop
const browserGraph = new StateGraph<BrowserState>({
  channels: {
    goal: { value: null },
    currentUrl: { value: null },
    pageState: { value: null },
    actions: { value: [], reducer: (a, b) => [...a, ...b] },
    screenshots: { value: [], reducer: (a, b) => [...a, ...b] },
    extractedData: { value: null },
    completed: { value: false },
    error: { value: null }
  }
})
  .addNode('observe', observePageNode)      // Analyze current page state
  .addNode('decide', decideNextActionNode)  // LLM decides what to do
  .addNode('act', executeActionNode)        // Stagehand performs action
  .addNode('extract', extractDataNode)      // Get data from page
  .addNode('complete', completeTaskNode)    // Finalize results
  
  .addEdge('observe', 'decide')
  
  .addConditionalEdges('decide', routeFromDecision, {
    'perform_action': 'act',
    'extract_data': 'extract',
    'task_complete': 'complete',
    'task_failed': END
  })
  
  .addEdge('act', 'observe')      // After acting, observe again
  .addEdge('extract', 'observe')  // After extracting, observe again
  .addEdge('complete', END);
```

## 2.2 Vercel AI SDK — LLM Interactions

**Why Vercel AI SDK:**

- Unified API across Claude, GPT-4, Gemini, Llama, etc.
- Native streaming with proper backpressure
- Tool/function calling with automatic schema validation
- Structured output generation with Zod
- Multi-step agent execution with `maxSteps`

**Key Patterns:**

```typescript
import { generateText, streamText, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// 1. Streaming responses with tools
const result = await streamText({
  model: anthropic('claude-sonnet-4-20250514'),
  system: 'You are a research assistant...',
  messages: conversationHistory,
  tools: {
    webSearch: {
      description: 'Search the web for information',
      parameters: z.object({
        query: z.string(),
        maxResults: z.number().default(10)
      }),
      execute: async ({ query, maxResults }) => {
        return await tavilySearch(query, maxResults);
      }
    },
    extractContent: {
      description: 'Extract content from a URL',
      parameters: z.object({
        url: z.string().url()
      }),
      execute: async ({ url }) => {
        return await jinaReader(url);
      }
    }
  },
  maxSteps: 10,  // Allow up to 10 tool calls
  onStepFinish: async (step) => {
    // Emit progress after each step
    await emitStepProgress(step);
  }
});

// Stream to client
for await (const chunk of result.textStream) {
  socket.emit('research:chunk', { text: chunk });
}

// 2. Structured output generation
const researchPlan = await generateObject({
  model: anthropic('claude-sonnet-4-20250514'),
  schema: z.object({
    domain: z.string(),
    subQueries: z.array(z.object({
      query: z.string(),
      purpose: z.string(),
      priority: z.number().min(1).max(5)
    })),
    searchStrategy: z.enum(['broad', 'deep', 'comparative']),
    estimatedSources: z.number(),
    outputRecommendation: z.array(z.enum(['markdown', 'pdf', 'docx', 'pptx']))
  }),
  prompt: `Create a research plan for: "${query}"\nDepth: ${depth}`
});

// 3. Multi-model fallback
async function generateWithFallback(prompt: string) {
  try {
    return await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt
    });
  } catch (error) {
    // Fallback to GPT-4 if Claude fails
    return await generateText({
      model: openai('gpt-4-turbo'),
      prompt
    });
  }
}
```

## 2.3 Stagehand — AI-Native Browser Automation

**Why Stagehand over raw Playwright:**

| Playwright (Traditional) | Stagehand (AI-Native) |
|--------------------------|----------------------|
| `page.click('#submit-btn')` | `page.act('click the submit button')` |
| Requires exact selectors | Uses vision + LLM to find elements |
| Breaks when UI changes | Self-healing automation |
| You write step-by-step | Describe the goal, AI figures out how |
| Manual element inspection | Automatic page understanding |
| Script maintenance burden | Natural language instructions |

**Stagehand Usage Patterns:**

```typescript
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

// Initialize Stagehand
const stagehand = new Stagehand({
  env: 'LOCAL',  // Uses local Playwright
  modelName: 'claude-sonnet-4-20250514',
  modelClientOptions: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  enableCaching: true,  // Cache element locations
  verbose: 1  // Logging level
});

await stagehand.init();
const page = stagehand.page;

// 1. Natural language navigation and actions
await stagehand.act('go to amazon.com');
await stagehand.act('search for "mechanical keyboard"');
await stagehand.act('filter by 4 stars and above');
await stagehand.act('sort by price low to high');
await stagehand.act('click on the third result');

// 2. Structured data extraction
const productData = await stagehand.extract({
  instruction: 'Extract the product details from this page',
  schema: z.object({
    title: z.string(),
    price: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    features: z.array(z.string()),
    availability: z.string()
  })
});

// 3. Observe page state (for decision making)
const pageElements = await stagehand.observe({
  instruction: 'Find all clickable navigation elements'
});
// Returns: [{ element: 'Home link', selector: '...', description: '...' }, ...]

// 4. Complex multi-step workflows
async function fillContactForm(formData: ContactFormData) {
  await stagehand.act(`fill in the name field with "${formData.name}"`);
  await stagehand.act(`fill in the email field with "${formData.email}"`);
  await stagehand.act(`select "${formData.subject}" from the subject dropdown`);
  await stagehand.act(`type the message: "${formData.message}"`);
  await stagehand.act('click the submit button');
  
  // Wait and verify
  await stagehand.act('wait for confirmation message');
  
  const result = await stagehand.extract({
    instruction: 'Extract the confirmation message or error',
    schema: z.object({
      success: z.boolean(),
      message: z.string()
    })
  });
  
  return result;
}

// 5. Screenshot capture
const screenshot = await page.screenshot({ fullPage: true });
const elementScreenshot = await stagehand.act('take a screenshot of the product image');

// 6. Handle dynamic content
await stagehand.act('scroll down until you see the reviews section');
await stagehand.act('click "Load more reviews" until there are at least 20 reviews visible');

// 7. For research: Extract article content from JS-heavy sites
async function extractFromJSSite(url: string) {
  await stagehand.act(`navigate to ${url}`);
  await stagehand.act('wait for the main content to load');
  await stagehand.act('close any popups or cookie banners');
  await stagehand.act('scroll through the entire article to load lazy content');
  
  const content = await stagehand.extract({
    instruction: 'Extract the full article including title, author, date, and body text',
    schema: z.object({
      title: z.string(),
      author: z.string().optional(),
      publishedDate: z.string().optional(),
      content: z.string(),
      images: z.array(z.object({
        url: z.string(),
        caption: z.string().optional()
      })).optional()
    })
  });
  
  return content;
}
```

**Stagehand in LangGraph Node:**

```typescript
// Browser action node using Stagehand
async function executeActionNode(state: BrowserState): Promise<Partial<BrowserState>> {
  const { goal, currentAction, stagehand } = state;
  
  try {
    // Execute the decided action using natural language
    await stagehand.act(currentAction.instruction);
    
    // Take screenshot after action
    const screenshot = await stagehand.page.screenshot();
    
    // Observe new page state
    const newPageState = await stagehand.observe({
      instruction: 'Describe the current state of the page'
    });
    
    return {
      actions: [{ ...currentAction, success: true, timestamp: new Date() }],
      screenshots: [{ data: screenshot, action: currentAction.instruction }],
      pageState: newPageState,
      currentUrl: stagehand.page.url()
    };
  } catch (error) {
    return {
      actions: [{ ...currentAction, success: false, error: error.message }],
      error: error.message
    };
  }
}
```

---

# 3. BullMQ Queue Architecture

## 3.1 Queue Definitions

```typescript
// src/queues/queue.constants.ts

export const QUEUES = {
  // Research queues
  RESEARCH: {
    INTERACTIVE: 'research:interactive',    // User waiting, real-time
    BACKGROUND: 'research:background',      // Scheduled, batch
    EXTRACTION: 'research:extraction',      // Content extraction jobs
  },
  
  // Browser automation queues
  BROWSER: {
    TASKS: 'browser:tasks',                 // Browser automation jobs
    SCREENSHOTS: 'browser:screenshots',     // Screenshot capture
  },
  
  // General task queues
  TASKS: {
    EXECUTION: 'tasks:execution',           // Task orchestration
    STEPS: 'tasks:steps',                   // Individual step execution
  },
  
  // Document generation
  DOCUMENTS: {
    GENERATION: 'documents:generation',     // PDF, DOCX, PPTX creation
  },
  
  // Data processing
  DATA: {
    ANALYSIS: 'data:analysis',              // Data analysis jobs
    TRANSFORMATION: 'data:transformation',  // Data transformation
  }
};

export const QUEUE_OPTIONS = {
  [QUEUES.RESEARCH.INTERACTIVE]: {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 86400 }
    },
    settings: {
      stalledInterval: 30000,
      maxStalledCount: 2
    }
  },
  
  [QUEUES.RESEARCH.BACKGROUND]: {
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { age: 86400, count: 1000 },
      removeOnFail: { age: 604800 }  // Keep failed for 7 days
    }
  },
  
  [QUEUES.BROWSER.TASKS]: {
    defaultJobOptions: {
      attempts: 2,
      timeout: 300000,  // 5 minute timeout
      removeOnComplete: { age: 1800 }
    },
    limiter: {
      max: 10,         // Max 10 concurrent browser sessions
      duration: 1000
    }
  },
  
  [QUEUES.DOCUMENTS.GENERATION]: {
    defaultJobOptions: {
      attempts: 3,
      timeout: 120000,  // 2 minute timeout
      priority: 3       // Medium priority
    }
  }
};
```

## 3.2 Queue Service

```typescript
// src/queues/queue.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

@Injectable()
export class QueueService implements OnModuleInit {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null  // Required for BullMQ
    });
  }

  async onModuleInit() {
    // Initialize all queues
    for (const [name, options] of Object.entries(QUEUE_OPTIONS)) {
      await this.createQueue(name, options);
    }
  }

  private async createQueue(name: string, options: any) {
    const queue = new Queue(name, {
      connection: this.redis,
      ...options
    });
    
    const queueEvents = new QueueEvents(name, {
      connection: this.redis.duplicate()
    });
    
    this.queues.set(name, queue);
    this.queueEvents.set(name, queueEvents);
    
    // Set up event listeners
    queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.onJobCompleted(name, jobId, returnvalue);
    });
    
    queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.onJobFailed(name, jobId, failedReason);
    });
    
    queueEvents.on('progress', ({ jobId, data }) => {
      this.onJobProgress(name, jobId, data);
    });
  }

  async addJob<T>(
    queueName: string, 
    data: T, 
    options?: {
      jobId?: string;
      priority?: number;
      delay?: number;
      repeat?: { pattern: string };
    }
  ): Promise<Job<T>> {
    const queue = this.queues.get(queueName);
    if (!queue) throw new Error(`Queue ${queueName} not found`);
    
    return queue.add(queueName, data, options);
  }

  async getJob(queueName: string, jobId: string): Promise<Job | null> {
    const queue = this.queues.get(queueName);
    if (!queue) return null;
    return queue.getJob(jobId);
  }

  async getJobProgress(queueName: string, jobId: string): Promise<number | object> {
    const job = await this.getJob(queueName, jobId);
    return job?.progress || 0;
  }

  registerWorker(
    queueName: string,
    processor: (job: Job) => Promise<any>,
    options?: { concurrency?: number }
  ) {
    const worker = new Worker(queueName, processor, {
      connection: this.redis.duplicate(),
      concurrency: options?.concurrency || 5
    });
    
    worker.on('error', (err) => {
      console.error(`Worker error for ${queueName}:`, err);
    });
    
    this.workers.set(queueName, worker);
    return worker;
  }

  private onJobCompleted(queueName: string, jobId: string, result: any) {
    // Emit via WebSocket gateway
    this.eventEmitter.emit('job:completed', { queueName, jobId, result });
  }

  private onJobFailed(queueName: string, jobId: string, reason: string) {
    this.eventEmitter.emit('job:failed', { queueName, jobId, reason });
  }

  private onJobProgress(queueName: string, jobId: string, progress: any) {
    this.eventEmitter.emit('job:progress', { queueName, jobId, progress });
  }
}
```

## 3.3 Rate Limiting & Concurrency

```typescript
// Rate limiting configuration for different operations

export const RATE_LIMITS = {
  // Search API rate limits
  TAVILY: { max: 100, duration: 60000 },      // 100/minute
  EXA: { max: 60, duration: 60000 },          // 60/minute
  BRAVE: { max: 50, duration: 60000 },        // 50/minute
  
  // Extraction rate limits (per domain)
  EXTRACTION: { max: 10, duration: 1000 },    // 10/second per domain
  
  // Browser sessions
  BROWSER: { max: 10, duration: 1000 },       // Max 10 concurrent
  
  // Document generation
  DOCUMENTS: { max: 20, duration: 60000 },    // 20/minute
  
  // Per-user limits
  USER_RESEARCH: { max: 10, duration: 3600000 },  // 10 research/hour
  USER_BROWSER: { max: 20, duration: 3600000 },   // 20 browser tasks/hour
};

// Concurrency settings
export const CONCURRENCY = {
  RESEARCH_INTERACTIVE: 10,  // 10 concurrent interactive research jobs
  RESEARCH_BACKGROUND: 20,   // 20 concurrent background jobs
  BROWSER_TASKS: 5,          // 5 concurrent browser sessions per worker
  EXTRACTION: 20,            // 20 concurrent extractions
  DOCUMENT_GEN: 10,          // 10 concurrent doc generations
};
```

## 3.4 Job Priority System

```typescript
// Priority levels (lower number = higher priority)
export const PRIORITIES = {
  CRITICAL: 1,      // System-critical, immediate
  HIGH: 2,          // User waiting, interactive
  NORMAL: 3,        // Standard processing
  LOW: 4,           // Background, can wait
  BATCH: 5,         // Batch processing, lowest priority
};

// Priority assignment logic
function assignPriority(jobType: string, context: JobContext): number {
  // Interactive research (user waiting)
  if (jobType === 'research' && context.interactive) {
    return PRIORITIES.HIGH;
  }
  
  // Scheduled/background research
  if (jobType === 'research' && !context.interactive) {
    return PRIORITIES.LOW;
  }
  
  // Browser automation (usually interactive)
  if (jobType === 'browser') {
    return context.interactive ? PRIORITIES.HIGH : PRIORITIES.NORMAL;
  }
  
  // Document generation
  if (jobType === 'document') {
    return PRIORITIES.NORMAL;
  }
  
  return PRIORITIES.NORMAL;
}
```

## 3.5 Scaling Configuration

```typescript
// Scaling thresholds and configuration

export const SCALING_CONFIG = {
  // When to scale up workers
  SCALE_UP_THRESHOLD: {
    WAITING_JOBS: 100,        // Scale up when > 100 jobs waiting
    WAIT_TIME_MS: 30000,      // Or when avg wait > 30 seconds
  },
  
  // Worker pool sizes
  WORKER_POOLS: {
    MIN_WORKERS: 2,
    MAX_WORKERS: 20,
    WORKERS_PER_QUEUE: {
      [QUEUES.RESEARCH.INTERACTIVE]: { min: 2, max: 10 },
      [QUEUES.RESEARCH.BACKGROUND]: { min: 1, max: 5 },
      [QUEUES.BROWSER.TASKS]: { min: 2, max: 8 },
      [QUEUES.DOCUMENTS.GENERATION]: { min: 1, max: 5 },
    }
  },
  
  // Redis cluster configuration (for massive scale)
  REDIS_CLUSTER: {
    ENABLE_CLUSTER: process.env.REDIS_CLUSTER === 'true',
    NODES: process.env.REDIS_CLUSTER_NODES?.split(',') || [],
  }
};
```

---

# 4. Deep Research System

## 4.1 Research Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER REQUEST                                │
│        "Research the impact of AI on healthcare in 2024"        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. QUERY ANALYSIS                             │
│                                                                  │
│  Input: Raw query                                                │
│  Output:                                                         │
│  • Detected domain: "medical/healthcare"                         │
│  • Key entities: ["AI", "healthcare", "2024"]                   │
│  • Query type: "impact analysis"                                │
│  • Time scope: "2024"                                           │
│  • Depth recommendation: "deep" (complex topic)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. RESEARCH PLANNING                          │
│                                                                  │
│  Input: Analyzed query + domain config                          │
│  Output:                                                         │
│  • Sub-queries:                                                  │
│    1. "AI diagnostic tools healthcare 2024 adoption"            │
│    2. "machine learning medical imaging accuracy studies"       │
│    3. "AI drug discovery breakthroughs 2024"                    │
│    4. "healthcare AI regulations FDA 2024"                      │
│    5. "AI patient outcomes clinical trials results"             │
│  • Search strategy: "deep" (8 sources per sub-query)            │
│  • Preferred sources: PubMed, NIH, medical journals             │
│  • Required: peer-reviewed sources, recent (2023-2024)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 3. PARALLEL SEARCH EXECUTION                     │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Tavily    │  │    Exa      │  │   Domain    │             │
│  │   Search    │  │  Semantic   │  │    APIs     │             │
│  │             │  │   Search    │  │  (PubMed)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │               │               │                       │
│         └───────────────┴───────────────┘                       │
│                         │                                        │
│                         ▼                                        │
│              Deduplicate & Rank Results                          │
│              Select top sources per sub-query                    │
│              Total: ~40 unique sources                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 4. CONTENT EXTRACTION                            │
│                                                                  │
│  For each source (parallel, rate-limited):                      │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Jina Reader │  │  Firecrawl  │  │  Stagehand  │             │
│  │  (articles) │  │  (JS-heavy) │  │ (complex)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  Output per source:                                              │
│  • Full text content                                             │
│  • Metadata (author, date, publication)                         │
│  • Relevance score                                               │
│  • Content chunks (for embedding)                                │
│                                                                  │
│  Store in PostgreSQL + Index in Qdrant                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. FINDINGS ANALYSIS                          │
│                                                                  │
│  Using Vercel AI SDK with Claude:                               │
│                                                                  │
│  Extract from each source:                                       │
│  • Key facts and statistics                                      │
│  • Claims with evidence                                          │
│  • Relevant quotes                                               │
│  • Methodology (for studies)                                     │
│                                                                  │
│  Cross-reference:                                                │
│  • Find corroborating sources                                    │
│  • Identify contradictions                                       │
│  • Note consensus vs disputed claims                             │
│                                                                  │
│  Gap analysis:                                                   │
│  • Are all sub-queries answered?                                │
│  • Missing perspectives?                                         │
│  • Need more recent sources?                                     │
│                                                                  │
│  Decision: READY or NEED_MORE_RESEARCH                          │
│           (if need more, loop back to step 3)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. SYNTHESIS                                  │
│                                                                  │
│  Generate comprehensive report:                                  │
│                                                                  │
│  Structure:                                                      │
│  • Executive Summary                                             │
│  • Key Findings (organized by theme)                            │
│  • Detailed Analysis                                             │
│  • Data & Statistics                                             │
│  • Limitations & Caveats                                         │
│  • Conclusions                                                   │
│  • References (properly cited)                                   │
│                                                                  │
│  Apply domain-specific:                                          │
│  • Medical disclaimers                                           │
│  • Terminology                                                   │
│  • Citation format (APA for medical)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    7. FACT CHECKING                              │
│                                                                  │
│  Verify:                                                         │
│  • Statistics have sources                                       │
│  • Claims are supported                                          │
│  • No hallucinated content                                       │
│  • Dates and numbers are accurate                               │
│                                                                  │
│  Flag:                                                           │
│  • Disputed claims                                               │
│  • Single-source claims                                          │
│  • Outdated information                                          │
│                                                                  │
│  Decision: VERIFIED or NEEDS_REVISION                           │
│           (if needs revision, loop back to step 6)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    8. OUTPUT GENERATION                          │
│                                                                  │
│  Generate requested formats:                                     │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Markdown │  │   PDF    │  │   DOCX   │  │   PPTX   │       │
│  │ (always) │  │(optional)│  │(optional)│  │(optional)│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  Store outputs + Generate download URLs                          │
│  Stream final result to user                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2 Research Depth Levels

| Level | Sub-queries | Sources/Query | Total Sources | Est. Time | Use Case |
|-------|-------------|---------------|---------------|-----------|----------|
| **Quick** | 2-3 | 3-4 | 6-12 | 30-60s | Simple facts, quick answers |
| **Standard** | 4-5 | 5-6 | 20-30 | 2-4 min | General research questions |
| **Deep** | 6-8 | 8-10 | 48-80 | 5-10 min | Thorough analysis |
| **Exhaustive** | 10-15 | 10-15 | 100-225 | 15-30 min | Comprehensive reports, due diligence |

## 4.3 Search Tool Integration

### Tavily (Primary Search)

```typescript
// src/research/tools/search/tavily.tool.ts

import { TavilyClient } from 'tavily';

interface TavilySearchOptions {
  query: string;
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeAnswer?: boolean;
  includeRawContent?: boolean;
}

@Injectable()
export class TavilySearchTool {
  private client: TavilyClient;

  constructor() {
    this.client = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
  }

  async search(options: TavilySearchOptions): Promise<SearchResult[]> {
    const response = await this.client.search({
      query: options.query,
      search_depth: options.searchDepth || 'basic',
      max_results: options.maxResults || 10,
      include_domains: options.includeDomains,
      exclude_domains: options.excludeDomains,
      include_answer: options.includeAnswer,
      include_raw_content: options.includeRawContent
    });

    return response.results.map(r => ({
      url: r.url,
      title: r.title,
      snippet: r.content,
      rawContent: r.raw_content,
      score: r.score,
      source: 'tavily'
    }));
  }

  // As Vercel AI SDK tool
  asTool() {
    return {
      name: 'web_search',
      description: 'Search the web for current information on any topic',
      parameters: z.object({
        query: z.string().describe('Search query'),
        searchDepth: z.enum(['basic', 'advanced']).default('basic'),
        maxResults: z.number().min(1).max(20).default(10)
      }),
      execute: async ({ query, searchDepth, maxResults }) => {
        return this.search({ query, searchDepth, maxResults });
      }
    };
  }
}
```

### Exa (Semantic Search)

```typescript
// src/research/tools/search/exa.tool.ts

import Exa from 'exa-js';

interface ExaSearchOptions {
  query: string;
  type?: 'neural' | 'keyword' | 'auto';
  numResults?: number;
  includeDomains?: string[];
  startPublishedDate?: string;
  endPublishedDate?: string;
  useAutoprompt?: boolean;
}

@Injectable()
export class ExaSearchTool {
  private client: Exa;

  constructor() {
    this.client = new Exa(process.env.EXA_API_KEY);
  }

  async search(options: ExaSearchOptions): Promise<SearchResult[]> {
    const response = await this.client.searchAndContents(options.query, {
      type: options.type || 'auto',
      numResults: options.numResults || 10,
      includeDomains: options.includeDomains,
      startPublishedDate: options.startPublishedDate,
      endPublishedDate: options.endPublishedDate,
      useAutoprompt: options.useAutoprompt ?? true,
      text: { maxCharacters: 3000 }
    });

    return response.results.map(r => ({
      url: r.url,
      title: r.title,
      snippet: r.text,
      publishedDate: r.publishedDate,
      author: r.author,
      score: r.score,
      source: 'exa'
    }));
  }

  // Find similar content to a URL
  async findSimilar(url: string, numResults: number = 10): Promise<SearchResult[]> {
    const response = await this.client.findSimilarAndContents(url, {
      numResults,
      text: { maxCharacters: 3000 }
    });

    return response.results.map(r => ({
      url: r.url,
      title: r.title,
      snippet: r.text,
      score: r.score,
      source: 'exa'
    }));
  }
}
```

### Brave Search (Backup/Budget)

```typescript
// src/research/tools/search/brave.tool.ts

@Injectable()
export class BraveSearchTool {
  private apiKey: string;
  private baseUrl = 'https://api.search.brave.com/res/v1';

  constructor() {
    this.apiKey = process.env.BRAVE_SEARCH_API_KEY;
  }

  async search(query: string, options?: { count?: number; freshness?: string }): Promise<SearchResult[]> {
    const response = await fetch(
      `${this.baseUrl}/web/search?q=${encodeURIComponent(query)}&count=${options?.count || 10}`,
      {
        headers: {
          'X-Subscription-Token': this.apiKey,
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();

    return data.web.results.map(r => ({
      url: r.url,
      title: r.title,
      snippet: r.description,
      source: 'brave'
    }));
  }
}
```

## 4.4 Content Extraction

### Jina Reader (Articles)

```typescript
// src/research/tools/extraction/jina-reader.tool.ts

@Injectable()
export class JinaReaderTool {
  private baseUrl = 'https://r.jina.ai';

  async extract(url: string): Promise<ExtractedContent> {
    const response = await fetch(`${this.baseUrl}/${url}`, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown'
      }
    });

    const data = await response.json();

    return {
      url,
      title: data.title,
      content: data.content,
      markdown: data.markdown,
      metadata: {
        author: data.author,
        publishedDate: data.publishedDate,
        wordCount: data.content?.split(/\s+/).length || 0
      },
      extractionMethod: 'jina'
    };
  }

  // Batch extraction
  async extractBatch(urls: string[]): Promise<ExtractedContent[]> {
    return Promise.all(urls.map(url => this.extract(url)));
  }
}
```

### Firecrawl (JS-Heavy Sites)

```typescript
// src/research/tools/extraction/firecrawl.tool.ts

import FirecrawlApp from '@mendable/firecrawl-js';

@Injectable()
export class FirecrawlTool {
  private client: FirecrawlApp;

  constructor() {
    this.client = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
  }

  async scrape(url: string): Promise<ExtractedContent> {
    const result = await this.client.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true
    });

    return {
      url,
      title: result.metadata?.title,
      content: result.markdown,
      html: result.html,
      metadata: result.metadata,
      extractionMethod: 'firecrawl'
    };
  }

  // Crawl entire site
  async crawl(url: string, options?: { maxPages?: number }): Promise<ExtractedContent[]> {
    const result = await this.client.crawlUrl(url, {
      limit: options?.maxPages || 10,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true
      }
    });

    return result.data.map(page => ({
      url: page.metadata?.sourceURL,
      title: page.metadata?.title,
      content: page.markdown,
      metadata: page.metadata,
      extractionMethod: 'firecrawl'
    }));
  }
}
```

### Stagehand Extraction (Complex Sites)

```typescript
// src/research/tools/extraction/stagehand-extractor.tool.ts

@Injectable()
export class StagehandExtractorTool {
  private stagehand: Stagehand;

  async initialize() {
    this.stagehand = new Stagehand({
      env: 'LOCAL',
      modelName: 'claude-sonnet-4-20250514',
      modelClientOptions: {
        apiKey: process.env.ANTHROPIC_API_KEY
      }
    });
    await this.stagehand.init();
  }

  async extract(url: string, instructions?: string): Promise<ExtractedContent> {
    await this.stagehand.act(`navigate to ${url}`);
    await this.stagehand.act('wait for the page to fully load');
    await this.stagehand.act('close any popups, modals, or cookie banners');
    await this.stagehand.act('scroll through the page to load all content');

    const content = await this.stagehand.extract({
      instruction: instructions || 'Extract the main article content including title, author, date, and full text',
      schema: z.object({
        title: z.string(),
        author: z.string().optional(),
        publishedDate: z.string().optional(),
        content: z.string(),
        summary: z.string().optional()
      })
    });

    const screenshot = await this.stagehand.page.screenshot();

    return {
      url,
      title: content.title,
      content: content.content,
      metadata: {
        author: content.author,
        publishedDate: content.publishedDate
      },
      screenshot: screenshot.toString('base64'),
      extractionMethod: 'stagehand'
    };
  }

  async close() {
    await this.stagehand.close();
  }
}
```

## 4.5 Search Aggregator

```typescript
// src/research/services/search-aggregator.service.ts

@Injectable()
export class SearchAggregatorService {
  constructor(
    private tavily: TavilySearchTool,
    private exa: ExaSearchTool,
    private brave: BraveSearchTool,
    private domainConfig: DomainConfigService
  ) {}

  async search(
    queries: string[],
    domain: string,
    depth: ResearchDepth
  ): Promise<AggregatedSearchResults> {
    const config = this.domainConfig.getConfig(domain);
    const sourcesPerQuery = this.getSourcesPerQuery(depth);

    // Execute searches in parallel
    const allResults = await Promise.all(
      queries.map(async (query) => {
        const enhancedQuery = this.enhanceQuery(query, config);

        // Run multiple search engines in parallel
        const [tavilyResults, exaResults] = await Promise.all([
          this.tavily.search({
            query: enhancedQuery,
            searchDepth: depth === 'exhaustive' ? 'advanced' : 'basic',
            maxResults: sourcesPerQuery,
            includeDomains: config.preferredDomains,
            excludeDomains: config.blockedDomains
          }),
          this.exa.search({
            query: enhancedQuery,
            numResults: Math.ceil(sourcesPerQuery / 2),
            includeDomains: config.preferredDomains,
            startPublishedDate: config.dateRange?.from,
            endPublishedDate: config.dateRange?.to
          })
        ]);

        return { query, results: [...tavilyResults, ...exaResults] };
      })
    );

    // Deduplicate by URL
    const urlMap = new Map<string, SearchResult>();
    for (const { results } of allResults) {
      for (const result of results) {
        const existing = urlMap.get(result.url);
        if (!existing || result.score > existing.score) {
          urlMap.set(result.url, result);
        }
      }
    }

    // Sort by relevance score
    const deduped = Array.from(urlMap.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    // Apply domain preferences (boost authoritative sources)
    const ranked = this.applyDomainPreferences(deduped, config);

    return {
      results: ranked,
      totalFound: ranked.length,
      queriesExecuted: queries.length,
      searchEnginesUsed: ['tavily', 'exa']
    };
  }

  private getSourcesPerQuery(depth: ResearchDepth): number {
    const map = {
      quick: 4,
      standard: 6,
      deep: 10,
      exhaustive: 15
    };
    return map[depth];
  }

  private enhanceQuery(query: string, config: DomainConfig): string {
    // Add domain-specific modifiers
    const modifiers = config.searchModifiers || [];
    return `${query} ${modifiers.join(' ')}`.trim();
  }

  private applyDomainPreferences(
    results: SearchResult[],
    config: DomainConfig
  ): SearchResult[] {
    return results.map(result => {
      let boost = 0;

      // Boost preferred domains
      for (const domain of config.preferredDomains || []) {
        if (result.url.includes(domain)) {
          boost += 0.2;
          break;
        }
      }

      // Boost by source authority
      if (this.isAuthoritativeSource(result.url, config)) {
        boost += 0.3;
      }

      return {
        ...result,
        score: (result.score || 0.5) + boost
      };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private isAuthoritativeSource(url: string, config: DomainConfig): boolean {
    const authoritative = [
      '.gov', '.edu', 'nature.com', 'science.org', 'pubmed.ncbi.nlm.nih.gov',
      'arxiv.org', 'ieee.org', 'acm.org', 'springer.com', 'wiley.com',
      ...(config.authoritativeDomains || [])
    ];
    return authoritative.some(d => url.includes(d));
  }
}
```

---

# 5. Autonomous Task Execution System

## 5.1 Task Types & Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTONOMOUS TASK CATEGORIES                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  BROWSER AUTOMATION                                                          │   │
│  │                                                                              │   │
│  │  • Web scraping & data extraction                                           │   │
│  │  • Form filling & submission                                                │   │
│  │  • Multi-step web workflows                                                 │   │
│  │  • Screenshot capture & comparison                                          │   │
│  │  • Login & authenticated sessions                                           │   │
│  │  • E-commerce monitoring (prices, stock)                                    │   │
│  │  • Competitor monitoring                                                    │   │
│  │  • Social media automation                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  RESEARCH & ANALYSIS                                                         │   │
│  │                                                                              │   │
│  │  • Deep web research (covered in Section 4)                                 │   │
│  │  • Competitive analysis                                                     │   │
│  │  • Market research                                                          │   │
│  │  • Due diligence reports                                                    │   │
│  │  • News monitoring & summarization                                          │   │
│  │  • Trend analysis                                                           │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  DOCUMENT OPERATIONS                                                         │   │
│  │                                                                              │   │
│  │  • Report generation (PDF, DOCX)                                            │   │
│  │  • Presentation creation (PPTX)                                             │   │
│  │  • Template population                                                      │   │
│  │  • Document conversion                                                      │   │
│  │  • Batch document processing                                                │   │
│  │  • Contract/legal document analysis                                         │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  DATA OPERATIONS                                                             │   │
│  │                                                                              │   │
│  │  • Spreadsheet analysis (CSV, Excel)                                        │   │
│  │  • Data transformation & cleaning                                           │   │
│  │  • Chart & visualization generation                                         │   │
│  │  • Database queries (natural language to SQL)                               │   │
│  │  • Data aggregation & summarization                                         │   │
│  │  • Financial calculations                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  API & INTEGRATION                                                           │   │
│  │                                                                              │   │
│  │  • Multi-API orchestration                                                  │   │
│  │  • Data synchronization                                                     │   │
│  │  • Webhook handling                                                         │   │
│  │  • Third-party service automation                                           │   │
│  │  • CRM/ERP data operations                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  MONITORING & SCHEDULING                                                     │   │
│  │                                                                              │   │
│  │  • Price monitoring                                                         │   │
│  │  • Website change detection                                                 │   │
│  │  • Scheduled report generation                                              │   │
│  │  • Recurring data collection                                                │   │
│  │  • Alert-based triggers                                                     │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Task Execution Workflow

```
                              USER REQUEST
                      "Go to Hacker News, find the top 5
                       AI-related posts, summarize each,
                       and create a report"
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. TASK PARSING                               │
│                                                                  │
│  LLM analyzes request and extracts:                             │
│  • Task type: browser_automation + document_generation          │
│  • Steps required: navigate, extract, analyze, generate         │
│  • Complexity: medium                                            │
│  • Estimated time: 2-3 minutes                                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. TASK PLANNING                              │
│                                                                  │
│  Generate execution plan (DAG):                                 │
│                                                                  │
│  Step 1: Navigate to news.ycombinator.com                       │
│    └─► Agent: Browser (Stagehand)                               │
│                                                                  │
│  Step 2: Extract all story titles and links                     │
│    └─► Agent: Browser (Stagehand.extract)                       │
│    └─► Depends on: Step 1                                       │
│                                                                  │
│  Step 3: Filter for AI-related posts                            │
│    └─► Agent: LLM (classification)                              │
│    └─► Depends on: Step 2                                       │
│                                                                  │
│  Step 4: For each of top 5 AI posts (parallel):                 │
│    ├─► 4a: Navigate to post/article                             │
│    ├─► 4b: Extract full content                                 │
│    └─► 4c: Generate summary                                     │
│    └─► Depends on: Step 3                                       │
│                                                                  │
│  Step 5: Compile summaries into report                          │
│    └─► Agent: Document Generator                                │
│    └─► Depends on: Step 4                                       │
│                                                                  │
│  Step 6: Generate PDF/Markdown output                           │
│    └─► Depends on: Step 5                                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. EXECUTION (LangGraph)                      │
│                                                                  │
│  Execute steps respecting dependencies:                         │
│                                                                  │
│  [Step 1] ──► [Step 2] ──► [Step 3] ──┬──► [Step 4a] ──┐       │
│                                       ├──► [Step 4b] ──┼──► [5]──►[6]
│                                       ├──► [Step 4c] ──┤       │
│                                       ├──► [Step 4d] ──┤       │
│                                       └──► [Step 4e] ──┘       │
│                                                                  │
│  For each step:                                                  │
│  • Acquire resources (browser, API client)                      │
│  • Execute action                                                │
│  • Capture output + artifacts                                    │
│  • Update progress via WebSocket                                │
│  • Handle errors with retry                                      │
│  • Checkpoint state to PostgreSQL                               │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. COMPLETION                                 │
│                                                                  │
│  • Aggregate all step outputs                                    │
│  • Generate final deliverables                                   │
│  • Store artifacts (screenshots, documents)                     │
│  • Notify user via WebSocket                                    │
│  • Clean up resources (close browser)                           │
└─────────────────────────────────────────────────────────────────┘
```

## 5.3 Agent Definitions

### Browser Agent (Stagehand-based)

```typescript
// src/autonomous/agents/browser/browser-agent.service.ts

@Injectable()
export class BrowserAgentService {
  private browserPool: Map<string, Stagehand> = new Map();

  async acquireBrowser(sessionId: string): Promise<Stagehand> {
    if (this.browserPool.has(sessionId)) {
      return this.browserPool.get(sessionId);
    }

    const stagehand = new Stagehand({
      env: 'LOCAL',
      modelName: 'claude-sonnet-4-20250514',
      modelClientOptions: {
        apiKey: process.env.ANTHROPIC_API_KEY
      },
      enableCaching: true
    });

    await stagehand.init();
    this.browserPool.set(sessionId, stagehand);
    return stagehand;
  }

  async executeAction(
    sessionId: string,
    action: BrowserAction
  ): Promise<BrowserActionResult> {
    const stagehand = await this.acquireBrowser(sessionId);

    try {
      switch (action.type) {
        case 'navigate':
          await stagehand.act(`navigate to ${action.url}`);
          break;

        case 'click':
          await stagehand.act(`click on ${action.target}`);
          break;

        case 'type':
          await stagehand.act(`type "${action.text}" into ${action.target}`);
          break;

        case 'extract':
          const data = await stagehand.extract({
            instruction: action.instruction,
            schema: action.schema
          });
          return { success: true, data };

        case 'screenshot':
          const screenshot = await stagehand.page.screenshot({
            fullPage: action.fullPage ?? false
          });
          return { success: true, screenshot: screenshot.toString('base64') };

        case 'wait':
          await stagehand.act(`wait for ${action.condition}`);
          break;

        case 'scroll':
          await stagehand.act(action.instruction || 'scroll down');
          break;

        case 'custom':
          await stagehand.act(action.instruction);
          break;
      }

      return {
        success: true,
        currentUrl: stagehand.page.url(),
        pageTitle: await stagehand.page.title()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async releaseBrowser(sessionId: string): Promise<void> {
    const stagehand = this.browserPool.get(sessionId);
    if (stagehand) {
      await stagehand.close();
      this.browserPool.delete(sessionId);
    }
  }
}
```

### Document Agent

```typescript
// src/autonomous/agents/document/document-agent.service.ts

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import PptxGenJS from 'pptxgenjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class DocumentAgentService {
  
  async generateMarkdown(content: MarkdownContent): Promise<string> {
    let md = '';
    
    if (content.title) {
      md += `# ${content.title}\n\n`;
    }
    
    if (content.metadata) {
      md += `*Generated: ${new Date().toISOString()}*\n\n`;
    }
    
    for (const section of content.sections) {
      md += `## ${section.title}\n\n`;
      md += `${section.content}\n\n`;
    }
    
    if (content.references) {
      md += `## References\n\n`;
      content.references.forEach((ref, i) => {
        md += `${i + 1}. [${ref.title}](${ref.url})\n`;
      });
    }
    
    return md;
  }

  async generateDocx(content: DocumentContent): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: content.title,
            heading: HeadingLevel.HEADING_1
          }),
          ...content.sections.flatMap(section => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              children: [new TextRun(section.content)]
            })
          ])
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  async generatePptx(content: PresentationContent): Promise<Buffer> {
    const pptx = new PptxGenJS();

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.addText(content.title, {
      x: 0.5, y: 2, w: 9, h: 1.5,
      fontSize: 36, bold: true, align: 'center'
    });

    // Content slides
    for (const slide of content.slides) {
      const pptSlide = pptx.addSlide();
      
      pptSlide.addText(slide.title, {
        x: 0.5, y: 0.5, w: 9, h: 0.75,
        fontSize: 24, bold: true
      });

      if (slide.bullets) {
        slide.bullets.forEach((bullet, i) => {
          pptSlide.addText(bullet, {
            x: 0.75, y: 1.5 + (i * 0.5), w: 8.5, h: 0.5,
            fontSize: 18, bullet: true
          });
        });
      }

      if (slide.content) {
        pptSlide.addText(slide.content, {
          x: 0.5, y: 1.5, w: 9, h: 4,
          fontSize: 16
        });
      }
    }

    return Buffer.from(await pptx.write({ outputType: 'arraybuffer' }));
  }

  async generatePdf(content: DocumentContent): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage();
    let y = page.getHeight() - 50;

    // Title
    page.drawText(content.title, {
      x: 50, y, size: 24, font: boldFont, color: rgb(0, 0, 0)
    });
    y -= 40;

    // Content
    for (const section of content.sections) {
      // Section title
      page.drawText(section.title, {
        x: 50, y, size: 16, font: boldFont, color: rgb(0, 0, 0)
      });
      y -= 25;

      // Section content (word wrap)
      const words = section.content.split(' ');
      let line = '';
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, 12);
        
        if (testWidth > 500) {
          page.drawText(line, { x: 50, y, size: 12, font });
          line = word + ' ';
          y -= 18;

          if (y < 50) {
            page = pdfDoc.addPage();
            y = page.getHeight() - 50;
          }
        } else {
          line = testLine;
        }
      }
      
      if (line) {
        page.drawText(line, { x: 50, y, size: 12, font });
        y -= 30;
      }
    }

    return Buffer.from(await pdfDoc.save());
  }
}
```

### Data Agent

```typescript
// src/autonomous/agents/data/data-agent.service.ts

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

@Injectable()
export class DataAgentService {

  async parseCSV(content: string): Promise<any[]> {
    const result = Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    return result.data;
  }

  async parseExcel(buffer: Buffer): Promise<{ [sheet: string]: any[] }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const result: { [sheet: string]: any[] } = {};

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      result[sheetName] = XLSX.utils.sheet_to_json(sheet);
    }

    return result;
  }

  async analyzeData(data: any[], query: string): Promise<DataAnalysisResult> {
    // Use LLM to analyze data based on natural language query
    const result = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: z.object({
        summary: z.string(),
        insights: z.array(z.string()),
        statistics: z.record(z.number()).optional(),
        recommendations: z.array(z.string()).optional()
      }),
      prompt: `Analyze this data and answer: ${query}\n\nData sample:\n${JSON.stringify(data.slice(0, 100), null, 2)}`
    });

    return result.object;
  }

  async transformData(
    data: any[],
    transformation: DataTransformation
  ): Promise<any[]> {
    switch (transformation.type) {
      case 'filter':
        return data.filter(row => 
          this.evaluateCondition(row, transformation.condition)
        );

      case 'map':
        return data.map(row => 
          this.applyMapping(row, transformation.mapping)
        );

      case 'aggregate':
        return this.aggregate(data, transformation.groupBy, transformation.aggregations);

      case 'sort':
        return [...data].sort((a, b) => {
          const aVal = a[transformation.field];
          const bVal = b[transformation.field];
          return transformation.order === 'asc' ? aVal - bVal : bVal - aVal;
        });

      default:
        return data;
    }
  }

  async generateChart(
    data: any[],
    chartConfig: ChartConfig
  ): Promise<string> {
    // Generate chart using a charting library and return as base64 image
    // Implementation depends on chosen charting library
    // Options: Chart.js (via node-canvas), D3 (via jsdom), or QuickChart API
    
    const quickChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
      type: chartConfig.type,
      data: {
        labels: data.map(d => d[chartConfig.labelField]),
        datasets: [{
          label: chartConfig.label,
          data: data.map(d => d[chartConfig.valueField])
        }]
      }
    }))}`;

    const response = await fetch(quickChartUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  }

  private evaluateCondition(row: any, condition: string): boolean {
    // Simple condition evaluation - in production, use a proper expression parser
    try {
      return new Function('row', `return ${condition}`)(row);
    } catch {
      return false;
    }
  }

  private applyMapping(row: any, mapping: Record<string, string>): any {
    const result: any = {};
    for (const [newKey, expression] of Object.entries(mapping)) {
      try {
        result[newKey] = new Function('row', `return ${expression}`)(row);
      } catch {
        result[newKey] = null;
      }
    }
    return result;
  }

  private aggregate(
    data: any[],
    groupBy: string[],
    aggregations: Record<string, 'sum' | 'avg' | 'count' | 'min' | 'max'>
  ): any[] {
    const groups = new Map<string, any[]>();

    for (const row of data) {
      const key = groupBy.map(f => row[f]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(row);
    }

    return Array.from(groups.entries()).map(([key, rows]) => {
      const result: any = {};
      
      groupBy.forEach((field, i) => {
        result[field] = key.split('|')[i];
      });

      for (const [field, op] of Object.entries(aggregations)) {
        const values = rows.map(r => r[field]).filter(v => typeof v === 'number');
        switch (op) {
          case 'sum': result[`${field}_sum`] = values.reduce((a, b) => a + b, 0); break;
          case 'avg': result[`${field}_avg`] = values.reduce((a, b) => a + b, 0) / values.length; break;
          case 'count': result[`${field}_count`] = values.length; break;
          case 'min': result[`${field}_min`] = Math.min(...values); break;
          case 'max': result[`${field}_max`] = Math.max(...values); break;
        }
      }

      return result;
    });
  }
}
```

---

# 6. Domain Configurations

## 6.1 Complete Domain List

### Tier 1 — High Demand (Implement First)

| Domain | Key Sources | Search Modifiers | Special Requirements |
|--------|-------------|------------------|---------------------|
| **Technology & Software** | GitHub, Stack Overflow, HackerNews, TechCrunch, ArXiv (cs.AI, cs.SE), Official Docs | `site:github.com OR site:stackoverflow.com` | Code snippets, version awareness, deprecation checks |
| **Business & Finance** | SEC EDGAR, Yahoo Finance, Bloomberg, Reuters, Company IRs, Crunchbase, WSJ | `site:sec.gov OR site:reuters.com` | Financial disclaimers, real-time data notes, regulatory compliance |
| **Medical & Healthcare** | PubMed, NIH, WHO, FDA, Mayo Clinic, Cochrane, medical journals | `site:pubmed.ncbi.nlm.nih.gov OR site:nih.gov` | Medical disclaimers, peer-review priority, drug interaction warnings |
| **Legal** | Court records (PACER), law journals, .gov sites, Cornell LII, FindLaw | `site:law.cornell.edu OR site:findlaw.com` | Jurisdiction awareness, case citation format (Bluebook), legal disclaimers |
| **Academic & Scientific** | Google Scholar, ArXiv, PubMed, Semantic Scholar, ResearchGate, JSTOR | `site:arxiv.org OR site:scholar.google.com` | Citation format (APA/MLA), peer-review status, impact metrics |
| **News & Current Events** | Reuters, AP, major newspapers, Google News | `site:reuters.com OR site:apnews.com` | Recency priority, source triangulation, bias indicators |

### Tier 2 — Specialized

| Domain | Key Sources | Search Modifiers | Special Requirements |
|--------|-------------|------------------|---------------------|
| **E-commerce & Products** | Amazon, product review sites, manufacturer specs, CNET, Wirecutter | Product-specific queries | Price tracking, review aggregation, spec comparison |
| **Real Estate** | Zillow, Redfin, Realtor.com, county records | Location + `real estate` | Location-specific, market data, property history |
| **Travel & Hospitality** | TripAdvisor, Booking.com, Lonely Planet, State Dept travel advisories | Destination + dates | Seasonality, pricing volatility, safety advisories |
| **Education** | University sites, Course platforms, accreditation bodies, NCES | `site:edu` | Credential verification, curriculum standards |
| **Government & Policy** | .gov sites, GovTrack, Congress.gov, policy institutes | `site:gov` | Regulatory updates, jurisdiction specificity |
| **Sports** | ESPN, official league sites, sports-reference.com | Sport + team/player | Real-time awareness, historical stats |
| **Entertainment** | IMDb, Rotten Tomatoes, Metacritic, streaming platforms | Title + "review" | Release dates, reviews aggregation |
| **Food & Nutrition** | USDA FoodData, recipe sites, FDA | Ingredient + nutrition | Nutritional accuracy, dietary restrictions, allergens |
| **Automotive** | Kelley Blue Book, CarFax, Edmunds, NHTSA | Make + model + year | VIN lookup, recall data, pricing accuracy |
| **Cryptocurrency** | CoinGecko, CoinMarketCap, Etherscan, protocol docs | Token + "price" OR "analysis" | Volatility disclaimers, scam warnings |

### Tier 3 — Niche

| Domain | Key Sources | Special Requirements |
|--------|-------------|---------------------|
| **Patents & IP** | USPTO, EPO, Google Patents, WIPO | Patent citation format, claim analysis |
| **Job Market** | LinkedIn, Glassdoor, Indeed, BLS | Salary data accuracy, market trends |
| **Climate & Environment** | NASA, NOAA, EPA, IPCC | Data visualization, long-term trends |
| **Agriculture** | USDA, agricultural extensions, commodity markets | Seasonal data, regional specificity |
| **Construction** | Building codes, ICC, OSHA | Code compliance, regional variations |
| **Manufacturing** | Industry reports, supplier databases | Lead times, supplier reliability |
| **Nonprofit** | Foundation directories, 990 forms, GuideStar | Eligibility criteria, deadline tracking |
| **Insurance** | State insurance depts, AM Best, NAIC | Policy comparison, regulatory requirements |
| **Energy** | EIA, utility companies, renewable energy databases | Rate comparisons, consumption patterns |

## 6.2 Domain Configuration Schema

```typescript
// src/research/domains/domain-config.interface.ts

interface DomainConfig {
  id: string;
  name: string;
  description: string;
  
  // Search configuration
  preferredDomains: string[];           // Prioritize these domains
  authoritativeDomains: string[];       // Extra trust for these
  blockedDomains: string[];             // Never use these
  searchModifiers: string[];            // Add to queries
  
  // Source requirements
  requirePeerReview?: boolean;          // Academic/medical
  preferRecent?: boolean;               // News/current events
  maxAgeMonths?: number;                // How old is too old
  
  // Output configuration
  citationFormat: 'apa' | 'mla' | 'chicago' | 'bluebook' | 'ieee';
  disclaimers: string[];                // Required disclaimers
  outputTemplate?: string;              // Default template name
  
  // Special handlers
  specialApis?: string[];               // Domain-specific APIs (pubmed, edgar)
  entityTypes?: string[];               // Entities to extract
  factCheckPriority?: 'high' | 'normal' | 'low';
}
```

## 6.3 Example Domain Configurations

```typescript
// src/research/domains/configs/medical.config.ts

export const MEDICAL_DOMAIN_CONFIG: DomainConfig = {
  id: 'medical',
  name: 'Medical & Healthcare',
  description: 'Medical research, healthcare information, clinical studies',
  
  preferredDomains: [
    'pubmed.ncbi.nlm.nih.gov',
    'nih.gov',
    'who.int',
    'cdc.gov',
    'fda.gov',
    'mayoclinic.org',
    'cochranelibrary.com',
    'nejm.org',
    'thelancet.com',
    'jamanetwork.com',
    'bmj.com',
    'nature.com/nm',
    'hopkinsmedicine.org',
    'clevelandclinic.org'
  ],
  
  authoritativeDomains: [
    'nih.gov',
    'who.int',
    'cdc.gov',
    'fda.gov',
    'cochranelibrary.com'
  ],
  
  blockedDomains: [
    'webmd.com',           // Often oversimplified
    'healthline.com',      // SEO-heavy
    'medicalnewstoday.com' // Variable quality
  ],
  
  searchModifiers: [
    'peer reviewed',
    'clinical study',
    'meta-analysis'
  ],
  
  requirePeerReview: true,
  preferRecent: true,
  maxAgeMonths: 60,  // 5 years for medical
  
  citationFormat: 'apa',
  
  disclaimers: [
    'This information is for educational purposes only and is not intended as medical advice.',
    'Always consult with a qualified healthcare provider before making medical decisions.',
    'This research summary does not constitute a diagnosis or treatment recommendation.'
  ],
  
  specialApis: ['pubmed', 'clinicaltrials'],
  
  entityTypes: [
    'drug_name',
    'condition',
    'treatment',
    'clinical_trial_id',
    'icd_code'
  ],
  
  factCheckPriority: 'high'
};

// src/research/domains/configs/finance.config.ts

export const FINANCE_DOMAIN_CONFIG: DomainConfig = {
  id: 'finance',
  name: 'Business & Finance',
  description: 'Financial markets, business analysis, economic research',
  
  preferredDomains: [
    'sec.gov',
    'reuters.com',
    'bloomberg.com',
    'wsj.com',
    'ft.com',
    'finance.yahoo.com',
    'crunchbase.com',
    'pitchbook.com',
    'morningstar.com',
    'investopedia.com',
    'federalreserve.gov',
    'bls.gov',
    'treasury.gov'
  ],
  
  authoritativeDomains: [
    'sec.gov',
    'federalreserve.gov',
    'bls.gov',
    'treasury.gov'
  ],
  
  blockedDomains: [
    'seekingalpha.com',    // User-generated, variable quality
    'motleyfool.com'       // Often promotional
  ],
  
  searchModifiers: [
    'SEC filing',
    'quarterly report',
    'earnings'
  ],
  
  requirePeerReview: false,
  preferRecent: true,
  maxAgeMonths: 12,  // Financial data ages quickly
  
  citationFormat: 'apa',
  
  disclaimers: [
    'This information is for educational purposes only and does not constitute financial advice.',
    'Past performance does not guarantee future results.',
    'Consult a qualified financial advisor before making investment decisions.',
    'Data may be delayed. Verify with official sources.'
  ],
  
  specialApis: ['sec_edgar', 'yahoo_finance'],
  
  entityTypes: [
    'ticker_symbol',
    'company_name',
    'currency',
    'financial_metric'
  ],
  
  factCheckPriority: 'high'
};

// src/research/domains/configs/technology.config.ts

export const TECHNOLOGY_DOMAIN_CONFIG: DomainConfig = {
  id: 'technology',
  name: 'Technology & Software',
  description: 'Software development, AI/ML, technology trends',
  
  preferredDomains: [
    'github.com',
    'stackoverflow.com',
    'arxiv.org',
    'news.ycombinator.com',
    'techcrunch.com',
    'wired.com',
    'arstechnica.com',
    'theverge.com',
    'developer.mozilla.org',
    'docs.python.org',
    'docs.microsoft.com',
    'cloud.google.com/docs',
    'aws.amazon.com/documentation',
    'openai.com/research',
    'anthropic.com'
  ],
  
  authoritativeDomains: [
    'arxiv.org',
    'github.com',
    'developer.mozilla.org'
  ],
  
  blockedDomains: [
    'w3schools.com',       // Often outdated
    'geeksforgeeks.com'    // Variable quality
  ],
  
  searchModifiers: [],
  
  requirePeerReview: false,
  preferRecent: true,
  maxAgeMonths: 24,
  
  citationFormat: 'ieee',
  
  disclaimers: [
    'Technology evolves rapidly. Verify information with official documentation.',
    'Code examples may require adaptation for your specific use case.'
  ],
  
  specialApis: ['github', 'npm', 'pypi'],
  
  entityTypes: [
    'programming_language',
    'framework',
    'library',
    'api',
    'version_number'
  ],
  
  factCheckPriority: 'normal'
};
```

---

# 7. Database Schema

## 7.1 Research Tables

```sql
-- Research sessions
CREATE TABLE research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    conversation_id UUID REFERENCES conversations(id),
    
    -- Query info
    query TEXT NOT NULL,
    domain VARCHAR(50),
    depth VARCHAR(20) NOT NULL DEFAULT 'standard',  -- quick, standard, deep, exhaustive
    
    -- Configuration
    config JSONB DEFAULT '{}',  -- { maxSources, dateRange, languages, outputFormats }
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, planning, searching, extracting, analyzing, synthesizing, fact_checking, generating, completed, failed
    progress JSONB DEFAULT '{}',  -- { phase, step, totalSteps, message }
    
    -- Results
    plan JSONB,  -- Generated research plan
    synthesis TEXT,  -- Final synthesized content
    fact_check_results JSONB,
    
    -- Metrics
    sources_found INTEGER DEFAULT 0,
    sources_used INTEGER DEFAULT 0,
    findings_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Error handling
    error JSONB,
    retry_count INTEGER DEFAULT 0
);

CREATE INDEX idx_research_sessions_user ON research_sessions(user_id);
CREATE INDEX idx_research_sessions_status ON research_sessions(status);
CREATE INDEX idx_research_sessions_created ON research_sessions(created_at DESC);

-- Research sources
CREATE TABLE research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    
    -- Source info
    url TEXT NOT NULL,
    title TEXT,
    domain VARCHAR(255),  -- extracted domain from URL
    source_type VARCHAR(20) DEFAULT 'web',  -- web, api, document, database
    
    -- Content
    raw_content TEXT,
    processed_content TEXT,
    content_hash VARCHAR(64),  -- For deduplication
    
    -- Metadata
    metadata JSONB DEFAULT '{}',  -- { author, publishedDate, wordCount, language }
    
    -- Scoring
    relevance_score FLOAT,
    credibility_score FLOAT,
    
    -- Extraction
    extraction_method VARCHAR(20),  -- jina, firecrawl, stagehand, puppeteer
    extraction_status VARCHAR(20) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    extracted_at TIMESTAMPTZ,
    indexed_at TIMESTAMPTZ  -- When added to Qdrant
);

CREATE INDEX idx_research_sources_session ON research_sources(session_id);
CREATE INDEX idx_research_sources_url ON research_sources(url);
CREATE UNIQUE INDEX idx_research_sources_hash ON research_sources(session_id, content_hash);

-- Research findings
CREATE TABLE research_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    
    -- Finding info
    finding_type VARCHAR(20) NOT NULL,  -- fact, claim, statistic, quote, definition, comparison
    content TEXT NOT NULL,
    summary TEXT,
    
    -- Confidence & verification
    confidence FLOAT,  -- 0-1
    verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    
    -- Source attribution
    source_ids UUID[],  -- Array of research_sources.id
    citations JSONB,  -- Formatted citations
    
    -- Conflicts
    contradictions JSONB,  -- Conflicting findings from other sources
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_research_findings_session ON research_findings(session_id);
CREATE INDEX idx_research_findings_type ON research_findings(finding_type);

-- Research outputs
CREATE TABLE research_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    
    -- Output info
    output_type VARCHAR(20) NOT NULL,  -- summary, report, document, slides, data
    format VARCHAR(10) NOT NULL,  -- markdown, pdf, docx, pptx, html, json
    title TEXT,
    
    -- Content
    content TEXT,  -- For text formats (markdown, html, json)
    file_path TEXT,  -- For binary formats (pdf, docx, pptx)
    file_size INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_research_outputs_session ON research_outputs(session_id);

-- Domain configurations (can be modified at runtime)
CREATE TABLE domain_configs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Configuration
    config JSONB NOT NULL,  -- Full DomainConfig object
    
    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 7.2 Autonomous Task Tables

```sql
-- Autonomous tasks
CREATE TABLE autonomous_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    conversation_id UUID REFERENCES conversations(id),
    
    -- Task info
    task_type VARCHAR(50) NOT NULL,  -- browser, research, document, data, api, composite
    title TEXT NOT NULL,
    description TEXT,
    
    -- Input & configuration
    input JSONB NOT NULL,  -- Task parameters
    config JSONB DEFAULT '{}',  -- Task-specific configuration
    
    -- Planning
    plan JSONB,  -- Execution plan (steps, dependencies)
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, planning, executing, paused, completed, failed, cancelled
    progress JSONB DEFAULT '{}',  -- { currentStep, totalSteps, phase, message }
    
    -- Scheduling
    priority INTEGER DEFAULT 5,  -- 1 (highest) to 10 (lowest)
    scheduled_at TIMESTAMPTZ,
    repeat_config JSONB,  -- For recurring tasks
    
    -- Results
    result JSONB,
    
    -- Error handling
    error JSONB,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timeouts
    timeout_seconds INTEGER DEFAULT 300,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_autonomous_tasks_user ON autonomous_tasks(user_id);
CREATE INDEX idx_autonomous_tasks_status ON autonomous_tasks(status);
CREATE INDEX idx_autonomous_tasks_scheduled ON autonomous_tasks(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_autonomous_tasks_created ON autonomous_tasks(created_at DESC);

-- Task steps
CREATE TABLE task_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES autonomous_tasks(id) ON DELETE CASCADE,
    
    -- Step info
    step_number INTEGER NOT NULL,
    name VARCHAR(100),
    description TEXT,
    
    -- Execution
    agent_type VARCHAR(50) NOT NULL,  -- browser, llm, document, data, api
    action VARCHAR(100) NOT NULL,
    input JSONB NOT NULL,
    
    -- Dependencies
    dependencies UUID[],  -- IDs of steps that must complete first
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, running, completed, failed, skipped
    
    -- Results
    output JSONB,
    error JSONB,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER
);

CREATE INDEX idx_task_steps_task ON task_steps(task_id);
CREATE INDEX idx_task_steps_status ON task_steps(status);

-- Task artifacts
CREATE TABLE task_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES autonomous_tasks(id) ON DELETE CASCADE,
    step_id UUID REFERENCES task_steps(id),
    
    -- Artifact info
    artifact_type VARCHAR(20) NOT NULL,  -- screenshot, document, data, file, log
    name TEXT,
    description TEXT,
    
    -- Content
    mime_type VARCHAR(100),
    file_path TEXT,
    content TEXT,  -- For small text artifacts
    file_size INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_artifacts_task ON task_artifacts(task_id);
CREATE INDEX idx_task_artifacts_step ON task_artifacts(step_id);

-- Browser sessions
CREATE TABLE browser_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES autonomous_tasks(id) ON DELETE CASCADE,
    
    -- Session info
    browser_type VARCHAR(20) DEFAULT 'chromium',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, idle, closed
    
    -- State
    current_url TEXT,
    page_title TEXT,
    viewport JSONB DEFAULT '{"width": 1280, "height": 720}',
    cookies JSONB,  -- For session persistence
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_browser_sessions_task ON browser_sessions(task_id);
CREATE INDEX idx_browser_sessions_status ON browser_sessions(status);

-- LangGraph checkpoints (for workflow state persistence)
CREATE TABLE langgraph_checkpoints (
    thread_id VARCHAR(255) NOT NULL,
    checkpoint_id VARCHAR(255) NOT NULL,
    parent_checkpoint_id VARCHAR(255),
    
    -- State
    channel_values JSONB NOT NULL,
    channel_versions JSONB NOT NULL,
    versions_seen JSONB NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (thread_id, checkpoint_id)
);

CREATE INDEX idx_langgraph_checkpoints_thread ON langgraph_checkpoints(thread_id);
```

---

# 8. Qdrant Collections

## 8.1 Collection Definitions

```typescript
// src/qdrant/collections.config.ts

export const QDRANT_COLLECTIONS = {
  // Research content embeddings
  RESEARCH_CONTENT: {
    name: 'research_content',
    vectorSize: 1536,  // OpenAI ada-002 or equivalent
    distance: 'Cosine',
    onDiskPayload: true,  // Large payloads stored on disk
    
    schema: {
      session_id: 'keyword',
      source_id: 'keyword',
      chunk_index: 'integer',
      content: 'text',
      domain: 'keyword',
      source_url: 'keyword',
      source_title: 'text',
      source_type: 'keyword',
      relevance_score: 'float',
      created_at: 'datetime'
    }
  },
  
  // Domain knowledge base
  DOMAIN_KNOWLEDGE: {
    name: 'domain_knowledge',
    vectorSize: 1536,
    distance: 'Cosine',
    
    schema: {
      domain: 'keyword',
      knowledge_type: 'keyword',  // terminology, source_pattern, fact_pattern, template
      content: 'text',
      examples: 'text[]',
      priority: 'float'
    }
  },
  
  // Intent patterns for research/task detection
  INTENT_PATTERNS: {
    name: 'intent_patterns',
    vectorSize: 1536,
    distance: 'Cosine',
    
    schema: {
      pattern_type: 'keyword',  // research_request, task_request, domain_hint, depth_hint
      pattern: 'text',
      domain: 'keyword',
      depth: 'keyword',
      task_type: 'keyword',
      action: 'keyword',
      examples: 'text[]'
    }
  },
  
  // Task templates for common operations
  TASK_TEMPLATES: {
    name: 'task_templates',
    vectorSize: 1536,
    distance: 'Cosine',
    
    schema: {
      template_id: 'keyword',
      name: 'text',
      description: 'text',
      task_type: 'keyword',
      steps: 'json',
      required_inputs: 'text[]',
      estimated_duration: 'integer'
    }
  }
};
```

## 8.2 Seeding Intent Patterns

```typescript
// src/qdrant/seeders/intent-patterns.seeder.ts

export const RESEARCH_INTENT_PATTERNS = [
  // Research requests
  { pattern: 'research about {topic}', pattern_type: 'research_request', action: 'start_research' },
  { pattern: 'find information on {topic}', pattern_type: 'research_request', action: 'start_research' },
  { pattern: 'what do we know about {topic}', pattern_type: 'research_request', action: 'start_research' },
  { pattern: 'deep dive into {topic}', pattern_type: 'research_request', action: 'start_research', depth: 'deep' },
  { pattern: 'comprehensive report on {topic}', pattern_type: 'research_request', action: 'start_research', depth: 'exhaustive' },
  { pattern: 'quick summary of {topic}', pattern_type: 'research_request', action: 'start_research', depth: 'quick' },
  { pattern: 'analyze {topic}', pattern_type: 'research_request', action: 'start_research' },
  { pattern: 'investigate {topic}', pattern_type: 'research_request', action: 'start_research', depth: 'deep' },
  
  // Domain hints
  { pattern: 'medical research on {topic}', pattern_type: 'domain_hint', domain: 'medical' },
  { pattern: 'clinical studies about {topic}', pattern_type: 'domain_hint', domain: 'medical' },
  { pattern: 'financial analysis of {topic}', pattern_type: 'domain_hint', domain: 'finance' },
  { pattern: 'market research for {topic}', pattern_type: 'domain_hint', domain: 'finance' },
  { pattern: 'legal research on {topic}', pattern_type: 'domain_hint', domain: 'legal' },
  { pattern: 'case law about {topic}', pattern_type: 'domain_hint', domain: 'legal' },
  { pattern: 'technical documentation for {topic}', pattern_type: 'domain_hint', domain: 'technology' },
  { pattern: 'academic papers on {topic}', pattern_type: 'domain_hint', domain: 'academic' },
  
  // Depth hints
  { pattern: 'thorough analysis', pattern_type: 'depth_hint', depth: 'deep' },
  { pattern: 'comprehensive review', pattern_type: 'depth_hint', depth: 'exhaustive' },
  { pattern: 'brief overview', pattern_type: 'depth_hint', depth: 'quick' },
  { pattern: 'in-depth study', pattern_type: 'depth_hint', depth: 'exhaustive' },
  { pattern: 'quick look at', pattern_type: 'depth_hint', depth: 'quick' },
];

export const TASK_INTENT_PATTERNS = [
  // Browser automation
  { pattern: 'go to {url} and {action}', pattern_type: 'task_request', task_type: 'browser', action: 'browser_automation' },
  { pattern: 'scrape data from {url}', pattern_type: 'task_request', task_type: 'browser', action: 'web_scraping' },
  { pattern: 'take screenshot of {url}', pattern_type: 'task_request', task_type: 'browser', action: 'screenshot' },
  { pattern: 'fill out the form at {url}', pattern_type: 'task_request', task_type: 'browser', action: 'form_fill' },
  { pattern: 'monitor {url} for changes', pattern_type: 'task_request', task_type: 'browser', action: 'monitoring' },
  { pattern: 'extract {data} from {url}', pattern_type: 'task_request', task_type: 'browser', action: 'extraction' },
  
  // Document generation
  { pattern: 'create a report on {topic}', pattern_type: 'task_request', task_type: 'document', action: 'generate_report' },
  { pattern: 'make a presentation about {topic}', pattern_type: 'task_request', task_type: 'document', action: 'generate_slides' },
  { pattern: 'generate PDF of {content}', pattern_type: 'task_request', task_type: 'document', action: 'generate_pdf' },
  { pattern: 'create document from {template}', pattern_type: 'task_request', task_type: 'document', action: 'generate_doc' },
  
  // Data operations
  { pattern: 'analyze this data', pattern_type: 'task_request', task_type: 'data', action: 'analyze' },
  { pattern: 'create chart from {data}', pattern_type: 'task_request', task_type: 'data', action: 'visualize' },
  { pattern: 'transform {data} to {format}', pattern_type: 'task_request', task_type: 'data', action: 'transform' },
  { pattern: 'summarize this spreadsheet', pattern_type: 'task_request', task_type: 'data', action: 'summarize' },
  
  // Scheduling
  { pattern: 'every {frequency} {action}', pattern_type: 'task_request', task_type: 'scheduled', action: 'create_schedule' },
  { pattern: 'daily report on {topic}', pattern_type: 'task_request', task_type: 'scheduled', action: 'scheduled_research' },
  { pattern: 'remind me to {action} at {time}', pattern_type: 'task_request', task_type: 'scheduled', action: 'create_reminder' },
];
```

---

# 9. Module Structure

```
src/
├── app.module.ts
│
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
│
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── qdrant.config.ts
│   └── queue.config.ts
│
├── queues/
│   ├── queues.module.ts
│   ├── queue.service.ts
│   ├── queue.constants.ts
│   └── processors/
│       ├── research.processor.ts
│       ├── browser.processor.ts
│       ├── document.processor.ts
│       └── data.processor.ts
│
├── llm/
│   ├── llm.module.ts
│   ├── llm.service.ts                    # Vercel AI SDK wrapper
│   ├── providers/
│   │   ├── anthropic.provider.ts
│   │   ├── openai.provider.ts
│   │   └── embeddings.provider.ts
│   └── tools/
│       ├── tool.interface.ts
│       └── tool.registry.ts
│
├── research/
│   ├── research.module.ts
│   ├── research.controller.ts
│   ├── research.gateway.ts               # WebSocket
│   │
│   ├── orchestrator/
│   │   ├── research-orchestrator.service.ts
│   │   ├── research-graph.builder.ts     # LangGraph workflow
│   │   └── research-state.interface.ts
│   │
│   ├── nodes/                            # LangGraph nodes
│   │   ├── query-analyzer.node.ts
│   │   ├── planner.node.ts
│   │   ├── searcher.node.ts
│   │   ├── extractor.node.ts
│   │   ├── analyzer.node.ts
│   │   ├── synthesizer.node.ts
│   │   ├── fact-checker.node.ts
│   │   └── output-generator.node.ts
│   │
│   ├── tools/
│   │   ├── search/
│   │   │   ├── tavily.tool.ts
│   │   │   ├── exa.tool.ts
│   │   │   ├── brave.tool.ts
│   │   │   └── search-aggregator.service.ts
│   │   ├── extraction/
│   │   │   ├── jina-reader.tool.ts
│   │   │   ├── firecrawl.tool.ts
│   │   │   ├── stagehand-extractor.tool.ts
│   │   │   └── content-processor.service.ts
│   │   └── specialized/
│   │       ├── pubmed.tool.ts
│   │       ├── arxiv.tool.ts
│   │       ├── sec-edgar.tool.ts
│   │       └── google-scholar.tool.ts
│   │
│   ├── domains/
│   │   ├── domain-config.service.ts
│   │   ├── domain-detector.service.ts
│   │   └── configs/
│   │       ├── technology.config.ts
│   │       ├── finance.config.ts
│   │       ├── medical.config.ts
│   │       ├── legal.config.ts
│   │       ├── academic.config.ts
│   │       └── index.ts
│   │
│   ├── output/
│   │   ├── output-generator.service.ts
│   │   ├── markdown-formatter.service.ts
│   │   ├── citation-generator.service.ts
│   │   └── templates/
│   │       ├── report.hbs
│   │       ├── executive-summary.hbs
│   │       └── research-brief.hbs
│   │
│   ├── dto/
│   │   ├── start-research.dto.ts
│   │   ├── research-progress.dto.ts
│   │   └── research-output.dto.ts
│   │
│   └── entities/
│       ├── research-session.entity.ts
│       ├── research-source.entity.ts
│       ├── research-finding.entity.ts
│       └── research-output.entity.ts
│
├── autonomous/
│   ├── autonomous.module.ts
│   ├── autonomous.controller.ts
│   ├── autonomous.gateway.ts             # WebSocket
│   │
│   ├── orchestrator/
│   │   ├── task-orchestrator.service.ts
│   │   ├── task-planner.service.ts
│   │   ├── task-graph.builder.ts         # LangGraph for tasks
│   │   └── task-state.interface.ts
│   │
│   ├── agents/
│   │   ├── agent.interface.ts
│   │   ├── browser/
│   │   │   ├── browser-agent.service.ts
│   │   │   ├── browser-pool.service.ts
│   │   │   ├── stagehand.wrapper.ts
│   │   │   └── actions/
│   │   │       ├── navigate.action.ts
│   │   │       ├── extract.action.ts
│   │   │       ├── interact.action.ts
│   │   │       └── screenshot.action.ts
│   │   ├── document/
│   │   │   ├── document-agent.service.ts
│   │   │   ├── docx-generator.service.ts
│   │   │   ├── pptx-generator.service.ts
│   │   │   └── pdf-generator.service.ts
│   │   ├── data/
│   │   │   ├── data-agent.service.ts
│   │   │   ├── spreadsheet-processor.service.ts
│   │   │   ├── data-transformer.service.ts
│   │   │   └── chart-generator.service.ts
│   │   └── api/
│   │       ├── api-agent.service.ts
│   │       └── http-client.service.ts
│   │
│   ├── scheduling/
│   │   ├── scheduler.service.ts
│   │   └── recurring-task.service.ts
│   │
│   ├── dto/
│   │   ├── create-task.dto.ts
│   │   ├── task-progress.dto.ts
│   │   └── task-result.dto.ts
│   │
│   └── entities/
│       ├── autonomous-task.entity.ts
│       ├── task-step.entity.ts
│       ├── task-artifact.entity.ts
│       └── browser-session.entity.ts
│
├── qdrant/
│   ├── qdrant.module.ts
│   ├── qdrant.service.ts
│   ├── collections.config.ts
│   └── seeders/
│       ├── intent-patterns.seeder.ts
│       └── domain-knowledge.seeder.ts
│
├── storage/
│   ├── storage.module.ts
│   ├── storage.service.ts                # S3/R2/local abstraction
│   └── file-upload.service.ts
│
└── websocket/
    ├── websocket.module.ts
    ├── websocket.gateway.ts
    └── events/
        ├── research.events.ts
        ├── task.events.ts
        └── browser.events.ts
```

---

# 10. API & WebSocket Contracts

## 10.1 REST API Endpoints

```typescript
// Research endpoints
POST   /api/research                    // Start new research
GET    /api/research/:id                // Get research status/results
GET    /api/research/:id/sources        // Get research sources
GET    /api/research/:id/findings       // Get research findings
GET    /api/research/:id/outputs        // Get generated outputs
DELETE /api/research/:id                // Cancel research

// Task endpoints
POST   /api/tasks                       // Create new task
GET    /api/tasks/:id                   // Get task status/results
GET    /api/tasks/:id/steps             // Get task steps
GET    /api/tasks/:id/artifacts         // Get task artifacts
POST   /api/tasks/:id/pause             // Pause task
POST   /api/tasks/:id/resume            // Resume task
DELETE /api/tasks/:id                   // Cancel task

// Domain config endpoints
GET    /api/domains                     // List available domains
GET    /api/domains/:id                 // Get domain config
PUT    /api/domains/:id                 // Update domain config (admin)
```

## 10.2 WebSocket Events

```typescript
// Client → Server
interface ClientEvents {
  'research:start': { query: string; config?: ResearchConfig };
  'research:cancel': { sessionId: string };
  
  'task:create': { definition: TaskDefinition };
  'task:pause': { taskId: string };
  'task:resume': { taskId: string };
  'task:cancel': { taskId: string };
  
  'browser:action': { sessionId: string; action: BrowserAction };
}

// Server → Client
interface ServerEvents {
  // Research events
  'research:started': { sessionId: string; query: string };
  'research:progress': ResearchProgress;
  'research:source-found': { sessionId: string; source: SourcePreview };
  'research:finding': { sessionId: string; finding: FindingPreview };
  'research:synthesis-chunk': { sessionId: string; chunk: string };
  'research:completed': { sessionId: string; summary: string; outputs: OutputInfo[] };
  'research:error': { sessionId: string; error: string };
  
  // Task events
  'task:created': { taskId: string; plan: TaskPlan };
  'task:progress': TaskProgress;
  'task:step-started': { taskId: string; step: StepInfo };
  'task:step-completed': { taskId: string; step: StepInfo; output: any };
  'task:artifact': { taskId: string; artifact: ArtifactInfo };
  'task:completed': { taskId: string; result: any };
  'task:error': { taskId: string; error: string };
  
  // Browser events
  'browser:screenshot': { sessionId: string; screenshot: string };
  'browser:page-changed': { sessionId: string; url: string; title: string };
  'browser:action-completed': { sessionId: string; action: string; success: boolean };
}
```

## 10.3 Progress Types

```typescript
interface ResearchProgress {
  sessionId: string;
  phase: 'planning' | 'searching' | 'extracting' | 'analyzing' | 'synthesizing' | 'fact_checking' | 'generating';
  step: number;
  totalSteps: number;
  message: string;
  details?: {
    sourcesFound?: number;
    sourcesProcessed?: number;
    findingsExtracted?: number;
    currentSubQuery?: string;
  };
}

interface TaskProgress {
  taskId: string;
  status: 'planning' | 'executing' | 'paused';
  currentStep: number;
  totalSteps: number;
  phase: string;
  message: string;
  estimatedTimeRemaining?: number;
}
```

---

# 11. Implementation Phases

## Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up module structure
- Configure BullMQ queues
- Set up Qdrant collections
- Create database migrations
- Implement base WebSocket gateway

**Deliverables:**
- [ ] Module scaffolding complete
- [ ] BullMQ configured with all queues
- [ ] PostgreSQL migrations created and run
- [ ] Qdrant collections created
- [ ] Basic WebSocket events working
- [ ] Health check endpoints

## Phase 2: LLM & Tools Foundation (Week 3-4)

**Goals:**
- Implement Vercel AI SDK wrapper
- Integrate search tools (Tavily, Exa, Brave)
- Integrate extraction tools (Jina, Firecrawl)
- Set up Stagehand for browser automation
- Create tool registry

**Deliverables:**
- [ ] LLM service with multi-provider support
- [ ] All search tools working
- [ ] All extraction tools working
- [ ] Stagehand initialized and tested
- [ ] Tool calling via Vercel AI SDK working

## Phase 3: Research Core (Week 5-6)

**Goals:**
- Build LangGraph research workflow
- Implement query analysis & planning
- Implement parallel search execution
- Implement content extraction pipeline
- Basic synthesis with citations

**Deliverables:**
- [ ] Research graph fully defined
- [ ] Query analyzer working
- [ ] Search aggregator working
- [ ] Extraction pipeline working
- [ ] Basic synthesis working
- [ ] Research can run end-to-end (standard depth)

## Phase 4: Research Advanced (Week 7-8)

**Goals:**
- Add all domain configurations
- Implement fact-checking
- Add iterative refinement (loops)
- Implement all output formats
- Add scheduling for recurring research

**Deliverables:**
- [ ] All domains configured and tested
- [ ] Fact-checking working
- [ ] Deep and exhaustive modes working
- [ ] PDF, DOCX, PPTX generation working
- [ ] Scheduled research working

## Phase 5: Browser Agent (Week 9-10)

**Goals:**
- Build LangGraph browser workflow
- Implement observe-act-decide loop
- Add screenshot capabilities
- Add data extraction
- Session management

**Deliverables:**
- [ ] Browser graph fully defined
- [ ] Natural language actions working
- [ ] Screenshot capture working
- [ ] Structured extraction working
- [ ] Multi-step workflows working

## Phase 6: Task Orchestration (Week 11-12)

**Goals:**
- Build task planner
- Implement DAG execution
- Add document and data agents
- Multi-agent coordination
- Error handling and recovery

**Deliverables:**
- [ ] Task planning working
- [ ] Step dependencies respected
- [ ] Document agent working
- [ ] Data agent working
- [ ] Complex multi-agent tasks working

## Phase 7: Polish & Scale (Week 13-14)

**Goals:**
- Performance optimization
- Rate limiting tuning
- Error handling improvements
- Monitoring and logging
- Load testing
- Documentation

**Deliverables:**
- [ ] Performance benchmarks met
- [ ] Rate limits properly enforced
- [ ] Comprehensive error handling
- [ ] Monitoring dashboards
- [ ] Load tested at target scale
- [ ] API documentation complete

---

# 12. Package Dependencies

```json
{
  "dependencies": {
    // NestJS core
    "@nestjs/common": "^10.x",
    "@nestjs/core": "^10.x",
    "@nestjs/platform-socket.io": "^10.x",
    "@nestjs/typeorm": "^10.x",
    
    // Database
    "typeorm": "^0.3.x",
    "pg": "^8.x",
    "ioredis": "^5.x",
    
    // Queue
    "bullmq": "^5.x",
    
    // Vector DB
    "@qdrant/js-client-rest": "^1.x",
    
    // LLM
    "ai": "^3.x",
    "@ai-sdk/anthropic": "^0.x",
    "@ai-sdk/openai": "^0.x",
    "@langchain/langgraph": "^0.x",
    "@langchain/langgraph-checkpoint-postgres": "^0.x",
    
    // Browser automation
    "@browserbasehq/stagehand": "^1.x",
    "playwright": "^1.x",
    
    // Search APIs
    "tavily": "^0.x",
    "exa-js": "^1.x",
    
    // Content extraction
    "@mendable/firecrawl-js": "^0.x",
    "@mozilla/readability": "^0.x",
    "jsdom": "^24.x",
    "cheerio": "^1.x",
    "pdf-parse": "^1.x",
    
    // Document generation
    "docx": "^8.x",
    "pptxgenjs": "^3.x",
    "pdf-lib": "^1.x",
    "handlebars": "^4.x",
    "marked": "^12.x",
    
    // Data processing
    "xlsx": "^0.18.x",
    "papaparse": "^5.x",
    
    // Utilities
    "zod": "^3.x",
    "lodash": "^4.x",
    "date-fns": "^3.x",
    "uuid": "^9.x",
    "p-limit": "^5.x",
    "p-retry": "^6.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "typescript": "^5.x"
  }
}
```

---

# 13. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# LLM Providers
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Search APIs
TAVILY_API_KEY=
EXA_API_KEY=
BRAVE_SEARCH_API_KEY=

# Content Extraction
FIRECRAWL_API_KEY=
JINA_API_KEY=

# Specialized APIs (optional)
SERPER_API_KEY=
PUBMED_API_KEY=
SEC_EDGAR_USER_AGENT=

# Browser Configuration
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=30000
BROWSER_POOL_SIZE=5

# Queue Configuration
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_CONCURRENCY_RESEARCH=10
QUEUE_CONCURRENCY_BROWSER=5
QUEUE_CONCURRENCY_DOCUMENTS=10

# Research Configuration
RESEARCH_MAX_SOURCES=100
RESEARCH_CACHE_TTL=3600
RESEARCH_DEFAULT_DEPTH=standard

# Task Configuration
TASK_DEFAULT_TIMEOUT=300
TASK_MAX_RETRIES=3

# File Storage
STORAGE_TYPE=s3  # s3, r2, or local
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
# OR for Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

---

# Summary

This implementation plan provides a complete blueprint for building a production-grade Deep Research and Autonomous Task Execution system using:

1. **LangGraph.js** — For stateful, multi-step workflow orchestration with checkpointing
2. **Vercel AI SDK** — For unified LLM interactions with streaming and tool calling
3. **Stagehand** — For AI-native browser automation using natural language
4. **BullMQ** — For reliable job queue processing with priorities and rate limiting

The system supports:
- 25+ research domains with specialized configurations
- 4 depth levels (quick to exhaustive)
- Multiple output formats (Markdown, PDF, DOCX, PPTX)
- Browser automation with natural language instructions
- Document and data processing agents
- Scheduled and recurring tasks
- Real-time progress streaming via WebSocket

Estimated timeline: 14 weeks for full implementation.
