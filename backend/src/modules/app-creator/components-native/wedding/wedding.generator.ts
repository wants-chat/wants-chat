/**
 * Wedding Component Generators (React Native)
 *
 * Generates wedding planning components including stats, countdown, timeline, and budget summary.
 * Uses React Native patterns with View, Text, StyleSheet, and @expo/vector-icons.
 */

export interface WeddingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateWeddingStats(options: WeddingOptions = {}): string {
  const { componentName = 'WeddingStats', endpoint = '/wedding/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  weddingId?: string;
}

interface StatItem {
  label: string;
  value: string | number;
  subtext: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ weddingId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['wedding-stats', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const statItems: StatItem[] = [
    {
      label: 'Total Guests',
      value: stats?.totalGuests || 0,
      subtext: \`\${stats?.confirmedGuests || 0} confirmed\`,
      icon: 'people-outline',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      label: 'Tasks Completed',
      value: stats?.completedTasks || 0,
      subtext: \`of \${stats?.totalTasks || 0} total\`,
      icon: 'checkmark-circle-outline',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Days Until',
      value: stats?.daysUntilWedding ?? '--',
      subtext: stats?.weddingDate ? new Date(stats.weddingDate).toLocaleDateString() : 'Set date',
      icon: 'calendar-outline',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
    {
      label: 'Budget Spent',
      value: \`$\${(stats?.budgetSpent || 0).toLocaleString()}\`,
      subtext: \`of $\${(stats?.totalBudget || 0).toLocaleString()}\`,
      icon: 'cash-outline',
      color: '#F97316',
      bgColor: '#FFEDD5',
    },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
            <Ionicons name={stat.icon} size={24} color={stat.color} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statSubtext}>{stat.subtext}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export function generateWeddingCountdown(options: WeddingOptions = {}): string {
  const { componentName = 'WeddingCountdown', endpoint = '/wedding/details' } = options;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  weddingId?: string;
  weddingDate?: string;
  venueName?: string;
  coupleName?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  weddingId,
  weddingDate: propDate,
  venueName: propVenue,
  coupleName: propCouple,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { data: wedding, isLoading } = useQuery({
    queryKey: ['wedding-details', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
    enabled: !propDate,
  });

  const weddingDate = propDate || wedding?.date || wedding?.weddingDate;
  const venueName = propVenue || wedding?.venue || wedding?.venueName;
  const coupleName = propCouple || wedding?.couple || wedding?.coupleName;

  useEffect(() => {
    if (!weddingDate) return;

    const calculateTimeLeft = () => {
      const targetDate = new Date(weddingDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.heartIcon}>
        <Ionicons name="heart" size={32} color="#F43F5E" />
      </View>

      {coupleName && (
        <Text style={styles.coupleName}>{coupleName}</Text>
      )}

      <Text style={styles.subtitle}>Counting Down to the Big Day</Text>

      <View style={styles.timeGrid}>
        {timeUnits.map((unit, index) => (
          <View key={index} style={styles.timeCard}>
            <Text style={styles.timeValue}>
              {String(unit.value).padStart(2, '0')}
            </Text>
            <Text style={styles.timeLabel}>{unit.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoRow}>
        {weddingDate && (
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#F43F5E" />
            <Text style={styles.infoText}>
              {new Date(weddingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}
        {venueName && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#F43F5E" />
            <Text style={styles.infoText}>{venueName}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  heartIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  coupleName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#F43F5E',
    fontWeight: '500',
    marginBottom: 20,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F43F5E',
  },
  timeLabel: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  infoRow: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateWeddingTimeline(options: WeddingOptions = {}): string {
  const { componentName = 'WeddingTimeline', endpoint = '/wedding/timeline' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  weddingId?: string;
}

interface TimelineEvent {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  location?: string;
  time?: string;
  startTime?: string;
  date?: string;
  type?: string;
  duration?: string;
  completed?: boolean;
  status?: string;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  ceremony: 'heart-outline',
  reception: 'restaurant-outline',
  photos: 'camera-outline',
  music: 'musical-notes-outline',
  guests: 'people-outline',
  transport: 'car-outline',
  flowers: 'flower-outline',
  rings: 'diamond-outline',
  default: 'calendar-outline',
};

const ${componentName}: React.FC<${componentName}Props> = ({ weddingId }) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['wedding-timeline', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const sortedEvents = [...(events || [])].sort((a: TimelineEvent, b: TimelineEvent) => {
    const dateA = new Date(a.time || a.date || a.startTime || '');
    const dateB = new Date(b.time || b.date || b.startTime || '');
    return dateA.getTime() - dateB.getTime();
  });

  const getIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
    return ICON_MAP[type?.toLowerCase() || ''] || ICON_MAP.default;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No timeline events yet</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color="#F43F5E" />
        <Text style={styles.headerTitle}>Wedding Day Timeline</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sortedEvents.length > 0 ? (
          <View style={styles.timeline}>
            <View style={styles.timelineLine} />
            {sortedEvents.map((event: TimelineEvent, index: number) => {
              const isCompleted = event.completed || event.status === 'completed';
              const eventTime = event.time || (event.startTime && new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

              return (
                <View key={event.id || index} style={styles.eventItem}>
                  <View style={[
                    styles.iconCircle,
                    isCompleted ? styles.iconCompleted : styles.iconActive
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    ) : (
                      <Ionicons name={getIcon(event.type)} size={20} color="#F43F5E" />
                    )}
                  </View>

                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={[
                        styles.eventTitle,
                        isCompleted && styles.completedText
                      ]}>
                        {event.title || event.name}
                      </Text>
                      {eventTime && (
                        <Text style={styles.eventTime}>{eventTime}</Text>
                      )}
                    </View>

                    {event.description && (
                      <Text style={styles.eventDescription}>{event.description}</Text>
                    )}

                    {event.location && (
                      <Text style={styles.eventLocation}>@ {event.location}</Text>
                    )}

                    {event.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>Duration: {event.duration}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  timeline: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FECDD3',
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconActive: {
    backgroundColor: '#FFE4E6',
  },
  iconCompleted: {
    backgroundColor: '#10B981',
  },
  eventContent: {
    flex: 1,
    paddingBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  completedText: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F43F5E',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  durationBadge: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateBudgetSummaryWedding(options: WeddingOptions = {}): string {
  const { componentName = 'BudgetSummaryWedding', endpoint = '/wedding/budget' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  weddingId?: string;
}

interface BudgetCategory {
  id?: string;
  name?: string;
  category?: string;
  budget?: number;
  allocated?: number;
  spent?: number;
  used?: number;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  venue: 'location-outline',
  catering: 'restaurant-outline',
  photography: 'camera-outline',
  music: 'musical-notes-outline',
  flowers: 'flower-outline',
  attire: 'shirt-outline',
  cake: 'cafe-outline',
  transportation: 'car-outline',
  rings: 'diamond-outline',
  invitations: 'mail-outline',
};

const ${componentName}: React.FC<${componentName}Props> = ({ weddingId }) => {
  const { data: budget, isLoading } = useQuery({
    queryKey: ['wedding-budget', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const totalBudget = budget?.totalBudget || budget?.total || 0;
  const totalSpent = budget?.totalSpent || budget?.spent || 0;
  const remaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = remaining < 0;
  const isNearLimit = percentSpent >= 80 && percentSpent <= 100;

  const categories: BudgetCategory[] = budget?.categories || budget?.items || [];

  const getCategoryIcon = (name?: string): keyof typeof Ionicons.glyphMap => {
    return CATEGORY_ICONS[name?.toLowerCase() || ''] || 'cash-outline';
  };

  const getProgressColor = () => {
    if (isOverBudget) return '#EF4444';
    if (isNearLimit) return '#F59E0B';
    return '#F43F5E';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cash-outline" size={20} color="#F43F5E" />
          <Text style={styles.headerTitle}>Wedding Budget</Text>
        </View>
        {isOverBudget && (
          <View style={styles.warningBadge}>
            <Ionicons name="warning-outline" size={14} color="#EF4444" />
            <Text style={styles.warningText}>Over Budget</Text>
          </View>
        )}
      </View>

      {/* Budget Overview */}
      <View style={styles.overview}>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewLabel}>Total Budget</Text>
          <Text style={styles.overviewValue}>\${totalBudget.toLocaleString()}</Text>
        </View>
        <View style={[styles.overviewItem, styles.overviewBorder]}>
          <Text style={styles.overviewLabel}>Spent</Text>
          <Text style={[styles.overviewValue, { color: '#F43F5E' }]}>
            \${totalSpent.toLocaleString()}
          </Text>
        </View>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewLabel}>Remaining</Text>
          <Text style={[
            styles.overviewValue,
            { color: isOverBudget ? '#EF4444' : '#10B981' }
          ]}>
            \${Math.abs(remaining).toLocaleString()}
            {isOverBudget && ' over'}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressPercent}>{percentSpent.toFixed(0)}% spent</Text>
          <Text style={[
            styles.progressStatus,
            { color: isOverBudget ? '#EF4444' : isNearLimit ? '#F59E0B' : '#10B981' }
          ]}>
            {isOverBudget ? 'Over Budget!' : isNearLimit ? 'Almost There' : 'On Track'}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: \`\${Math.min(percentSpent, 100)}%\`,
                backgroundColor: getProgressColor(),
              }
            ]}
          />
        </View>
      </View>

      {/* Category Breakdown */}
      <ScrollView style={styles.categoriesSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.categoryTitle}>By Category</Text>
        {categories.length > 0 ? (
          categories.map((category, index) => {
            const catName = category.name || category.category || '';
            const catBudget = category.budget || category.allocated || 0;
            const catSpent = category.spent || category.used || 0;
            const catProgress = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;
            const catOver = catSpent > catBudget;

            return (
              <View key={category.id || index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    <View style={[
                      styles.categoryIcon,
                      { backgroundColor: catOver ? '#FEE2E2' : '#FFE4E6' }
                    ]}>
                      <Ionicons
                        name={getCategoryIcon(catName)}
                        size={16}
                        color={catOver ? '#EF4444' : '#F43F5E'}
                      />
                    </View>
                    <Text style={styles.categoryName}>{catName}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={[
                      styles.categorySpent,
                      catOver && { color: '#EF4444' }
                    ]}>
                      \${catSpent.toLocaleString()}
                    </Text>
                    <Text style={styles.categoryBudget}> / \${catBudget.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.categoryProgress}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: \`\${Math.min(catProgress, 100)}%\`,
                        backgroundColor: catOver ? '#EF4444' : '#F43F5E',
                      }
                    ]}
                  />
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No budget categories set</Text>
        )}
      </ScrollView>

      {/* Tips */}
      {isNearLimit && !isOverBudget && (
        <View style={styles.tipContainer}>
          <Ionicons name="trending-up-outline" size={16} color="#F59E0B" />
          <Text style={styles.tipText}>
            You're approaching your budget limit. Consider reviewing optional expenses.
          </Text>
        </View>
      )}
      {isOverBudget && (
        <View style={[styles.tipContainer, styles.tipDanger]}>
          <Ionicons name="warning-outline" size={16} color="#EF4444" />
          <Text style={[styles.tipText, { color: '#991B1B' }]}>
            You've exceeded your budget by \${Math.abs(remaining).toLocaleString()}. Review your expenses.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  overview: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  overviewLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  progressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressPercent: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  categoriesSection: {
    flex: 1,
    padding: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textTransform: 'capitalize',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  categorySpent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  categoryBudget: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryProgress: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  tipDanger: {
    backgroundColor: '#FEF2F2',
    borderTopColor: '#FECACA',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});

export default ${componentName};
`;
}
