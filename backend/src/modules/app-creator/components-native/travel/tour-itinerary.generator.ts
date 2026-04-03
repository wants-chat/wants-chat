/**
 * Tour Itinerary Component Generator (React Native)
 *
 * Generates a tour itinerary display with:
 * - Day-by-day timeline
 * - Activities with icons and times
 * - Expandable day sections
 */

export interface TourItineraryOptions {
  componentName?: string;
}

export function generateTourItinerary(options: TourItineraryOptions = {}): string {
  const { componentName = 'TourItinerary' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Activity {
  time: string;
  name: string;
  type?: string;
  description?: string;
}

interface Day {
  title: string;
  description?: string;
  activities?: Activity[];
}

interface ${componentName}Props {
  days?: Day[];
  title?: string;
  expandedByDefault?: boolean;
}

const getActivityIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
  switch (type?.toLowerCase()) {
    case 'meal':
    case 'food':
    case 'lunch':
    case 'dinner':
    case 'breakfast':
      return 'restaurant';
    case 'photo':
    case 'photography':
      return 'camera';
    case 'break':
    case 'rest':
      return 'cafe';
    case 'transport':
    case 'travel':
      return 'bus';
    case 'activity':
    case 'adventure':
      return 'walk';
    case 'sightseeing':
    case 'visit':
      return 'eye';
    case 'shopping':
      return 'bag';
    default:
      return 'location';
  }
};

const DayItem: React.FC<{
  day: Day;
  dayNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}> = ({ day, dayNumber, isExpanded, onToggle, isLast }) => {
  return (
    <View style={styles.dayContainer}>
      {/* Timeline */}
      <View style={styles.timeline}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>{dayNumber}</Text>
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Content */}
      <View style={styles.dayContent}>
        <TouchableOpacity
          style={styles.dayHeader}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View style={styles.dayHeaderText}>
            <Text style={styles.dayTitle}>Day {dayNumber}: {day.title}</Text>
            {day.description && !isExpanded && (
              <Text style={styles.dayDescription} numberOfLines={1}>
                {day.description}
              </Text>
            )}
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.dayDetails}>
            {day.description && (
              <Text style={styles.dayDescriptionFull}>{day.description}</Text>
            )}

            {day.activities && day.activities.length > 0 && (
              <View style={styles.activitiesContainer}>
                {day.activities.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Ionicons
                        name={getActivityIcon(activity.type)}
                        size={16}
                        color="#3B82F6"
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <View style={styles.activityHeader}>
                        <View style={styles.activityTime}>
                          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                          <Text style={styles.activityTimeText}>{activity.time}</Text>
                        </View>
                      </View>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      {activity.description && (
                        <Text style={styles.activityDescription}>
                          {activity.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  days = [],
  title = 'Tour Itinerary',
  expandedByDefault = false,
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    expandedByDefault ? new Set(days.map((_, i) => i)) : new Set([0])
  );

  const toggleDay = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDays(newExpanded);
  };

  if (days.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No itinerary available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {days.map((day, index) => (
        <DayItem
          key={index}
          day={day}
          dayNumber={index + 1}
          isExpanded={expandedDays.has(index)}
          onToggle={() => toggleDay(index)}
          isLast={index === days.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  dayContainer: {
    flexDirection: 'row',
  },
  timeline: {
    alignItems: 'center',
    width: 40,
  },
  dayBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#DBEAFE',
    marginVertical: 4,
  },
  dayContent: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayHeaderText: {
    flex: 1,
    marginRight: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dayDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  dayDetails: {
    marginTop: 8,
  },
  dayDescriptionFull: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  activitiesContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityTimeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
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
