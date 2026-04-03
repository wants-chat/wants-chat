/**
 * React Native Recently Viewed Generator
 * Generates a horizontal list of recently viewed products
 */

export function generateRNRecentlyViewed(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.4;

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
}

interface RecentlyViewedProps {
  products?: Product[];
  data?: Product[];
  entity?: string;
  onProductPress?: (product: Product) => void;
  [key: string]: any;
}

export default function RecentlyViewed({
  products,
  data,
  entity = 'recently-viewed',
  onProductPress
}: RecentlyViewedProps) {
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

  if (!sourceData || sourceData.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => \`$\${price.toFixed(2)}\`;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={12}
          color="#fbbf24"
        />
      );
    }
    return stars;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onProductPress?.(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.rating !== undefined && (
            <View style={styles.rating}>{renderStars(item.rating)}</View>
          )}
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recently Viewed</Text>
        <Ionicons name="time-outline" size={20} color="#6b7280" />
      </View>
      <FlatList
        data={sourceData}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id || item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
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
