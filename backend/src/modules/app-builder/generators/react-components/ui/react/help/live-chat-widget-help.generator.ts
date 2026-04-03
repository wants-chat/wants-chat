import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLiveChatWidgetHelp = (
  resolved: ResolvedComponent,
  variant: 'bubble' | 'window' | 'inline' = 'bubble'
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
    return `/${dataSource || 'chat'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'chat';

  const commonImports = `
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MessageCircle, X, Minimize2, Send, User, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    bubble: `
${commonImports}

interface LiveChatWidgetBubbleProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const LiveChatWidgetBubble: React.FC<LiveChatWidgetBubbleProps> = ({ ${dataName}: propData, className }) => {
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chatData = ${dataName} || {};

  const widgetTitle = ${getField('widgetTitle')};
  const welcomeMessage = ${getField('welcomeMessage')};
  const agentName = ${getField('agentName')};
  const agentRole = ${getField('agentRole')};
  const agentStatus = ${getField('agentStatus')};
  const responseTime = ${getField('responseTime')};
  const startChatButton = ${getField('startChatButton')};
  const endChatButton = ${getField('endChatButton')};
  const minimizeButton = ${getField('minimizeButton')};
  const sendButton = ${getField('sendButton')};
  const typePlaceholder = ${getField('typePlaceholder')};
  const agentTypingText = ${getField('agentTypingText')};
  const quickReplies = ${getField('quickReplies')};
  const chatMessages = ${getField('chatMessages')};

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages(chatMessages);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'user',
        senderName: 'You',
        text: message,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
      setMessage('');

      // Simulate agent typing
      setIsAgentTyping(true);
      setTimeout(() => {
        setIsAgentTyping(false);
        const agentResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          senderName: agentName,
          text: 'Thanks for your message! Let me help you with that.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 2000);
    }
  };

  const handleQuickReply = (reply: any) => {
    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: 'You',
      text: reply.text,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, newMessage]);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        >
          <MessageCircle className="h-8 w-8 text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{unreadCount}</span>
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={\`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-all \${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }\`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              {!isMinimized && (
                <div>
                  <h3 className="font-semibold text-white">{widgetTitle}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-white/90">{agentStatus}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={\`flex \${msg.sender === 'user' ? 'justify-end' : 'justify-start'}\`}
                    >
                      <div
                        className={\`max-w-[80%] rounded-2xl px-4 py-3 \${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                        }\`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className={\`text-xs mt-1 block \${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }\`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isAgentTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {messages.length === 1 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick replies:</p>
                    {quickReplies.map((reply: any) => (
                      <button
                        key={reply.id}
                        onClick={() => handleQuickReply(reply)}
                        className="w-full p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-sm transition-colors"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={typePlaceholder}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveChatWidgetBubble;
    `,

    window: `
${commonImports}

interface LiveChatWidgetWindowProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const LiveChatWidgetWindow: React.FC<LiveChatWidgetWindowProps> = ({ ${dataName}: propData, className }) => {
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
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chatData = ${dataName} || {};

  const widgetTitle = ${getField('widgetTitle')};
  const agentName = ${getField('agentName')};
  const agentStatus = ${getField('agentStatus')};
  const responseTime = ${getField('responseTime')};
  const endChatButton = ${getField('endChatButton')};
  const sendButton = ${getField('sendButton')};
  const typePlaceholder = ${getField('typePlaceholder')};
  const agentTypingText = ${getField('agentTypingText')};
  const quickReplies = ${getField('quickReplies')};
  const chatMessages = ${getField('chatMessages')};

  useEffect(() => {
    setMessages(chatMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'user',
        senderName: 'You',
        text: message,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
      setMessage('');

      setIsAgentTyping(true);
      setTimeout(() => {
        setIsAgentTyping(false);
        const agentResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          senderName: agentName,
          text: 'Thanks for your message! I\'m here to help.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 1500);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("w-full h-screen flex flex-col bg-white dark:bg-gray-900", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{widgetTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-white/90">{agentStatus}</span>
              <span className="text-sm text-white/70">• {responseTime}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" className="text-white hover:bg-white/20">
          <MoreVertical className="h-6 w-6" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={\`flex gap-3 \${msg.sender === 'user' ? 'flex-row-reverse' : ''}\`}
            >
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className={\`max-w-[60%] \${msg.sender === 'user' ? 'items-end' : 'items-start'}\`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className={\`rounded-2xl px-4 py-3 \${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }\`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isAgentTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length === 1 && (
          <div className="max-w-4xl mx-auto mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Suggested responses:</p>
            <div className="grid grid-cols-2 gap-3">
              {quickReplies.map((reply: any) => (
                <button
                  key={reply.id}
                  onClick={() => {
                    const newMessage = {
                      id: Date.now().toString(),
                      sender: 'user',
                      senderName: 'You',
                      text: reply.text,
                      timestamp: new Date().toISOString()
                    };
                    setMessages([...messages, newMessage]);
                  }}
                  className="p-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl text-left transition-colors border border-gray-200 dark:border-gray-600"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={typePlaceholder}
              className="flex-1 h-12 text-lg"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-8 h-12 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-5 w-5 mr-2" />
              {sendButton}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatWidgetWindow;
    `,

    inline: `
${commonImports}

interface LiveChatWidgetInlineProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const LiveChatWidgetInline: React.FC<LiveChatWidgetInlineProps> = ({ ${dataName}: propData, className }) => {
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
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chatData = ${dataName} || {};

  const widgetTitle = ${getField('widgetTitle')};
  const agentName = ${getField('agentName')};
  const agentStatus = ${getField('agentStatus')};
  const sendButton = ${getField('sendButton')};
  const typePlaceholder = ${getField('typePlaceholder')};
  const chatMessages = ${getField('chatMessages')};

  useEffect(() => {
    setMessages(chatMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'user',
        senderName: 'You',
        text: message,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
      setMessage('');

      setTimeout(() => {
        const agentResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          senderName: agentName,
          text: 'Thank you for your message! How else can I assist you?',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 1000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700", className)}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{widgetTitle}</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{agentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={\`flex \${msg.sender === 'user' ? 'justify-end' : 'justify-start'}\`}
            >
              <div className={\`flex gap-2 max-w-[75%] \${msg.sender === 'user' ? 'flex-row-reverse' : ''}\`}>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div
                    className={\`rounded-lg px-4 py-2 \${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }\`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
        <div className="flex gap-3">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={typePlaceholder}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveChatWidgetInline;
    `
  };

  return variants[variant] || variants.bubble;
};
