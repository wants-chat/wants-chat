/**
 * Appointment List Component Generator (React Native)
 *
 * Generates appointment list components with SectionList,
 * calendar date picker, and time slots grid.
 */

export interface AppointmentListOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateAppointmentList(options: AppointmentListOptions = {}): string {
  const {
    componentName = 'AppointmentList',
    endpoint = '/appointments',
    title = 'My Appointments',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  service_name?: string;
  service?: { name: string };
  date?: string;
  appointment_date?: string;
  time?: string;
  appointment_time?: string;
  staff_name?: string;
  staff?: { name: string };
  location?: string;
  status: string;
}

interface Section {
  title: string;
  data: Appointment[];
}

interface ${componentName}Props {
  title?: string;
  userScoped?: boolean;
  onAppointmentPress?: (appointment: Appointment) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  confirmed: { bg: '#D1FAE5', text: '#059669' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
  completed: { bg: '#DBEAFE', text: '#2563EB' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  userScoped = true,
  onAppointmentPress,
}) => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const groupAppointmentsByDate = (items: Appointment[]): Section[] => {
    const groups: Record<string, Appointment[]> = {};

    items.forEach((item) => {
      const dateStr = item.date || item.appointment_date || '';
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[formattedDate]) {
        groups[formattedDate] = [];
      }
      groups[formattedDate].push(item);
    });

    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  };

  const sections = appointments ? groupAppointmentsByDate(appointments) : [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const getStatusStyle = (status: string) => {
    const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#6B7280' };
    return {
      backgroundColor: colors.bg,
      color: colors.text,
    };
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const statusStyle = getStatusStyle(item.status);
    const serviceName = item.service_name || item.service?.name || 'Appointment';
    const time = item.time || item.appointment_time;
    const staffName = item.staff_name || item.staff?.name;

    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => onAppointmentPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          {time && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{time}</Text>
            </View>
          )}
          {staffName && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{staffName}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No appointments scheduled</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <SectionList
        sections={sections}
        renderItem={renderAppointmentItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appointmentCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
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
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
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

export function generateDatePicker(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'DatePicker';

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  onSelect?: (date: Date) => void;
  minDate?: Date;
  disabledDates?: Date[];
  selectedDate?: Date | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const ${componentName}: React.FC<${componentName}Props> = ({
  onSelect,
  minDate,
  disabledDates = [],
  selectedDate: externalSelectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(null);

  const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalSelectedDate;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, () => null);
    return [...padding, ...days];
  }, [year, month]);

  const handleSelect = (day: number) => {
    const date = new Date(year, month, day);
    if (isDisabled(day)) return;
    setInternalSelectedDate(date);
    onSelect?.(date);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day);
    if (minDate && date < minDate) return true;
    return disabledDates.some(
      (d) =>
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayStyle = (day: number | null) => {
    if (!day) return {};
    if (isSelected(day)) {
      return { backgroundColor: '#3B82F6' };
    }
    if (isToday(day)) {
      return { backgroundColor: '#DBEAFE' };
    }
    return {};
  };

  const getDayTextStyle = (day: number | null) => {
    if (!day) return {};
    if (isSelected(day)) {
      return { color: '#FFFFFF' };
    }
    if (isToday(day)) {
      return { color: '#3B82F6' };
    }
    if (isDisabled(day)) {
      return { color: '#D1D5DB' };
    }
    return { color: '#111827' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
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

      <View style={styles.daysGrid}>
        {calendarData.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            {day && (
              <TouchableOpacity
                style={[styles.dayButton, getDayStyle(day)]}
                onPress={() => handleSelect(day)}
                disabled={isDisabled(day)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayText, getDayTextStyle(day)]}>{day}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateTimeSlots(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'TimeSlots';

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  slots?: string[];
  selectedSlot?: string;
  onSelect?: (slot: string) => void;
  disabledSlots?: string[];
  title?: string;
  numColumns?: number;
}

const DEFAULT_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
];

const ${componentName}: React.FC<${componentName}Props> = ({
  slots = DEFAULT_SLOTS,
  selectedSlot,
  onSelect,
  disabledSlots = [],
  title = 'Available Times',
  numColumns = 3,
}) => {
  const isDisabled = (slot: string) => disabledSlots.includes(slot);

  const getSlotStyle = (slot: string) => {
    if (selectedSlot === slot) {
      return styles.slotSelected;
    }
    if (isDisabled(slot)) {
      return styles.slotDisabled;
    }
    return styles.slotDefault;
  };

  const getSlotTextStyle = (slot: string) => {
    if (selectedSlot === slot) {
      return styles.slotTextSelected;
    }
    if (isDisabled(slot)) {
      return styles.slotTextDisabled;
    }
    return styles.slotTextDefault;
  };

  // Calculate slot width based on number of columns
  const slotWidth = \`\${100 / numColumns - 2}%\`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color="#374151" />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.slotsGrid}>
        {slots.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.slot,
              { width: slotWidth },
              getSlotStyle(slot),
            ]}
            onPress={() => !isDisabled(slot) && onSelect?.(slot)}
            disabled={isDisabled(slot)}
            activeOpacity={0.7}
          >
            <Text style={[styles.slotText, getSlotTextStyle(slot)]}>
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotDefault: {
    backgroundColor: '#F3F4F6',
  },
  slotSelected: {
    backgroundColor: '#3B82F6',
  },
  slotDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  slotTextDefault: {
    color: '#374151',
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  slotTextDisabled: {
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}
