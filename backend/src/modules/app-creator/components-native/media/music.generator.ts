/**
 * Music Component Generators (React Native)
 *
 * Generates music player, playlist, artist card, and now playing components.
 */

export interface MusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMusicPlayerFull(options: MusicOptions = {}): string {
  const { componentName = 'MusicPlayerFull' } = options;

  return `import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  src: string;
  cover_url?: string;
  duration?: number;
}

interface ${componentName}Props {
  track: Track;
  onNext?: () => void;
  onPrevious?: () => void;
  onClose?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  track,
  onNext,
  onPrevious,
  onClose,
}) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    loadAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [track.src]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isPlaying]);

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

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>PLAYING FROM</Text>
          <Text style={styles.headerTitle}>{track.album || 'Unknown Album'}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.artworkContainer}>
        <Animated.View style={[styles.artworkWrapper, { transform: [{ rotate: rotateInterpolate }] }]}>
          {track.cover_url ? (
            <Image source={{ uri: track.cover_url }} style={styles.artwork} />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <Ionicons name="musical-notes" size={80} color="#FFFFFF" />
            </View>
          )}
        </Animated.View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackTitleRow}>
          <View style={styles.trackTitleContainer}>
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
              size={28}
              color={isLiked ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={currentTime}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          thumbTintColor="#FFFFFF"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsShuffle(!isShuffle)}
        >
          <Ionicons
            name="shuffle"
            size={24}
            color={isShuffle ? '#1DB954' : 'rgba(255, 255, 255, 0.7)'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={onPrevious}>
          <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color="#000000"
            style={!isPlaying && { marginLeft: 4 }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={onNext}>
          <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsRepeat(!isRepeat)}
        >
          <Ionicons
            name="repeat"
            size={24}
            color={isRepeat ? '#1DB954' : 'rgba(255, 255, 255, 0.7)'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="phone-portrait-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="share-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="list" size={22} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artworkWrapper: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    borderRadius: (SCREEN_WIDTH - 80) / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: (SCREEN_WIDTH - 80) / 2,
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (SCREEN_WIDTH - 80) / 2,
  },
  trackInfo: {
    marginBottom: 24,
  },
  trackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trackArtist: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  likeButton: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 16,
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
    color: 'rgba(255, 255, 255, 0.5)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  secondaryButton: {
    padding: 12,
  },
  skipButton: {
    padding: 12,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomButton: {
    padding: 12,
  },
});

export default ${componentName};
`;
}

