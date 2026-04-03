import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateChatbotSupport = (
  resolved: ResolvedComponent,
  variant: 'assistant' | 'casual' | 'formal' = 'assistant'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'chatbot'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'chatbot';

  const commonImports = `
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    assistant: `
${commonImports}
import { Send, Bot, User, ChevronDown, Minimize2, X, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: number;
  type: 'bot' | 'user';
  message: string;
  timestamp: string;
  avatar?: string;
  actions?: { label: string; value: string }[];
}

interface MenuOption {
  id: number;
  label: string;
  icon: string;
}

interface ChatbotAssistantProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ChatbotAssistant: React.FC<ChatbotAssistantProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chatbotData = ${dataName} || {};

  const title = ${getField('assistantTitle')};
  const subtitle = ${getField('assistantSubtitle')};
  const welcomeMessage = ${getField('welcomeMessage')};
  const menuOptions = ${getField('menuOptions')};
  const inputPlaceholder = ${getField('inputPlaceholder')};
  const sendButton = ${getField('sendButton')};
  const escalateButton = ${getField('escalateButton')};
  const menuButton = ${getField('menuButton')};
  const closeButton = ${getField('closeButton')};
  const minimizeButton = ${getField('minimizeButton')};
  const feedbackButton = ${getField('feedbackButton')};
  const typingIndicator = ${getField('typingIndicator')};
  const initialMessages = ${getField('botResponses')};
  const quickReplies = ${getField('quickReplies')};

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      message: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowMenu(false);
    setIsTyping(true);

    console.log('User message sent:', userMessage);

    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        message: \`I understand you mentioned "\${inputValue}". Let me help you with that right away.\`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '🤖'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      console.log('Bot response:', botMessage);
    }, 1500);
  };

  const handleMenuOption = (option: MenuOption) => {
    console.log('Menu option selected:', option);
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      message: option.label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setShowMenu(false);
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        message: \`I can help you with \${option.label}. What specific information do you need?\`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '🤖'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    console.log('Quick reply clicked:', reply);
    setInputValue(reply);
    handleSend();
  };

  const handleEscalate = () => {
    console.log('Escalating to human agent');
    const botMessage: Message = {
      id: Date.now(),
      type: 'bot',
      message: 'Connecting you to a human agent. Please wait a moment...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '👤'
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleFeedback = (positive: boolean) => {
    console.log('Feedback:', positive ? 'Positive' : 'Negative');
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
      >
        <Bot className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 w-96 shadow-2xl", className)}>
      <Card className="flex flex-col h-[600px] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-xs text-blue-100">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => console.log('Close chat')}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={\`flex \${msg.type === 'user' ? 'justify-end' : 'justify-start'}\`}
            >
              <div className={\`flex gap-2 max-w-[80%] \${msg.type === 'user' ? 'flex-row-reverse' : ''}\`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                    {msg.avatar || '🤖'}
                  </div>
                )}
                <div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2",
                      msg.type === 'user'
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  {msg.actions && (
                    <div className="flex gap-2 mt-2">
                      {msg.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => console.log('Action clicked:', action.value)}
                          className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  🤖
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showMenu && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              How can I help you today?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {menuOptions.map((option: MenuOption) => (
                <button
                  key={option.id}
                  onClick={() => handleMenuOption(option)}
                  className="flex items-center gap-2 p-2 text-left text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-gray-900 dark:text-white">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={inputPlaceholder}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {showMenu ? 'Hide' : 'Show'} {menuButton}
              </button>
              <button
                onClick={handleEscalate}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {escalateButton}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFeedback(true)}
                className="text-gray-400 hover:text-green-600 transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotAssistant;
    `,

    casual: `
${commonImports}
import { Send, MessageCircle, Smile, Paperclip, MoreVertical } from 'lucide-react';

interface Message {
  id: number;
  type: 'bot' | 'user';
  message: string;
  timestamp: string;
  avatar?: string;
}

interface ChatbotCasualProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ChatbotCasual: React.FC<ChatbotCasualProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chatbotData = ${dataName} || {};

  const title = ${getField('casualTitle')};
  const subtitle = ${getField('casualSubtitle')};
  const casualWelcome = ${getField('casualWelcome')};
  const casualPlaceholder = ${getField('casualPlaceholder')};
  const sendButton = ${getField('sendButton')};
  const initialMessages = ${getField('botResponses')};
  const quickReplies = ${getField('quickReplies')};

  useEffect(() => {
    const welcomeMsg: Message = {
      id: 0,
      type: 'bot',
      message: casualWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '😊'
    };
    setMessages([welcomeMsg, ...initialMessages]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      message: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    console.log('User message sent:', userMessage);

    setTimeout(() => {
      const responses = [
        \`Got it! Let me check that for you... 🔍\`,
        \`Awesome question! Here's what I found... ✨\`,
        \`No problem! I'm on it! 🚀\`,
        \`Sure thing! Give me just a sec... ⏱️\`
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        message: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '😊'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      console.log('Bot response:', botMessage);
    }, 1200);
  };

  const handleQuickReply = (reply: string) => {
    console.log('Quick reply clicked:', reply);
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      message: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <Card className="flex flex-col h-[700px] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
              💬
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-purple-100">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={\`flex \${msg.type === 'user' ? 'justify-end' : 'justify-start'}\`}
            >
              <div className={\`flex gap-3 max-w-[75%] \${msg.type === 'user' ? 'flex-row-reverse' : ''}\`}>
                {msg.type === 'bot' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 text-xl shadow-lg">
                    {msg.avatar || '😊'}
                  </div>
                )}
                <div>
                  <div
                    className={cn(
                      "rounded-3xl px-5 py-3 shadow-md",
                      msg.type === 'user'
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 px-2">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 text-xl shadow-lg">
                  😊
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl px-5 py-3 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickReplies.map((reply: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={casualPlaceholder}
                className="w-full px-4 py-3 pr-20 border-2 border-purple-200 dark:border-purple-800 rounded-full bg-purple-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-600"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotCasual;
    `,

    formal: `
${commonImports}
import { Send, Briefcase, Clock, FileText, Shield } from 'lucide-react';

interface Message {
  id: number;
  type: 'bot' | 'user' | 'system';
  message: string;
  timestamp: string;
  avatar?: string;
}

interface ChatbotFormalProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ChatbotFormal: React.FC<ChatbotFormalProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketNumber] = useState(\`TKT-\${Math.floor(Math.random() * 10000)}\`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chatbotData = ${dataName} || {};

  const title = ${getField('formalTitle')};
  const subtitle = ${getField('formalSubtitle')};
  const formalWelcome = ${getField('formalWelcome')};
  const formalPlaceholder = ${getField('formalPlaceholder')};
  const sendButton = ${getField('sendButton')};
  const escalateButton = ${getField('escalateButton')};
  const initialMessages = ${getField('botResponses')};

  useEffect(() => {
    const systemMsg: Message = {
      id: 0,
      type: 'system',
      message: \`Support session initiated. Ticket #\${ticketNumber}\`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const welcomeMsg: Message = {
      id: 1,
      type: 'bot',
      message: formalWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '👔'
    };
    setMessages([systemMsg, welcomeMsg, ...initialMessages]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      message: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    console.log('User inquiry submitted:', userMessage);

    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        message: \`Thank you for your inquiry. I have reviewed your request and will provide you with a comprehensive response. Please allow me a moment to gather the relevant information.\`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👔'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      console.log('Assistant response:', botMessage);
    }, 2000);
  };

  const handleEscalate = () => {
    console.log('Escalating to senior support representative');
    const systemMsg: Message = {
      id: Date.now(),
      type: 'system',
      message: 'Transferring to senior support representative. Please hold.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  return (
    <div className={cn("max-w-3xl mx-auto", className)}>
      <Card className="flex flex-col h-[750px] overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-700 rounded-lg flex items-center justify-center">
                <Briefcase className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{title}</h2>
                <p className="text-slate-300 text-sm">{subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">Ticket Number</div>
              <div className="font-mono text-sm bg-slate-700 px-3 py-1 rounded">{ticketNumber}</div>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Response Time: &lt; 2 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>Secure Connection</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'system' ? (
                <div className="flex justify-center">
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    {msg.message}
                  </div>
                </div>
              ) : (
                <div className={\`flex \${msg.type === 'user' ? 'justify-end' : 'justify-start'}\`}>
                  <div className={\`flex gap-3 max-w-[80%] \${msg.type === 'user' ? 'flex-row-reverse' : ''}\`}>
                    {msg.type === 'bot' && (
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                    )}
                    <div>
                      <div
                        className={cn(
                          "rounded-lg px-4 py-3 shadow-sm",
                          msg.type === 'user'
                            ? "bg-slate-800 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 px-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t-2 border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={formalPlaceholder}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-slate-500 dark:focus:border-slate-600"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
              {sendButton}
            </button>
          </div>

          <div className="flex justify-between items-center text-sm">
            <button
              onClick={handleEscalate}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
            >
              {escalateButton}
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Professional support available 24/7
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotFormal;
    `
  };

  return variants[variant] || variants.assistant;
};
