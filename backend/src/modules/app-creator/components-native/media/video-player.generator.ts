/**
 * Video Player Component Generators (React Native)
 *
 * Generates video player, playlist, and video grid components for React Native.
 * Uses expo-av for video playback.
 */

export interface VideoPlayerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVideoPlayer(options: VideoPlayerOptions = {}): string {
  const { componentName = 'VideoPlayer' } = options;

  return `import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  src: string;
  poster?: string;
  title?: string;
  onEnded?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ src, poster, title, onEnded }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const positionMillis = status?.isLoaded ? status.positionMillis : 0;
  const durationMillis = status?.isLoaded ? status.durationMillis || 0 : 0;

  const handlePlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    if (newStatus.isLoaded) {
      setIsPlaying(newStatus.isPlaying);
      setIsLoading(false);
      if (newStatus.didJustFinish) {
        onEnded?.();
      }
    }
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const skip = async (seconds: number) => {
    if (videoRef.current && status?.isLoaded) {
      const newPosition = Math.max(0, Math.min(positionMillis + seconds * 1000, durationMillis));
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleControls}
        style={styles.videoContainer}
      >
        <Video
          ref={videoRef}
          source={{ uri: src }}
          posterSource={poster ? { uri: poster } : undefined}
          usePoster={!!poster}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          shouldPlay={false}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !isLoading && (
          <TouchableOpacity style={styles.playOverlay} onPress={togglePlay}>
            <View style={styles.playButtonLarge}>
              <Ionicons name="play" size={40} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        )}

        {/* Controls */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {title && <Text style={styles.title}>{title}</Text>}

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={durationMillis || 1}
                value={positionMillis}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor="#9333EA"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#9333EA"
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
                <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
              </View>
            </View>

            {/* Control Buttons */}
            <View style={styles.controlsRow}>
              <View style={styles.leftControls}>
                <TouchableOpacity style={styles.controlButton} onPress={() => skip(-10)}>
                  <Ionicons name="play-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={togglePlay}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => skip(10)}>
                  <Ionicons name="play-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.rightControls}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                  <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="expand" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(147, 51, 234, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
  },
});

export default ${componentName};
`;
}

export function generatePlaylist(options: VideoPlayerOptions = {}): string {
  const { componentName = 'Playlist', endpoint = '/videos' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  playlistId?: string;
  currentVideoId?: string;
  onSelectVideo: (video: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  playlistId,
  currentVideoId,
  onSelectVideo,
}) => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const url = '${endpoint}' + (playlistId ? '?playlist_id=' + playlistId : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const renderVideo = ({ item: video, index }: { item: any; index: number }) => {
    const isCurrent = currentVideoId === video.id;
    return (
      <TouchableOpacity
        style={[styles.videoItem, isCurrent && styles.videoItemCurrent]}
        onPress={() => onSelectVideo(video)}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {video.thumbnail_url ? (
            <Image source={{ uri: video.thumbnail_url }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="play" size={24} color="#9CA3AF" />
            </View>
          )}
          {isCurrent && (
            <View style={styles.playingOverlay}>
              <Ionicons name="play" size={20} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={styles.videoInfo}>
          <Text
            style={[styles.videoTitle, isCurrent && styles.videoTitleCurrent]}
            numberOfLines={2}
          >
            {video.title}
          </Text>
          <View style={styles.videoMeta}>
            <Text style={styles.videoIndex}>{index + 1}</Text>
            {video.duration && (
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            )}
            {video.watched && (
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlist</Text>
        <Text style={styles.headerCount}>{videos?.length || 0} videos</Text>
      </View>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  listContent: {
    maxHeight: 400,
  },
  videoItem: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  videoItemCurrent: {
    backgroundColor: '#F3E8FF',
  },
  thumbnailContainer: {
    width: 96,
    height: 54,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  videoTitleCurrent: {
    color: '#9333EA',
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoIndex: {
    fontSize: 12,
    color: '#6B7280',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

export default ${componentName};
`;
}

export function generateVideoGrid(options: VideoPlayerOptions = {}): string {
  const { componentName = 'VideoGrid', endpoint = '/videos' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface ${componentName}Props {
  category?: string;
  onVideoPress?: (video: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category, onVideoPress }) => {
  const navigation = useNavigation<any>();

  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ['videos', category],
    queryFn: async () => {
      const url = '${endpoint}' + (category ? '?category=' + category : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleVideoPress = (video: any) => {
    if (onVideoPress) {
      onVideoPress(video);
    } else {
      navigation.navigate('VideoDetail', { id: video.id });
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return \`\${(views / 1000000).toFixed(1)}M\`;
    if (views >= 1000) return \`\${(views / 1000).toFixed(1)}K\`;
    return views.toString();
  };

  const renderVideo = ({ item: video }: { item: any }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => handleVideoPress(video)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        {video.thumbnail_url ? (
          <Image source={{ uri: video.thumbnail_url }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="play" size={32} color="#9CA3AF" />
          </View>
        )}
        {video.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>
        {video.channel_name && (
          <Text style={styles.channelName}>{video.channel_name}</Text>
        )}
        <View style={styles.metaRow}>
          {video.views !== undefined && (
            <Text style={styles.metaText}>
              <Ionicons name="eye-outline" size={12} color="#6B7280" />{' '}
              {formatViews(video.views)}
            </Text>
          )}
          {video.published_at && (
            <Text style={styles.metaText}>
              {new Date(video.published_at).toLocaleDateString()}
            </Text>
          )}
        </View>
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

  if (!videos?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="play-circle-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No videos found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      renderItem={renderVideo}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6B7280" />
      }
    />
  );
};

const styles = StyleSheet.create({
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
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  videoCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}
