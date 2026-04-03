/**
 * React Native Media Component Generators
 *
 * Generates media components for React Native including:
 * - ImageGallery
 * - ImagePicker
 * - MediaPlayer
 * - FilePicker
 * - CachedImage
 */

// ============================================
// ImageGallery Component
// ============================================

/**
 * Generate ImageGallery component for React Native
 */
export function generateImageGallery(): string {
  return `import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GalleryImage {
  id: string;
  uri: string;
  thumbnail?: string;
  title?: string;
  description?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: number;
  showTitle?: boolean;
  onImagePress?: (image: GalleryImage, index: number) => void;
  enableLightbox?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  showTitle = false,
  onImagePress,
  enableLightbox = true,
  style,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const imageSize = (SCREEN_WIDTH - gap * (columns + 1)) / columns;

  const handlePress = (image: GalleryImage, index: number) => {
    if (onImagePress) {
      onImagePress(image, index);
    } else if (enableLightbox) {
      setLightboxIndex(index);
    }
  };

  const renderImage = ({ item, index }: { item: GalleryImage; index: number }) => (
    <TouchableOpacity
      style={[styles.imageContainer, { width: imageSize, height: imageSize, margin: gap / 2 }]}
      onPress={() => handlePress(item, index)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnail || item.uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderLightboxItem = ({ item }: { item: GalleryImage }) => (
    <View style={styles.lightboxImageContainer}>
      <Image
        source={{ uri: item.uri }}
        style={styles.lightboxImage}
        resizeMode="contain"
      />
      {showTitle && item.title && (
        <View style={styles.lightboxCaption}>
          <Text style={styles.lightboxTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.lightboxDescription}>{item.description}</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        contentContainerStyle={{ padding: gap / 2 }}
        showsVerticalScrollIndicator={false}
      />

      {enableLightbox && lightboxIndex !== null && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setLightboxIndex(null)}
        >
          <View style={styles.lightbox}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLightboxIndex(null)}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <FlatList
              ref={flatListRef}
              data={images}
              renderItem={renderLightboxItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              initialScrollIndex={lightboxIndex}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(_data, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
            />

            <View style={styles.lightboxPagination}>
              <Text style={styles.paginationText}>
                {lightboxIndex + 1} / {images.length}
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  closeButton: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  lightboxImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  lightboxCaption: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  lightboxTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  lightboxDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  lightboxPagination: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paginationText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default ImageGallery;
`;
}

// ============================================
// ImagePicker Component
// ============================================

/**
 * Generate ImagePicker component for React Native
 */
