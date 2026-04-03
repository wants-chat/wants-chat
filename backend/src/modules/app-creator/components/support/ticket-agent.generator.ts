/**
 * Ticket Agent Component Generators
 * Modular components for ticket management, filtering, conversations, and agent replies
 */

export interface TicketAgentOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketFilters(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketFilters', endpoint = '/tickets' } = options;

  return `import React from 'react';
import { Filter, X, Search, Calendar, Tag, User, AlertCircle } from 'lucide-react';

interface FilterOptions {
  status?: string;
  priority?: string;
  category?: string;
  assignee?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface ${componentName}Props {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories?: { id: string; name: string }[];
  assignees?: { id: string; name: string }[];
  showSearch?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onFilterChange,
  categories = [],
  assignees = [],
  showSearch = true,
}) => {
  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const priorities = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== '');

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {showSearch && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                placeholder="Search tickets..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {assignees.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              Assignee
            </label>
            <select
              value={filters.assignee || ''}
              onChange={(e) => onFilterChange({ ...filters, assignee: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              To
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketInfo(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketInfo', endpoint = '/tickets' } = options;

  return `import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  User,
  Tag,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Edit2,
  Folder,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  number?: string;
  subject: string;
  status: string;
  priority: string;
  category?: string;
  created_at: string;
  updated_at?: string;
  requester?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  tags?: string[];
}

