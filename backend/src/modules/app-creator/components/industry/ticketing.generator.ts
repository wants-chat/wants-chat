/**
 * Ticketing & Support Component Generators
 *
 * Generates React components for ticket management and support systems
 */

export interface TicketingOptions {
  title?: string;
  className?: string;
}

/**
 * Generates TicketFilters component
 */
export function generateTicketFilters(options: TicketingOptions = {}): string {
  const { title = 'Filter Tickets', className = '' } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface TicketFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  search: string;
  status: string;
  priority: string;
  category: string;
  assignee: string;
}

const statuses = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorities = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'technical', label: 'Technical' },
  { value: 'billing', label: 'Billing' },
  { value: 'general', label: 'General' },
  { value: 'feature-request', label: 'Feature Request' },
  { value: 'bug', label: 'Bug Report' },
];

export default function TicketFilters({ onFilterChange, className = '' }: TicketFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    category: '',
    assignee: '',
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 p-4 \${className}\`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>{priority.label}</option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}`;
}

/**
 * Generates TicketConversation component
 */
export function generateTicketConversation(options: TicketingOptions = {}): string {
  const { className = '' } = options;

  return `import React, { useState } from 'react';
import { User, Send, Paperclip, Clock, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: 'customer' | 'agent' | 'system';
  };
  content: string;
  timestamp: string;
  attachments?: { name: string; url: string; type: string }[];
  isInternal?: boolean;
}

interface TicketConversationProps {
  ticketId: string;
  messages?: Message[];
  onSendMessage?: (content: string, isInternal: boolean) => Promise<void>;
  onAttach?: (files: FileList) => void;
  className?: string;
}

export default function TicketConversation({
  ticketId,
  messages = [],
  onSendMessage,
  onAttach,
  className = '',
}: TicketConversationProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      await onSendMessage?.(newMessage, isInternal);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const roleColors = {
    customer: 'bg-blue-100',
    agent: 'bg-green-100',
    system: 'bg-gray-100',
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px] \${className}\`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={\`flex gap-3 \${message.author.role === 'customer' ? '' : 'flex-row-reverse'}\`}
          >
            {message.author.avatar ? (
              <img src={message.author.avatar} alt={message.author.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${roleColors[message.author.role]}\`}>
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div className={\`flex-1 max-w-[70%] \${message.author.role === 'customer' ? '' : 'text-right'}\`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{message.author.name}</span>
                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                {message.isInternal && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Internal</span>
                )}
              </div>
              <div
                className={\`p-3 rounded-lg \${
                  message.author.role === 'customer'
                    ? 'bg-gray-100'
                    : message.author.role === 'system'
                    ? 'bg-gray-50 text-gray-600 italic'
                    : message.isInternal
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-blue-50'
                }\`}
              >
                <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700 hover:bg-gray-200"
                    >
                      <Paperclip className="w-3 h-3" />
                      {att.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-gray-300"
            />
            Internal note (not visible to customer)
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            id="attach-file"
            className="hidden"
            multiple
            onChange={(e) => e.target.files && onAttach?.(e.target.files)}
          />
          <label
            htmlFor="attach-file"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <Paperclip className="w-5 h-5" />
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isInternal ? 'Add internal note...' : 'Type your reply...'}
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}`;
}

/**
 * Generates TicketInfo component
 */
export function generateTicketInfo(options: TicketingOptions = {}): string {
  const { className = '' } = options;

  return `import React from 'react';
import { Tag, User, Clock, AlertCircle, Folder, Calendar, Edit } from 'lucide-react';

interface TicketInfoProps {
  ticket: {
    id: string;
    number: string;
    subject: string;
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    assignee?: {
      id: string;
      name: string;
      avatar?: string;
    };
    customer: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    tags?: string[];
    description?: string;
  };
  onStatusChange?: (status: string) => void;
  onAssigneeChange?: () => void;
  onEdit?: () => void;
  className?: string;
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  pending: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

export default function TicketInfo({
  ticket,
  onStatusChange,
  onAssigneeChange,
  onEdit,
  className = '',
}: TicketInfoProps) {
  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">#{ticket.number}</span>
              <span className={\`px-2 py-0.5 text-xs rounded-full \${statusColors[ticket.status]}\`}>
                {ticket.status.replace('-', ' ')}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-1">{ticket.subject}</h2>
          </div>
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-4">
        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Priority
          </span>
          <span className={\`font-medium capitalize \${priorityColors[ticket.priority]}\`}>
            {ticket.priority}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Category
          </span>
          <span className="font-medium text-gray-900">{ticket.category}</span>
        </div>

        {/* Assignee */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <User className="w-4 h-4" />
            Assignee
          </span>
          <button
            onClick={onAssigneeChange}
            className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded"
          >
            {ticket.assignee ? (
              <>
                {ticket.assignee.avatar ? (
                  <img src={ticket.assignee.avatar} alt={ticket.assignee.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                )}
                <span className="font-medium text-gray-900">{ticket.assignee.name}</span>
              </>
            ) : (
              <span className="text-gray-500">Unassigned</span>
            )}
          </button>
        </div>

        {/* Customer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <User className="w-4 h-4" />
            Customer
          </span>
          <div className="text-right">
            <p className="font-medium text-gray-900">{ticket.customer.name}</p>
            <p className="text-sm text-gray-500">{ticket.customer.email}</p>
          </div>
        </div>

        {/* Created */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Created
          </span>
          <span className="text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</span>
        </div>

        {/* Due Date */}
        {ticket.dueDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Due
            </span>
            <span className="text-gray-900">{new Date(ticket.dueDate).toLocaleString()}</span>
          </div>
        )}

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div>
            <span className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Change */}
      <div className="p-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
        <select
          value={ticket.status}
          onChange={(e) => onStatusChange?.(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>
  );
}`;
}

