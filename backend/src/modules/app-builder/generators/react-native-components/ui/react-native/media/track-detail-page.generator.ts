import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNTrackDetailPage = (resolved: ResolvedComponent) => {
  const dataSource = resolved.dataSource;

  const getEntityName = () => {
    if (!dataSource || dataSource.trim() === '') return 'tracks';
    const parts = dataSource.split('.');
    return parts[0] || 'tracks';
  };

  const entityName = getEntityName();

  return {
    code: `import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Track {
  id: string;
  title: string;
  artist_name?: string;
  artist_id?: string;
  album_name?: string;
  album_id?: string;
  cover_image?: string;
  track_url?: string;
  file_url?: string;
  duration_seconds?: number;
  genre?: string;
  description?: string;
  play_count?: number;
}

interface TrackDetailPageProps {
  data?: Track;
  trackId?: string;
  onBack?: () => void;
  [key: string]: any;
}

export default function TrackDetailPage({ data: propTrack, trackId, onBack }: TrackDetailPageProps) {
  const [fetchedTrack, setFetchedTrack] = useState<Track | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch track data if not provided
  useEffect(() => {
    const fetchData = async () => {
      if (propTrack) return;
      setFetchLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = trackId ? \`\${apiUrl}/${entityName}/\${trackId}\` : \`\${apiUrl}/${entityName}\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedTrack(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch track data:', err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [trackId]);

  const track = propTrack || fetchedTrack;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAudio = async () => {
    if (!track) return;

    const audioUrl = track.track_url || track.file_url;
    if (!audioUrl) return;

    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (track) {
      loadAudio();
    }
  }, [track]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlay = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const seekTo = async (position: number) => {
    if (!sound || !duration) return;

    try {
      await sound.setPositionAsync(position * duration * 1000);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  if (!track) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Track not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#581c87', '#1f2937', '#000000']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Album Art */}
          <View style={styles.artworkContainer}>
            {track.cover_image ? (
              <Image
                source={{ uri: track.cover_image }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artwork, styles.artworkPlaceholder]}>
                <Ionicons name="musical-notes" size={80} color="#9333ea" />
              </View>
            )}
          </View>

          {/* Track Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.badge}>TRACK</Text>
            <Text style={styles.title} numberOfLines={2}>{track.title}</Text>

            <View style={styles.metadata}>
              <Text style={styles.artist}>{track.artist_name || 'Unknown Artist'}</Text>
              {track.album_name && (
                <Text style={styles.metadataText}>• {track.album_name}</Text>
              )}
              {track.genre && (
                <View style={styles.genreBadge}>
                  <Text style={styles.genreText}>{track.genre}</Text>
                </View>
              )}
            </View>

            <View style={styles.stats}>
              {track.duration_seconds && (
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#d1d5db" />
                  <Text style={styles.statText}>{formatTime(track.duration_seconds)}</Text>
                </View>
              )}
              {track.play_count !== undefined && (
                <Text style={styles.statText}>{track.play_count.toLocaleString()} plays</Text>
              )}
            </View>

            {/* Main Controls */}
            <View style={styles.controlsMain}>
              <TouchableOpacity
                onPress={togglePlay}
                style={styles.playButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={36}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleLike}
                style={[styles.actionButton, isLiked && styles.actionButtonActive]}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? '#9333ea' : '#d1d5db'}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#d1d5db" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download-outline" size={24} color="#d1d5db" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            {track.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>About This Track</Text>
                <Text style={styles.description}>{track.description}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Player Controls */}
        <View style={styles.playerContainer}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: duration ? \`\${(currentTime / duration) * 100}%\` : '0%' }
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>
                {formatTime(duration || track.duration_seconds || 0)}
              </Text>
            </View>
          </View>

          {/* Playback Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="shuffle-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={togglePlay}
              style={styles.controlPlayButton}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="repeat-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  artwork: {
    width: width - 64,
    height: width - 64,
    borderRadius: 12,
  },
  artworkPlaceholder: {
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a78bfa',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  artist: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  metadataText: {
    fontSize: 16,
    color: '#d1d5db',
  },
  genreBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#c4b5fd',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  controlsMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#9333ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333ea',
  },
  timeContainer: {
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  controlPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});`,
    imports: [],
  };
};
