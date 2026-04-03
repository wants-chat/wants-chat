/**
 * Design Component Generators for React Native Creative/Design Apps
 *
 * Generates design-related components including:
 * - DesignStats - Statistics dashboard for design businesses
 * - ClientProfileDesign - Client profile for design agencies
 */

export interface DesignGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate DesignStats component for React Native
 */
export function generateDesignStats(options: DesignGeneratorOptions = {}): string {
  const {
    componentName = 'DesignStats',
    endpoint = '/design/stats',
    queryKey = 'design-stats',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  designerId?: string;
  style?: any;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ designerId, style }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', designerId, timeRange],
    queryFn: async () => {
      let url = '${endpoint}?period=' + timeRange;
      if (designerId) url += '&designer_id=' + designerId;
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Text style={styles.errorText}>Failed to load statistics</Text>
      </View>
    );
  }

  const mainStats = [
    {
      label: 'Active Projects',
      value: stats?.activeProjects || 0,
      change: stats?.projectsChange,
      icon: 'briefcase-outline' as const,
      color: '#2563EB',
      bgColor: '#DBEAFE',
    },
    {
      label: 'Total Clients',
      value: stats?.totalClients || 0,
      change: stats?.clientsChange,
      icon: 'people-outline' as const,
      color: '#7C3AED',
      bgColor: '#EDE9FE',
    },
    {
      label: 'Designs Delivered',
      value: stats?.designsDelivered || 0,
      change: stats?.designsChange,
      icon: 'layers-outline' as const,
      color: '#059669',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Revenue',
      value: '$' + (stats?.revenue || 0).toLocaleString(),
      change: stats?.revenueChange,
      icon: 'cash-outline' as const,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
  ];

  const projectStatusStats = [
    {
      label: 'In Progress',
      value: stats?.inProgressProjects || 0,
      icon: 'flash-outline' as const,
      color: '#EAB308',
      bgColor: '#FEF3C7',
    },
    {
      label: 'In Review',
      value: stats?.inReviewProjects || 0,
      icon: 'alert-circle-outline' as const,
      color: '#F97316',
      bgColor: '#FFEDD5',
    },
    {
      label: 'Completed',
      value: stats?.completedProjects || 0,
      icon: 'checkmark-circle-outline' as const,
      color: '#059669',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Proposals Sent',
      value: stats?.proposalsSent || 0,
      icon: 'document-text-outline' as const,
      color: '#6366F1',
      bgColor: '#E0E7FF',
    },
  ];

  const performanceMetrics = [
    { label: 'Avg. Project Duration', value: stats?.avgProjectDuration ? stats.avgProjectDuration + ' days' : '-' },
    { label: 'Client Satisfaction', value: stats?.clientSatisfaction ? stats.clientSatisfaction.toFixed(1) + '/5' : '-' },
    { label: 'On-Time Delivery', value: stats?.onTimeDelivery ? stats.onTimeDelivery + '%' : '-' },
    { label: 'Revision Rate', value: stats?.revisionRate ? stats.revisionRate.toFixed(1) + ' avg' : '-' },
  ];

  const designTypes = stats?.designTypeBreakdown || [
    { type: 'Logo Design', count: 0, revenue: 0 },
    { type: 'Brand Identity', count: 0, revenue: 0 },
    { type: 'Web Design', count: 0, revenue: 0 },
    { type: 'UI/UX Design', count: 0, revenue: 0 },
    { type: 'Print Design', count: 0, revenue: 0 },
  ];

  const totalTypeCount = designTypes.reduce((sum: number, t: any) => sum + t.count, 0) || 1;
  const typeColors = ['#2563EB', '#7C3AED', '#EC4899', '#F97316', '#10B981'];

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="color-palette" size={24} color="#7C3AED" />
          <View>
            <Text style={styles.title}>Design Dashboard</Text>
            <Text style={styles.subtitle}>Track your design business performance</Text>
          </View>
        </View>
      </View>

      {/* Time Range Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeRangeContainer}
        contentContainerStyle={styles.timeRangeContent}
      >
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeRangeButton,
              timeRange === option.value && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(option.value)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === option.value && styles.timeRangeTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Stats */}
      <View style={styles.mainStatsGrid}>
        {mainStats.map((stat, index) => (
          <View key={index} style={styles.mainStatCard}>
            <View style={styles.mainStatHeader}>
              <View style={[styles.mainStatIcon, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              {stat.change !== undefined && (
                <View style={styles.changeContainer}>
                  <Ionicons
                    name={stat.change >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={stat.change >= 0 ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: stat.change >= 0 ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {Math.abs(stat.change)}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.mainStatValue}>{stat.value}</Text>
            <Text style={styles.mainStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Project Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart-outline" size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Project Status</Text>
        </View>
        <View style={styles.statusGrid}>
          {projectStatusStats.map((stat, index) => (
            <View key={index} style={[styles.statusCard, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusValue}>{stat.value}</Text>
                <Text style={styles.statusLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={20} color="#EAB308" />
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
        </View>
        <View style={styles.metricsContainer}>
          {performanceMetrics.map((metric, index) => (
            <View key={index} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Design Type Breakdown */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="layers-outline" size={20} color="#7C3AED" />
          <Text style={styles.sectionTitle}>Design Type Breakdown</Text>
        </View>
        {designTypes.map((type: any, index: number) => {
          const percentage = Math.round((type.count / totalTypeCount) * 100);
          return (
            <View key={index} style={styles.typeRow}>
              <View style={styles.typeHeader}>
                <Text style={styles.typeName}>{type.type}</Text>
                <View style={styles.typeStats}>
                  <Text style={styles.typeCount}>{type.count} projects</Text>
                  <Text style={styles.typeRevenue}>\${type.revenue?.toLocaleString() || 0}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: percentage + '%', backgroundColor: typeColors[index % typeColors.length] },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Recent Projects */}
      {stats?.recentProjects && stats.recentProjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          {stats.recentProjects.slice(0, 5).map((project: any, index: number) => (
            <TouchableOpacity key={project.id || index} style={styles.projectCard}>
              <View style={styles.projectIcon}>
                <Ionicons name="color-palette" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{project.name || 'Untitled Project'}</Text>
                <Text style={styles.projectClient}>{project.client_name || 'Client'}</Text>
              </View>
              <View style={styles.projectRight}>
                <Text style={styles.projectType}>{project.type || 'Design'}</Text>
                <View
                  style={[
                    styles.projectStatusBadge,
                    {
                      backgroundColor:
                        project.status === 'completed'
                          ? '#D1FAE5'
                          : project.status === 'in_progress'
                          ? '#DBEAFE'
                          : project.status === 'in_review'
                          ? '#FEF3C7'
                          : '#F3F4F6',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.projectStatusText,
                      {
                        color:
                          project.status === 'completed'
                            ? '#059669'
                            : project.status === 'in_progress'
                            ? '#2563EB'
                            : project.status === 'in_review'
                            ? '#D97706'
                            : '#6B7280',
                      },
                    ]}
                  >
                    {project.status?.replace('_', ' ') || 'pending'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  timeRangeContent: {
    paddingHorizontal: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#7C3AED',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  mainStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  mainStatCard: {
    width: '50%',
    padding: 8,
  },
  mainStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mainStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricsContainer: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  typeRow: {
    marginBottom: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    color: '#374151',
  },
  typeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  typeRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  projectClient: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  projectRight: {
    alignItems: 'flex-end',
  },
  projectType: {
    fontSize: 12,
    color: '#6B7280',
  },
  projectStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  projectStatusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default ${componentName};
`;
}

/**
 * Generate ClientProfileDesign component for React Native
 */
export function generateClientProfileDesign(options: DesignGeneratorOptions = {}): string {
  const {
    componentName = 'ClientProfileDesign',
    endpoint = '/design/clients',
    queryKey = 'design-client',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  start_date?: string;
  end_date?: string;
  deliverables?: number;
  budget?: number;
  thumbnail_url?: string;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  date: string;
  due_date?: string;
}

interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  avatar_url?: string;
  address?: string;
  industry?: string;
  notes?: string;
  created_at?: string;
  stats?: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalSpent: number;
    avgProjectValue: number;
    lastProject?: string;
  };
  projects?: Project[];
  invoices?: Invoice[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    fonts?: string[];
    logoUrl?: string;
    styleNotes?: string;
  };
  contacts?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  }[];
}

interface ${componentName}Props {
  clientId?: string;
  style?: any;
}

type TabType = 'overview' | 'projects' | 'invoices' | 'brand' | 'contacts';

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, style }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id: paramId } = (route.params as { id?: string }) || {};
  const clientId = propClientId || paramId;

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', clientId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const handleProjectPress = useCallback((projectId: string) => {
    navigation.navigate('ProjectDetail' as never, { id: projectId } as never);
  }, [navigation]);

  const handleEmailPress = useCallback(() => {
    if (client?.email) {
      Linking.openURL('mailto:' + client.email);
    }
  }, [client?.email]);

  const handlePhonePress = useCallback(() => {
    if (client?.phone) {
      Linking.openURL('tel:' + client.phone);
    }
  }, [client?.phone]);

  const handleWebsitePress = useCallback(() => {
    if (client?.website) {
      Linking.openURL(client.website);
    }
  }, [client?.website]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects', count: client?.projects?.length },
    { id: 'invoices', label: 'Invoices', count: client?.invoices?.length },
    { id: 'brand', label: 'Brand' },
    { id: 'contacts', label: 'Contacts', count: client?.contacts?.length },
  ];

  const projectStatusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#F3F4F6', text: '#6B7280' },
    in_progress: { bg: '#DBEAFE', text: '#2563EB' },
    in_review: { bg: '#FEF3C7', text: '#D97706' },
    completed: { bg: '#D1FAE5', text: '#059669' },
    on_hold: { bg: '#FFEDD5', text: '#F97316' },
  };

  const invoiceStatusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#F3F4F6', text: '#6B7280' },
    sent: { bg: '#DBEAFE', text: '#2563EB' },
    paid: { bg: '#D1FAE5', text: '#059669' },
    overdue: { bg: '#FEE2E2', text: '#DC2626' },
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error || !client) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text style={styles.errorText}>Client not found</Text>
      </View>
    );
  }

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => handleProjectPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.projectThumbnail}>
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.projectImage} />
        ) : (
          <View style={styles.projectPlaceholder}>
            <Ionicons name="layers-outline" size={32} color="#9CA3AF" />
          </View>
        )}
      </View>
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: projectStatusColors[item.status]?.bg || '#F3F4F6' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: projectStatusColors[item.status]?.text || '#6B7280' },
              ]}
            >
              {item.status?.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.projectType}>{item.type}</Text>
        <View style={styles.projectMeta}>
          {item.budget !== undefined && (
            <Text style={styles.projectBudget}>\${item.budget.toLocaleString()}</Text>
          )}
          {item.deliverables !== undefined && (
            <Text style={styles.projectDeliverables}>{item.deliverables} deliverables</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity style={styles.invoiceCard} activeOpacity={0.7}>
      <View style={styles.invoiceLeft}>
        <View style={styles.invoiceIcon}>
          <Ionicons name="document-text-outline" size={20} color="#059669" />
        </View>
        <View>
          <Text style={styles.invoiceNumber}>{item.number}</Text>
          <Text style={styles.invoiceDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.invoiceAmount}>\${item.amount.toLocaleString()}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: invoiceStatusColors[item.status]?.bg || '#F3F4F6' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: invoiceStatusColors[item.status]?.text || '#6B7280' },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContact = ({ item, index }: { item: any; index: number }) => (
    <View
      style={[
        styles.contactCard,
        item.isPrimary && styles.contactCardPrimary,
      ]}
    >
      <View style={[styles.contactAvatar, item.isPrimary && styles.contactAvatarPrimary]}>
        <Ionicons
          name="person-outline"
          size={24}
          color={item.isPrimary ? '#7C3AED' : '#6B7280'}
        />
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
        </View>
        <Text style={styles.contactRole}>{item.role}</Text>
        {item.email && (
          <TouchableOpacity
            style={styles.contactMeta}
            onPress={() => Linking.openURL('mailto:' + item.email)}
          >
            <Ionicons name="mail-outline" size={14} color="#6B7280" />
            <Text style={styles.contactMetaText}>{item.email}</Text>
          </TouchableOpacity>
        )}
        {item.phone && (
          <TouchableOpacity
            style={styles.contactMeta}
            onPress={() => Linking.openURL('tel:' + item.phone)}
          >
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text style={styles.contactMetaText}>{item.phone}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileTop}>
          <View style={styles.avatarContainer}>
            {client.avatar_url ? (
              <Image source={{ uri: client.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(client.company || client.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.clientName}>{client.company || client.name}</Text>
            {client.company && client.name && (
              <Text style={styles.contactPerson}>{client.name}</Text>
            )}
            {client.industry && (
              <View style={styles.industryBadge}>
                <Text style={styles.industryText}>{client.industry}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfoRow}>
          {client.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
              <Text style={styles.contactText} numberOfLines={1}>{client.email}</Text>
            </TouchableOpacity>
          )}
          {client.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <Ionicons name="call-outline" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{client.phone}</Text>
            </TouchableOpacity>
          )}
          {client.website && (
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsitePress}>
              <Ionicons name="globe-outline" size={16} color="#7C3AED" />
              <Text style={[styles.contactText, styles.linkText]} numberOfLines={1}>
                {client.website.replace(/^https?:\\/\\//, '').replace(/\\/$/, '')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {client.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.addressText}>{client.address}</Text>
          </View>
        )}

        {client.created_at && (
          <Text style={styles.clientSince}>Client since {formatDate(client.created_at)}</Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="briefcase-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>New Project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="document-text-outline" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      {client.stats && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase" size={20} color="#2563EB" />
            <Text style={styles.statValue}>{client.stats.totalProjects || 0}</Text>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={20} color="#EAB308" />
            <Text style={styles.statValue}>{client.stats.activeProjects || 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.statValue}>{client.stats.completedProjects || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={20} color="#10B981" />
            <Text style={styles.statValue}>\${(client.stats.totalSpent || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && (
          <View>
            {client.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{client.notes}</Text>
                </View>
              </View>
            )}
            {client.projects && client.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Projects</Text>
                {client.projects.slice(0, 3).map((project) => renderProject({ item: project }))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'projects' && (
          <View>
            {client.projects && client.projects.length > 0 ? (
              <FlatList
                data={client.projects}
                renderItem={renderProject}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No projects yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'invoices' && (
          <View>
            {client.invoices && client.invoices.length > 0 ? (
              <FlatList
                data={client.invoices}
                renderItem={renderInvoice}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No invoices yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'brand' && (
          <View>
            {client.brandGuidelines ? (
              <View style={styles.brandContent}>
                {client.brandGuidelines.logoUrl && (
                  <View style={styles.brandSection}>
                    <Text style={styles.brandLabel}>Logo</Text>
                    <View style={styles.logoContainer}>
                      <Image
                        source={{ uri: client.brandGuidelines.logoUrl }}
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                )}
                <View style={styles.colorsRow}>
                  {client.brandGuidelines.primaryColor && (
                    <View style={styles.colorSection}>
                      <Text style={styles.brandLabel}>Primary Color</Text>
                      <View style={styles.colorDisplay}>
                        <View
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: client.brandGuidelines.primaryColor },
                          ]}
                        />
                        <Text style={styles.colorCode}>{client.brandGuidelines.primaryColor}</Text>
                      </View>
                    </View>
                  )}
                  {client.brandGuidelines.secondaryColor && (
                    <View style={styles.colorSection}>
                      <Text style={styles.brandLabel}>Secondary Color</Text>
                      <View style={styles.colorDisplay}>
                        <View
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: client.brandGuidelines.secondaryColor },
                          ]}
                        />
                        <Text style={styles.colorCode}>{client.brandGuidelines.secondaryColor}</Text>
                      </View>
                    </View>
                  )}
                </View>
                {client.brandGuidelines.fonts && client.brandGuidelines.fonts.length > 0 && (
                  <View style={styles.brandSection}>
                    <Text style={styles.brandLabel}>Typography</Text>
                    <View style={styles.fontTags}>
                      {client.brandGuidelines.fonts.map((font, index) => (
                        <View key={index} style={styles.fontTag}>
                          <Text style={styles.fontTagText}>{font}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {client.brandGuidelines.styleNotes && (
                  <View style={styles.brandSection}>
                    <Text style={styles.brandLabel}>Style Notes</Text>
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText}>{client.brandGuidelines.styleNotes}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="color-palette-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No brand guidelines recorded</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'contacts' && (
          <View>
            {client.contacts && client.contacts.length > 0 ? (
              <FlatList
                data={client.contacts}
                renderItem={renderContact}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No contacts recorded</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#DC2626',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTop: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  contactPerson: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  industryBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  industryText: {
    fontSize: 12,
    color: '#7C3AED',
  },
  contactInfoRow: {
    marginTop: 16,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    color: '#7C3AED',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  clientSince: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabActive: {
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#7C3AED',
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  notesBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  projectCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  projectThumbnail: {
    width: 100,
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  projectPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
  },
  projectInfo: {
    flex: 1,
    padding: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  projectType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  projectBudget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  projectDeliverables: {
    fontSize: 12,
    color: '#6B7280',
  },
  invoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  brandContent: {
    gap: 20,
  },
  brandSection: {
    marginBottom: 16,
  },
  brandLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  logoContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 60,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  colorSection: {
    flex: 1,
  },
  colorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorCode: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#374151',
  },
  fontTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fontTagText: {
    fontSize: 14,
    color: '#374151',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  contactCardPrimary: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarPrimary: {
    backgroundColor: '#DDD6FE',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  primaryBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '500',
  },
  contactRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  contactMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
