/**
 * Destination Grid Component Generator (React Native)
 *
 * Generates a grid of travel destinations with:
 * - FlatList with numColumns for destinations
 * - Image, location, rating display
 * - Navigation to destination detail
 */

export interface DestinationGridOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  numColumns?: number;
}

export function generateDestinationGrid(options: DestinationGridOptions = {}): string {
  const {
    componentName = 'DestinationGrid',
    endpoint = '/destinations',
    title = 'Popular Destinations',
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

interface Destination {
  id: string;
  name: string;
  country: string;
  image?: string;
  image_url?: string;
  rating?: number;
  description?: string;
}

interface ${componentName}Props {
  title?: string;
  limit?: number;
  onDestinationPress?: (destination: Destination) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = ${numColumns};
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS + 1) * 2) / NUM_COLUMNS;

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  limit,
  onDestinationPress,
}) => {
  const navigation = useNavigation();

  const { data: destinations, isLoading } = useQuery({
    queryKey: ['destinations', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleDestinationPress = (destination: Destination) => {
    if (onDestinationPress) {
      onDestinationPress(destination);
    } else {
      navigation.navigate('DestinationDetail' as never, { id: destination.id } as never);
    }
  };

  const getDestinationImage = (destination: Destination): string => {
    return destination.image_url || destination.image || '';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderDestinationItem = ({ item }: { item: Destination }) => {
    const imageUrl = getDestinationImage(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleDestinationPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.imageOverlay} />
          <View style={styles.cardContent}>
            <Text style={styles.destinationName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.infoRow}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color="#FFFFFF" />
                <Text style={styles.countryText} numberOfLines={1}>
                  {item.country}
                </Text>
              </View>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="earth-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No destinations found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={destinations}
        renderItem={renderDestinationItem}
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
    paddingHorizontal: 8,
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
    marginHorizontal: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    marginHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN * 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  countryText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
