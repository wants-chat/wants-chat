/**
 * Club Component Generators for React Native
 *
 * Generates club membership components with:
 * - Member filters
 * - Member profile
 * - Event calendar
 */

export interface ClubOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMemberFiltersClub(options: ClubOptions = {}): string {
  const { componentName = 'MemberFiltersClub' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  membershipType: string;
  onMembershipTypeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  joinedAfter: Date | null;
  onJoinedAfterChange: (value: Date | null) => void;
  membershipTypes?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  membershipType,
  onMembershipTypeChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  joinedAfter,
  onJoinedAfterChange,
  membershipTypes = ['All', 'Basic', 'Premium', 'VIP', 'Lifetime', 'Student', 'Corporate'],
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'joined_desc', label: 'Recently Joined' },
    { value: 'joined_asc', label: 'Oldest Members' },
    { value: 'visits_desc', label: 'Most Active' },
    { value: 'expiry_asc', label: 'Expiring Soon' },
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onJoinedAfterChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members by name or email..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStatusPicker(true)}
        >
          <Ionicons name="funnel-outline" size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>
            {statusOptions.find((s) => s.value === status)?.label || 'Status'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>
            {joinedAfter ? \`After \${joinedAfter.toLocaleDateString()}\` : 'Joined'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortPicker(true)}
        >
          <Ionicons name="swap-vertical-outline" size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typesContainer}
      >
        {membershipTypes.map((type) => {
          const isSelected = (type === 'All' && !membershipType) || membershipType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, isSelected && styles.typeChipSelected]}
              onPress={() => onMembershipTypeChange(type === 'All' ? '' : type)}
            >
              <Ionicons
                name="people"
                size={14}
                color={isSelected ? '#FFFFFF' : '#6B7280'}
                style={styles.typeIcon}
              />
              <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={joinedAfter || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Modal visible={showStatusPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowStatusPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  onStatusChange(option.value);
                  setShowStatusPicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  status === option.value && styles.modalOptionTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showSortPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowSortPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  onSortByChange(option.value);
                  setShowSortPicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.value && styles.modalOptionTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  typesContainer: {
    paddingVertical: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: '#14B8A6',
  },
  typeIcon: {
    marginRight: 6,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#14B8A6',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export function generateMemberProfileClub(options: ClubOptions = {}): string {
  const { componentName = 'MemberProfileClub', endpoint = '/club/members' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: member, isLoading } = useQuery({
    queryKey: ['club-member', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Member not found</Text>
      </View>
    );
  }

  const getMembershipStyle = () => {
    switch (member.membership_type) {
      case 'VIP':
      case 'Lifetime':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Premium':
        return { bg: '#F3E8FF', text: '#7C3AED' };
      default:
        return { bg: '#D1FAE5', text: '#059669' };
    }
  };

  const membershipStyle = getMembershipStyle();
  const memberSince = member.member_since ? new Date(member.member_since) : null;
  const expiryDate = member.expiry_date ? new Date(member.expiry_date) : null;
  const isExpired = expiryDate && expiryDate < new Date();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <View style={styles.headerBg} />
        <View style={styles.profileSection}>
          {member.avatar_url ? (
            <Image
              source={{ uri: member.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color="#14B8A6" />
            </View>
          )}
          <View style={styles.nameSection}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
          </View>
          <View style={[styles.membershipBadge, { backgroundColor: membershipStyle.bg }]}>
            <Text style={[styles.membershipText, { color: membershipStyle.text }]}>
              {member.membership_type || 'Basic'} Member
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoList}>
            {member.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{member.email}</Text>
                </View>
              </View>
            )}
            {member.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{member.phone}</Text>
                </View>
              </View>
            )}
            {member.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{member.address}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Membership Details</Text>
          <View style={styles.infoList}>
            {memberSince && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {memberSince.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </View>
              </View>
            )}
            {expiryDate && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Membership Expires</Text>
                  <Text style={[styles.infoValue, isExpired && styles.expiredText]}>
                    {expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </View>
              </View>
            )}
            {member.member_id && (
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member ID</Text>
                  <Text style={[styles.infoValue, styles.monoText]}>{member.member_id}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="pulse" size={24} color="#059669" />
          </View>
          <Text style={styles.statLabel}>Total Visits</Text>
          <Text style={styles.statValue}>{member.total_visits || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="calendar" size={24} color="#7C3AED" />
          </View>
          <Text style={styles.statLabel}>Events Attended</Text>
          <Text style={styles.statValue}>{member.events_attended || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={24} color="#D97706" />
          </View>
          <Text style={styles.statLabel}>Loyalty Points</Text>
          <Text style={styles.statValue}>{(member.loyalty_points || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="trophy" size={24} color="#16A34A" />
          </View>
          <Text style={styles.statLabel}>Achievements</Text>
          <Text style={styles.statValue}>{member.achievements_count || 0}</Text>
        </View>
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
    minHeight: 200,
  },
  headerSection: {
    position: 'relative',
  },
  headerBg: {
    height: 120,
    backgroundColor: '#14B8A6',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  memberName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  membershipBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardRow: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoList: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  expiredText: {
    color: '#DC2626',
  },
  monoText: {
    fontFamily: 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    paddingBottom: 24,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
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

export function generateEventCalendarClub(options: ClubOptions = {}): string {
  const { componentName = 'EventCalendarClub', endpoint = '/club/events' } = options;

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['club-events', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: currentDate.getFullYear().toString(),
        month: (currentDate.getMonth() + 1).toString(),
      });
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const getEventsForDay = useCallback((day: number) => {
    if (!events) return [];
    return events.filter((event: any) => {
      const eventDate = new Date(event.date || event.start_date);
      return eventDate.getDate() === day;
    });
  }, [events]);

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'members_only':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'special':
        return { bg: '#F3E8FF', text: '#7C3AED' };
      default:
        return { bg: '#DBEAFE', text: '#3B82F6' };
    }
  };

  const handleEventPress = useCallback((event: any) => {
    navigation.navigate('EventDetail' as never, { id: event.id } as never);
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color="#14B8A6" />
          <Text style={styles.headerTitle}>Club Events</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarSection}>
        <View style={styles.weekdaysRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: calendarData.firstDayOfMonth }).map((_, i) => (
            <View key={\`empty-\${i}\`} style={styles.dayCell} />
          ))}
          {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = new Date().toDateString() ===
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const isSelected = selectedDay === day;

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  isToday && styles.dayTextToday,
                  isSelected && styles.dayTextSelected,
                ]}>
                  {day}
                </Text>
                {dayEvents.slice(0, 2).map((event: any, idx: number) => {
                  const eventStyle = getEventTypeStyle(event.type);
                  return (
                    <View key={event.id || idx} style={[styles.eventDot, { backgroundColor: eventStyle.bg }]}>
                      <Text style={[styles.eventDotText, { color: eventStyle.text }]} numberOfLines={1}>
                        {event.title || event.name}
                      </Text>
                    </View>
                  );
                })}
                {dayEvents.length > 2 && (
                  <Text style={styles.moreText}>+{dayEvents.length - 2}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedDay && (
        <View style={styles.eventsSection}>
          <Text style={styles.eventsSectionTitle}>
            Events on {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}
          </Text>
          {selectedDayEvents.length > 0 ? (
            <FlatList
              data={selectedDayEvents}
              renderItem={({ item: event }) => {
                const eventStyle = getEventTypeStyle(event.type);
                return (
                  <TouchableOpacity
                    style={styles.eventCard}
                    onPress={() => handleEventPress(event)}
                  >
                    <View style={[styles.eventIcon, { backgroundColor: eventStyle.bg }]}>
                      <Ionicons name="calendar" size={16} color={eventStyle.text} />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title || event.name}</Text>
                      <View style={styles.eventMeta}>
                        {event.time && (
                          <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={12} color="#6B7280" />
                            <Text style={styles.metaText}>{event.time}</Text>
                          </View>
                        )}
                        {event.attendees_count !== undefined && (
                          <View style={styles.metaItem}>
                            <Ionicons name="people-outline" size={12} color="#6B7280" />
                            <Text style={styles.metaText}>{event.attendees_count} attending</Text>
                          </View>
                        )}
                        {event.location && (
                          <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={12} color="#6B7280" />
                            <Text style={styles.metaText}>{event.location}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {event.price !== undefined && (
                      <View style={[
                        styles.priceBadge,
                        { backgroundColor: event.price === 0 ? '#D1FAE5' : '#F3F4F6' },
                      ]}>
                        <Text style={[
                          styles.priceText,
                          { color: event.price === 0 ? '#059669' : '#6B7280' },
                        ]}>
                          {event.price === 0 ? 'Free' : \`$\${event.price}\`}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={styles.eventSeparator} />}
            />
          ) : (
            <Text style={styles.noEventsText}>No events scheduled for this day</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  calendarSection: {
    padding: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 70,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#D1FAE5',
    borderColor: '#14B8A6',
  },
  dayCellToday: {
    backgroundColor: '#F0FDFA',
    borderColor: '#5EEAD4',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dayTextToday: {
    color: '#14B8A6',
  },
  dayTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  eventDot: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
  },
  eventDotText: {
    fontSize: 7,
  },
  moreText: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },
  eventsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  eventsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventSeparator: {
    height: 8,
  },
  noEventsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default ${componentName};
`;
}
