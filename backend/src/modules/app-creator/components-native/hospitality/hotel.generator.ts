/**
 * Hotel Management Component Generators (React Native)
 *
 * Generates components for hotel property management including:
 * - HotelStats, RoomFiltersHotel, RoomCalendar, RoomStatusOverview
 * - GuestProfileHotel, GuestStats, HousekeepingBoard, OccupancyChart
 */

export interface HotelOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateHotelStats(options: HotelOptions = {}): string {
  const { componentName = 'HotelStats', endpoint = '/hotel/stats' } = options;

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
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hotel-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch hotel stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statItems = [
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: 'bed-outline', color: '#3B82F6', format: (v: number) => \`\${v || 0}%\` },
    { key: 'totalGuests', label: 'Active Guests', icon: 'people-outline', color: '#10B981', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'availableRooms', label: 'Available Rooms', icon: 'business-outline', color: '#8B5CF6', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'todayRevenue', label: "Today's Revenue", icon: 'cash-outline', color: '#059669', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'checkInsToday', label: 'Check-ins Today', icon: 'calendar-outline', color: '#F97316', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'checkOutsToday', label: 'Check-outs Today', icon: 'calendar-outline', color: '#EF4444', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'avgRating', label: 'Avg Guest Rating', icon: 'star-outline', color: '#EAB308', format: (v: number) => (v || 0).toFixed(1) },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'trending-up-outline', color: '#6366F1', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statItems.map((stat) => {
          const value = stats?.[stat.key];
          const change = stats?.[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                {change !== undefined && (
                  <View style={styles.changeContainer}>
                    <Ionicons
                      name={change >= 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={change >= 0 ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[styles.changeText, { color: change >= 0 ? '#10B981' : '#EF4444' }]}>
                      {Math.abs(change)}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{stat.format(value)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateRoomFiltersHotel(options: HotelOptions = {}): string {
  const { componentName = 'RoomFiltersHotel' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RoomFilters {
  search: string;
  status: string;
  roomType: string;
  floor: string;
  priceRange: { min: number; max: number };
  capacity: string;
}

interface ${componentName}Props {
  onFilterChange?: (filters: RoomFilters) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    status: '',
    roomType: '',
    floor: '',
    priceRange: { min: 0, max: 1000 },
    capacity: '',
  });

  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const handleChange = (key: keyof RoomFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential', 'Penthouse', 'Family'];
  const statuses = ['available', 'occupied', 'maintenance', 'cleaning', 'reserved'];
  const floors = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const capacities = ['1', '2', '3', '4', '5+'];

  const renderFilterSection = (
    title: string,
    key: string,
    options: string[],
    currentValue: string,
    filterKey: keyof RoomFilters
  ) => (
    <View style={styles.filterSection}>
      <TouchableOpacity
        style={styles.filterHeader}
        onPress={() => setExpandedFilter(expandedFilter === key ? null : key)}
      >
        <Text style={styles.filterTitle}>{title}</Text>
        <Ionicons
          name={expandedFilter === key ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      {expandedFilter === key && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, !currentValue && styles.optionButtonActive]}
            onPress={() => handleChange(filterKey, '')}
          >
            <Text style={[styles.optionText, !currentValue && styles.optionTextActive]}>All</Text>
          </TouchableOpacity>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, currentValue === option && styles.optionButtonActive]}
              onPress={() => handleChange(filterKey, option)}
            >
              <Text style={[styles.optionText, currentValue === option && styles.optionTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="filter-outline" size={20} color="#6B7280" />
        <Text style={styles.headerTitle}>Filter Rooms</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Room number, guest name..."
          value={filters.search}
          onChangeText={(text) => handleChange('search', text)}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {renderFilterSection('Room Status', 'status', statuses, filters.status, 'status')}
      {renderFilterSection('Room Type', 'roomType', roomTypes, filters.roomType, 'roomType')}
      {renderFilterSection('Floor', 'floor', floors, filters.floor, 'floor')}
      {renderFilterSection('Capacity', 'capacity', capacities, filters.capacity, 'capacity')}

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          const resetFilters: RoomFilters = {
            search: '',
            status: '',
            roomType: '',
            floor: '',
            priceRange: { min: 0, max: 1000 },
            capacity: '',
          };
          setFilters(resetFilters);
          onFilterChange?.(resetFilters);
        }}
      >
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterSection: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  optionButtonActive: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateRoomCalendar(options: HotelOptions = {}): string {
  const { componentName = 'RoomCalendar', endpoint = '/hotel/rooms/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  roomId?: string;
  onDateSelect?: (date: Date, room?: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ roomId, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['room-calendar', roomId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(roomId ? { room_id: roomId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch room calendar:', err);
        return [];
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const getBookingsForDate = (date: Date) => {
    return bookings?.filter((booking: any) => {
      const checkIn = new Date(booking.check_in || booking.checkIn || booking.start_date);
      const checkOut = new Date(booking.check_out || booking.checkOut || booking.end_date);
      return date >= checkIn && date <= checkOut;
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
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
        <View style={styles.titleContainer}>
          <Ionicons name="bed-outline" size={20} color="#3B82F6" />
          <Text style={styles.title}>Room Availability Calendar</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.daysGrid}>
          {calendarDays.map((day, idx) => {
            const dayBookings = getBookingsForDate(day.date);
            const hasBookings = dayBookings.length > 0;
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellInactive,
                  isToday(day.date) && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                  hasBookings && styles.dayCellBooked,
                ]}
                onPress={() => handleDateClick(day.date)}
              >
                <Text style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberInactive,
                  isToday(day.date) && styles.dayNumberToday,
                ]}>
                  {day.date.getDate()}
                </Text>
                {hasBookings && (
                  <View style={styles.bookingIndicator}>
                    <Text style={styles.bookingCount}>{dayBookings.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEE2E2' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { borderWidth: 2, borderColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 150,
    textAlign: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellInactive: {
    opacity: 0.4,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  dayCellSelected: {
    backgroundColor: '#DBEAFE',
  },
  dayCellBooked: {
    backgroundColor: '#FEE2E2',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dayNumberInactive: {
    color: '#9CA3AF',
  },
  dayNumberToday: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  bookingIndicator: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bookingCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateRoomStatusOverview(options: HotelOptions = {}): string {
  const { componentName = 'RoomStatusOverview', endpoint = '/hotel/rooms/status' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  floor?: string;
  onRoomClick?: (room: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ floor, onRoomClick }) => {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['room-status', floor],
    queryFn: async () => {
      try {
        const params = floor ? \`?floor=\${floor}\` : '';
        const response = await api.get<any>(\`${endpoint}\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch room status:', err);
        return [];
      }
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; bgColor: string; textColor: string }> = {
      available: { icon: 'checkmark-circle', bgColor: '#D1FAE5', textColor: '#059669' },
      occupied: { icon: 'people', bgColor: '#FEE2E2', textColor: '#DC2626' },
      reserved: { icon: 'time', bgColor: '#FEF3C7', textColor: '#D97706' },
      cleaning: { icon: 'sparkles', bgColor: '#DBEAFE', textColor: '#2563EB' },
      maintenance: { icon: 'construct', bgColor: '#F3F4F6', textColor: '#6B7280' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const statusCounts = rooms?.reduce((acc: Record<string, number>, room: any) => {
    const status = room.status?.toLowerCase() || 'available';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderStatusSummary = () => (
    <View style={styles.summaryContainer}>
      {['available', 'occupied', 'reserved', 'cleaning', 'maintenance'].map((status) => {
        const config = getStatusConfig(status);
        return (
          <View key={status} style={[styles.summaryCard, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon as any} size={20} color={config.textColor} />
            <Text style={[styles.summaryCount, { color: config.textColor }]}>
              {statusCounts[status] || 0}
            </Text>
            <Text style={[styles.summaryLabel, { color: config.textColor }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderRoomItem = ({ item }: { item: any }) => {
    const config = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        style={[styles.roomCard, { backgroundColor: config.bgColor }]}
        onPress={() => onRoomClick?.(item)}
      >
        <View style={styles.roomHeader}>
          <Text style={[styles.roomNumber, { color: config.textColor }]}>
            {item.room_number || item.number}
          </Text>
          <Ionicons name={config.icon as any} size={18} color={config.textColor} />
        </View>
        <Text style={[styles.roomType, { color: config.textColor }]}>
          {item.room_type || item.type || 'Standard'}
        </Text>
        {item.guest_name && (
          <Text style={styles.guestName} numberOfLines={1}>{item.guest_name}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderStatusSummary()}

      <View style={styles.gridHeader}>
        <Ionicons name="bed-outline" size={20} color="#6B7280" />
        <Text style={styles.gridTitle}>Room Grid</Text>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.id || item.room_number}
        numColumns={4}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms found</Text>
          </View>
        }
      />
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
    paddingVertical: 48,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: '18%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  gridContent: {
    padding: 8,
  },
  roomCard: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: '23%',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomType: {
    fontSize: 10,
  },
  guestName: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateGuestProfileHotel(options: HotelOptions = {}): string {
  const { componentName = 'GuestProfileHotel', endpoint = '/hotel/guests' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  guestId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ guestId: propGuestId }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const guestId = propGuestId || (route.params as any)?.id;

  const { data: guest, isLoading } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${guestId}\`);
      return response?.data || response;
    },
    enabled: !!guestId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!guest) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Guest not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#6B7280" />
        <Text style={styles.backText}>Back to Guests</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {guest.avatar_url || guest.photo ? (
              <Image source={{ uri: guest.avatar_url || guest.photo }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.guestName}>
              {guest.name || \`\${guest.first_name || ''} \${guest.last_name || ''}\`.trim()}
            </Text>
            <View style={styles.badgeRow}>
              {guest.vip && (
                <View style={styles.vipBadge}>
                  <Ionicons name="star" size={12} color="#854D0E" />
                  <Text style={styles.vipText}>VIP Guest</Text>
                </View>
              )}
              {guest.loyalty_tier && (
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>{guest.loyalty_tier}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>
        {guest.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{guest.email}</Text>
          </View>
        )}
        {guest.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{guest.phone}</Text>
          </View>
        )}
        {(guest.address || guest.city || guest.country) && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              {[guest.address, guest.city, guest.country].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bed-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Current Stay</Text>
        </View>
        {guest.current_room && (
          <View style={styles.infoRow}>
            <Ionicons name="bed-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>Room {guest.current_room}</Text>
          </View>
        )}
        {guest.check_in_date && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              Check-in: {new Date(guest.check_in_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        {guest.check_out_date && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              Check-out: {new Date(guest.check_out_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>{guest.total_stays || 0}</Text>
          <Text style={styles.statLabel}>Total Stays</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{guest.total_nights || 0}</Text>
          <Text style={styles.statLabel}>Total Nights</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={[styles.statValue, { color: '#7C3AED' }]}>\${(guest.total_spent || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{guest.loyalty_points || 0}</Text>
          <Text style={styles.statLabel}>Loyalty Points</Text>
        </View>
      </View>

      {guest.preferences && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Guest Preferences</Text>
          </View>
          <View style={styles.preferencesRow}>
            {(Array.isArray(guest.preferences) ? guest.preferences : [guest.preferences]).map((pref: string, i: number) => (
              <View key={i} style={styles.preferenceTag}>
                <Text style={styles.preferenceText}>{pref}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {guest.notes && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Text style={styles.notesText}>{guest.notes}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerCard: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#854D0E',
  },
  tierBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  preferencesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  preferenceText: {
    fontSize: 14,
    color: '#374151',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default ${componentName};
`;
}

export function generateGuestStats(options: HotelOptions = {}): string {
  const { componentName = 'GuestStats', endpoint = '/hotel/guests/stats' } = options;

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

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['guest-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch guest stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statItems = [
    { key: 'totalGuests', label: 'Total Guests', icon: 'people-outline', color: '#3B82F6', value: stats?.totalGuests || 0 },
    { key: 'newGuestsToday', label: 'New Today', icon: 'person-add-outline', color: '#10B981', value: stats?.newGuestsToday || 0 },
    { key: 'returningGuests', label: 'Returning Guests', icon: 'checkmark-circle-outline', color: '#8B5CF6', value: stats?.returningGuests || 0 },
    { key: 'vipGuests', label: 'VIP Guests', icon: 'star-outline', color: '#F59E0B', value: stats?.vipGuests || 0 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsGrid}>
        {statItems.map((stat) => (
          <View key={stat.key} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.value.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="globe-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Top Nationalities</Text>
        </View>
        {(stats?.topNationalities || []).slice(0, 5).map((item: any, i: number) => (
          <View key={i} style={styles.nationalityRow}>
            <Text style={styles.nationalityName}>{item.country || item.nationality}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  { width: \`\${(item.count / (stats?.totalGuests || 1)) * 100}%\` },
                ]}
              />
            </View>
            <Text style={styles.countText}>{item.count}</Text>
          </View>
        ))}
        {(!stats?.topNationalities || stats.topNationalities.length === 0) && (
          <Text style={styles.emptyText}>No data available</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Guest Trends</Text>
        </View>
        <View style={styles.trendRow}>
          <Text style={styles.trendLabel}>Avg. Stay Duration</Text>
          <Text style={styles.trendValue}>{stats?.avgStayDuration || 0} nights</Text>
        </View>
        <View style={styles.trendRow}>
          <Text style={styles.trendLabel}>Repeat Guest Rate</Text>
          <Text style={styles.trendValue}>{stats?.repeatGuestRate || 0}%</Text>
        </View>
        <View style={styles.trendRow}>
          <Text style={styles.trendLabel}>Avg. Guest Rating</Text>
          <Text style={styles.trendValue}>{stats?.avgGuestRating || 0}/5</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  nationalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nationalityName: {
    width: 80,
    fontSize: 14,
    color: '#374151',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  countText: {
    width: 40,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#374151',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default ${componentName};
`;
}

export function generateHousekeepingBoard(options: HotelOptions = {}): string {
  const { componentName = 'HousekeepingBoard', endpoint = '/hotel/housekeeping' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'inspected';

const ${componentName}: React.FC<${componentName}Props> = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['housekeeping-tasks', selectedStatus],
    queryFn: async () => {
      try {
        const params = selectedStatus !== 'all' ? \`?status=\${selectedStatus}\` : '';
        const response = await api.get<any>(\`${endpoint}\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch housekeeping tasks:', err);
        return [];
      }
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      return api.put(\`${endpoint}/\${taskId}\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; bgColor: string; textColor: string; label: string }> = {
      pending: { icon: 'time-outline', bgColor: '#FEF3C7', textColor: '#D97706', label: 'Pending' },
      in_progress: { icon: 'sparkles-outline', bgColor: '#DBEAFE', textColor: '#2563EB', label: 'In Progress' },
      completed: { icon: 'checkmark-circle-outline', bgColor: '#D1FAE5', textColor: '#059669', label: 'Completed' },
      inspected: { icon: 'checkmark-done-outline', bgColor: '#F3E8FF', textColor: '#7C3AED', label: 'Inspected' },
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#10B981',
    };
    return colors[priority?.toLowerCase()] || '#9CA3AF';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const statusTabs: { key: TaskStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Done' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderTaskItem = ({ item }: { item: any }) => {
    const config = getStatusConfig(item.status);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <View style={[styles.taskCard, { borderLeftColor: priorityColor }]}>
        <View style={styles.taskHeader}>
          <View style={styles.roomInfo}>
            <Ionicons name="bed-outline" size={18} color="#6B7280" />
            <Text style={styles.roomNumber}>Room {item.room_number || item.roomNumber}</Text>
          </View>
          {item.priority && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {item.priority}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.taskType}>{item.task_type || item.type || 'General Cleaning'}</Text>

        {item.assigned_to && (
          <View style={styles.assignedRow}>
            <Ionicons name="person-outline" size={16} color="#9CA3AF" />
            <Text style={styles.assignedText}>{item.assigned_to}</Text>
          </View>
        )}

        <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon as any} size={16} color={config.textColor} />
          <Text style={[styles.statusText, { color: config.textColor }]}>{config.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles-outline" size={24} color="#3B82F6" />
        <Text style={styles.title}>Housekeeping Board</Text>
      </View>

      <View style={styles.tabsContainer}>
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedStatus === tab.key && styles.tabActive]}
            onPress={() => setSelectedStatus(tab.key)}
          >
            <Text style={[styles.tabText, selectedStatus === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        }
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  taskType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  assignedText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
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

export function generateOccupancyChart(options: HotelOptions = {}): string {
  const { componentName = 'OccupancyChart', endpoint = '/hotel/occupancy' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ['occupancy-data', period, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          period,
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { data: [], summary: {} };
      } catch (err) {
        console.error('Failed to fetch occupancy data:', err);
        return { data: [], summary: {} };
      }
    },
  });

  const navigatePrev = () => {
    if (period === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else if (period === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    }
  };

  const navigateNext = () => {
    if (period === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else if (period === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    }
  };

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const chartData = data?.data || [];
  const maxValue = Math.max(...chartData.map((d: any) => d.occupancy || d.rate || 0), 100);

  const getBarColor = (value: number) => {
    if (value >= 80) return '#10B981';
    if (value >= 50) return '#3B82F6';
    return '#F59E0B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="bar-chart-outline" size={20} color="#3B82F6" />
          <Text style={styles.title}>Occupancy Overview</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.periodTabs}>
            {(['week', 'month', 'year'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, period === p && styles.periodTabActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.navigation}>
            <TouchableOpacity onPress={navigatePrev} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.dateText}>
              {period === 'year' ? currentDate.getFullYear() : \`\${MONTHS[currentDate.getMonth()]} \${currentDate.getFullYear()}\`}
            </Text>
            <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={styles.summaryLabel}>Avg. Occupancy</Text>
          <Text style={[styles.summaryValue, { color: '#2563EB' }]}>{data?.summary?.avgOccupancy || 0}%</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.summaryLabel}>Peak Occupancy</Text>
          <Text style={[styles.summaryValue, { color: '#059669' }]}>{data?.summary?.peakOccupancy || 0}%</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={styles.summaryLabel}>RevPAR</Text>
          <Text style={[styles.summaryValue, { color: '#7C3AED' }]}>\${data?.summary?.revpar || 0}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartContainer}>
        <View style={styles.chart}>
          {chartData.length > 0 ? chartData.map((item: any, index: number) => {
            const value = item.occupancy || item.rate || 0;
            const height = (value / maxValue) * 150;

            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height, backgroundColor: getBarColor(value) },
                    ]}
                  />
                  <Text style={styles.barValue}>{value}%</Text>
                </View>
                <Text style={styles.barLabel}>{item.label || item.date || index + 1}</Text>
              </View>
            );
          }) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>No occupancy data available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>High (80%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Medium (50-79%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Low (&lt;50%)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  periodTabActive: {
    backgroundColor: '#3B82F6',
  },
  periodTabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  periodTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
    minWidth: 100,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    paddingHorizontal: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    gap: 8,
  },
  barContainer: {
    alignItems: 'center',
    width: 40,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 160,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 200,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    padding: 16,
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
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
