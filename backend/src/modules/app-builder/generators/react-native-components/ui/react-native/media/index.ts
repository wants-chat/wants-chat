/**
 * Media Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Re-export existing generator
export { generateRNTrackDetailPage } from './track-detail-page.generator';

// Image Gallery Grid
export function generateRNImageGalleryGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

interface ImageGalleryGridProps {
  images: ImageItem[];
  columns?: 2 | 3 | 4;
  onImagePress?: (image: ImageItem) => void;
}

export default function ImageGalleryGrid({ images, columns = 3, onImagePress }: ImageGalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 32 - (columns - 1) * 8) / columns;

  const handleImagePress = (image: ImageItem) => {
    if (onImagePress) {
      onImagePress(image);
    } else {
      setSelectedImage(image);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.imageWrapper, { width: imageSize, height: imageSize }]}
            onPress={() => handleImagePress(item)}
          >
            <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        )}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedImage.url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              {selectedImage.title && <Text style={styles.imageTitle}>{selectedImage.title}</Text>}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fullImage: {
    width: '100%',
    height: '70%',
  },
  imageTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions, Modal } from 'react-native';"],
  };
}

// Image Gallery Masonry
export function generateRNImageGalleryMasonry(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageItem {
  id: string;
  url: string;
  height: number;
  title?: string;
}

interface ImageGalleryMasonryProps {
  images: ImageItem[];
  columns?: 2 | 3;
  onImagePress?: (image: ImageItem) => void;
}

export default function ImageGalleryMasonry({ images, columns = 2, onImagePress }: ImageGalleryMasonryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const columnWidth = (screenWidth - 32 - (columns - 1) * 8) / columns;

  const distributeImages = () => {
    const cols: ImageItem[][] = Array.from({ length: columns }, () => []);
    const heights: number[] = Array(columns).fill(0);

    images.forEach((image) => {
      const shortestCol = heights.indexOf(Math.min(...heights));
      cols[shortestCol].push(image);
      heights[shortestCol] += image.height || 200;
    });

    return cols;
  };

  const columnData = distributeImages();

  return (
    <View style={styles.container}>
      <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
        <View style={styles.masonryContainer}>
          {columnData.map((column, colIndex) => (
            <View key={colIndex} style={[styles.column, { width: columnWidth }]}>
              {column.map((image) => (
                <TouchableOpacity
                  key={image.id}
                  style={[styles.imageWrapper, { height: image.height || 200 }]}
                  onPress={() => onImagePress ? onImagePress(image) : setSelectedImage(image)}
                >
                  <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage.url }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  column: {
    gap: 8,
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: '100%',
    height: '70%',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, Modal } from 'react-native';"],
  };
}

// Thumbnail Gallery
export function generateRNThumbnailGallery(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';

interface ThumbnailGalleryProps {
  images: { id: string; url: string }[];
  thumbnailSize?: number;
}

export default function ThumbnailGallery({ images, thumbnailSize = 60 }: ThumbnailGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mainImageRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');

  const scrollToIndex = (index: number) => {
    setActiveIndex(index);
    mainImageRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={mainImageRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.mainImageContainer, { width }]}>
            <Image source={{ uri: item.url }} style={styles.mainImage} resizeMode="contain" />
          </View>
        )}
      />

      <View style={styles.thumbnailContainer}>
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thumbnailList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => scrollToIndex(index)}
              style={[
                styles.thumbnail,
                { width: thumbnailSize, height: thumbnailSize },
                activeIndex === index && styles.thumbnailActive,
              ]}
            >
              <Image source={{ uri: item.url }} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainImageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  thumbnailList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  thumbnailActive: {
    borderColor: '#3b82f6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});`,
    imports: ["import React, { useState, useRef } from 'react';", "import { View, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';"],
  };
}

// Image Zoom Hover (tap to zoom for mobile)
export function generateRNImageZoomHover(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageZoomHoverProps {
  imageUrl: string;
  zoomScale?: number;
}

export default function ImageZoomHover({ imageUrl, zoomScale = 2 }: ImageZoomHoverProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsZoomed(true)} activeOpacity={0.9}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        <View style={styles.zoomHint}>
          <Ionicons name="expand" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal visible={isZoomed} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsZoomed(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            minimumZoomScale={1}
            maximumZoomScale={zoomScale}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Image
              source={{ uri: imageUrl }}
              style={{ width: width * zoomScale, height: height * 0.8 }}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  zoomHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, TouchableOpacity, StyleSheet, Image, Modal, ScrollView, Dimensions } from 'react-native';"],
  };
}

// Image Zoom Click
export function generateRNImageZoomClick(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageZoomClickProps {
  imageUrl: string;
  thumbnailUrl?: string;
}

export default function ImageZoomClick({ imageUrl, thumbnailUrl }: ImageZoomClickProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsOpen(true)} activeOpacity={0.9}>
        <Image source={{ uri: thumbnailUrl || imageUrl }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.overlay}>
          <Ionicons name="search" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="zoom">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsOpen(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: width - 32, height: height * 0.7 }}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, TouchableOpacity, StyleSheet, Image, Modal, Dimensions } from 'react-native';"],
  };
}

// Before After Slider
export function generateRNBeforeAfterSlider(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, PanResponder, Animated } from 'react-native';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const { width } = Dimensions.get('window');
  const containerWidth = width - 32;
  const [sliderPosition, setSliderPosition] = useState(containerWidth / 2);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(containerWidth, sliderPosition + gestureState.dx));
      setSliderPosition(newPosition);
    },
    onPanResponderRelease: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(containerWidth, sliderPosition + gestureState.dx));
      setSliderPosition(newPosition);
    },
  });

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: afterImage }} style={styles.image} resizeMode="cover" />
        <View style={[styles.beforeContainer, { width: sliderPosition }]}>
          <Image source={{ uri: beforeImage }} style={[styles.image, { width: containerWidth }]} resizeMode="cover" />
        </View>
      </View>

      <View style={[styles.sliderLine, { left: sliderPosition }]} {...panResponder.panHandlers}>
        <View style={styles.sliderHandle}>
          <View style={styles.arrows}>
            <Text style={styles.arrow}>◄</Text>
            <Text style={styles.arrow}>►</Text>
          </View>
        </View>
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>{beforeLabel}</Text>
        <Text style={styles.label}>{afterLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  beforeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#fff',
    marginLeft: -2,
  },
  sliderHandle: {
    position: 'absolute',
    top: '50%',
    left: -18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  arrows: {
    flexDirection: 'row',
    gap: 4,
  },
  arrow: {
    fontSize: 12,
    color: '#374151',
  },
  labels: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, StyleSheet, Image, Dimensions, PanResponder, Animated } from 'react-native';"],
  };
}

// Media Carousel
export function generateRNMediaCarousel(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  autoPlay?: boolean;
  showDots?: boolean;
  onItemPress?: (item: MediaItem) => void;
}

export default function MediaCarousel({ items, showDots = true, onItemPress }: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % items.length;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    setActiveIndex(prevIndex);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.slide, { width }]}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.thumbnail || item.url }} style={styles.image} resizeMode="cover" />
            {item.type === 'video' && (
              <View style={styles.playButton}>
                <Ionicons name="play" size={40} color="#fff" />
              </View>
            )}
            {item.title && (
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{item.title}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={[styles.navButton, styles.navLeft]} onPress={handlePrev}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navButton, styles.navRight]} onPress={handleNext}>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>

      {showDots && (
        <View style={styles.dots}>
          {items.map((_, index) => (
            <View key={index} style={[styles.dot, activeIndex === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 250,
  },
  slide: {
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLeft: {
    left: 12,
  },
  navRight: {
    right: 12,
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
});`,
    imports: ["import React, { useState, useRef } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';"],
  };
}

// Video Player Embedded
export function generateRNVideoPlayerEmbedded(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerEmbeddedProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: string;
  onPlay?: () => void;
}

export default function VideoPlayerEmbedded({
  videoUrl,
  thumbnailUrl,
  title,
  duration,
  onPlay,
}: VideoPlayerEmbeddedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  return (
    <View style={styles.container}>
      {!isPlaying ? (
        <TouchableOpacity style={styles.thumbnailContainer} onPress={handlePlay}>
          <Image
            source={{ uri: thumbnailUrl || 'https://via.placeholder.com/640x360' }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#fff" />
            </View>
          </View>
          {duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.playerPlaceholder}>
          <Text style={styles.playingText}>Video playing...</Text>
          <Text style={styles.urlText}>{videoUrl}</Text>
          <TouchableOpacity style={styles.stopButton} onPress={() => setIsPlaying(false)}>
            <Ionicons name="stop" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playerPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  urlText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
  stopButton: {
    marginTop: 16,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
  },
  titleContainer: {
    padding: 12,
    backgroundColor: '#111827',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';"],
  };
}

// Video Player Custom
export function generateRNVideoPlayerCustom(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerCustomProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: string;
}

export default function VideoPlayerCustom({ videoUrl, thumbnailUrl, title, duration }: VideoPlayerCustomProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.videoArea}>
        <Image
          source={{ uri: thumbnailUrl || 'https://via.placeholder.com/640x360' }}
          style={styles.video}
          resizeMode="cover"
        />
        {!isPlaying && (
          <TouchableOpacity style={styles.playOverlay} onPress={() => setIsPlaying(true)}>
            <View style={styles.bigPlayButton}>
              <Ionicons name="play" size={48} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
          </View>
          <Text style={styles.timeText}>0:00 / {duration || '0:00'}</Text>
        </View>

        <TouchableOpacity onPress={() => setIsMuted(!isMuted)}>
          <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)}>
          <Ionicons name={isFullscreen ? 'contract' : 'expand'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoArea: {
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: '#1f2937',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  timeText: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 4,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    padding: 12,
    paddingTop: 0,
    backgroundColor: '#1f2937',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Audio Player
export function generateRNAudioPlayer(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  artist?: string;
  albumArt?: string;
  duration?: string;
}

export default function AudioPlayer({ audioUrl, title, artist, albumArt, duration = '0:00' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [currentTime, setCurrentTime] = useState('1:23');
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={styles.container}>
      {albumArt && (
        <Image source={{ uri: albumArt }} style={styles.albumArt} resizeMode="cover" />
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title || 'Unknown Track'}</Text>
        <Text style={styles.artist} numberOfLines={1}>{artist || 'Unknown Artist'}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
          <View style={[styles.progressKnob, { left: \`\${progress}%\` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.timeText}>{duration}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? '#ef4444' : '#6b7280'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={24} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(!isPlaying)}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={24} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  info: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Video Thumbnail Grid
export function generateRNVideoThumbnailGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoItem {
  id: string;
  thumbnail: string;
  title: string;
  duration: string;
  views?: string;
  author?: string;
}

interface VideoThumbnailGridProps {
  videos: VideoItem[];
  columns?: 2 | 3;
  onVideoPress?: (video: VideoItem) => void;
}

export default function VideoThumbnailGrid({ videos, columns = 2, onVideoPress }: VideoThumbnailGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 32 - (columns - 1) * 12) / columns;

  return (
    <FlatList
      data={videos}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.videoCard, { width: itemWidth }]}
          onPress={() => onVideoPress?.(item)}
        >
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
            <View style={styles.playIcon}>
              <Ionicons name="play" size={20} color="#fff" />
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            {item.author && <Text style={styles.author}>{item.author}</Text>}
            {item.views && <Text style={styles.views}>{item.views} views</Text>}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    gap: 12,
    marginBottom: 16,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
  },
  author: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  views: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';"],
  };
}

// Customer Reviews Carousel
export function generateRNCustomerReviewsCarousel(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string;
}

interface CustomerReviewsCarouselProps {
  reviews: Review[];
  title?: string;
}

export default function CustomerReviewsCarousel({ reviews, title = 'Customer Reviews' }: CustomerReviewsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = Dimensions.get('window');
  const cardWidth = width - 64;

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={16}
        color={i < rating ? '#f59e0b' : '#d1d5db'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <FlatList
        data={reviews}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + 16));
          setActiveIndex(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.reviewCard, { width: cardWidth }]}>
            <View style={styles.header}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.author[0]}</Text>
                </View>
              )}
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{item.author}</Text>
                <View style={styles.stars}>{renderStars(item.rating)}</View>
              </View>
            </View>
            <Text style={styles.reviewText} numberOfLines={4}>{item.text}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {reviews.map((_, index) => (
          <View key={index} style={[styles.dot, activeIndex === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
});`,
    imports: ["import React, { useRef, useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';"],
  };
}

// Playlist Interface
export function generateRNPlaylistInterface(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  albumArt?: string;
}

interface PlaylistInterfaceProps {
  title: string;
  description?: string;
  coverImage?: string;
  tracks: Track[];
  totalDuration?: string;
  onTrackPress?: (track: Track) => void;
  onShuffle?: () => void;
  onPlayAll?: () => void;
}

export default function PlaylistInterface({
  title,
  description,
  coverImage,
  tracks,
  totalDuration,
  onTrackPress,
  onShuffle,
  onPlayAll,
}: PlaylistInterfaceProps) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  const handleTrackPress = (track: Track) => {
    setCurrentTrackId(track.id);
    onTrackPress?.(track);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {coverImage && <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />}
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description} numberOfLines={2}>{description}</Text>}
          <Text style={styles.meta}>{tracks.length} songs • {totalDuration || '0 min'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.playButton} onPress={onPlayAll}>
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.playButtonText}>Play All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shuffleButton} onPress={onShuffle}>
          <Ionicons name="shuffle" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.trackRow, currentTrackId === item.id && styles.trackRowActive]}
            onPress={() => handleTrackPress(item)}
          >
            <Text style={styles.trackNumber}>{index + 1}</Text>
            {item.albumArt && <Image source={{ uri: item.albumArt }} style={styles.trackArt} />}
            <View style={styles.trackInfo}>
              <Text style={[styles.trackTitle, currentTrackId === item.id && styles.trackTitleActive]}>
                {item.title}
              </Text>
              <Text style={styles.trackArtist}>{item.artist}</Text>
            </View>
            <Text style={styles.trackDuration}>{item.duration}</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
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
    padding: 16,
    gap: 16,
  },
  coverImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shuffleButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  trackRowActive: {
    backgroundColor: '#eff6ff',
  },
  trackNumber: {
    width: 24,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  trackArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginLeft: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  trackTitleActive: {
    color: '#3b82f6',
  },
  trackArtist: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';"],
  };
}
