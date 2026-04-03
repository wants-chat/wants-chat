/**
 * Speaker Grid Component Generator for React Native
 *
 * Generates speaker and sponsor grid components with:
 * - FlatList with speaker cards
 * - Avatar images with social links
 * - Sponsor tiers
 */

export interface SpeakerGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSpeakerGrid(options: SpeakerGridOptions = {}): string {
  const { componentName = 'SpeakerGrid', endpoint = '/speakers' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: speakers, isLoading } = useQuery({
    queryKey: ['speakers', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?event_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleSocialPress = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const renderSpeaker = useCallback(({ item: speaker }: { item: any }) => (
    <View style={styles.speakerCard}>
      {speaker.avatar_url ? (
        <Image
          source={{ uri: speaker.avatar_url }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={40} color="#7C3AED" />
        </View>
      )}
      <Text style={styles.speakerName}>{speaker.name}</Text>
      {speaker.title && (
        <Text style={styles.speakerTitle}>{speaker.title}</Text>
      )}
      {speaker.company && (
        <Text style={styles.speakerCompany}>{speaker.company}</Text>
      )}
      <View style={styles.socialLinks}>
        {speaker.linkedin_url && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialPress(speaker.linkedin_url)}
          >
            <Ionicons name="logo-linkedin" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        {speaker.twitter_url && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialPress(speaker.twitter_url)}
          >
            <Ionicons name="logo-twitter" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        {speaker.website_url && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialPress(speaker.website_url)}
          >
            <Ionicons name="globe-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!speakers || speakers.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No speakers listed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Speakers</Text>
      </View>
      <FlatList
        data={speakers}
        renderItem={renderSpeaker}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  speakerCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  speakerTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  speakerCompany: {
    fontSize: 12,
    color: '#7C3AED',
    textAlign: 'center',
    marginTop: 2,
  },
  socialLinks: {
    flexDirection: 'row',
    marginTop: 12,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
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

export function generateSponsorGrid(options: SpeakerGridOptions = {}): string {
  const { componentName = 'SponsorGrid', endpoint = '/sponsors' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  SectionList,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ['sponsors', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?event_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Group sponsors by tier
  const groupedSponsors = React.useMemo(() => {
    if (!sponsors) return [];

    const tiers: Record<string, any[]> = {};
    const tierOrder = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'];

    sponsors.forEach((sponsor: any) => {
      const tier = sponsor.tier || 'Partner';
      if (!tiers[tier]) tiers[tier] = [];
      tiers[tier].push(sponsor);
    });

    return tierOrder
      .filter((tier) => tiers[tier]?.length > 0)
      .map((tier) => ({
        title: tier,
        data: [{ sponsors: tiers[tier], tier }],
      }));
  }, [sponsors]);

  const handleSponsorPress = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return { columns: 2, logoSize: 60 };
      case 'Gold':
        return { columns: 3, logoSize: 48 };
      default:
        return { columns: 4, logoSize: 36 };
    }
  };

  const renderSponsorTier = ({ item }: { item: { sponsors: any[]; tier: string } }) => {
    const config = getTierConfig(item.tier);

    return (
      <View style={styles.tierContent}>
        <View style={[styles.sponsorGrid, { flexWrap: 'wrap' }]}>
          {item.sponsors.map((sponsor: any) => (
            <TouchableOpacity
              key={sponsor.id}
              style={[
                styles.sponsorItem,
                { width: \`\${100 / config.columns - 4}%\` },
              ]}
              onPress={() => handleSponsorPress(sponsor.website_url)}
            >
              {sponsor.logo_url ? (
                <Image
                  source={{ uri: sponsor.logo_url }}
                  style={[styles.sponsorLogo, { height: config.logoSize }]}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.sponsorLogoPlaceholder, { height: config.logoSize }]}>
                  <Text style={styles.sponsorPlaceholderText}>{sponsor.name}</Text>
                </View>
              )}
              <Text style={styles.sponsorName} numberOfLines={1}>
                {sponsor.name}
              </Text>
              <Ionicons name="open-outline" size={12} color="#9CA3AF" style={styles.linkIcon} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.tierHeader}>
      <Text style={styles.tierTitle}>{section.title} Sponsors</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!sponsors || sponsors.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="business-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No sponsors listed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sponsors</Text>
      </View>
      <SectionList
        sections={groupedSponsors}
        renderItem={renderSponsorTier}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => item.tier + index}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  tierHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  tierTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tierContent: {
    marginBottom: 24,
  },
  sponsorGrid: {
    flexDirection: 'row',
  },
  sponsorItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: '1%',
  },
  sponsorLogo: {
    width: '100%',
    marginBottom: 8,
  },
  sponsorLogoPlaceholder: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sponsorPlaceholderText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sponsorName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  linkIcon: {
    marginTop: 4,
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
