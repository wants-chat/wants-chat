/**
 * React Native Trust Badges Section Generator
 * Generates a component showing trust badges (secure payment, free shipping, etc.)
 */

export function generateRNTrustBadgesSection(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface TrustBadge {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface TrustBadgesSectionProps {
  badgesData?: any;
  badges?: TrustBadge[];
  [key: string]: any;
}

const DEFAULT_BADGES: TrustBadge[] = [
  {
    icon: 'shield-checkmark',
    title: 'Secure Payment',
    description: '100% secure payment with SSL encryption'
  },
  {
    icon: 'car',
    title: 'Free Shipping',
    description: 'Free shipping on orders over $50'
  },
  {
    icon: 'reload',
    title: 'Easy Returns',
    description: '30-day money-back guarantee'
  },
  {
    icon: 'headset',
    title: '24/7 Support',
    description: 'Dedicated customer support'
  }
];

export default function TrustBadgesSection({
  badgesData: propData,
  badges: propBadges = DEFAULT_BADGES
}: TrustBadgesSectionProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/trust-badges\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch trust badges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData;
  const badges = data?.badges || (Array.isArray(data) ? data : null) || propBadges;

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const renderBadge = ({ item }: { item: TrustBadge }) => {
    return (
      <View style={styles.badgeCard}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={32} color="#3b82f6" />
        </View>
        <View style={styles.badgeContent}>
          <Text style={styles.badgeTitle}>{item.title}</Text>
          <Text style={styles.badgeDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={badges}
        renderItem={renderBadge}
        keyExtractor={(item, index) => \`\${item.title}-\${index}\`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingVertical: 20,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 280,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return { code, imports };
}
