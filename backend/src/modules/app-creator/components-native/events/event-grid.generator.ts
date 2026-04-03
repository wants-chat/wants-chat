/**
 * Event Grid Component Generator for React Native
 *
 * Generates event grid components with:
 * - FlatList with event cards
 * - TouchableOpacity for navigation
 * - Image, Text, date/location info
 * - Category filters
 */

export interface EventGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateEventGrid(options: EventGridOptions = {}): string {
  const { componentName = 'EventGrid', endpoint = '/events' } = options;

  return `import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  category?: string;
  date?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category, date }) => {
  const navigation = useNavigation();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', category, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (date) params.append('date', date);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleEventPress = useCallback((event: any) => {
    const eventId = event.id || event._id;
    navigation.navigate('EventDetail' as never, { id: eventId } as never);
  }, [navigation]);

  const renderEvent = useCallback(({ item }: { item: any }) => {
    const eventDate = item.date ? new Date(item.date) : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.7}
      >
        {item.image_url && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.eventImage}
              resizeMode="cover"
            />
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            {eventDate && (
              <View style={styles.dateBox}>
                <Text style={styles.dateMonth}>
                  {eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
              </View>
            )}
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.organizer && (
                <Text style={styles.organizerText}>by {item.organizer}</Text>
              )}
            </View>
          </View>

          <View style={styles.detailsContainer}>
            {item.time && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
            )}
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
              </View>
            )}
            {item.attendees_count !== undefined && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{item.attendees_count} attending</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            {item.price !== undefined && (
              <Text style={styles.priceText}>
                {item.price === 0 ? 'Free' : \`$\${item.price}\`}
              </Text>
            )}
            <View style={styles.ticketButton}>
              <Ionicons name="ticket-outline" size={16} color="#7C3AED" />
              <Text style={styles.ticketButtonText}>Get Tickets</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleEventPress]);

  const keyExtractor = useCallback((item: any) => (item.id || item._id)?.toString(), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load events.</Text>
      </View>
    );
  }

  if (!events || events.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No events found</Text>
        <Text style={styles.emptySubtitle}>Check back later for new events.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
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
  listContent: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 50,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6D28D9',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  organizerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  ticketButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateEventFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'EventFilters';

  return `import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  date: Date | null;
  onDateChange: (value: Date | null) => void;
  categories?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  date,
  onDateChange,
  categories = ['All', 'Conference', 'Workshop', 'Concert', 'Festival', 'Sports', 'Networking', 'Webinar'],
}) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={onSearchChange}
          />
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <Text style={styles.dateButtonText}>
            {date ? date.toLocaleDateString() : 'Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => {
          const isSelected = (cat === 'All' && !category) || category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => onCategoryChange(cat === 'All' ? '' : cat)}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    margin: 16,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  categoriesContainer: {
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#7C3AED',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
