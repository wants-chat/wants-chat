/**
 * Brewery Component Generator for React Native
 *
 * Generates brewery-specific components:
 * - BreweryStats: Dashboard stats for brewery operations
 * - BeerListFeatured: Featured beers list
 * - TapList: Current beers on tap
 */

export interface BreweryOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate brewery stats dashboard component
 */
export function generateBreweryStats(options: BreweryOptions = {}): string {
  const { componentName = 'BreweryStats', endpoint = '/brewery/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const STATS_CONFIG = [
  { key: 'todaySales', label: "Today's Sales", icon: 'cash', color: '#16A34A', type: 'currency' },
  { key: 'beersOnTap', label: 'Beers on Tap', icon: 'beer', color: '#F59E0B', type: 'number' },
  { key: 'pintsSold', label: 'Pints Sold', icon: 'pint', color: '#3B82F6', type: 'number' },
  { key: 'flightsSold', label: 'Flights Sold', icon: 'wine', color: '#8B5CF6', type: 'number' },
  { key: 'growlerFills', label: 'Growler Fills', icon: 'water', color: '#06B6D4', type: 'number' },
  { key: 'lowKegs', label: 'Low Kegs', icon: 'alert-circle', color: '#EF4444', type: 'number' },
];

function ${componentName}() {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['brewery-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch brewery stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Brewery Dashboard</Text>
        <View style={styles.dateRow}>
          <Ionicons name="beer" size={16} color="#F59E0B" />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {STATS_CONFIG.map((stat) => {
          const value = stats[stat.key];
          const change = stats[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{formatValue(value, stat.type)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {change !== undefined && (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={change >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={change >= 0 ? '#16A34A' : '#EF4444'}
                  />
                  <Text style={[
                    styles.changeText,
                    { color: change >= 0 ? '#16A34A' : '#EF4444' },
                  ]}>
                    {Math.abs(change)}%
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate tap list component
 */
export function generateTapList(options: BreweryOptions = {}): string {
  const { componentName = 'TapList', endpoint = '/brewery/taps' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TapBeer {
  id: string;
  tap_number: number;
  name: string;
  style: string;
  abv: number;
  ibu?: number;
  price_pint?: number;
  price_half?: number;
  price_flight?: number;
  description?: string;
  is_new?: boolean;
  is_seasonal?: boolean;
  remaining_percent?: number;
}

interface ${componentName}Props {
  onSelectBeer?: (beer: TapBeer) => void;
}

function ${componentName}({ onSelectBeer }: ${componentName}Props) {
  const { data: taps = [], isLoading } = useQuery({
    queryKey: ['brewery-taps'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch tap list:', err);
        return [];
      }
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  const getLevelColor = (percent?: number) => {
    if (!percent) return '#9CA3AF';
    if (percent > 50) return '#16A34A';
    if (percent > 25) return '#F59E0B';
    return '#EF4444';
  };

  const renderItem = ({ item }: { item: TapBeer }) => (
    <TouchableOpacity
      style={styles.tapCard}
      onPress={() => onSelectBeer?.(item)}
    >
      <View style={styles.tapNumber}>
        <Text style={styles.tapNumberText}>{item.tap_number}</Text>
      </View>
      <View style={styles.beerInfo}>
        <View style={styles.beerHeader}>
          <Text style={styles.beerName}>{item.name}</Text>
          <View style={styles.badges}>
            {item.is_new && (
              <View style={styles.badgeNew}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            )}
            {item.is_seasonal && (
              <View style={styles.badgeSeasonal}>
                <Text style={styles.badgeText}>Seasonal</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.beerStyle}>{item.style}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>ABV</Text>
            <Text style={styles.statValue}>{item.abv}%</Text>
          </View>
          {item.ibu && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>IBU</Text>
              <Text style={styles.statValue}>{item.ibu}</Text>
            </View>
          )}
        </View>
        {item.remaining_percent !== undefined && (
          <View style={styles.levelContainer}>
            <View style={styles.levelBar}>
              <View
                style={[
                  styles.levelFill,
                  {
                    width: \`\${item.remaining_percent}%\`,
                    backgroundColor: getLevelColor(item.remaining_percent),
                  },
                ]}
              />
            </View>
            <Text style={[styles.levelText, { color: getLevelColor(item.remaining_percent) }]}>
              {item.remaining_percent}%
            </Text>
          </View>
        )}
      </View>
      <View style={styles.priceColumn}>
        {item.price_pint && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Pint</Text>
            <Text style={styles.priceValue}>\${item.price_pint.toFixed(2)}</Text>
          </View>
        )}
        {item.price_half && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Half</Text>
            <Text style={styles.priceValue}>\${item.price_half.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (taps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="beer-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No beers on tap</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="beer" size={20} color="#F59E0B" />
        <Text style={styles.title}>On Tap</Text>
        <Text style={styles.tapCount}>{taps.length} beers</Text>
      </View>
      <FlatList
        data={taps}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  tapCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 8,
  },
  tapCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  tapNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tapNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  beerInfo: {
    flex: 1,
  },
  beerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  badgeNew: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSeasonal: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  beerStyle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  levelBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: 2,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  priceItem: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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

/**
 * Generate featured beers list component
 */
export function generateBeerListFeatured(options: BreweryOptions = {}): string {
  const { componentName = 'BeerListFeatured', endpoint = '/brewery/beers/featured' } = options;

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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Beer {
  id: string;
  name: string;
  style: string;
  abv: number;
  ibu?: number;
  image_url?: string;
  description?: string;
  rating?: number;
  is_new?: boolean;
  available_for_growler?: boolean;
}

interface ${componentName}Props {
  limit?: number;
}

function ${componentName}({ limit = 8 }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: beers = [], isLoading } = useQuery({
    queryKey: ['brewery-featured-beers', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch featured beers:', err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Beer }) => (
    <TouchableOpacity
      style={styles.beerCard}
      onPress={() => navigation.navigate('BeerDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.beerImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="beer" size={32} color="#F59E0B" />
          </View>
        )}
        {item.is_new && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        )}
      </View>
      <View style={styles.beerInfo}>
        <Text style={styles.beerName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.beerStyle} numberOfLines={1}>{item.style}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.abv}%</Text>
            <Text style={styles.statLabel}>ABV</Text>
          </View>
          {item.ibu && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.ibu}</Text>
              <Text style={styles.statLabel}>IBU</Text>
            </View>
          )}
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
        {item.available_for_growler && (
          <View style={styles.growlerBadge}>
            <Ionicons name="water" size={12} color="#3B82F6" />
            <Text style={styles.growlerText}>Growler</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (beers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="beer-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No featured beers</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Beers</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Beers' as never)}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={beers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  beerCard: {
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
  imageContainer: {
    position: 'relative',
  },
  beerImage: {
    width: '100%',
    height: 120,
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  beerInfo: {
    padding: 10,
  },
  beerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  beerStyle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  growlerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  growlerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
