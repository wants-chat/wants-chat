/**
 * Deadline List Component Generators
 *
 * Generates deadline management components for law firm applications.
 */

export interface DeadlineOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDeadlineListLawfirm(options: DeadlineOptions = {}): string {
  const { componentName = 'DeadlineListLawfirm', endpoint = '/lawfirm/deadlines' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, AlertTriangle, CheckCircle, Calendar, Scale, User, Plus, Filter, Bell, ChevronDown, MoreVertical, Trash2, Edit, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Deadline {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  case_id: string;
  case_number: string;
  case_title: string;
  deadline_type: 'filing' | 'hearing' | 'response' | 'discovery' | 'statute' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed' | 'overdue' | 'extended';
  assigned_to?: string;
  assigned_name?: string;
  reminder_sent?: boolean;
  created_by?: string;
  created_at: string;
  completed_at?: string;
  notes?: string;
}

interface DeadlineListLawfirmProps {
  caseId?: string;
  attorneyId?: string;
  showAddButton?: boolean;
  limit?: number;
}

const ${componentName}: React.FC<DeadlineListLawfirmProps> = ({
  caseId,
  attorneyId,
  showAddButton = true,
  limit
}) => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<string | null>(null);

  const buildQueryUrl = () => {
    let url = '${endpoint}?';
    const params: string[] = [];
    if (caseId) params.push('case_id=' + caseId);
    if (attorneyId) params.push('attorney_id=' + attorneyId);
    if (filterStatus !== 'all') params.push('status=' + filterStatus);
    if (filterType !== 'all') params.push('type=' + filterType);
    if (limit) params.push('limit=' + limit);
    return url + params.join('&');
  };

  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['lawfirm-deadlines', caseId, attorneyId, filterStatus, filterType, limit],
    queryFn: async () => {
      const response = await api.get<any>(buildQueryUrl());
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (deadlineId: string) => api.put('${endpoint}/' + deadlineId + '/complete', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawfirm-deadlines'] });
      toast.success('Deadline marked as completed');
    },
    onError: () => toast.error('Failed to update deadline'),
  });

  const deleteMutation = useMutation({
    mutationFn: (deadlineId: string) => api.delete('${endpoint}/' + deadlineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawfirm-deadlines'] });
      toast.success('Deadline deleted');
    },
    onError: () => toast.error('Failed to delete deadline'),
  });

  const getDeadlineTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      filing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      hearing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      response: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      discovery: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      statute: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      custom: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-400',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      critical: 'text-red-500',
    };
    return colors[priority] || 'text-gray-400';
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    if (status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }

    const daysUntil = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0 || status === 'overdue') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else if (daysUntil <= 3) {
      return <Clock className="w-5 h-5 text-orange-500" />;
    } else if (daysUntil <= 7) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getTimeUntil = (dueDate: string) => {
    const daysUntil = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return { text: \`\${Math.abs(daysUntil)}d overdue\`, urgent: true };
    } else if (daysUntil === 0) {
      return { text: 'Due today', urgent: true };
    } else if (daysUntil === 1) {
      return { text: 'Due tomorrow', urgent: true };
    } else if (daysUntil <= 7) {
      return { text: \`\${daysUntil} days left\`, urgent: daysUntil <= 3 };
    }
    return { text: \`\${daysUntil} days left\`, urgent: false };
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Deadlines</h2>
            {deadlines && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                {deadlines.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={\`w-4 h-4 transition-transform \${showFilters ? 'rotate-180' : ''}\`} />
            </button>
            {showAddButton && (
              <Link
                to={caseId ? \`/cases/\${caseId}/deadlines/new\` : '/deadlines/new'}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add
              </Link>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="all">All Types</option>
              <option value="filing">Filing</option>
              <option value="hearing">Hearing</option>
              <option value="response">Response</option>
              <option value="discovery">Discovery</option>
              <option value="statute">Statute</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {deadlines && deadlines.length > 0 ? (
          deadlines.map((deadline: Deadline) => {
            const timeUntil = getTimeUntil(deadline.due_date);

            return (
              <div
                key={deadline.id}
                className={\`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${
                  deadline.status === 'completed' ? 'opacity-60' : ''
                }\`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {getStatusIcon(deadline.status, deadline.due_date)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={\`px-2 py-0.5 rounded text-xs font-medium \${getDeadlineTypeColor(deadline.deadline_type)}\`}>
                            {deadline.deadline_type.replace(/_/g, ' ')}
                          </span>
                          <AlertTriangle className={\`w-3 h-3 \${getPriorityColor(deadline.priority)}\`} />
                          {deadline.reminder_sent && (
                            <Bell className="w-3 h-3 text-blue-500" title="Reminder sent" />
                          )}
                        </div>

                        <h3 className={\`font-medium text-gray-900 dark:text-white \${
                          deadline.status === 'completed' ? 'line-through' : ''
                        }\`}>
                          {deadline.title}
                        </h3>

                        {deadline.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{deadline.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          <Link
                            to={\`/cases/\${deadline.case_id}\`}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            <Scale className="w-3 h-3" />
                            {deadline.case_number}
                          </Link>
                          {deadline.assigned_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {deadline.assigned_name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(deadline.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        {deadline.due_time && (
                          <p className="text-xs text-gray-500 mt-0.5">{deadline.due_time}</p>
                        )}
                        {deadline.status !== 'completed' && (
                          <p className={\`text-xs mt-1 font-medium \${
                            timeUntil.urgent ? 'text-red-600' : 'text-gray-500'
                          }\`}>
                            {timeUntil.text}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setSelectedDeadline(selectedDeadline === deadline.id ? null : deadline.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>

                        {selectedDeadline === deadline.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <Link
                              to={\`/deadlines/\${deadline.id}\`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            <Link
                              to={\`/deadlines/\${deadline.id}/edit\`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                            {deadline.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  completeMutation.mutate(deadline.id);
                                  setSelectedDeadline(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this deadline?')) {
                                  deleteMutation.mutate(deadline.id);
                                  setSelectedDeadline(null);
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No deadlines found</p>
            {showAddButton && (
              <Link
                to={caseId ? \`/cases/\${caseId}/deadlines/new\` : '/deadlines/new'}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Deadline
              </Link>
            )}
          </div>
        )}
      </div>

      {deadlines && deadlines.length > 0 && !limit && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link to="/deadlines" className="text-sm text-blue-600 hover:text-blue-700">
            View All Deadlines
          </Link>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
