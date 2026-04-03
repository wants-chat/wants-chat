/**
 * Dating Profile Component Generators (React Native)
 *
 * Generates profile cards, previews, stats, and specialized profile types
 * for React Native dating applications.
 */

export interface DatingProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDatingProfile(options: DatingProfileOptions = {}): string {
  const { componentName = 'DatingProfile', endpoint = '/profiles' } = options;

  return `import React, { useState } from 'react';
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
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');

interface Profile {
  id: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
  location?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  height?: string;
  looking_for?: string;
  relationship_type?: string;
  verified?: boolean;
  premium?: boolean;
  distance?: number;
  compatibility_score?: number;
  prompts?: Array<{ question: string; answer: string }>;
  spotify_artists?: string[];
  instagram_photos?: string[];
  created_at?: string;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const queryClient = useQueryClient();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const response = await api.get<Profile>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/like', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', id] }),
  });

  const superLikeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/superlike', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', id] }),
  });

  const passMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/pass', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', id] }),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>Profile not found</Text>
      </View>
    );
  }

  const photos = profile.photos?.length > 0 ? profile.photos : [];

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((i) => Math.max(0, i - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1));
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
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
                style={[
                  styles.indicator,
                  idx === currentPhotoIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.photoNavButton, styles.photoNavLeft]}
                onPress={handlePrevPhoto}
              />
              <TouchableOpacity
                style={[styles.photoNavButton, styles.photoNavRight]}
                onPress={handleNextPhoto}
              />
            </>
          )}

          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />

          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.age}>{profile.age}</Text>
              {profile.verified && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
              {profile.premium && (
                <Ionicons name="star" size={20} color="#EAB308" />
              )}
            </View>

            {profile.occupation && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoText}>{profile.occupation}</Text>
              </View>
            )}

            {profile.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoText}>
                  {profile.location}
                  {profile.distance && \` (\${profile.distance} km away)\`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Content */}
        <View style={styles.content}>
          {/* Compatibility Score */}
          {profile.compatibility_score && (
            <View style={styles.compatibilityCard}>
              <View style={styles.compatibilityBadge}>
                <Text style={styles.compatibilityScore}>{profile.compatibility_score}%</Text>
              </View>
              <View style={styles.compatibilityInfo}>
                <Text style={styles.compatibilityTitle}>Compatibility Score</Text>
                <Text style={styles.compatibilitySubtitle}>Based on your preferences</Text>
              </View>
            </View>
          )}

          {/* Bio */}
          {profile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            {profile.education && (
              <View style={styles.quickInfoItem}>
                <Ionicons name="school-outline" size={20} color="#6B7280" />
                <Text style={styles.quickInfoText}>{profile.education}</Text>
              </View>
            )}
            {profile.height && (
              <View style={styles.quickInfoItem}>
                <Ionicons name="resize-outline" size={20} color="#6B7280" />
                <Text style={styles.quickInfoText}>{profile.height}</Text>
              </View>
            )}
            {profile.looking_for && (
              <View style={styles.quickInfoItem}>
                <Ionicons name="heart-outline" size={20} color="#6B7280" />
                <Text style={styles.quickInfoText}>{profile.looking_for}</Text>
              </View>
            )}
          </View>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.tagsContainer}>
                {profile.interests.map((interest, idx) => (
                  <View key={idx} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Prompts */}
          {profile.prompts && profile.prompts.length > 0 && (
            <View style={styles.section}>
              {profile.prompts.map((prompt, idx) => (
                <View key={idx} style={styles.promptCard}>
                  <Text style={styles.promptQuestion}>{prompt.question}</Text>
                  <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Spotify Artists */}
          {profile.spotify_artists && profile.spotify_artists.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="musical-notes" size={16} color="#22C55E" />
                <Text style={styles.sectionTitle}>Top Artists</Text>
              </View>
              <View style={styles.tagsContainer}>
                {profile.spotify_artists.map((artist, idx) => (
                  <View key={idx} style={styles.spotifyTag}>
                    <Text style={styles.spotifyText}>{artist}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => passMutation.mutate()}
          disabled={passMutation.isPending}
        >
          <Ionicons name="close" size={32} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => superLikeMutation.mutate()}
          disabled={superLikeMutation.isPending}
        >
          <Ionicons name="star" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
        >
          <Ionicons name="heart" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.messageButton]}>
          <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  photoContainer: {
    width: width,
    height: width * 1.33,
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
  photoNavButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '33%',
  },
  photoNavLeft: {
    left: 0,
  },
  photoNavRight: {
    right: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  basicInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
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
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    padding: 16,
  },
  compatibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FDF2F8',
    borderRadius: 16,
    marginBottom: 16,
  },
  compatibilityBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compatibilityScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  compatibilityInfo: {
    flex: 1,
  },
  compatibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  compatibilitySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickInfoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    color: '#BE185D',
  },
  spotifyTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
  },
  spotifyText: {
    fontSize: 14,
    color: '#166534',
  },
  promptCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 16,
    color: '#111827',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  superLikeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
  },
  likeButton: {
    backgroundColor: '#EC4899',
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
  },
});

export default ${componentName};
`;
}

