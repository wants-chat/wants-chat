/**
 * Property Detail Generator for React Native App Creator
 *
 * Generates property detail components with:
 * - Image carousel/gallery with pagination
 * - Property features list (beds, baths, garage, etc.)
 * - Contact agent button
 * - Property description and amenities
 */

export interface PropertyDetailOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a property detail screen component for React Native
 */
export function generatePropertyDetail(options: PropertyDetailOptions = {}): string {
  const { componentName = 'PropertyDetail', endpoint = '/properties' } = options;

  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Linking,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const formatPrice = (price: number): string => {
    return '$' + price.toLocaleString();
  };

  const handleShare = async () => {
    if (!property) return;
    try {
      await Share.share({
        message: \`Check out this property: \${property.title || 'Property'} - \${formatPrice(property.price)}\\n\${property.address || ''}\`,
        title: property.title || 'Property',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContactAgent = () => {
    if (property?.agent?.phone) {
      Linking.openURL(\`tel:\${property.agent.phone}\`);
    } else if (property?.agent?.email) {
      Linking.openURL(\`mailto:\${property.agent.email}\`);
    } else {
      navigation.navigate('ContactAgent' as never, { propertyId: id } as never);
    }
  };

  const handleScheduleTour = () => {
    navigation.navigate('ScheduleTour' as never, { propertyId: id } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="home-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = getPropertyImages(property);
  const bedrooms = property.bedrooms || property.beds;
  const bathrooms = property.bathrooms || property.baths;
  const sqft = property.sqft || property.square_feet || property.area;
  const garage = property.garage || property.parking;
  const yearBuilt = property.year_built || property.yearBuilt;
  const amenities = property.amenities || [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <PropertyGalleryInline images={images} />

        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#EF4444' : '#374151'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Property Info */}
        <View style={styles.propertyInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
            {property.status && (
              <View style={[styles.statusBadge, getStatusStyle(property.status)]}>
                <Text style={styles.statusText}>{getStatusLabel(property.status)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{property.title || property.name || 'Property'}</Text>

          {property.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.addressText}>{property.address}</Text>
            </View>
          )}

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            {bedrooms !== undefined && (
              <View style={styles.featureItem}>
                <Ionicons name="bed-outline" size={28} color="#3B82F6" />
                <Text style={styles.featureValue}>{bedrooms}</Text>
                <Text style={styles.featureLabel}>Bedrooms</Text>
              </View>
            )}
            {bathrooms !== undefined && (
              <View style={styles.featureItem}>
                <Ionicons name="water-outline" size={28} color="#3B82F6" />
                <Text style={styles.featureValue}>{bathrooms}</Text>
                <Text style={styles.featureLabel}>Bathrooms</Text>
              </View>
            )}
            {sqft !== undefined && (
              <View style={styles.featureItem}>
                <Ionicons name="resize-outline" size={28} color="#3B82F6" />
                <Text style={styles.featureValue}>{sqft.toLocaleString()}</Text>
                <Text style={styles.featureLabel}>Sq Ft</Text>
              </View>
            )}
            {garage !== undefined && (
              <View style={styles.featureItem}>
                <Ionicons name="car-outline" size={28} color="#3B82F6" />
                <Text style={styles.featureValue}>{garage}</Text>
                <Text style={styles.featureLabel}>Garage</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {property.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        {/* Property Features */}
        <PropertyFeaturesInline property={property} />

        {/* Amenities */}
        {amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {amenities.map((amenity: string, index: number) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Agent Info */}
        {property.agent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listed By</Text>
            <View style={styles.agentCard}>
              {property.agent.avatar_url ? (
                <Image
                  source={{ uri: property.agent.avatar_url }}
                  style={styles.agentAvatar}
                />
              ) : (
                <View style={styles.agentAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{property.agent.name}</Text>
                {property.agent.title && (
                  <Text style={styles.agentTitle}>{property.agent.title}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => property.agent.phone && Linking.openURL(\`tel:\${property.agent.phone}\`)}
              >
                <Ionicons name="call-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Spacer for bottom buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.scheduleButton} onPress={handleScheduleTour}>
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <Text style={styles.scheduleButtonText}>Schedule Tour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactAgent}>
          <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>Contact Agent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Inline Gallery Component
interface PropertyGalleryInlineProps {
  images: string[];
}

const PropertyGalleryInline: React.FC<PropertyGalleryInlineProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <View style={styles.galleryPlaceholder}>
        <Ionicons name="image-outline" size={48} color="#9CA3AF" />
        <Text style={styles.galleryPlaceholderText}>No images available</Text>
      </View>
    );
  }

  return (
    <View style={styles.galleryContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.galleryImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
      <View style={styles.imageCounter}>
        <Text style={styles.imageCounterText}>
          {currentIndex + 1}/{images.length}
        </Text>
      </View>
    </View>
  );
};

// Inline Features Component
interface PropertyFeaturesInlineProps {
  property: any;
}

const PropertyFeaturesInline: React.FC<PropertyFeaturesInlineProps> = ({ property }) => {
  const features = [
    { key: 'lot_size', label: 'Lot Size', icon: 'expand-outline', format: (v: any) => v + ' sqft' },
    { key: 'year_built', label: 'Year Built', icon: 'calendar-outline', format: (v: any) => v },
    { key: 'property_type', label: 'Property Type', icon: 'home-outline', format: (v: any) => v },
    { key: 'stories', label: 'Stories', icon: 'layers-outline', format: (v: any) => v },
    { key: 'heating', label: 'Heating', icon: 'flame-outline', format: (v: any) => v },
    { key: 'cooling', label: 'Cooling', icon: 'snow-outline', format: (v: any) => v },
    { key: 'hoa_fee', label: 'HOA Fee', icon: 'cash-outline', format: (v: any) => '$' + v + '/mo' },
  ];

  const visibleFeatures = features.filter((f) => property[f.key] !== undefined);

  if (visibleFeatures.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Property Details</Text>
      <View style={styles.detailsGrid}>
        {visibleFeatures.map((feature) => (
          <View key={feature.key} style={styles.detailItem}>
            <View style={styles.detailRow}>
              <Ionicons name={feature.icon as any} size={18} color="#6B7280" />
              <Text style={styles.detailLabel}>{feature.label}</Text>
            </View>
            <Text style={styles.detailValue}>{feature.format(property[feature.key])}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Helper functions
const getPropertyImages = (property: any): string[] => {
  if (property.images) {
    if (Array.isArray(property.images)) return property.images;
    if (typeof property.images === 'string') {
      try {
        const parsed = JSON.parse(property.images);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [property.images];
      }
    }
  }
  if (property.image_url) return [property.image_url];
  if (property.image) return [property.image];
  return [];
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'for-sale':
    case 'for_sale':
      return { backgroundColor: '#10B981' };
    case 'for-rent':
    case 'for_rent':
      return { backgroundColor: '#3B82F6' };
    case 'sold':
      return { backgroundColor: '#6B7280' };
    case 'pending':
      return { backgroundColor: '#F59E0B' };
    default:
      return { backgroundColor: '#6B7280' };
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'for-sale':
    case 'for_sale':
      return 'For Sale';
    case 'for-rent':
    case 'for_rent':
      return 'For Rent';
    case 'sold':
      return 'Sold';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  galleryContainer: {
    height: 300,
    position: 'relative',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  galleryPlaceholder: {
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryPlaceholderText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 16,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    position: 'absolute',
    top: 48,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyInfo: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  featureLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 14,
    color: '#374151',
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  agentAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  agentTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
  },
  scheduleButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a standalone property gallery component for React Native
 */
export function generatePropertyGallery(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'PropertyGallery';

  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ${componentName}Props {
  images: string[];
  initialIndex?: number;
  showThumbnails?: boolean;
  onClose?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  images,
  initialIndex = 0,
  showThumbnails = true,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fullscreenScrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    fullscreenScrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleThumbnailPress = (index: number) => {
    scrollToIndex(index);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  if (!images || images.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="image-outline" size={48} color="#9CA3AF" />
        <Text style={styles.placeholderText}>No images available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Gallery */}
      <View style={styles.galleryContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={openFullscreen}
            >
              <Image
                source={{ uri: image }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pagination */}
        {images.length > 1 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Fullscreen Button */}
        <TouchableOpacity style={styles.fullscreenButton} onPress={openFullscreen}>
          <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Image Counter */}
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentIndex + 1}/{images.length}
          </Text>
        </View>
      </View>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleThumbnailPress(index)}
              style={[
                styles.thumbnailWrapper,
                index === currentIndex && styles.thumbnailWrapperActive,
              ]}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <StatusBar hidden />
        <View style={styles.fullscreenContainer}>
          <ScrollView
            ref={fullscreenScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentOffset={{ x: currentIndex * SCREEN_WIDTH, y: 0 }}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.fullscreenImageContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeFullscreen}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => scrollToIndex(currentIndex - 1)}
            >
              <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {currentIndex < images.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => scrollToIndex(currentIndex + 1)}
            >
              <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Fullscreen Counter */}
          <View style={styles.fullscreenCounter}>
            <Text style={styles.fullscreenCounterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  placeholder: {
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 16,
  },
  galleryContainer: {
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  fullscreenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  thumbnailWrapperActive: {
    borderColor: '#3B82F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  fullscreenCounter: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fullscreenCounterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate property features component for React Native
 */
export function generatePropertyFeatures(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'PropertyFeatures';

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Feature {
  key: string;
  label: string;
  value: string | number;
  icon?: string;
}

interface ${componentName}Props {
  property: any;
  features?: Feature[];
  columns?: 2 | 3 | 4;
  showIcons?: boolean;
  style?: any;
}

const defaultFeatureConfig = [
  { key: 'bedrooms', label: 'Bedrooms', icon: 'bed-outline' },
  { key: 'bathrooms', label: 'Bathrooms', icon: 'water-outline' },
  { key: 'sqft', label: 'Square Feet', icon: 'resize-outline' },
  { key: 'garage', label: 'Garage', icon: 'car-outline' },
  { key: 'lot_size', label: 'Lot Size', icon: 'expand-outline' },
  { key: 'year_built', label: 'Year Built', icon: 'calendar-outline' },
  { key: 'property_type', label: 'Type', icon: 'home-outline' },
  { key: 'stories', label: 'Stories', icon: 'layers-outline' },
  { key: 'heating', label: 'Heating', icon: 'flame-outline' },
  { key: 'cooling', label: 'Cooling', icon: 'snow-outline' },
  { key: 'basement', label: 'Basement', icon: 'layers-outline' },
  { key: 'flooring', label: 'Flooring', icon: 'grid-outline' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  property,
  features: customFeatures,
  columns = 2,
  showIcons = true,
  style,
}) => {
  // Build features list from property data
  const features: Feature[] = customFeatures || defaultFeatureConfig
    .filter((config) => property[config.key] !== undefined && property[config.key] !== null)
    .map((config) => ({
      key: config.key,
      label: config.label,
      value: property[config.key],
      icon: config.icon,
    }));

  if (features.length === 0) {
    return null;
  }

  const formatValue = (value: string | number, key: string): string => {
    if (typeof value === 'number') {
      if (key === 'sqft' || key === 'lot_size' || key === 'square_feet') {
        return value.toLocaleString() + ' sqft';
      }
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Property Features</Text>
      <View style={[styles.featuresGrid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {features.map((feature, index) => (
          <View
            key={feature.key}
            style={[
              styles.featureItem,
              { width: columns === 2 ? '50%' : columns === 3 ? '33.33%' : '25%' },
            ]}
          >
            <View style={styles.featureContent}>
              {showIcons && feature.icon && (
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color="#3B82F6"
                  />
                </View>
              )}
              <View style={styles.featureText}>
                <Text style={styles.featureValue}>
                  {formatValue(feature.value, feature.key)}
                </Text>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featuresGrid: {
    marginHorizontal: -8,
  },
  featureItem: {
    padding: 8,
  },
  featureContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    alignItems: 'center',
  },
  featureValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  featureLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}
