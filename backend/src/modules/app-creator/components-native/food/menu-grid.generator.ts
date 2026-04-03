/**
 * Menu Grid Component Generator for React Native
 *
 * Generates menu components:
 * - MenuGrid: FlatList grid of menu items
 * - MenuCategories: Horizontal ScrollView of categories
 */

export interface MenuGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMenuGrid(options: MenuGridOptions = {}): string {
  const { componentName = 'MenuGrid', endpoint = '/menu-items' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_spicy?: boolean;
  is_vegetarian?: boolean;
  is_popular?: boolean;
}

interface ${componentName}Props {
  category?: string;
  onAddToCart?: (item: MenuItem) => void;
}

function ${componentName}({ category, onAddToCart }: ${componentName}Props) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['menu-items', category],
    queryFn: async () => {
      const url = category
        ? '${endpoint}?category=' + encodeURIComponent(category)
        : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.card}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="restaurant-outline" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardPrice}>\${(item.price || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.badges}>
          {item.is_spicy && (
            <View style={styles.badgeSpicy}>
              <Ionicons name="flame" size={12} color="#DC2626" />
              <Text style={styles.badgeTextSpicy}>Spicy</Text>
            </View>
          )}
          {item.is_vegetarian && (
            <View style={styles.badgeVeg}>
              <Ionicons name="leaf" size={12} color="#16A34A" />
              <Text style={styles.badgeTextVeg}>Veg</Text>
            </View>
          )}
          {item.is_popular && (
            <View style={styles.badgePopular}>
              <Ionicons name="star" size={12} color="#CA8A04" />
              <Text style={styles.badgeTextPopular}>Popular</Text>
            </View>
          )}
        </View>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddToCart?.(item)}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add to Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No menu items found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  badgeSpicy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  badgeTextSpicy: {
    fontSize: 10,
    color: '#DC2626',
  },
  badgeVeg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  badgeTextVeg: {
    fontSize: 10,
    color: '#16A34A',
  },
  badgePopular: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  badgeTextPopular: {
    fontSize: 10,
    color: '#CA8A04',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateMenuCategories(
  options: { componentName?: string; endpoint?: string } = {}
): string {
  const { componentName = 'MenuCategories', endpoint = '/menu-categories' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface ${componentName}Props {
  selected?: string;
  onSelect?: (category: string) => void;
}

function ${componentName}({ selected, onSelect }: ${componentName}Props) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#F97316" />
      </View>
    );
  }

  const allCategories: Category[] = [
    { id: '', name: 'All' },
    ...categories,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {allCategories.map((cat) => {
        const isSelected = cat.id === ''
          ? !selected
          : selected === cat.id || selected === cat.name;

        return (
          <TouchableOpacity
            key={cat.id || 'all'}
            style={[styles.button, isSelected && styles.buttonSelected]}
            onPress={() => onSelect?.(cat.id || '')}
          >
            {cat.icon && <Text style={styles.icon}>{cat.icon}</Text>}
            <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  buttonSelected: {
    backgroundColor: '#F97316',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  buttonTextSelected: {
    color: '#FFFFFF',
  },
  icon: {
    marginRight: 4,
  },
});

export default ${componentName};
`;
}
