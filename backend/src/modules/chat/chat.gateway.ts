import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { IntentService } from '../intent/intent.service';
import { AiService } from '../ai/ai.service';
import { LearningService } from '../learning/learning.service';
import { DataAnalysisService } from '../data-analysis/data-analysis.service';
import { QueryEngineAgent } from '../data-analysis/agents/query-engine.agent';
import { ChartBuilderAgent } from '../data-analysis/agents/chart-builder.agent';
import { FinanceAnalyzerAgent } from '../data-analysis/agents/finance-analyzer.agent';
import { CreditsService } from '../ai/llm/credits.service';
import { LLMRouterService } from '../ai/llm/llm-router.service';
import { AutoModelSelectorService } from '../ai/llm/auto-model-selector.service';
import { formatCredits } from '../ai/llm/dynamic-config';
import { ContextBuilderService } from '../context/context-builder.service';
import { CompactionService } from '../context/compaction.service';
import { BranchingService } from '../context/branching.service';
import { ToolIntentExtractionService } from '../context/tool-intent-extraction.service';
import { MemoryService } from '../memory/memory.service';
// AppMakerService was excluded from the open-source release.
// The app-builder branch below returns a "feature unavailable" message instead.
// import { AppMakerService } from '../app-maker/app-maker.service';
import { DeploymentService } from '../app-builder/services/deployment.service';
import { AppFilesService } from '../app-files/app-files.service';
import { GenerativeUiService } from '../generative-ui/generative-ui.service';

interface AuthContext {
  userId: string;
  email: string;
  name?: string;
  username?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  sessionId: string;
  conversationId?: string;
  metadata?: any;
}

interface ChatSession {
  id: string;
  conversationId: string;
  userId: string;
  status: 'active' | 'paused' | 'ended';
  createdAt: string;
  lastActivity: string;
  model?: string; // Selected model for this session
}

/**
 * Enhanced SuggestedTool interface with pre-fill data for tool intent extraction
 */
interface SuggestedTool {
  toolId: string;
  title: string;
  description: string;
  category: string;
  type: string;
  icon: string;
  // Pre-fill fields for enhanced tool suggestions
  prefillValues?: Record<string, any>;
  extractedFields?: Array<{
    fieldName: string;
    value: any;
    confidence: number;
    source: string;
  }>;
  attachmentMappings?: Array<{
    attachmentUrl: string;
    targetField: string;
  }>;
  readyToUse?: boolean;
  readinessPercentage?: number;
}

