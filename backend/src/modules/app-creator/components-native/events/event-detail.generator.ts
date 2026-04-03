/**
 * Event Detail Component Generator for React Native
 *
 * Generates event detail components with:
 * - Event header with image, title, date, location
 * - Event schedule with sessions
 * - Venue information
 */

export interface EventDetailOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateEventHeader(options: EventDetailOptions = {}): string {
  const { componentName = 'EventHeader', endpoint = '/events' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [isFavorite, setIsFavorite] = React.useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Check out this event: \${event?.title}\`,
        title: event?.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Event not found</Text>
      </View>
    );
  }

  const eventDate = event.date ? new Date(event.date) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {event.image_url && (
        <Image
          source={{ uri: event.image_url }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            {event.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
            )}
            <Text style={styles.title}>{event.title}</Text>
            {event.organizer && (
              <Text style={styles.organizer}>Organized by {event.organizer}</Text>
            )}
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#EF4444' : '#6B7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoGrid}>
          {eventDate && (
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={24} color="#7C3AED" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          )}

          {event.time && (
            <View style={styles.infoCard}>
              <Ionicons name="time" size={24} color="#7C3AED" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </View>
            </View>
          )}

          {event.location && (
            <View style={styles.infoCard}>
              <Ionicons name="location" size={24} color="#7C3AED" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>
          )}

          {event.attendees_count !== undefined && (
            <View style={styles.infoCard}>
              <Ionicons name="people" size={24} color="#7C3AED" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoLabel}>Attendees</Text>
                <Text style={styles.infoValue}>{event.attendees_count} going</Text>
              </View>
            </View>
          )}
        </View>

        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  headerImage: {
    width: SCREEN_WIDTH,
    height: 250,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  organizer: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  infoGrid: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoCardContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
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

export function generateEventSchedule(options: EventDetailOptions = {}): string {
  const { componentName = 'EventSchedule', endpoint = '/event-schedule' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
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

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['event-schedule', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?event_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const renderSession = ({ item: session, index }: { item: any; index: number }) => {
    const getTypeStyle = () => {
      switch (session.type) {
        case 'break':
          return { bg: '#F3F4F6', text: '#6B7280' };
        case 'keynote':
          return { bg: '#F3E8FF', text: '#7C3AED' };
        default:
          return { bg: '#DBEAFE', text: '#3B82F6' };
      }
    };

    const typeStyle = getTypeStyle();

    return (
      <View style={styles.sessionCard}>
        <View style={styles.timeColumn}>
          <Text style={styles.startTime}>{session.start_time}</Text>
          {session.end_time && (
            <Text style={styles.endTime}>- {session.end_time}</Text>
          )}
        </View>
        <View style={styles.sessionContent}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          {session.description && (
            <Text style={styles.sessionDescription}>{session.description}</Text>
          )}
          <View style={styles.sessionMeta}>
            {session.speaker_name && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{session.speaker_name}</Text>
              </View>
            )}
            {session.location && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{session.location}</Text>
              </View>
            )}
            {session.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{session.duration}</Text>
              </View>
            )}
          </View>
        </View>
        {session.type && (
          <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
            <Text style={[styles.typeText, { color: typeStyle.text }]}>{session.type}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!schedule || schedule.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No schedule available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event Schedule</Text>
      </View>
      <FlatList
        data={schedule}
        renderItem={renderSession}
        keyExtractor={(item, index) => item.id || index.toString()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    position: 'relative',
  },
  timeColumn: {
    minWidth: 60,
    marginRight: 16,
  },
  startTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  endTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  typeBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
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

export function generateVenueInfo(options: EventDetailOptions = {}): string {
  const componentName = options.componentName || 'VenueInfo';

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    website?: string;
    image_url?: string;
    directions?: string;
    parking?: string;
    transit?: string;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ venue }) => {
  if (!venue) return null;

  const handlePhonePress = () => {
    if (venue.phone) {
      Linking.openURL(\`tel:\${venue.phone}\`);
    }
  };

  const handleWebsitePress = () => {
    if (venue.website) {
      Linking.openURL(venue.website);
    }
  };

  const handleDirections = () => {
    const address = encodeURIComponent(\`\${venue.address || ''} \${venue.city || ''}\`.trim());
    Linking.openURL(\`https://maps.google.com/?q=\${address}\`);
  };

  return (
    <View style={styles.container}>
      {venue.image_url && (
        <Image
          source={{ uri: venue.image_url }}
          style={styles.venueImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Venue</Text>

        {venue.name && (
          <Text style={styles.venueName}>{venue.name}</Text>
        )}

        <View style={styles.infoList}>
          {venue.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>{venue.address}</Text>
                {venue.city && <Text style={styles.infoText}>{venue.city}</Text>}
              </View>
            </View>
          )}

          {venue.phone && (
            <TouchableOpacity style={styles.infoRow} onPress={handlePhonePress}>
              <Ionicons name="call-outline" size={20} color="#3B82F6" />
              <Text style={[styles.infoText, styles.linkText]}>{venue.phone}</Text>
            </TouchableOpacity>
          )}

          {venue.website && (
            <TouchableOpacity style={styles.infoRow} onPress={handleWebsitePress}>
              <Ionicons name="globe-outline" size={20} color="#3B82F6" />
              <Text style={[styles.infoText, styles.linkText]}>Visit Website</Text>
            </TouchableOpacity>
          )}
        </View>

        {(venue.parking || venue.transit) && (
          <View style={styles.gettingThereSection}>
            <Text style={styles.subSectionTitle}>Getting There</Text>

            {venue.parking && (
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{venue.parking}</Text>
              </View>
            )}

            {venue.transit && (
              <View style={styles.infoRow}>
                <Ionicons name="train-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{venue.transit}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
          <Ionicons name="navigate-outline" size={20} color="#6B7280" />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </TouchableOpacity>
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
    margin: 16,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoList: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    color: '#3B82F6',
  },
  gettingThereSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
});

export default ${componentName};
`;
}
