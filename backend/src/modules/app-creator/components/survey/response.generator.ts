/**
 * Survey Response Component Generators
 *
 * Generates survey response analysis components including:
 * - ResponseChart: Visualize response data with charts
 * - ResponseSummary: Overview of all responses
 * - QuestionAnalytics: Detailed analytics per question
 */

export interface ResponseOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

/**
 * Generate a ResponseChart component for visualizing survey responses
 */
export function generateResponseChart(options: ResponseOptions = {}): string {
  const {
    componentName = 'ResponseChart',
    endpoint = '/surveys',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  BarChart2,
  PieChart,
  TrendingUp,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

interface ${componentName}Props {
  surveyId: string;
  questionId?: string;
  chartType?: 'bar' | 'pie' | 'line' | 'donut';
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  questionId,
  chartType = 'bar',
  className = '',
}) => {
  const [selectedChartType, setSelectedChartType] = useState(chartType);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['response-chart', surveyId, questionId, dateRange],
    queryFn: async () => {
      let url = \`${endpoint}/\${surveyId}/analytics\`;
      if (questionId) url += \`?questionId=\${questionId}\`;
      if (dateRange.from) url += \`\${questionId ? '&' : '?'}from=\${dateRange.from}\`;
      if (dateRange.to) url += \`&to=\${dateRange.to}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const chartTypes = [
    { type: 'bar', label: 'Bar Chart', icon: BarChart2 },
    { type: 'pie', label: 'Pie Chart', icon: PieChart },
    { type: 'line', label: 'Trend Line', icon: TrendingUp },
  ] as const;

  const defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const chartData: ChartData = data?.chartData || { labels: [], values: [], colors: defaultColors };
  const total = chartData.values.reduce((sum, val) => sum + val, 0);

  const renderBarChart = () => {
    const maxValue = Math.max(...chartData.values, 1);
    return (
      <div className="space-y-4">
        {chartData.labels.map((label, index) => {
          const value = chartData.values[index] || 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const color = chartData.colors?.[index] || defaultColors[index % defaultColors.length];
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-gray-500">{value} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: \`\${(value / maxValue) * 100}%\`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = () => {
    let cumulativeAngle = 0;
    return (
      <div className="flex items-center gap-8">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {chartData.labels.map((label, index) => {
              const value = chartData.values[index] || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;
              const angle = (percentage / 100) * 360;
              const startAngle = cumulativeAngle;
              cumulativeAngle += angle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = ((startAngle + angle) * Math.PI) / 180;
              const largeArc = angle > 180 ? 1 : 0;

              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);

              const color = chartData.colors?.[index] || defaultColors[index % defaultColors.length];

              if (percentage === 0) return null;

              return (
                <path
                  key={index}
                  d={\`M 50 50 L \${x1} \${y1} A 40 40 0 \${largeArc} 1 \${x2} \${y2} Z\`}
                  fill={color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {chartData.labels.map((label, index) => {
            const value = chartData.values[index] || 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const color = chartData.colors?.[index] || defaultColors[index % defaultColors.length];
            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...chartData.values, 1);
    const points = chartData.values.map((value, index) => {
      const x = (index / (chartData.values.length - 1 || 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      return \`\${x},\${y}\`;
    }).join(' ');

    return (
      <div className="space-y-4">
        <svg viewBox="0 0 100 100" className="w-full h-48" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-gray-200 dark:text-gray-700"
            />
          ))}
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Points */}
          {chartData.values.map((value, index) => {
            const x = (index / (chartData.values.length - 1 || 1)) * 100;
            const y = 100 - (value / maxValue) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-500">
          {chartData.labels.map((label, index) => (
            <span key={index} className="truncate max-w-[60px]">{label}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{data?.questionTitle || 'Response Distribution'}</h3>

          <div className="flex items-center gap-3">
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {chartTypes.map(({ type, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setSelectedChartType(type)}
                  className={\`p-2 rounded-md transition-colors \${
                    selectedChartType === type
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }\`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            {/* Export */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {chartData.labels.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No response data available</p>
          </div>
        ) : (
          <>
            {selectedChartType === 'bar' && renderBarChart()}
            {selectedChartType === 'pie' && renderPieChart()}
            {selectedChartType === 'line' && renderLineChart()}
          </>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a ResponseSummary component for survey response overview
 */
export function generateResponseSummary(options: ResponseOptions = {}): string {
  const {
    componentName = 'ResponseSummary',
    endpoint = '/surveys',
    title = 'Response Summary',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Users,
  Clock,
  TrendingUp,
  Download,
  Eye,
  Calendar,
  ChevronDown,
  Filter,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Response {
  id: string;
  respondentId?: string;
  respondentEmail?: string;
  completedAt: string;
  duration?: number;
  answers: Record<string, any>;
}

interface SummaryData {
  totalResponses: number;
  completionRate: number;
  averageDuration: number;
  responsesPerDay: Array<{ date: string; count: number }>;
  responses: Response[];
}

interface ${componentName}Props {
  surveyId: string;
  onViewResponse?: (responseId: string) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  onViewResponse,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'partial'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['response-summary', surveyId, search, dateFilter, statusFilter, page],
    queryFn: async () => {
      let url = \`${endpoint}/\${surveyId}/responses?page=\${page}&limit=\${limit}\`;
      if (search) url += \`&search=\${encodeURIComponent(search)}\`;
      if (dateFilter) url += \`&date=\${dateFilter}\`;
      if (statusFilter !== 'all') url += \`&status=\${statusFilter}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return \`\${seconds}s\`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}m \${secs}s\`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const summary: SummaryData = data || {
    totalResponses: 0,
    completionRate: 0,
    averageDuration: 0,
    responsesPerDay: [],
    responses: [],
  };

  return (
    <div className={\`space-y-6 \${className}\`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">${title}</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalResponses}</p>
              <p className="text-sm text-gray-500">Total Responses</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.completionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(summary.averageDuration)}</p>
              <p className="text-sm text-gray-500">Avg. Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search responses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="partial">Partial</option>
            </select>

            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Respondent</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Completed At</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Duration</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {summary.responses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    No responses yet
                  </td>
                </tr>
              ) : (
                summary.responses.map((response) => (
                  <tr key={response.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <span className="text-gray-900 dark:text-white">
                        {response.respondentEmail || response.respondentId || 'Anonymous'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-400">{formatDate(response.completedAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-400">{formatDuration(response.duration)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {onViewResponse && (
                        <button
                          onClick={() => onViewResponse(response.id)}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {summary.totalResponses > limit && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, summary.totalResponses)} of {summary.totalResponses} responses
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= summary.totalResponses}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a QuestionAnalytics component for detailed question-level analytics
 */
export function generateQuestionAnalytics(options: ResponseOptions = {}): string {
  const {
    componentName = 'QuestionAnalytics',
    endpoint = '/surveys',
    title = 'Question Analytics',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  BarChart2,
  Star,
  MessageSquare,
  Hash,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { api } from '@/lib/api';

interface QuestionData {
  id: string;
  title: string;
  type: string;
  responseCount: number;
  skipCount: number;
  avgRating?: number;
  distribution?: Array<{ label: string; count: number; percentage: number }>;
  textResponses?: string[];
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

interface AnalyticsData {
  surveyTitle: string;
  totalResponses: number;
  questions: QuestionData[];
}

interface ${componentName}Props {
  surveyId: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  className = '',
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showTextResponses, setShowTextResponses] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['question-analytics', surveyId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${surveyId}/question-analytics\`);
      return response?.data || response;
    },
  });

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const toggleTextResponses = (questionId: string) => {
    setShowTextResponses(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const analytics: AnalyticsData = data || {
    surveyTitle: '',
    totalResponses: 0,
    questions: [],
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderDistribution = (distribution: QuestionData['distribution']) => {
    if (!distribution || distribution.length === 0) return null;
    const maxCount = Math.max(...distribution.map(d => d.count), 1);

    return (
      <div className="space-y-3 mt-4">
        {distribution.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="text-gray-500">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                style={{ width: \`\${(item.count / maxCount) * 100}%\` }}
              >
                {item.percentage >= 10 && (
                  <span className="text-xs text-white font-medium">{item.count}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRating = (avgRating?: number) => {
    if (avgRating === undefined) return null;
    return (
      <div className="flex items-center gap-2 mt-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={\`w-5 h-5 \${
                avgRating >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : avgRating >= star - 0.5
                  ? 'text-yellow-400 fill-yellow-400 opacity-50'
                  : 'text-gray-300 dark:text-gray-600'
              }\`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">/ 5</span>
      </div>
    );
  };

  const renderTextResponses = (responses?: string[], questionId?: string) => {
    if (!responses || responses.length === 0) return null;
    const isExpanded = showTextResponses[questionId || ''];
    const displayResponses = isExpanded ? responses : responses.slice(0, 3);

    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Responses</h4>
          <span className="text-xs text-gray-500">{responses.length} responses</span>
        </div>
        <div className="space-y-2">
          {displayResponses.map((response, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-300"
            >
              <MessageSquare className="w-4 h-4 inline-block mr-2 text-gray-400" />
              {response}
            </div>
          ))}
        </div>
        {responses.length > 3 && (
          <button
            onClick={() => toggleTextResponses(questionId || '')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Show less' : \`Show all \${responses.length} responses\`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={\`space-y-6 \${className}\`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">${title}</h2>
          <p className="text-sm text-gray-500 mt-1">{analytics.totalResponses} total responses</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {analytics.questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No question data available</p>
          </div>
        ) : (
          analytics.questions.map((question, index) => {
            const isExpanded = expandedQuestions.has(question.id);

            return (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleExpand(question.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 font-medium text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{question.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{question.responseCount} responses</span>
                        {question.skipCount > 0 && (
                          <span>{question.skipCount} skipped</span>
                        )}
                        {question.avgRating !== undefined && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            {question.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {question.trend && (
                      <div className="flex items-center gap-1">
                        {getTrendIcon(question.trend)}
                        {question.trendValue && (
                          <span className={\`text-sm \${
                            question.trend === 'up' ? 'text-green-500' :
                            question.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                          }\`}>
                            {question.trendValue > 0 ? '+' : ''}{question.trendValue}%
                          </span>
                        )}
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                    {/* Response Rate */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Response rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {analytics.totalResponses > 0
                            ? ((question.responseCount / analytics.totalResponses) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: \`\${analytics.totalResponses > 0
                              ? (question.responseCount / analytics.totalResponses) * 100
                              : 0}%\`
                          }}
                        />
                      </div>
                    </div>

                    {/* Type-specific visualization */}
                    {question.avgRating !== undefined && renderRating(question.avgRating)}
                    {question.distribution && renderDistribution(question.distribution)}
                    {question.textResponses && renderTextResponses(question.textResponses, question.id)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
