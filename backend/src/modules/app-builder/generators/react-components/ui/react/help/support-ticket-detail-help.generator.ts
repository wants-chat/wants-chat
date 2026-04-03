import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSupportTicketDetailHelp = (
  resolved: ResolvedComponent,
  variant: 'thread' | 'timeline' | 'detailed' = 'thread'
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
    return `/${dataSource || 'tickets'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'tickets';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, Clock, Paperclip, Send, X, User, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    thread: `
${commonImports}

interface SupportTicketDetailThreadProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketDetailThread: React.FC<SupportTicketDetailThreadProps> = ({ ${dataName}: propData, className }) => {
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
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ticketData = ${dataName} || {};

  const backToTicketsText = ${getField('backToTicketsText')};
  const ticketId = ${getField('ticketId')};
  const subject = ${getField('subject')};
  const category = ${getField('category')};
  const priority = ${getField('priority')};
  const status = ${getField('status')};
  const createdAt = ${getField('createdAt')};
  const assignee = ${getField('assignee')};
  const messages = ${getField('messages')};
  const conversationTitle = ${getField('conversationTitle')};
  const addReplyPlaceholder = ${getField('addReplyPlaceholder')};
  const sendReplyButton = ${getField('sendReplyButton')};
  const changeStatusButton = ${getField('changeStatusButton')};

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      resolved: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      closed: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      high: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
      medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      low: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log('Sending reply:', replyText);
      alert(\`Reply sent: \${replyText}\`);
      setReplyText('');
      setAttachments([]);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => console.log('Back to tickets')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            {backToTicketsText}
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm font-medium text-gray-500 dark:text-gray-400">
                  {ticketId}
                </span>
                <span className={\`px-3 py-1 rounded-full text-xs font-medium \${getStatusColor(status)}\`}>
                  {status}
                </span>
                <span className={\`px-3 py-1 rounded-full text-xs font-medium \${getPriorityColor(priority)}\`}>
                  {priority} priority
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {subject}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{category}</span>
                <span>•</span>
                <span>Created {formatDate(createdAt)}</span>
                <span>•</span>
                <span>Assigned to {assignee}</span>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              {changeStatusButton}
            </Button>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          {/* Messages */}
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {conversationTitle}
            </h2>

            {messages.map((message: any) => (
              <div key={message.id} className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {message.sender}
                    </span>
                    {message.senderRole === 'agent' && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        Support Team
                      </span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {message.content}
                    </p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((file: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({file.size})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={addReplyPlaceholder}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileAttach}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Attach File</span>
                  </div>
                </label>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                  {sendReplyButton}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailThread;
    `,

    timeline: `
${commonImports}

interface SupportTicketDetailTimelineProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketDetailTimelineProps: React.FC<SupportTicketDetailTimelineProps> = ({ ${dataName}: propData, className }) => {
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
  const [replyText, setReplyText] = useState('');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ticketData = ${dataName} || {};

  const backToTicketsText = ${getField('backToTicketsText')};
  const ticketId = ${getField('ticketId')};
  const subject = ${getField('subject')};
  const status = ${getField('status')};
  const priority = ${getField('priority')};
  const statusTimeline = ${getField('statusTimeline')};
  const messages = ${getField('messages')};
  const addReplyPlaceholder = ${getField('addReplyPlaceholder')};
  const sendReplyButton = ${getField('sendReplyButton')};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString();
    return { date: dateStr, time };
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log('Sending reply:', replyText);
      alert(\`Reply sent: \${replyText}\`);
      setReplyText('');
    }
  };

  const allEvents = [
    ...statusTimeline.map((item: any) => ({ ...item, type: 'status' })),
    ...messages.map((item: any) => ({ ...item, type: 'message' }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => console.log('Back to tickets')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          {backToTicketsText}
        </button>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
              {ticketId}
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {status}
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
              {priority}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {subject}
          </h1>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Timeline Events */}
            <div className="space-y-8">
              {allEvents.map((event: any, index: number) => {
                const { date, time } = formatDate(event.timestamp);
                return (
                  <div key={event.id} className="relative flex gap-6">
                    {/* Timeline Dot */}
                    <div className={\`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 \${
                      event.type === 'status'
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }\`}>
                      {event.type === 'status' ? (
                        <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {event.type === 'status' ? event.user : event.sender}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {time}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {date}
                        </span>
                      </div>
                      {event.type === 'status' ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-blue-900 dark:text-blue-100 font-medium">
                            {event.note}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300">
                            {event.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply Box */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={addReplyPlaceholder}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    {sendReplyButton}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailTimelineProps;
    `,

    detailed: `
${commonImports}

interface SupportTicketDetailDetailedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketDetailDetailed: React.FC<SupportTicketDetailDetailedProps> = ({ ${dataName}: propData, className }) => {
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
  const [replyText, setReplyText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ticketData = ${dataName} || {};

  const backToTicketsText = ${getField('backToTicketsText')};
  const ticketId = ${getField('ticketId')};
  const subject = ${getField('subject')};
  const category = ${getField('category')};
  const priority = ${getField('priority')};
  const status = ${getField('status')};
  const createdAt = ${getField('createdAt')};
  const assignee = ${getField('assignee')};
  const requester = ${getField('requester')};
  const requesterEmail = ${getField('requesterEmail')};
  const messages = ${getField('messages')};
  const statusOptions = ${getField('statusOptions')};
  const priorityOptions = ${getField('priorityOptions')};
  const ticketDetailsTitle = ${getField('ticketDetailsTitle')};
  const statusTitle = ${getField('statusTitle')};
  const priorityTitle = ${getField('priorityTitle')};
  const categoryTitle = ${getField('categoryTitle')};
  const createdTitle = ${getField('createdTitle')};
  const assigneeTitle = ${getField('assigneeTitle')};
  const requesterTitle = ${getField('requesterTitle')};
  const conversationTitle = ${getField('conversationTitle')};
  const addReplyPlaceholder = ${getField('addReplyPlaceholder')};
  const sendReplyButton = ${getField('sendReplyButton')};
  const closeTicketButton = ${getField('closeTicketButton')};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log('Sending reply:', replyText);
      alert(\`Reply sent: \${replyText}\`);
      setReplyText('');
    }
  };

  const handleStatusChange = () => {
    if (selectedStatus) {
      console.log('Changing status to:', selectedStatus);
      alert(\`Status changed to: \${selectedStatus}\`);
    }
  };

  const handlePriorityChange = () => {
    if (selectedPriority) {
      console.log('Changing priority to:', selectedPriority);
      alert(\`Priority changed to: \${selectedPriority}\`);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => console.log('Back to tickets')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          {backToTicketsText}
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <span className="font-mono text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                {ticketId}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {subject}
              </h1>
            </div>

            {/* Conversation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {conversationTitle}
              </h2>
              <div className="space-y-6">
                {messages.map((message: any) => (
                  <div key={message.id} className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {message.sender}
                        </span>
                        {message.senderRole === 'agent' && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                            Support
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={addReplyPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-5 w-5" />
                    {sendReplyButton}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ticket Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                {ticketDetailsTitle}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                    {statusTitle}
                  </label>
                  <select
                    value={selectedStatus || status}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statusOptions.map((option: any) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedStatus && selectedStatus !== status && (
                    <Button onClick={handleStatusChange} size="sm" className="mt-2 w-full">
                      Update Status
                    </Button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                    {priorityTitle}
                  </label>
                  <select
                    value={selectedPriority || priority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {priorityOptions.map((option: any) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedPriority && selectedPriority !== priority && (
                    <Button onClick={handlePriorityChange} size="sm" className="mt-2 w-full">
                      Update Priority
                    </Button>
                  )}
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    {categoryTitle}
                  </span>
                  <span className="text-gray-900 dark:text-white">{category}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    {createdTitle}
                  </span>
                  <span className="text-gray-900 dark:text-white">{formatDate(createdAt)}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    {assigneeTitle}
                  </span>
                  <span className="text-gray-900 dark:text-white">{assignee}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    {requesterTitle}
                  </span>
                  <div>
                    <span className="text-gray-900 dark:text-white block">{requester}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{requesterEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <Button variant="outline" className="w-full mb-3">
                {closeTicketButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailDetailed;
    `
  };

  return variants[variant] || variants.thread;
};