// Cache for storing recent app build completions for recovery on reconnect
interface CachedBuildCompletion {
  data: any;
  timestamp: number;
}

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  // Increase timeouts for long-running operations like app generation
  pingTimeout: 600000, // 10 minutes (for long app builds)
  pingInterval: 25000, // 25 seconds
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly activeSessions = new Map<string, ChatSession>();
  private readonly userSessions = new Map<string, Set<string>>();
  // Cache for recent app build completions (keyed by userId)
  // This allows recovery if client misses the completion event during reconnection
  private readonly pendingBuildCompletions = new Map<string, CachedBuildCompletion>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    private readonly intentService: IntentService,
    private readonly aiService: AiService,
    private readonly creditsService: CreditsService,
    private readonly llmRouter: LLMRouterService,
    private readonly autoModelSelector: AutoModelSelectorService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly compactionService: CompactionService,
    private readonly branchingService: BranchingService,
    private readonly toolIntentExtractionService: ToolIntentExtractionService,
    private readonly memoryService: MemoryService,
    // private readonly appMakerService: AppMakerService, // Excluded from OSS release
    private readonly deploymentService: DeploymentService,
    private readonly appFilesService: AppFilesService,
    private readonly learningService: LearningService,
    private readonly dataAnalysisService: DataAnalysisService,
    private readonly queryEngineAgent: QueryEngineAgent,
    private readonly chartBuilderAgent: ChartBuilderAgent,
    private readonly financeAnalyzerAgent: FinanceAnalyzerAgent,
    private readonly generativeUiService: GenerativeUiService,
  ) {
    this.logger.log('ChatGateway initialized with namespace: /chat');
  }

  afterInit(server: Server) {
    this.logger.log('ChatGateway WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      const authContext = await this.authenticateSocket(client);

      if (!authContext) {
        this.logger.warn(`Unauthenticated connection attempt: ${client.id}`);
        client.emit('auth:error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Store auth context on socket
      client.data.authContext = authContext;
      client.data.userId = authContext.userId;

      // Join user-specific room
      await client.join(`user:${authContext.userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${authContext.userId})`);

      client.emit('auth:success', {
        userId: authContext.userId,
        email: authContext.email,
        name: authContext.name,
        namespace: '/chat',
      });

    } catch (error) {
      this.logger.error(`Connection error for ${client.id}:`, error);
      client.emit('auth:error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const authContext = client.data?.authContext as AuthContext;
      this.logger.log(`Client disconnected: ${client.id} ${authContext ? `(User: ${authContext.userId})` : ''}`);
    } catch (error) {
      this.logger.error(`Disconnect error for ${client.id}:`, error);
    }
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  @SubscribeMessage('session:start')
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId?: string; model?: string; metadata?: any }
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('session:error', { message: 'Not authenticated' });
        return;
      }

      const { conversationId, model, metadata } = data;

      // Validate model if provided
      const defaultModel = this.llmRouter.getDefaultModel();
      const selectedModel = model || defaultModel.id;
      const modelConfig = this.llmRouter.getModelConfig(selectedModel);
      if (!modelConfig) {
        client.emit('session:error', { message: `Invalid model: ${model}` });
        return;
      }

      // Get user quota and check model access
      const quota = await this.creditsService.getUserQuota(authContext.userId);
      if (!quota.allowedModelTiers.includes(modelConfig.tier)) {
        client.emit('session:error', {
          message: `Your plan does not include access to ${modelConfig.tier} tier models. Please upgrade to use ${modelConfig.name}.`,
          code: 'MODEL_NOT_ALLOWED',
        });
        return;
      }

      // Use existing conversation if provided, otherwise defer creation until first message
      let conversation = null;
      let deferConversationCreation = false;

      if (conversationId) {
        try {
          conversation = await this.chatService.getConversation(conversationId, authContext.userId);
        } catch {
          // Invalid conversationId - defer creation until message is sent
          deferConversationCreation = true;
        }
      } else {
        // No conversationId - defer creation until message is sent
        deferConversationCreation = true;
      }

      // Create session with model
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const session: ChatSession = {
        id: sessionId,
        conversationId: conversation?.id || '', // Empty if deferred
        userId: authContext.userId,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        model: selectedModel,
      };

      // Store deferred flag on session for message handler
      (session as any).deferConversationCreation = deferConversationCreation;

      // Store session
      this.activeSessions.set(sessionId, session);

      // Track user sessions
      if (!this.userSessions.has(authContext.userId)) {
        this.userSessions.set(authContext.userId, new Set());
      }
      this.userSessions.get(authContext.userId).add(sessionId);

      // Join session room
      await client.join(`session:${sessionId}`);

      client.emit('session:started', {
        sessionId,
        conversationId: conversation?.id || null, // null if deferred until first message
        model: selectedModel,
        modelInfo: {
          displayName: modelConfig.name,
          provider: modelConfig.provider,
          tier: modelConfig.tier,
        },
        credits: {
          balance: quota.balance,
          balanceFormatted: formatCredits(quota.balance),
        },
        status: 'active',
        conversationDeferred: deferConversationCreation, // Tell frontend conversation will be created on first message
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Chat session started: ${sessionId} for user ${authContext.userId} with model ${selectedModel}`);
    } catch (error) {
      this.logger.error('Error starting chat session:', error);
      client.emit('session:error', { message: 'Failed to start session' });
    }
  }

  @SubscribeMessage('session:change-model')
  async handleChangeModel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; model: string }
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('session:error', { message: 'Not authenticated' });
        return;
      }

      const { sessionId, model } = data;
      const session = this.activeSessions.get(sessionId);

      if (!session || session.userId !== authContext.userId) {
        client.emit('session:error', { message: 'Session not found' });
        return;
      }

      // Validate model
      const modelConfig = this.llmRouter.getModelConfig(model);
      if (!modelConfig) {
        client.emit('session:error', { message: `Invalid model: ${model}` });
        return;
      }

      // Check access
      const quota = await this.creditsService.getUserQuota(authContext.userId);
      if (!quota.allowedModelTiers.includes(modelConfig.tier)) {
        client.emit('session:error', {
          message: `Your plan does not include access to ${modelConfig.tier} tier models.`,
          code: 'MODEL_NOT_ALLOWED',
        });
        return;
      }

      // Update session model
      session.model = model;

      client.emit('session:model-changed', {
        sessionId,
        model,
        modelInfo: {
          displayName: modelConfig.name,
          provider: modelConfig.provider,
          tier: modelConfig.tier,
        },
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Session ${sessionId} model changed to ${model}`);
    } catch (error) {
      this.logger.error('Error changing model:', error);
      client.emit('session:error', { message: 'Failed to change model' });
    }
  }

  @SubscribeMessage('models:list')
  async handleListModels(@ConnectedSocket() client: Socket) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('models:error', { message: 'Not authenticated' });
        return;
      }

      const quota = await this.creditsService.getUserQuota(authContext.userId);
      const availableModels = this.llmRouter.getAvailableModels();

      const defaultModel = this.llmRouter.getDefaultModel();

      client.emit('models:list', {
        models: availableModels.map(model => ({
          modelId: model.id,
          displayName: model.name,
          description: model.description,
          provider: model.provider,
          tier: model.tier,
          category: model.category,
          isDefault: model.isDefault,
          isAccessible: quota.allowedModelTiers.includes(model.tier),
          costPer1MInput: model.inputPrice,
          costPer1MOutput: model.outputPrice,
          supportsVision: model.supportsVision,
          supportsStreaming: model.supportsStreaming,
        })),
        defaultModel: defaultModel.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error listing models:', error);
      client.emit('models:error', { message: 'Failed to list models' });
    }
  }

  @SubscribeMessage('credits:balance')
  async handleGetBalance(@ConnectedSocket() client: Socket) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('credits:error', { message: 'Not authenticated' });
        return;
      }

      const quota = await this.creditsService.getUserQuota(authContext.userId);

      client.emit('credits:balance', {
        balance: quota.balance,
        balanceFormatted: formatCredits(quota.balance),
        includedBalance: quota.includedBalance,
        purchasedBalance: quota.purchasedBalance,
        allowedModelTiers: quota.allowedModelTiers,
        usage: {
          requestsToday: quota.requestsToday,
          tokensToday: quota.tokensToday,
          maxRequestsPerDay: quota.maxRequestsPerDay,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error getting balance:', error);
      client.emit('credits:error', { message: 'Failed to get balance' });
    }
  }

  @SubscribeMessage('session:end')
  async handleEndSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('session:error', { message: 'Not authenticated' });
        return;
      }

      const { sessionId } = data;

      if (!sessionId) {
        client.emit('session:error', { message: 'Session ID is required' });
        return;
      }

      const session = this.activeSessions.get(sessionId);
      if (!session) {
        client.emit('session:error', { message: 'Session not found' });
        return;
      }

      if (session.userId !== authContext.userId) {
        client.emit('session:error', { message: 'Access denied to session' });
        return;
      }

      // Update session status
      session.status = 'ended';
      session.lastActivity = new Date().toISOString();

      // Leave room
      await client.leave(`session:${sessionId}`);

      // Remove from tracking
      this.activeSessions.delete(sessionId);
      const userSessions = this.userSessions.get(authContext.userId);
      if (userSessions) {
        userSessions.delete(sessionId);
        if (userSessions.size === 0) {
          this.userSessions.delete(authContext.userId);
        }
      }

      client.emit('session:ended', {
        sessionId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Chat session ended: ${sessionId}`);
    } catch (error) {
      this.logger.error('Error ending chat session:', error);
      client.emit('session:error', { message: 'Failed to end session' });
    }
  }

  // ============================================
  // MESSAGE HANDLING WITH INTENT DETECTION
  // ============================================

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; message: string; metadata?: any; skipUserMessage?: boolean }
  ) {
    this.logger.log(`📩 [message:send] Received message from socket ${client.id}`);

    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        this.logger.warn(`[message:send] No auth context for socket ${client.id}`);
        client.emit('message:error', { message: 'Not authenticated' });
        return;
      }

      const { sessionId, message, metadata, skipUserMessage } = data;
      this.logger.log(`📩 [message:send] Session: ${sessionId}, Message: "${message?.substring(0, 50)}..."`)

      if (!sessionId || !message) {
        client.emit('message:error', { message: 'Session ID and message are required' });
        return;
      }

      const session = this.activeSessions.get(sessionId);
      if (!session) {
        client.emit('message:error', { message: 'Session not found' });
        return;
      }

      if (session.userId !== authContext.userId) {
        client.emit('message:error', { message: 'Access denied to session' });
        return;
      }

      // Create conversation on first message if it was deferred
      if ((session as any).deferConversationCreation || !session.conversationId) {
        this.logger.log(`Creating conversation on first message for session ${sessionId}`);
        const newConversation = await this.chatService.createConversation(authContext.userId, {
          model: session.model,
        });
        session.conversationId = newConversation.id;
        (session as any).deferConversationCreation = false;

        // Notify frontend of the new conversation ID
        client.emit('session:conversation-created', {
          sessionId,
          conversationId: newConversation.id,
          timestamp: new Date().toISOString(),
        });
      }

      let userMessageId: string;

      // Skip creating user message if flag is set (used when editing messages)
      if (skipUserMessage) {
        // Generate a placeholder ID - the user message already exists
        userMessageId = `edit-${Date.now()}`;
      } else {
        // Persist user message first to get real database ID
        let persistedUserMessage;
        try {
          persistedUserMessage = await this.chatService.persistSocketMessage(
            session.conversationId,
            session.userId,
            'user',
            message,
            metadata,
          );
        } catch (error) {
          this.logger.error('Failed to persist user message:', error.message);
          // Generate fallback ID if persistence fails
          persistedUserMessage = { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        }

        // Create user message with real database ID
        const userMessage: ChatMessage = {
          id: persistedUserMessage.id,
          message,
          sender: 'user',
          timestamp: new Date().toISOString(),
          sessionId,
          conversationId: session.conversationId,
          metadata,
        };

        userMessageId = persistedUserMessage.id;

        // Update session activity
        session.lastActivity = new Date().toISOString();

        // Emit user message back to confirm receipt
        this.server.to(`session:${sessionId}`).emit('message:received', userMessage);
      }

      // Send typing indicator
      this.server.to(`session:${sessionId}`).emit('message:typing', {
        sessionId,
        sender: 'assistant',
        isTyping: true,
        timestamp: new Date().toISOString(),
      });

      // Detect intent and process message
      await this.processMessageWithIntent(client, session, message, userMessageId, metadata);

    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('message:error', { message: 'Failed to send message' });
    }
  }

  private async processMessageWithIntent(
    client: Socket,
    session: ChatSession,
    message: string,
    userMessageId: string,
    metadata?: {
      attachments?: Array<{ url: string; name: string; type: string; size: number }>;
      modelId?: string;
      // Data analysis properties
      data?: any[];
      columns?: Array<{ name: string; type: string }>;
      datasetSchema?: any;
      tableName?: string;
      period?: string;
    },
  ) {
    try {
      // Fetch recent conversation messages for context (helps LLM resolve "this website", etc.)
      let conversationContext: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      try {
        const recentMessages = await this.chatService.getMessages(session.conversationId, session.userId, { limit: 10 });
        conversationContext = recentMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      } catch (error) {
        this.logger.warn('Could not fetch conversation context for intent detection');
      }

      // Detect intent with conversation context
      const intentResult = await this.intentService.detectIntent(message, conversationContext);

      // Emit intent detection result with userMessage for context
      this.server.to(`session:${session.id}`).emit('intent:detected', {
        sessionId: session.id,
        userMessage: message, // Include the original message for context handling
        intent: intentResult.intent,
        uiConfig: intentResult.uiConfig,
        timestamp: new Date().toISOString(),
      });

      let assistantResponse: string;
      let responseMetadata: any = {
        intent: intentResult.intent,
        uiConfig: intentResult.uiConfig,
      };
      let usedStreaming = false; // Track if we streamed the response

      // Debug logging for intent detection
      this.logger.log(`Intent detection result: matched=${intentResult.intent.matched}, fallbackToAI=${intentResult.intent.fallbackToAI}, confidence=${intentResult.intent.confidence}, uiType=${intentResult.uiConfig?.type}`);

      // IMPORTANT: When user has file attachments, ALWAYS let AI handle it
      // File analysis should go directly to AI with the file context, not to intent-based tools
      const hasFileAttachments = metadata?.attachments && metadata.attachments.length > 0;
      if (hasFileAttachments) {
        this.logger.log(`File attachments detected (${metadata.attachments.length} files), bypassing intent detection - letting AI analyze files`);
        intentResult.intent.matched = false;
        intentResult.intent.fallbackToAI = true;
      }

      if (intentResult.intent.matched && !intentResult.intent.fallbackToAI) {
        const pattern = intentResult.intent.pattern;

        this.logger.log(`Pattern matched: id=${pattern?.id}, uiType=${pattern?.uiType}, category=${pattern?.category}`);

        // For web-action intents, don't generate a backend response
        // The frontend handles these actions (screenshot, summarize, research) directly
        // and adds its own response to the conversation
        if (pattern?.uiType === 'web-action') {
          this.logger.log(`Web-action intent detected: ${pattern.metadata?.action || 'unknown'}`);

          // Stop typing indicator
          this.server.to(`session:${session.id}`).emit('message:typing', {
            sessionId: session.id,
            sender: 'assistant',
            isTyping: false,
            timestamp: new Date().toISOString(),
          });

          // Return early - frontend will handle the rest
          return;
        }

        // For chart/visualization intents - let AI handle it with file context
        // The context builder will include file data, so AI can generate charts naturally
        if (pattern?.uiType === 'chart' || pattern?.id?.includes('visualiz') || pattern?.id?.includes('chart')) {
          this.logger.log(`Chart intent detected, falling through to AI with file context`);
          // Let AI handle chart requests - it has access to file data via context builder
          intentResult.intent.matched = false;
          intentResult.intent.fallbackToAI = true;
        }

        // For most intent types - let AI handle directly instead of fake "I've prepared X tool" responses
        // Only specific types (app-builder, web-action) have special handling
        // Everything else (chat, calculator, converter, generator, etc.) should go to AI
        const specialHandledTypes = ['app-builder', 'web-action'];
        if (pattern?.uiType && !specialHandledTypes.includes(pattern.uiType)) {
          this.logger.log(`Intent type '${pattern.uiType}' (${pattern?.id}) - bypassing contextual response, letting AI handle with context`);
          intentResult.intent.matched = false;
          intentResult.intent.fallbackToAI = true;
        }

        // App-builder intent: AppMakerService is excluded from the open-source
        // release. We acknowledge the request but tell the user the feature is
        // unavailable. To restore: re-add the AppMakerModule and the original
        // logic from the private repo.
        if (pattern?.uiType === 'app-builder') {
          this.logger.log(
            `App-builder intent detected but AppMakerService is unavailable in the OSS build: ${pattern.metadata?.appDescription || 'unknown'}`,
          );

          this.server.to(`session:${session.id}`).emit('message:typing', {
            sessionId: session.id,
            sender: 'assistant',
            isTyping: false,
            timestamp: new Date().toISOString(),
          });

          assistantResponse =
            'The app-builder feature is not available in this open-source build. ' +
            'It depends on a separate `AppMakerService` module that ships only with the hosted version of wants.chat.';

          responseMetadata.patternId = pattern.id;
          responseMetadata.serviceBackend = pattern.serviceBackend;
          responseMetadata.appBuilder = { disabled: true };
        } else if (pattern?.category === 'learning_productivity' || intentResult.uiConfig?.metadata?.category === 'learning_productivity') {
          // Handle learning & productivity requests
          const learningSubType = pattern?.metadata?.learningSubType || intentResult.uiConfig?.metadata?.learningSubType || 'tutoring';
          this.logger.log(`Learning intent detected: ${learningSubType}`);

          try {
            const learningResult = await this.learningService.processLearningRequest({
              type: learningSubType,
              query: message,
              userId: session.userId,
              metadata: {
                ...pattern.metadata,
                text: pattern.metadata?.text || message,
              },
            });

            if (learningResult.success) {
              // Build response based on learning type
              let formattedResponse = learningResult.content;

              // Add additional data based on type
              if (learningResult.data) {
                if (learningSubType === 'tutoring' && learningResult.data.questions?.length > 0) {
                  formattedResponse += `\n\n---\n\n## Practice Questions\n`;
                  learningResult.data.questions.forEach((q: any, idx: number) => {
                    formattedResponse += `\n**${idx + 1}. ${q.question}**\n`;
                    if (q.options) {
                      q.options.forEach((opt: string, optIdx: number) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        formattedResponse += `   ${letter}) ${opt}\n`;
                      });
                    }
                  });

                  if (learningResult.data.suggestedTopics?.length > 0) {
                    formattedResponse += `\n\n### Related Topics to Explore\n`;
                    learningResult.data.suggestedTopics.forEach((topic: string) => {
                      formattedResponse += `- ${topic}\n`;
                    });
                  }
                }

                if (learningSubType === 'summarize' && learningResult.data.keyPoints?.length > 0) {
                  formattedResponse += `\n\n---\n\n## Key Points\n`;
                  learningResult.data.keyPoints.forEach((point: string) => {
                    formattedResponse += `- ${point}\n`;
                  });

                  if (learningResult.data.actionItems?.length > 0) {
                    formattedResponse += `\n\n## Action Items\n`;
                    learningResult.data.actionItems.forEach((item: string) => {
                      formattedResponse += `- [ ] ${item}\n`;
                    });
                  }
                }

                if (learningSubType === 'organize' && learningResult.data.milestones?.length > 0) {
                  formattedResponse += `\n\n---\n\n## Milestones\n`;
                  learningResult.data.milestones.forEach((milestone: any) => {
                    formattedResponse += `\n### ${milestone.title}\n`;
                    if (milestone.description) {
                      formattedResponse += `${milestone.description}\n`;
                    }
                    if (milestone.date) {
                      formattedResponse += `📅 Target: ${milestone.date}\n`;
                    }
                  });
                }

                if (learningSubType === 'writing' && learningResult.data.analysis) {
                  const analysis = learningResult.data.analysis;
                  formattedResponse += `\n\n---\n\n## Writing Analysis\n`;
                  if (analysis.tone) formattedResponse += `- **Tone**: ${analysis.tone}\n`;
                  if (analysis.formality) formattedResponse += `- **Formality**: ${analysis.formality}\n`;
                  if (analysis.suggestions?.length > 0) {
                    formattedResponse += `\n### Suggestions for Improvement\n`;
                    analysis.suggestions.forEach((s: string) => {
                      formattedResponse += `- ${s}\n`;
                    });
                  }
                }
              }

              assistantResponse = formattedResponse;
              responseMetadata.learning = {
                type: learningSubType,
                data: learningResult.data,
                suggestedTools: learningResult.suggestedTools,
              };
            } else {
              assistantResponse = learningResult.content || 'I encountered an issue processing your learning request. Please try again.';
            }
          } catch (error) {
            this.logger.error(`Learning service error: ${error.message}`);
            assistantResponse = `I'm sorry, I encountered an error while processing your ${learningSubType} request. Please try again or rephrase your question.`;
          }

          responseMetadata.patternId = pattern?.id;
          responseMetadata.category = 'learning_productivity';
        } else if (pattern?.category === 'data_analysis' || intentResult.uiConfig?.metadata?.category === 'data_analysis') {
          // Handle data analysis requests
          const analysisType = pattern?.metadata?.analysisType || intentResult.uiConfig?.metadata?.analysisType || 'general';
          this.logger.log(`Data analysis intent detected: ${analysisType}`);

          try {
            let analysisResult: any;
            let formattedResponse = '';

            switch (analysisType) {
              case 'query':
                // Natural language to SQL query
                if (metadata?.datasetSchema) {
                  const queryResult = await this.queryEngineAgent.translateToSQL(
                    message,
                    metadata.datasetSchema,
                    { tableName: metadata.tableName, maxRows: 100 },
                  );

                  if (queryResult.success && queryResult.data) {
                    formattedResponse = `**Query Generated**\n\n\`\`\`sql\n${queryResult.data.sql}\n\`\`\`\n\n**Explanation:** ${queryResult.data.explanation}`;
                    analysisResult = queryResult.data;
                  } else {
                    formattedResponse = `I couldn't generate a query. ${queryResult.error || 'Please try rephrasing your question.'}`;
                  }
                } else {
                  formattedResponse = 'Please provide data or upload a file first to run queries.';
                }
                break;

              case 'chart':
                // Chart suggestions
                if (metadata?.data && metadata?.columns) {
                  const chartResult = await this.chartBuilderAgent.suggestCharts(
                    metadata.data,
                    metadata.columns,
                    message,
                  );

                  if (chartResult.success && chartResult.data && chartResult.data.length > 0) {
                    formattedResponse = `**Recommended Visualizations**\n\n`;
                    chartResult.data.forEach((suggestion, idx) => {
                      formattedResponse += `${idx + 1}. **${suggestion.chartType.toUpperCase()} Chart**: ${suggestion.title}\n`;
                      formattedResponse += `   - X-axis: ${suggestion.xAxis}\n`;
                      formattedResponse += `   - Y-axis: ${suggestion.yAxis}\n`;
                      formattedResponse += `   - Reason: ${suggestion.reason}\n\n`;
                    });
                    analysisResult = chartResult.data;
                  } else {
                    formattedResponse = 'I couldn\'t generate chart suggestions. Please provide more context about your data.';
                  }
                } else {
                  formattedResponse = 'Please provide data to generate chart suggestions.';
                }
                break;

              case 'financial':
                // Financial analysis
                if (metadata?.data) {
                  const financeResult = await this.financeAnalyzerAgent.analyzePnL(
                    metadata.data,
                    { period: metadata.period },
                  );

                  if (financeResult.success && financeResult.data) {
                    const pnl = financeResult.data;
                    formattedResponse = `**Financial Analysis**\n\n`;
                    formattedResponse += `${pnl.summary}\n\n`;
                    formattedResponse += `**Revenue:** $${this.formatNumber(pnl.revenue.total)}\n`;
                    formattedResponse += `**Costs:** $${this.formatNumber(pnl.costs.total)}\n`;
                    if (pnl.margins.gross !== undefined) {
                      formattedResponse += `**Gross Margin:** ${(pnl.margins.gross * 100).toFixed(1)}%\n`;
                    }

                    if (pnl.insights.length > 0) {
                      formattedResponse += `\n**Insights:**\n`;
                      pnl.insights.forEach(insight => {
                        formattedResponse += `- ${insight}\n`;
                      });
                    }

                    if (pnl.recommendations.length > 0) {
                      formattedResponse += `\n**Recommendations:**\n`;
                      pnl.recommendations.forEach(rec => {
                        formattedResponse += `- ${rec}\n`;
                      });
                    }

                    analysisResult = financeResult.data;
                  } else {
                    formattedResponse = `I couldn't complete the financial analysis. ${financeResult.error || 'Please check your data format.'}`;
                  }
                } else {
                  formattedResponse = 'Please provide financial data to analyze.';
                }
                break;

              case 'summarize':
              case 'analyze':
              default:
                // General data analysis using existing service
                if (metadata?.data) {
                  const summaryResult = await this.dataAnalysisService.summarizeData({
                    data: metadata.data,
                    columns: metadata.columns?.map(c => c.name),
                  });

                  formattedResponse = `**Data Summary**\n\n`;
                  formattedResponse += `- **Rows:** ${summaryResult.rowCount.toLocaleString()}\n`;
                  formattedResponse += `- **Columns:** ${summaryResult.columnCount}\n`;
                  formattedResponse += `- **Data Quality:** ${(summaryResult.dataQualityScore * 100).toFixed(0)}%\n`;

                  if (summaryResult.aiSummary) {
                    formattedResponse += `\n**Analysis:**\n${summaryResult.aiSummary}\n`;
                  }

                  // Show column statistics
                  if (summaryResult.columns.length > 0) {
                    formattedResponse += `\n**Column Details:**\n`;
                    summaryResult.columns.slice(0, 5).forEach(col => {
                      formattedResponse += `- **${col.name}** (${col.type}): `;
                      if (col.type === 'number' && col.numericStats) {
                        formattedResponse += `min=${col.numericStats.min.toFixed(2)}, max=${col.numericStats.max.toFixed(2)}, avg=${col.numericStats.mean.toFixed(2)}`;
                      } else {
                        formattedResponse += `${col.uniqueCount} unique values`;
                      }
                      formattedResponse += `\n`;
                    });
                    if (summaryResult.columns.length > 5) {
                      formattedResponse += `- ...and ${summaryResult.columns.length - 5} more columns\n`;
                    }
                  }

                  analysisResult = summaryResult;
                } else {
                  // Just use AI to explain what kind of analysis they can do
                  formattedResponse = `I can help you analyze data! Here's what I can do:\n\n`;
                  formattedResponse += `- **Upload & Analyze**: Upload CSV or Excel files for automatic profiling and insights\n`;
                  formattedResponse += `- **Query Data**: Ask questions in plain English and I'll generate SQL queries\n`;
                  formattedResponse += `- **Create Charts**: Get visualization recommendations and chart configurations\n`;
                  formattedResponse += `- **Financial Analysis**: Analyze P&L, calculate ratios, generate forecasts\n\n`;
                  formattedResponse += `Try uploading a file or describing your data!`;
                }
                break;
            }

            assistantResponse = formattedResponse;
            responseMetadata.dataAnalysis = {
              type: analysisType,
              data: analysisResult,
            };
          } catch (error) {
            this.logger.error(`Data analysis error: ${error.message}`);
            assistantResponse = `I'm sorry, I encountered an error while analyzing your data. Please try again or provide more context.`;
          }

          responseMetadata.patternId = pattern?.id;
          responseMetadata.category = 'data_analysis';
        } else if (!intentResult.intent.fallbackToAI) {
          // Pattern matched - provide contextual response for other intent types
          // Skip if fallbackToAI was set (e.g., by chart handler)
          assistantResponse = this.generateContextualResponse(pattern, message);
          responseMetadata.patternId = pattern.id;
          responseMetadata.serviceBackend = pattern.serviceBackend;
          responseMetadata.endpoint = pattern.endpoint;
        }
      }

      // Fallback to AI - either no match or fallbackToAI was set
      if (!intentResult.intent.matched || intentResult.intent.fallbackToAI) {
        // Check if we should generate a custom UI instead of a plain AI response
        if (!assistantResponse && this.generativeUiService.shouldGenerateUi(message, intentResult.intent.confidence)) {
          try {
            this.logger.log(`Attempting generative UI for: "${message.substring(0, 50)}..."`);
            const generatedUi = await this.generativeUiService.generateUi(
              session.userId,
              message,
              { conversationId: session.conversationId },
            );

            // Emit the generated UI to the client
            this.server.to(`session:${session.id}`).emit('generative-ui:created', {
              sessionId: session.id,
              html: generatedUi.html,
              title: generatedUi.title,
              description: generatedUi.description,
              timestamp: new Date().toISOString(),
            });

            responseMetadata.generativeUi = {
              title: generatedUi.title,
              description: generatedUi.description,
            };

            assistantResponse = `I've created a custom "${generatedUi.title}" for you. ${generatedUi.description}`;
          } catch (error) {
            this.logger.warn('Generative UI creation failed, falling through to AI:', error.message);
            // Fall through to normal AI response
          }
        }

        if (!assistantResponse) {
        // Fallback to AI using selected model with STREAMING
        try {
          const defaultModel = this.llmRouter.getDefaultModel();
          let selectedModel = session.model || defaultModel.id;

          // Get user quota for tier info
          const quota = await this.creditsService.getUserQuota(session.userId);

          // Check for image attachments
          const hasImages = metadata?.attachments?.some(a => a.type.startsWith('image/')) || false;

          // Auto model selection if "auto" is selected
          if (selectedModel === 'auto') {
            const autoResult = this.autoModelSelector.selectModel(
              message,
              'auto',
              quota.allowedModelTiers[quota.allowedModelTiers.length - 1] as any || 'standard',
              hasImages,
            );
            selectedModel = autoResult.model.id;
            responseMetadata.autoSelected = true;
            responseMetadata.autoReason = autoResult.reason;
            this.logger.log(`Auto-selected model: ${selectedModel} - ${autoResult.reason}`);
          } else if (metadata?.modelId) {
            // Use the model specified in metadata
            const specifiedModel = this.llmRouter.getModelConfig(metadata.modelId);
            if (specifiedModel && quota.allowedModelTiers.includes(specifiedModel.tier)) {
              selectedModel = metadata.modelId;
            }
          }

          // Build context using the smart context builder
          const builtContext = await this.contextBuilder.buildContext({
            userId: session.userId,
            conversationId: session.conversationId,
            currentMessage: message,
            model: selectedModel,
            attachments: metadata?.attachments,
          });

          this.logger.debug(
            `Context built: ${builtContext.memoriesUsed} memories, ` +
            `${builtContext.summariesUsed} summaries, ` +
            `${builtContext.recentMessagesCount} recent messages, ` +
            `~${builtContext.totalTokens} tokens` +
            (hasImages ? `, ${metadata.attachments.filter(a => a.type.startsWith('image/')).length} images` : ''),
          );

          // Generate a message ID for streaming
          const streamMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Emit stream start event
          this.server.to(`session:${session.id}`).emit('message:stream:start', {
            messageId: streamMessageId,
            sessionId: session.id,
            model: selectedModel,
            timestamp: new Date().toISOString(),
          });

          // Use streaming chat method - tokens arrive as they're generated
          assistantResponse = '';
          for await (const chunk of this.aiService.chatStream(builtContext.messages, {
            model: selectedModel,
            userId: session.userId,
            conversationId: session.conversationId,
            attachments: metadata?.attachments,
          })) {
            assistantResponse += chunk;

            // Emit each chunk as it arrives (ChatGPT-like streaming)
            this.server.to(`session:${session.id}`).emit('message:stream:chunk', {
              messageId: streamMessageId,
              sessionId: session.id,
              chunk: chunk,
              timestamp: new Date().toISOString(),
            });
          }

          // Mark that we used streaming - don't emit message:received again
          // Note: stream:end will be emitted AFTER persistence to include the real database ID
          usedStreaming = true;

          responseMetadata.model = selectedModel;
          responseMetadata.streamMessageId = streamMessageId; // Store for later
          responseMetadata.contextInfo = {
            memoriesUsed: builtContext.memoriesUsed,
            summariesUsed: builtContext.summariesUsed,
            recentMessages: builtContext.recentMessagesCount,
            estimatedTokens: builtContext.totalTokens,
          };
          // Include suggested tools so frontend can make them clickable in response
          responseMetadata.suggestedTools = builtContext.suggestedTools;

          // After AI streaming is complete, extract tool intent for suggestions
          if (metadata?.attachments?.length > 0 || builtContext.suggestedTools?.length > 0) {
            try {
              const toolIntent = await this.toolIntentExtractionService.extractToolIntent({
                message,
                attachments: metadata?.attachments,
                conversationContext: conversationContext,
                userId: session.userId,
              });

              // Merge with existing suggestedTools
              if (toolIntent.suggestedTools?.length > 0) {
                // Prioritize tools with pre-filled values
                const enhancedTools: SuggestedTool[] = toolIntent.suggestedTools.map(tool => ({
                  toolId: tool.toolId,
                  title: tool.toolName || tool.toolId,
                  description: tool.description || '',
                  category: tool.category || '',
                  type: 'contextual-ui',
                  icon: tool.icon || '',
                  prefillValues: tool.prefillValues,
                  extractedFields: tool.extractedFields?.map(field => ({
                    fieldName: field.fieldName,
                    value: field.value,
                    confidence: field.confidence,
                    source: field.source,
                  })),
                  attachmentMappings: tool.attachmentMappings?.map(mapping => ({
                    attachmentUrl: mapping.attachmentId,
                    targetField: mapping.fieldName,
                  })),
                  readyToUse: tool.isReady,
                  readinessPercentage: tool.isReady ? 100 :
                    (tool.missingRequiredFields
                      ? Math.round((1 - tool.missingRequiredFields.length / 5) * 100)
                      : 50),
                }));

                responseMetadata.suggestedTools = enhancedTools;
              }

              // Store tool intent for inclusion in stream:end event
              responseMetadata.toolIntent = {
                primaryIntent: toolIntent.primaryIntent,
                userGoal: toolIntent.userGoal,
                extractedValues: toolIntent.extractedValues,
                hasFileAction: toolIntent.hasFileAction,
                requiresMoreInfo: toolIntent.requiresMoreInfo,
                followUpQuestions: toolIntent.followUpQuestions,
              };
            } catch (error) {
              this.logger.warn('Tool intent extraction failed:', error.message);
              // Don't fail the whole response, just skip enhanced tools
            }
          }

          // Extract memories from user message (background, don't await)
          this.extractMemoriesBackground(session.userId, message, session.conversationId);

        } catch (error) {
          if (error.message?.includes('Insufficient credits') || error.message?.includes('Quota exceeded')) {
            // Emit credit error
            this.server.to(`session:${session.id}`).emit('credits:insufficient', {
              sessionId: session.id,
              message: error.message,
              timestamp: new Date().toISOString(),
            });
            throw error;
          }
          throw error;
        }
        } // end if (!assistantResponse)
      } // end if (!intentResult.intent.matched || intentResult.intent.fallbackToAI)

      // Persist assistant message first to get real database ID
      let persistedAssistantMessage;
      try {
        persistedAssistantMessage = await this.chatService.persistSocketMessage(
          session.conversationId,
          session.userId,
          'assistant',
          assistantResponse,
          responseMetadata,
        );
      } catch (error) {
        this.logger.error('Failed to persist assistant message:', error.message);
        // Generate fallback ID if persistence fails
        persistedAssistantMessage = { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
      }

      // Stop typing indicator
      this.server.to(`session:${session.id}`).emit('message:typing', {
        sessionId: session.id,
        sender: 'assistant',
        isTyping: false,
        timestamp: new Date().toISOString(),
      });

      // Create assistant message with real database ID
      const assistantMessage: ChatMessage = {
        id: persistedAssistantMessage.id,
        message: assistantResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        sessionId: session.id,
        conversationId: session.conversationId,
        metadata: responseMetadata,
      };

      // Only emit message:received if we didn't use streaming
      // (streaming already sent the content via stream:chunk events)
      if (!usedStreaming) {
        this.server.to(`session:${session.id}`).emit('message:received', assistantMessage);
      } else {
        // For streaming: emit stream:end NOW with the persisted database ID
        // This allows frontend to update the temporary streaming ID with the real UUID
        this.server.to(`session:${session.id}`).emit('message:stream:end', {
          messageId: responseMetadata.streamMessageId, // Original streaming ID
          persistedId: persistedAssistantMessage.id, // Real database UUID
          sessionId: session.id,
          fullContent: assistantResponse,
          suggestedTools: responseMetadata.suggestedTools || [], // Tools for inline clickable mentions (enhanced with pre-fill data)
          // NEW: Include tool intent data for enhanced tool suggestions
          toolIntent: responseMetadata.toolIntent || null,
          timestamp: new Date().toISOString(),
        });
      }

      // Emit updated credit balance after message (for real-time header update)
      try {
        const updatedQuota = await this.creditsService.getUserQuota(session.userId);
        this.server.to(`session:${session.id}`).emit('credits:updated', {
          balance: updatedQuota.balance,
          balanceFormatted: formatCredits(updatedQuota.balance),
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        this.logger.warn('Failed to emit credit update:', err.message);
      }

      // Generate title for new conversation (background, don't await)
      this.generateTitleBackground(session.conversationId, session.userId, message);

      // Check if conversation needs compaction (background)
      this.checkCompactionBackground(session.conversationId);

      this.logger.debug(`Message processed in session ${session.id}`);

    } catch (error) {
      this.logger.error('Error processing message with intent:', error);

      // Stop typing and send error
      this.server.to(`session:${session.id}`).emit('message:typing', {
        sessionId: session.id,
        sender: 'assistant',
        isTyping: false,
        timestamp: new Date().toISOString(),
      });

      this.server.to(`session:${session.id}`).emit('message:received', {
        id: `msg-${Date.now()}`,
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        sessionId: session.id,
        metadata: { error: true },
      });
    }
  }

  private generateContextualResponse(pattern: any, userMessage: string): string {
    const responses: Record<string, string> = {
      converter: `I can help you with that! I've opened the **${pattern.title}** for you. ${pattern.description}. You can upload your file or provide the content you want to convert.`,
      generator: `Great! I've activated the **${pattern.title}**. ${pattern.description}. Please describe what you'd like to create or provide any specific requirements.`,
      calculator: `I've opened the **${pattern.title}** for you. ${pattern.description}. Enter your values and I'll help you calculate.`,
      editor: `The **${pattern.title}** is ready! ${pattern.description}. Share what you'd like to work on.`,
      'bot-builder': `Excellent choice! The **${pattern.title}** is now active. ${pattern.description}. Let's start building your chatbot - what would you like it to do?`,
      'app-builder': `The **${pattern.title}** is ready to help you create something amazing. ${pattern.description}. What kind of app are you thinking about?`,
      builder: `I've opened the **${pattern.title}**. ${pattern.description}. Let's start building!`,
      dashboard: `The **${pattern.title}** is now showing your data. ${pattern.description}. What would you like to analyze?`,
      scanner: `The **${pattern.title}** is ready. ${pattern.description}. You can upload an image or use your camera.`,
      timeline: `I've prepared the **${pattern.title}** for you. ${pattern.description}. Let's organize your schedule.`,
      chart: `The **${pattern.title}** is ready. ${pattern.description}. Provide your data and I'll visualize it for you.`,
      form: `I've opened the **${pattern.title}**. ${pattern.description}. Fill in the details to get started.`,
      table: `The **${pattern.title}** is ready for comparison. ${pattern.description}. What would you like to compare?`,
      cards: `Here's the **${pattern.title}**. ${pattern.description}. I'll display your content in an organized way.`,
      list: `The **${pattern.title}** is ready. ${pattern.description}. Let's organize your items.`,
      splitter: `I've activated the **${pattern.title}**. ${pattern.description}. Upload your image to get started.`,
      // Web action responses are handled by the frontend via intent:detected event
      // The frontend will capture screenshots, summarize pages, or perform research
      'web-action': `Processing your ${pattern.metadata?.action || 'web'} request...`,
    };

    return responses[pattern.uiType] ||
      `I've prepared the **${pattern.title}** tool for you. ${pattern.description}. How can I assist you further?`;
  }

  /**
   * Extract memories from user message in background
   * Don't await this - let it run asynchronously
   */
  private extractMemoriesBackground(userId: string, message: string, conversationId: string) {
    this.logger.log(`🧠 [MEMORY] Starting memory extraction for user ${userId}`);
    this.logger.log(`🧠 [MEMORY] Message: "${message.substring(0, 100)}..."`);

    // Run in background, don't block the response
    this.memoryService
      .extractMemoriesFromMessage(userId, message, conversationId)
      .then((memories) => {
        if (memories.length > 0) {
          this.logger.log(`🧠 [MEMORY] Successfully extracted ${memories.length} memories from user message`);
          memories.forEach((m, i) => {
            this.logger.log(`🧠 [MEMORY] Memory ${i + 1}: ${m.content}`);
          });
        } else {
          this.logger.log(`🧠 [MEMORY] No memories extracted from message`);
        }
      })
      .catch((error) => {
        this.logger.error(`🧠 [MEMORY] Failed to extract memories: ${error.message}`);
        this.logger.error(`🧠 [MEMORY] Full error:`, error);
      });
  }

  /**
   * Generate title for new conversation in background
   */
  private generateTitleBackground(conversationId: string, userId: string, firstMessage: string) {
    this.logger.log(`🏷️ [TITLE] Starting title generation for conversation ${conversationId}`);
    this.logger.log(`🏷️ [TITLE] First message: "${firstMessage.substring(0, 50)}..."`);

    // Run in background, don't block the response
    this.chatService
      .getConversation(conversationId, userId)
      .then(async (conversation) => {
        this.logger.log(`🏷️ [TITLE] Current title: "${conversation.title}" (type: ${typeof conversation.title})`);

        // Only generate if no title yet (new conversation)
        if (!conversation.title || conversation.title === 'New Chat') {
          this.logger.log(`🏷️ [TITLE] No title found, generating...`);
          await this.chatService.generateAndSetTitle(conversationId, userId, firstMessage);
          this.logger.log(`🏷️ [TITLE] Title generation completed for ${conversationId}`);

          // Fetch updated conversation and emit to user
          const updatedConversation = await this.chatService.getConversation(conversationId, userId);
          this.logger.log(`🏷️ [TITLE] New title: "${updatedConversation.title}"`);

          this.server.to(`user:${userId}`).emit('conversation:updated', {
            conversationId,
            title: updatedConversation.title,
            timestamp: new Date().toISOString(),
          });
        } else {
          this.logger.log(`🏷️ [TITLE] Skipping - conversation already has title: "${conversation.title}"`);
        }
      })
      .catch((error) => {
        this.logger.error(`🏷️ [TITLE] Failed to generate title: ${error.message}`);
        this.logger.error(`🏷️ [TITLE] Full error:`, error);
      });
  }

  /**
   * Check if conversation needs compaction in background
   */
  private checkCompactionBackground(conversationId: string) {
    // Run in background, don't block the response
    this.compactionService
      .shouldCompact(conversationId)
      .then(async (needsCompaction) => {
        if (needsCompaction) {
          this.logger.log(`Triggering compaction for conversation ${conversationId}`);
          await this.compactionService.compactConversation(conversationId);
        }
      })
      .catch((error) => {
        this.logger.error(`Failed to check/trigger compaction: ${error.message}`);
      });
  }

  @SubscribeMessage('message:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; isTyping: boolean }
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) return;

      const { sessionId, isTyping } = data;
      if (!sessionId) return;

      const session = this.activeSessions.get(sessionId);
      if (!session || session.userId !== authContext.userId) return;

      // Emit to other participants in session
      client.to(`session:${sessionId}`).emit('message:typing', {
        sessionId,
        userId: authContext.userId,
        sender: 'user',
        isTyping,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error handling typing indicator:', error);
    }
  }

  // ============================================
  // HISTORY
  // ============================================

  @SubscribeMessage('messages:history')
  async handleGetHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; conversationId?: string; limit?: number }
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('messages:error', { message: 'Not authenticated' });
        return;
      }

      const { sessionId, conversationId, limit = 50 } = data;

      const session = this.activeSessions.get(sessionId);
      const convId = conversationId || session?.conversationId;

      if (!convId) {
        client.emit('messages:error', { message: 'Conversation not found' });
        return;
      }

      const messages = await this.chatService.getMessages(convId, authContext.userId, { limit });

      client.emit('messages:history', {
        sessionId,
        conversationId: convId,
        messages: messages.map(m => ({
          id: m.id,
          message: m.content,
          sender: m.role === 'user' ? 'user' : 'assistant',
          timestamp: m.created_at,
          metadata: m.metadata,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error getting message history:', error);
      client.emit('messages:error', { message: 'Failed to get history' });
    }
  }

  // ============================================
  // APP BUILDER RECOVERY
  // ============================================

  /**
   * Check for pending app build completion that may have been missed during reconnection.
   * Call this after reconnecting to recover the completion event.
   */
  @SubscribeMessage('app-builder:check-pending')
  async handleCheckPendingBuild(@ConnectedSocket() client: Socket) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('app-builder:pending', { hasPending: false });
        return;
      }

      const pending = this.pendingBuildCompletions.get(authContext.userId);

      // Only return completions from the last 10 minutes (to avoid stale data)
      const maxAge = 10 * 60 * 1000; // 10 minutes
      if (pending && (Date.now() - pending.timestamp) < maxAge) {
        this.logger.log(`Recovering pending build completion for user ${authContext.userId}`);

        // Clear the cache since we're delivering it now
        this.pendingBuildCompletions.delete(authContext.userId);

        // Re-emit the completion event
        client.emit('app-builder:completed', pending.data);
        client.emit('app-builder:pending', { hasPending: true, recovered: true });
      } else {
        // Clean up old cached data if any
        if (pending) {
          this.pendingBuildCompletions.delete(authContext.userId);
        }
        client.emit('app-builder:pending', { hasPending: false });
      }
    } catch (error) {
      this.logger.error('Error checking pending build:', error);
      client.emit('app-builder:pending', { hasPending: false, error: 'Check failed' });
    }
  }

  // ============================================
  // PUBLIC METHODS FOR EXTERNAL USE
  // ============================================

  async emitToSession(sessionId: string, event: string, data: any) {
    this.server.to(`session:${sessionId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  async emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getSessionStats() {
    return {
      activeSessions: this.activeSessions.size,
      uniqueUsers: this.userSessions.size,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  private async authenticateSocket(client: Socket): Promise<AuthContext | null> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        return null;
      }

      // Decode JWT (not verify - token is signed by our backend)
      const payload = this.jwtService.decode(token) as any;

      if (!payload) {
        return null;
      }

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        userId: payload.sub || payload.userId,
        email: payload.email,
        name: payload.name,
        username: payload.username,
      };
    } catch (error) {
      this.logger.error('Socket authentication error:', error);
      return null;
    }
  }

  // ==================== BRANCHING HANDLERS ====================

  /**
   * Handle message edit - creates a new version and regenerates response
   */
  @SubscribeMessage('message:edit')
  async handleMessageEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; newContent: string; regenerate?: boolean },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('branch:error', { message: 'Not authenticated' });
        return;
      }

      const { messageId, newContent, regenerate = true } = data;

      // Edit the message (creates new version)
      const result = await this.branchingService.editMessage(
        authContext.userId,
        messageId,
        newContent,
      );

      // Emit the edit result
      client.emit('message:edited', {
        originalMessageId: messageId,
        newMessageId: result.newMessageId,
        branchId: result.branchId,
        archivedMessageIds: result.archivedMessageIds,
        content: newContent,
      });

      // If regenerate is requested, trigger a new response for the edited message
      if (regenerate) {
        // Get the session for this conversation
        const sessions = this.userSessions.get(authContext.userId);
        if (sessions) {
          const sessionId = Array.from(sessions)[0];
          const session = this.activeSessions.get(sessionId);

          if (session) {
            // Emit that we're regenerating
            client.emit('message:regenerating', {
              editedMessageId: result.newMessageId,
            });

            // Trigger message processing with the new content
            await this.handleSendMessage(client, {
              message: newContent,
              sessionId: session.id,
              metadata: { isRegeneration: true, editedFromMessageId: messageId },
            });
          }
        }
      }

      this.logger.log(`Message ${messageId} edited by user ${authContext.userId}`);
    } catch (error) {
      this.logger.error('Message edit error:', error);
      client.emit('branch:error', {
        message: error.message || 'Failed to edit message',
      });
    }
  }

  /**
   * Handle branch creation from a specific message point
   */
  @SubscribeMessage('branch:create')
  async handleBranchCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; label?: string },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('branch:error', { message: 'Not authenticated' });
        return;
      }

      const { messageId, label } = data;

      const result = await this.branchingService.createBranch(
        authContext.userId,
        messageId,
        label,
      );

      client.emit('branch:created', {
        branchId: result.branchId,
        parentMessageId: messageId,
        newMessageId: result.newMessageId,
        label: label || 'New Branch',
      });

      this.logger.log(`Branch created from message ${messageId} by user ${authContext.userId}`);
    } catch (error) {
      this.logger.error('Branch create error:', error);
      client.emit('branch:error', {
        message: error.message || 'Failed to create branch',
      });
    }
  }

  /**
   * Handle switching to a different branch
   */
  @SubscribeMessage('branch:switch')
  async handleBranchSwitch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { branchId: string },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('branch:error', { message: 'Not authenticated' });
        return;
      }

      const { branchId } = data;

      const result = await this.branchingService.switchBranch(
        authContext.userId,
        branchId,
      );

      client.emit('branch:switched', {
        activatedBranchId: result.activatedBranchId,
      });

      this.logger.log(`Switched to branch ${branchId} for user ${authContext.userId}`);
    } catch (error) {
      this.logger.error('Branch switch error:', error);
      client.emit('branch:error', {
        message: error.message || 'Failed to switch branch',
      });
    }
  }

  /**
   * Get message versions (edit history)
   */
  @SubscribeMessage('message:versions')
  async handleGetMessageVersions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('branch:error', { message: 'Not authenticated' });
        return;
      }

      const versions = await this.branchingService.getMessageVersions(
        authContext.userId,
        data.messageId,
      );

      client.emit('message:versions', {
        messageId: data.messageId,
        versions,
      });
    } catch (error) {
      this.logger.error('Get versions error:', error);
      client.emit('branch:error', {
        message: error.message || 'Failed to get message versions',
      });
    }
  }

  /**
   * Get branches for a conversation
   */
  @SubscribeMessage('conversation:branches')
  async handleGetConversationBranches(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('branch:error', { message: 'Not authenticated' });
        return;
      }

      const branches = await this.branchingService.getConversationBranches(
        authContext.userId,
        data.conversationId,
      );

      client.emit('conversation:branches', {
        conversationId: data.conversationId,
        branches,
      });
    } catch (error) {
      this.logger.error('Get branches error:', error);
      client.emit('branch:error', {
        message: error.message || 'Failed to get branches',
      });
    }
  }

  /**
   * Handle code modification requests with AI assistance
   */
  @SubscribeMessage('code:modify')
  async handleCodeModify(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      appId: string;
      type: 'frontend' | 'backend' | 'mobile';
      filePath: string;
      instruction: string;
      sessionId?: string;
    },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('code:error', { message: 'Not authenticated' });
        return;
      }

      this.logger.log(`Code modification requested for ${data.appId}/${data.type}/${data.filePath}`);

      // Emit progress
      client.emit('code:progress', {
        status: 'loading',
        message: 'Loading current file content...',
      });

      // Get current file content
      const currentFile = await this.appFilesService.getFileContent(
        data.appId,
        data.type,
        data.filePath,
      );

      client.emit('code:progress', {
        status: 'generating',
        message: 'Generating code modifications...',
      });

      // Build SDK context for backend files
      let sdkContext = '';
      if (data.type === 'backend') {
        sdkContext = `
## Fluxez SDK Reference
The backend uses @fluxez/node-sdk. Key patterns:

### Database Queries
- SELECT multiple: \`db.query.from('table').select('*').where('col', val).get()\`
- SELECT single: \`db.query.from('table').where('id', id).first()\`
- INSERT: \`db.query.from('table').insert({...}).returning('*').execute()\` -> access via \`result.data?.[0]\`
- UPDATE: \`db.query.from('table').where('id', id).update({...}).execute()\`
- DELETE: \`db.query.from('table').where('id', id).delete().execute()\`

### Auth
- \`auth.register({ email, password, name })\`
- \`auth.login({ email, password })\` -> returns { token, user }
- \`auth.verifyToken(token)\` -> returns { userId, email }

### Get User ID in routes
\`const userId = user.userId || user.id || user.sub;\`

### Response patterns
- List: \`c.json(items)\` - array directly
- Single: \`c.json(item)\` or \`c.json({ success: true, data: item })\`
- Error: \`c.json({ success: false, message: '...' }, status)\`

`;
      }

      // Use AI to modify the code
      const prompt = `You are a code modification assistant for a Fluxez app. Modify the following ${currentFile.language} code according to the user's instruction.
${sdkContext}
IMPORTANT: Return ONLY the modified code, without any explanation, markdown formatting, or code block markers.

Current code:
${currentFile.content}

User instruction: ${data.instruction}

Return the complete modified file content:`;

      const llmResponse = await this.llmRouter.chat(
        [{ role: 'user', content: prompt }],
        { maxTokens: 8000, temperature: 0.2 }
      );

      // Clean the response (remove any markdown code blocks if present)
      let modifiedCode = llmResponse.content;
      if (modifiedCode.startsWith('```')) {
        const lines = modifiedCode.split('\n');
        modifiedCode = lines.slice(1, -1).join('\n');
      }

      client.emit('code:progress', {
        status: 'saving',
        message: 'Saving modified file...',
      });

      // Save the modified file
      await this.appFilesService.updateFileContent(
        data.appId,
        data.type,
        data.filePath,
        modifiedCode,
      );

      // Emit success with the modified code
      client.emit('code:modified', {
        appId: data.appId,
        type: data.type,
        filePath: data.filePath,
        content: modifiedCode,
        language: currentFile.language,
      });

      this.logger.log(`Code modification completed for ${data.filePath}`);
    } catch (error) {
      this.logger.error('Code modification error:', error);
      client.emit('code:error', {
        message: error.message || 'Failed to modify code',
      });
    }
  }

  /**
   * Format a number for display (e.g., 1000 -> 1K, 1000000 -> 1M)
   */
  private formatNumber(value: number, decimals = 2): string {
    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(decimals) + 'B';
    }
    if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(decimals) + 'M';
    }
    if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(decimals) + 'K';
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
  }

  /**
   * Handle direct file update (without AI)
   */
  @SubscribeMessage('code:update')
  async handleCodeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      appId: string;
      type: 'frontend' | 'backend' | 'mobile';
      filePath: string;
      content: string;
    },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      if (!authContext) {
        client.emit('code:error', { message: 'Not authenticated' });
        return;
      }

      this.logger.log(`Direct code update for ${data.appId}/${data.type}/${data.filePath}`);

      // Save the file
      await this.appFilesService.updateFileContent(
        data.appId,
        data.type,
        data.filePath,
        data.content,
      );

      // Emit success
      client.emit('code:updated', {
        appId: data.appId,
        type: data.type,
        filePath: data.filePath,
        success: true,
      });
    } catch (error) {
      this.logger.error('Code update error:', error);
      client.emit('code:error', {
        message: error.message || 'Failed to update code',
      });
    }
  }
}
