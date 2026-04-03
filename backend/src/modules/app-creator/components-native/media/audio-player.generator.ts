/**
 * Audio Player Component Generators (React Native)
 *
 * Generates audio player, track list, and album grid components for React Native.
 * Uses expo-av for audio playback.
 */

export interface AudioPlayerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAudioPlayer(options: AudioPlayerOptions = {}): string {
  const { componentName = 'AudioPlayer' } = options;

  return `import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover_url?: string;
  duration?: number;
}

interface ${componentName}Props {
  track: Track;
  onNext?: () => void;
  onPrevious?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ track, onNext, onPrevious }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    loadAudio();
  }, [track.src]);

  const loadAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.src },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setDuration((status.durationMillis || 0) / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        if (isRepeat) {
          soundRef.current?.replayAsync();
        } else {
          onNext?.();
        }
      }
    }
  };

  const togglePlay = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const handleSeek = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value * 1000);
    }
  };

  const toggleMute = async () => {
    if (soundRef.current) {
      await soundRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <View style={styles.container}>
      {/* Track Info */}
      <View style={styles.trackInfo}>
        {track.cover_url ? (
          <Image source={{ uri: track.cover_url }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="musical-notes" size={32} color="#9333EA" />
          </View>
        )}
        <View style={styles.trackDetails}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#EF4444' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={currentTime}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#9333EA"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#9333EA"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsShuffle(!isShuffle)}
          >
            <Ionicons
              name="shuffle"
              size={20}
              color={isShuffle ? '#9333EA' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.controlButton} onPress={onPrevious}>
            <Ionicons name="play-skip-back" size={28} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FFFFFF"
              style={!isPlaying && { marginLeft: 4 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={onNext}>
            <Ionicons name="play-skip-forward" size={28} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsRepeat(!isRepeat)}
          >
            <Ionicons
              name="repeat"
              size={20}
              color={isRepeat ? '#9333EA' : '#9CA3AF'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  trackArtist: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  likeButton: {
    padding: 8,
  },
  progressContainer: {
    marginTop: 20,
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
    fontSize: 12,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ${componentName};
`;
}

export function generateTrackList(options: AudioPlayerOptions = {}): string {
  const { componentName = 'TrackList', endpoint = '/tracks' } = options;

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
  albumId?: string;
  playlistId?: string;
  currentTrackId?: string;
  isPlaying?: boolean;
  onSelectTrack: (track: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  albumId,
  playlistId,
  currentTrackId,
  isPlaying,
  onSelectTrack,
}) => {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks', albumId, playlistId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (albumId) params.append('album_id', albumId);
      if (playlistId) params.append('playlist_id', playlistId);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
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

  const renderTrack = ({ item: track, index }: { item: any; index: number }) => {
    const isCurrent = currentTrackId === track.id;
    return (
      <TouchableOpacity
        style={[styles.trackItem, isCurrent && styles.trackItemCurrent]}
        onPress={() => onSelectTrack(track)}
        activeOpacity={0.7}
      >
        <View style={styles.trackNumber}>
          {isCurrent && isPlaying ? (
            <View style={styles.playingIndicator}>
              <View style={[styles.bar, styles.bar1]} />
              <View style={[styles.bar, styles.bar2]} />
              <View style={[styles.bar, styles.bar3]} />
            </View>
          ) : (
            <Text style={styles.numberText}>{index + 1}</Text>
          )}
        </View>
        {track.cover_url ? (
          <Image source={{ uri: track.cover_url }} style={styles.trackCover} />
        ) : (
          <View style={styles.trackCoverPlaceholder}>
            <Ionicons name="musical-note" size={16} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackTitle, isCurrent && styles.trackTitleCurrent]}
            numberOfLines={1}
          >
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
        {track.duration && (
          <Text style={styles.trackDuration}>{track.duration}</Text>
        )}
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  trackItemCurrent: {
    backgroundColor: '#F3E8FF',
  },
  trackNumber: {
    width: 24,
    alignItems: 'center',
  },
  numberText: {
    fontSize: 14,
    color: '#6B7280',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  bar: {
    width: 3,
    backgroundColor: '#9333EA',
    borderRadius: 1,
  },
  bar1: {
    height: 16,
  },
  bar2: {
    height: 12,
  },
  bar3: {
    height: 8,
  },
  trackCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  trackCoverPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  trackTitleCurrent: {
    color: '#9333EA',
  },
  trackArtist: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

export default ${componentName};
`;
}

export function generateAlbumGrid(options: AudioPlayerOptions = {}): string {
  const { componentName = 'AlbumGrid', endpoint = '/albums' } = options;

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
  onAlbumPress?: (album: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onAlbumPress }) => {
  const navigation = useNavigation<any>();

  const { data: albums, isLoading, refetch } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleAlbumPress = (album: any) => {
    if (onAlbumPress) {
      onAlbumPress(album);
    } else {
      navigation.navigate('AlbumDetail', { id: album.id });
    }
  };

  const renderAlbum = ({ item: album }: { item: any }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() => handleAlbumPress(album)}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        {album.cover_url ? (
          <Image source={{ uri: album.cover_url }} style={styles.albumCover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="musical-notes" size={48} color="#9333EA" />
          </View>
        )}
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
      <Text style={styles.albumTitle} numberOfLines={1}>
        {album.title}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {album.artist}
      </Text>
      {album.year && <Text style={styles.albumYear}>{album.year}</Text>}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!albums?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="albums-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No albums found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={albums}
      renderItem={renderAlbum}
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
  albumCard: {
    width: CARD_WIDTH,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  albumCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  albumTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  albumArtist: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  albumYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}