interface ${componentName}Props {
  ticket: Ticket;
  editable?: boolean;
  assignees?: { id: string; name: string }[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ ticket, editable = false, assignees = [] }) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Ticket>) =>
      api.put('${endpoint}/' + ticket.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
      toast.success('Ticket updated');
    },
    onError: () => toast.error('Failed to update ticket'),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Ticket Information</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Status
          </span>
          {editable ? (
            <select
              value={ticket.status}
              onChange={(e) => updateMutation.mutate({ status: e.target.value })}
              disabled={updateMutation.isPending}
              className={\`px-3 py-1 text-sm rounded-full border-0 \${getStatusColor(ticket.status)} cursor-pointer\`}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ) : (
            <span className={\`px-3 py-1 text-sm rounded-full \${getStatusColor(ticket.status)}\`}>
              {ticket.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Priority
          </span>
          {editable ? (
            <select
              value={ticket.priority}
              onChange={(e) => updateMutation.mutate({ priority: e.target.value })}
              disabled={updateMutation.isPending}
              className={\`px-3 py-1 text-sm rounded-full border-0 \${getPriorityColor(ticket.priority)} cursor-pointer\`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          ) : (
            <span className={\`px-3 py-1 text-sm rounded-full capitalize \${getPriorityColor(ticket.priority)}\`}>
              {ticket.priority}
            </span>
          )}
        </div>

        {/* Category */}
        {ticket.category && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Category
            </span>
            <span className="text-sm text-gray-900 dark:text-white capitalize">
              {ticket.category}
            </span>
          </div>
        )}

        {/* Assignee */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            Assignee
          </span>
          {editable && assignees.length > 0 ? (
            <select
              value={ticket.assignee?.id || ''}
              onChange={(e) => updateMutation.mutate({ assignee_id: e.target.value || null } as any)}
              disabled={updateMutation.isPending}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-transparent"
            >
              <option value="">Unassigned</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          ) : ticket.assignee ? (
            <div className="flex items-center gap-2">
              {ticket.assignee.avatar_url ? (
                <img
                  src={ticket.assignee.avatar_url}
                  alt={ticket.assignee.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    {ticket.assignee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-900 dark:text-white">{ticket.assignee.name}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Unassigned</span>
          )}
        </div>

        {/* Requester */}
        {ticket.requester && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              Requester
            </span>
            <div className="flex items-center gap-2">
              {ticket.requester.avatar_url ? (
                <img
                  src={ticket.requester.avatar_url}
                  alt={ticket.requester.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {ticket.requester.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-900 dark:text-white">{ticket.requester.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.requester.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Created */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Created
          </span>
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(ticket.created_at).toLocaleString()}
          </span>
        </div>

        {/* Updated */}
        {ticket.updated_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Updated
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {new Date(ticket.updated_at).toLocaleString()}
            </span>
          </div>
        )}

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {updateMutation.isPending && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketConversation(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketConversation', endpoint = '/tickets' } = options;

  return `import React, { useRef, useEffect } from 'react';
import { User, Bot, Paperclip, Download, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_staff?: boolean;
  is_internal?: boolean;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
    role?: string;
  };
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

interface ${componentName}Props {
  messages: Message[];
  showInternal?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ messages, showInternal = false }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = showInternal
    ? messages
    : messages.filter((m) => !m.is_internal);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (type: string) =>
    type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].some((ext) => type.includes(ext));

  return (
    <div className="space-y-6">
      {filteredMessages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No messages yet
        </div>
      ) : (
        filteredMessages.map((message) => (
          <div
            key={message.id}
            className={\`flex gap-4 \${message.is_staff ? 'flex-row-reverse' : ''}\`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {message.author?.avatar_url ? (
                <img
                  src={message.author.avatar_url}
                  alt={message.author.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div
                  className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                    message.is_staff
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }\`}
                >
                  {message.is_staff ? (
                    <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className={\`flex-1 \${message.is_staff ? 'text-right' : ''}\`}>
              <div
                className={\`flex items-center gap-2 mb-1 \${
                  message.is_staff ? 'justify-end' : ''
                }\`}
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {message.author?.name || 'Unknown'}
                </span>
                {message.is_staff && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                    {message.author?.role || 'Support'}
                  </span>
                )}
                {message.is_internal && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs">
                    Internal
                  </span>
                )}
              </div>

              <div
                className={\`inline-block p-4 rounded-xl max-w-[80%] \${
                  message.is_internal
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : message.is_staff
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                } \${message.is_staff ? 'text-left' : ''}\`}
              >
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id}>
                        {isImage(attachment.type) ? (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="max-w-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:opacity-90 transition-opacity"
                            />
                          </a>
                        ) : (
                          <a
                            href={attachment.url}
                            download={attachment.name}
                            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Paperclip className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {attachment.name}
                            </span>
                            {attachment.size && (
                              <span className="text-xs text-gray-400">
                                ({formatFileSize(attachment.size)})
                              </span>
                            )}
                            <Download className="w-4 h-4 text-gray-400 ml-auto" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p
                className={\`text-xs text-gray-400 mt-1 \${
                  message.is_staff ? 'text-right' : ''
                }\`}
              >
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAgentReplyForm(options: TicketAgentOptions = {}): string {
  const { componentName = 'AgentReplyForm', endpoint = '/tickets' } = options;

  return `import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, X, Loader2, Eye, EyeOff, FileText, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  ticketId: string;
  onSuccess?: () => void;
  cannedResponses?: { id: string; title: string; content: string }[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  ticketId,
  onSuccess,
  cannedResponses = [],
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCanned, setShowCanned] = useState(false);

  const replyMutation = useMutation({
    mutationFn: async (data: { content: string; is_internal: boolean; attachments?: File[] }) => {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('is_internal', data.is_internal.toString());
      data.attachments?.forEach((file) => formData.append('attachments', file));

      return api.post('${endpoint}/' + ticketId + '/replies', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setContent('');
      setAttachments([]);
      setIsInternal(false);
      toast.success(isInternal ? 'Internal note added' : 'Reply sent');
      onSuccess?.();
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    replyMutation.mutate({ content, is_internal: isInternal, attachments });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const insertCannedResponse = (response: { title: string; content: string }) => {
    setContent((prev) => (prev ? prev + '\\n\\n' : '') + response.content);
    setShowCanned(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsInternal(false)}
            className={\`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
              !isInternal
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }\`}
          >
            <Eye className="w-4 h-4" />
            Public Reply
          </button>
          <button
            type="button"
            onClick={() => setIsInternal(true)}
            className={\`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
              isInternal
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }\`}
          >
            <EyeOff className="w-4 h-4" />
            Internal Note
          </button>
        </div>

        {cannedResponses.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCanned(!showCanned)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FileText className="w-4 h-4" />
              Canned Responses
            </button>
            {showCanned && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-2 max-h-60 overflow-y-auto">
                  {cannedResponses.map((response) => (
                    <button
                      key={response.id}
                      type="button"
                      onClick={() => insertCannedResponse(response)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{response.title}</p>
                      <p className="text-gray-500 dark:text-gray-400 line-clamp-1 text-xs mt-0.5">
                        {response.content}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder={isInternal ? 'Add an internal note...' : 'Type your reply...'}
          className={\`w-full px-4 py-3 border rounded-lg bg-transparent resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent \${
            isInternal
              ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
              : 'border-gray-300 dark:border-gray-600'
          }\`}
        />

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                ) : (
                  <Paperclip className="w-4 h-4 text-gray-400" />
                )}
                <span className="truncate max-w-[150px] text-gray-700 dark:text-gray-300">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Paperclip className="w-4 h-4" />
            Attach
          </button>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || replyMutation.isPending}
          className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 \${
            isInternal
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }\`}
        >
          {replyMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isInternal ? 'Add Note' : 'Send Reply'}
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}

export function generateTicketReplies(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketReplies', endpoint = '/tickets' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MessageSquare, User, Bot, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  is_staff?: boolean;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

interface ${componentName}Props {
  ticketId: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ ticketId, limit }) => {
  const { data: replies, isLoading } = useQuery({
    queryKey: ['ticket-replies', ticketId],
    queryFn: async () => {
      const url = '${endpoint}/' + ticketId + '/replies' + (limit ? '?limit=' + limit : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!replies || replies.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">No replies yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Replies ({replies.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {replies.map((reply: Reply) => (
          <div key={reply.id} className="p-4">
            <div className="flex items-start gap-3">
              {reply.author?.avatar_url ? (
                <img
                  src={reply.author.avatar_url}
                  alt={reply.author.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div
                  className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                    reply.is_staff
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }\`}
                >
                  {reply.is_staff ? (
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {reply.author?.name || 'Unknown'}
                  </span>
                  {reply.is_staff && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                      Support
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateReplyForm(options: TicketAgentOptions = {}): string {
  const { componentName = 'ReplyForm', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  ticketId: string;
  placeholder?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  ticketId,
  placeholder = 'Type your reply...',
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const replyMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      api.post('${endpoint}/' + ticketId + '/replies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket-replies', ticketId] });
      setContent('');
      setAttachments([]);
      toast.success('Reply sent');
      onSuccess?.();
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    replyMutation.mutate({ content });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
            >
              <Paperclip className="w-4 h-4 text-gray-400" />
              <span className="truncate max-w-[150px] text-gray-700 dark:text-gray-300">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="reply-attachments"
          />
          <label
            htmlFor="reply-attachments"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
            Attach files
          </label>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || replyMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {replyMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send Reply
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}
