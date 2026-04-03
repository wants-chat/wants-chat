/**
 * Author Component Generators (React Native)
 *
 * Generates author profile, author list, and author card components.
 */

export interface AuthorOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAuthorProfile(options: AuthorOptions = {}): string {
  const { componentName = 'AuthorProfile', endpoint = '/authors' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  authorId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ authorId }) => {
  const navigation = useNavigation<any>();

  const { data: author, isLoading } = useQuery({
    queryKey: ['author', authorId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${authorId}\`);
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

  if (!author) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Author not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {author.avatar_url ? (
          <Image source={{ uri: author.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#9333EA" />
          </View>
        )}
        <Text style={styles.name}>{author.name}</Text>
        {author.title && <Text style={styles.title}>{author.title}</Text>}

        {author.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
            <Text style={styles.verifiedText}>Verified Author</Text>
          </View>
        )}
      </View>

      {/* Bio */}
      {author.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{author.bio}</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{author.book_count || 0}</Text>
          <Text style={styles.statLabel}>Books</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{author.article_count || 0}</Text>
          <Text style={styles.statLabel}>Articles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{author.follower_count || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        {author.rating && (
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Text style={styles.statValue}>{author.rating}</Text>
              <Ionicons name="star" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.followButton}>
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="mail-outline" size={20} color="#9333EA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="share-outline" size={20} color="#9333EA" />
        </TouchableOpacity>
      </View>

      {/* Social Links */}
      {author.social_links && Object.keys(author.social_links).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.socialLinks}>
            {author.social_links.twitter && (
              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => Linking.openURL(author.social_links.twitter)}
              >
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>
            )}
            {author.social_links.linkedin && (
              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => Linking.openURL(author.social_links.linkedin)}
              >
                <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
              </TouchableOpacity>
            )}
            {author.social_links.instagram && (
              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => Linking.openURL(author.social_links.instagram)}
              >
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              </TouchableOpacity>
            )}
            {author.social_links.website && (
              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => Linking.openURL(author.social_links.website)}
              >
                <Ionicons name="globe-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Featured Works */}
      {author.featured_works && author.featured_works.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Works</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.worksList}
          >
            {author.featured_works.map((work: any) => (
              <TouchableOpacity
                key={work.id}
                style={styles.workCard}
                onPress={() => navigation.navigate('WorkDetail', { id: work.id })}
              >
                {work.cover_url ? (
                  <Image source={{ uri: work.cover_url }} style={styles.workCover} />
                ) : (
                  <View style={styles.workCoverPlaceholder}>
                    <Ionicons name="book" size={24} color="#9CA3AF" />
                  </View>
                )}
                <Text style={styles.workTitle} numberOfLines={2}>
                  {work.title}
                </Text>
                <Text style={styles.workType}>{work.type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.infoList}>
          {author.location && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{author.location}</Text>
            </View>
          )}
          {author.genres && author.genres.length > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="bookmark-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{author.genres.join(', ')}</Text>
            </View>
          )}
          {author.member_since && (
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Member since{' '}
                {new Date(author.member_since).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>
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
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#9333EA',
    fontWeight: '500',
  },
  bioText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#9333EA',
    paddingVertical: 12,
    borderRadius: 8,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialLink: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  worksList: {
    gap: 12,
  },
  workCard: {
    width: 120,
  },
  workCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
  },
  workCoverPlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 8,
  },
  workType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default ${componentName};
`;
}

export function generateAuthorList(options: AuthorOptions = {}): string {
  const { componentName = 'AuthorList', endpoint = '/authors' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  genre?: string;
  limit?: number;
  onAuthorPress?: (author: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ genre, limit, onAuthorPress }) => {
  const navigation = useNavigation<any>();

  const { data: authors, isLoading, refetch } = useQuery({
    queryKey: ['authors', genre, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (genre) params.append('genre', genre);
      if (limit) params.append('limit', limit.toString());
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleAuthorPress = (author: any) => {
    if (onAuthorPress) {
      onAuthorPress(author);
    } else {
      navigation.navigate('AuthorDetail', { id: author.id });
    }
  };

  const renderAuthor = ({ item: author }: { item: any }) => (
    <TouchableOpacity
      style={styles.authorCard}
      onPress={() => handleAuthorPress(author)}
      activeOpacity={0.7}
    >
      {author.avatar_url ? (
        <Image source={{ uri: author.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={32} color="#9333EA" />
        </View>
      )}
      <View style={styles.authorInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.authorName}>{author.name}</Text>
          {author.is_verified && (
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          )}
        </View>
        {author.title && (
          <Text style={styles.authorTitle} numberOfLines={1}>
            {author.title}
          </Text>
        )}
        <View style={styles.authorMeta}>
          {author.book_count !== undefined && (
            <Text style={styles.metaText}>{author.book_count} books</Text>
          )}
          {author.follower_count !== undefined && (
            <Text style={styles.metaText}>{author.follower_count} followers</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!authors?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No authors found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={authors}
      renderItem={renderAuthor}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  separator: {
    height: 12,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 12,
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
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  authorTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  authorMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 13,
    color: '#9333EA',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export function generateAuthorCard(options: AuthorOptions = {}): string {
  const { componentName = 'AuthorCard' } = options;

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

interface Author {
  id: string;
  name: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  book_count?: number;
  follower_count?: number;
  is_verified?: boolean;
  genres?: string[];
}

interface ${componentName}Props {
  author: Author;
  variant?: 'compact' | 'full';
  onPress?: () => void;
  onFollow?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  author,
  variant = 'compact',
  onPress,
  onFollow,
}) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('AuthorDetail', { id: author.id });
    }
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress} activeOpacity={0.7}>
        {author.avatar_url ? (
          <Image source={{ uri: author.avatar_url }} style={styles.compactAvatar} />
        ) : (
          <View style={styles.compactAvatarPlaceholder}>
            <Ionicons name="person" size={20} color="#9333EA" />
          </View>
        )}
        <View style={styles.compactInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.compactName} numberOfLines={1}>
              {author.name}
            </Text>
            {author.is_verified && (
              <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
            )}
          </View>
          {author.title && (
            <Text style={styles.compactTitle} numberOfLines={1}>
              {author.title}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.fullContainer} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.fullHeader}>
        {author.avatar_url ? (
          <Image source={{ uri: author.avatar_url }} style={styles.fullAvatar} />
        ) : (
          <View style={styles.fullAvatarPlaceholder}>
            <Ionicons name="person" size={40} color="#9333EA" />
          </View>
        )}
        <TouchableOpacity style={styles.fullFollowButton} onPress={onFollow}>
          <Text style={styles.fullFollowText}>Follow</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fullInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.fullName}>{author.name}</Text>
          {author.is_verified && (
            <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
          )}
        </View>
        {author.title && <Text style={styles.fullTitle}>{author.title}</Text>}
        {author.bio && (
          <Text style={styles.fullBio} numberOfLines={3}>
            {author.bio}
          </Text>
        )}

        {author.genres && author.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {author.genres.slice(0, 3).map((genre, index) => (
              <View key={index} style={styles.genreBadge}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.fullStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{author.book_count || 0}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{author.follower_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  compactAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  compactTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Full variant
  fullContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fullAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  fullAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullFollowButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#9333EA',
    borderRadius: 20,
  },
  fullFollowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullInfo: {
    marginTop: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  fullTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  fullBio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  genreBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 12,
    color: '#9333EA',
    fontWeight: '500',
  },
  fullStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
});

export default ${componentName};
`;
}
