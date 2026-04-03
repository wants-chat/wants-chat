/**
 * Church Component Generators (React Native)
 *
 * Generates church management, sermon, and prayer components for React Native.
 */

export interface ChurchOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateChurchStats(options: ChurchOptions = {}): string {
  const { componentName = 'ChurchStats', endpoint = '/church' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['church-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/stats');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const statItems = [
    {
      label: 'Total Members',
      value: stats?.total_members || 0,
      icon: 'people',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      change: stats?.member_growth || '+0%',
    },
    {
      label: 'Weekly Attendance',
      value: stats?.weekly_attendance || 0,
      icon: 'calendar',
      color: '#10B981',
      bgColor: '#D1FAE5',
      change: stats?.attendance_change || '+0%',
    },
    {
      label: 'Prayer Requests',
      value: stats?.active_prayers || 0,
      icon: 'heart',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      change: null,
    },
    {
      label: 'Sermons',
      value: stats?.total_sermons || 0,
      icon: 'book',
      color: '#F97316',
      bgColor: '#FFEDD5',
      change: null,
    },
    {
      label: 'Monthly Donations',
      value: '$' + (stats?.monthly_donations || 0).toLocaleString(),
      icon: 'cash',
      color: '#10B981',
      bgColor: '#D1FAE5',
      change: stats?.donation_change || '+0%',
    },
    {
      label: 'Small Groups',
      value: stats?.small_groups || 0,
      icon: 'people-circle',
      color: '#6366F1',
      bgColor: '#E0E7FF',
      change: null,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeLabel}>
            Welcome to {stats?.church_name || 'Our Church'}
          </Text>
          <Text style={styles.welcomeValue}>
            {stats?.weekly_attendance || 0} in attendance this week
          </Text>
          <Text style={styles.welcomeSubtext}>
            {stats?.next_service || 'Sunday Service at 10:00 AM'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statItems.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              {stat.change && (
                <View style={styles.changeContainer}>
                  <Ionicons name="trending-up" size={14} color="#10B981" />
                  <Text style={styles.changeText}>{stat.change}</Text>
                </View>
              )}
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  welcomeBanner: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#6366F1',
  },
  welcomeContent: {
    gap: 4,
  },
  welcomeLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  welcomeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateSermonList(options: ChurchOptions = {}): string {
  const { componentName = 'SermonList', endpoint = '/sermons' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showFilters?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit, showFilters = true }) => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [series, setSeries] = useState('all');

  const { data: sermons, isLoading } = useQuery({
    queryKey: ['sermons', series],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (series !== 'all') params.append('series', series);
      if (limit) params.append('limit', limit.toString());
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredSermons = sermons?.filter((sermon: any) =>
    sermon.title?.toLowerCase().includes(search.toLowerCase()) ||
    sermon.speaker?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSermonPress = (sermonId: string) => {
    navigation.navigate('SermonDetail' as never, { id: sermonId } as never);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderSermon = ({ item: sermon }: { item: any }) => (
    <TouchableOpacity
      style={styles.sermonCard}
      onPress={() => handleSermonPress(sermon.id)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        {sermon.thumbnail_url ? (
          <Image source={{ uri: sermon.thumbnail_url }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="book" size={32} color="#6366F1" />
          </View>
        )}
      </View>
      <View style={styles.sermonInfo}>
        <Text style={styles.sermonTitle} numberOfLines={1}>{sermon.title}</Text>
        {sermon.series_name && (
          <Text style={styles.seriesName}>{sermon.series_name}</Text>
        )}
        <View style={styles.metaContainer}>
          {sermon.speaker && (
            <View style={styles.metaItem}>
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{sermon.speaker}</Text>
            </View>
          )}
          {sermon.date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{formatDate(sermon.date)}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.playButton}>
        <Ionicons name="play" size={20} color="#6366F1" />
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

  return (
    <View style={styles.container}>
      {showFilters && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search sermons..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      )}

      {filteredSermons && filteredSermons.length > 0 ? (
        <FlatList
          data={filteredSermons}
          renderItem={renderSermon}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No sermons found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  sermonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  thumbnailContainer: {
    width: 80,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sermonInfo: {
    flex: 1,
  },
  sermonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  seriesName: {
    fontSize: 13,
    color: '#6366F1',
    marginTop: 2,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateSermonNotes(options: ChurchOptions = {}): string {
  const { componentName = 'SermonNotes', endpoint = '/sermons' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const queryClient = useQueryClient();
  const [personalNotes, setPersonalNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: sermon, isLoading } = useQuery({
    queryKey: ['sermon', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: myNotes } = useQuery({
    queryKey: ['sermon-notes', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/notes\`);
      const notes = response?.data || response;
      if (notes?.content) setPersonalNotes(notes.content);
      return notes;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.post<any>(\`${endpoint}/\${id}/notes\`, { content });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['sermon-notes', id] });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!sermon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sermon not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{sermon.title}</Text>
          <Text style={styles.subtitle}>
            {sermon.speaker} - {formatDate(sermon.date)}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scripture */}
      {sermon.scripture && (
        <View style={styles.scriptureCard}>
          <Text style={styles.scriptureLabel}>Scripture Reference</Text>
          <Text style={styles.scriptureText}>{sermon.scripture}</Text>
        </View>
      )}

      {/* Key Points */}
      {sermon.key_points && sermon.key_points.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Points</Text>
          {sermon.key_points.map((point: string, i: number) => (
            <View key={i} style={styles.keyPointItem}>
              <View style={styles.keyPointNumber}>
                <Text style={styles.keyPointNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Personal Notes */}
      <View style={styles.notesSection}>
        <View style={styles.notesHeader}>
          <View style={styles.notesTitleRow}>
            <Ionicons name="bookmark" size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>My Notes</Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => saveMutation.mutate(personalNotes)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name={saved ? 'checkmark' : 'save'}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.saveButtonText}>
                  {saved ? 'Saved!' : 'Save'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.notesInput}
          placeholder="Write your personal notes here..."
          placeholderTextColor="#9CA3AF"
          value={personalNotes}
          onChangeText={setPersonalNotes}
          multiline
          textAlignVertical="top"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scriptureCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  scriptureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  scriptureText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  keyPointNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPointNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keyPointText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  notesSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  notesInput: {
    minHeight: 160,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
});

export default ${componentName};
`;
}

export function generateSermonPlayer(options: ChurchOptions = {}): string {
  const { componentName = 'SermonPlayer', endpoint = '/sermons' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { Video, ResizeMode } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { data: sermon, isLoading } = useQuery({
    queryKey: ['sermon', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: relatedSermons } = useQuery({
    queryKey: ['related-sermons', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/related\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRelatedPress = (sermonId: string) => {
    navigation.navigate('SermonPlayer' as never, { id: sermonId } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!sermon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sermon not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Video Player */}
      <View style={styles.playerContainer}>
        {sermon.video_url ? (
          <Video
            ref={videoRef}
            source={{ uri: sermon.video_url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            posterSource={{ uri: sermon.thumbnail_url }}
            usePoster
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setCurrentTime(status.positionMillis / 1000);
                setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
                setIsPlaying(status.isPlaying);
              }
            }}
          />
        ) : (
          <View style={styles.audioPlayer}>
            <View style={styles.audioIcon}>
              <Ionicons name="musical-notes" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.audioTitle}>{sermon.title}</Text>
            <Text style={styles.audioSpeaker}>{sermon.speaker}</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: \`\${(currentTime / duration) * 100}%\` },
              ]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.playControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlay}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sermon Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoText}>
            <Text style={styles.sermonTitle}>{sermon.title}</Text>
            <Text style={styles.sermonMeta}>
              {sermon.speaker} - {formatDate(sermon.date)}
            </Text>
            {sermon.series_name && (
              <Text style={styles.seriesTag}>Series: {sermon.series_name}</Text>
            )}
          </View>
          <View style={styles.infoActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="heart-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('SermonNotes' as never, { id } as never)}
            >
              <Ionicons name="document-text-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {sermon.description && (
          <Text style={styles.description}>{sermon.description}</Text>
        )}

        {sermon.scripture && (
          <View style={styles.scriptureBox}>
            <Text style={styles.scriptureLabel}>Scripture</Text>
            <Text style={styles.scriptureText}>{sermon.scripture}</Text>
          </View>
        )}
      </View>

      {/* Related Sermons */}
      {relatedSermons && relatedSermons.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Sermons</Text>
          {relatedSermons.slice(0, 4).map((related: any) => (
            <TouchableOpacity
              key={related.id}
              style={styles.relatedItem}
              onPress={() => handleRelatedPress(related.id)}
            >
              <View style={styles.relatedThumb}>
                {related.thumbnail_url ? (
                  <Image
                    source={{ uri: related.thumbnail_url }}
                    style={styles.relatedImage}
                  />
                ) : (
                  <View style={styles.relatedPlaceholder}>
                    <Ionicons name="play" size={20} color="#6366F1" />
                  </View>
                )}
              </View>
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedTitle} numberOfLines={1}>
                  {related.title}
                </Text>
                <Text style={styles.relatedSpeaker}>{related.speaker}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
  playerContainer: {
    backgroundColor: '#111827',
    paddingBottom: 16,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5625, // 16:9 aspect ratio
  },
  audioPlayer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5625,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  audioSpeaker: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    width: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  playControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 24,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
  },
  sermonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  sermonMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  seriesTag: {
    fontSize: 13,
    color: '#6366F1',
    marginTop: 4,
  },
  infoActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginTop: 16,
  },
  scriptureBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
  },
  scriptureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  scriptureText: {
    fontSize: 15,
    color: '#111827',
    marginTop: 4,
  },
  relatedSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  relatedThumb: {
    width: 64,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: '100%',
  },
  relatedPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedInfo: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  relatedSpeaker: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generatePrayerList(options: ChurchOptions = {}): string {
  const { componentName = 'PrayerList', endpoint = '/prayers' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  showForm?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showForm = true }) => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine' | 'praying'>('all');
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    description: '',
    visibility: 'public',
    category: 'general',
  });

  const { data: prayers, isLoading } = useQuery({
    queryKey: ['prayers', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newPrayer) => {
      return api.post<any>('${endpoint}', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
      setShowModal(false);
      setNewPrayer({ title: '', description: '', visibility: 'public', category: 'general' });
    },
  });

  const prayMutation = useMutation({
    mutationFn: async (prayerId: string) => {
      return api.post<any>(\`${endpoint}/\${prayerId}/pray\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'lock-closed';
      case 'members':
        return 'people';
      default:
        return 'globe';
    }
  };

  const renderPrayer = ({ item: prayer }: { item: any }) => (
    <View style={styles.prayerCard}>
      <View style={styles.prayerHeader}>
        <View style={styles.userInfo}>
          {prayer.user_avatar ? (
            <Image source={{ uri: prayer.user_avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(prayer.user_name || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{prayer.user_name || 'Anonymous'}</Text>
            <Text style={styles.prayerDate}>{formatDate(prayer.created_at)}</Text>
          </View>
        </View>
        <View style={styles.badges}>
          <View style={[
            styles.categoryBadge,
            prayer.category === 'praise' && styles.praiseBadge,
          ]}>
            <Text style={[
              styles.categoryText,
              prayer.category === 'praise' && styles.praiseText,
            ]}>
              {prayer.category}
            </Text>
          </View>
          <Ionicons
            name={getVisibilityIcon(prayer.visibility) as any}
            size={16}
            color="#9CA3AF"
          />
        </View>
      </View>

      <Text style={styles.prayerTitle}>{prayer.title}</Text>
      <Text style={styles.prayerDescription}>{prayer.description}</Text>

      <View style={styles.prayerActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            prayer.is_praying && styles.prayingButton,
          ]}
          onPress={() => prayMutation.mutate(prayer.id)}
        >
          <Ionicons
            name={prayer.is_praying ? 'heart' : 'heart-outline'}
            size={18}
            color={prayer.is_praying ? '#EC4899' : '#6B7280'}
          />
          <Text style={[
            styles.actionText,
            prayer.is_praying && styles.prayingText,
          ]}>
            {prayer.prayer_count || 0} Praying
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
          <Text style={styles.actionText}>
            {prayer.comment_count || 0} Comments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          {(['all', 'mine', 'praying'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.activeFilterTab]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                {f === 'all' ? 'All' : f === 'mine' ? 'My Requests' : 'Praying For'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Prayer List */}
      {prayers && prayers.length > 0 ? (
        <FlatList
          data={prayers}
          renderItem={renderPrayer}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No prayer requests yet</Text>
          {showForm && (
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <Text style={styles.emptyLink}>Submit the first prayer request</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* New Prayer Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Prayer Request</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Prayer request title"
              placeholderTextColor="#9CA3AF"
              value={newPrayer.title}
              onChangeText={(text) => setNewPrayer({ ...newPrayer, title: text })}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Share your prayer request..."
              placeholderTextColor="#9CA3AF"
              value={newPrayer.description}
              onChangeText={(text) => setNewPrayer({ ...newPrayer, description: text })}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!newPrayer.title || createMutation.isPending) && styles.disabledButton,
            ]}
            onPress={() => createMutation.mutate(newPrayer)}
            disabled={!newPrayer.title || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Submit Prayer Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  activeFilterTab: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  prayerDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
  },
  praiseBadge: {
    backgroundColor: '#FEF3C7',
  },
  categoryText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  praiseText: {
    color: '#D97706',
  },
  prayerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  prayerDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  prayerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  prayingButton: {
    backgroundColor: '#FCE7F3',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  prayingText: {
    color: '#EC4899',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyLink: {
    marginTop: 8,
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
