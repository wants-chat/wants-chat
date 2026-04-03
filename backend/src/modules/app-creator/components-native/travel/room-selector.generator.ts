/**
 * Room Selector Component Generator (React Native)
 *
 * Generates a room selection list with:
 * - Room cards with image, capacity, size
 * - Amenities display
 * - Price and select button
 */

export interface RoomSelectorOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateRoomSelector(options: RoomSelectorOptions = {}): string {
  const {
    componentName = 'RoomSelector',
    endpoint = '/rooms',
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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Room {
  id: string;
  name?: string;
  type?: string;
  image?: string;
  image_url?: string;
  capacity?: number;
  size?: number;
  price?: number;
  amenities?: string[];
}

interface ${componentName}Props {
  hotelId?: string;
  onSelect?: (room: Room) => void;
  selectedRoomId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  hotelId,
  onSelect,
  selectedRoomId,
}) => {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms', hotelId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (hotelId) url += '?hotel_id=' + hotelId;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getRoomImage = (room: Room): string => {
    return room.image_url || room.image || '';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderRoomItem = ({ item }: { item: Room }) => {
    const imageUrl = getRoomImage(item);
    const isSelected = selectedRoomId === item.id;

    return (
      <View style={[styles.card, isSelected && styles.cardSelected]}>
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
          <Text style={styles.roomName}>{item.name || item.type || 'Standard Room'}</Text>

          {/* Room Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={16} color="#6B7280" />
              <Text style={styles.infoText}>{item.capacity || 2} guests</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="expand" size={16} color="#6B7280" />
              <Text style={styles.infoText}>{item.size || 25} m²</Text>
            </View>
          </View>

          {/* Amenities */}
          {item.amenities && item.amenities.length > 0 && (
            <View style={styles.amenitiesRow}>
              {item.amenities.slice(0, 3).map((amenity, index) => (
                <View key={index} style={styles.amenityTag}>
                  <Ionicons name="checkmark" size={12} color="#10B981" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Price and Select */}
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>\${item.price || 99}</Text>
              <Text style={styles.priceLabel}>/night</Text>
            </View>
            <TouchableOpacity
              style={[styles.selectButton, isSelected && styles.selectButtonSelected]}
              onPress={() => onSelect?.(item)}
            >
              {isSelected ? (
                <>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.selectButtonTextSelected}>Selected</Text>
                </>
              ) : (
                <Text style={styles.selectButtonText}>Select</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bed-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No rooms available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Room</Text>
      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
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
    fontSize: 20,
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
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  imageContainer: {
    width: 100,
    height: 140,
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
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amenityText: {
    fontSize: 11,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  selectButtonSelected: {
    backgroundColor: '#10B981',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectButtonTextSelected: {
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
