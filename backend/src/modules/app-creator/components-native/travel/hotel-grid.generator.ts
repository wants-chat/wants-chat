/**
 * Hotel Grid Component Generator (React Native)
 *
 * Generates a list of hotels with:
 * - Horizontal card layout
 * - Image, name, location, rating, amenities
 * - Price display and navigation
 */

export interface HotelGridOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateHotelGrid(options: HotelGridOptions = {}): string {
  const {
    componentName = 'HotelGrid',
    endpoint = '/hotels',
    title = 'Hotels',
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Hotel {
  id: string;
  name: string;
  location?: string;
  address?: string;
  image?: string;
  image_url?: string;
  rating?: number;
  price?: number;
  wifi?: boolean;
  breakfast?: boolean;
  parking?: boolean;
}

interface ${componentName}Props {
  title?: string;
  limit?: number;
  onHotelPress?: (hotel: Hotel) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  limit,
  onHotelPress,
}) => {
  const navigation = useNavigation();

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleHotelPress = (hotel: Hotel) => {
    if (onHotelPress) {
      onHotelPress(hotel);
    } else {
      navigation.navigate('HotelDetail' as never, { id: hotel.id } as never);
    }
  };

  const getHotelImage = (hotel: Hotel): string => {
    return hotel.image_url || hotel.image || '';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderHotelItem = ({ item }: { item: Hotel }) => {
    const imageUrl = getHotelImage(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleHotelPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="bed-outline" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.hotelName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.location || item.address || 'Location'}
                </Text>
              </View>
            </View>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFFFFF" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesRow}>
            {item.wifi && (
              <View style={styles.amenity}>
                <Ionicons name="wifi" size={16} color="#6B7280" />
              </View>
            )}
            {item.breakfast && (
              <View style={styles.amenity}>
                <Ionicons name="cafe" size={16} color="#6B7280" />
              </View>
            )}
            {item.parking && (
              <View style={styles.amenity}>
                <Ionicons name="car" size={16} color="#6B7280" />
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>\${item.price || 99}</Text>
            <Text style={styles.priceLabel}>/night</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bed-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No hotels found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={hotels}
        renderItem={renderHotelItem}
        keyExtractor={(item) => item.id}
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: 130,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  amenity: {
    opacity: 0.7,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
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
