import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

/**
 * React Native Driver Card Generator
 * Generates a driver card component for displaying driver information
 */

export function generateRNDriverCard(
  resolved: ResolvedComponent,
  variant: string = 'standard'
): { code: string; imports: string[] } {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'drivers';

  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface DriverCardProps {
  title?: string;
  entity?: string;
  data?: any[];
  onItemClick?: (item: any) => void;
  [key: string]: any;
}

export default function DriverCard({
  title = 'Drivers',
  data: propData,
  onItemClick,
  ...props
}: DriverCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || [];

  const renderDriver = ({ item }: { item: any }) => {
    const driverName = \`\${item.first_name || ''} \${item.last_name || ''}\`.trim() || 'Driver';
    const photoUrl = item.photo_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(driverName)}&size=200&background=random\`;
    const rating = item.rating ? parseFloat(item.rating) : 0;
    const displayRating = rating > 10 ? (rating / 100).toFixed(1) : rating.toFixed(1);
    const isAvailable = item.is_available;
    const isActive = item.is_active;

    return (
      <TouchableOpacity
        style={styles.driverCard}
        onPress={() => onItemClick?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photoUrl }}
            style={styles.driverImage}
            resizeMode="cover"
          />
          {isAvailable && (
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>Available</Text>
            </View>
          )}
        </View>

        <View style={styles.driverInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.driverName} numberOfLines={1}>
              {driverName}
            </Text>
            {!isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactive</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.detailText}>{displayRating}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="car-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{item.vehicle_type || 'Vehicle'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.total_deliveries || 0}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Ionicons name="call-outline" size={16} color="#3b82f6" />
              <Text style={styles.phoneText} numberOfLines={1}>{item.phone || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading drivers...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>No drivers available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={data}
        renderItem={renderDriver}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  driverCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  driverImage: {
    width: '100%',
    height: '100%',
  },
  availableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  driverInfo: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  inactiveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inactiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  phoneText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 4,
  },
});`;

  return {
    code,
    imports: []
  };
}
