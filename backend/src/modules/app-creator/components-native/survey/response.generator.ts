/**
 * Survey Response Component Generators (React Native)
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

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

interface ${componentName}Props {
  surveyId: string;
  questionId?: string;
  chartType?: 'bar' | 'pie';
}

const defaultColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  questionId,
  chartType = 'bar',
}) => {
  const [selectedChartType, setSelectedChartType] = useState(chartType);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['response-chart', surveyId, questionId],
    queryFn: async () => {
      let url = \`${endpoint}/\${surveyId}/analytics\`;
      if (questionId) url += \`?questionId=\${questionId}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const chartData: ChartData = data?.chartData || { labels: [], values: [], colors: defaultColors };
  const total = chartData.values.reduce((sum, val) => sum + val, 0);

  const renderBarChart = () => {
    const maxValue = Math.max(...chartData.values, 1);
    return (
      <View style={styles.barChartContainer}>
        {chartData.labels.map((label, index) => {
          const value = chartData.values[index] || 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const color = chartData.colors?.[index] || defaultColors[index % defaultColors.length];
          const barWidth = (value / maxValue) * 100;

          return (
            <View key={index} style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
                <Text style={styles.barValue}>{value} ({percentage.toFixed(1)}%)</Text>
              </View>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { width: \`\${barWidth}%\`, backgroundColor: color },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderPieChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartSize = Math.min(screenWidth - 80, 200);

    return (
      <View style={styles.pieChartContainer}>
        <View style={[styles.pieChart, { width: chartSize, height: chartSize }]}>
          <View style={styles.pieCenter}>
            <Text style={styles.pieTotalValue}>{total}</Text>
            <Text style={styles.pieTotalLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          {chartData.labels.map((label, index) => {
            const value = chartData.values[index] || 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const color = chartData.colors?.[index] || defaultColors[index % defaultColors.length];

            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>{label}</Text>
                <Text style={styles.legendValue}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{data?.questionTitle || 'Response Distribution'}</Text>
        <View style={styles.chartToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, selectedChartType === 'bar' && styles.toggleButtonActive]}
            onPress={() => setSelectedChartType('bar')}
          >
            <Ionicons
              name="bar-chart"
              size={18}
              color={selectedChartType === 'bar' ? '#3B82F6' : '#6B7280'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, selectedChartType === 'pie' && styles.toggleButtonActive]}
            onPress={() => setSelectedChartType('pie')}
          >
            <Ionicons
              name="pie-chart"
              size={18}
              color={selectedChartType === 'pie' ? '#3B82F6' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart */}
      <ScrollView
        style={styles.chartArea}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {chartData.labels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No response data available</Text>
          </View>
        ) : (
          <>
            {selectedChartType === 'bar' && renderBarChart()}
            {selectedChartType === 'pie' && renderPieChart()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  chartArea: {
    padding: 16,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  barChartContainer: {
    gap: 16,
  },
  barItem: {
    gap: 8,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  barValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  barBackground: {
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  pieChartContainer: {
    alignItems: 'center',
    gap: 24,
  },
  pieChart: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieTotalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  pieTotalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  legendContainer: {
    width: '100%',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});

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

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
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
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  onViewResponse,
}) => {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['response-summary', surveyId, search, page],
    queryFn: async () => {
      let url = \`${endpoint}/\${surveyId}/responses?page=\${page}&limit=\${limit}\`;
      if (search) url += \`&search=\${encodeURIComponent(search)}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return \`\${seconds}s\`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}m \${secs}s\`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const summary: SummaryData = data || {
    totalResponses: 0,
    completionRate: 0,
    averageDuration: 0,
    responsesPerDay: [],
    responses: [],
  };

  const renderResponseItem = ({ item }: { item: Response }) => (
    <TouchableOpacity
      style={styles.responseItem}
      onPress={() => onViewResponse?.(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.responseInfo}>
        <Text style={styles.respondentName}>
          {item.respondentEmail || item.respondentId || 'Anonymous'}
        </Text>
        <Text style={styles.responseDate}>{formatDate(item.completedAt)}</Text>
      </View>
      <View style={styles.responseMeta}>
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={12} color="#6B7280" />
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
          <Text style={styles.statusText}>Complete</Text>
        </View>
      </View>
      {onViewResponse && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${title}</Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{summary.totalResponses}</Text>
          <Text style={styles.statLabel}>Total Responses</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{summary.completionRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="time" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statValue}>{formatDuration(summary.averageDuration)}</Text>
          <Text style={styles.statLabel}>Avg. Duration</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search responses..."
          placeholderTextColor="#9CA3AF"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Responses List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Responses</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={18} color="#3B82F6" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {summary.responses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No responses yet</Text>
          </View>
        ) : (
          <FlatList
            data={summary.responses}
            renderItem={renderResponseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
                colors={['#3B82F6']}
              />
            }
          />
        )}

        {/* Pagination */}
        {summary.totalResponses > limit && (
          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, summary.totalResponses)} of {summary.totalResponses}
            </Text>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              >
                <Text style={[styles.pageButtonText, page === 1 && styles.pageButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPage(p => p + 1)}
                disabled={page * limit >= summary.totalResponses}
                style={[styles.pageButton, page * limit >= summary.totalResponses && styles.pageButtonDisabled]}
              >
                <Text style={[styles.pageButtonText, page * limit >= summary.totalResponses && styles.pageButtonTextDisabled]}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#111827',
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  responseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  responseInfo: {
    flex: 1,
  },
  respondentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  responseDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  responseMeta: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 16,
  },
  pagination: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  pageButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

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

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
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
  onExport?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  onExport,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['question-analytics', surveyId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${surveyId}/question-analytics\`);
      return response?.data || response;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  const analytics: AnalyticsData = data || {
    surveyTitle: '',
    totalResponses: 0,
    questions: [],
  };

  const getTrendIcon = (trend?: string): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend?: string): string => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const renderDistribution = (distribution: QuestionData['distribution']) => {
    if (!distribution || distribution.length === 0) return null;
    const maxCount = Math.max(...distribution.map(d => d.count), 1);

    return (
      <View style={styles.distributionContainer}>
        {distribution.map((item, index) => (
          <View key={index} style={styles.distributionItem}>
            <View style={styles.distributionLabelRow}>
              <Text style={styles.distributionLabel}>{item.label}</Text>
              <Text style={styles.distributionValue}>
                {item.count} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.distributionBarBg}>
              <View
                style={[
                  styles.distributionBarFill,
                  { width: \`\${(item.count / maxCount) * 100}%\` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRating = (avgRating?: number) => {
    if (avgRating === undefined) return null;
    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={avgRating >= star ? 'star' : avgRating >= star - 0.5 ? 'star-half' : 'star-outline'}
              size={20}
              color={avgRating >= star - 0.5 ? '#F59E0B' : '#D1D5DB'}
            />
          ))}
        </View>
        <Text style={styles.ratingValue}>{avgRating.toFixed(1)}</Text>
        <Text style={styles.ratingMax}>/ 5</Text>
      </View>
    );
  };

  const renderTextResponses = (responses?: string[]) => {
    if (!responses || responses.length === 0) return null;
    const displayResponses = responses.slice(0, 3);

    return (
      <View style={styles.textResponsesContainer}>
        <View style={styles.textResponsesHeader}>
          <Text style={styles.textResponsesTitle}>Text Responses</Text>
          <Text style={styles.textResponsesCount}>{responses.length} responses</Text>
        </View>
        {displayResponses.map((response, index) => (
          <View key={index} style={styles.textResponseItem}>
            <Ionicons name="chatbubble-outline" size={14} color="#9CA3AF" />
            <Text style={styles.textResponseText} numberOfLines={2}>{response}</Text>
          </View>
        ))}
        {responses.length > 3 && (
          <Text style={styles.showMoreText}>+{responses.length - 3} more responses</Text>
        )}
      </View>
    );
  };

  const renderQuestionItem = ({ item: question, index }: { item: QuestionData; index: number }) => {
    const isExpanded = expandedQuestions.has(question.id);

    return (
      <View style={styles.questionCard}>
        <TouchableOpacity
          style={styles.questionHeader}
          onPress={() => toggleExpand(question.id)}
          activeOpacity={0.7}
        >
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.questionInfo}>
            <Text style={styles.questionTitle} numberOfLines={2}>{question.title}</Text>
            <View style={styles.questionMeta}>
              <Text style={styles.questionMetaText}>{question.responseCount} responses</Text>
              {question.skipCount > 0 && (
                <Text style={styles.questionMetaText}>{question.skipCount} skipped</Text>
              )}
              {question.avgRating !== undefined && (
                <View style={styles.questionRatingMini}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.questionRatingMiniText}>{question.avgRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.questionRight}>
            {question.trend && (
              <View style={styles.trendBadge}>
                <Ionicons name={getTrendIcon(question.trend)} size={14} color={getTrendColor(question.trend)} />
                {question.trendValue !== undefined && (
                  <Text style={[styles.trendText, { color: getTrendColor(question.trend) }]}>
                    {question.trendValue > 0 ? '+' : ''}{question.trendValue}%
                  </Text>
                )}
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9CA3AF"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.questionContent}>
            {/* Response Rate */}
            <View style={styles.responseRateSection}>
              <View style={styles.responseRateLabelRow}>
                <Text style={styles.responseRateLabel}>Response rate</Text>
                <Text style={styles.responseRateValue}>
                  {analytics.totalResponses > 0
                    ? ((question.responseCount / analytics.totalResponses) * 100).toFixed(1)
                    : 0}%
                </Text>
              </View>
              <View style={styles.responseRateBar}>
                <View
                  style={[
                    styles.responseRateFill,
                    {
                      width: \`\${analytics.totalResponses > 0
                        ? (question.responseCount / analytics.totalResponses) * 100
                        : 0}%\`
                    },
                  ]}
                />
              </View>
            </View>

            {/* Type-specific visualization */}
            {question.avgRating !== undefined && renderRating(question.avgRating)}
            {question.distribution && renderDistribution(question.distribution)}
            {question.textResponses && renderTextResponses(question.textResponses)}
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.title}>${title}</Text>
          <Text style={styles.subtitle}>{analytics.totalResponses} total responses</Text>
        </View>
        {onExport && (
          <TouchableOpacity style={styles.exportButton} onPress={onExport}>
            <Ionicons name="download-outline" size={18} color="#374151" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Questions List */}
      {analytics.questions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No question data available</Text>
        </View>
      ) : (
        <FlatList
          data={analytics.questions}
          renderItem={renderQuestionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  questionInfo: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  questionMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  questionRatingMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  questionRatingMiniText: {
    fontSize: 13,
    color: '#6B7280',
  },
  questionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 0,
  },
  responseRateSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  responseRateLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  responseRateLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  responseRateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  responseRateBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  responseRateFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  ratingMax: {
    fontSize: 14,
    color: '#6B7280',
  },
  distributionContainer: {
    gap: 12,
    marginBottom: 16,
  },
  distributionItem: {
    gap: 6,
  },
  distributionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distributionLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  distributionValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  distributionBarBg: {
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  textResponsesContainer: {
    marginTop: 8,
  },
  textResponsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  textResponsesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  textResponsesCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  textResponseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  textResponseText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  showMoreText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}
