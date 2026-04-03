/**
 * Arcade Component Generators for React Native
 *
 * Generates arcade-themed components with:
 * - Stats dashboard
 * - Popular games list
 * - Party calendar
 * - Today's parties list
 */

export interface ArcadeOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateArcadeStats(options: ArcadeOptions = {}): string {
  const { componentName = 'ArcadeStats', endpoint = '/arcade/stats' } = options;

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
    queryKey: ['arcade-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const statCards = [
    { label: 'Total Games', value: stats?.total_games || 0, icon: 'game-controller', color: '#8B5CF6', bg: '#F3E8FF' },
    { label: 'Active Players', value: stats?.active_players || 0, icon: 'people', color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'High Scores Today', value: stats?.high_scores_today || 0, icon: 'trophy', color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Tokens Earned', value: stats?.tokens_earned || 0, icon: 'logo-bitcoin', color: '#10B981', bg: '#D1FAE5' },
    { label: 'Games Played Today', value: stats?.games_played_today || 0, icon: 'trending-up', color: '#EC4899', bg: '#FCE7F3' },
    { label: 'Top Rated', value: stats?.top_rated || 0, icon: 'star', color: '#F97316', bg: '#FFEDD5' },
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
              <Text style={styles.statValue}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </Text>
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

export function generateGameListPopular(options: ArcadeOptions = {}): string {
  const { componentName = 'GameListPopular', endpoint = '/arcade/games/popular' } = options;

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

  const { data: games, isLoading } = useQuery({
    queryKey: ['popular-games'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleGamePress = useCallback((game: any) => {
    navigation.navigate('GameDetail' as never, { id: game.id } as never);
  }, [navigation]);

  const renderGame = useCallback(({ item: game, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => handleGamePress(game)}
      activeOpacity={0.7}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      {game.image_url ? (
        <Image
          source={{ uri: game.image_url }}
          style={styles.gameImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.gameImage, styles.imagePlaceholder]}>
          <Ionicons name="game-controller-outline" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={1}>{game.title}</Text>
        <Text style={styles.gameGenre}>{game.genre || game.category}</Text>
        <View style={styles.gameMeta}>
          {game.rating !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.metaText}>{game.rating.toFixed(1)}</Text>
            </View>
          )}
          {game.players_count !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{game.players_count.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleGamePress]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!games || games.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="game-controller-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No games available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#FBBF24" />
        <Text style={styles.headerTitle}>Popular Games</Text>
      </View>
      <FlatList
        data={games}
        renderItem={renderGame}
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
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  gameImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  gameGenre: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gameMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
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

export function generatePartyCalendarArcade(options: ArcadeOptions = {}): string {
  const { componentName = 'PartyCalendarArcade', endpoint = '/arcade/parties' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: parties, isLoading } = useQuery({
    queryKey: ['arcade-parties', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: currentDate.getFullYear().toString(),
        month: (currentDate.getMonth() + 1).toString(),
      });
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getPartiesForDay = (day: number) => {
    if (!parties) return [];
    return parties.filter((party: any) => {
      const partyDate = new Date(party.date || party.start_date);
      return partyDate.getDate() === day;
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="gift" size={20} color="#EC4899" />
          <Text style={styles.headerTitle}>Party Calendar</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarSection}>
        <View style={styles.weekdaysRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: calendarData.firstDayOfMonth }).map((_, i) => (
            <View key={\`empty-\${i}\`} style={styles.dayCell} />
          ))}
          {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayParties = getPartiesForDay(day);
            const isToday = new Date().toDateString() ===
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <View
                key={day}
                style={[styles.dayCell, isToday && styles.dayCellToday]}
              >
                <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{day}</Text>
                {dayParties.slice(0, 2).map((party: any, idx: number) => (
                  <View key={party.id || idx} style={styles.partyDot}>
                    <Text style={styles.partyDotText} numberOfLines={1}>
                      {party.title || party.name}
                    </Text>
                  </View>
                ))}
                {dayParties.length > 2 && (
                  <Text style={styles.moreText}>+{dayParties.length - 2}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {parties && parties.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Upcoming Parties</Text>
          {parties.slice(0, 3).map((party: any) => (
            <View key={party.id} style={styles.partyCard}>
              <View style={styles.partyIcon}>
                <Ionicons name="gift" size={20} color="#EC4899" />
              </View>
              <View style={styles.partyInfo}>
                <Text style={styles.partyTitle}>{party.title || party.name}</Text>
                <View style={styles.partyMeta}>
                  {(party.date || party.start_date) && (
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>
                        {new Date(party.date || party.start_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {party.capacity && (
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{party.capacity} guests</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  calendarSection: {
    padding: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
  },
  dayCellToday: {
    backgroundColor: '#FCE7F3',
    borderColor: '#EC4899',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dayTextToday: {
    color: '#EC4899',
  },
  partyDot: {
    backgroundColor: '#FCE7F3',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
  },
  partyDotText: {
    fontSize: 8,
    color: '#EC4899',
  },
  moreText: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },
  upcomingSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  partyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  partyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partyInfo: {
    flex: 1,
  },
  partyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  partyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});

export default ${componentName};
`;
}

export function generatePartyListToday(options: ArcadeOptions = {}): string {
  const { componentName = 'PartyListToday', endpoint = '/arcade/parties/today' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
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

  const { data: parties, isLoading } = useQuery({
    queryKey: ['arcade-parties-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handlePartyPress = useCallback((party: any) => {
    navigation.navigate('PartyDetail' as never, { id: party.id } as never);
  }, [navigation]);

  const getPartyConfig = (type: string) => {
    switch (type) {
      case 'birthday':
        return { icon: 'gift', color: '#EC4899', bg: '#FCE7F3' };
      case 'corporate':
        return { icon: 'business', color: '#3B82F6', bg: '#DBEAFE' };
      default:
        return { icon: 'sparkles', color: '#8B5CF6', bg: '#F3E8FF' };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { bg: '#D1FAE5', text: '#059669', label: 'In Progress' };
      case 'upcoming':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Upcoming' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status };
    }
  };

  const renderParty = useCallback(({ item: party }: { item: any }) => {
    const config = getPartyConfig(party.type);
    const statusStyle = getStatusStyle(party.status);

    return (
      <TouchableOpacity
        style={styles.partyCard}
        onPress={() => handlePartyPress(party)}
        activeOpacity={0.7}
      >
        <View style={[styles.partyIcon, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon as any} size={24} color={config.color} />
        </View>
        <View style={styles.partyContent}>
          <View style={styles.partyHeader}>
            <View style={styles.partyTitleSection}>
              <Text style={styles.partyTitle}>{party.title || party.name}</Text>
              {party.host_name && (
                <Text style={styles.hostName}>Hosted by {party.host_name}</Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </Text>
            </View>
          </View>
          <View style={styles.partyMeta}>
            {party.start_time && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {party.start_time} - {party.end_time || 'TBD'}
                </Text>
              </View>
            )}
            {party.guest_count !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{party.guest_count} guests</Text>
              </View>
            )}
            {party.room && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{party.room}</Text>
              </View>
            )}
          </View>
          {party.package_name && (
            <View style={styles.packageBadge}>
              <Ionicons name="gift-outline" size={14} color="#8B5CF6" />
              <Text style={styles.packageText}>{party.package_name} Package</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handlePartyPress]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!parties || parties.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="gift-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No parties today</Text>
        <Text style={styles.emptySubtitle}>No parties scheduled for today</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="gift" size={20} color="#EC4899" />
        <Text style={styles.headerTitle}>Today's Parties</Text>
      </View>
      <FlatList
        data={parties}
        renderItem={renderParty}
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
  partyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  partyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partyContent: {
    flex: 1,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  partyTitleSection: {
    flex: 1,
    marginRight: 8,
  },
  partyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  hostName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  partyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  packageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  packageText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}