export function generateImagePicker(): string {
  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface ImagePickerProps {
  value?: string;
  onChange: (uri: string | null) => void;
  label?: string;
  placeholder?: string;
  aspectRatio?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  maxSize?: { width: number; height: number };
  disabled?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

export function ImagePicker({
  value,
  onChange,
  label,
  placeholder = 'Tap to select an image',
  aspectRatio,
  quality = 0.8,
  allowsEditing = true,
  maxSize,
  disabled = false,
  error,
  style,
}: ImagePickerProps) {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ExpoImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const pickImage = async (source: 'camera' | 'library') => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert('Permission Required', 'Please grant camera and photo library permissions.');
      return;
    }

    setLoading(true);

    try {
      const options: ExpoImagePicker.ImagePickerOptions = {
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect: aspectRatio,
        quality,
      };

      let result;
      if (source === 'camera') {
        result = await ExpoImagePicker.launchCameraAsync(options);
      } else {
        result = await ExpoImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setLoading(false);
    }
  };

  const showOptions = () => {
    if (disabled) return;

    Alert.alert('Select Image', 'Choose a source', [
      { text: 'Camera', onPress: () => pickImage('camera') },
      { text: 'Photo Library', onPress: () => pickImage('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemove = () => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
    ]);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.picker,
          value && styles.pickerWithImage,
          error && styles.pickerError,
          disabled && styles.pickerDisabled,
        ]}
        onPress={showOptions}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : value ? (
          <>
            <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  picker: {
    height: 200,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  pickerWithImage: {
    borderStyle: 'solid',
    borderColor: '#D1D5DB',
  },
  pickerError: {
    borderColor: '#EF4444',
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default ImagePicker;
`;
}

// ============================================
// MediaPlayer Component
// ============================================

/**
 * Generate MediaPlayer component for React Native
 */
export function generateMediaPlayer(): string {
  return `import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface MediaPlayerProps {
  source: { uri: string } | number;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  resizeMode?: ResizeMode;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function MediaPlayer({
  source,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  resizeMode = ResizeMode.CONTAIN,
  onPlay,
  onPause,
  onEnd,
  onError,
  style,
}: MediaPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);

  const isPlaying = status?.isLoaded && status.isPlaying;
  const duration = status?.isLoaded ? status.durationMillis || 0 : 0;
  const position = status?.isLoaded ? status.positionMillis || 0 : 0;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      onPause?.();
    } else {
      await videoRef.current.playAsync();
      onPlay?.();
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);

    if (playbackStatus.isLoaded && playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      onEnd?.();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => controls && setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          source={source}
          posterSource={poster ? { uri: poster } : undefined}
          usePoster={!!poster}
          resizeMode={resizeMode}
          shouldPlay={autoPlay}
          isLooping={loop}
          isMuted={muted}
          style={styles.video}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(error) => onError?.(error)}
        />

        {controls && showControls && (
          <View style={styles.controlsOverlay}>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={48}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progress,
                    { width: duration ? \`\${(position / duration) * 100}%\` : '0%' },
                  ]}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});

export default MediaPlayer;
`;
}

// ============================================
// FilePicker Component
// ============================================

/**
 * Generate FilePicker component for React Native
 */
export function generateFilePicker(): string {
  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface PickedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface FilePickerProps {
  value?: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  label?: string;
  placeholder?: string;
  allowedTypes?: string[];
  maxSize?: number;
  disabled?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return \`\${bytes} B\`;
  if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(1)} KB\`;
  return \`\${(bytes / (1024 * 1024)).toFixed(1)} MB\`;
};

const getFileIcon = (mimeType?: string): keyof typeof Ionicons.glyphMap => {
  if (!mimeType) return 'document-outline';
  if (mimeType.startsWith('image/')) return 'image-outline';
  if (mimeType.startsWith('video/')) return 'videocam-outline';
  if (mimeType.startsWith('audio/')) return 'musical-notes-outline';
  if (mimeType.includes('pdf')) return 'document-text-outline';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'grid-outline';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document-outline';
  return 'document-outline';
};

export function FilePicker({
  value,
  onChange,
  label,
  placeholder = 'Tap to select a file',
  allowedTypes,
  maxSize,
  disabled = false,
  error,
  style,
}: FilePickerProps) {
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    if (disabled) return;

    setLoading(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes || '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];

        if (maxSize && file.size && file.size > maxSize) {
          Alert.alert('File Too Large', \`Maximum file size is \${formatFileSize(maxSize)}\`);
          return;
        }

        onChange({
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick file');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    Alert.alert('Remove File', 'Are you sure you want to remove this file?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
    ]);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.picker,
          value && styles.pickerWithFile,
          error && styles.pickerError,
          disabled && styles.pickerDisabled,
        ]}
        onPress={value ? undefined : pickFile}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : value ? (
          <View style={styles.fileInfo}>
            <Ionicons name={getFileIcon(value.mimeType)} size={32} color="#3B82F6" />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {value.name}
              </Text>
              {value.size && (
                <Text style={styles.fileSize}>{formatFileSize(value.size)}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  picker: {
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  pickerWithFile: {
    borderStyle: 'solid',
    borderColor: '#D1D5DB',
  },
  pickerError: {
    borderColor: '#EF4444',
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default FilePicker;
`;
}

// ============================================
// CachedImage Component
// ============================================

/**
 * Generate CachedImage component for React Native
 */
export function generateCachedImage(): string {
  return `import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ImageStyle,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  showLoadingIndicator?: boolean;
  blurRadius?: number;
  fadeDuration?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function CachedImage({
  source,
  style,
  containerStyle,
  resizeMode = 'cover',
  placeholder,
  fallback,
  showLoadingIndicator = true,
  blurRadius,
  fadeDuration = 300,
  onLoad,
  onError,
}: CachedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  if (error) {
    return (
      <View style={[styles.container, styles.fallback, containerStyle, style as ViewStyle]}>
        {fallback || (
          <Ionicons name="image-outline" size={32} color="#D1D5DB" />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {loading && (
        <View style={[styles.loading, style as ViewStyle]}>
          {placeholder || (showLoadingIndicator && (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ))}
        </View>
      )}
      <Image
        source={source}
        style={[style, loading && styles.hidden]}
        resizeMode={resizeMode}
        blurRadius={blurRadius}
        onLoad={handleLoad}
        onError={handleError}
        fadeDuration={fadeDuration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  hidden: {
    opacity: 0,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});

export default CachedImage;
`;
}
