// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { chatService, ChatMessage, IntentDetection, HistoryData, StreamStart, StreamChunk, StreamEnd, AppBuilderEvent, AppBuilderEventType } from '../services/chatService';
import { ContextualUI, UIConfig, toolComponents } from '../components/ContextualUI';
import { ToolLaunchButton } from '../components/ToolLaunchButton';
import { ToolSuggestions, EnhancedToolChipCard } from '../components/ToolSuggestions';
import { toolSuggestionService } from '../services/toolSuggestionService';
import { toolPrefillService } from '../services/toolPrefillService';
import { AppSidebar } from '../components/AppSidebar';
import { ChatHistorySidebar } from '../components/chat/ChatHistorySidebar';
import { FileUploadPopup, UploadedFileInfo, getFileIcon, formatFileSize } from '../components/chat/FileUploadPopup';
import { ResizablePanel } from '../components/chat/ResizablePanel';
import { AppPreviewPanel } from '../components/chat/AppPreviewPanel';
import { ThreadPanel, ThreadMessage } from '../components/chat/ThreadPanel';
import { appCatalogService, App } from '../services/appCatalogService';
import { appFilesService } from '../services/appFilesService';
import { intentRouterService, UnifiedIntentClassification } from '../services/intentRouterService';
import { branchingService, MessageVersion } from '../services/branchingService';
import { modelsAPI, AIModel } from '../lib/api/models';
import { api } from '../lib/api';
import { appsApi } from '../lib/appsApi';
import { getDomainName } from '../utils/urlDetector';
import { useUrlMetadata } from '../hooks/useUrlMetadata';
import { useResearch, ResearchProgress, ResearchSession } from '../hooks/useResearch';
import { MessageContent, SuggestedTool } from '../components/chat/MessageContent';
import { toast } from 'sonner';
import {
  Send,
  Plus,
  Pencil,
  GraduationCap,
  Code,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Crown,
  Star,
  Copy,
  Check,
  Edit3,
  RefreshCw,
  Wrench,
  X,
  ImageIcon,
  AlertCircle,
  Eye,
  GitBranch,
  Loader2,
  Download,
  Github,
  Share2,
  ExternalLink,
  Upload,
  FileText,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  metadata?: any;
  uiConfig?: UIConfig; // Store UI config for tool launch
  userQuery?: string; // Store the user's query for tool suggestions
}

interface Conversation {
  id: string;
  title: string;
  lastMessageAt: Date;
  messages: Message[];
}

// Right Panel Types - unified management for thread, preview, web content, app builder
type RightPanelMode = 'none' | 'thread' | 'app-preview' | 'web-content' | 'research' | 'app-builder';

interface WebContentData {
  type: 'screenshot' | 'page-summary' | 'url-preview';
  url: string;
  sourceUrl?: string; // Normalized URL for "Open Website" button
  title?: string;
  screenshot?: string;
  summary?: string;
  content?: string;
  contentId?: string; // For download/share from content library
  metadata?: Record<string, any>;
}

interface ResearchData {
  topic: string;
  status: 'pending' | 'searching' | 'fetching' | 'analyzing' | 'complete' | 'error';
  progress?: number;
  sources?: Array<{ url: string; title: string; relevance: number }>;
  report?: {
    summary: string;
    sections: Array<{ title: string; content: string; sources: string[] }>;
  };
  error?: string;
}

// Helper function to generate app overview markdown content
const generateAppOverview = (app: App): string => {
  const techStacks = getTechStacksForApp(app.category);
  const features = getFeaturesForApp(app);

  return `# ${app.name}

${app.description}

## Tech Stack

${techStacks.map(tech => `- **${tech.name}**: ${tech.description}`).join('\n')}

## Features

${features.map(f => `- ${f}`).join('\n')}

## Quick Start

\`\`\`bash
# Clone and run locally
git clone https://github.com/wants-chat/apps/${app.id}.git
cd ${app.id}
npm install && npm run dev
\`\`\`

## Links

${app.frontendUrl ? `- **Live App**: [${app.frontendUrl}](${app.frontendUrl})` : ''}
${app.apiDocsUrl ? `\n- **API Docs**: [${app.apiDocsUrl}](${app.apiDocsUrl})` : ''}
${app.backendUrl ? `\n- **API Endpoint**: \`${app.backendUrl}\`` : ''}

