/**
 * Artist Component Generators for React Native Creative/Design Apps
 *
 * Generates artist-related components including:
 * - ArtistProfileGallery - Artist profile with portfolio gallery
 */

export interface ArtistGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate ArtistProfileGallery component for React Native
 */
export function generateArtistProfileGallery(options: ArtistGeneratorOptions = {}): string {
  const {
    componentName = 'ArtistProfileGallery',
    endpoint = '/artists',
    queryKey = 'artist',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = (SCREEN_WIDTH - 48) / 2;

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url?: string;
  price?: number;
  medium?: string;
  dimensions?: string;
  year?: number;
  status?: 'available' | 'sold' | 'reserved';
  likes?: number;
  views?: number;
}

interface Artist {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  email?: string;
  specialties?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  stats?: {
    artworks: number;
    followers: number;
    following: number;
    totalViews: number;
    totalLikes: number;
    totalSales: number;
  };
  achievements?: {
    title: string;
    description: string;
    year: number;
  }[];
  created_at?: string;
  artworks?: Artwork[];
}

interface ${componentName}Props {
  artistId?: string;
  style?: any;
}

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'available' | 'sold';

const ${componentName}: React.FC<${componentName}Props> = ({ artistId: propArtistId, style }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id: paramId } = (route.params as { id?: string }) || {};
  const artistId = propArtistId || paramId;

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', artistId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + artistId);
      return response?.data || response;
    },
    enabled: !!artistId,
  });

  const { data: artworks = [] } = useQuery({
    queryKey: ['${queryKey}-artworks', artistId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + artistId + '/artworks');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!artistId,
  });

  const handleWebsitePress = useCallback(() => {
    if (artist?.website) {
      Linking.openURL(artist.website);
    }
  }, [artist?.website]);

  const handleSocialPress = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const handleArtworkPress = useCallback((artwork: Artwork) => {
    navigation.navigate('ArtworkDetail' as never, { id: artwork.id } as never);
  }, [navigation]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const filteredArtworks = (artist?.artworks || artworks).filter((artwork: Artwork) => {
    if (activeTab === 'all') return true;
    return artwork.status === activeTab;
  });

  const socialIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    instagram: 'logo-instagram',
    twitter: 'logo-twitter',
    facebook: 'logo-facebook',
    linkedin: 'logo-linkedin',
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    available: { bg: '#D1FAE5', text: '#059669' },
    sold: { bg: '#FEE2E2', text: '#DC2626' },
    reserved: { bg: '#FEF3C7', text: '#D97706' },
  };

  const renderArtworkGrid = useCallback(
    ({ item }: { item: Artwork }) => (
      <TouchableOpacity
        style={styles.artworkCard}
        onPress={() => handleArtworkPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnail_url || item.image_url }}
          style={styles.artworkImage}
          resizeMode="cover"
        />
        <View style={styles.artworkInfo}>
          <View style={styles.artworkHeader}>
            <Text style={styles.artworkTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.status && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[item.status]?.bg || '#F3F4F6' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColors[item.status]?.text || '#374151' },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.artworkMeta}>
            {item.medium && <Text style={styles.artworkMetaText}>{item.medium}</Text>}
            {item.year && <Text style={styles.artworkMetaText}>{item.year}</Text>}
          </View>
          {item.price !== undefined && item.status === 'available' && (
            <Text style={styles.artworkPrice}>\${item.price.toLocaleString()}</Text>
          )}
          <View style={styles.artworkStats}>
            {item.views !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={14} color="#6B7280" />
                <Text style={styles.statText}>{item.views}</Text>
              </View>
            )}
            {item.likes !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={14} color="#6B7280" />
                <Text style={styles.statText}>{item.likes}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleArtworkPress, statusColors]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error || !artist) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text style={styles.errorText}>Artist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Cover & Profile Header */}
      <View style={styles.headerSection}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {artist.cover_url ? (
            <Image source={{ uri: artist.cover_url }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverGradient} />
          )}
          <View style={styles.coverOverlay} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {artist.avatar_url ? (
              <Image source={{ uri: artist.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(artist.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileDetails}>
            <Text style={styles.artistName}>{artist.name}</Text>
            {artist.username && (
              <Text style={styles.artistUsername}>@{artist.username}</Text>
            )}
            {artist.specialties && artist.specialties.length > 0 && (
              <View style={styles.specialtiesContainer}>
                {artist.specialties.slice(0, 3).map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.followButton}>
              <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-social-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio */}
        {artist.bio && <Text style={styles.bio}>{artist.bio}</Text>}

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          {artist.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{artist.location}</Text>
            </View>
          )}
          {artist.website && (
            <TouchableOpacity style={styles.metaItem} onPress={handleWebsitePress}>
              <Ionicons name="globe-outline" size={16} color="#7C3AED" />
              <Text style={[styles.metaText, styles.linkText]}>
                {artist.website.replace(/^https?:\\/\\//, '').replace(/\\/$/, '')}
              </Text>
            </TouchableOpacity>
          )}
          {artist.created_at && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>Joined {formatDate(artist.created_at)}</Text>
            </View>
          )}
        </View>

        {/* Social Links */}
        {artist.social_links && Object.keys(artist.social_links).length > 0 && (
          <View style={styles.socialContainer}>
            {Object.entries(artist.social_links).map(([platform, url]) => {
              if (!url) return null;
              return (
                <TouchableOpacity
                  key={platform}
                  style={styles.socialButton}
                  onPress={() => handleSocialPress(url)}
                >
                  <Ionicons
                    name={socialIcons[platform] || 'globe-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Stats */}
        {artist.stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{artist.stats.artworks || 0}</Text>
              <Text style={styles.statLabel}>Artworks</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {(artist.stats.followers || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {(artist.stats.following || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {(artist.stats.totalViews || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {(artist.stats.totalLikes || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{artist.stats.totalSales || 0}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
          </View>
        )}
      </View>

      {/* Achievements */}
      {artist.achievements && artist.achievements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={20} color="#D97706" />
            <Text style={styles.sectionTitle}>Achievements & Awards</Text>
          </View>
          {artist.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Ionicons name="star" size={20} color="#D97706" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <Text style={styles.achievementYear}>{achievement.year}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Portfolio Section */}
      <View style={styles.section}>
        {/* Portfolio Header */}
        <View style={styles.portfolioHeader}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Portfolio</Text>
          </View>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={viewMode === 'grid' ? '#7C3AED' : '#6B7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === 'list' ? '#7C3AED' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabContainer}>
          {(['all', 'available', 'sold'] as FilterTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Artwork Grid/List */}
        {filteredArtworks.length > 0 ? (
          <FlatList
            data={filteredArtworks}
            renderItem={renderArtworkGrid}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode}
            contentContainerStyle={styles.artworkList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {activeTab === 'all' ? 'No artworks yet' : \`No \${activeTab} artworks\`}
            </Text>
          </View>
        )}
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
    minHeight: 300,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#DC2626',
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  coverContainer: {
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7C3AED',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  profileInfo: {
    paddingHorizontal: 16,
    marginTop: -48,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileDetails: {
    marginTop: 12,
  },
  artistName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  artistUsername: {
    fontSize: 16,
    color: '#6B7280',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  specialtyBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 12,
    color: '#7C3AED',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bio: {
    marginTop: 16,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    color: '#7C3AED',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statBox: {
    alignItems: 'center',
    minWidth: 60,
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  achievementYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewModeButton: {
    padding: 8,
  },
  viewModeButtonActive: {
    backgroundColor: '#EDE9FE',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  artworkList: {
    paddingBottom: 16,
  },
  artworkCard: {
    width: ARTWORK_SIZE,
    marginRight: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: ARTWORK_SIZE,
  },
  artworkInfo: {
    padding: 12,
  },
  artworkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  artworkTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  artworkMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  artworkMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  artworkPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 8,
  },
  artworkStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
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
