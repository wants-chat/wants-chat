import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSupportTicketListHelp = (
  resolved: ResolvedComponent,
  variant: 'table' | 'cards' | 'compact' = 'table'
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
import { Plus, Search, Eye, MessageCircle, Clock, AlertCircle, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    table: `
${commonImports}

interface SupportTicketListTableProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketListTable: React.FC<SupportTicketListTableProps> = ({ ${dataName}: propData, className }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ticketData = ${dataName} || {};

  const pageTitle = ${getField('pageTitle')};
  const pageDescription = ${getField('pageDescription')};
  const newTicketButton = ${getField('newTicketButton')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const filterLabel = ${getField('filterLabel')};
  const sortLabel = ${getField('sortLabel')};
  const statusFilters = ${getField('statusFilters')};
  const sortOptions = ${getField('sortOptions')};
  const tickets = ${getField('tickets')};
  const ticketIdHeader = ${getField('ticketIdHeader')};
  const subjectHeader = ${getField('subjectHeader')};
  const priorityHeader = ${getField('priorityHeader')};
  const statusHeader = ${getField('statusHeader')};
  const updatedHeader = ${getField('updatedHeader')};
  const actionsHeader = ${getField('actionsHeader')};
  const viewButton = ${getField('viewButton')};

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
      urgent: 'text-red-600 dark:text-red-400',
      high: 'text-orange-600 dark:text-orange-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-green-600 dark:text-green-400'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return \`\${diffMins}m ago\`;
    if (diffHours < 24) return \`\${diffHours}h ago\`;
    if (diffDays < 7) return \`\${diffDays}d ago\`;
    return date.toLocaleDateString();
  };

  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTicketClick = (ticket: any) => {
    console.log('Ticket clicked:', ticket);
    alert(\`Opening ticket: \${ticket.id} - \${ticket.subject}\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {pageTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {pageDescription}
              </p>
            </div>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5" />
              {newTicketButton}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusFilters.map((filter: any) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {sortOptions.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {ticketIdHeader}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {subjectHeader}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {priorityHeader}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {statusHeader}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {updatedHeader}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {actionsHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((ticket: any) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {ticket.subject}
                        </span>
                        {ticket.messages > 0 && (
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs">{ticket.messages}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={\`text-sm font-medium capitalize \${getPriorityColor(ticket.priority)}\`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={\`px-3 py-1 rounded-full text-xs font-medium capitalize \${getStatusColor(ticket.status)}\`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(ticket.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTicketClick(ticket);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        {viewButton}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketListTable;
    `,

    cards: `
${commonImports}

interface SupportTicketListCardsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketListCards: React.FC<SupportTicketListCardsProps> = ({ ${dataName}: propData, className }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ticketData = ${dataName} || {};

  const pageTitle = ${getField('pageTitle')};
  const newTicketButton = ${getField('newTicketButton')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const statusFilters = ${getField('statusFilters')};
  const tickets = ${getField('tickets')};
  const viewDetailsText = ${getField('viewDetailsText')};

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      resolved: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      closed: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    };
    return colors[status] || colors.open;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (priority === 'high') return <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    if (priority === 'medium') return <Circle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    return <Circle className="h-5 w-5 text-green-600 dark:text-green-400" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTicketClick = (ticket: any) => {
    console.log('Ticket clicked:', ticket);
    alert(\`Opening ticket: \${ticket.id} - \${ticket.subject}\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            {newTicketButton}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((filter: any) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket: any) => (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(ticket.priority)}
                    <span className="font-mono text-sm font-medium text-gray-500 dark:text-gray-400">
                      {ticket.id}
                    </span>
                  </div>
                  <div className={\`px-3 py-1 rounded-full text-xs font-medium border \${getStatusColor(ticket.status)}\`}>
                    {ticket.status}
                  </div>
                </div>

                {/* Subject */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {ticket.subject}
                </h3>

                {/* Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {ticket.category}
                    </span>
                    <span className="capitalize">{ticket.priority} priority</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Updated {formatDate(ticket.updatedAt)}</span>
                  </div>
                  {ticket.messages > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MessageCircle className="h-4 w-4" />
                      <span>{ticket.messages} messages</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Assigned to {ticket.assignee}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      {viewDetailsText}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketListCards;
    `,

    compact: `
${commonImports}

interface SupportTicketListCompactProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketListCompact: React.FC<SupportTicketListCompactProps> = ({ ${dataName}: propData, className }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ticketData = ${dataName} || {};

  const pageTitle = ${getField('pageTitle')};
  const newTicketButton = ${getField('newTicketButton')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const statusFilters = ${getField('statusFilters')};
  const tickets = ${getField('tickets')};

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-500',
      pending: 'bg-yellow-500',
      resolved: 'bg-green-500',
      closed: 'bg-gray-500'
    };
    return colors[status] || colors.open;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return \`\${diffHours}h ago\`;
    if (diffDays < 7) return \`\${diffDays}d ago\`;
    return date.toLocaleDateString();
  };

  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTicketClick = (ticket: any) => {
    console.log('Ticket clicked:', ticket);
    alert(\`Opening ticket: \${ticket.id} - \${ticket.subject}\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            {newTicketButton}
          </Button>
        </div>

        {/* Compact Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusFilters.map((filter: any) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compact List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTickets.map((ticket: any) => (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className={\`w-1 h-12 rounded-full \${getStatusColor(ticket.status)}\`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                      {ticket.id}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                      {ticket.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(ticket.updatedAt)}</span>
                    {ticket.messages > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{ticket.messages}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <Eye className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketListCompact;
    `
  };

  return variants[variant] || variants.table;
};
