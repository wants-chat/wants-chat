/**
 * Cinema Component Generators for React Native
 *
 * Generates cinema-themed components with:
 * - Stats dashboard
 * - Screening calendar
 * - Today's screenings
 * - Now playing movies
 * - Movie filters
 */

export interface CinemaOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCinemaStats(options: CinemaOptions = {}): string {
  const { componentName = 'CinemaStats', endpoint = '/cinema/stats' } = options;

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
    queryKey: ['cinema-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  const statCards = [
    { label: 'Now Showing', value: stats?.now_showing || 0, icon: 'film', color: '#EF4444', bg: '#FEE2E2' },
    { label: 'Tickets Sold Today', value: stats?.tickets_sold_today || 0, icon: 'ticket', color: '#8B5CF6', bg: '#F3E8FF' },
    { label: 'Total Guests Today', value: stats?.guests_today || 0, icon: 'people', color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Revenue Today', value: stats?.revenue_today ? \`$\${stats.revenue_today.toLocaleString()}\` : '$0', icon: 'cash', color: '#10B981', bg: '#D1FAE5' },
    { label: 'Screenings Today', value: stats?.screenings_today || 0, icon: 'time', color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Average Rating', value: stats?.average_rating ? stats.average_rating.toFixed(1) : 'N/A', icon: 'star', color: '#F97316', bg: '#FFEDD5' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  statContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingLeft: 80,
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export function generateScreeningCalendar(options: CinemaOptions = {}): string {
  const { componentName = 'ScreeningCalendar', endpoint = '/cinema/screenings' } = options;

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: screenings, isLoading } = useQuery({
    queryKey: ['screenings', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: selectedDate.toISOString().split('T')[0],
      });
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const dates = useMemo(() => {
    const result = [];
    for (let i = -3; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  const groupedByMovie = useMemo(() => {
    if (!screenings) return {};

    return screenings.reduce((acc: any, screening: any) => {
      const movieId = screening.movie_id || screening.movie?.id;
      const movieTitle = screening.movie_title || screening.movie?.title || 'Unknown Movie';
      if (!acc[movieId]) {
        acc[movieId] = {
          movie: {
            id: movieId,
            title: movieTitle,
            poster_url: screening.movie?.poster_url || screening.poster_url,
          },
          screenings: [],
        };
      }
      acc[movieId].screenings.push(screening);
      return acc;
    }, {});
  }, [screenings]);

  const renderDateButton = useCallback(({ item: date }: { item: Date }) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity
        style={[
          styles.dateButton,
          isSelected && styles.dateButtonSelected,
          isToday && !isSelected && styles.dateButtonToday,
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[styles.dateWeekday, isSelected && styles.dateTextSelected]}>
          {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
        </Text>
        <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
          {date.getDate()}
        </Text>
        <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
          {date.toLocaleDateString('en-US', { month: 'short' })}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedDate]);

  const renderMovieScreenings = useCallback(({ item: movieGroup }: { item: any }) => (
    <View style={styles.movieCard}>
      <View style={styles.movieHeader}>
        {movieGroup.movie.poster_url ? (
          <Image
            source={{ uri: movieGroup.movie.poster_url }}
            style={styles.moviePoster}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.moviePoster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={32} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>{movieGroup.movie.title}</Text>
          <View style={styles.timesGrid}>
            {movieGroup.screenings.map((screening: any) => (
              <TouchableOpacity key={screening.id} style={styles.timeSlot}>
                <View style={styles.timeContent}>
                  <Ionicons name="time-outline" size={12} color="#6B7280" />
                  <Text style={styles.timeText}>{screening.start_time}</Text>
                </View>
                {screening.screen && (
                  <View style={styles.screenInfo}>
                    <Ionicons name="location-outline" size={10} color="#6B7280" />
                    <Text style={styles.screenText}>{screening.screen}</Text>
                  </View>
                )}
                {screening.format && (
                  <Text style={styles.formatText}>{screening.format}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  const movieGroups = Object.values(groupedByMovie);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="film" size={20} color="#EF4444" />
        <Text style={styles.headerTitle}>Screening Schedule</Text>
      </View>

      <View style={styles.dateSelector}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <FlatList
          data={dates}
          renderItem={renderDateButton}
          keyExtractor={(date) => date.toISOString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesContainer}
        />
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
        >
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {movieGroups.length > 0 ? (
        <FlatList
          data={movieGroups}
          renderItem={renderMovieScreenings}
          keyExtractor={(item: any) => item.movie.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={[styles.emptyContainer]}>
          <Ionicons name="film-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No screenings for this date</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
  },
  datesContainer: {
    paddingHorizontal: 8,
  },
  dateButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: 56,
  },
  dateButtonSelected: {
    backgroundColor: '#EF4444',
  },
  dateButtonToday: {
    backgroundColor: '#FEE2E2',
  },
  dateWeekday: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  dateMonth: {
    fontSize: 10,
    color: '#6B7280',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  movieCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  movieHeader: {
    flexDirection: 'row',
  },
  moviePoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  posterPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    minWidth: 70,
    backgroundColor: '#FFFFFF',
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  screenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 2,
  },
  formatText: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateScreeningListToday(options: CinemaOptions = {}): string {
  const { componentName = 'ScreeningListToday', endpoint = '/cinema/screenings/today' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();

  const { data: screenings, isLoading } = useQuery({
    queryKey: ['screenings-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'selling':
        return { bg: '#D1FAE5', text: '#059669', label: 'Available' };
      case 'almost_full':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Almost Full' };
      case 'sold_out':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'Sold Out' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status };
    }
  };

  const handleScreeningPress = useCallback((screening: any) => {
    navigation.navigate('ScreeningDetail' as never, { id: screening.id } as never);
  }, [navigation]);

  const renderScreening = useCallback(({ item: screening }: { item: any }) => {
    const statusStyle = getStatusStyle(screening.status);

    return (
      <TouchableOpacity
        style={styles.screeningCard}
        onPress={() => handleScreeningPress(screening)}
        activeOpacity={0.7}
      >
        <View style={styles.timeColumn}>
          <Text style={styles.startTime}>{screening.start_time}</Text>
          {screening.end_time && (
            <Text style={styles.endTime}>- {screening.end_time}</Text>
          )}
        </View>
        {screening.movie?.poster_url || screening.poster_url ? (
          <Image
            source={{ uri: screening.movie?.poster_url || screening.poster_url }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={24} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.screeningInfo}>
          <Text style={styles.movieTitle} numberOfLines={1}>
            {screening.movie?.title || screening.movie_title}
          </Text>
          <View style={styles.metaRow}>
            {screening.screen && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText}>{screening.screen}</Text>
              </View>
            )}
            {screening.seats_available !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText}>{screening.seats_available} seats</Text>
              </View>
            )}
            {screening.format && (
              <View style={styles.formatBadge}>
                <Text style={styles.formatText}>{screening.format}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.priceColumn}>
          {screening.price !== undefined && (
            <Text style={styles.priceText}>\${screening.price}</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleScreeningPress]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (!screenings || screenings.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="film-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No screenings today</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time" size={20} color="#EF4444" />
        <Text style={styles.headerTitle}>Today's Screenings</Text>
      </View>
      <FlatList
        data={screenings}
        renderItem={renderScreening}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  screeningCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
  },
  startTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  endTime: {
    fontSize: 10,
    color: '#6B7280',
  },
  poster: {
    width: 48,
    height: 64,
    borderRadius: 6,
    marginLeft: 12,
  },
  posterPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screeningInfo: {
    flex: 1,
    marginLeft: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 2,
  },
  formatBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatText: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '600',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateNowPlaying(options: CinemaOptions = {}): string {
  const { componentName = 'NowPlaying', endpoint = '/cinema/movies/now-playing' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['now-playing'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleMoviePress = useCallback((movie: any) => {
    navigation.navigate('MovieDetail' as never, { id: movie.id } as never);
  }, [navigation]);

  const renderMovie = useCallback(({ item: movie }: { item: any }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => handleMoviePress(movie)}
      activeOpacity={0.7}
    >
      <View style={styles.posterContainer}>
        {movie.poster_url ? (
          <Image
            source={{ uri: movie.poster_url }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={48} color="#9CA3AF" />
          </View>
        )}
        {movie.rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingText}>{movie.rating.toFixed(1)}</Text>
          </View>
        )}
        {movie.genre && (
          <View style={styles.genreOverlay}>
            <Text style={styles.genreText}>{movie.genre}</Text>
          </View>
        )}
      </View>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
        <View style={styles.metaRow}>
          {movie.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{movie.duration} min</Text>
            </View>
          )}
          {movie.release_date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{new Date(movie.release_date).getFullYear()}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [handleMoviePress]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="film-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No movies currently showing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="film" size={20} color="#EF4444" />
        <Text style={styles.headerTitle}>Now Playing</Text>
      </View>
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  movieCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  posterContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
  },
  posterPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  genreOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  genreText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateMovieFilters(options: CinemaOptions = {}): string {
  const { componentName = 'MovieFilters' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  genre: string;
  onGenreChange: (value: string) => void;
  format: string;
  onFormatChange: (value: string) => void;
  date: Date | null;
  onDateChange: (value: Date | null) => void;
  showTime: string;
  onShowTimeChange: (value: string) => void;
  genres?: string[];
  formats?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  format,
  onFormatChange,
  date,
  onDateChange,
  showTime,
  onShowTimeChange,
  genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Animation', 'Romance', 'Thriller'],
  formats = ['All', '2D', '3D', 'IMAX', 'Dolby Atmos', '4DX'],
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const timeOptions = [
    { value: '', label: 'Any Time' },
    { value: 'morning', label: 'Morning (Before 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
    { value: 'evening', label: 'Evening (5PM - 9PM)' },
    { value: 'night', label: 'Night (After 9PM)' },
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>
            {date ? date.toLocaleDateString() : 'Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>
            {timeOptions.find((t) => t.value === showTime)?.label || 'Time'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFormatPicker(true)}
        >
          <Ionicons name="options-outline" size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>{format || 'Format'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genresContainer}
      >
        {genres.map((g) => {
          const isSelected = (g === 'All' && !genre) || genre === g;
          return (
            <TouchableOpacity
              key={g}
              style={[styles.genreChip, isSelected && styles.genreChipSelected]}
              onPress={() => onGenreChange(g === 'All' ? '' : g)}
            >
              <Text style={[styles.genreChipText, isSelected && styles.genreChipTextSelected]}>
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Modal visible={showFormatPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowFormatPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Format</Text>
            {formats.map((f) => (
              <TouchableOpacity
                key={f}
                style={styles.modalOption}
                onPress={() => {
                  onFormatChange(f === 'All' ? '' : f);
                  setShowFormatPicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  ((f === 'All' && !format) || format === f) && styles.modalOptionTextSelected,
                ]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showTimePicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            {timeOptions.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={styles.modalOption}
                onPress={() => {
                  onShowTimeChange(t.value);
                  setShowTimePicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  showTime === t.value && styles.modalOptionTextSelected,
                ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  searchRow: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  genresContainer: {
    paddingVertical: 4,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  genreChipSelected: {
    backgroundColor: '#EF4444',
  },
  genreChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  genreChipTextSelected: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}