/**
 * Generates TicketReplies component
 */
export function generateTicketReplies(options: TicketingOptions = {}): string {
  const { title = 'Replies', className = '' } = options;

  return `import React from 'react';
import { User, Clock, Paperclip, MoreVertical, ThumbsUp, Flag } from 'lucide-react';

interface Reply {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
  attachments?: { name: string; url: string }[];
  likes?: number;
  isHelpful?: boolean;
}

interface TicketRepliesProps {
  replies?: Reply[];
  onReplyLike?: (replyId: string) => void;
  onReplyFlag?: (replyId: string) => void;
  onReplyEdit?: (replyId: string) => void;
  onReplyDelete?: (replyId: string) => void;
  className?: string;
}

export default function TicketReplies({
  replies = [],
  onReplyLike,
  onReplyFlag,
  onReplyEdit,
  onReplyDelete,
  className = '',
}: TicketRepliesProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return \`\${Math.floor(diff / 60000)} minutes ago\`;
    if (diff < 86400000) return \`\${Math.floor(diff / 3600000)} hours ago\`;
    return date.toLocaleDateString();
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">${title} ({replies.length})</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {replies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No replies yet</p>
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="p-4">
              <div className="flex items-start gap-3">
                {reply.author.avatar ? (
                  <img src={reply.author.avatar} alt={reply.author.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{reply.author.name}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {reply.author.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(reply.timestamp)}
                      </span>
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10">
                          <button
                            onClick={() => onReplyEdit?.(reply.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onReplyDelete?.(reply.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  {reply.attachments && reply.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reply.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700 hover:bg-gray-200"
                        >
                          <Paperclip className="w-3 h-3" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => onReplyLike?.(reply.id)}
                      className={\`flex items-center gap-1 text-sm \${reply.isHelpful ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}\`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {reply.likes || 0} Helpful
                    </button>
                    <button
                      onClick={() => onReplyFlag?.(reply.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`;
}

/**
 * Generates TicketSalesToday component (for event tickets)
 */
export function generateTicketSalesToday(options: TicketingOptions = {}): string {
  const { title = "Today's Ticket Sales", className = '' } = options;

  return `import React from 'react';
import { Ticket, DollarSign, TrendingUp, Users, Clock } from 'lucide-react';

interface TicketSale {
  id: string;
  orderNumber: string;
  eventName: string;
  quantity: number;
  total: number;
  customerName: string;
  purchaseTime: string;
  ticketType: string;
}

interface TicketSalesTodayProps {
  sales?: TicketSale[];
  summary?: {
    totalSales: number;
    totalRevenue: number;
    averageOrder: number;
    ticketsSold: number;
  };
  className?: string;
}

export default function TicketSalesToday({
  sales = [],
  summary,
  className = '',
}: TicketSalesTodayProps) {
  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">${title}</h3>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="p-4 grid grid-cols-4 gap-4 border-b border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.totalSales}</p>
            <p className="text-sm text-gray-500">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">\${summary.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.ticketsSold}</p>
            <p className="text-sm text-gray-500">Tickets Sold</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">\${summary.averageOrder.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Avg Order</p>
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No sales today yet</p>
          </div>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{sale.eventName}</p>
                  <p className="text-sm text-gray-500">
                    {sale.customerName} • #{sale.orderNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">\${sale.total.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {sale.quantity} x {sale.ticketType}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`;
}

/**
 * Generates TicketSalesRecent component (for event tickets)
 */
export function generateTicketSalesRecent(options: TicketingOptions = {}): string {
  const { title = 'Recent Sales', className = '' } = options;

  return `import React from 'react';
import { Ticket, Clock, ArrowUpRight } from 'lucide-react';

interface RecentSale {
  id: string;
  eventName: string;
  customerName: string;
  quantity: number;
  total: number;
  timestamp: string;
}

interface TicketSalesRecentProps {
  sales?: RecentSale[];
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}

export default function TicketSalesRecent({
  sales = [],
  maxItems = 5,
  onViewAll,
  className = '',
}: TicketSalesRecentProps) {
  const displaySales = sales.slice(0, maxItems);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return \`\${Math.floor(diff / 60000)}m ago\`;
    if (diff < 86400000) return \`\${Math.floor(diff / 3600000)}h ago\`;
    return date.toLocaleDateString();
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">${title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {displaySales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent sales</p>
          </div>
        ) : (
          displaySales.map((sale) => (
            <div key={sale.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{sale.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {sale.quantity}x {sale.eventName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+\${sale.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(sale.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`;
}
