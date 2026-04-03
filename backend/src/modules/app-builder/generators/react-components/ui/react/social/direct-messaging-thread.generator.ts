import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDirectMessagingThread = (
  resolved: ResolvedComponent,
  variant: 'bubbles' | 'minimal' | 'detailed' = 'bubbles'
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
    return `/${dataSource || 'messages'}`;
  };

  const apiRoute = getApiRoute();

  const variants = {
    bubbles: `
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Smile, Paperclip, MoreVertical, Check, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  reactions: string[];
}

interface DirectMessagingThreadProps {
  ${dataName}?: any;
  className?: string;
  currentUserId?: number;
  entity?: string;
  onSendMessage?: (message: string) => void;
}

export default function DirectMessagingThread({
  ${dataName}: propData,
  className,
  currentUserId = 1,
  entity = '${dataSource || 'messages'}',
  onSendMessage
}: DirectMessagingThreadProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? { messages: response } : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const threadData = propData || fetchedData || {};

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await api.post<any>('${apiRoute}', { content: messageContent });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSendMessage) onSendMessage(message);
    },
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-2xl overflow-hidden items-center justify-center min-h-[400px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="mt-2 text-gray-500">Loading messages...</span>
      </div>
    );
  }

  const contact = threadData?.contact || {
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isOnline: true,
    lastSeen: 'Active now'
  };

  const messages: Message[] = threadData?.messages || [
    {
      id: 1,
      senderId: 2,
      senderName: 'Sarah Johnson',
      content: 'Hey! How are you doing?',
      timestamp: '10:30 AM',
      isRead: true,
      reactions: []
    },
    {
      id: 2,
      senderId: 1,
      senderName: 'You',
      content: "I'm doing great! Just finished a project I've been working on.",
      timestamp: '10:32 AM',
      isRead: true,
      reactions: ['👍']
    },
    {
      id: 3,
      senderId: 2,
      senderName: 'Sarah Johnson',
      content: 'That sounds awesome! What was the project about?',
      timestamp: '10:33 AM',
      isRead: true,
      reactions: []
    },
    {
      id: 4,
      senderId: 1,
      senderName: 'You',
      content: 'A new messaging interface with chat bubbles and reactions. Pretty cool stuff!',
      timestamp: '10:35 AM',
      isRead: false,
      reactions: []
    }
  ];

  const isTyping = ${dataName}?.isTyping || false;
  const messagePlaceholder = ${dataName}?.messagePlaceholder || 'Type a message...';
  const sendButton = ${dataName}?.sendButton || 'Send';
  const typingLabel = ${dataName}?.typingLabel || 'typing...';
  const readLabel = ${dataName}?.readLabel || 'Read';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-2xl overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            <img
              src={contact.avatar}
              alt={contact.name}
              className="relative w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-lg"
            />
            {contact.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{contact.name}</h3>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full",
                contact.isOnline ? "bg-green-500" : "bg-gray-400"
              )}></div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {contact.isOnline ? contact.lastSeen : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.map((msg: Message, index: number) => {
          const isOwnMessage = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 animate-in slide-in-from-bottom-4 duration-300",
                isOwnMessage ? "justify-end" : "justify-start"
              )}
              style={{ animationDelay: \`\${index * 50}ms\` }}
            >
              {!isOwnMessage && (
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700 shadow-md"
                />
              )}
              <div className={cn(
                "max-w-[75%] flex flex-col group",
                isOwnMessage ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-5 py-3 rounded-3xl shadow-lg transition-all duration-200 hover:shadow-xl",
                  isOwnMessage
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600 rounded-bl-sm"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 px-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {msg.timestamp}
                  </span>
                  {isOwnMessage && (
                    <div className="flex items-center">
                      {msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  )}
                </div>
                {msg.reactions.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {msg.reactions.map((reaction, idx) => (
                      <span
                        key={idx}
                        className="text-base bg-white dark:bg-gray-800 rounded-full px-3 py-1 border-2 border-gray-100 dark:border-gray-700 shadow-md hover:scale-110 transition-transform cursor-pointer"
                      >
                        {reaction}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 shadow-md"
            />
            <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-3xl rounded-bl-sm px-5 py-3 shadow-lg">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-end gap-3">
          <button className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-3 border-2 border-transparent focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-200 shadow-sm">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messagePlaceholder}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none max-h-32 text-sm"
              rows={1}
            />
          </div>
          <button className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200">
            <Smile className="w-5 h-5" />
          </button>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    minimal: `
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface DirectMessagingThreadProps {
  ${dataName}?: any;
  className?: string;
  currentUserId?: number;
  entity?: string;
  onSendMessage?: (message: string) => void;
}

export default function DirectMessagingThread({
  ${dataName},
  className,
  currentUserId = 1,
  entity = '${dataSource || 'messages'}',
  onSendMessage
}: DirectMessagingThreadProps) {
  const threadData = ${dataName} || {};
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await api.post<any>('${apiRoute}', { content: messageContent });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSendMessage) onSendMessage(message);
    },
  });

  const contact = ${dataName}?.contact || {
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isOnline: true,
    lastSeen: 'Active now'
  };

  const messages: Message[] = ${dataName}?.messages || [
    {
      id: 1,
      senderId: 2,
      senderName: 'Sarah Johnson',
      content: 'Hey! How are you?',
      timestamp: '10:30 AM',
      isRead: true
    },
    {
      id: 2,
      senderId: 1,
      senderName: 'You',
      content: "I'm doing great, thanks for asking!",
      timestamp: '10:32 AM',
      isRead: true
    },
    {
      id: 3,
      senderId: 2,
      senderName: 'Sarah Johnson',
      content: 'Good to hear!',
      timestamp: '10:33 AM',
      isRead: true
    },
    {
      id: 4,
      senderId: 1,
      senderName: 'You',
      content: 'How about you?',
      timestamp: '10:35 AM',
      isRead: false
    },
    {
      id: 5,
      senderId: 2,
      senderName: 'Sarah Johnson',
      content: "I'm doing well too. Just working on some projects.",
      timestamp: '10:36 AM',
      isRead: true
    }
  ];

  const messagePlaceholder = ${dataName}?.messagePlaceholder || 'Type a message...';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 shadow-2xl rounded-2xl overflow-hidden", className)}>
      {/* Header - Minimal */}
      <div className="flex items-center justify-center px-6 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
          />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-1.5 scroll-smooth">
        {messages.map((msg: Message, idx: number) => {
          const isOwnMessage = msg.senderId === currentUserId;
          const prevMsg = messages[idx - 1];
          const showTimestamp = !prevMsg || prevMsg.senderId !== msg.senderId;

          return (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className={cn(
                "flex flex-col",
                isOwnMessage ? "items-end" : "items-start"
              )}>
                {showTimestamp && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 px-2">
                    {msg.timestamp}
                  </span>
                )}
                <div className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md hover:shadow-lg transition-all duration-200",
                  isOwnMessage
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messagePlaceholder}
              className="w-full px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm transition-all duration-200"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "p-3 rounded-full transition-all duration-200 shadow-lg",
              message.trim()
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white hover:shadow-xl hover:scale-105"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
    `,

    detailed: `
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Smile, Paperclip, MoreVertical, CheckCheck, Reply, Forward, Copy, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  reactions: string[];
}

interface DirectMessagingThreadProps {
  ${dataName}?: any;
  className?: string;
  currentUserId?: number;
  entity?: string;
  onSendMessage?: (message: string) => void;
  onReply?: (messageId: number) => void;
  onForward?: (messageId: number) => void;
  onDelete?: (messageId: number) => void;
}

export default function DirectMessagingThread({
  ${dataName},
  className,
  currentUserId = 1,
  entity = '${dataSource || 'messages'}',
  onSendMessage,
  onReply,
  onForward,
  onDelete
}: DirectMessagingThreadProps) {
  const threadData = ${dataName} || {};
  const [message, setMessage] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await api.post<any>('${apiRoute}', { content: messageContent });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSendMessage) onSendMessage(message);
    },
  });

  const contact = ${dataName}?.contact || {
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isOnline: true,
    lastSeen: 'Active now'
  };

  const messages: Message[] = ${dataName}?.messages || [
    {
      id: 1,
      senderId: 2,
      senderName: 'Sarah Johnson',
      content: 'Hey! How are you doing?',
      timestamp: '10:30 AM',
      isRead: true,
      reactions: []
    },
    {
      id: 2,
      senderId: 1,
      senderName: 'You',
      content: "I'm doing great! Just finished a project I've been working on.",
      timestamp: '10:32 AM',
      isRead: true,
      reactions: ['👍', '🎉']
    },
    {
      id: 3,
      senderId: 2,
      senderName: 'Sarah Johnson',
      content: 'That sounds awesome! What was the project about?',
      timestamp: '10:33 AM',
      isRead: true,
      reactions: []
    },
    {
      id: 4,
      senderId: 1,
      senderName: 'You',
      content: 'A new messaging interface with advanced features like message actions, reactions, and read receipts.',
      timestamp: '10:35 AM',
      isRead: false,
      reactions: []
    }
  ];

  const isTyping = ${dataName}?.isTyping || false;
  const messagePlaceholder = ${dataName}?.messagePlaceholder || 'Type a message...';

  const messageOptions = ${dataName}?.messageOptions || [
    { action: 'reply', label: 'Reply', danger: false },
    { action: 'forward', label: 'Forward', danger: false },
    { action: 'copy', label: 'Copy', danger: false },
    { action: 'delete', label: 'Delete', danger: true }
  ];

  const readLabel = ${dataName}?.readLabel || 'Read';
  const typingLabel = ${dataName}?.typingLabel || 'typing...';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMenuAction = (action: string, messageId: number) => {
    setShowMenuId(null);
    switch (action) {
      case 'reply':
        if (onReply) onReply(messageId);
        break;
      case 'forward':
        if (onForward) onForward(messageId);
        break;
      case 'copy':
        const msg = messages.find(m => m.id === messageId);
        if (msg) navigator.clipboard.writeText(msg.content);
        break;
      case 'delete':
        if (onDelete) onDelete(messageId);
        break;
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 shadow-2xl rounded-2xl overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 backdrop-blur-xl border-b border-blue-100 dark:border-gray-700 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-md opacity-40 group-hover:opacity-70 animate-pulse"></div>
            <img
              src={contact.avatar}
              alt={contact.name}
              className="relative w-14 h-14 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
            />
            {contact.isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 shadow-lg">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">{contact.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                contact.isOnline ? "bg-green-500" : "bg-gray-400"
              )}></div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {contact.isOnline ? contact.lastSeen : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <button className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:rotate-90">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth">
        {messages.map((msg: Message, index: number) => {
          const isOwnMessage = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              className={cn(
                "flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200",
                isOwnMessage ? "justify-end" : "justify-start"
              )}
              style={{ animationDelay: \`\${index * 30}ms\` }}
            >
              {!isOwnMessage && (
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-1 ring-2 ring-purple-100 dark:ring-purple-900/30 shadow-lg"
                />
              )}
              <div className={cn(
                "max-w-[75%] flex flex-col",
                isOwnMessage ? "items-end" : "items-start"
              )}>
                <div className="relative">
                  <div className={cn(
                    "px-5 py-3 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200",
                    isOwnMessage
                      ? "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-600 rounded-bl-sm"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Message Actions */}
                  {hoveredMessageId === msg.id && (
                    <div className={cn(
                      "absolute top-0 flex gap-1.5 animate-in fade-in slide-in-from-left-1 duration-150",
                      isOwnMessage ? "right-full mr-2" : "left-full ml-2"
                    )}>
                      <button
                        onClick={() => setShowMenuId(msg.id)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 hover:scale-110"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  )}

                  {/* Message Menu */}
                  {showMenuId === msg.id && (
                    <div className={cn(
                      "absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 py-2 z-10 min-w-[180px] animate-in fade-in slide-in-from-top-1 duration-150",
                      isOwnMessage ? "right-0" : "left-0"
                    )}>
                      {messageOptions.map((option: any, idx: number) => (
                        <button
                          key={option.action}
                          onClick={() => handleMenuAction(option.action, msg.id)}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gradient-to-r transition-all duration-150 flex items-center gap-3",
                            option.danger
                              ? "text-red-600 dark:text-red-400 hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20"
                              : "text-gray-900 dark:text-white hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20",
                            idx === 0 && "rounded-t-2xl",
                            idx === messageOptions.length - 1 && "rounded-b-2xl"
                          )}
                        >
                          {option.action === 'reply' && <Reply className="w-4 h-4" />}
                          {option.action === 'forward' && <Forward className="w-4 h-4" />}
                          {option.action === 'copy' && <Copy className="w-4 h-4" />}
                          {option.action === 'delete' && <Trash className="w-4 h-4" />}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 px-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {msg.timestamp}
                  </span>
                  {isOwnMessage && (
                    <div className="flex items-center gap-1.5">
                      {msg.isRead ? (
                        <>
                          <CheckCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{readLabel}</span>
                        </>
                      ) : (
                        <CheckCheck className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  )}
                </div>

                {msg.reactions.length > 0 && (
                  <div className="flex gap-2 mt-2 animate-in fade-in duration-300">
                    {msg.reactions.map((reaction, idx) => (
                      <span
                        key={idx}
                        className="text-base bg-white dark:bg-gray-800 rounded-full px-3 py-1.5 border-2 border-gray-100 dark:border-gray-700 shadow-lg hover:scale-125 hover:shadow-xl transition-all duration-200 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600"
                      >
                        {reaction}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100 dark:ring-purple-900/30 shadow-lg"
            />
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-3xl rounded-bl-sm px-6 py-3.5 shadow-lg border-2 border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{typingLabel}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 backdrop-blur-xl border-t-2 border-blue-100 dark:border-gray-700 shadow-xl">
        <div className="flex items-end gap-3">
          <button className="p-3 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 border-2 border-gray-200 dark:border-gray-600 focus-within:border-gradient-to-r focus-within:from-blue-500 focus-within:via-purple-500 focus-within:to-pink-500 transition-all duration-200 shadow-md focus-within:shadow-xl">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messagePlaceholder}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none max-h-32 text-sm"
              rows={1}
            />
          </div>
          <button className="p-3 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg">
            <Smile className="w-5 h-5" />
          </button>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:hover:from-blue-600 dark:hover:via-purple-600 dark:hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-200 rounded-2xl px-5 hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.bubbles;
};