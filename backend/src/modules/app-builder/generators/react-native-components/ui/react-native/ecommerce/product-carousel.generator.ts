/**
 * React Native Product Carousel Generator
 * Generates a horizontal scrolling product carousel
 */

export function generateRNProductCarousel(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 12;

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  discount?: number;
}

interface ProductCarouselProps {
  products?: Product[];
  data?: Product[];
  entity?: string;
  onProductPress?: (product: Product) => void;
  title?: string;
  [key: string]: any;
}

export default function ProductCarousel({
  products,
  data,
  entity = 'products',
  onProductPress,
  title
}: ProductCarouselProps) {
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propData = products || data;

  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData;
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={14}
          color="#FBBF24"
        />
      );
    }
    return stars;
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onProductPress?.(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
      />

      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        {item.rating !== undefined && (
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatPrice(item.originalPrice)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onProductPress?.(item)}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No products available</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      )}

      {sourceData.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sourceData}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id || item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          decelerationRate="fast"
          snapToAlignment="start"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: CARD_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    minHeight: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
});`;

  return { code, imports };
}
