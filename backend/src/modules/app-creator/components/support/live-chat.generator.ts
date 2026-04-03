/**
 * Live Chat Component Generators
 */

export interface LiveChatOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLiveChat(options: LiveChatOptions = {}): string {
  const { componentName = 'LiveChat', endpoint = '/chat' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, Paperclip, X, User, Bot, Image } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: string;
  agent_name?: string;
}

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session } = useQuery({
    queryKey: ['chat-session'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/session');
      return response?.data || response;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', session?.id],
    queryFn: async () => {
      if (!session?.id) return [];
      const response = await api.get<any>('${endpoint}/messages?session_id=' + session.id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!session?.id,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post('${endpoint}/messages', { session_id: session?.id, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      setMessage('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Support Chat</h2>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation</p>
          </div>
        )}
        {messages.map((msg: Message) => (
          <div key={msg.id} className={\`flex \${msg.sender === 'user' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`flex gap-2 max-w-[80%] \${msg.sender === 'user' ? 'flex-row-reverse' : ''}\`}>
              <div className={\`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center \${
                msg.sender === 'user' ? 'bg-purple-600' : 'bg-gray-100 dark:bg-gray-700'
              }\`}>
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div>
                {msg.agent_name && msg.sender === 'agent' && (
                  <p className="text-xs text-gray-500 mb-1">{msg.agent_name}</p>
                )}
                <div className={\`p-3 rounded-xl \${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }\`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className={\`text-xs text-gray-400 mt-1 \${msg.sender === 'user' ? 'text-right' : ''}\`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Paperclip className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Image className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMutation.isPending}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateChatWidget(options: LiveChatOptions = {}): string {
  const { componentName = 'ChatWidget', endpoint = '/chat' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ${componentName}: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post('${endpoint}/bot', { message: content });
      return response?.data || response;
    },
    onSuccess: (data) => {
      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: data.reply,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    sendMutation.mutate(message);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      <div className="p-4 bg-purple-600 text-white rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Support</h3>
            <p className="text-sm text-purple-200">Online</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={\`flex \${msg.sender === 'user' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`flex gap-2 max-w-[85%] \${msg.sender === 'user' ? 'flex-row-reverse' : ''}\`}>
              <div className={\`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center \${
                msg.sender === 'user' ? 'bg-purple-600' : 'bg-gray-100 dark:bg-gray-700'
              }\`}>
                {msg.sender === 'user' ? (
                  <User className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-gray-500" />
                )}
              </div>
              <div className={\`p-3 rounded-xl text-sm \${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }\`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {sendMutation.isPending && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMutation.isPending}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}