export function generateMiniPlayer(options: MusicOptions = {}): string {
  const { componentName = 'MiniPlayer' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
}

interface ${componentName}Props {
  track: Track;
  isPlaying: boolean;
  progress?: number;
  onPlay: () => void;
  onNext: () => void;
  onPress: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  track,
  isPlaying,
  progress = 0,
  onPlay,
  onNext,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
      </View>

      <View style={styles.content}>
        {/* Track Info */}
        <View style={styles.trackInfo}>
          {track.cover_url ? (
            <Image source={{ uri: track.cover_url }} style={styles.cover} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="musical-notes" size={20} color="#1DB954" />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {track.artist}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={onPlay}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#FFFFFF"
              style={!isPlaying && { marginLeft: 2 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={onNext}>
            <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282828',
    overflow: 'hidden',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#404040',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    paddingHorizontal: 12,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  coverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  artist: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
  },
});

export default ${componentName};
`;
}

export function generatePlaylistCard(options: MusicOptions = {}): string {
  const { componentName = 'PlaylistCard' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  track_count?: number;
  owner_name?: string;
  is_public?: boolean;
}

interface ${componentName}Props {
  playlist: Playlist;
  variant?: 'grid' | 'list';
  onPress?: () => void;
  onPlay?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  playlist,
  variant = 'grid',
  onPress,
  onPlay,
}) => {
  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listContainer} onPress={onPress} activeOpacity={0.7}>
        {playlist.cover_url ? (
          <Image source={{ uri: playlist.cover_url }} style={styles.listCover} />
        ) : (
          <View style={styles.listCoverPlaceholder}>
            <Ionicons name="musical-notes" size={24} color="#1DB954" />
          </View>
        )}
        <View style={styles.listInfo}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {playlist.title}
          </Text>
          <View style={styles.listMeta}>
            {playlist.owner_name && (
              <Text style={styles.listMetaText}>{playlist.owner_name}</Text>
            )}
            {playlist.track_count !== undefined && (
              <Text style={styles.listMetaText}>{playlist.track_count} songs</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridContainer} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.coverContainer}>
        {playlist.cover_url ? (
          <Image source={{ uri: playlist.cover_url }} style={styles.gridCover} />
        ) : (
          <View style={styles.gridCoverPlaceholder}>
            <Ionicons name="musical-notes" size={48} color="#1DB954" />
          </View>
        )}
        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
        >
          <Ionicons name="play" size={24} color="#000000" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
      <Text style={styles.gridTitle} numberOfLines={1}>
        {playlist.title}
      </Text>
      {playlist.description ? (
        <Text style={styles.gridDescription} numberOfLines={2}>
          {playlist.description}
        </Text>
      ) : (
        <Text style={styles.gridDescription}>
          {playlist.owner_name && \`By \${playlist.owner_name} \`}
          {playlist.track_count !== undefined && \`- \${playlist.track_count} songs\`}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List variant
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
  },
  listCover: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  listCoverPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  listMetaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Grid variant
  gridContainer: {
    width: 160,
  },
  coverContainer: {
    width: 160,
    height: 160,
    marginBottom: 12,
    position: 'relative',
  },
  gridCover: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  gridCoverPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    opacity: 0,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gridDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default ${componentName};
`;
}

export function generateArtistCard(options: MusicOptions = {}): string {
  const { componentName = 'ArtistCard' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Artist {
  id: string;
  name: string;
  image_url?: string;
  followers?: number;
  genres?: string[];
  is_verified?: boolean;
}

interface ${componentName}Props {
  artist: Artist;
  variant?: 'circle' | 'card';
  onPress?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  artist,
  variant = 'circle',
  onPress,
}) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ArtistDetail', { id: artist.id });
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return \`\${(count / 1000000).toFixed(1)}M followers\`;
    if (count >= 1000) return \`\${(count / 1000).toFixed(1)}K followers\`;
    return \`\${count} followers\`;
  };

  if (variant === 'card') {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={handlePress} activeOpacity={0.7}>
        {artist.image_url ? (
          <Image source={{ uri: artist.image_url }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="person" size={48} color="#1DB954" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {artist.name}
            </Text>
            {artist.is_verified && (
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
            )}
          </View>
          {artist.followers !== undefined && (
            <Text style={styles.cardFollowers}>{formatFollowers(artist.followers)}</Text>
          )}
          {artist.genres && artist.genres.length > 0 && (
            <Text style={styles.cardGenres} numberOfLines={1}>
              {artist.genres.slice(0, 3).join(', ')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.circleContainer} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {artist.image_url ? (
          <Image source={{ uri: artist.image_url }} style={styles.circleImage} />
        ) : (
          <View style={styles.circleImagePlaceholder}>
            <Ionicons name="person" size={32} color="#1DB954" />
          </View>
        )}
        {artist.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
          </View>
        )}
      </View>
      <Text style={styles.circleName} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={styles.circleLabel}>Artist</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Circle variant
  circleContainer: {
    width: 120,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  circleImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  circleImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#121212',
    borderRadius: 10,
  },
  circleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  circleLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },

  // Card variant
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#282828',
    borderRadius: 8,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cardImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardFollowers: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  cardGenres: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateQueueList(options: MusicOptions = {}): string {
  const { componentName = 'QueueList' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  duration?: string;
}

interface ${componentName}Props {
  currentTrack?: Track;
  queue: Track[];
  onSelectTrack: (track: Track, index: number) => void;
  onRemoveTrack?: (track: Track, index: number) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  currentTrack,
  queue,
  onSelectTrack,
  onRemoveTrack,
}) => {
  const renderTrack = ({ item: track, index }: { item: Track; index: number }) => {
    const isCurrent = currentTrack?.id === track.id;
    return (
      <TouchableOpacity
        style={[styles.trackItem, isCurrent && styles.trackItemCurrent]}
        onPress={() => onSelectTrack(track, index)}
        activeOpacity={0.7}
      >
        <View style={styles.dragHandle}>
          <Ionicons name="menu" size={20} color="rgba(255, 255, 255, 0.4)" />
        </View>
        {track.cover_url ? (
          <Image source={{ uri: track.cover_url }} style={styles.trackCover} />
        ) : (
          <View style={styles.trackCoverPlaceholder}>
            <Ionicons name="musical-note" size={16} color="#1DB954" />
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
        {track.duration && <Text style={styles.trackDuration}>{track.duration}</Text>}
        {onRemoveTrack && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveTrack(track, index)}
          >
            <Ionicons name="close" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Now Playing */}
      {currentTrack && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Now Playing</Text>
          <View style={styles.nowPlayingCard}>
            {currentTrack.cover_url ? (
              <Image source={{ uri: currentTrack.cover_url }} style={styles.nowPlayingCover} />
            ) : (
              <View style={styles.nowPlayingCoverPlaceholder}>
                <Ionicons name="musical-notes" size={24} color="#1DB954" />
              </View>
            )}
            <View style={styles.nowPlayingInfo}>
              <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
            <View style={styles.nowPlayingAnimation}>
              <View style={[styles.bar, styles.bar1]} />
              <View style={[styles.bar, styles.bar2]} />
              <View style={[styles.bar, styles.bar3]} />
            </View>
          </View>
        </View>
      )}

      {/* Queue */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next in Queue</Text>
          <Text style={styles.sectionCount}>{queue.length} songs</Text>
        </View>
        {queue.length > 0 ? (
          <FlatList
            data={queue}
            renderItem={renderTrack}
            keyExtractor={(item, index) => \`\${item.id}-\${index}\`}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color="rgba(255, 255, 255, 0.2)" />
            <Text style={styles.emptyText}>Queue is empty</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  nowPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#282828',
    borderRadius: 8,
  },
  nowPlayingCover: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  nowPlayingCoverPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DB954',
  },
  nowPlayingArtist: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  nowPlayingAnimation: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 24,
  },
  bar: {
    width: 4,
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  bar1: {
    height: 24,
  },
  bar2: {
    height: 16,
  },
  bar3: {
    height: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  trackItemCurrent: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  dragHandle: {
    padding: 4,
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
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  trackTitleCurrent: {
    color: '#1DB954',
  },
  trackArtist: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ${componentName};
`;
}