export function generateProfilePreview(options: DatingProfileOptions = {}): string {
  const { componentName = 'ProfilePreview', endpoint = '/profiles' } = options;

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

interface ProfilePreviewProps {
  profile: {
    id: string;
    name: string;
    age: number;
    photo?: string;
    location?: string;
    bio?: string;
    verified?: boolean;
    premium?: boolean;
    distance?: number;
    compatibility_score?: number;
    online?: boolean;
  };
  onLike?: (id: string) => void;
  onPass?: (id: string) => void;
  compact?: boolean;
}

const ${componentName}: React.FC<ProfilePreviewProps> = ({
  profile,
  onLike,
  onPass,
  compact = false,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('ProfileDetail' as never, { id: profile.id } as never);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactImageContainer}>
          {profile.photo ? (
            <Image source={{ uri: profile.photo }} style={styles.compactImage} />
          ) : (
            <View style={styles.compactPlaceholder}>
              <Ionicons name="person" size={32} color="#D1D5DB" />
            </View>
          )}
          {profile.online && <View style={styles.onlineDot} />}
          <View style={styles.compactOverlay}>
            <Text style={styles.compactName} numberOfLines={1}>
              {profile.name}, {profile.age}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {profile.photo ? (
          <Image source={{ uri: profile.photo }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={64} color="#D1D5DB" />
          </View>
        )}

        {/* Online Indicator */}
        {profile.online && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDotLarge} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}

        {/* Badges */}
        <View style={styles.badges}>
          {profile.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            </View>
          )}
          {profile.premium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Compatibility Badge */}
        {profile.compatibility_score && (
          <View style={styles.compatibilityBadge}>
            <Text style={styles.compatibilityText}>{profile.compatibility_score}% Match</Text>
          </View>
        )}

        {/* Gradient Overlay */}
        <View style={styles.overlay} />

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
          </View>

          {profile.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>
                {profile.location}
                {profile.distance && \` - \${profile.distance} km away\`}
              </Text>
            </View>
          )}

          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {(onLike || onPass) && (
        <View style={styles.actions}>
          {onPass && (
            <TouchableOpacity
              style={styles.passActionButton}
              onPress={() => onPass(profile.id)}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {onLike && (
            <TouchableOpacity
              style={styles.likeActionButton}
              onPress={() => onLike(profile.id)}
            >
              <Ionicons name="heart" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  onlineDotLarge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  badges: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    padding: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  premiumBadge: {
    padding: 6,
    backgroundColor: '#EAB308',
    borderRadius: 12,
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#EC4899',
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  age: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  actions: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  passActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Compact styles
  compactCard: {
    width: 100,
  },
  compactImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  compactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  compactPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  compactOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  compactName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

export function generateProfileStats(options: DatingProfileOptions = {}): string {
  const { componentName = 'ProfileStats', endpoint = '/profiles/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ProfileStatsData {
  total_likes: number;
  total_matches: number;
  total_views: number;
  super_likes_received: number;
  messages_received: number;
  profile_score: number;
  weekly_likes: number[];
  top_admirers?: Array<{ id: string; name: string; photo: string }>;
  boost_active?: boolean;
  boost_remaining_time?: number;
}

interface ${componentName}Props {
  userId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      const url = userId ? '${endpoint}/' + userId : '${endpoint}';
      const response = await api.get<ProfileStatsData>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      icon: 'heart',
      label: 'Likes Received',
      value: stats.total_likes,
      color: '#EC4899',
      bgColor: '#FDF2F8',
    },
    {
      icon: 'people',
      label: 'Matches',
      value: stats.total_matches,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
    {
      icon: 'eye',
      label: 'Profile Views',
      value: stats.total_views,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      icon: 'star',
      label: 'Super Likes',
      value: stats.super_likes_received,
      color: '#EAB308',
      bgColor: '#FEFCE8',
    },
  ];

  const maxWeeklyLike = Math.max(...(stats.weekly_likes || []), 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Boost Status */}
      {stats.boost_active && (
        <View style={styles.boostCard}>
          <View style={styles.boostIcon}>
            <Ionicons name="flash" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.boostInfo}>
            <Text style={styles.boostTitle}>Boost Active</Text>
            <Text style={styles.boostSubtitle}>Your profile is being shown to more people!</Text>
            {stats.boost_remaining_time && (
              <Text style={styles.boostTime}>
                {Math.floor(stats.boost_remaining_time / 60)} minutes remaining
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, idx) => (
          <View key={idx} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Profile Score */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Score</Text>
          <Text style={styles.scoreValue}>{stats.profile_score}%</Text>
        </View>
        <Text style={styles.cardSubtitle}>How attractive is your profile</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: stats.profile_score + '%' }]} />
        </View>
        <View style={styles.tips}>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Add more photos +5%</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Verify profile +10%</Text>
          </View>
        </View>
      </View>

      {/* Weekly Activity */}
      {stats.weekly_likes && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={20} color="#22C55E" />
            <Text style={styles.cardTitle}>Weekly Activity</Text>
          </View>
          <View style={styles.chartContainer}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const value = stats.weekly_likes[idx] || 0;
              const height = (value / maxWeeklyLike) * 100;
              return (
                <View key={day} style={styles.chartColumn}>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: height > 0 ? height + '%' : 2 }]} />
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Top Admirers */}
      {stats.top_admirers && stats.top_admirers.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy" size={20} color="#EAB308" />
            <Text style={styles.cardTitle}>Top Admirers</Text>
          </View>
          <View style={styles.admirersRow}>
            {stats.top_admirers.slice(0, 5).map((admirer) => (
              <View key={admirer.id} style={styles.admirerItem}>
                <View style={styles.admirerAvatar}>
                  {admirer.photo ? (
                    <Image source={{ uri: admirer.photo }} style={styles.admirerImage} />
                  ) : (
                    <Ionicons name="person" size={20} color="#D1D5DB" />
                  )}
                </View>
                <Text style={styles.admirerName} numberOfLines={1}>{admirer.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    marginBottom: 16,
  },
  boostIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  boostInfo: {
    flex: 1,
  },
  boostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  boostSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  boostTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
  },
  tips: {
    flexDirection: 'row',
    gap: 8,
  },
  tip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 100,
    marginTop: 12,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#EC4899',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  admirersRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  admirerItem: {
    alignItems: 'center',
  },
  admirerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#EC4899',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  admirerImage: {
    width: '100%',
    height: '100%',
  },
  admirerName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    width: 56,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

export function generateAthleteProfile(options: DatingProfileOptions = {}): string {
  const { componentName = 'AthleteProfile', endpoint = '/profiles' } = options;

  return `import React, { useState } from 'react';
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
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');

interface AthleteProfileData {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location?: string;
  bio?: string;
  sport: string;
  level: 'amateur' | 'semi-pro' | 'professional';
  achievements?: Array<{ title: string; year: number; icon: string }>;
  stats?: {
    years_active: number;
    competitions: number;
    medals: number;
    personal_records?: Record<string, string>;
  };
  training_schedule?: string;
  looking_for?: string;
  verified?: boolean;
  team?: string;
  diet?: string;
  goals?: string[];
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['athlete-profile', id],
    queryFn: async () => {
      const response = await api.get<AthleteProfileData>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="fitness" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>Profile not found</Text>
      </View>
    );
  }

  const photos = profile.photos?.length > 0 ? profile.photos : [];

  const levelColors: Record<string, string> = {
    amateur: '#22C55E',
    'semi-pro': '#3B82F6',
    professional: '#8B5CF6',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photo Gallery */}
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

        {/* Sport Badge */}
        <View style={styles.sportBadges}>
          <View style={styles.sportBadge}>
            <Ionicons name="fitness" size={16} color="#FFFFFF" />
            <Text style={styles.sportText}>{profile.sport}</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: levelColors[profile.level] }]}>
            <Text style={styles.levelText}>{profile.level.replace('-', ' ')}</Text>
          </View>
        </View>

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
            {profile.verified && (
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            )}
          </View>

          {profile.team && (
            <View style={styles.infoRow}>
              <Ionicons name="trophy-outline" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.infoText}>{profile.team}</Text>
            </View>
          )}

          {profile.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.infoText}>{profile.location}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Quick Stats */}
        {profile.stats && (
          <View style={styles.quickStats}>
            <View style={[styles.quickStatItem, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="calendar" size={20} color="#F97316" />
              <Text style={styles.quickStatValue}>{profile.stats.years_active}</Text>
              <Text style={styles.quickStatLabel}>Years Active</Text>
            </View>
            <View style={[styles.quickStatItem, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="flag" size={20} color="#3B82F6" />
              <Text style={styles.quickStatValue}>{profile.stats.competitions}</Text>
              <Text style={styles.quickStatLabel}>Competitions</Text>
            </View>
            <View style={[styles.quickStatItem, { backgroundColor: '#FEFCE8' }]}>
              <Ionicons name="medal" size={20} color="#EAB308" />
              <Text style={styles.quickStatValue}>{profile.stats.medals}</Text>
              <Text style={styles.quickStatLabel}>Medals</Text>
            </View>
          </View>
        )}

        {/* Bio */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Achievements */}
        {profile.achievements && profile.achievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={16} color="#EAB308" />
              <Text style={styles.sectionTitle}>Achievements</Text>
            </View>
            {profile.achievements.map((achievement, idx) => (
              <View key={idx} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={20} color="#EAB308" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementYear}>{achievement.year}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Personal Records */}
        {profile.stats?.personal_records && Object.keys(profile.stats.personal_records).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={16} color="#F97316" />
              <Text style={styles.sectionTitle}>Personal Records</Text>
            </View>
            <View style={styles.recordsGrid}>
              {Object.entries(profile.stats.personal_records).map(([key, value]) => (
                <View key={key} style={styles.recordItem}>
                  <Text style={styles.recordLabel}>{key.replace('_', ' ')}</Text>
                  <Text style={styles.recordValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Training Schedule */}
        {profile.training_schedule && (
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>Training Schedule</Text>
              <Text style={styles.infoCardValue}>{profile.training_schedule}</Text>
            </View>
          </View>
        )}

        {/* Goals */}
        {profile.goals && profile.goals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <View style={styles.tagsContainer}>
              {profile.goals.map((goal, idx) => (
                <View key={idx} style={styles.goalTag}>
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Looking For */}
        {profile.looking_for && (
          <View style={styles.lookingForCard}>
            <Ionicons name="heart-outline" size={20} color="#EC4899" />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>Looking For</Text>
              <Text style={styles.infoCardValue}>{profile.looking_for}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  photoContainer: {
    width: width,
    height: width * 1.33,
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
  sportBadges: {
    position: 'absolute',
    top: 60,
    left: 16,
    gap: 8,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F97316',
    borderRadius: 16,
  },
  sportText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  basicInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
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
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    padding: 16,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  achievementYear: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recordItem: {
    width: '48%',
    padding: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
  },
  recordLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  recordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA580C',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  infoCardValue: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
  },
  goalText: {
    fontSize: 14,
    color: '#EA580C',
  },
  lookingForCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    gap: 12,
  },
});

export default ${componentName};
`;
}

export function generateArtistProfile(options: DatingProfileOptions = {}): string {
  const { componentName = 'ArtistProfile', endpoint = '/profiles' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');

interface ArtistProfileData {
  id: string;
  name: string;
  stage_name?: string;
  age: number;
  photos: string[];
  location?: string;
  bio?: string;
  art_type: 'visual' | 'music' | 'performance' | 'digital' | 'photography' | 'film';
  style?: string;
  portfolio?: Array<{
    id: string;
    title: string;
    image: string;
    type: string;
    likes?: number;
  }>;
  streaming_links?: Record<string, string>;
  exhibitions?: Array<{ title: string; venue: string; year: number }>;
  collaborations?: string[];
  influences?: string[];
  looking_for?: string;
  verified?: boolean;
  featured?: boolean;
  followers_count?: number;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['artist-profile', id],
    queryFn: async () => {
      const response = await api.get<ArtistProfileData>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="color-palette" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>Profile not found</Text>
      </View>
    );
  }

  const photos = profile.photos?.length > 0 ? profile.photos : [];

  const artTypeIcons: Record<string, string> = {
    visual: 'color-palette',
    music: 'musical-notes',
    performance: 'mic',
    digital: 'brush',
    photography: 'camera',
    film: 'film',
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photo Gallery */}
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

        {/* Art Type Badge */}
        <View style={styles.artBadges}>
          <View style={styles.artTypeBadge}>
            <Ionicons name={artTypeIcons[profile.art_type] as any} size={16} color="#FFFFFF" />
            <Text style={styles.artTypeText}>{profile.art_type} Artist</Text>
          </View>
          {profile.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#FFFFFF" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.stage_name || profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
            {profile.verified && (
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            )}
          </View>

          {profile.stage_name && profile.name !== profile.stage_name && (
            <Text style={styles.realName}>{profile.name}</Text>
          )}

          {profile.style && (
            <Text style={styles.styleText}>{profile.style}</Text>
          )}

          {profile.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{profile.location}</Text>
            </View>
          )}

          {profile.followers_count && (
            <Text style={styles.followersText}>
              {profile.followers_count.toLocaleString()} followers
            </Text>
          )}
        </View>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Bio */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Portfolio */}
        {profile.portfolio && profile.portfolio.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette" size={16} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Portfolio</Text>
            </View>
            <View style={styles.portfolioGrid}>
              {profile.portfolio.slice(0, 6).map((item) => (
                <TouchableOpacity key={item.id} style={styles.portfolioItem}>
                  <Image source={{ uri: item.image }} style={styles.portfolioImage} />
                  <View style={styles.portfolioOverlay}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                  </View>
                  {item.likes && (
                    <View style={styles.likesContainer}>
                      <Ionicons name="heart" size={12} color="#FFFFFF" />
                      <Text style={styles.likesText}>{item.likes}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {profile.portfolio.length > 6 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all {profile.portfolio.length} works</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Streaming Links */}
        {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listen / Watch</Text>
            <View style={styles.linksContainer}>
              {Object.entries(profile.streaming_links).map(([platform, url]) => (
                <TouchableOpacity
                  key={platform}
                  style={styles.linkButton}
                  onPress={() => handleLinkPress(url)}
                >
                  <Text style={styles.linkText}>{platform}</Text>
                  <Ionicons name="open-outline" size={14} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Exhibitions */}
        {profile.exhibitions && profile.exhibitions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exhibitions & Shows</Text>
            {profile.exhibitions.map((exhibition, idx) => (
              <View key={idx} style={styles.exhibitionItem}>
                <Text style={styles.exhibitionTitle}>{exhibition.title}</Text>
                <Text style={styles.exhibitionVenue}>{exhibition.venue} - {exhibition.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Influences */}
        {profile.influences && profile.influences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Influences</Text>
            <View style={styles.tagsContainer}>
              {profile.influences.map((influence, idx) => (
                <View key={idx} style={styles.influenceTag}>
                  <Text style={styles.influenceText}>{influence}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Open to Collaborations */}
        {profile.collaborations && profile.collaborations.length > 0 && (
          <View style={styles.collabCard}>
            <Text style={styles.collabTitle}>Open to Collaborate On</Text>
            <View style={styles.collabList}>
              {profile.collaborations.map((collab, idx) => (
                <Text key={idx} style={styles.collabText}>
                  {collab}{idx < profile.collaborations!.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Looking For */}
        {profile.looking_for && (
          <View style={styles.lookingForCard}>
            <Ionicons name="heart-outline" size={20} color="#EC4899" />
            <View style={styles.lookingForContent}>
              <Text style={styles.lookingForLabel}>Looking For</Text>
              <Text style={styles.lookingForValue}>{profile.looking_for}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  photoContainer: {
    width: width,
    height: width * 1.33,
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
  artBadges: {
    position: 'absolute',
    top: 60,
    left: 16,
    gap: 8,
  },
  artTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
  },
  artTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#EAB308',
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  basicInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
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
  realName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  styleText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  followersText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  portfolioItem: {
    width: (width - 48) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  likesContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  likesText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  viewAllButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  exhibitionItem: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 8,
  },
  exhibitionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  exhibitionVenue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  influenceTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
  },
  influenceText: {
    fontSize: 14,
    color: '#7C3AED',
  },
  collabCard: {
    padding: 16,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    marginBottom: 20,
  },
  collabTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  collabList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  collabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  lookingForCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    gap: 12,
  },
  lookingForContent: {
    flex: 1,
  },
  lookingForLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  lookingForValue: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}
