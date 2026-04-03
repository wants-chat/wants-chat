/**
 * React Native Product Image Gallery Generator
 * Generates a product image gallery with thumbnails
 */

export function generateRNProductImageGallery(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

const { width } = Dimensions.get('window');
const MAIN_IMAGE_SIZE = width;
const THUMBNAIL_SIZE = 80;

interface ProductImageGalleryProps {
  galleryData?: any;
  images?: string[];
  onImagePress?: (image: string, index: number) => void;
  [key: string]: any;
}

export default function ProductImageGallery({
  galleryData: propData,
  images: propImages,
  onImagePress
}: ProductImageGalleryProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImageRef = React.useRef<FlatList>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propImages) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/products\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch gallery data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const images = propImages || data.images || [];

  if (loading && !propData && !propImages) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleThumbnailPress = (index: number) => {
    setSelectedIndex(index);
    mainImageRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const handleMainImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / MAIN_IMAGE_SIZE);
    if (currentIndex !== selectedIndex) {
      setSelectedIndex(currentIndex);
    }
  };

  const renderMainImage = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onImagePress?.(item, index)}
    >
      <Image
        source={{ uri: item || 'https://via.placeholder.com/400' }}
        style={styles.mainImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        selectedIndex === index && styles.thumbnailSelected
      ]}
      onPress={() => handleThumbnailPress(index)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item || 'https://via.placeholder.com/80' }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
      {selectedIndex === index && (
        <View style={styles.selectedOverlay}>
          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPaginationDots = () => (
    <View style={styles.pagination}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            selectedIndex === index && styles.paginationDotActive
          ]}
        />
      ))}
    </View>
  );

  if (!images || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={64} color="#D1D5DB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={mainImageRef}
        data={images}
        renderItem={renderMainImage}
        keyExtractor={(item, index) => \`main-\${index}\`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMainImageScroll}
        bounces={false}
      />

      {images.length > 1 && renderPaginationDots()}

      <View style={styles.zoomIndicator}>
        <Ionicons name="expand-outline" size={20} color="#fff" />
      </View>

      {images.length > 1 && (
        <View style={styles.thumbnailContainer}>
          <FlatList
            data={images}
            renderItem={renderThumbnail}
            keyExtractor={(item, index) => \`thumb-\${index}\`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        </View>
      )}

      <View style={styles.imageCounter}>
        <Ionicons name="images-outline" size={16} color="#fff" />
        <View style={styles.counterBadge}>
          <View style={styles.counterText}>
            {selectedIndex + 1} / {images.length}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  mainImage: {
    width: MAIN_IMAGE_SIZE,
    height: MAIN_IMAGE_SIZE,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    width: MAIN_IMAGE_SIZE,
    height: MAIN_IMAGE_SIZE,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterBadge: {
    marginLeft: 6,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  thumbnailContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  thumbnailList: {
    paddingHorizontal: 12,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    marginHorizontal: 6,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#3B82F6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
