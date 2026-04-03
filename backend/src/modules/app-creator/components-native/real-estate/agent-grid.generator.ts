/**
 * Agent Grid Generator for React Native App Creator
 *
 * Generates agent grid and profile components with:
 * - Agent cards with photo, name, listings count
 * - Agent profile with contact info
 * - FlatList grid layout
 * - Contact actions (call, email, message)
 */

export interface AgentGridOptions {
  componentName?: string;
  endpoint?: string;
  columns?: 2 | 3;
  detailScreen?: string;
}

/**
 * Generate an agent grid component for React Native
 */
export function generateAgentGrid(options: AgentGridOptions = {}): string {
  const {
    componentName = 'AgentGrid',
    endpoint = '/agents',
    columns = 2,
    detailScreen = 'AgentProfile',
  } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * (${columns} + 1)) / ${columns};

interface ${componentName}Props {
  data?: any[];
  title?: string;
  onAgentPress?: (agent: any) => void;
  limit?: number;
  style?: any;
}

interface AgentCardProps {
  agent: any;
  onPress: () => void;
  onCall?: () => void;
  onEmail?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onPress,
  onCall,
  onEmail,
}) => {
  const name = agent.name || agent.full_name || 'Agent';
  const title = agent.title || agent.role || 'Real Estate Agent';
  const avatar = agent.avatar_url || agent.avatar || agent.photo || agent.image;
  const rating = agent.rating || agent.average_rating;
  const reviewCount = agent.reviews_count || agent.review_count;
  const listingsCount = agent.listings_count || agent.active_listings;
  const phone = agent.phone || agent.phone_number;
  const email = agent.email;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.agentName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.agentTitle} numberOfLines={1}>
          {title}
        </Text>

        {rating !== undefined && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            {reviewCount !== undefined && (
              <Text style={styles.reviewCount}>({reviewCount})</Text>
            )}
          </View>
        )}

        {listingsCount !== undefined && (
          <View style={styles.listingsRow}>
            <Ionicons name="home-outline" size={14} color="#6B7280" />
            <Text style={styles.listingsText}>{listingsCount} listings</Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          {phone && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onCall?.();
              }}
            >
              <Ionicons name="call-outline" size={18} color="#3B82F6" />
            </TouchableOpacity>
          )}
          {email && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onEmail?.();
              }}
            >
              <Ionicons name="mail-outline" size={18} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  title = 'Our Agents',
  onAgentPress,
  limit,
  style,
}) => {
  const navigation = useNavigation();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['agents', limit],
    queryFn: async () => {
      try {
        let url = '${endpoint}';
        if (limit) url += '?limit=' + limit;
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  let agents = propData && propData.length > 0 ? propData : (fetchedData || []);
  if (limit && agents.length > limit) {
    agents = agents.slice(0, limit);
  }

  const handleAgentPress = useCallback((agent: any) => {
    if (onAgentPress) {
      onAgentPress(agent);
    } else {
      const agentId = agent.id || agent._id;
      navigation.navigate('${detailScreen}' as never, { id: agentId } as never);
    }
  }, [onAgentPress, navigation]);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(\`tel:\${phone}\`);
  }, []);

  const handleEmail = useCallback((email: string) => {
    Linking.openURL(\`mailto:\${email}\`);
  }, []);

  const renderAgent = useCallback(({ item }: { item: any }) => (
    <AgentCard
      agent={item}
      onPress={() => handleAgentPress(item)}
      onCall={() => item.phone && handleCall(item.phone)}
      onEmail={() => item.email && handleEmail(item.email)}
    />
  ), [handleAgentPress, handleCall, handleEmail]);

  const keyExtractor = useCallback((item: any) => (item.id || item._id)?.toString(), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Text style={styles.errorText}>Failed to load agents.</Text>
      </View>
    );
  }

  if (agents.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No agents found</Text>
        <Text style={styles.emptySubtitle}>Check back later.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <FlatList
        data={agents}
        renderItem={renderAgent}
        keyExtractor={keyExtractor}
        numColumns={${columns}}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: CARD_MARGIN,
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN / 2,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: CARD_MARGIN / 2,
    marginVertical: CARD_MARGIN / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  agentTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  listingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  listingsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
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

/**
 * Generate an agent profile component for React Native
 */
export function generateAgentProfile(options: AgentGridOptions = {}): string {
  const { componentName = 'AgentProfile', endpoint = '/agents' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: listings } = useQuery({
    queryKey: ['agent-listings', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/listings');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!agent,
  });

  const handleCall = () => {
    if (agent?.phone) {
      Linking.openURL(\`tel:\${agent.phone}\`);
    }
  };

  const handleEmail = () => {
    if (agent?.email) {
      Linking.openURL(\`mailto:\${agent.email}\`);
    }
  };

  const handleMessage = () => {
    navigation.navigate('Chat' as never, { agentId: id } as never);
  };

  const handleListingPress = (listing: any) => {
    navigation.navigate('PropertyDetail' as never, { id: listing.id } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Agent not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = agent.name || agent.full_name || 'Agent';
  const title = agent.title || agent.role || 'Real Estate Agent';
  const avatar = agent.avatar_url || agent.avatar || agent.photo;
  const coverImage = agent.cover_url || agent.cover_image;
  const rating = agent.rating || agent.average_rating;
  const reviewCount = agent.reviews_count || agent.review_count;
  const listingsCount = agent.listings_count || listings?.length || 0;
  const propertiesSold = agent.properties_sold || agent.sold_count;
  const experienceYears = agent.experience_years || agent.years_experience;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cover & Avatar */}
        <View style={styles.headerSection}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverGradient} />
          )}

          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Agent Info */}
        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>{name}</Text>
          <Text style={styles.agentTitle}>{title}</Text>

          {rating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#FBBF24" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              {reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
              )}
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{listingsCount}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            {propertiesSold !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{propertiesSold}</Text>
                <Text style={styles.statLabel}>Sold</Text>
              </View>
            )}
            {experienceYears !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{experienceYears}</Text>
                <Text style={styles.statLabel}>Years Exp.</Text>
              </View>
            )}
          </View>

          {/* Contact Buttons */}
          <View style={styles.contactButtons}>
            {agent.phone && (
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <Ionicons name="call-outline" size={22} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
            )}
            {agent.email && (
              <TouchableOpacity
                style={[styles.contactButton, styles.contactButtonOutline]}
                onPress={handleEmail}
              >
                <Ionicons name="mail-outline" size={22} color="#3B82F6" />
                <Text style={styles.contactButtonTextOutline}>Email</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.contactButton, styles.contactButtonOutline]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#3B82F6" />
              <Text style={styles.contactButtonTextOutline}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {agent.phone && (
            <View style={styles.contactInfoItem}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.contactInfoText}>{agent.phone}</Text>
            </View>
          )}
          {agent.email && (
            <View style={styles.contactInfoItem}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <Text style={styles.contactInfoText}>{agent.email}</Text>
            </View>
          )}
          {agent.location && (
            <View style={styles.contactInfoItem}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.contactInfoText}>{agent.location}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {agent.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{agent.bio}</Text>
          </View>
        )}

        {/* Specialties */}
        {agent.specialties && agent.specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              {agent.specialties.map((specialty: string, index: number) => (
                <View key={index} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
            onPress={() => setActiveTab('listings')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'listings' && styles.tabTextActive,
              ]}
            >
              Listings ({listingsCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'reviews' && styles.tabTextActive,
              ]}
            >
              Reviews ({reviewCount || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'listings' && listings && listings.length > 0 && (
          <View style={styles.listingsSection}>
            {listings.map((listing: any) => (
              <TouchableOpacity
                key={listing.id}
                style={styles.listingCard}
                onPress={() => handleListingPress(listing)}
              >
                {(listing.image_url || listing.images?.[0]) ? (
                  <Image
                    source={{ uri: listing.image_url || listing.images?.[0] }}
                    style={styles.listingImage}
                  />
                ) : (
                  <View style={styles.listingImagePlaceholder}>
                    <Ionicons name="home-outline" size={24} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.listingInfo}>
                  <Text style={styles.listingPrice}>
                    \${listing.price?.toLocaleString()}
                  </Text>
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {listing.title || listing.address}
                  </Text>
                  <View style={styles.listingFeatures}>
                    {listing.bedrooms && (
                      <Text style={styles.listingFeature}>{listing.bedrooms} bd</Text>
                    )}
                    {listing.bathrooms && (
                      <Text style={styles.listingFeature}>{listing.bathrooms} ba</Text>
                    )}
                    {listing.sqft && (
                      <Text style={styles.listingFeature}>{listing.sqft} sqft</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.reviewsSection}>
            <Text style={styles.comingSoonText}>Reviews coming soon</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerSection: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: 150,
  },
  coverGradient: {
    width: '100%',
    height: 150,
    backgroundColor: '#3B82F6',
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: SCREEN_WIDTH / 2 - 50,
    width: 100,
    height: 100,
    borderRadius: 50,
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  agentInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  agentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  agentTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  contactButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButtonTextOutline: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactInfoText: {
    fontSize: 16,
    color: '#374151',
  },
  bioText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  specialtyText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  listingsSection: {
    padding: 16,
  },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listingImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listingTitle: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  listingFeatures: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  listingFeature: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewsSection: {
    padding: 32,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}
