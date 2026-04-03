/**
 * React Native Product 360 Viewer Generator
 * Generates a 360-degree product viewer component
 * Note: This is a simplified version. For full 360 functionality, consider using libraries like react-native-360-image-viewer
 */

export function generateRNProduct360Viewer(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useRef, useEffect } from 'react';`,
    `import { View, Text, Image, StyleSheet, PanResponder, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface Product360ViewerProps {
  viewerData?: any;
  images?: string[];
  productName?: string;
  instructionText?: string;
  resetButton?: string;
  onImageChange?: (index: number) => void;
  [key: string]: any;
}

export default function Product360Viewer({
  viewerData: propData,
  images: propImages = [],
  productName: propProductName = 'Product',
  instructionText = 'Drag to rotate',
  resetButton = 'Reset View',
  onImageChange
}: Product360ViewerProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propImages.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/products\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch product data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const images = propImages.length > 0 ? propImages : (data.images || data.images360 || []);
  const productName = data.productName || data.name || propProductName;

  if (loading && !propData && propImages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        // Calculate image index based on horizontal drag
        const sensitivity = 10;
        const newIndex = Math.floor(gesture.dx / sensitivity);
        const calculatedIndex = (currentImageIndex + newIndex) % images.length;
        const finalIndex = calculatedIndex < 0 ? images.length + calculatedIndex : calculatedIndex;

        if (finalIndex !== currentImageIndex && finalIndex >= 0 && finalIndex < images.length) {
          setCurrentImageIndex(finalIndex);
          onImageChange?.(finalIndex);
        }
      },
      onPanResponderRelease: () => {
        pan.setValue({ x: 0, y: 0 });
      }
    })
  ).current;

  const handleReset = () => {
    setCurrentImageIndex(0);
    onImageChange?.(0);
  };

  if (!images || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>No images available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.productName}>{productName}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color="#3b82f6" />
          <Text style={styles.resetButtonText}>{resetButton}</Text>
        </TouchableOpacity>
      </View>

      {/* Viewer */}
      <View style={styles.viewerContainer} {...panResponder.panHandlers}>
        <Image
          source={{ uri: images[currentImageIndex] || 'https://via.placeholder.com/400' }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Instruction Overlay */}
        <View style={styles.instructionOverlay}>
          <Ionicons name="hand-left-outline" size={24} color="#fff" />
          <Text style={styles.instructionText}>{instructionText}</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentImageIndex + 1} / {images.length}
          </Text>
        </View>
      </View>

      {/* Rotation Indicator */}
      <View style={styles.rotationIndicator}>
        <View style={styles.indicatorTrack}>
          <View
            style={[
              styles.indicatorFill,
              { width: \`\${((currentImageIndex + 1) / images.length) * 100}%\` }
            ]}
          />
        </View>
        <View style={styles.angleInfo}>
          <Ionicons name="sync" size={16} color="#6b7280" />
          <Text style={styles.angleText}>
            {Math.round((currentImageIndex / images.length) * 360)}°
          </Text>
        </View>
      </View>

      {/* Thumbnails */}
      <View style={styles.thumbnailsContainer}>
        <Text style={styles.thumbnailsTitle}>Angles</Text>
        <View style={styles.thumbnails}>
          {images.slice(0, 8).map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setCurrentImageIndex(index);
                onImageChange?.(index);
              }}
            >
              <View style={[
                styles.thumbnail,
                currentImageIndex === index && styles.thumbnailActive
              ]}>
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Ionicons name="images-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>{images.length} frames</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="sync-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>360° View</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  viewerContainer: {
    height: 400,
    backgroundColor: '#f9fafb',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  instructionOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rotationIndicator: {
    padding: 16,
    gap: 12,
  },
  indicatorTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  angleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  angleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  thumbnailsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  thumbnailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  thumbnails: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#3b82f6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 24,
    backgroundColor: '#f9fafb',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
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
    color: '#9ca3af',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return { code, imports };
}