**Status**: ${app.status === 'deployed' ? '✅ Deployed and Live' : '🔄 In Development'}
`;
};

// Helper function to download an image by fetching it as a blob
// This works for cross-origin URLs (like cdn.wants.chat) where the download attribute doesn't work
const downloadImage = async (imageUrl: string, filename?: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Generate filename from URL if not provided
    const downloadFilename = filename || (() => {
      try {
        const urlParts = imageUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        return lastPart.split('?')[0] || `screenshot-${Date.now()}.png`;
      } catch {
        return `screenshot-${Date.now()}.png`;
      }
    })();

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    toast.success('Image downloaded!');
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
    toast.error('Download failed, opened in new tab');
  }
};

function getTechStacksForApp(category: string) {
  const commonStacks = [
    { name: 'React', description: 'UI framework for building interactive interfaces' },
    { name: 'TypeScript', description: 'Type-safe JavaScript for better developer experience' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid styling' },
    { name: 'Vite', description: 'Fast build tool and development server' },
  ];

  const categoryStacks: Record<string, Array<{ name: string; description: string }>> = {
    'business-finance': [
      ...commonStacks,
      { name: 'Chart.js', description: 'Data visualization library' },
      { name: 'React Query', description: 'Data fetching and caching' },
    ],
    'productivity': [
      ...commonStacks,
      { name: 'Zustand', description: 'Lightweight state management' },
      { name: 'date-fns', description: 'Date manipulation utilities' },
    ],
    'developer-tools': [
      ...commonStacks,
      { name: 'Monaco Editor', description: 'VS Code-like code editor' },
      { name: 'Prism.js', description: 'Syntax highlighting' },
    ],
    'healthcare': [
      ...commonStacks,
      { name: 'Recharts', description: 'Health metrics visualization' },
      { name: 'React Hook Form', description: 'Form handling' },
    ],
  };

  return categoryStacks[category] || commonStacks;
}

function getFeaturesForApp(app: App): string[] {
  const baseFeatures = [
    'Modern, responsive UI design',
    'Dark and light theme support',
    'Real-time data updates',
    'Mobile-friendly interface',
  ];

  const categoryFeatures: Record<string, string[]> = {
    'business-finance': [
      'Financial data visualization with charts',
      'Budget tracking and management',
      'Transaction history and search',
      'Export reports to PDF/Excel',
    ],
    'productivity': [
      'Task management and organization',
      'Calendar integration',
      'Reminders and notifications',
      'Collaboration features',
    ],
    'developer-tools': [
      'Code syntax highlighting',
      'Multi-language support',
      'Copy to clipboard functionality',
      'Code formatting and linting',
    ],
    'healthcare': [
      'Health metrics tracking',
      'Progress visualization',
      'Reminder system for medications',
      'Data export capabilities',
    ],
  };

  return [...baseFeatures, ...(categoryFeatures[app.category] || [])];
}

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Get user's first name for greeting
  const firstName = user?.name?.split(' ')[0] || 'there';

  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<IntentDetection | null>(null);
  const [openToolsStack, setOpenToolsStack] = useState<UIConfig[]>([]);
  // For backwards compatibility
  const showContextualUI = openToolsStack.length > 0;
  const activeToolConfig = openToolsStack[openToolsStack.length - 1] || null;
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  // File upload popup state
  const [showFileUploadPopup, setShowFileUploadPopup] = useState(false);
  // Attached files state for chat messages
  const [attachedFiles, setAttachedFiles] = useState<UploadedFileInfo[]>([]);
  // Drag-and-drop state for chat input
  const [isDraggingOnInput, setIsDraggingOnInput] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  // App preview panel state
  const [previewApp, setPreviewApp] = useState<App | null>(null);
  // Track the latest assistant message for typewriter effect
  const [typewriterMessageId, setTypewriterMessageId] = useState<string | null>(null);
  // Track message versions for branching navigation
  const [messageVersions, setMessageVersions] = useState<Map<string, MessageVersion[]>>(new Map());
  const [currentVersionIndex, setCurrentVersionIndex] = useState<Map<string, number>>(new Map());
  // Thread panel state
  const [activeThread, setActiveThread] = useState<{ branchId: string; parentMessage: Message } | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  // Cached tool suggestions by message ID (for async semantic search)
  const [toolSuggestionsCache, setToolSuggestionsCache] = useState<Map<string, { tools: Array<{ tool: { id: string; title: string; description: string; category: string; icon: string; type: string }; relevanceScore: number; matchType: string }> }>>(new Map());
  // Track streaming message for real-time token updates (ChatGPT-like)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  // Track which tool suggestion button is loading (for prefill extraction)
  const [loadingToolId, setLoadingToolId] = useState<string | null>(null);
  // Track which message's Thread button is loading
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
  // Track which message's Preview button is loading
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);

  // Unified Right Panel Management
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('none');
  const [webContentData, setWebContentData] = useState<WebContentData | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);

  // App Builder generation progress state with streaming logs
  const [appBuilderProgress, setAppBuilderProgress] = useState<{
    isGenerating: boolean;
    step: string;
    status: string;
    message: string;
    logs: Array<{ timestamp: string; type: 'info' | 'success' | 'error' | 'step'; message: string }>;
    appId?: string;
    appName?: string;
    appType?: string;
    appDescription?: string;
    features?: string[];
    frontendUrl?: string;
    backendUrl?: string;
    mobileUrl?: string;
  } | null>(null);
  const appBuilderLogsRef = useRef<HTMLDivElement>(null);

  // URL metadata hook for web commands (screenshot, summarize, etc.)
  const urlMetadata = useUrlMetadata();

  // Research hook for deep web research
  const research = useResearch();

  // Get the last mentioned URL from recent conversation messages (fallback only)
  // Note: Backend LLM classifier now handles "this website" resolution from conversation context
  const getLastMentionedUrl = useCallback((): string | null => {
    if (!currentConversation?.messages) return null;

    // Look through recent messages (last 10) for URLs
    const recentMessages = currentConversation.messages.slice(-10).reverse();

    for (const msg of recentMessages) {
      // Check message content for URLs
      const urlMatch = msg.content.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi);
      if (urlMatch && urlMatch.length > 0) {
        return urlMatch[0];
      }
      // Also check metadata for web command URLs
      if (msg.metadata?.webUrl) {
        return msg.metadata.webUrl;
      }
    }

    return null;
  }, [currentConversation?.messages]);

  // Default fallback models when API fails
  const defaultModels: AIModel[] = [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Fast and affordable GPT-4 for everyday tasks',
      provider: 'openai',
      tier: 'standard',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      supportsVision: true,
      supportsStreaming: true,
      costPer1MInput: 150000,
      costPer1MOutput: 600000,
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      description: 'Fast and affordable for everyday tasks',
      provider: 'anthropic',
      tier: 'standard',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsStreaming: true,
      costPer1MInput: 1000000,
      costPer1MOutput: 5000000,
    },
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash',
      description: 'Fast and capable multimodal model',
      provider: 'google',
      tier: 'free',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsStreaming: true,
      costPer1MInput: 0,
      costPer1MOutput: 0,
    },
    {
      id: 'deepseek-chat',
      name: 'DeepSeek V3',
      description: 'High-performance model at low cost',
      provider: 'deepseek',
      tier: 'standard',
      contextWindow: 64000,
      maxOutputTokens: 8192,
      supportsVision: false,
      supportsStreaming: true,
      costPer1MInput: 270000,
      costPer1MOutput: 1100000,
    },
  ];

  // Fetch available models based on user's subscription
  const { data: fetchedModels, isLoading: isLoadingModels } = useQuery({
    queryKey: ['available-models'],
    queryFn: () => modelsAPI.getAvailableModels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Use fetched models or fallback to defaults
  const availableModels = fetchedModels && fetchedModels.length > 0 ? fetchedModels : defaultModels;

  // Set default model when models are loaded - Auto by default
  useEffect(() => {
    if (!selectedModelId) {
      // Default to Auto mode for smart model selection
      setSelectedModelId('auto');
    }
  }, [selectedModelId]);

  // Pre-fill chat input from ?prompt= URL param (e.g. "New App" button → /chat?prompt=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt');
    if (prompt) {
      setInputValue(prompt);
      params.delete('prompt');
      const qs = params.toString();
      const newUrl = window.location.pathname + (qs ? `?${qs}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Handle GitHub OAuth callback - restore app context after redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get('github');
    const installationId = params.get('installation_id');
    const githubAppId = params.get('github_app_id');

    if (githubStatus === 'connected') {
      // Show success toast
      toast.success('GitHub connected successfully!', {
        description: installationId ? `Installation ID: ${installationId}` : undefined,
      });

      // Restore app context from localStorage if available
      const savedAppContext = localStorage.getItem('github_connecting_app');
      if (savedAppContext) {
        try {
          const { appId, appName } = JSON.parse(savedAppContext);
          // Set the app builder progress to show the app was connected
          if (appId) {
            setAppBuilderProgress(prev => prev ? {
              ...prev,
              appId,
              appName: appName || prev.appName,
            } : null);
          }
        } catch (e) {
          console.error('Failed to parse saved app context:', e);
        }
        localStorage.removeItem('github_connecting_app');
      }

      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (githubStatus === 'error') {
      const message = params.get('message') || 'Failed to connect GitHub';
      toast.error('GitHub connection failed', { description: message });

      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      localStorage.removeItem('github_connecting_app');
    }
  }, []);

  // Get selected model object (or Auto mode info)
  const selectedModel = selectedModelId === 'auto'
    ? { id: 'auto', name: 'Auto', tier: 'auto', provider: 'auto', description: 'Smart model selection based on your message' }
    : availableModels.find(m => m.id === selectedModelId);

  // Get tier icon
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'auto':
        return <Sparkles className="w-3 h-3 text-[#0D9488]" />;
      case 'free':
        return null;
      case 'standard':
        return <Zap className="w-3 h-3 text-blue-500" />;
      case 'premium':
        return <Star className="w-3 h-3 text-yellow-500" />;
      case 'enterprise':
        return <Crown className="w-3 h-3 text-purple-500" />;
      default:
        return null;
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingIntentRef = useRef<UIConfig | null>(null);
  const hasInitializedRef = useRef(false);
  const lastScrollTimeRef = useRef(0); // Throttle scroll during streaming
  const streamingContentRef = useRef<string>(''); // Accumulate streaming content
  const streamingUpdateTimerRef = useRef<NodeJS.Timeout | null>(null); // Debounce state updates
  const webActionIntentHandlerRef = useRef<((intent: IntentDetection) => Promise<boolean>) | null>(null); // Ref for web action handler

  // Connect to chat socket on mount (only once)
  // NOTE: Don't call startSession here - the conversation switching useEffect handles it
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      chatService.connect(token).then((connected) => {
        setIsConnected(connected);
        // Session will be started by the conversation switching useEffect when isConnected changes
      });
    }

    // Subscribe to events
    const unsubMessage = chatService.onMessage((msg: ChatMessage) => {
      // For user messages, update the temp message ID with the persisted ID
      if (msg.sender === 'user') {
        setCurrentConversation(prev => {
          if (!prev) return prev;

          // Find a temp user message that matches this content
          const tempMessageIndex = prev.messages.findIndex(
            m => m.role === 'user' && m.id.startsWith('temp-') && m.content === msg.message
          );

          if (tempMessageIndex !== -1) {
            // Replace temp ID with persisted ID
            const updatedMessages = [...prev.messages];
            updatedMessages[tempMessageIndex] = {
              ...updatedMessages[tempMessageIndex],
              id: msg.id, // Use the persisted UUID from backend
            };
            return {
              ...prev,
              messages: updatedMessages,
            };
          }
          return prev;
        });
        return;
      }

      // Skip app builder messages - they're handled by onAppBuilder callback
      // which creates the message with proper formatting and previews
      // Check multiple indicators: appBuilder metadata, pattern ID, or service backend
      const isAppBuilderMessage = msg.metadata?.appBuilder?.appId ||
        msg.metadata?.patternId === 'build-app' ||
        msg.metadata?.serviceBackend === 'app-builder' ||
        msg.metadata?.patternId?.startsWith('build') ||
        msg.message?.includes('has been generated') ||
        msg.message?.includes('Your app');

      if (isAppBuilderMessage) {
        console.log('📱 [ChatPage] Skipping message:received for app builder (handled by onAppBuilder)', msg.metadata);
        setIsLoading(false);
        return;
      }

      // Get pending intent UI config
      const uiConfig = pendingIntentRef.current;
      pendingIntentRef.current = null;

      setCurrentConversation(prev => {
        if (!prev) {
          // This shouldn't happen for assistant messages, but handle it
          const newMessage: Message = {
            id: msg.id,
            role: 'assistant',
            content: msg.message,
            createdAt: new Date(msg.timestamp),
            metadata: msg.metadata,
            uiConfig: uiConfig || undefined,
          };
          const newConv: Conversation = {
            id: msg.conversationId || Date.now().toString(),
            title: 'New Chat',
            lastMessageAt: new Date(),
            messages: [newMessage],
          };
          return newConv;
        }

        // Check if message already exists
        if (prev.messages.some(m => m.id === msg.id)) {
          return prev;
        }

        // Find the last user message to store as userQuery for tool suggestions
        const lastUserMsg = [...prev.messages].reverse().find(m => m.role === 'user');

        const newMessage: Message = {
          id: msg.id,
          role: 'assistant',
          content: msg.message,
          createdAt: new Date(msg.timestamp),
          metadata: msg.metadata,
          uiConfig: uiConfig || undefined,
          userQuery: lastUserMsg?.content, // Store user query for tool suggestions
        };

        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessageAt: new Date(),
        };
      });

      // Enable typewriter effect for this new assistant message
      setTypewriterMessageId(msg.id);

      // Stop loading when we get assistant response
      setIsLoading(false);

      // Auto-open preview panel for generated apps
      if (msg.metadata?.appBuilder?.frontendUrl) {
        const generatedApp: App = {
          id: msg.metadata.appBuilder.appId || `generated-${Date.now()}`,
          name: msg.metadata.appBuilder.appName || 'Generated App',
          description: `Generated ${msg.metadata.appBuilder.appType || 'app'}`,
          category: msg.metadata.appBuilder.appType || 'generated',
          // Use hasXxxCode flags if available, fallback to URL presence for backward compat
          hasBackend: msg.metadata.appBuilder.hasBackendCode ?? !!msg.metadata.appBuilder.backendUrl,
          hasFrontend: msg.metadata.appBuilder.hasFrontendCode ?? true,
          hasMobile: msg.metadata.appBuilder.hasMobileCode ?? false,
          status: 'deployed',
          backendUrl: msg.metadata.appBuilder.backendUrl || null,
          frontendUrl: msg.metadata.appBuilder.frontendUrl,
          workerName: null,
          apiDocsUrl: msg.metadata.appBuilder.backendUrl ? `${msg.metadata.appBuilder.backendUrl}/docs` : null,
        };
        // Auto-open preview panel
        setPreviewApp(generatedApp);
        setActiveThread(null);
        setThreadMessages([]);
        setWebContentData(null);
        setResearchData(null);
        setRightPanelMode('app-preview');
      }
    });

    const unsubTyping = chatService.onTyping((data) => {
      if (data.sender === 'assistant') {
        setIsTyping(data.isTyping);
      }
    });

    const unsubIntent = chatService.onIntent((intent: IntentDetection) => {
      setCurrentIntent(intent);

      // Handle matched intents based on type
      if (intent.intent?.matched && intent.uiConfig?.type) {
        // Handle web-action intents (screenshot, summarize, research) via LLM-based detection
        if (intent.uiConfig.type === 'web-action') {
          // Use the ref to call the latest handler (handles async correctly)
          if (webActionIntentHandlerRef.current) {
            webActionIntentHandlerRef.current(intent).then((handled) => {
              if (!handled) {
                // If web action couldn't be handled (no URL found), let it fall through to AI response
                console.log('Web action intent could not be handled, will use AI fallback');
              }
            }).catch((err) => {
              console.error('Error handling web action intent:', err);
            });
          }
          return; // Don't open tool stack for web-action intents
        }

        // Skip showing contextual UI for app-builder - it's handled by backend and returns via websocket
        if (intent.uiConfig.type === 'app-builder') {
          console.log('App-builder intent detected, letting backend handle it');
          return; // Don't open tool stack for app-builder intents
        }

        // DISABLED: Don't auto-open contextual UI modals from intent detection
        // Users can still access tools via Suggested Tools in the response or the tools panel
        // This prevents non-existent tools like "Writing Assistant" from showing modals
        console.log('Intent matched but modal disabled:', intent.uiConfig.type, intent.uiConfig.toolId);
        return; // Don't auto-open tool modals

        // Store intent for associating with the upcoming message (for other intent types)
        // pendingIntentRef.current = {
        //   type: intent.uiConfig.type,
        //   toolId: intent.uiConfig.toolId,
        //   title: intent.uiConfig.title || 'Tool',
        //   description: intent.uiConfig.description,
        // };
        // // Show contextual UI immediately - add to stack
        // setOpenToolsStack(prev => [...prev, pendingIntentRef.current!]);
      }
    });

    const unsubConnection = chatService.onConnectionChange((state) => {
      setIsConnected(state === 'connected');
    });

    const unsubSession = chatService.onSession((session) => {
      if (session) {
        console.log('Session active:', session.sessionId, 'Conversation:', session.conversationId);
        // Load message history when session starts (for existing conversations)
        if (session.conversationId) {
          chatService.loadHistory(session.conversationId);
        }
      }
    });

    // Handle history loading - loads all messages including user messages
    const unsubHistory = chatService.onHistory((data: HistoryData) => {
      console.log('Loading conversation history:', data);
      if (data.messages && data.messages.length > 0) {
        // Build messages with userQuery for assistant messages
        const historyMessages: Message[] = [];
        let lastUserQuery = '';

        for (const msg of data.messages) {
          if (msg.sender === 'user') {
            lastUserQuery = msg.message;
            historyMessages.push({
              id: msg.id,
              role: 'user',
              content: msg.message,
              createdAt: new Date(msg.timestamp),
              metadata: msg.metadata,
            });
          } else {
            historyMessages.push({
              id: msg.id,
              role: 'assistant',
              content: msg.message,
              createdAt: new Date(msg.timestamp),
              metadata: msg.metadata,
              userQuery: lastUserQuery, // Include user query for tool suggestions
            });
          }
        }

        setCurrentConversation({
          id: data.conversationId,
          title: historyMessages[0]?.content.slice(0, 50) || 'Chat',
          lastMessageAt: new Date(),
          messages: historyMessages,
        });
      } else {
        // No messages in history, but we have a valid conversation - show empty state
        setCurrentConversation(null);
      }
    });

    // ============================================
    // STREAMING EVENT HANDLERS (ChatGPT-like experience)
    // ============================================

    // When streaming starts, create a new assistant message placeholder
    const unsubStreamStart = chatService.onStreamStart((data: StreamStart) => {
      // Reset streaming content accumulator
      streamingContentRef.current = '';
      if (streamingUpdateTimerRef.current) {
        clearTimeout(streamingUpdateTimerRef.current);
        streamingUpdateTimerRef.current = null;
      }

      setStreamingMessageId(data.messageId);
      setIsTyping(false); // Stop "typing" indicator, we're now streaming real content

      // Get pending intent UI config
      const uiConfig = pendingIntentRef.current;
      pendingIntentRef.current = null;

      // Find the last user message to store as userQuery for tool suggestions
      setCurrentConversation(prev => {
        const lastUserMsg = prev?.messages ? [...prev.messages].reverse().find(m => m.role === 'user') : undefined;

        const newMessage: Message = {
          id: data.messageId,
          role: 'assistant',
          content: '', // Start with empty content, will be filled by chunks
          createdAt: new Date(),
          metadata: { model: data.model, streaming: true },
          uiConfig: uiConfig || undefined,
          userQuery: lastUserMsg?.content,
        };

        if (!prev) {
          return {
            id: Date.now().toString(),
            title: 'New Chat',
            lastMessageAt: new Date(),
            messages: [newMessage],
          };
        }

        // Don't add if already exists
        if (prev.messages.some(m => m.id === data.messageId)) {
          return prev;
        }

        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessageAt: new Date(),
        };
      });
    });

    // When a chunk arrives, accumulate in ref and debounce state updates
    const unsubStreamChunk = chatService.onStreamChunk((data: StreamChunk) => {
      // Accumulate chunk in ref (no re-render)
      streamingContentRef.current += data.chunk;

      // Debounce state updates to every 50ms
      if (!streamingUpdateTimerRef.current) {
        streamingUpdateTimerRef.current = setTimeout(() => {
          streamingUpdateTimerRef.current = null;
          const currentContent = streamingContentRef.current;

          setCurrentConversation(prev => {
            if (!prev) return prev;

            return {
              ...prev,
              messages: prev.messages.map(msg =>
                msg.id === data.messageId
                  ? { ...msg, content: currentContent }
                  : msg
              ),
            };
          });

          // Throttle scroll during streaming
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    });

    // When streaming ends, finalize the message
    const unsubStreamEnd = chatService.onStreamEnd((data: StreamEnd) => {
      // Clear any pending update timer
      if (streamingUpdateTimerRef.current) {
        clearTimeout(streamingUpdateTimerRef.current);
        streamingUpdateTimerRef.current = null;
      }

      setStreamingMessageId(null);
      setIsLoading(false);

      // DON'T set typewriterMessageId - streaming already displayed the content
      // Setting it would block buttons from showing (condition: message.id !== typewriterMessageId)

      // Update the message with final content and REPLACE the streaming ID with persisted database ID
      // The persisted ID is the real UUID needed for Thread/branching features
      const newId = data.persistedId || data.messageId;

      setCurrentConversation(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  id: newId, // Use persisted UUID if available
                  content: data.fullContent,
                  metadata: {
                    ...msg.metadata,
                    streaming: false,
                    suggestedTools: data.suggestedTools || [], // Tools for inline clickable mentions
                  }
                }
              : msg
          ),
        };
      });

      // Migrate tool suggestions cache key from streaming ID to persisted ID
      if (data.persistedId && data.persistedId !== data.messageId) {
        setToolSuggestionsCache(prev => {
          const cached = prev.get(data.messageId);
          if (cached) {
            const newCache = new Map(prev);
            newCache.delete(data.messageId);
            newCache.set(data.persistedId!, cached);
            return newCache;
          }
          return prev;
        });
      }

      // Reset streaming content ref
      streamingContentRef.current = '';

      // Final scroll to ensure user sees complete message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    // App Builder events - for real-time progress during generation/deployment
    const unsubAppBuilder = chatService.onAppBuilder((type: AppBuilderEventType, data: AppBuilderEvent) => {
      console.log('🔨 [ChatPage] App Builder event:', type, data);

      const createLogEntry = (message: string, logType: 'info' | 'success' | 'error' | 'step' = 'info') => ({
        timestamp: new Date().toLocaleTimeString(),
        type: logType,
        message,
      });

      if (type === 'started') {
        setAppBuilderProgress({
          isGenerating: true,
          step: 'initialization',
          status: 'started',
          message: data.message || 'Starting app generation...',
          logs: [createLogEntry(data.message || '🚀 Starting app generation...', 'info')],
          appName: data.appName,
          appType: data.appType,
          features: data.features,
        });

        // Add a building indicator message in the left chat
        const buildingMessageId = `building-${Date.now()}`;
        const buildingContent = `## 🚀 Building ${data.appName || 'Your App'}

${data.appDescription || 'Generating your custom application...'}

${data.appType ? `**Category:** ${data.appType}\n` : ''}
${data.features?.length ? `**Features:**\n${data.features.map(f => `- ${f}`).join('\n')}` : ''}

*Check the right panel for real-time build progress →*`;

        setCurrentConversation(prev => {
          if (!prev) return prev;
          const buildingMessage: Message = {
            id: buildingMessageId,
            role: 'assistant',
            content: buildingContent,
            createdAt: new Date(),
            metadata: { isBuilding: true, appName: data.appName },
          };
          return {
            ...prev,
            messages: [...prev.messages, buildingMessage],
            lastMessageAt: new Date(),
          };
        });

        // Open right panel to show progress logs
        setRightPanelMode('app-builder');
        setActiveThread(null);
        setPreviewApp(null);
        setWebContentData(null);
        setResearchData(null);
        toast.info('🚀 Starting app generation...', { duration: 3000 });
      } else if (type === 'progress') {
        setAppBuilderProgress(prev => {
          const newLog = createLogEntry(
            data.message || 'Processing...',
            data.status === 'completed' ? 'success' : 'step'
          );
          return {
            ...prev,
            isGenerating: true,
            step: data.step || prev?.step || 'generating',
            status: data.status || 'running',
            message: data.message || 'Generating app...',
            logs: [...(prev?.logs || []), newLog],
          };
        });
        // Auto-scroll right panel logs
        setTimeout(() => {
          if (appBuilderLogsRef.current) {
            appBuilderLogsRef.current.scrollTop = appBuilderLogsRef.current.scrollHeight;
          }
        }, 50);
      } else if (type === 'completed') {
        // Update progress state with final info
        setAppBuilderProgress(prev => ({
          isGenerating: false,
          step: 'completed',
          status: 'completed',
          message: data.message || 'App generated successfully!',
          logs: [...(prev?.logs || []), createLogEntry('✅ ' + (data.message || 'App generated successfully!'), 'success')],
          appId: data.appId,
          appName: data.appName,
          appType: data.appType,
          appDescription: data.appDescription,
          features: data.features,
          frontendUrl: data.frontendUrl,
          backendUrl: data.backendUrl,
          mobileUrl: data.mobileUrl,
        }));

        // Create a preview app object
        if (data.appId && data.appName) {
          const generatedApp: App = {
            id: data.appId,
            name: data.appName,
            description: data.appDescription || `Generated app: ${data.appName}`,
            category: data.appType || 'custom',
            status: 'deployed',
            // Use hasXxxCode flags for enabling code viewer tabs (code exists even if not deployed)
            hasBackend: data.hasBackendCode ?? !!data.backendUrl,
            hasFrontend: data.hasFrontendCode ?? !!data.frontendUrl,
            hasMobile: data.hasMobileCode ?? !!data.mobileUrl,
            frontendUrl: data.frontendUrl || '',
            backendUrl: data.backendUrl || null,
            mobileUrl: data.mobileUrl || null,
            apiDocsUrl: data.apiDocsUrl || (data.backendUrl ? `${data.backendUrl}/docs` : null),
            workerName: null,
            features: data.features || [],
            createdAt: new Date().toISOString(),
          };

          // Add app overview message to conversation (like "show me time tracker")
          // Also remove the building indicator message
          const appOverviewContent = generateAppOverview(generatedApp);
          const appMessageId = `app-generated-${Date.now()}`;

          setCurrentConversation(prev => {
            if (!prev) return prev;
            // Remove any building indicator messages
            const filteredMessages = prev.messages.filter(m => !m.metadata?.isBuilding);
            const appMessage: Message = {
              id: appMessageId,
              role: 'assistant',
              content: appOverviewContent,
              createdAt: new Date(),
              metadata: { isAppOverview: true, appId: generatedApp.id, isGenerated: true },
            };
            return {
              ...prev,
              messages: [...filteredMessages, appMessage],
              lastMessageAt: new Date(),
            };
          });

          // Switch right panel to app preview
          setPreviewApp(generatedApp);
          setRightPanelMode('app-preview');

          // Show success toast with link
          const appUrl = data.frontendUrl || data.backendUrl;
          if (appUrl) {
            toast.success(
              <div className="flex flex-col gap-1">
                <span>✅ {data.appName || 'App'} deployed!</span>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline text-sm"
                >
                  Open {data.appName || 'App'} →
                </a>
              </div>,
              { duration: 10000 }
            );
          } else {
            toast.success(`✅ ${data.appName || 'App'} generated successfully!`, { duration: 5000 });
          }

          // Clear app builder progress after a short delay (let user see completion)
          setTimeout(() => {
            setAppBuilderProgress(null);
          }, 2000);
        }

        // Scroll to show the new app overview message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (type === 'error') {
        setAppBuilderProgress(prev => ({
          isGenerating: false,
          step: 'error',
          status: 'error',
          message: data.error || data.message || 'App generation failed',
          logs: [...(prev?.logs || []), createLogEntry('❌ ' + (data.error || data.message || 'App generation failed'), 'error')],
        }));
        toast.error(`❌ App generation failed: ${data.error || data.message || 'Unknown error'}`, { duration: 8000 });
        // Scroll to show error
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubIntent();
      unsubConnection();
      unsubSession();
      unsubHistory();
      unsubStreamStart();
      unsubStreamChunk();
      unsubStreamEnd();
      unsubAppBuilder();
      chatService.disconnect();
      hasInitializedRef.current = false;
      // Clean up streaming timer
      if (streamingUpdateTimerRef.current) {
        clearTimeout(streamingUpdateTimerRef.current);
        streamingUpdateTimerRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Handle conversation switching when URL changes
  useEffect(() => {
    if (isConnected) {
      // Clear current messages when switching conversations
      setCurrentConversation(null);
      // Clear version tracking
      setMessageVersions(new Map());
      setCurrentVersionIndex(new Map());
      // Start a new session with the selected conversation
      chatService.startSession(conversationId);
    }
  }, [conversationId, isConnected]);

  // Auto-scroll to bottom when messages change
  // Auto-scroll when new messages are added (but not during streaming - handled separately)
  useEffect(() => {
    // Skip during streaming - the chunk handler has its own throttled scroll
    if (streamingMessageId) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, streamingMessageId]);

  // Scroll to bottom during typewriter effect
  const scrollToBottomSmooth = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load versions for a message (for branching navigation)
  const loadMessageVersions = useCallback(async (messageId: string) => {
    try {
      const versions = await branchingService.getMessageVersions(messageId);
      if (versions.length > 1) {
        setMessageVersions(prev => new Map(prev).set(messageId, versions));
        // Find current version index
        const currentIdx = versions.findIndex(v => v.isCurrentVersion);
        setCurrentVersionIndex(prev => new Map(prev).set(messageId, currentIdx >= 0 ? currentIdx : versions.length - 1));
      }
    } catch (error) {
      // Silently fail - message might not have versions
    }
  }, []);

  // Navigate to previous version
  const goToPreviousVersion = useCallback(async (messageId: string) => {
    const versions = messageVersions.get(messageId);
    const currentIdx = currentVersionIndex.get(messageId) || 0;
    if (versions && currentIdx > 0) {
      const newIdx = currentIdx - 1;
      setCurrentVersionIndex(prev => new Map(prev).set(messageId, newIdx));
      // Switch to this version's branch
      const targetVersion = versions[newIdx];
      if (targetVersion) {
        // Update message content locally for instant feedback
        setCurrentConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(m =>
              m.id === messageId ? { ...m, content: targetVersion.content } : m
            ),
          };
        });
      }
    }
  }, [messageVersions, currentVersionIndex]);

  // Navigate to next version
  const goToNextVersion = useCallback(async (messageId: string) => {
    const versions = messageVersions.get(messageId);
    const currentIdx = currentVersionIndex.get(messageId) || 0;
    if (versions && currentIdx < versions.length - 1) {
      const newIdx = currentIdx + 1;
      setCurrentVersionIndex(prev => new Map(prev).set(messageId, newIdx));
      // Update message content locally for instant feedback
      const targetVersion = versions[newIdx];
      if (targetVersion) {
        setCurrentConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(m =>
              m.id === messageId ? { ...m, content: targetVersion.content } : m
            ),
          };
        });
      }
    }
  }, [messageVersions, currentVersionIndex]);

  // Load message versions for user messages (for branching navigation)
  useEffect(() => {
    // Skip during streaming to prevent excessive re-renders
    if (streamingMessageId) return;

    if (currentConversation?.messages) {
      // Filter out temp messages (optimistic updates that haven't been persisted yet)
      const userMessages = currentConversation.messages.filter(m =>
        m.role === 'user' && !m.id.startsWith('temp-')
      );
      userMessages.forEach(msg => {
        // Only load if not already loaded
        if (!messageVersions.has(msg.id)) {
          loadMessageVersions(msg.id);
        }
      });
    }
  }, [currentConversation?.messages, loadMessageVersions, messageVersions, streamingMessageId]);

  // Fetch tool suggestions asynchronously using semantic search API
  useEffect(() => {
    // Skip entirely while streaming - prevents excessive re-renders
    if (streamingMessageId) return;

    const fetchToolSuggestions = async () => {
      if (!currentConversation?.messages) return;

      // Find assistant messages with userQuery that don't have cached suggestions
      const messagesNeedingSuggestions = currentConversation.messages.filter(
        m => m.role === 'assistant' &&
             m.userQuery &&
             m.id !== typewriterMessageId // Don't fetch while typewriter is active
      );

      for (const message of messagesNeedingSuggestions) {
        // Check cache inside loop to avoid race conditions
        setToolSuggestionsCache(prev => {
          if (prev.has(message.id)) return prev; // Already cached

          // Mark as loading (empty array) to prevent duplicate fetches
          const newCache = new Map(prev);
          newCache.set(message.id, { tools: [] });

          // Fetch asynchronously
          toolSuggestionService.searchToolsAsync(message.userQuery!, 6)
            .then(result => {
              setToolSuggestionsCache(cache => {
                const updated = new Map(cache);
                updated.set(message.id, result);
                return updated;
              });
            })
            .catch(error => {
              console.error('Failed to fetch tool suggestions:', error);
              // Fallback to local search
              const fallback = toolSuggestionService.searchTools(message.userQuery!, 6);
              setToolSuggestionsCache(cache => {
                const updated = new Map(cache);
                updated.set(message.id, fallback);
                return updated;
              });
            });

          return newCache;
        });
      }
    };

    fetchToolSuggestions();
  }, [currentConversation?.messages, typewriterMessageId, streamingMessageId]);

  // ============================================
  // UNIFIED RIGHT PANEL MANAGEMENT
  // ============================================

  // Open thread panel (unified)
  const openThreadPanel = useCallback((branchId: string, parentMessage: Message) => {
    setActiveThread({ branchId, parentMessage });
    setThreadMessages([]);
    setPreviewApp(null); // Close app preview
    setWebContentData(null);
    setResearchData(null);
    setRightPanelMode('thread');
  }, []);

  // Open app preview panel (unified)
  const openAppPreviewPanel = useCallback((app: App) => {
    setPreviewApp(app);
    setActiveThread(null); // Close thread
    setThreadMessages([]);
    setWebContentData(null);
    setResearchData(null);
    setRightPanelMode('app-preview');
  }, []);

  // Check for associated app when conversation loads
  useEffect(() => {
    if (!conversationId || !user) return;

    const checkForAssociatedApp = async () => {
      try {
        console.log('[ChatPage] Checking for associated app, conversationId:', conversationId);
        const response = await appsApi.getAppByConversationId(conversationId);
        console.log('[ChatPage] getAppByConversationId response:', response);
        if (response.success && response.data) {
          console.log('[ChatPage] Found associated app:', {
            name: response.data.name,
            frontendUrl: response.data.frontendUrl,
            metadataFrontendUrl: response.data.metadata?.frontendUrl,
            status: response.data.status,
          });
          // Transform the UserApp to App format for the preview panel
          const app: App = {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description || '',
            category: 'Generated',
            hasBackend: response.data.hasBackend || false,
            hasFrontend: response.data.hasFrontend || false,
            hasMobile: response.data.hasMobile || false,
            status: response.data.status || 'generated',
            frontendUrl: response.data.frontendUrl || response.data.metadata?.frontendUrl || '',
            backendUrl: response.data.backendUrl || response.data.metadata?.backendUrl || null,
            mobileUrl: response.data.metadata?.mobileUrl || null,
            workerName: null,
            features: response.data.tags || [],
            createdAt: response.data.createdAt,
          };
          console.log('[ChatPage] Opening preview with app:', { name: app.name, frontendUrl: app.frontendUrl });
          // Open the app preview panel
          openAppPreviewPanel(app);
        } else {
          console.log('[ChatPage] No app found for conversation:', conversationId);
        }
      } catch (error) {
        // No app found or error - silently continue
        console.log('[ChatPage] Error checking for associated app:', error);
      }
    };

    checkForAssociatedApp();
  }, [conversationId, user, openAppPreviewPanel]);

  // Open web content panel (unified) - for screenshots, summaries, URL previews
  const openWebContentPanel = useCallback((data: WebContentData) => {
    setWebContentData(data);
    setActiveThread(null);
    setThreadMessages([]);
    setPreviewApp(null);
    setResearchData(null);
    setRightPanelMode('web-content');
  }, []);

  // Open research panel (unified)
  const openResearchPanel = useCallback((topic: string) => {
    setResearchData({
      topic,
      status: 'pending',
      progress: 0,
    });
    setActiveThread(null);
    setThreadMessages([]);
    setPreviewApp(null);
    setWebContentData(null);
    setRightPanelMode('research');
  }, []);

  // Close right panel (any type)
  const closeRightPanel = useCallback(() => {
    setRightPanelMode('none');
    setActiveThread(null);
    setThreadMessages([]);
    setPreviewApp(null);
    setWebContentData(null);
    setResearchData(null);
  }, []);

  // Handle web-action intents from LLM-based intent detection
  // This replaces all hardcoded keyword detection
  const handleWebActionIntent = useCallback(async (intent: IntentDetection) => {
    const action = intent.uiConfig?.metadata?.action as string;
    const userMessage = intent.userMessage;

    // The backend LLM classifier now handles URL resolution from conversation context
    // It understands "this website", "that page", etc. by looking at chat history
    const llmExtractedUrl = intent.uiConfig?.metadata?.url as string | undefined;

    // Fallback: regex from current message only (LLM should handle most cases)
    const urlMatch = userMessage?.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi);
    const detectedUrl = llmExtractedUrl || urlMatch?.[0];

    console.log(`Web action: ${action}, LLM URL: ${llmExtractedUrl}, detected: ${detectedUrl}`);

    if (!detectedUrl && action !== 'research') {
      // No URL found for screenshot/summarize - let the LLM respond naturally
      console.log('No URL detected for web-action, falling back to AI response');
      setIsLoading(false);
      return false; // Signal that we didn't handle it
    }

    const domain = detectedUrl ? getDomainName(detectedUrl) : '';

    if (action === 'screenshot') {
      try {
        toast.info(`Capturing screenshot of ${domain}...`);
        const result = await urlMetadata.captureScreenshot(detectedUrl);
        if (result) {
          // Use sourceUrl from backend (normalized with protocol) for "Open Website"
          const websiteUrl = result.sourceUrl || result.url || detectedUrl;

          openWebContentPanel({
            type: 'screenshot',
            url: detectedUrl,
            sourceUrl: websiteUrl, // Normalized URL for "Open Website" button
            screenshot: result.imageUrl,
            title: `Screenshot of ${domain}`,
            contentId: result.contentId, // For download/share
          });

          // Add assistant message
          const screenshotMessage: Message = {
            id: `screenshot-${Date.now()}`,
            role: 'assistant',
            content: `Here's the screenshot of **${domain}**:\n\n![Screenshot](${result.imageUrl})`,
            createdAt: new Date(),
            metadata: { webUrl: websiteUrl, contentId: result.contentId },
          };
          setCurrentConversation(prev => prev ? {
            ...prev,
            messages: [...prev.messages, screenshotMessage],
          } : prev);
        }
        setIsLoading(false);
        return true;
      } catch (error: any) {
        toast.error(`Failed to capture screenshot: ${error.message}`);
        setIsLoading(false);
        return false;
      }
    }

    if (action === 'summarize') {
      try {
        toast.info(`Summarizing ${domain}...`);
        const result = await urlMetadata.fetchSummary(detectedUrl);
        if (result) {
          // Use sourceUrl from backend (normalized with protocol) for "Open Website"
          const websiteUrl = result.sourceUrl || result.url || detectedUrl;

          // Also capture screenshot for the preview panel
          let screenshotUrl: string | undefined;
          let screenshotContentId: string | undefined;
          try {
            const screenshotResult = await urlMetadata.captureScreenshot(detectedUrl);
            screenshotUrl = screenshotResult?.imageUrl;
            screenshotContentId = screenshotResult?.contentId;
          } catch {
            // Screenshot is optional
          }

          openWebContentPanel({
            type: 'page-summary',
            url: detectedUrl,
            sourceUrl: websiteUrl, // Normalized URL for "Open Website" button
            title: result.title,
            summary: result.summary,
            screenshot: screenshotUrl,
            contentId: result.contentId || screenshotContentId, // For download/share
            metadata: {
              keyPoints: result.keyPoints,
              quotes: result.quotes,
            },
          });

          // Add assistant message with summary
          const keyPointsList = result.keyPoints.map(p => `• ${p}`).join('\n');
          const summaryMessage: Message = {
            id: `summary-${Date.now()}`,
            role: 'assistant',
            content: `## ${result.title}\n\n${result.summary}\n\n**Key Points:**\n${keyPointsList}${result.quotes?.length ? `\n\n**Notable Quotes:**\n${result.quotes.map(q => `> ${q}`).join('\n')}` : ''}`,
            createdAt: new Date(),
            metadata: { webUrl: websiteUrl, contentId: result.contentId },
          };
          setCurrentConversation(prev => prev ? {
            ...prev,
            messages: [...prev.messages, summaryMessage],
          } : prev);
        }
        setIsLoading(false);
        return true;
      } catch (error: any) {
        toast.error(`Failed to summarize: ${error.message}`);
        setIsLoading(false);
        return false;
      }
    }

    if (action === 'research') {
      // Extract topic from message or use URL
      const topic = userMessage?.replace(/https?:\/\/[^\s]+/gi, '').trim() || detectedUrl || 'unknown topic';

      // Show starting message
      toast.info(`Starting research on: "${topic.substring(0, 50)}..."`);

      // Add initial assistant message showing research is starting
      const researchStartMessage: Message = {
        id: `research-${Date.now()}`,
        role: 'assistant',
        content: `🔬 **Research in Progress**\n\nResearching: **${topic}**\n\n👉 See live progress in the panel on the right.`,
        createdAt: new Date(),
        metadata: { isResearchPending: true },
      };
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, researchStartMessage],
      } : prev);

      try {
        // Start the research session
        const session = await research.startResearch({
          query: topic,
          depth: 'standard',
          maxSources: 10,
          outputFormats: ['markdown'],
          targetUrl: detectedUrl || undefined,
        });

        if (session) {
          // Open research panel to show progress
          setRightPanelMode('research');
          setResearchData({
            topic,
            status: 'searching',
            progress: 0,
          });

          // Update message to show research is in progress
          setCurrentConversation(prev => {
            if (!prev) return prev;
            const messages = [...prev.messages];
            const lastIdx = messages.length - 1;
            if (messages[lastIdx]?.metadata?.isResearchPending) {
              messages[lastIdx] = {
                ...messages[lastIdx],
                content: `🔬 **Research in Progress**\n\nResearching: **${topic}**\n\n👉 See live progress in the panel on the right.`,
                metadata: { ...messages[lastIdx].metadata, sessionId: session.id },
              };
            }
            return { ...prev, messages };
          });
        } else {
          throw new Error('Failed to start research session');
        }
      } catch (error: any) {
        // Update message to show error
        setCurrentConversation(prev => {
          if (!prev) return prev;
          const messages = [...prev.messages];
          const lastIdx = messages.length - 1;
          if (messages[lastIdx]?.metadata?.isResearchPending) {
            messages[lastIdx] = {
              ...messages[lastIdx],
              content: `🔬 **Research Mode**\n\n❌ Failed to start research: ${error.message}\n\nYou can try:\n- Rephrasing your research query\n- Using **summarize** to get content from a specific URL\n- Asking me questions about the topic directly`,
              metadata: { isResearchError: true },
            };
          }
          return { ...prev, messages };
        });
        toast.error(`Research failed: ${error.message}`);
      }

      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false; // Unknown action
  }, [urlMetadata, openWebContentPanel, research]);

  // Keep the ref updated with the latest handleWebActionIntent
  useEffect(() => {
    webActionIntentHandlerRef.current = handleWebActionIntent;
  }, [handleWebActionIntent]);

  // Watch for research progress updates and update UI
  useEffect(() => {
    if (!research.progress && !research.session) return;

    const progress = research.progress;
    const session = research.session;

    // Map research status to our ResearchData status
    const statusMap: Record<string, ResearchData['status']> = {
      pending: 'pending',
      planning: 'searching',
      searching: 'searching',
      extracting: 'fetching',
      analyzing: 'analyzing',
      synthesizing: 'analyzing',
      fact_checking: 'analyzing',
      generating: 'analyzing',
      completed: 'complete',
      failed: 'error',
      cancelled: 'error',
    };

    if (progress) {
      setResearchData(prev => ({
        topic: prev?.topic || session?.query || '',
        status: statusMap[progress.status] || 'pending',
        progress: progress.progress,
        sources: session?.sources?.map(s => ({
          url: s.url,
          title: s.title,
          relevance: s.relevanceScore,
        })),
      }));
    }

    // When session completes, update with full results
    if (session?.status === 'completed' && session.synthesis) {
      setResearchData(prev => ({
        topic: prev?.topic || session.query,
        status: 'complete',
        progress: 100,
        sources: session.sources?.map(s => ({
          url: s.url,
          title: s.title,
          relevance: s.relevanceScore,
        })),
        report: {
          summary: session.synthesis || '',
          sections: [], // Synthesis already contains all findings - no need for duplicate sections
        },
      }));

      // Update the chat message with the final report
      setCurrentConversation(prev => {
        if (!prev) return prev;
        const messages = [...prev.messages];
        // Find the research message
        const researchMsgIdx = messages.findIndex(m => m.metadata?.sessionId === session.id);
        if (researchMsgIdx >= 0) {
          const sourcesCount = session.sources?.length || 0;
          const findingsCount = session.findings?.length || 0;

          messages[researchMsgIdx] = {
            ...messages[researchMsgIdx],
            content: `🔬 **Research Complete**\n\n**Topic:** ${session.query}\n\nI've analyzed **${sourcesCount} sources** and compiled **${findingsCount} key findings** for you.\n\n📄 **View the full research report in the panel on the right** — you can copy it or download it as a document.`,
            metadata: { ...messages[researchMsgIdx].metadata, isResearchComplete: true },
          };
        }
        return { ...prev, messages };
      });

      toast.success('Research complete!');
    }

    // Handle errors
    if (session?.status === 'failed' || session?.status === 'cancelled') {
      setResearchData(prev => ({
        topic: prev?.topic || session.query,
        status: 'error',
        error: session.error || 'Research was cancelled or failed',
      }));

      setCurrentConversation(prev => {
        if (!prev) return prev;
        const messages = [...prev.messages];
        const researchMsgIdx = messages.findIndex(m => m.metadata?.sessionId === session.id);
        if (researchMsgIdx >= 0) {
          messages[researchMsgIdx] = {
            ...messages[researchMsgIdx],
            content: `🔬 **Research Failed**\n\n❌ ${session.error || 'Research was cancelled or failed'}\n\nYou can try:\n- Rephrasing your research query\n- Using **summarize** to get content from a specific URL`,
            metadata: { ...messages[researchMsgIdx].metadata, isResearchError: true },
          };
        }
        return { ...prev, messages };
      });
    }
  }, [research.progress, research.session]);

  // Open thread (create branch and open thread panel)
  const handleOpenSubChat = useCallback(async (message: Message) => {
    // Can't create thread from messages that aren't persisted in database
    // These include: temp messages, screenshot results, summary results, app overviews, etc.
    const nonPersistedPrefixes = ['temp-', 'screenshot-', 'summary-', 'app-overview-', 'msg-', 'edit-'];
    const isNonPersisted = nonPersistedPrefixes.some(prefix => message.id.startsWith(prefix));

    // Also check if it looks like a UUID (basic check: contains dashes in UUID pattern)
    const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.id);

    if (isNonPersisted || !looksLikeUUID) {
      toast.error('Cannot create thread from this message - it was not saved to the conversation');
      return;
    }

    // Set loading state
    setLoadingThreadId(message.id);

    try {
      // Create a branch from this message
      const result = await branchingService.createBranch(message.id);

      // Use unified panel management
      openThreadPanel(result.branchId, message);
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast.error('Failed to create thread');
    } finally {
      setLoadingThreadId(null);
    }
  }, [openThreadPanel]);

  // Track streaming state for thread
  const [threadStreamingId, setThreadStreamingId] = useState<string | null>(null);

  // Send message in thread with streaming
  const handleSendThreadMessage = useCallback(async (content: string) => {
    if (!activeThread) return;

    setThreadLoading(true);

    // Add user message optimistically
    const userMessage: ThreadMessage = {
      id: `thread-user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
    };
    setThreadMessages(prev => [...prev, userMessage]);

    // Create placeholder for streaming assistant message
    const assistantMessageId = `thread-assistant-${Date.now()}`;
    const assistantMessage: ThreadMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };
    setThreadMessages(prev => [...prev, assistantMessage]);
    setThreadStreamingId(assistantMessageId);

    try {
      // Build conversation context from thread messages
      const conversationContext = threadMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const prompt = `This is a sub-conversation branched from an earlier message.

Original message being discussed:
"${activeThread.parentMessage.content}"

${conversationContext ? `Previous messages in this thread:\n${conversationContext}\n\n` : ''}User's message: "${content}"

Please respond helpfully to continue this branch conversation.`;

      // Use fetch with SSE streaming endpoint
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      // Ensure /api/v1 prefix is included
      const apiUrl = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;

      const response = await fetch(`${apiUrl}/ai/text/generate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          systemMessage: 'You are a helpful AI assistant. You are continuing a branched sub-conversation about a specific topic. Be concise and helpful.',
          temperature: 0.7,
          maxTokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk' && data.content) {
                accumulatedContent += data.content;
                // Update the streaming message with accumulated content
                setThreadMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (data.type === 'end') {
                // Finalize with full content
                setThreadMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: data.content || accumulatedContent }
                      : msg
                  )
                );
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send thread message:', error);
      toast.error('Failed to get AI response');
      // Remove the failed assistant message
      setThreadMessages(prev => prev.filter(m => m.id !== assistantMessageId));
    } finally {
      setThreadLoading(false);
      setThreadStreamingId(null);
    }
  }, [activeThread, threadMessages]);

  // Close thread panel
  const handleCloseSubChat = useCallback(() => {
    setActiveThread(null);
    setThreadMessages([]);
    setRightPanelMode('none');
  }, []);

  // Regenerate thread response
  const handleRegenerateThreadResponse = useCallback((userMessageContent: string) => {
    if (!activeThread) return;

    // Remove the last assistant message and regenerate
    setThreadMessages(prev => {
      const lastAssistantIdx = prev.length - 1;
      if (lastAssistantIdx >= 0 && prev[lastAssistantIdx].role === 'assistant') {
        return prev.slice(0, lastAssistantIdx);
      }
      return prev;
    });

    // Resend the message to regenerate
    handleSendThreadMessage(userMessageContent);
  }, [activeThread, handleSendThreadMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputValue]);

  // Keyboard listener for Escape key to close top tool in stack
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openToolsStack.length > 0) {
        // Close only the top tool
        setOpenToolsStack(prev => prev.slice(0, -1));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openToolsStack.length]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) return;

    const messageContent = inputValue.trim();
    const filesToSend = [...attachedFiles];

    // Clear input and files
    setInputValue('');
    setAttachedFiles([]);
    setIsLoading(true);
    setCurrentIntent(null);

    // Build display content for user message (include file indicators)
    let displayContent = messageContent;
    if (filesToSend.length > 0) {
      const fileNames = filesToSend.map(f => f.file.name).join(', ');
      if (!displayContent) {
        displayContent = `[Attached: ${fileNames}]`;
      }
    }

    // Add user message immediately (optimistic update)
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: displayContent,
      createdAt: new Date(),
      metadata: filesToSend.length > 0 ? {
        attachments: filesToSend.map(f => ({
          url: f.url,
          name: f.file.name,
          type: f.mimeType,
          size: f.file.size,
        })),
      } : undefined,
    };

    setCurrentConversation(prev => {
      if (!prev) {
        // Create new conversation with user message
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
          lastMessageAt: new Date(),
          messages: [tempUserMessage],
        };
        return newConv;
      }
      return {
        ...prev,
        messages: [...prev.messages, tempUserMessage],
        lastMessageAt: new Date(),
      };
    });

    // ============================================
    // UNIFIED INTENT ROUTING (LLM-based)
    // Classify intent BEFORE any local detection
    // ============================================
    if (messageContent) {
      try {
        // Get conversation context for intent classification
        const conversationContext = currentConversation?.messages
          ?.slice(-4)
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })) || [];

        // Classify intent using backend LLM (single call for ALL intent types)
        console.log('🔍 [Chat] Classifying intent for:', messageContent.substring(0, 50));
        const intentResult = await intentRouterService.classifyIntent(messageContent, conversationContext);
        console.log('✅ [Chat] Intent classified:', intentResult.category, intentResult.confidence, '- continuing to websocket send');

        // Route based on intent category
        if (intentResult.category === 'existing_app' && intentResult.confidence >= 0.7) {
          // User wants to see/use an EXISTING deployed app
          // Use local app catalog to find and show it
          const searchQuery = intentResult.existingAppQuery || messageContent;
          const detectedApp = await appCatalogService.detectAppMention(searchQuery);

          if (detectedApp) {
            openAppPreviewPanel(detectedApp);

            let appOverviewContent: string;
            try {
              const readmeData = await appFilesService.getReadme(detectedApp.id);
              if (readmeData.exists && readmeData.content) {
                appOverviewContent = readmeData.content;
              } else {
                appOverviewContent = generateAppOverview(detectedApp);
              }
            } catch (error) {
              console.error('Failed to fetch README, using generated template:', error);
              appOverviewContent = generateAppOverview(detectedApp);
            }

            const appMessageId = `app-overview-${Date.now()}`;

            setCurrentConversation(prev => {
              if (!prev) return prev;

              const appMessage: Message = {
                id: appMessageId,
                role: 'assistant',
                content: appOverviewContent,
                createdAt: new Date(),
                metadata: { isAppOverview: true, appId: detectedApp.id },
              };

              return {
                ...prev,
                messages: [...prev.messages, appMessage],
                lastMessageAt: new Date(),
              };
            });

            setTypewriterMessageId(appMessageId);
            setIsLoading(false);
            return; // Skip LLM call - app found and displayed
          }
          // App not found in catalog, continue to backend
        }

        // For app_creation, web_action, workflow, contextual_ui, file_action, chat
        // Continue to backend - it will handle with full context
        // The backend intent service will route to appropriate handler:
        // - app_creation → AppBuilderService
        // - web_action → screenshot/summarize/research handlers
        // - workflow → WorkflowBuilder (future)
        // - contextual_ui → Tool suggestions
        // - file_action → File-based tools
        // - chat → Normal LLM response

      } catch (error) {
        // Intent classification failed, continue with normal flow
        console.warn('⚠️ [Chat] Intent classification failed, continuing with normal flow:', error);
      }
    }
    console.log('➡️ [Chat] Passed intent classification block, proceeding to websocket send');

    // Web commands (screenshot, summarize, research) are now handled by the LLM-based
    // intent detection system. The backend's IntentService detects the intent and emits
    // 'intent:detected' event, which is handled by handleWebActionIntent via the onIntent callback.
    // This eliminates all hardcoded keyword detection and makes the system extensible.

    // Proceed with normal LLM flow - backend will detect intents and emit events
    // Build metadata with file attachments for the LLM
    const metadata: any = {};
    if (filesToSend.length > 0) {
      metadata.attachments = filesToSend.map(f => ({
        url: f.url,
        name: f.file.name,
        type: f.mimeType,
        size: f.file.size,
      }));
    }
    if (selectedModelId && selectedModelId !== 'auto') {
      metadata.modelId = selectedModelId;
    }

    // Debug logging before WebSocket send
    console.log('📡 [ChatPage] About to send via WebSocket:', {
      messagePreview: (messageContent || 'Please analyze the attached files.').substring(0, 50),
      hasAttachments: filesToSend.length > 0,
      socketState: chatService.isConnected() ? 'connected' : 'disconnected',
    });

    // Send message via WebSocket with attachments metadata
    chatService.sendMessage(
      messageContent || 'Please analyze the attached files.',
      Object.keys(metadata).length > 0 ? metadata : undefined
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenTool = (uiConfig: UIConfig) => {
    // Add to stack - check if tool is already open
    setOpenToolsStack(prev => {
      const existingIndex = prev.findIndex(t => t.toolId === uiConfig.toolId);
      if (existingIndex >= 0) {
        // Move to top of stack
        const newStack = [...prev];
        newStack.splice(existingIndex, 1);
        return [...newStack, uiConfig];
      }
      return [...prev, uiConfig];
    });
  };

  // Handler for clicking tool names in LLM response text
  const handleInlineToolClick = async (tool: SuggestedTool, userQuery: string, assistantContent: string) => {
    console.log('[ChatPage] handleInlineToolClick called with tool:', tool);
    console.log('[ChatPage] tool.prefillValues:', tool.prefillValues);
    console.log('[ChatPage] tool.extractedFields:', tool.extractedFields);

    setLoadingToolId(tool.toolId);
    try {
      let prefillData: Record<string, any> = {};

      // Check if tool already has pre-filled values from backend classification
      if (tool.prefillValues && Object.keys(tool.prefillValues).length > 0) {
        // Use the pre-filled values directly
        prefillData = { ...tool.prefillValues };
        console.log('[ChatPage] Using prefillValues from tool:', prefillData);

        // CRITICAL: Merge attachment URLs into prefillData
        // The attachmentMappings array contains { attachmentUrl, targetField }
        // We need to put the attachment URL into the correct field so tools can load the file
        if (tool.attachmentMappings && tool.attachmentMappings.length > 0) {
          console.log('[ChatPage] Merging attachmentMappings:', tool.attachmentMappings);
          for (const mapping of tool.attachmentMappings) {
            if (mapping.attachmentUrl && mapping.targetField) {
              prefillData[mapping.targetField] = mapping.attachmentUrl;
              // Also set common field aliases that tools might check
              // This ensures compatibility with tools checking different field names
              if (!prefillData.imageUrl && mapping.attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
                prefillData.imageUrl = mapping.attachmentUrl;
              }
              if (!prefillData.imagePreview) {
                prefillData.imagePreview = mapping.attachmentUrl;
              }
              if (!prefillData.inputFile) {
                prefillData.inputFile = mapping.attachmentUrl;
              }
              if (!prefillData.sourceImage) {
                prefillData.sourceImage = mapping.attachmentUrl;
              }
              if (!prefillData.sourceFile) {
                prefillData.sourceFile = mapping.attachmentUrl;
              }
            }
          }
          console.log('[ChatPage] After merging attachments:', prefillData);
        }

        // Store in session storage for tool page access
        sessionStorage.setItem(`tool_prefill_${tool.toolId}`, JSON.stringify({
          values: prefillData, // Use the merged prefillData, not just tool.prefillValues
          extractedFields: tool.extractedFields,
          attachmentMappings: tool.attachmentMappings,
          readinessPercentage: tool.readinessPercentage,
          timestamp: Date.now(),
        }));
      } else {
        console.log('[ChatPage] No prefillValues, falling back to extraction');
        // Fall back to backend extraction if no pre-filled values
        if (toolPrefillService.shouldUseBackendExtraction(tool.toolId)) {
          prefillData = await toolPrefillService.extractFromBackend(
            tool.toolId,
            userQuery,
            assistantContent
          );
        } else {
          prefillData = toolPrefillService.extractFromResponse(
            assistantContent,
            userQuery,
            tool.toolId
          );
        }
        console.log('[ChatPage] Extracted prefillData:', prefillData);
      }

      console.log('[ChatPage] Opening tool with params:', prefillData);
      handleOpenTool({
        type: tool.type as any,
        toolId: tool.toolId,
        title: tool.title,
        description: tool.description,
        params: prefillData,
      });
    } finally {
      setLoadingToolId(null);
    }
  };

  const handleCloseTool = () => {
    // Close only the top tool
    setOpenToolsStack(prev => prev.slice(0, -1));
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadApp = async (appId: string, appName: string) => {
    try {
      toast.info('Preparing download...');
      const blob = await appFilesService.downloadApp(appId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appName || appId}.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download app');
    }
  };

  const handleNewChat = () => {
    // Clear all conversation state
    setCurrentConversation(null);
    setMessageVersions(new Map());
    setCurrentVersionIndex(new Map());
    setActiveThread(null);
    setThreadMessages([]);
    setPreviewApp(null);
    setCurrentIntent(null);
    setOpenToolsStack([]);
    setAttachedFiles([]);
    setToolSuggestionsCache(new Map());
    setStreamingMessageId(null);
    setTypewriterMessageId(null);
    // Close any open panels
    setRightPanelMode('none');
    setWebContentData(null);
    setResearchData(null);
    // Navigate to fresh chat
    navigate('/chat');
  };

  const handleSelectConversation = (selectedConversationId: string) => {
    // Navigate to the selected conversation - this will trigger the useEffect to switch sessions
    navigate(`/chat/${selectedConversationId}`);
  };

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    if (currentConversation) {
      const msgIndex = currentConversation.messages.findIndex(m => m.id === editingMessageId);
      if (msgIndex === -1) return;

      const originalMessage = currentConversation.messages[msgIndex];

      // Skip temp messages - can't edit messages not yet saved
      if (editingMessageId.startsWith('temp-')) {
        toast.error('Please wait for the message to be saved before editing');
        return;
      }

      try {
        // Call branching API to create a version
        const result = await branchingService.editMessage(editingMessageId, editContent);

        // Update local state: keep messages up to edited one, update content
        const newMessages = currentConversation.messages.slice(0, msgIndex);
        newMessages.push({
          ...originalMessage,
          id: result.newMessageId, // Use the new message ID from backend
          content: editContent,
        });

        setCurrentConversation({
          ...currentConversation,
          messages: newMessages,
        });

        // Update version tracking - store under ORIGINAL message ID for navigation
        const versions = await branchingService.getMessageVersions(editingMessageId);
        if (versions.length > 1) {
          setMessageVersions(prev => {
            const newMap = new Map(prev);
            // Store versions under new ID so UI can find them
            newMap.set(result.newMessageId, versions);
            return newMap;
          });
          // Set current version to the latest (newly edited)
          setCurrentVersionIndex(prev => new Map(prev).set(result.newMessageId, versions.length - 1));
        }

        // Clear edit mode
        handleCancelEdit();

        // Now send to AI via chatService for new response (don't create new user message)
        setIsLoading(true);
        chatService.sendMessageForRegeneration(
          editContent,
          selectedModel?.id ? { modelId: selectedModel.id } : undefined
        );
      } catch (error) {
        console.error('Failed to edit message:', error);
        toast.error('Failed to edit message');
      }
    }
  };

  const handleRegenerateResponse = (userMessageContent: string) => {
    // Remove the last assistant message and regenerate response
    if (currentConversation && currentConversation.messages.length >= 2) {
      const lastUserMsgIndex = currentConversation.messages.length - 2;
      const newMessages = currentConversation.messages.slice(0, lastUserMsgIndex + 1);
      setCurrentConversation({
        ...currentConversation,
        messages: newMessages,
      });

      // Regenerate response without creating a new user message
      setIsLoading(true);
      chatService.sendMessageForRegeneration(
        userMessageContent,
        selectedModel?.id ? { modelId: selectedModel.id } : undefined
      );
    }
  };

  // Handle files attached from FileUploadPopup
  const handleFilesAttached = (files: UploadedFileInfo[]) => {
    setAttachedFiles(prev => [...prev, ...files]);

    // Check if any images are attached and model doesn't support vision
    const hasImages = files.some(f => f.mimeType.startsWith('image/'));
    if (hasImages && selectedModelId !== 'auto') {
      const currentModel = availableModels.find(m => m.id === selectedModelId);
      if (currentModel && !currentModel.supportsVision) {
        // Auto-switch to a vision-capable model
        const visionModel = availableModels.find(m => m.supportsVision);
        if (visionModel) {
          setSelectedModelId(visionModel.id);
          toast.info(`Switched to ${visionModel.name} for image analysis`);
        } else {
          toast.warning('No vision-capable model available. Images may not be analyzed.');
        }
      }
    }
  };

  // Remove an attached file
  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Drag and drop handlers for chat input
  const handleInputDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOnInput(true);
  }, []);

  const handleInputDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOnInput(false);
  }, []);

  const handleInputDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOnInput(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Upload files directly
    for (const file of droppedFiles) {
      const fileInfo: UploadedFileInfo = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        uploading: true,
        uploaded: false,
        mimeType: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };

      // Add to attachedFiles immediately (shows loading state)
      setAttachedFiles(prev => [...prev, fileInfo]);

      // Upload in background
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('public', 'true');
        formData.append('path', 'chat-uploads');

        const response = await api.post('/storage/upload', formData);

        setAttachedFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, uploading: false, uploaded: true, url: response.file?.url || response.url }
            : f
        ));
      } catch (error: any) {
        console.error('Upload failed:', error);
        setAttachedFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, uploading: false, error: error.message || 'Upload failed' }
            : f
        ));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }, []);

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // Reuse the same upload logic
    for (const file of files) {
      const fileInfo: UploadedFileInfo = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        uploading: true,
        uploaded: false,
        mimeType: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };

      setAttachedFiles(prev => [...prev, fileInfo]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('public', 'true');
        formData.append('path', 'chat-uploads');

        const response = await api.post('/storage/upload', formData);

        setAttachedFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, uploading: false, uploaded: true, url: response.file?.url || response.url }
            : f
        ));
      } catch (error: any) {
        console.error('Upload failed:', error);
        setAttachedFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, uploading: false, error: error.message || 'Upload failed' }
            : f
        ));
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Reset input
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = '';
    }
  }, []);

  // Check if we have images attached (for vision model warning)
  const hasImageAttachments = attachedFiles.some(f => f.mimeType.startsWith('image/'));
  const currentModelSupportsVision = selectedModelId === 'auto' ||
    availableModels.find(m => m.id === selectedModelId)?.supportsVision;

  // Quick action chips with dropdown suggestions - real prompts people use
  const quickActions = [
    {
      icon: Pencil,
      label: t('chat.quickActions.create'),
      suggestions: [
        { title: t('chat.suggestions.writeEmail'), prompt: 'Write a professional email to my boss requesting time off next week' },
        { title: t('chat.suggestions.blogPost'), prompt: 'Write a blog post about the benefits of remote work' },
        { title: t('chat.suggestions.socialMediaCaption'), prompt: 'Write an engaging Instagram caption for my new product launch' },
      ]
    },
    {
      icon: GraduationCap,
      label: t('chat.quickActions.research'),
      suggestions: [
        { title: t('chat.suggestions.marketResearch'), prompt: 'Research the top competitors in the fitness app market' },
        { title: t('chat.suggestions.summarizeArticle'), prompt: 'Summarize the key points from this article and give me actionable insights' },
        { title: t('chat.suggestions.compareOptions'), prompt: 'Compare React vs Vue vs Angular for building a web app - pros and cons' },
      ]
    },
    {
      icon: Code,
      label: t('chat.quickActions.build'),
      suggestions: [
        { title: t('chat.suggestions.createTool'), prompt: 'Build me a calculator tool that converts between currencies' },
        { title: t('chat.suggestions.debugCode'), prompt: 'Help me debug this code - it keeps throwing an error' },
        { title: t('chat.suggestions.generateCode'), prompt: 'Generate a React component for a user profile card with avatar and stats' },
      ]
    },
    {
      icon: LayoutGrid,
      label: t('chat.quickActions.organize'),
      suggestions: [
        { title: t('chat.suggestions.weeklyPlan'), prompt: 'Help me create a weekly meal plan for a family of 4 on a $150 budget' },
        { title: t('chat.suggestions.trackExpenses'), prompt: 'I need to track my monthly expenses and categorize my spending' },
        { title: t('chat.suggestions.projectTimeline'), prompt: 'Create a project timeline for launching a new website in 6 weeks' },
      ]
    },
    {
      icon: Sparkles,
      label: t('chat.quickActions.explore'),
      suggestions: [
        { title: t('chat.suggestions.whatCanYouDo'), prompt: 'What are all the things you can help me with?' },
        { title: t('chat.suggestions.analyzeImage'), prompt: 'Analyze this screenshot and tell me what you see' },
        { title: t('chat.suggestions.funSurprise'), prompt: 'Surprise me with something creative and fun!' },
      ]
    },
  ];

  // State for quick action dropdowns
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  // Close quick action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setActiveQuickAction(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group models by provider for better organization
  const groupedModels = availableModels.reduce((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  // Provider display names
  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    deepseek: 'DeepSeek',
    openrouter: 'OpenRouter',
  };

  return (
    <div className={cn(
      "flex h-full",
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
    )}>
        {/* Shared Sidebar */}
        <AppSidebar
          activePage="chat"
          isConnected={isConnected}
          onOpenChatHistory={() => setShowHistorySidebar(true)}
          onNewChat={handleNewChat}
        />

        {/* Chat History Sidebar */}
        <ChatHistorySidebar
          isOpen={showHistorySidebar}
          onClose={() => setShowHistorySidebar(false)}
          currentConversationId={conversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
        />

        {/* Main Chat Area */}
        <main className="flex-1 flex min-w-0">
          {/* Chat Content - shrinks when preview is open */}
          <div className={cn(
            "flex flex-col transition-all duration-300",
            previewApp ? "flex-1 min-w-[400px]" : "flex-1"
          )}>

        {currentConversation?.messages.length ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-8">
                {currentConversation.messages.map(message => (
                  <div key={message.id} className="mb-6">
                    {message.role === 'user' ? (
                      <div className="flex justify-end group/usermsg">
                        {editingMessageId === message.id ? (
                          // Edit mode
                          <div className="max-w-[80%] w-full">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className={cn(
                                "w-full rounded-2xl px-5 py-3 shadow-sm resize-none outline-none ring-0 focus:ring-0",
                                theme === 'dark'
                                  ? 'bg-[#2a2a2a] text-white border border-[#0D9488]'
                                  : 'bg-slate-50 text-slate-900 border border-[#0D9488]'
                              )}
                              rows={Math.min(editContent.split('\n').length + 1, 8)}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={handleCancelEdit}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                  theme === 'dark'
                                    ? 'text-slate-400 hover:text-white hover:bg-[#2a2a2a]'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                )}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#0D9488] text-white hover:bg-[#0B8278] transition-colors"
                              >
                                Save & Send
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Normal view with version navigation
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-start gap-2">
                              {/* Edit button - always visible */}
                              <button
                                onClick={() => handleStartEdit(message.id, message.content)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all self-center",
                                  theme === 'dark'
                                    ? 'hover:bg-[#2a2a2a] text-slate-500 hover:text-white'
                                    : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                                )}
                                title="Edit message"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <div className={cn(
                                "max-w-[80%] rounded-2xl px-5 py-3 shadow-sm",
                                theme === 'dark'
                                  ? 'bg-[#2a2a2a] text-white border border-[#3a3a3a]'
                                  : 'bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white'
                              )}>
                                {/* Show attached files */}
                                {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {message.metadata.attachments.map((file: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className={cn(
                                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                                          theme === 'dark'
                                            ? 'bg-[#1a1a1a] border border-[#3a3a3a]'
                                            : 'bg-white/20 border border-white/30'
                                        )}
                                      >
                                        {file.type?.startsWith('image/') ? (
                                          <img src={file.url} alt={file.name} className="w-8 h-8 rounded object-cover" />
                                        ) : (
                                          <FileText className="w-4 h-4" />
                                        )}
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                            </div>
                            {/* Version navigation - show if message has versions */}
                            {messageVersions.get(message.id) && messageVersions.get(message.id)!.length > 1 && (
                              <div className={cn(
                                "flex items-center gap-1 mr-1",
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                              )}>
                                <button
                                  onClick={() => goToPreviousVersion(message.id)}
                                  disabled={(currentVersionIndex.get(message.id) || 0) === 0}
                                  className={cn(
                                    "p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  )}
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-medium min-w-[40px] text-center">
                                  {(currentVersionIndex.get(message.id) || 0) + 1} / {messageVersions.get(message.id)!.length}
                                </span>
                                <button
                                  onClick={() => goToNextVersion(message.id)}
                                  disabled={(currentVersionIndex.get(message.id) || 0) >= messageVersions.get(message.id)!.length - 1}
                                  className={cn(
                                    "p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  )}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-4 group/message">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
                          <Sparkles className="w-4 h-4 text-[#0D9488]" />
                        </div>
                        <div className={cn(
                          "flex-1 pt-1 min-w-0",
                          theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                        )}>
                          <MessageContent
                            content={message.content}
                            enableTypewriter={message.id === typewriterMessageId && message.id !== streamingMessageId}
                            typewriterSpeed={500}
                            onTypewriterComplete={() => {
                              if (message.id === typewriterMessageId) {
                                setTypewriterMessageId(null);
                              }
                            }}
                            onTypewriterTick={scrollToBottomSmooth}
                            suggestedTools={message.metadata?.suggestedTools || []}
                            onToolClick={(tool) => handleInlineToolClick(tool, message.userQuery || '', message.content)}
                            loadingToolId={loadingToolId}
                          />
                          {/* Streaming cursor - shows blinking cursor while streaming */}
                          {message.id === streamingMessageId && (
                            <span className="inline-block w-2 h-4 ml-0.5 bg-[#0D9488] animate-pulse rounded-sm" />
                          )}
                          {/* Tool Launch Button - only show after typewriter/streaming completes */}
                          {message.id !== typewriterMessageId && message.id !== streamingMessageId && message.uiConfig && toolComponents[message.uiConfig.toolId || ''] && (
                            <ToolLaunchButton
                              uiConfig={message.uiConfig}
                              onClick={() => handleOpenTool(message.uiConfig!)}
                            />
                          )}
                          {/* Action Buttons - Only show after typewriter/streaming completes */}
                          {message.id !== typewriterMessageId && message.id !== streamingMessageId && (
                            <div className="mt-2 flex items-center gap-2">
                              {/* View Preview Button - for app overview messages (existing apps from catalog) */}
                              {message.metadata?.isAppOverview && message.metadata?.appId && (
                                <button
                                  onClick={async () => {
                                    setLoadingPreviewId(message.id);
                                    try {
                                      const app = await appCatalogService.getAppById(message.metadata.appId);
                                      if (app) {
                                        openAppPreviewPanel(app);
                                      }
                                    } finally {
                                      setLoadingPreviewId(null);
                                    }
                                  }}
                                  disabled={loadingPreviewId === message.id}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    loadingPreviewId === message.id
                                      ? 'opacity-70 cursor-not-allowed'
                                      : '',
                                    theme === 'dark'
                                      ? 'bg-[#0D9488]/20 text-[#0D9488] hover:bg-[#0D9488]/30'
                                      : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                                  )}
                                >
                                  {loadingPreviewId === message.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                  {loadingPreviewId === message.id ? 'Loading...' : 'Preview'}
                                </button>
                              )}
                              {/* View Preview Button - for generated apps (app-builder) */}
                              {message.metadata?.appBuilder?.frontendUrl && (
                                <button
                                  onClick={() => {
                                    // Create an App-compatible object from app-builder metadata
                                    const generatedApp: App = {
                                      id: message.metadata.appBuilder.appId || `generated-${Date.now()}`,
                                      name: message.metadata.appBuilder.appName || 'Generated App',
                                      description: `Generated ${message.metadata.appBuilder.appType || 'app'}`,
                                      category: message.metadata.appBuilder.appType || 'generated',
                                      // Use hasXxxCode flags if available, fallback to URL presence
                                      hasBackend: message.metadata.appBuilder.hasBackendCode ?? !!message.metadata.appBuilder.backendUrl,
                                      hasFrontend: message.metadata.appBuilder.hasFrontendCode ?? true,
                                      hasMobile: message.metadata.appBuilder.hasMobileCode ?? false,
                                      status: 'deployed',
                                      backendUrl: message.metadata.appBuilder.backendUrl || null,
                                      frontendUrl: message.metadata.appBuilder.frontendUrl,
                                      workerName: null,
                                      apiDocsUrl: message.metadata.appBuilder.backendUrl ? `${message.metadata.appBuilder.backendUrl}/docs` : null,
                                    };
                                    openAppPreviewPanel(generatedApp);
                                  }}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    theme === 'dark'
                                      ? 'bg-[#0D9488]/20 text-[#0D9488] hover:bg-[#0D9488]/30'
                                      : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                                  )}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Preview
                                </button>
                              )}
                              {/* Download Button - for generated apps (app-builder) */}
                              {message.metadata?.appBuilder?.appId && (
                                <button
                                  onClick={() => handleDownloadApp(
                                    message.metadata.appBuilder.appId,
                                    message.metadata.appBuilder.appName || message.metadata.appBuilder.appId
                                  )}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    theme === 'dark'
                                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                      : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                                  )}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download
                                </button>
                              )}
                              {/* Copy Button */}
                              <button
                                onClick={() => handleCopyMessage(message.id, message.content)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                  copiedMessageId === message.id
                                    ? 'bg-green-500/20 text-green-600'
                                    : theme === 'dark'
                                      ? 'bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#3a3a3a]'
                                      : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                )}
                              >
                                {copiedMessageId === message.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                  </>
                                )}
                              </button>
                              {/* Regenerate Button - only on last assistant message */}
                              {currentConversation.messages.indexOf(message) === currentConversation.messages.length - 1 && (
                                <button
                                  onClick={() => {
                                    // Find the user message before this assistant message
                                    const msgIndex = currentConversation.messages.indexOf(message);
                                    if (msgIndex > 0) {
                                      const prevUserMsg = currentConversation.messages[msgIndex - 1];
                                      if (prevUserMsg.role === 'user') {
                                        handleRegenerateResponse(prevUserMsg.content);
                                      }
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    theme === 'dark'
                                      ? 'bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#3a3a3a]'
                                      : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                  )}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Regenerate
                                </button>
                              )}
                              {/* Thread Button - only show for persisted messages (valid UUIDs) */}
                              {/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.id) && (
                                <button
                                  onClick={() => handleOpenSubChat(message)}
                                  disabled={loadingThreadId === message.id}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    loadingThreadId === message.id
                                      ? 'opacity-70 cursor-not-allowed'
                                      : '',
                                    activeThread?.parentMessage.id === message.id
                                      ? 'bg-[#0D9488]/20 text-[#0D9488]'
                                      : theme === 'dark'
                                        ? 'bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#3a3a3a]'
                                        : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                  )}
                                >
                                  {loadingThreadId === message.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <GitBranch className="w-3.5 h-3.5" />
                                  )}
                                  {loadingThreadId === message.id ? 'Loading...' : 'Thread'}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Tool Suggestions - Show relevant tools based on user query (only after typewriter/streaming completes) */}
                          {/* Also show pre-filled tools from backend if available */}
                          {message.id !== typewriterMessageId && message.id !== streamingMessageId && !message.metadata?.isAppOverview && !message.metadata?.isBuilding && !message.metadata?.appBuilder && (() => {
                            // Check for pre-filled tools from backend in message metadata
                            const prefillTools = (message.metadata?.suggestedTools || []).filter(
                              (t: SuggestedTool) => t.prefillValues && Object.keys(t.prefillValues).length > 0
                            );

                            // Use cached suggestions from semantic search API (when user query exists)
                            const cachedSuggestions = message.userQuery ? toolSuggestionsCache.get(message.id) : null;
                            const regularTools = cachedSuggestions?.tools || [];

                            // If no tools at all, return null
                            if (prefillTools.length === 0 && regularTools.length === 0) return null;

                            return (
                              <>
                                {/* Separator */}
                                <div className={cn(
                                  "mt-4 pt-4 border-t",
                                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                )}>
                                  {/* Pre-filled Tools Section - More prominent */}
                                  {prefillTools.length > 0 && (
                                    <div className="mb-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-green-500" />
                                        <span className={cn(
                                          "text-xs font-medium",
                                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                        )}>
                                          Ready to Use
                                        </span>
                                        <span className={cn(
                                          "text-[10px] px-1.5 py-0.5 rounded-full",
                                          theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-500/10 text-green-600'
                                        )}>
                                          Pre-filled from your request
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {prefillTools.map((tool: SuggestedTool) => (
                                          <EnhancedToolChipCard
                                            key={tool.toolId}
                                            toolId={tool.toolId}
                                            title={tool.title}
                                            description={tool.description}
                                            icon={tool.icon}
                                            onClick={() => handleInlineToolClick(tool, message.userQuery || '', message.content)}
                                            theme={theme}
                                            prefillValues={tool.prefillValues}
                                            extractedFields={tool.extractedFields}
                                            attachmentMappings={tool.attachmentMappings}
                                            readinessPercentage={tool.readinessPercentage}
                                            isLoading={loadingToolId === tool.toolId}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Regular Suggested Tools */}
                                  {regularTools.length > 0 && (
                                    <>
                                      <div className="flex items-center gap-2 mb-3">
                                        <Wrench className="w-4 h-4 text-[#0D9488]" />
                                        <span className={cn(
                                          "text-xs font-medium",
                                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        )}>
                                          {prefillTools.length > 0 ? 'Other Suggested Tools' : 'Suggested Tools'}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {regularTools.map(suggestion => {
                                          const isToolLoading = loadingToolId === suggestion.tool.id;
                                          // Skip if already shown in pre-filled section
                                          if (prefillTools.some((t: SuggestedTool) => t.toolId === suggestion.tool.id)) return null;
                                          return (
                                            <button
                                              key={suggestion.tool.id}
                                              disabled={isToolLoading || loadingToolId !== null}
                                              onClick={async () => {
                                                // Set loading state
                                                setLoadingToolId(suggestion.tool.id);
                                                try {
                                                  // For topic-based tools, use backend LLM extraction
                                                  // For structured tools, use frontend extraction
                                                  let prefillData;
                                                  if (toolPrefillService.shouldUseBackendExtraction(suggestion.tool.id)) {
                                                    // Use backend LLM extraction for intelligent intent extraction
                                                    prefillData = await toolPrefillService.extractFromBackend(
                                                      suggestion.tool.id,
                                                      message.userQuery || '',
                                                      message.content
                                                    );
                                                  } else {
                                                    // Use frontend extraction for structured data
                                                    prefillData = toolPrefillService.extractFromResponse(
                                                      message.content,
                                                      message.userQuery || '',
                                                      suggestion.tool.id
                                                    );
                                                  }
                                                  handleOpenTool({
                                                    type: suggestion.tool.type as any, // Type from toolsData is string
                                                    toolId: suggestion.tool.id,
                                                    title: suggestion.tool.title,
                                                    description: suggestion.tool.description,
                                                    params: prefillData, // Pass prefill data to tool
                                                  });
                                                } finally {
                                                  setLoadingToolId(null);
                                                }
                                              }}
                                              className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                                                isToolLoading
                                                  ? 'opacity-70 cursor-wait'
                                                  : loadingToolId !== null
                                                  ? 'opacity-50 cursor-not-allowed'
                                                  : 'hover:scale-105',
                                                theme === 'dark'
                                                  ? 'bg-[#0D9488]/20 text-[#0D9488] hover:bg-[#0D9488]/30'
                                                  : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                                              )}
                                            >
                                              {isToolLoading && (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              )}
                                              <span>{suggestion.tool.title}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Loading indicator - hide when streaming since we show content directly */}
                {(isLoading || isTyping) && !streamingMessageId && !appBuilderProgress?.isGenerating && (
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
                      <Sparkles className="w-4 h-4 text-[#0D9488] animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1 pt-2">
                      {currentIntent?.intent?.matched && (
                        <p className={cn(
                          "text-xs mb-1 font-medium",
                          theme === 'dark' ? 'text-slate-400' : 'text-[#0D9488]'
                        )}>
                          Launching: <span className="font-semibold">{currentIntent.uiConfig?.title}</span>
                        </p>
                      )}
                      <div className="flex gap-1.5 pt-1">
                        <span className="w-2 h-2 rounded-full animate-bounce bg-[#0D9488]" />
                        <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s] bg-[#0D9488]/70" />
                        <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s] bg-[#0D9488]/40" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - when in conversation */}
            <div className="p-4 pb-6">
              <div className="max-w-3xl mx-auto">
                {/* Hidden file input */}
                <input
                  ref={chatFileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.md,.zip,.rar"
                />
                <div
                  onDragOver={handleInputDragOver}
                  onDragLeave={handleInputDragLeave}
                  onDrop={handleInputDrop}
                  className={cn(
                    "relative rounded-2xl shadow-lg transition-all duration-200 border",
                    theme === 'dark'
                      ? 'bg-[#232323] border-[#3a3a3a]'
                      : 'bg-[#f9f8f6] border-[#e8e6e3] shadow-sm',
                    isDraggingOnInput && 'border-[#0D9488] border-2 border-dashed'
                  )}>
                  {/* Drag overlay */}
                  {isDraggingOnInput && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#0D9488]/10 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2 text-[#0D9488]">
                        <Upload className="w-8 h-8" />
                        <span className="text-sm font-medium">{t('chat.dropFilesHere')}</span>
                      </div>
                    </div>
                  )}
                  {/* Attached Files Preview */}
                  {attachedFiles.length > 0 && (
                    <div className={cn(
                      "px-4 pt-3 pb-2 border-b flex flex-wrap gap-2",
                      theme === 'dark' ? 'border-[#2a2a2a]' : 'border-slate-200'
                    )}>
                      {attachedFiles.map(file => {
                        const FileIcon = getFileIcon(file.mimeType);
                        return (
                          <div
                            key={file.id}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg border group",
                              theme === 'dark'
                                ? 'bg-[#2a2a2a] border-[#3a3a3a]'
                                : 'bg-slate-50 border-slate-200'
                            )}
                          >
                            {file.preview ? (
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <FileIcon className={cn(
                                "w-5 h-5",
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                              )} />
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className={cn(
                                "text-xs font-medium truncate max-w-[120px]",
                                theme === 'dark' ? 'text-white' : 'text-slate-700'
                              )}>
                                {file.file.name}
                              </span>
                              <span className={cn(
                                "text-xs",
                                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                              )}>
                                {formatFileSize(file.file.size)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(file.id)}
                              className={cn(
                                "p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity",
                                theme === 'dark'
                                  ? 'hover:bg-[#3a3a3a] text-slate-400'
                                  : 'hover:bg-slate-200 text-slate-500'
                              )}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      {/* Vision warning */}
                      {hasImageAttachments && !currentModelSupportsVision && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{t('chat.currentModelMayNotSupportImages')}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply to Wants..."
                    rows={1}
                    className={cn(
                      "w-full resize-none px-5 py-4 bg-transparent outline-none text-base max-h-[200px] border-0 ring-0 focus:border-0 focus:ring-0 focus:outline-none",
                      theme === 'dark'
                        ? 'text-white placeholder:text-slate-500'
                        : 'text-slate-800 placeholder:text-slate-400'
                    )}
                  />
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => chatFileInputRef.current?.click()}
                        title="Attach files (images, documents, data files)"
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200",
                          theme === 'dark' ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-[#0D9488]' : 'hover:bg-slate-100 text-slate-500 hover:text-[#0D9488]'
                        )}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Model Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowModelMenu(!showModelMenu)}
                          disabled={isLoadingModels}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                            theme === 'dark'
                              ? 'hover:bg-[#2a2a2a] text-slate-300'
                              : 'hover:bg-slate-100 text-slate-600'
                          )}
                        >
                          {selectedModel && getTierIcon(selectedModel.tier)}
                          {selectedModel?.name || 'Select Model'}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showModelMenu && (
                          <div className={cn(
                            "absolute bottom-full right-0 mb-2 w-64 max-h-80 overflow-y-auto rounded-xl shadow-xl border z-50 backdrop-blur-xl",
                            theme === 'dark'
                              ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]'
                              : 'bg-white/95 border-slate-200'
                          )}>
                            {/* Auto Mode Option */}
                            <div>
                              <div className={cn(
                                "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
                                theme === 'dark' ? 'text-slate-500 bg-[#2a2a2a]/50' : 'text-slate-400 bg-slate-50'
                              )}>
                                Recommended
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedModelId('auto');
                                  setShowModelMenu(false);
                                }}
                                className={cn(
                                  "w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2",
                                  selectedModelId === 'auto'
                                    ? theme === 'dark' ? 'bg-[#2a2a2a] text-white' : 'bg-[#0D9488]/10 text-[#0D9488]'
                                    : theme === 'dark' ? 'text-slate-300 hover:bg-[#2a2a2a]' : 'text-slate-600 hover:bg-slate-50'
                                )}
                              >
                                <Sparkles className="w-3 h-3 text-[#0D9488]" />
                                <span className="flex-1">Auto</span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-[#0D9488]/20 text-[#0D9488]">Smart</span>
                              </button>
                            </div>
                            {Object.entries(groupedModels).map(([provider, models]) => (
                              <div key={provider}>
                                <div className={cn(
                                  "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
                                  theme === 'dark' ? 'text-slate-500 bg-[#2a2a2a]/50' : 'text-slate-400 bg-slate-50'
                                )}>
                                  {providerNames[provider] || provider}
                                </div>
                                {models.map(model => (
                                  <button
                                    key={model.id}
                                    onClick={() => {
                                      setSelectedModelId(model.id);
                                      setShowModelMenu(false);
                                    }}
                                    className={cn(
                                      "w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2",
                                      selectedModelId === model.id
                                        ? theme === 'dark' ? 'bg-[#2a2a2a] text-white' : 'bg-[#0D9488]/10 text-[#0D9488]'
                                        : theme === 'dark' ? 'text-slate-300 hover:bg-[#2a2a2a]' : 'text-slate-600 hover:bg-slate-50'
                                    )}
                                  >
                                    {getTierIcon(model.tier)}
                                    <span className="flex-1">{model.name}</span>
                                    {model.supportsVision && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Vision</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Send Button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
                        className={cn(
                          "p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40",
                          (inputValue.trim() || attachedFiles.length > 0)
                            ? 'bg-gradient-to-br from-[#0D9488] to-[#0F766E] hover:from-[#14B8A6] hover:to-[#0D9488] text-white shadow-md shadow-[#0D9488]/25 hover:shadow-lg hover:shadow-[#0D9488]/40'
                            : theme === 'dark' ? 'bg-[#2a2a2a] text-slate-500' : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State - Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
{/* TEST IFRAME - COMMENTED OUT
            <div style={{ width: '100%', maxWidth: '800px', height: '400px', border: '3px solid red', marginBottom: '20px' }}>
              <iframe
                src="https://myblog-7b2cd7.fluxez.workers.dev"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Test iframe"
              />
            </div>
*/}

            {/* Greeting */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-xl shadow-[#0D9488]/20 mb-6 overflow-hidden">
                <img src="/assets/logo.png" alt="Wants" className="w-full h-full object-contain" />
              </div>
              <h1 className={cn(
                "text-4xl md:text-5xl font-bold tracking-tight",
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              )}>
                {t('chat.greeting')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#14B8A6]">{firstName}</span>
              </h1>
              <p className={cn(
                "mt-3 text-lg",
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              )}>
                {t('chat.subtitle')}
              </p>
            </div>

            {/* Main Input Box */}
            <div className="w-full max-w-2xl mb-8">
              {/* Hidden file input for welcome screen */}
              <input
                ref={chatFileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.md,.zip,.rar"
              />
              <div
                onDragOver={handleInputDragOver}
                onDragLeave={handleInputDragLeave}
                onDrop={handleInputDrop}
                className={cn(
                  "relative rounded-2xl shadow-lg transition-all duration-200 border",
                  theme === 'dark'
                    ? 'bg-[#232323] border-[#3a3a3a]'
                    : 'bg-[#f9f8f6] border-[#e8e6e3] shadow-sm',
                  isDraggingOnInput && 'border-[#0D9488] border-2 border-dashed'
                )}>
                {/* Drag overlay */}
                {isDraggingOnInput && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#0D9488]/10 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 text-[#0D9488]">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">{t('chat.dropFilesHere')}</span>
                    </div>
                  </div>
                )}
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className={cn(
                    "px-4 pt-3 pb-2 border-b flex flex-wrap gap-2",
                    theme === 'dark' ? 'border-[#2a2a2a]' : 'border-slate-200'
                  )}>
                    {attachedFiles.map(file => {
                      const FileIcon = getFileIcon(file.mimeType);
                      return (
                        <div
                          key={file.id}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border group",
                            theme === 'dark'
                              ? 'bg-[#2a2a2a] border-[#3a3a3a]'
                              : 'bg-slate-50 border-slate-200'
                          )}
                        >
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.file.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <FileIcon className={cn(
                              "w-5 h-5",
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            )} />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className={cn(
                              "text-xs font-medium truncate max-w-[120px]",
                              theme === 'dark' ? 'text-white' : 'text-slate-700'
                            )}>
                              {file.file.name}
                            </span>
                            <span className={cn(
                              "text-xs",
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            )}>
                              {formatFileSize(file.file.size)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className={cn(
                              "p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity",
                              theme === 'dark'
                                ? 'hover:bg-[#3a3a3a] text-slate-400'
                                : 'hover:bg-slate-200 text-slate-500'
                            )}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                    {/* Vision warning */}
                    {hasImageAttachments && !currentModelSupportsVision && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{t('chat.currentModelMayNotSupportImages')}</span>
                      </div>
                    )}
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chat.placeholder')}
                  rows={2}
                  className={cn(
                    "w-full resize-none px-5 py-4 bg-transparent outline-none text-base border-0 ring-0 focus:border-0 focus:ring-0 focus:outline-none",
                    theme === 'dark'
                      ? 'text-white placeholder:text-slate-500'
                      : 'text-slate-800 placeholder:text-slate-400'
                  )}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => chatFileInputRef.current?.click()}
                      title="Attach files (images, documents, data files)"
                      className={cn(
                        "p-2 rounded-xl transition-all duration-200",
                        theme === 'dark' ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-[#0D9488]' : 'hover:bg-slate-100 text-slate-500 hover:text-[#0D9488]'
                      )}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Model Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowModelMenu(!showModelMenu)}
                        disabled={isLoadingModels}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                          theme === 'dark'
                            ? 'hover:bg-[#2a2a2a] text-slate-300'
                            : 'hover:bg-slate-100 text-slate-600'
                        )}
                      >
                        {selectedModel && getTierIcon(selectedModel.tier)}
                        {selectedModel?.name || 'Select Model'}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showModelMenu && (
                        <div className={cn(
                          "absolute bottom-full right-0 mb-2 w-64 max-h-80 overflow-y-auto rounded-xl shadow-xl border z-50 backdrop-blur-xl",
                          theme === 'dark'
                            ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]'
                            : 'bg-white/95 border-slate-200'
                        )}>
                          {/* Auto Mode Option */}
                          <div>
                            <div className={cn(
                              "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
                              theme === 'dark' ? 'text-slate-500 bg-[#2a2a2a]/50' : 'text-slate-400 bg-slate-50'
                            )}>
                              Recommended
                            </div>
                            <button
                              onClick={() => {
                                setSelectedModelId('auto');
                                setShowModelMenu(false);
                              }}
                              className={cn(
                                "w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2",
                                selectedModelId === 'auto'
                                  ? theme === 'dark' ? 'bg-[#2a2a2a] text-white' : 'bg-[#0D9488]/10 text-[#0D9488]'
                                  : theme === 'dark' ? 'text-slate-300 hover:bg-[#2a2a2a]' : 'text-slate-600 hover:bg-slate-50'
                              )}
                            >
                              <Sparkles className="w-3 h-3 text-[#0D9488]" />
                              <span className="flex-1">Auto</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-[#0D9488]/20 text-[#0D9488]">Smart</span>
                            </button>
                          </div>
                          {Object.entries(groupedModels).map(([provider, models]) => (
                            <div key={provider}>
                              <div className={cn(
                                "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
                                theme === 'dark' ? 'text-slate-500 bg-[#2a2a2a]/50' : 'text-slate-400 bg-slate-50'
                              )}>
                                {providerNames[provider] || provider}
                              </div>
                              {models.map(model => (
                                <button
                                  key={model.id}
                                  onClick={() => {
                                    setSelectedModelId(model.id);
                                    setShowModelMenu(false);
                                  }}
                                  className={cn(
                                    "w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2",
                                    selectedModelId === model.id
                                      ? theme === 'dark' ? 'bg-[#2a2a2a] text-white' : 'bg-[#0D9488]/10 text-[#0D9488]'
                                      : theme === 'dark' ? 'text-slate-300 hover:bg-[#2a2a2a]' : 'text-slate-600 hover:bg-slate-50'
                                  )}
                                >
                                  {getTierIcon(model.tier)}
                                  <span className="flex-1">{model.name}</span>
                                  {model.supportsVision && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Vision</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
                      className={cn(
                        "p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40",
                        (inputValue.trim() || attachedFiles.length > 0)
                          ? 'bg-gradient-to-br from-[#0D9488] to-[#0F766E] hover:from-[#14B8A6] hover:to-[#0D9488] text-white shadow-md shadow-[#0D9488]/25 hover:shadow-lg hover:shadow-[#0D9488]/40'
                          : theme === 'dark' ? 'bg-[#2a2a2a] text-slate-500' : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Chips with Dropdowns */}
            <div className="flex flex-wrap justify-center gap-3" ref={quickActionRef}>
              {quickActions.map(({ icon: Icon, label, suggestions }) => (
                <div key={label} className="relative">
                  <button
                    onClick={() => setActiveQuickAction(activeQuickAction === label ? null : label)}
                    className={cn(
                      "flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium group",
                      activeQuickAction === label
                        ? theme === 'dark'
                          ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                          : 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] shadow-md shadow-[#0D9488]/20'
                        : theme === 'dark'
                          ? 'border-[#2a2a2a] text-slate-300 hover:bg-[#2a2a2a] hover:border-[#3a3a3a]'
                          : 'border-slate-200 text-slate-600 hover:bg-white hover:border-[#0D9488]/30 hover:text-[#0D9488] hover:shadow-md hover:shadow-[#0D9488]/10'
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-colors",
                      activeQuickAction === label ? 'text-[#0D9488]' : theme === 'dark' ? '' : 'group-hover:text-[#0D9488]'
                    )} />
                    {label}
                    <ChevronDown className={cn(
                      "w-3 h-3 transition-transform",
                      activeQuickAction === label ? 'rotate-180' : ''
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeQuickAction === label && (
                    <div className={cn(
                      "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-xl shadow-xl border z-50 overflow-hidden",
                      theme === 'dark'
                        ? 'bg-[#232323] border-[#3a3a3a]'
                        : 'bg-white border-slate-200'
                    )}>
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputValue(suggestion.prompt);
                            setActiveQuickAction(null);
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left transition-colors border-b last:border-b-0",
                            theme === 'dark'
                              ? 'hover:bg-[#2a2a2a] border-[#2a2a2a]'
                              : 'hover:bg-slate-50 border-slate-100'
                          )}
                        >
                          <div className={cn(
                            "text-sm font-medium mb-0.5",
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          )}>
                            {suggestion.title}
                          </div>
                          <div className={cn(
                            "text-xs line-clamp-2",
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          )}>
                            {suggestion.prompt}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
        {/* End of Chat Content Wrapper */}

        {/* Right Panel - Unified management for Thread, App Preview, Web Content, Research */}
        {rightPanelMode === 'thread' && activeThread ? (
          /* Thread Panel */
          <ResizablePanel
            defaultWidth={450}
            minWidth={350}
            maxWidth={600}
            storageKey="wants-thread-panel-width"
          >
            <ThreadPanel
              branchId={activeThread.branchId}
              parentMessage={{
                id: activeThread.parentMessage.id,
                role: activeThread.parentMessage.role,
                content: activeThread.parentMessage.content,
                createdAt: activeThread.parentMessage.createdAt,
              }}
              messages={threadMessages}
              onClose={handleCloseSubChat}
              onSendMessage={handleSendThreadMessage}
              onRegenerate={handleRegenerateThreadResponse}
              isLoading={threadLoading}
              streamingMessageId={threadStreamingId}
            />
          </ResizablePanel>
        ) : rightPanelMode === 'app-builder' && appBuilderProgress ? (
          /* App Builder Progress Panel - shows during app generation */
          <ResizablePanel
            defaultWidth={600}
            minWidth={400}
            maxWidth={900}
            storageKey="wants-app-builder-width"
          >
            <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    appBuilderProgress.isGenerating
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse"
                      : appBuilderProgress.status === 'error'
                      ? "bg-gradient-to-br from-red-500 to-red-600"
                      : "bg-gradient-to-br from-green-500 to-emerald-500"
                  )}>
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                      {appBuilderProgress.isGenerating ? 'Building App...' :
                       appBuilderProgress.status === 'error' ? 'Build Failed' : 'Build Complete'}
                    </h3>
                    {appBuilderProgress.appName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{appBuilderProgress.appName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium capitalize",
                    appBuilderProgress.isGenerating
                      ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                      : appBuilderProgress.status === 'error'
                      ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                      : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                  )}>
                    {appBuilderProgress.step}
                  </span>
                  <button
                    onClick={closeRightPanel}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Progress Logs - Terminal Style */}
              <div ref={appBuilderLogsRef} className="flex-1 overflow-auto bg-[#0d1117] dark:bg-[#0d1117]">
                <div className="p-4 font-mono text-sm space-y-1">
                  {appBuilderProgress.logs?.map((log, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2",
                        log.type === 'success' && "text-green-400",
                        log.type === 'error' && "text-red-400",
                        log.type === 'step' && "text-blue-400",
                        log.type === 'info' && "text-gray-400"
                      )}
                    >
                      <span className="text-gray-600 select-none">{log.timestamp}</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                  {appBuilderProgress.isGenerating && (
                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with App Info (if available) */}
              {(appBuilderProgress.appName || appBuilderProgress.features?.length) && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-[#141414]">
                  <div className="space-y-2">
                    {appBuilderProgress.appType && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {appBuilderProgress.appType}
                        </span>
                      </div>
                    )}
                    {appBuilderProgress.features && appBuilderProgress.features.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Features:</span>
                        <div className="flex flex-wrap gap-1">
                          {appBuilderProgress.features.slice(0, 5).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {appBuilderProgress.features.length > 5 && (
                            <span className="text-xs text-gray-500">+{appBuilderProgress.features.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        ) : rightPanelMode === 'app-preview' && previewApp ? (
          /* App Preview Panel - slides in from right */
          <ResizablePanel
            defaultWidth={600}
            minWidth={400}
            maxWidth={900}
            storageKey="wants-app-preview-width"
          >
            <AppPreviewPanel
              app={previewApp}
              onClose={closeRightPanel}
            />
          </ResizablePanel>
        ) : rightPanelMode === 'web-content' && webContentData ? (
          /* Web Content Panel - screenshots, summaries, URL previews */
          <ResizablePanel
            defaultWidth={600}
            minWidth={400}
            maxWidth={900}
            storageKey="wants-web-content-width"
          >
            <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {webContentData.type === 'screenshot' ? 'Screenshot' :
                     webContentData.type === 'page-summary' ? 'Page Summary' : 'URL Preview'}
                  </span>
                </div>
                <button
                  onClick={closeRightPanel}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Screenshot Preview */}
                {webContentData.screenshot && (
                  <div className="relative group">
                    <img
                      src={webContentData.screenshot}
                      alt="Screenshot"
                      className="w-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                      <a
                        href={webContentData.screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-gray-800 hover:bg-white flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Full Size
                      </a>
                      <button
                        onClick={() => downloadImage(webContentData.screenshot!, `screenshot-${Date.now()}.png`)}
                        className="px-4 py-2 bg-[#0D9488] rounded-lg text-sm font-medium text-white hover:bg-[#0B7A70] flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                )}

                {/* Title & URL */}
                {webContentData.title && (
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{webContentData.title}</h2>
                    {(webContentData.sourceUrl || webContentData.url) && (
                      <a
                        href={webContentData.sourceUrl || webContentData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#0D9488] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {webContentData.sourceUrl || webContentData.url}
                      </a>
                    )}
                  </div>
                )}

                {/* Key Points (if available) */}
                {webContentData.metadata?.keyPoints && webContentData.metadata.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Key Points</h3>
                    <ul className="space-y-1.5">
                      {webContentData.metadata.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-[#0D9488] mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notable Quotes (if available) */}
                {webContentData.metadata?.quotes && webContentData.metadata.quotes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notable Quotes</h3>
                    <div className="space-y-2">
                      {webContentData.metadata.quotes.map((quote: string, i: number) => (
                        <blockquote key={i} className="pl-3 border-l-2 border-[#0D9488] text-sm italic text-gray-600 dark:text-gray-400">
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {webContentData.type === 'page-summary' && !webContentData.screenshot && (
                    <button
                      onClick={async () => {
                        if (webContentData.url) {
                          toast.info('Capturing screenshot...');
                          try {
                            const result = await urlMetadata.captureScreenshot(webContentData.url);
                            if (result) {
                              setWebContentData(prev => prev ? { ...prev, screenshot: result.imageUrl, contentId: result.contentId } : prev);
                              toast.success('Screenshot captured!');
                            }
                          } catch {
                            toast.error('Failed to capture screenshot');
                          }
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Capture Screenshot
                    </button>
                  )}
                  {(webContentData.sourceUrl || webContentData.url) && (
                    <a
                      href={webContentData.sourceUrl || webContentData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#0D9488] rounded-lg hover:bg-[#0B7A70] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Website
                    </a>
                  )}
                  {webContentData.screenshot && (
                    <button
                      onClick={() => downloadImage(
                        webContentData.screenshot!,
                        `screenshot-${webContentData.title?.replace(/[^a-zA-Z0-9]/g, '-') || Date.now()}.png`
                      )}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const shareUrl = webContentData.sourceUrl || webContentData.url;
                      const shareTitle = webContentData.title || 'Web Content';
                      const shareText = webContentData.summary || `Check out this ${webContentData.type === 'screenshot' ? 'screenshot' : 'page'}`;

                      if (navigator.share) {
                        navigator.share({
                          title: shareTitle,
                          text: shareText,
                          url: shareUrl,
                        }).catch(() => {
                          // User cancelled or error
                        });
                      } else {
                        // Fallback: copy to clipboard
                        const copyText = webContentData.screenshot || shareUrl || '';
                        navigator.clipboard.writeText(copyText).then(() => {
                          toast.success('Link copied to clipboard!');
                        }).catch(() => {
                          toast.error('Failed to copy');
                        });
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        ) : rightPanelMode === 'research' && researchData ? (
          /* Research Panel - multi-source research results */
          <ResizablePanel
            defaultWidth={600}
            minWidth={400}
            maxWidth={900}
            storageKey="wants-research-width"
          >
            <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                    Research: {researchData.topic}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Copy button - only show when complete */}
                  {researchData.status === 'complete' && researchData.report && (
                    <button
                      onClick={() => {
                        const content = `# Research: ${researchData.topic}\n\n${researchData.report?.summary || ''}\n\n## Sources\n${researchData.sources?.map(s => `- [${s.title || s.url}](${s.url})`).join('\n') || 'No sources'}`;
                        navigator.clipboard.writeText(content).then(() => {
                          toast.success('Copied to clipboard!');
                        }).catch(() => {
                          toast.error('Failed to copy');
                        });
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Copy as Markdown"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  {/* Export dropdown - only show when complete */}
                  {researchData.status === 'complete' && researchData.report && (
                    <div className="relative group">
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <button
                          onClick={async () => {
                            try {
                              const { jsPDF } = await import('jspdf');
                              const doc = new jsPDF();
                              const pageWidth = doc.internal.pageSize.getWidth();
                              const margin = 15;
                              let y = margin;

                              doc.setFontSize(16);
                              doc.setFont('helvetica', 'bold');
                              doc.text(`Research: ${researchData.topic}`, margin, y);
                              y += 12;

                              doc.setFontSize(10);
                              doc.setFont('helvetica', 'normal');
                              const summary = researchData.report?.summary || '';
                              const lines = doc.splitTextToSize(summary.replace(/[#*_`]/g, ''), pageWidth - margin * 2);
                              for (const line of lines) {
                                if (y > 270) { doc.addPage(); y = margin; }
                                doc.text(line, margin, y);
                                y += 5;
                              }

                              y += 5;
                              doc.setFont('helvetica', 'bold');
                              doc.text('Sources:', margin, y);
                              y += 6;
                              doc.setFont('helvetica', 'normal');
                              researchData.sources?.slice(0, 15).forEach(s => {
                                if (y > 270) { doc.addPage(); y = margin; }
                                doc.text(`• ${(s.title || s.url).slice(0, 60)}`, margin, y);
                                y += 5;
                              });

                              doc.save(`research-${researchData.topic.slice(0, 20).replace(/[^a-z0-9]/gi, '-')}.pdf`);
                              toast.success('Downloaded as PDF!');
                            } catch (e) { toast.error('PDF export failed'); }
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                        >
                          📄 PDF
                        </button>
                        <button
                          onClick={() => {
                            const content = `# Research: ${researchData.topic}\n\n${researchData.report?.summary || ''}\n\n## Sources\n${researchData.sources?.map(s => `- [${s.title || s.url}](${s.url})`).join('\n') || 'No sources'}`;
                            const blob = new Blob([content], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `research-${researchData.topic.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.md`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Downloaded as Markdown!');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          📝 Markdown
                        </button>
                        <button
                          onClick={() => {
                            const content = `Research: ${researchData.topic}\n\n${(researchData.report?.summary || '').replace(/[#*_`]/g, '')}\n\nSources:\n${researchData.sources?.map(s => `- ${s.title || s.url}: ${s.url}`).join('\n') || 'No sources'}`;
                            const blob = new Blob([content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `research-${researchData.topic.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Downloaded as Text!');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                        >
                          📃 Plain Text
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={closeRightPanel}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-auto p-4">
                {researchData.status !== 'complete' && researchData.status !== 'error' && (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    {/* Progress ring */}
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-gray-200 dark:stroke-gray-700"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-[#0D9488] transition-all duration-300"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (researchData.progress || 0) / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-semibold text-[#0D9488]">
                          {researchData.progress || 0}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {researchData.status === 'pending' && 'Starting research...'}
                      {researchData.status === 'searching' && 'Searching for sources...'}
                      {researchData.status === 'fetching' && 'Fetching content...'}
                      {researchData.status === 'analyzing' && 'Analyzing information...'}
                    </p>
                    {researchData.sources && researchData.sources.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {researchData.sources.length} sources found
                      </p>
                    )}
                  </div>
                )}
                {researchData.status === 'complete' && researchData.report && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {researchData.report.summary}
                    </ReactMarkdown>
                    {/* Sources list */}
                    {researchData.sources && researchData.sources.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sources ({researchData.sources.length})</h3>
                        <ul className="space-y-1 text-sm">
                          {researchData.sources.slice(0, 10).map((source, idx) => (
                            <li key={idx}>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0D9488] hover:underline truncate block"
                              >
                                {source.title || source.url}
                              </a>
                            </li>
                          ))}
                          {researchData.sources.length > 10 && (
                            <li className="text-gray-500">+{researchData.sources.length - 10} more sources</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {researchData.status === 'error' && (
                  <div className="text-center text-red-500">
                    <p>Research failed: {researchData.error}</p>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        ) : null}
        </main>

      {/* Contextual UI for message-based tool launching - supports stacking */}
      {showContextualUI && activeToolConfig && (
        <ContextualUI
          intent={{
            uiConfig: activeToolConfig
          }}
          onClose={handleCloseTool}
          onOpenTool={handleOpenTool}
        />
      )}

      {/* Tool stack indicator when multiple tools open */}
      {openToolsStack.length > 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-[#1a1a1a]/95 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <span className={cn(
            "text-sm font-medium",
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            {openToolsStack.length} tools open
          </span>
          <button
            onClick={() => setOpenToolsStack([])}
            className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            Close all
          </button>
        </div>
      )}

      {/* File Upload Popup */}
      <FileUploadPopup
        isOpen={showFileUploadPopup}
        onClose={() => setShowFileUploadPopup(false)}
        onOpenTool={(config, file) => {
          handleOpenTool(config);
          // The file is already uploaded to R2, the tool can access it via the file URL
        }}
        onFilesAttached={handleFilesAttached}
      />

    </div>
  );
};

export default ChatPage;