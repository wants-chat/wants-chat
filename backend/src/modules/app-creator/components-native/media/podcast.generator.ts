/**
 * Podcast Component Generators (React Native)
 *
 * Generates podcast player, episode list, podcast grid, search, and episode card components.
 */

export interface PodcastOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePodcastPlayer(options: PodcastOptions = {}): string {
  const { componentName = 'PodcastPlayer' } = options;

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

interface Episode {
  id: string;
  title: string;
  podcast_name: string;
  src: string;
  cover_url?: string;
  duration?: number;
}

interface ${componentName}Props {
  episode: Episode;
  onNext?: () => void;
  onPrevious?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ episode, onNext, onPrevious }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    loadAudio();
  }, [episode.src]);

  const loadAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: episode.src },
        { shouldPlay: false, rate: playbackRate },
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
        onNext?.();
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

  const skip = async (seconds: number) => {
    if (soundRef.current) {
      const newPosition = Math.max(0, Math.min((currentTime + seconds) * 1000, duration * 1000));
      await soundRef.current.setPositionAsync(newPosition);
    }
  };

  const handleSeek = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value * 1000);
    }
  };

  const changePlaybackRate = async () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (soundRef.current) {
      await soundRef.current.setRateAsync(nextRate, true);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    if (hours > 0) {
      return \`\${hours}:\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
    }
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.episodeInfo}>
        {episode.cover_url ? (
          <Image source={{ uri: episode.cover_url }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="mic" size={48} color="#9333EA" />
          </View>
        )}
        <View style={styles.episodeDetails}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {episode.title}
          </Text>
          <Text style={styles.podcastName}>{episode.podcast_name}</Text>
        </View>
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
          <Text style={styles.timeText}>-{formatTime(duration - currentTime)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.skipButton} onPress={() => skip(-15)}>
            <Text style={styles.skipLabel}>15</Text>
            <Ionicons name="play-back" size={24} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FFFFFF"
              style={!isPlaying && { marginLeft: 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={() => skip(30)}>
            <Ionicons name="play-forward" size={24} color="#374151" />
            <Text style={styles.skipLabel}>30</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryControls}>
          <TouchableOpacity style={styles.rateButton} onPress={changePlaybackRate}>
            <Text style={styles.rateText}>{playbackRate}x</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={20}
              color="#6B7280"
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  episodeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  coverImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  coverPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  podcastName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
    color: '#6B7280',
  },
  controls: {
    gap: 16,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  skipLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  rateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  iconButton: {
    padding: 8,
  },
});

export default ${componentName};
`;
}

export function generateEpisodeList(options: PodcastOptions = {}): string {
  const { componentName = 'EpisodeList', endpoint = '/episodes' } = options;

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
  podcastId?: string;
  currentEpisodeId?: string;
  onSelectEpisode: (episode: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  podcastId,
  currentEpisodeId,
  onSelectEpisode,
}) => {
  const { data: episodes, isLoading } = useQuery({
    queryKey: ['episodes', podcastId],
    queryFn: async () => {
      const url = '${endpoint}' + (podcastId ? '?podcast_id=' + podcastId : '');
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

  const renderEpisode = ({ item: episode }: { item: any }) => {
    const isCurrent = currentEpisodeId === episode.id;
    return (
      <View style={[styles.episodeCard, isCurrent && styles.episodeCardCurrent]}>
        <View style={styles.episodeContent}>
          {episode.cover_url ? (
            <Image source={{ uri: episode.cover_url }} style={styles.episodeCover} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="mic" size={32} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.episodeInfo}>
            <Text
              style={[styles.episodeTitle, isCurrent && styles.episodeTitleCurrent]}
              numberOfLines={2}
            >
              {episode.title}
            </Text>
            {episode.description && (
              <Text style={styles.episodeDescription} numberOfLines={2}>
                {episode.description}
              </Text>
            )}
            <View style={styles.metaRow}>
              {episode.published_at && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.metaText}>
                    {new Date(episode.published_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {episode.duration && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color="#6B7280" />
                  <Text style={styles.metaText}>{episode.duration}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.episodeActions}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onSelectEpisode(episode)}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="download-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={episodes}
      renderItem={renderEpisode}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  episodeCard: {
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
  episodeCardCurrent: {
    borderColor: '#9333EA',
    borderWidth: 2,
  },
  episodeContent: {
    flexDirection: 'row',
    gap: 12,
  },
  episodeCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  episodeTitleCurrent: {
    color: '#9333EA',
  },
  episodeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  episodeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
});

export default ${componentName};
`;
}

export function generatePodcastGrid(options: PodcastOptions = {}): string {
  const { componentName = 'PodcastGrid', endpoint = '/podcasts' } = options;

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
  onPodcastPress?: (podcast: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onPodcastPress }) => {
  const navigation = useNavigation<any>();

  const { data: podcasts, isLoading, refetch } = useQuery({
    queryKey: ['podcasts'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handlePodcastPress = (podcast: any) => {
    if (onPodcastPress) {
      onPodcastPress(podcast);
    } else {
      navigation.navigate('PodcastDetail', { id: podcast.id });
    }
  };

  const renderPodcast = ({ item: podcast }: { item: any }) => (
    <TouchableOpacity
      style={styles.podcastCard}
      onPress={() => handlePodcastPress(podcast)}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        {podcast.cover_url ? (
          <Image source={{ uri: podcast.cover_url }} style={styles.podcastCover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="mic" size={48} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#9333EA" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </View>
      <View style={styles.podcastInfo}>
        <Text style={styles.podcastTitle} numberOfLines={1}>
          {podcast.title}
        </Text>
        {podcast.author && (
          <Text style={styles.podcastAuthor} numberOfLines={1}>
            {podcast.author}
          </Text>
        )}
        {podcast.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{podcast.category}</Text>
          </View>
        )}
        {podcast.episode_count !== undefined && (
          <Text style={styles.episodeCount}>{podcast.episode_count} episodes</Text>
        )}
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

  if (!podcasts?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="mic-off-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No podcasts found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={podcasts}
      renderItem={renderPodcast}
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
  podcastCard: {
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
  coverContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  podcastCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastInfo: {
    padding: 12,
  },
  podcastTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  podcastAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#9333EA',
    fontWeight: '500',
  },
  episodeCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
});

export default ${componentName};
`;
}

export function generatePodcastSearch(options: PodcastOptions = {}): string {
  const { componentName = 'PodcastSearch', endpoint = '/podcasts/search' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
  onSelect?: (podcast: any) => void;
  placeholder?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSelect,
  placeholder = 'Search podcasts...',
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('');

  const debounceSearch = useCallback((value: string) => {
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    debounceSearch(value);
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['podcast-search', debouncedQuery, category],
    queryFn: async () => {
      if (!debouncedQuery && !category) return [];
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (category) params.append('category', category);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!(debouncedQuery || category),
  });

  const categories = [
    'Technology', 'Business', 'Comedy', 'News', 'Education',
    'Health', 'Sports', 'Music', 'True Crime', 'Society',
  ];

  const renderResult = ({ item: podcast }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onSelect?.(podcast)}
      activeOpacity={0.7}
    >
      {podcast.cover_url ? (
        <Image source={{ uri: podcast.cover_url }} style={styles.resultCover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons name="mic" size={24} color="#FFFFFF" />
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {podcast.title}
        </Text>
        <Text style={styles.resultAuthor}>{podcast.author}</Text>
        <View style={styles.resultMeta}>
          {podcast.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{podcast.category}</Text>
            </View>
          )}
          {podcast.episode_count !== undefined && (
            <Text style={styles.episodeCount}>{podcast.episode_count} episodes</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        {query && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setQuery('');
              setDebouncedQuery('');
            }}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="filter"
            size={18}
            color={showFilters ? '#9333EA' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  category === item && styles.filterChipActive,
                ]}
                onPress={() => setCategory(category === item ? '' : item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    category === item && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
        </View>
      )}

      {/* Results */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      )}

      {results && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {debouncedQuery && results && results.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="mic-off-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No podcasts found for "{debouncedQuery}"</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#F3E8FF',
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#9333EA',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultCover: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  resultAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#9333EA',
    fontWeight: '500',
  },
  episodeCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

export function generateEpisodeCard(options: PodcastOptions = {}): string {
  const { componentName = 'EpisodeCard' } = options;

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

interface ${componentName}Props {
  episode: {
    id: string;
    title: string;
    description?: string;
    cover_url?: string;
    podcast_name?: string;
    podcast_id?: string;
    duration?: string;
    published_at?: string;
    is_played?: boolean;
    progress?: number;
  };
  variant?: 'card' | 'compact' | 'list';
  isPlaying?: boolean;
  onPlay?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  episode,
  variant = 'card',
  isPlaying = false,
  onPlay,
  onDownload,
  onShare,
  onLike,
  isLiked = false,
}) => {
  const navigation = useNavigation<any>();

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return \`\${days} days ago\`;
    if (days < 30) return \`\${Math.floor(days / 7)} weeks ago\`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPlay}>
        <TouchableOpacity
          style={[styles.compactPlayButton, isPlaying && styles.compactPlayButtonActive]}
          onPress={onPlay}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color={isPlaying ? '#FFFFFF' : '#374151'}
            style={!isPlaying && { marginLeft: 2 }}
          />
        </TouchableOpacity>
        <View style={styles.compactInfo}>
          <Text
            style={[styles.compactTitle, isPlaying && styles.compactTitleActive]}
            numberOfLines={1}
          >
            {episode.title}
          </Text>
          <View style={styles.compactMeta}>
            {episode.duration && <Text style={styles.compactDuration}>{episode.duration}</Text>}
            {episode.is_played && (
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listCoverContainer}>
          {episode.cover_url ? (
            <Image source={{ uri: episode.cover_url }} style={styles.listCover} />
          ) : (
            <View style={styles.listCoverPlaceholder}>
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            </View>
          )}
          {episode.progress !== undefined && episode.progress > 0 && episode.progress < 100 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: \`\${episode.progress}%\` }]} />
            </View>
          )}
        </View>
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <View style={styles.listTitleContainer}>
              <Text
                style={[styles.listTitle, isPlaying && styles.listTitleActive]}
                numberOfLines={1}
              >
                {episode.title}
              </Text>
              {episode.podcast_name && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('PodcastDetail', { id: episode.podcast_id })
                  }
                >
                  <Text style={styles.podcastLink}>{episode.podcast_name}</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          {episode.description && (
            <Text style={styles.listDescription} numberOfLines={2}>
              {episode.description}
            </Text>
          )}
          <View style={styles.listFooter}>
            <View style={styles.listMeta}>
              {episode.published_at && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.metaText}>{formatDate(episode.published_at)}</Text>
                </View>
              )}
              {episode.duration && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color="#6B7280" />
                  <Text style={styles.metaText}>{episode.duration}</Text>
                </View>
              )}
              {episode.is_played && (
                <View style={styles.playedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={styles.playedText}>Played</Text>
                </View>
              )}
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity
                style={[styles.playButtonSmall, isPlaying && styles.playButtonSmallActive]}
                onPress={onPlay}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={16}
                  color="#FFFFFF"
                  style={!isPlaying && { marginLeft: 2 }}
                />
              </TouchableOpacity>
              {onDownload && (
                <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
                  <Ionicons name="download-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Card variant (default)
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardCoverContainer}>
        {episode.cover_url ? (
          <Image source={{ uri: episode.cover_url }} style={styles.cardCover} />
        ) : (
          <View style={styles.cardCoverPlaceholder}>
            <Ionicons name="mic" size={48} color="#FFFFFF" />
          </View>
        )}
        {episode.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{episode.duration}</Text>
          </View>
        )}
        {episode.progress !== undefined && episode.progress > 0 && episode.progress < 100 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${episode.progress}%\` }]} />
          </View>
        )}
        <TouchableOpacity style={styles.cardPlayButton} onPress={onPlay}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color="#9333EA"
            style={!isPlaying && { marginLeft: 3 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text
          style={[styles.cardTitle, isPlaying && styles.cardTitleActive]}
          numberOfLines={2}
        >
          {episode.title}
        </Text>
        {episode.podcast_name && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PodcastDetail', { id: episode.podcast_id })
            }
          >
            <Text style={styles.podcastLink}>{episode.podcast_name}</Text>
          </TouchableOpacity>
        )}
        {episode.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {episode.description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.cardMeta}>
            {episode.published_at && (
              <Text style={styles.metaText}>{formatDate(episode.published_at)}</Text>
            )}
            {episode.is_played && (
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            )}
          </View>
          <View style={styles.cardActions}>
            {onLike && (
              <TouchableOpacity style={styles.actionButton} onPress={onLike}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isLiked ? '#EF4444' : '#6B7280'}
                />
              </TouchableOpacity>
            )}
            {onShare && (
              <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                <Ionicons name="share-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
            {onDownload && (
              <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
                <Ionicons name="download-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
  },
  compactPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactPlayButtonActive: {
    backgroundColor: '#9333EA',
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  compactTitleActive: {
    color: '#9333EA',
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  compactDuration: {
    fontSize: 12,
    color: '#6B7280',
  },

  // List variant
  listContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listCoverContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  listCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listCoverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  listTitleActive: {
    color: '#9333EA',
  },
  moreButton: {
    padding: 4,
  },
  listDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 4,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonSmallActive: {
    backgroundColor: '#9333EA',
  },

  // Card variant
  cardContainer: {
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
  cardCoverContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  cardCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardCoverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  cardPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardTitleActive: {
    color: '#9333EA',
  },
  podcastLink: {
    fontSize: 13,
    color: '#9333EA',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Shared
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333EA',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  playedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playedText: {
    fontSize: 12,
    color: '#10B981',
  },
  actionButton: {
    padding: 6,
  },
});

export default ${componentName};
`;
}
