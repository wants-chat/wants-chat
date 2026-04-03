/**
 * Dating Matching Component Generators (React Native)
 *
 * Generates swipe cards, match cards, discovery filters, and icebreakers
 * for React Native dating applications.
 */

export interface MatchingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSwipeCards(options: MatchingOptions = {}): string {
  const { componentName = 'SwipeCards', endpoint = '/discover' } = options;

  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location?: string;
  occupation?: string;
  bio?: string;
  distance?: number;
  verified?: boolean;
  compatibility_score?: number;
  interests?: string[];
}

interface ${componentName}Props {
  onMatch?: (profile: Profile) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onMatch }) => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['discover-profiles'],
    queryFn: async () => {
      const response = await api.get<Profile[]>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const likeMutation = useMutation({
    mutationFn: (profileId: string) => api.post('${endpoint}/' + profileId + '/like', {}),
    onSuccess: (data: any, profileId: string) => {
      if (data?.matched && onMatch) {
        const matchedProfile = profiles?.find((p) => p.id === profileId);
        if (matchedProfile) onMatch(matchedProfile);
      }
      nextProfile();
    },
  });

  const superLikeMutation = useMutation({
    mutationFn: (profileId: string) => api.post('${endpoint}/' + profileId + '/superlike', {}),
    onSuccess: (data: any, profileId: string) => {
      if (data?.matched && onMatch) {
        const matchedProfile = profiles?.find((p) => p.id === profileId);
        if (matchedProfile) onMatch(matchedProfile);
      }
      nextProfile();
    },
  });

  const passMutation = useMutation({
    mutationFn: (profileId: string) => api.post('${endpoint}/' + profileId + '/pass', {}),
    onSuccess: () => nextProfile(),
  });

  const rewindMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/rewind', {}),
    onSuccess: () => {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setCurrentPhotoIndex(0);
      }
    },
  });

  const nextProfile = () => {
    setCurrentPhotoIndex(0);
    setCurrentIndex((i) => i + 1);
    position.setValue({ x: 0, y: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          swipeUp();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const swipeLeft = () => {
    if (!currentProfile) return;
    Animated.timing(position, {
      toValue: { x: -width * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      passMutation.mutate(currentProfile.id);
    });
  };

  const swipeRight = () => {
    if (!currentProfile) return;
    Animated.timing(position, {
      toValue: { x: width * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      likeMutation.mutate(currentProfile.id);
    });
  };

  const swipeUp = () => {
    if (!currentProfile) return;
    Animated.timing(position, {
      toValue: { x: 0, y: -height },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      superLikeMutation.mutate(currentProfile.id);
    });
  };

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={styles.loadingText}>Finding matches for you...</Text>
      </View>
    );
  }

  const currentProfile = profiles?.[currentIndex];
  const nextProfiles = profiles?.slice(currentIndex + 1, currentIndex + 3) || [];

  if (!currentProfile) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="heart" size={48} color="#EC4899" />
        </View>
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for new matches or expand your preferences.
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ['discover-profiles'] })}
        >
          <Text style={styles.refreshButtonText}>Refresh Profiles</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos = currentProfile.photos?.length > 0 ? currentProfile.photos : [];

  return (
    <View style={styles.container}>
      {/* Card Stack */}
      <View style={styles.cardStack}>
        {/* Background Cards */}
        {nextProfiles.map((profile, idx) => (
          <View
            key={profile.id}
            style={[
              styles.backgroundCard,
              {
                transform: [
                  { scale: 1 - (idx + 1) * 0.05 },
                  { translateY: (idx + 1) * 20 },
                ],
                opacity: 1 - (idx + 1) * 0.3,
                zIndex: 10 - idx,
              },
            ]}
          >
            {profile.photos?.[0] && (
              <Image source={{ uri: profile.photos[0] }} style={styles.backgroundImage} />
            )}
          </View>
        ))}

        {/* Current Card */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
        >
          {/* Photo */}
          <View style={styles.photoContainer}>
            {photos.length > 0 ? (
              <Image source={{ uri: photos[currentPhotoIndex] }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={80} color="#D1D5DB" />
              </View>
            )}

            {/* Photo Indicators */}
            <View style={styles.photoIndicators}>
              {photos.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.indicator, idx === currentPhotoIndex && styles.activeIndicator]}
                />
              ))}
            </View>

            {/* Photo Navigation */}
            {photos.length > 1 && (
              <View style={styles.photoNavigation}>
                <TouchableOpacity
                  style={styles.photoNavLeft}
                  onPress={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))}
                />
                <TouchableOpacity
                  style={styles.photoNavRight}
                  onPress={() => setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
                />
              </View>
            )}

            {/* Swipe Labels */}
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.likeLabelText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
              <Text style={styles.nopeLabelText}>NOPE</Text>
            </Animated.View>

            {/* Compatibility Badge */}
            {currentProfile.compatibility_score && (
              <View style={styles.compatibilityBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.compatibilityText}>{currentProfile.compatibility_score}% Match</Text>
              </View>
            )}

            {/* Gradient */}
            <View style={styles.gradient} />

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{currentProfile.name}</Text>
                <Text style={styles.age}>{currentProfile.age}</Text>
                {currentProfile.verified && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </View>

              {currentProfile.occupation && (
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.infoText}>{currentProfile.occupation}</Text>
                </View>
              )}

              {currentProfile.location && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.infoText}>
                    {currentProfile.location}
                    {currentProfile.distance && \` - \${currentProfile.distance} km away\`}
                  </Text>
                </View>
              )}

              {currentProfile.bio && (
                <Text style={styles.bio} numberOfLines={2}>{currentProfile.bio}</Text>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rewindButton]}
          onPress={() => rewindMutation.mutate()}
          disabled={currentIndex === 0 || rewindMutation.isPending}
        >
          <Ionicons name="refresh" size={24} color="#EAB308" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={swipeLeft}
          disabled={passMutation.isPending}
        >
          <Ionicons name="close" size={32} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={swipeUp}
          disabled={superLikeMutation.isPending}
        >
          <Ionicons name="star" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={swipeRight}
          disabled={likeMutation.isPending}
        >
          <Ionicons name="heart" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.infoButton]}>
          <Ionicons name="information-circle-outline" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Boost Button */}
      <TouchableOpacity style={styles.boostButton}>
        <Ionicons name="flash" size={20} color="#FFFFFF" />
        <Text style={styles.boostButtonText}>Boost Your Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EC4899',
    borderRadius: 24,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardStack: {
    width: width - 32,
    height: height * 0.65,
    position: 'relative',
  },
  backgroundCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
  },
  photoContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  photoIndicators: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
  },
  indicator: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  photoNavLeft: {
    width: '33%',
    height: '100%',
  },
  photoNavRight: {
    width: '67%',
    height: '100%',
  },
  likeLabel: {
    position: 'absolute',
    top: 80,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderColor: '#22C55E',
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
  },
  likeLabelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  nopeLabel: {
    position: 'absolute',
    top: 80,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderColor: '#EF4444',
    borderRadius: 8,
    transform: [{ rotate: '20deg' }],
  },
  nopeLabelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EC4899',
    borderRadius: 16,
  },
  compatibilityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  age: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewindButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EAB308',
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  superLikeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EC4899',
  },
  infoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
  },
  boostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateMatchCard(options: MatchingOptions = {}): string {
  const { componentName = 'MatchCard', endpoint = '/matches' } = options;

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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Match {
  id: string;
  profile: {
    id: string;
    name: string;
    photo: string;
    age?: number;
    online?: boolean;
  };
  matched_at: string;
  last_message?: string;
  unread_count?: number;
  is_super_like?: boolean;
  expires_at?: string;
}

interface ${componentName}Props {
  match?: Match;
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ match, compact = false }) => {
  const navigation = useNavigation();

  if (!match) {
    return null;
  }

  const timeAgo = (date: string) => {
    const now = new Date();
    const matchDate = new Date(date);
    const diff = now.getTime() - matchDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return days + 'd ago';
    if (hours > 0) return hours + 'h ago';
    return 'Just now';
  };

  const handlePress = () => {
    navigation.navigate('Chat' as never, { matchId: match.id } as never);
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.compactAvatarContainer}>
          {match.profile.photo ? (
            <Image source={{ uri: match.profile.photo }} style={styles.compactAvatar} />
          ) : (
            <View style={styles.compactAvatarPlaceholder}>
              <Ionicons name="person" size={24} color="#D1D5DB" />
            </View>
          )}
        </View>
        {match.profile.online && <View style={styles.onlineDot} />}
        {match.is_super_like && (
          <View style={styles.superLikeBadge}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          </View>
        )}
        <Text style={styles.compactName} numberOfLines={1}>{match.profile.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {match.profile.photo ? (
          <Image source={{ uri: match.profile.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={28} color="#D1D5DB" />
          </View>
        )}
        {match.profile.online && <View style={styles.onlineDotLarge} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {match.profile.name}
            {match.profile.age && <Text style={styles.age}>, {match.profile.age}</Text>}
          </Text>
          {match.is_super_like && (
            <Ionicons name="sparkles" size={16} color="#3B82F6" />
          )}
        </View>

        {match.last_message ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {match.last_message}
          </Text>
        ) : (
          <Text style={styles.newMatch}>New match! Say hello</Text>
        )}

        <Text style={styles.timestamp}>Matched {timeAgo(match.matched_at)}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {match.unread_count && match.unread_count > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{match.unread_count}</Text>
          </View>
        ) : (
          <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
        )}

        {match.expires_at && (
          <View style={styles.expiresRow}>
            <Ionicons name="time-outline" size={12} color="#F97316" />
            <Text style={styles.expiresText}>Expires soon</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Match List Component
export const MatchList: React.FC = () => {
  const navigation = useNavigation();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await api.get<Match[]>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  const newMatches = matches?.filter((m) => !m.last_message) || [];
  const conversations = matches?.filter((m) => m.last_message) || [];

  return (
    <View style={styles.container}>
      {/* New Matches */}
      {newMatches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={20} color="#EC4899" />
            <Text style={styles.sectionTitle}>New Matches</Text>
          </View>
          <FlatList
            data={newMatches}
            renderItem={({ item }) => <${componentName} match={item} compact />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newMatchesList}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          />
        </View>
      )}

      {/* Conversations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubbles-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>Messages</Text>
        </View>
        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={({ item }) => <${componentName} match={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyConversations}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>Match with someone to start chatting</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  newMatchesList: {
    paddingHorizontal: 16,
  },
  // Compact card styles
  compactCard: {
    alignItems: 'center',
    width: 80,
  },
  compactAvatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#EC4899',
    padding: 2,
    overflow: 'hidden',
  },
  compactAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  compactAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  superLikeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactName: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
    width: 80,
  },
  // Full card styles
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDotLarge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  age: {
    fontWeight: 'normal',
    color: '#6B7280',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  newMatch: {
    fontSize: 14,
    color: '#EC4899',
    fontStyle: 'italic',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiresText: {
    fontSize: 12,
    color: '#F97316',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 92,
  },
  emptyConversations: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateDiscoveryFilters(options: MatchingOptions = {}): string {
  const { componentName = 'DiscoveryFilters', endpoint = '/discover/preferences' } = options;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import Slider from '@react-native-community/slider';

interface FilterPreferences {
  age_range: [number, number];
  distance: number;
  gender: string[];
  looking_for: string[];
  show_verified_only: boolean;
  has_bio: boolean;
  has_photos_min: number;
  interests: string[];
}

interface ${componentName}Props {
  onApply?: (filters: FilterPreferences) => void;
  onClose?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onApply, onClose }) => {
  const queryClient = useQueryClient();
  const [expandedSection, setExpandedSection] = useState<string>('basic');
  const [localFilters, setLocalFilters] = useState<FilterPreferences | null>(null);

  const { data: savedFilters, isLoading } = useQuery({
    queryKey: ['discovery-filters'],
    queryFn: async () => {
      const response = await api.get<FilterPreferences>('${endpoint}');
      return response?.data || response;
    },
  });

  useEffect(() => {
    if (savedFilters && !localFilters) {
      setLocalFilters(savedFilters);
    }
  }, [savedFilters]);

  const saveMutation = useMutation({
    mutationFn: (filters: FilterPreferences) => api.put('${endpoint}', filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery-filters'] });
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      if (onApply && localFilters) onApply(localFilters);
      if (onClose) onClose();
    },
  });

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Other'];
  const lookingForOptions = ['Relationship', 'Casual', 'Friends', 'Not sure yet'];
  const interestsList = [
    'Music', 'Travel', 'Movies', 'Reading', 'Fitness', 'Gaming',
    'Cooking', 'Art', 'Photography', 'Dancing', 'Sports', 'Nature',
  ];

  if (isLoading || !localFilters) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const updateFilter = <K extends keyof FilterPreferences>(
    key: K,
    value: FilterPreferences[K]
  ) => {
    setLocalFilters((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleArrayValue = (key: keyof FilterPreferences, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as any);
  };

  const handleApply = () => {
    if (localFilters) {
      saveMutation.mutate(localFilters);
    }
  };

  const handleReset = () => {
    if (savedFilters) {
      setLocalFilters(savedFilters);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="options" size={20} color="#EC4899" />
          <Text style={styles.title}>Discovery Filters</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Filters */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('basic')}>
            <View style={styles.sectionTitle}>
              <Ionicons name="people-outline" size={20} color="#6B7280" />
              <Text style={styles.sectionTitleText}>Basic Filters</Text>
            </View>
            <Ionicons
              name={expandedSection === 'basic' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'basic' && (
            <View style={styles.sectionContent}>
              {/* Age Range */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>
                  Age Range: {localFilters.age_range[0]} - {localFilters.age_range[1]}
                </Text>
                <View style={styles.sliderRow}>
                  <Slider
                    style={styles.slider}
                    minimumValue={18}
                    maximumValue={100}
                    value={localFilters.age_range[0]}
                    onValueChange={(value) =>
                      updateFilter('age_range', [Math.round(value), localFilters.age_range[1]])
                    }
                    minimumTrackTintColor="#EC4899"
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor="#EC4899"
                  />
                  <Slider
                    style={styles.slider}
                    minimumValue={18}
                    maximumValue={100}
                    value={localFilters.age_range[1]}
                    onValueChange={(value) =>
                      updateFilter('age_range', [localFilters.age_range[0], Math.round(value)])
                    }
                    minimumTrackTintColor="#EC4899"
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor="#EC4899"
                  />
                </View>
              </View>

              {/* Distance */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Distance: {localFilters.distance} km</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={500}
                  value={localFilters.distance}
                  onValueChange={(value) => updateFilter('distance', Math.round(value))}
                  minimumTrackTintColor="#EC4899"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#EC4899"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1 km</Text>
                  <Text style={styles.sliderLabel}>500 km</Text>
                </View>
              </View>

              {/* Gender */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Show Me</Text>
                <View style={styles.tagsContainer}>
                  {genderOptions.map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.tag,
                        localFilters.gender.includes(gender) && styles.tagActive,
                      ]}
                      onPress={() => toggleArrayValue('gender', gender)}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          localFilters.gender.includes(gender) && styles.tagTextActive,
                        ]}
                      >
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Looking For */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('looking')}>
            <View style={styles.sectionTitle}>
              <Ionicons name="heart-outline" size={20} color="#6B7280" />
              <Text style={styles.sectionTitleText}>Looking For</Text>
            </View>
            <Ionicons
              name={expandedSection === 'looking' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'looking' && (
            <View style={styles.sectionContent}>
              {lookingForOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    localFilters.looking_for.includes(option) && styles.optionItemActive,
                  ]}
                  onPress={() => toggleArrayValue('looking_for', option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      localFilters.looking_for.includes(option) && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  {localFilters.looking_for.includes(option) && (
                    <Ionicons name="checkmark" size={20} color="#EC4899" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('interests')}>
            <View style={styles.sectionTitle}>
              <Ionicons name="sparkles-outline" size={20} color="#6B7280" />
              <Text style={styles.sectionTitleText}>Interests</Text>
            </View>
            <Ionicons
              name={expandedSection === 'interests' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'interests' && (
            <View style={styles.sectionContent}>
              <View style={styles.tagsContainer}>
                {interestsList.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.tag,
                      localFilters.interests.includes(interest) && styles.tagActive,
                    ]}
                    onPress={() => toggleArrayValue('interests', interest)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        localFilters.interests.includes(interest) && styles.tagTextActive,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Advanced Filters */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('advanced')}>
            <View style={styles.sectionTitle}>
              <Ionicons name="settings-outline" size={20} color="#6B7280" />
              <Text style={styles.sectionTitleText}>Advanced</Text>
            </View>
            <Ionicons
              name={expandedSection === 'advanced' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'advanced' && (
            <View style={styles.sectionContent}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Verified profiles only</Text>
                <Switch
                  value={localFilters.show_verified_only}
                  onValueChange={(value) => updateFilter('show_verified_only', value)}
                  trackColor={{ false: '#D1D5DB', true: '#F9A8D4' }}
                  thumbColor={localFilters.show_verified_only ? '#EC4899' : '#F3F4F6'}
                />
              </View>

              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Has bio</Text>
                <Switch
                  value={localFilters.has_bio}
                  onValueChange={(value) => updateFilter('has_bio', value)}
                  trackColor={{ false: '#D1D5DB', true: '#F9A8D4' }}
                  thumbColor={localFilters.has_bio ? '#EC4899' : '#F3F4F6'}
                />
              </View>

              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>
                  Minimum photos: {localFilters.has_photos_min}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={6}
                  step={1}
                  value={localFilters.has_photos_min}
                  onValueChange={(value) => updateFilter('has_photos_min', value)}
                  minimumTrackTintColor="#EC4899"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#EC4899"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterItem: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  tagActive: {
    backgroundColor: '#EC4899',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemActive: {
    backgroundColor: '#FDF2F8',
    borderColor: '#EC4899',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  optionTextActive: {
    color: '#BE185D',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateIcebreakers(options: MatchingOptions = {}): string {
  const { componentName = 'Icebreakers', endpoint = '/icebreakers' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Icebreaker {
  id: string;
  text: string;
  category: string;
  popularity?: number;
}

interface ${componentName}Props {
  matchId: string;
  recipientName: string;
  onSend?: (message: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  matchId,
  recipientName,
  onSend,
}) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null);

  const { data: icebreakers, isLoading, refetch } = useQuery({
    queryKey: ['icebreakers', matchId, selectedCategory],
    queryFn: async () => {
      let url = '${endpoint}?match_id=' + matchId;
      if (selectedCategory !== 'all') {
        url += '&category=' + selectedCategory;
      }
      const response = await api.get<Icebreaker[]>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      api.post('${endpoint}/send', {
        match_id: matchId,
        message,
      }),
    onSuccess: (_, message) => {
      if (onSend) onSend(message);
      setSelectedIcebreaker(null);
      setCustomMessage('');
    },
  });

  const categories = [
    { id: 'all', label: 'All', icon: 'sparkles' },
    { id: 'funny', label: 'Funny', icon: 'happy' },
    { id: 'flirty', label: 'Flirty', icon: 'heart' },
    { id: 'deep', label: 'Deep', icon: 'flash' },
    { id: 'music', label: 'Music', icon: 'musical-notes' },
    { id: 'movies', label: 'Movies', icon: 'film' },
    { id: 'travel', label: 'Travel', icon: 'airplane' },
    { id: 'food', label: 'Food', icon: 'cafe' },
  ];

  const handleSend = (message: string) => {
    const personalizedMessage = message.replace(/{name}/g, recipientName);
    sendMutation.mutate(personalizedMessage);
  };

  const quickMessages = ['Hey! How are you?', 'Love your profile!', 'We should chat!'];

  const renderIcebreaker = ({ item }: { item: Icebreaker }) => {
    const isSelected = selectedIcebreaker === item.id;
    const personalizedText = item.text.replace(/{name}/g, recipientName);

    return (
      <TouchableOpacity
        style={[styles.icebreakerItem, isSelected && styles.icebreakerItemSelected]}
        onPress={() => setSelectedIcebreaker(isSelected ? null : item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.icebreakerText, isSelected && styles.icebreakerTextSelected]}>
          {personalizedText}
        </Text>
        <View style={styles.icebreakerMeta}>
          <Text style={styles.icebreakerCategory}>{item.category}</Text>
          {item.popularity && (
            <View style={styles.popularityBadge}>
              <Ionicons name="heart" size={12} color="#EC4899" />
              <Text style={styles.popularityText}>{item.popularity}% success rate</Text>
            </View>
          )}
        </View>

        {isSelected && (
          <TouchableOpacity
            style={styles.sendIcebreakerButton}
            onPress={() => handleSend(item.text)}
            disabled={sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.sendIcebreakerText}>Send This</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="chatbubbles" size={20} color="#EC4899" />
          <Text style={styles.title}>Icebreakers</Text>
        </View>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
          <Ionicons name="refresh" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Break the ice with {recipientName}</Text>

      {/* Categories */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={16}
              color={selectedCategory === item.id ? '#FFFFFF' : '#374151'}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />

      {/* Icebreaker List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : icebreakers && icebreakers.length > 0 ? (
        <FlatList
          data={icebreakers}
          renderItem={renderIcebreaker}
          keyExtractor={(item) => item.id}
          style={styles.icebreakersList}
          contentContainerStyle={styles.icebreakersContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="sparkles" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No icebreakers found for this category</Text>
        </View>
      )}

      {/* Custom Message */}
      <View style={styles.customMessageContainer}>
        <Text style={styles.customMessageLabel}>Or write your own:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder={\`Say something to \${recipientName}...\`}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !customMessage.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend(customMessage)}
            disabled={!customMessage.trim() || sendMutation.isPending}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Messages */}
      <View style={styles.quickMessages}>
        {quickMessages.map((msg, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.quickMessageButton}
            onPress={() => setCustomMessage(msg)}
          >
            <Text style={styles.quickMessageText}>{msg}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesList: {
    maxHeight: 50,
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#EC4899',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  icebreakersList: {
    flex: 1,
    maxHeight: 300,
  },
  icebreakersContent: {
    paddingHorizontal: 16,
  },
  icebreakerItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  icebreakerItemSelected: {
    backgroundColor: '#FDF2F8',
    borderColor: '#EC4899',
  },
  icebreakerText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  icebreakerTextSelected: {
    color: '#BE185D',
  },
  icebreakerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  icebreakerCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularityText: {
    fontSize: 12,
    color: '#EC4899',
  },
  sendIcebreakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EC4899',
    borderRadius: 12,
  },
  sendIcebreakerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  customMessageContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  customMessageLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
    maxHeight: 80,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  quickMessages: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  quickMessageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  quickMessageText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
