/**
 * Activity and Calendar Component Generators (React Native)
 *
 * Generators for activity feeds, calendars, and scheduling components.
 * Uses React Native patterns: View, Text, FlatList, TouchableOpacity, StyleSheet.
 * Features: Calendar views, appointment lists, schedule displays.
 */

export interface ActivityCalendarOptions {
  title?: string;
  entityType?: string;
  componentName?: string;
  endpoint?: string;
}

// Activity Calendar Senior
export function generateActivityCalendarSenior(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'ActivityCalendarSenior', endpoint = '/activities' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  enrolled: number;
}

interface ${componentName}Props {
  initialDate?: Date;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Fitness: { bg: '#D1FAE5', text: '#059669' },
  Creative: { bg: '#EDE9FE', text: '#7C3AED' },
  Games: { bg: '#DBEAFE', text: '#2563EB' },
  Entertainment: { bg: '#FEF3C7', text: '#D97706' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ initialDate }) => {
  const [date, setDate] = useState(initialDate || new Date());
  const [refreshing, setRefreshing] = useState(false);

  const dateStr = date.toISOString().split('T')[0];

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['senior-activities', dateStr],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${dateStr}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const goToPreviousDay = () => {
    setDate(prev => new Date(prev.getTime() - 86400000));
  };

  const goToNextDay = () => {
    setDate(prev => new Date(prev.getTime() + 86400000));
  };

  const getCategoryStyle = (category: string) => {
    return CATEGORY_COLORS[category] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const renderItem = useCallback(({ item }: { item: Activity }) => {
    const categoryStyle = getCategoryStyle(item.category);
    const enrollmentPercent = (item.enrolled / item.capacity) * 100;

    return (
      <View style={styles.activityCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
              {item.category}
            </Text>
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.enrollmentRow}>
          <Text style={styles.enrollmentText}>
            {item.enrolled}/{item.capacity} enrolled
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: \`\${Math.min(enrollmentPercent, 100)}%\` },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Activity) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Activities</Text>
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {activities && activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No activities scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  listContent: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  enrollmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enrollmentText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Activity List Today
export function generateActivityListToday(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'ActivityListToday', endpoint = '/activities/today' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Activity {
  id: string;
  title: string;
  time: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  participants: number;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  completed: { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' },
  'in-progress': { bg: '#DBEAFE', text: '#2563EB', icon: 'play-circle' },
  upcoming: { bg: '#F3F4F6', text: '#6B7280', icon: 'ellipse-outline' },
};

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activities-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: Activity }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.upcoming;

    return (
      <View style={[styles.activityItem, { backgroundColor: config.bg }]}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={24} color={config.text} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityMeta}>
            {item.time} - {item.participants} participants
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.statusText, { color: config.text }]}>
            {item.status.replace('-', ' ')}
          </Text>
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Activity) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Activities</Text>
      </View>

      {activities && activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="today-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No activities today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  activityMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Activity List Today Senior
export function generateActivityListTodaySenior(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'ActivityListTodaySenior', endpoint = '/activities/senior/today' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  staff: string;
  isAccessible: boolean;
}

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['senior-activities-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: Activity }) => {
    const [timeNum, ampm] = item.time.split(' ');

    return (
      <View style={styles.activityItem}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeNumber}>{timeNum}</Text>
          <Text style={styles.timeAmPm}>{ampm}</Text>
        </View>
        <View style={styles.activityContent}>
          <View style={styles.titleRow}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            {item.isAccessible && (
              <View style={styles.accessibleBadge}>
                <Ionicons name="accessibility" size={14} color="#3B82F6" />
              </View>
            )}
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.staff}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.joinButton} activeOpacity={0.7}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Activity) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Schedule</Text>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {activities && activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No activities scheduled today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timeContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  timeAmPm: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityContent: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  accessibleBadge: {
    padding: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  joinButton: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 76,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Calendar Accounting
export function generateCalendarAccounting(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'CalendarAccounting', endpoint = '/calendar/events' } = options;

  return `import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'meeting' | 'filing' | 'review';
  client?: string;
}

const TYPE_COLORS: Record<string, string> = {
  deadline: '#EF4444',
  meeting: '#3B82F6',
  filing: '#10B981',
  review: '#8B5CF6',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ${componentName}: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', year, month],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?year=\${year}&month=\${month + 1}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding: (number | null)[] = Array.from({ length: firstDay }, () => null);
    return [...padding, ...days];
  }, [year, month]);

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return events.filter((e: CalendarEvent) => e.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <Text style={styles.dayName}>{name}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.calendarGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.daysContainer}>
          {calendarData.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            return (
              <View key={index} style={styles.dayCell}>
                {day && (
                  <>
                    <Text style={styles.dayNumber}>{day}</Text>
                    <View style={styles.eventsContainer}>
                      {dayEvents.slice(0, 2).map((event: CalendarEvent) => (
                        <View
                          key={event.id}
                          style={[
                            styles.eventPill,
                            { backgroundColor: TYPE_COLORS[event.type] },
                          ]}
                        >
                          <Text style={styles.eventText} numberOfLines={1}>
                            {event.title}
                          </Text>
                        </View>
                      ))}
                      {dayEvents.length > 2 && (
                        <Text style={styles.moreText}>+{dayEvents.length - 2}</Text>
                      )}
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
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
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 80,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  eventsContainer: {
    gap: 2,
  },
  eventPill: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 10,
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
});

export default ${componentName};
`;
}

// Appointment Calendar Dental
export function generateAppointmentCalendarDental(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'AppointmentCalendarDental', endpoint = '/appointments/dental' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  patientName: string;
  procedure: string;
  time: string;
  duration: number;
  dentist: string;
  room: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: '#F3F4F6', text: '#6B7280' },
  'checked-in': { bg: '#FEF3C7', text: '#D97706' },
  'in-progress': { bg: '#DBEAFE', text: '#2563EB' },
  completed: { bg: '#D1FAE5', text: '#059669' },
};

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['dental-appointments', dateStr],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${dateStr}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDateChange = (days: number) => {
    setSelectedDate(prev => new Date(prev.getTime() + days * 86400000));
  };

  const renderItem = useCallback(({ item }: { item: Appointment }) => {
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.scheduled;

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.durationText}>{item.duration}min</Text>
        </View>
        <View style={styles.contentColumn}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.procedure}>{item.procedure}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={12} color="#6B7280" />
              <Text style={styles.detailText}>{item.dentist}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.detailText}>{item.room}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status.replace('-', ' ')}
          </Text>
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="medical-outline" size={24} color="#111827" />
          <Text style={styles.headerTitle}>Dental Appointments</Text>
        </View>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {appointments && appointments.length > 0 ? (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No appointments scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    minWidth: 120,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeColumn: {
    alignItems: 'center',
    minWidth: 50,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
    marginLeft: 16,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  procedure: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Appointment Calendar Vet
export function generateAppointmentCalendarVet(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'AppointmentCalendarVet', endpoint = '/appointments/vet' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  petName: string;
  petType: string;
  ownerName: string;
  procedure: string;
  time: string;
  vet: string;
  status: 'scheduled' | 'waiting' | 'in-exam' | 'completed';
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: '#F3F4F6', text: '#6B7280' },
  waiting: { bg: '#FEF3C7', text: '#D97706' },
  'in-exam': { bg: '#DBEAFE', text: '#2563EB' },
  completed: { bg: '#D1FAE5', text: '#059669' },
};

const PET_ICONS: Record<string, string> = {
  dog: 'paw',
  cat: 'paw',
  bird: 'egg',
  default: 'paw',
};

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['vet-appointments', dateStr],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${dateStr}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDateChange = (days: number) => {
    setSelectedDate(prev => new Date(prev.getTime() + days * 86400000));
  };

  const getPetIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    return 'paw' as keyof typeof Ionicons.glyphMap;
  };

  const renderItem = useCallback(({ item }: { item: Appointment }) => {
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.scheduled;

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.petIconContainer}>
          <Text style={styles.petEmoji}>{item.petType}</Text>
        </View>
        <View style={styles.contentColumn}>
          <View style={styles.headerRow}>
            <Text style={styles.petName}>{item.petName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status.replace('-', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.ownerName}>Owner: {item.ownerName}</Text>
          <Text style={styles.procedure}>{item.procedure}</Text>
          <View style={styles.footerRow}>
            <Text style={styles.timeText}>{item.time}</Text>
            <Text style={styles.vetText}>{item.vet}</Text>
          </View>
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="paw" size={24} color="#111827" />
          <Text style={styles.headerTitle}>Veterinary Appointments</Text>
        </View>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {appointments && appointments.length > 0 ? (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No appointments scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    minWidth: 120,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 24,
  },
  contentColumn: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ownerName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  procedure: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  vetText: {
    fontSize: 14,
    color: '#6B7280',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Appointment Detail
export function generateAppointmentDetail(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'AppointmentDetail', endpoint = '/appointments' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  appointmentId: string;
  onReschedule?: () => void;
  onCancel?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  appointmentId,
  onReschedule,
  onCancel,
}) => {
  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${appointmentId}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Appointment not found</Text>
      </View>
    );
  }

  const statusStyle = appointment.status === 'confirmed'
    ? { bg: '#D1FAE5', text: '#059669' }
    : { bg: '#FEF3C7', text: '#D97706' };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {appointment.status}
          </Text>
        </View>
        <Text style={styles.title}>{appointment.title}</Text>
        <View style={styles.dateTimeRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{appointment.date}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{appointment.time}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="hourglass-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{appointment.duration}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Provider</Text>
        <View style={styles.providerCard}>
          <Image
            source={{ uri: appointment.provider?.avatar || 'https://via.placeholder.com/60' }}
            style={styles.providerAvatar}
          />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{appointment.provider?.name}</Text>
            <Text style={styles.providerSpecialty}>{appointment.provider?.specialty}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Ionicons name="location-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{appointment.location?.name}</Text>
            <Text style={styles.locationAddress}>{appointment.location?.address}</Text>
            <Text style={styles.locationPhone}>{appointment.location?.phone}</Text>
          </View>
        </View>
      </View>

      {appointment.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        </View>
      )}

      {appointment.reminders && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={styles.remindersContainer}>
            {appointment.reminders.map((reminder: any, index: number) => (
              <View key={index} style={styles.reminderItem}>
                <Ionicons
                  name={reminder.sent ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={reminder.sent ? '#059669' : '#9CA3AF'}
                />
                <Text style={styles.reminderText}>{reminder.type}</Text>
                <Text style={styles.reminderDate}>({reminder.date})</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.rescheduleButton}
          onPress={onReschedule}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={20} color="#374151" />
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  providerInfo: {
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  providerSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  locationPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  remindersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reminderText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  reminderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 12,
  },
  rescheduleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
  },
});

export default ${componentName};
`;
}

// Appointment List Today Rehab
export function generateAppointmentListTodayRehab(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'AppointmentListTodayRehab', endpoint = '/appointments/rehab/today' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  patientName: string;
  therapyType: string;
  time: string;
  therapist: string;
  room: string;
  progressNote?: string;
  status: 'scheduled' | 'in-session' | 'completed' | 'no-show';
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  scheduled: { bg: '#F3F4F6', text: '#6B7280', icon: 'time-outline' },
  'in-session': { bg: '#DBEAFE', text: '#2563EB', icon: 'play-circle' },
  completed: { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' },
  'no-show': { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' },
};

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['rehab-appointments-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: Appointment }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.contentColumn}>
          <View style={styles.headerRow}>
            <Text style={styles.patientName}>{item.patientName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon} size={12} color={config.text} />
              <Text style={[styles.statusText, { color: config.text }]}>
                {item.status.replace('-', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.therapyType}>{item.therapyType}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={12} color="#6B7280" />
              <Text style={styles.detailText}>{item.therapist}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.detailText}>{item.room}</Text>
            </View>
          </View>
          {item.progressNote && (
            <View style={styles.progressNoteContainer}>
              <Text style={styles.progressNote}>"{item.progressNote}"</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.viewButton} activeOpacity={0.7}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Rehab Sessions</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString()}</Text>
      </View>

      {appointments && appointments.length > 0 ? (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No sessions scheduled today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeColumn: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  contentColumn: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  therapyType: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressNoteContainer: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  progressNote: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  viewButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Event Calendar
export function generateEventCalendar(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'EventCalendar', endpoint = '/events' } = options;

  return `import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  attendees: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  meeting: '#3B82F6',
  event: '#8B5CF6',
  training: '#10B981',
  deadline: '#EF4444',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ${componentName}: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', year, month],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?year=\${year}&month=\${month + 1}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding: (number | null)[] = Array.from({ length: firstDay }, () => null);
    return [...padding, ...days];
  }, [year, month]);

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return events.filter((e: Event) => e.date === dateStr);
  };

  const selectedEvents = selectedDate
    ? events?.filter((e: Event) => e.date === selectedDate) || []
    : [];

  const handleDayPress = (day: number) => {
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    setSelectedDate(dateStr);
    setModalVisible(true);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <Text style={styles.dayName}>{name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {calendarData.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isTodayDay = day ? isToday(day) : false;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isTodayDay && styles.todayCell,
              ]}
              onPress={() => day && handleDayPress(day)}
              disabled={!day}
              activeOpacity={0.7}
            >
              {day && (
                <>
                  <Text style={[
                    styles.dayNumber,
                    isTodayDay && styles.todayNumber,
                  ]}>
                    {day}
                  </Text>
                  <View style={styles.eventDotsContainer}>
                    {dayEvents.slice(0, 3).map((event: Event, i: number) => (
                      <View
                        key={i}
                        style={[
                          styles.eventDot,
                          { backgroundColor: CATEGORY_COLORS[event.category] || '#6B7280' },
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                }) : ''}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {selectedEvents.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text style={styles.noEventsText}>No events scheduled</Text>
              </View>
            ) : (
              <FlatList
                data={selectedEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.eventCard}>
                    <View
                      style={[
                        styles.eventIndicator,
                        { backgroundColor: CATEGORY_COLORS[item.category] || '#6B7280' },
                      ]}
                    />
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      <View style={styles.eventDetails}>
                        <View style={styles.eventDetailItem}>
                          <Ionicons name="time-outline" size={14} color="#6B7280" />
                          <Text style={styles.eventDetailText}>
                            {item.startTime} - {item.endTime}
                          </Text>
                        </View>
                        <View style={styles.eventDetailItem}>
                          <Ionicons name="location-outline" size={14} color="#6B7280" />
                          <Text style={styles.eventDetailText}>{item.location}</Text>
                        </View>
                        <View style={styles.eventDetailItem}>
                          <Ionicons name="people-outline" size={14} color="#6B7280" />
                          <Text style={styles.eventDetailText}>{item.attendees} attendees</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
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
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
  },
  todayCell: {
    backgroundColor: '#EBF5FF',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  todayNumber: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  eventDotsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  noEventsContainer: {
    padding: 48,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  eventDetails: {
    gap: 6,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

// Session Calendar
export function generateSessionCalendar(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'SessionCalendar', endpoint = '/sessions' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  instructor: string;
  capacity: number;
  enrolled: number;
  status: 'open' | 'full' | 'cancelled';
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  open: { bg: '#D1FAE5', text: '#059669' },
  full: { bg: '#FEE2E2', text: '#DC2626' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280' },
};

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['sessions', dateStr],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${dateStr}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDateChange = (days: number) => {
    setSelectedDate(prev => new Date(prev.getTime() + days * 86400000));
  };

  const renderItem = useCallback(({ item }: { item: Session }) => {
    const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.open;
    const enrollmentPercent = (item.enrolled / item.capacity) * 100;

    return (
      <View style={styles.sessionCard}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.durationText}>{item.duration}min</Text>
        </View>
        <View style={styles.contentColumn}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <Text style={styles.instructorText}>with {item.instructor}</Text>
          <View style={styles.enrollmentRow}>
            <Text style={styles.enrollmentText}>
              {item.enrolled}/{item.capacity}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: \`\${Math.min(enrollmentPercent, 100)}%\` },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.actionColumn}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
          {item.status === 'open' && (
            <TouchableOpacity style={styles.bookButton} activeOpacity={0.7}>
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Session) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Schedule</Text>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {sessions && sessions.length > 0 ? (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No sessions scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    minWidth: 120,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeColumn: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
    marginLeft: 16,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  instructorText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  enrollmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  enrollmentText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  actionColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Schedule Calendar
export function generateScheduleCalendar(options: ActivityCalendarOptions = {}): string {
  const { componentName = 'ScheduleCalendar', endpoint = '/schedule' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: string;
  color: string;
}

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  meeting: { bg: '#DBEAFE', border: '#3B82F6' },
  work: { bg: '#D1FAE5', border: '#10B981' },
  break: { bg: '#F3F4F6', border: '#6B7280' },
  event: { bg: '#EDE9FE', border: '#8B5CF6' },
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', dateStr],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${dateStr}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleDateChange = (days: number) => {
    setSelectedDate(prev => new Date(prev.getTime() + days * 86400000));
  };

  const getItemPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const top = ((startHour - 8) * 60 + startMin); // pixels from 8 AM
    const height = ((endHour - startHour) * 60 + (endMin - startMin));
    return { top, height };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scheduleContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.scheduleGrid}>
          {/* Time column */}
          <View style={styles.timeColumn}>
            {HOURS.map((hour) => (
              <View key={hour} style={styles.timeSlot}>
                <Text style={styles.timeText}>
                  {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                </Text>
              </View>
            ))}
          </View>

          {/* Events column */}
          <View style={styles.eventsColumn}>
            {/* Hour lines */}
            {HOURS.map((hour) => (
              <View
                key={hour}
                style={[styles.hourLine, { top: (hour - 8) * 60 }]}
              />
            ))}

            {/* Schedule items */}
            {schedule?.map((item: ScheduleItem) => {
              const position = getItemPosition(item.startTime, item.endTime);
              const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS.meeting;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.scheduleItem,
                    {
                      top: position.top,
                      height: position.height,
                      backgroundColor: typeColor.bg,
                      borderLeftColor: typeColor.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemTime}>
                    {item.startTime} - {item.endTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  scheduleContainer: {
    flex: 1,
  },
  scheduleGrid: {
    flexDirection: 'row',
    minHeight: HOURS.length * 60,
  },
  timeColumn: {
    width: 70,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  timeSlot: {
    height: 60,
    paddingRight: 8,
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  eventsColumn: {
    flex: 1,
    position: 'relative',
    minHeight: HOURS.length * 60,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  scheduleItem: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderLeftWidth: 4,
    borderRadius: 4,
    padding: 8,
    overflow: 'hidden',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}
