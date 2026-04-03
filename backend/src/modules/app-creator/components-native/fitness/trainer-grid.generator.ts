/**
 * Trainer Grid Component Generator (React Native)
 *
 * Generates trainer components including grid views and profile screens.
 * Features: FlatList for trainer cards, profile with certifications and schedule.
 */

export interface TrainerGridOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  numColumns?: number;
}

export function generateTrainerGrid(options: TrainerGridOptions = {}): string {
  const {
    componentName = 'TrainerGrid',
    endpoint = '/trainers',
    title = 'Our Trainers',
    numColumns = 2,
  } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Trainer {
  id: string;
  name: string;
  specialty?: string;
  avatar_url?: string;
  rating?: number;
  certifications?: string[];
}

interface ${componentName}Props {
  title?: string;
  onTrainerPress?: (trainer: Trainer) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = ${numColumns};
const CARD_WIDTH = (width - (CARD_MARGIN * (NUM_COLUMNS + 1) * 2)) / NUM_COLUMNS;

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  onTrainerPress,
}) => {
  const navigation = useNavigation();

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleTrainerPress = useCallback((trainer: Trainer) => {
    if (onTrainerPress) {
      onTrainerPress(trainer);
    } else {
      navigation.navigate('TrainerProfile' as never, { trainerId: trainer.id } as never);
    }
  }, [onTrainerPress, navigation]);

  const renderTrainerItem = useCallback(({ item }: { item: Trainer }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleTrainerPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={32} color="#3B82F6" />
          </View>
        )}
      </View>
      <Text style={styles.trainerName} numberOfLines={1}>
        {item.name}
      </Text>
      {item.specialty && (
        <Text style={styles.specialty} numberOfLines={1}>
          {item.specialty}
        </Text>
      )}
      {item.rating !== undefined && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      )}
      {item.certifications && item.certifications.length > 0 && (
        <View style={styles.certificationsBadge}>
          <Ionicons name="ribbon-outline" size={12} color="#6B7280" />
          <Text style={styles.certificationsText}>
            {item.certifications.length} certifications
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ), [handleTrainerPress]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No trainers found</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: Trainer) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={trainers}
        renderItem={renderTrainerItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN * 2,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  certificationsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  certificationsText: {
    fontSize: 12,
    color: '#6B7280',
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

export function generateTrainerProfile(
  options: { componentName?: string; endpoint?: string } = {}
): string {
  const { componentName = 'TrainerProfile', endpoint = '/trainers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

type RouteParams = {
  TrainerProfile: { trainerId: string };
};

interface TrainerData {
  id: string;
  name: string;
  specialty?: string;
  avatar_url?: string;
  rating?: number;
  reviews_count?: number;
  bio?: string;
  certifications?: string[];
  specialties?: string[];
  email?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
}

const ${componentName}: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'TrainerProfile'>>();
  const navigation = useNavigation();
  const { trainerId } = route.params;

  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer', trainerId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + trainerId);
      return response?.data || response;
    },
  });

  const handleViewClasses = () => {
    navigation.navigate('Classes' as never, { trainerId } as never);
  };

  const handleContact = async () => {
    if (trainer?.email) {
      await Linking.openURL('mailto:' + trainer.email);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!trainer) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Trainer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {trainer.avatar_url ? (
            <Image source={{ uri: trainer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.trainerName}>{trainer.name}</Text>
        {trainer.specialty && (
          <Text style={styles.specialty}>{trainer.specialty}</Text>
        )}
        {trainer.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FBBF24" />
            <Text style={styles.ratingText}>{trainer.rating.toFixed(1)}</Text>
            {trainer.reviews_count !== undefined && (
              <Text style={styles.reviewsCount}>
                ({trainer.reviews_count} reviews)
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.content}>
        {trainer.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{trainer.bio}</Text>
          </View>
        )}

        {trainer.certifications && trainer.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.tagsContainer}>
              {trainer.certifications.map((cert: string, i: number) => (
                <View key={i} style={styles.certificationTag}>
                  <Ionicons name="ribbon-outline" size={14} color="#F97316" />
                  <Text style={styles.certificationText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {trainer.specialties && trainer.specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.tagsContainer}>
              {trainer.specialties.map((spec: string, i: number) => (
                <View key={i} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewClasses}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>View Classes</Text>
          </TouchableOpacity>

          {trainer.email && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleContact}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {(trainer.instagram || trainer.twitter) && (
          <View style={styles.socialContainer}>
            {trainer.instagram && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://instagram.com/' + trainer.instagram)}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              </TouchableOpacity>
            )}
            {trainer.twitter && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://twitter.com/' + trainer.twitter)}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
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
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F97316',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewsCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certificationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  certificationText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '500',
  },
  specialtyTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  specialtyText: {
    fontSize: 14,
    color: '#4B5563',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
  },
});

export default ${componentName};
`;
}
