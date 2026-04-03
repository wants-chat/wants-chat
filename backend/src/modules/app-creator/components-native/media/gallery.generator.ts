/**
 * Gallery Component Generators (React Native)
 *
 * Generates gallery, lightbox, and image upload components for React Native.
 */

export interface GalleryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateGallery(options: GalleryOptions = {}): string {
  const { componentName = 'Gallery', endpoint = '/images' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  albumId?: string;
  columns?: 2 | 3 | 4;
}

const ${componentName}: React.FC<${componentName}Props> = ({ albumId, columns = 3 }) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const { data: images, isLoading, refetch } = useQuery({
    queryKey: ['gallery', albumId],
    queryFn: async () => {
      const url = '${endpoint}' + (albumId ? '?album_id=' + albumId : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const imageSize = (SCREEN_WIDTH - 16 - (columns - 1) * 4) / columns;

  const renderImage = ({ item: image }: { item: any }) => (
    <TouchableOpacity
      style={[styles.imageContainer, { width: imageSize, height: imageSize }]}
      onPress={() => setSelectedImage(image)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: image.thumbnail_url || image.url }}
        style={styles.gridImage}
      />
      <View style={styles.imageOverlay}>
        <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!images?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No images found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        key={columns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6B7280" />
        }
      />

      {/* Lightbox Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.lightboxContent}>
              <Image
                source={{ uri: selectedImage.url }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
              {selectedImage.title && (
                <View style={styles.lightboxInfo}>
                  <Text style={styles.lightboxTitle}>{selectedImage.title}</Text>
                  {selectedImage.description && (
                    <Text style={styles.lightboxDescription}>
                      {selectedImage.description}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.lightboxActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    padding: 8,
  },
  row: {
    gap: 4,
    marginBottom: 4,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  lightboxContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  lightboxImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    maxHeight: '70%',
  },
  lightboxInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  lightboxTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lightboxDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
    textAlign: 'center',
  },
  lightboxActions: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
});

export default ${componentName};
`;
}

export function generateLightbox(options: GalleryOptions = {}): string {
  const { componentName = 'Lightbox' } = options;

  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

interface ${componentName}Props {
  images: ImageItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const currentImage = images[currentIndex];

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const renderImage = ({ item }: { item: ImageItem }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.url }} style={styles.fullImage} resizeMode="contain" />
    </View>
  );

  const renderThumbnail = ({ item, index }: { item: ImageItem; index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        index === currentIndex && styles.thumbnailActive,
      ]}
      onPress={() => goToIndex(index)}
    >
      <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.counter}>
              {currentIndex + 1} / {images.length}
            </Text>
            {currentImage?.title && (
              <Text style={styles.title} numberOfLines={1}>
                {currentImage.title}
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="add-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="remove-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="download-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Image */}
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          initialScrollIndex={initialIndex}
          getItemLayout={(_data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={() => goToIndex(currentIndex - 1)}
              >
                <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={() => goToIndex(currentIndex + 1)}
              >
                <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <View style={styles.thumbnailsContainer}>
            <FlatList
              data={images}
              renderItem={renderThumbnail}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsList}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  headerInfo: {
    flex: 1,
  },
  counter: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  thumbnailsList: {
    justifyContent: 'center',
    gap: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.6,
  },
  thumbnailActive: {
    borderColor: '#FFFFFF',
    opacity: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default ${componentName};
`;
}

export function generateImageUpload(options: GalleryOptions = {}): string {
  const { componentName = 'ImageUpload', endpoint = '/images' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onUploadComplete?: (images: any[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onUploadComplete,
  multiple = true,
  maxFiles = 10,
}) => {
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (uris: string[]) => {
      const formData = new FormData();
      uris.forEach((uri, index) => {
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: \`image_\${index}.jpg\`,
        } as any);
      });
      const response = await api.post('${endpoint}/upload', formData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      Alert.alert('Success', 'Images uploaded successfully!');
      onUploadComplete?.(data);
      setSelectedImages([]);
    },
    onError: () => Alert.alert('Error', 'Failed to upload images'),
  });

  const handlePickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple,
      quality: 0.8,
      selectionLimit: maxFiles,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      const combined = multiple
        ? [...selectedImages, ...newImages].slice(0, maxFiles)
        : [newImages[0]];
      setSelectedImages(combined);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage = result.assets[0].uri;
      const combined = multiple
        ? [...selectedImages, newImage].slice(0, maxFiles)
        : [newImage];
      setSelectedImages(combined);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedImages.length > 0) {
      uploadMutation.mutate(selectedImages);
    }
  };

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imagePreview}>
      <Image source={{ uri: item }} style={styles.previewImage} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Upload Area */}
      <View style={styles.uploadArea}>
        <TouchableOpacity style={styles.uploadButton} onPress={handlePickImages}>
          <Ionicons name="images-outline" size={32} color="#6B7280" />
          <Text style={styles.uploadText}>Choose from Library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={handleTakePhoto}>
          <Ionicons name="camera-outline" size={32} color="#6B7280" />
          <Text style={styles.uploadText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helperText}>
        {multiple ? \`Up to \${maxFiles} images\` : 'Single image'} - PNG, JPG, GIF
      </Text>

      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <View style={styles.previewContainer}>
          <FlatList
            data={selectedImages}
            renderItem={renderImage}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.previewList}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              uploadMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  Upload {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  uploadArea: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  uploadButton: {
    flex: 1,
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  previewContainer: {
    marginTop: 8,
  },
  previewList: {
    gap: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#9333EA',
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ${componentName};
`;
}
