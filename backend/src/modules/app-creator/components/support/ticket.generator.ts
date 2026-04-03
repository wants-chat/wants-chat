/**
 * Support Ticket Component Generators
 */

export interface TicketOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketList(options: TicketOptions = {}): string {
  const { componentName = 'TicketList', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Ticket, Plus, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [status, setStatus] = useState('all');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', status],
    queryFn: async () => {
      const url = '${endpoint}' + (status !== 'all' ? '?status=' + status : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Ticket className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'open', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Link
          to="/support/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket: any) => (
              <Link
                key={ticket.id}
                to={\`/support/\${ticket.id}\`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(ticket.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">#{ticket.number || ticket.id}</span>
                      {ticket.priority && (
                        <span className={\`px-2 py-0.5 rounded text-xs font-medium \${getPriorityColor(ticket.priority)}\`}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mt-1">{ticket.subject}</h3>
                    {ticket.last_message && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">{ticket.last_message}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      {ticket.replies_count > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.replies_count} replies
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              No tickets found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketDetail(options: TicketOptions = {}): string {
  const { componentName = 'TicketDetail', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Send, Paperclip, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + ticketId);
      return response?.data || response;
    },
  });

  const replyMutation = useMutation({
    mutationFn: (content: string) => api.post('${endpoint}/' + ticketId + '/replies', { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setMessage('');
      toast.success('Reply sent');
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      replyMutation.mutate(message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center py-12 text-gray-500">Ticket not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/support" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Ticket #{ticket.number || ticket.id}</p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{ticket.subject}</h1>
              <p className="text-sm text-gray-500 mt-2">Opened {new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            {getStatusBadge(ticket.status)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {ticket.messages?.map((msg: any, index: number) => (
            <div key={index} className={\`flex gap-4 \${msg.is_staff ? 'flex-row-reverse' : ''}\`}>
              <div className="flex-shrink-0">
                {msg.avatar_url ? (
                  <img src={msg.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                    msg.is_staff ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'
                  }\`}>
                    <User className={\`w-5 h-5 \${msg.is_staff ? 'text-purple-600' : 'text-gray-400'}\`} />
                  </div>
                )}
              </div>
              <div className={\`flex-1 \${msg.is_staff ? 'text-right' : ''}\`}>
                <div className="flex items-center gap-2 mb-1" style={{ justifyContent: msg.is_staff ? 'flex-end' : 'flex-start' }}>
                  <span className="font-medium text-gray-900 dark:text-white">{msg.author_name || 'You'}</span>
                  {msg.is_staff && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                      Support
                    </span>
                  )}
                </div>
                <div className={\`inline-block p-4 rounded-xl \${
                  msg.is_staff
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-left'
                    : 'bg-gray-100 dark:bg-gray-700'
                }\`}>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {ticket.status !== 'resolved' && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <div className="flex-1">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <button type="button" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <Paperclip className="w-4 h-4" />
                Attach
              </button>
              <button
                type="submit"
                disabled={!message.trim() || replyMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Reply
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketForm(options: TicketOptions = {}): string {
  const { componentName = 'TicketForm', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Paperclip, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      toast.success('Ticket created!');
      navigate('/support/' + (response?.data?.id || response?.id));
    },
    onError: () => toast.error('Failed to create ticket'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      subject,
      category,
      priority,
      message,
    });
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create Support Ticket</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="">Select category</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="attachments"
              />
              <label htmlFor="attachments" className="cursor-pointer">
                <Paperclip className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to attach files or drag and drop</p>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(index)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/support')}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Ticket
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}
