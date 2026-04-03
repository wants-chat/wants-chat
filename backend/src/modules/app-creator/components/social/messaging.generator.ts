/**
 * Social Messaging Component Generators
 *
 * Generates message list, chat interface, and notification components.
 */

export interface MessagingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMessageList(options: MessagingOptions = {}): string {
  const { componentName = 'MessageList', endpoint = '/conversations' } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MessageCircle, Search } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {conversations && conversations.length > 0 ? (
          conversations.map((conv: any) => (
            <div
              key={conv.id}
              onClick={() => navigate('/messages/' + conv.id)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {(conv.participant_name || conv.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.participant_name || conv.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.last_message_at || conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.last_message || conv.preview}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateChatInterface(options: MessagingOptions = {}): string {
  const { componentName = 'ChatInterface', endpoint = '/messages' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?conversation_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 5000, // Poll for new messages
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post('${endpoint}', {
      conversation_id: id,
      content,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      setMessage('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/messages" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
          <span className="font-medium text-gray-900 dark:text-white">Conversation</span>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((msg: any) => (
            <div key={msg.id} className={\`flex \${msg.is_mine ? 'justify-end' : 'justify-start'}\`}>
              <div className={\`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl \${
                msg.is_mine
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }\`}>
                <p>{msg.content}</p>
                <p className={\`text-xs mt-1 \${msg.is_mine ? 'text-blue-200' : 'text-gray-500'}\`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateNotificationList(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'NotificationList', endpoint = '/notifications' } = options;

  return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Bell, Heart, MessageCircle, UserPlus, AtSign, Check } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put('${endpoint}/' + id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('${endpoint}/mark-all-read', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention': return <AtSign className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{unreadCount}</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications && notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markReadMutation.mutate(notif.id)}
              className={\`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer \${
                !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
              }\`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">{notif.message || notif.content}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
