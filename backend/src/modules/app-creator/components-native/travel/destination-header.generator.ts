/**
 * Destination Header Component Generator (React Native)
 *
 * Generates a destination detail header with:
 * - Hero image with overlay
 * - Destination name, country, rating
 * - Climate and language info
 */

export interface DestinationHeaderOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDestinationHeader(options: DestinationHeaderOptions = {}): string {
  const {
    componentName = 'DestinationHeader',
    endpoint = '/destinations',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';

interface Destination {
  id: string;
  name: string;
  country: string;
  image?: string;
  image_url?: string;
  rating?: number;
  climate?: string;
  language?: string;
  description?: string;
}

interface ${componentName}Props {
  destinationId?: string;
  destination?: Destination;
}

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

const ${componentName}: React.FC<${componentName}Props> = ({
  destinationId: propId,
  destination: propDestination,
}) => {
  const route = useRoute();
  const routeId = (route.params as any)?.id;
  const id = propId || routeId;

  const { data: fetchedDestination, isLoading } = useQuery({
    queryKey: ['destination', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
    enabled: !propDestination && !!id,
  });

  const destination = propDestination || fetchedDestination;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!destination) {
    return null;
  }

  const imageUrl = destination.image_url || destination.image;

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="earth" size={80} color="#9CA3AF" />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <Text style={styles.destinationName}>{destination.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color="#FFFFFF" />
            <Text style={styles.infoText}>{destination.country}</Text>
          </View>
          {destination.rating && (
            <View style={styles.infoItem}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.infoText}>{destination.rating}</Text>
            </View>
          )}
          {destination.climate && (
            <View style={styles.infoItem}>
              <Ionicons name="thermometer-outline" size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>{destination.climate}</Text>
            </View>
          )}
          {destination.language && (
            <View style={styles.infoItem}>
              <Ionicons name="globe-outline" size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>{destination.language}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  loadingContainer: {
    width: width,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
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
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  destinationName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default ${componentName};
`;
}
