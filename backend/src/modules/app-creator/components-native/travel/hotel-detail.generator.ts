/**
 * Hotel Detail Component Generator (React Native)
 *
 * Generates a hotel detail view with:
 * - Hero image
 * - Hotel info (name, location, rating)
 * - Description and amenities
 * - Price and booking button
 */

export interface HotelDetailOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateHotelDetail(options: HotelDetailOptions = {}): string {
  const {
    componentName = 'HotelDetail',
    endpoint = '/hotels',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  description?: string;
  wifi?: boolean;
  breakfast?: boolean;
  parking?: boolean;
  gym?: boolean;
  pool?: boolean;
  spa?: boolean;
}

interface ${componentName}Props {
  hotelId?: string;
  hotel?: Hotel;
  onBookPress?: (hotel: Hotel) => void;
}

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

const AMENITIES = [
  { key: 'wifi', label: 'Free WiFi', icon: 'wifi' },
  { key: 'breakfast', label: 'Breakfast', icon: 'cafe' },
  { key: 'parking', label: 'Parking', icon: 'car' },
  { key: 'gym', label: 'Gym', icon: 'barbell' },
  { key: 'pool', label: 'Pool', icon: 'water' },
  { key: 'spa', label: 'Spa', icon: 'flower' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  hotelId: propId,
  hotel: propHotel,
  onBookPress,
}) => {
  const route = useRoute();
  const navigation = useNavigation();
  const routeId = (route.params as any)?.id;
  const id = propId || routeId;

  const { data: fetchedHotel, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
    enabled: !propHotel && !!id,
  });

  const hotel = propHotel || fetchedHotel;

  const handleBookPress = () => {
    if (onBookPress && hotel) {
      onBookPress(hotel);
    } else if (hotel) {
      navigation.navigate('BookHotel' as never, { hotelId: hotel.id } as never);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bed-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Hotel not found</Text>
      </View>
    );
  }

  const imageUrl = hotel.image_url || hotel.image;
  const activeAmenities = AMENITIES.filter((a) => (hotel as any)[a.key]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="bed" size={80} color="#9CA3AF" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
            style={styles.imageGradient}
          />
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.locationText}>
                  {hotel.location || hotel.address || 'Location'}
                </Text>
              </View>
            </View>
            {hotel.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#FFFFFF" />
                <Text style={styles.ratingText}>{hotel.rating}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {hotel.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{hotel.description}</Text>
            </View>
          )}

          {/* Amenities */}
          {activeAmenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {activeAmenities.map((amenity) => (
                  <View key={amenity.key} style={styles.amenityItem}>
                    <View style={styles.amenityIcon}>
                      <Ionicons name={amenity.icon as any} size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>\${hotel.price || 99}</Text>
          <Text style={styles.priceLabel}>/night</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 12,
  },
  imageContainer: {
    width: width,
    height: IMAGE_HEIGHT,
    position: 'relative',
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
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT / 2,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  hotelName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  amenityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
