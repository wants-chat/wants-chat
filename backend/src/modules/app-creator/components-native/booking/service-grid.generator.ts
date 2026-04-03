/**
 * Service Grid Component Generator (React Native)
 *
 * Generates a FlatList grid of bookable services and staff members.
 */

export interface ServiceGridOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  numColumns?: number;
}

export function generateServiceGrid(options: ServiceGridOptions = {}): string {
  const {
    componentName = 'ServiceGrid',
    endpoint = '/services',
    title = 'Our Services',
    numColumns = 2,
  } = options;

  return `import React from 'react';
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

interface Service {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  duration?: number;
  price?: number;
}

interface ${componentName}Props {
  title?: string;
  limit?: number;
  onServicePress?: (service: Service) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = ${numColumns};
const CARD_WIDTH = (width - (CARD_MARGIN * (NUM_COLUMNS + 1) * 2)) / NUM_COLUMNS;

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  limit,
  onServicePress,
}) => {
  const navigation = useNavigation();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleServicePress = (service: Service) => {
    if (onServicePress) {
      onServicePress(service);
    } else {
      navigation.navigate('ServiceDetail' as never, { serviceId: service.id } as never);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.7}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="briefcase-outline" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.durationText}>{item.duration || 30} min</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>\${item.price || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No services available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
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

export function generateStaffGrid(
  options: { componentName?: string; endpoint?: string; title?: string; numColumns?: number } = {}
): string {
  const {
    componentName = 'StaffGrid',
    endpoint = '/staff',
    title = 'Our Team',
    numColumns = 2,
  } = options;

  return `import React from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface StaffMember {
  id: string;
  name: string;
  title?: string;
  role?: string;
  avatar_url?: string;
  rating?: number;
}

interface ${componentName}Props {
  title?: string;
  onStaffPress?: (staff: StaffMember) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = ${numColumns};
const CARD_WIDTH = (width - (CARD_MARGIN * (NUM_COLUMNS + 1) * 2)) / NUM_COLUMNS;

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  onStaffPress,
}) => {
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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

  const renderStaffItem = ({ item }: { item: StaffMember }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onStaffPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {(item.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.staffName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.staffRole} numberOfLines={1}>
        {item.title || item.role || ''}
      </Text>
      {item.rating && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No staff members found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={staff}
        renderItem={renderStaffItem}
        keyExtractor={(item) => item.id}
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
    paddingVertical: 16,
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
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  staffRole: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
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
