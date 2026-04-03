/**
 * Affiliate Component Generators (React Native)
 *
 * Generates affiliate marketing components:
 * - AffiliateLeaderboard: Top affiliates ranking
 * - AffiliateStats: Overall affiliate program statistics
 * - LinkGenerator: Affiliate link creation tool
 * - PayoutBalance: Affiliate earnings and payout info
 * - CommissionSummary: Commission breakdown and history
 */

export interface AffiliateLeaderboardOptions {
  componentName?: string;
  endpoint?: string;
  limit?: number;
  showEarnings?: boolean;
  showConversions?: boolean;
}

export function generateAffiliateLeaderboard(options: AffiliateLeaderboardOptions = {}): string {
  const {
    componentName = 'AffiliateLeaderboard',
    endpoint = '/affiliates/leaderboard',
    limit = 10,
    showEarnings = true,
    showConversions = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  period?: 'week' | 'month' | 'year' | 'all';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  limit = ${limit},
  period: initialPeriod = 'month',
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(initialPeriod);

  const { data: affiliates, isLoading, refetch } = useQuery({
    queryKey: ['affiliate-leaderboard', period, limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?period=\${period}&limit=\${limit}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const periods = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All' },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: 'trophy' as const, color: '#F59E0B' };
    if (rank === 2) return { icon: 'medal' as const, color: '#9CA3AF' };
    if (rank === 3) return { icon: 'medal' as const, color: '#D97706' };
    return null;
  };

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const rank = index + 1;
    const badge = getRankBadge(rank);
    const changeDirection = item.rank_change > 0 ? 'up' : item.rank_change < 0 ? 'down' : 'same';

    return (
      <View style={[
        styles.affiliateItem,
        rank <= 3 && styles.topRankItem,
        rank === 1 && styles.firstRankItem,
      ]}>
        <View style={styles.rankContainer}>
          {badge ? (
            <Ionicons name={badge.icon} size={20} color={badge.color} />
          ) : (
            <Text style={styles.rankNumber}>#{rank}</Text>
          )}
        </View>

        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name?.charAt(0) || 'A'}</Text>
            </View>
          )}
        </View>

        <View style={styles.affiliateInfo}>
          <Text style={styles.affiliateName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.affiliateUsername}>@{item.username || item.code}</Text>
        </View>

        {item.rank_change !== undefined && item.rank_change !== 0 && (
          <View style={styles.rankChangeContainer}>
            <Ionicons
              name={changeDirection === 'up' ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={changeDirection === 'up' ? '#10B981' : '#EF4444'}
            />
            <Text style={[
              styles.rankChangeText,
              changeDirection === 'up' ? styles.rankUp : styles.rankDown
            ]}>
              {Math.abs(item.rank_change)}
            </Text>
          </View>
        )}

        ${showConversions ? `<View style={styles.statColumn}>
          <Text style={styles.statValue}>{(item.conversions || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Conv.</Text>
        </View>` : ''}

        ${showEarnings ? `<View style={styles.statColumn}>
          <Text style={styles.earningsValue}>\${(item.earnings || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>` : ''}
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: any, index: number) => item.id?.toString() || index.toString(), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={20} color="#F59E0B" />
          <Text style={styles.headerTitle}>Top Affiliates</Text>
        </View>
        <View style={styles.periodSelector}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.periodTab, period === p.value && styles.periodTabActive]}
              onPress={() => setPeriod(p.value as any)}
            >
              <Text style={[
                styles.periodTabText,
                period === p.value && styles.periodTabTextActive
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!affiliates || affiliates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No affiliates data yet</Text>
        </View>
      ) : (
        <FlatList
          data={affiliates}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F59E0B"
              colors={['#F59E0B']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
  },
  periodTabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  periodTabTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  affiliateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topRankItem: {
    backgroundColor: '#FFFBEB',
  },
  firstRankItem: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  avatarContainer: {
    marginRight: 12,
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  affiliateInfo: {
    flex: 1,
    minWidth: 0,
  },
  affiliateName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  affiliateUsername: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rankChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 2,
  },
  rankChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rankUp: {
    color: '#10B981',
  },
  rankDown: {
    color: '#EF4444',
  },
  statColumn: {
    alignItems: 'flex-end',
    marginLeft: 12,
    minWidth: 50,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  earningsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export interface AffiliateStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAffiliateStats(options: AffiliateStatsOptions = {}): string {
  const {
    componentName = 'AffiliateStats',
    endpoint = '/affiliates/stats',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['affiliate-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        totalAffiliates: 156,
        activeAffiliates: 89,
        totalClicks: 45230,
        totalConversions: 1840,
        totalRevenue: 182500,
        totalCommissions: 27375,
        avgConversionRate: 4.07,
        avgOrderValue: 99.18,
      };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statCards = [
    {
      label: 'Total Affiliates',
      value: stats?.totalAffiliates || 0,
      subtext: \`\${stats?.activeAffiliates || 0} active\`,
      icon: 'people' as const,
      color: '#3B82F6',
    },
    {
      label: 'Total Clicks',
      value: (stats?.totalClicks || 0).toLocaleString(),
      icon: 'finger-print' as const,
      color: '#06B6D4',
    },
    {
      label: 'Conversions',
      value: (stats?.totalConversions || 0).toLocaleString(),
      subtext: \`\${(stats?.avgConversionRate || 0).toFixed(2)}% rate\`,
      icon: 'cart' as const,
      color: '#10B981',
    },
    {
      label: 'Total Revenue',
      value: '$' + (stats?.totalRevenue || 0).toLocaleString(),
      icon: 'trending-up' as const,
      color: '#059669',
    },
    {
      label: 'Commissions Paid',
      value: '$' + (stats?.totalCommissions || 0).toLocaleString(),
      icon: 'cash' as const,
      color: '#8B5CF6',
    },
    {
      label: 'Avg Order Value',
      value: '$' + (stats?.avgOrderValue || 0).toFixed(2),
      icon: 'pricetag' as const,
      color: '#F59E0B',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      <View style={styles.grid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            {stat.subtext && (
              <Text style={styles.statSubtext}>{stat.subtext}</Text>
            )}
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
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export interface LinkGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  showQRCode?: boolean;
  showUTMParams?: boolean;
}

export function generateLinkGenerator(options: LinkGeneratorOptions = {}): string {
  const {
    componentName = 'LinkGenerator',
    endpoint = '/affiliates/links',
    showQRCode = true,
    showUTMParams = true,
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  affiliateId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ affiliateId }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  ${showUTMParams ? `const [utmParams, setUtmParams] = useState({
    source: '',
    medium: '',
    campaign: '',
    content: '',
  });` : ''}

  const { data: recentLinks } = useQuery({
    queryKey: ['affiliate-links', affiliateId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?affiliate_id=\${affiliateId || ''}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${endpoint}', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      setGeneratedLink(data.link || data.url);
      Alert.alert('Success', 'Affiliate link generated!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to generate link');
    },
  });

  const handleGenerate = () => {
    if (!targetUrl) {
      Alert.alert('Error', 'Please enter a target URL');
      return;
    }

    generateMutation.mutate({
      target_url: targetUrl,
      campaign_name: campaignName,
      affiliate_id: affiliateId,
      ${showUTMParams ? 'utm_params: utmParams,' : ''}
    });
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    try {
      await Clipboard.setStringAsync(generatedLink);
      setCopied(true);
      Alert.alert('Success', 'Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Error', 'Failed to copy');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="link" size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>Generate Affiliate Link</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target URL *</Text>
            <TextInput
              style={styles.input}
              value={targetUrl}
              onChangeText={setTargetUrl}
              placeholder="https://example.com/product"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Campaign Name (Optional)</Text>
            <TextInput
              style={styles.input}
              value={campaignName}
              onChangeText={setCampaignName}
              placeholder="summer-sale-2024"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          ${showUTMParams ? `<TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Ionicons name="settings-outline" size={16} color="#6B7280" />
            <Text style={styles.advancedToggleText}>UTM Parameters</Text>
            <Ionicons
              name={showAdvanced ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showAdvanced && (
            <View style={styles.advancedSection}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>UTM Source</Text>
                  <TextInput
                    style={styles.smallInputField}
                    value={utmParams.source}
                    onChangeText={(text) => setUtmParams(p => ({ ...p, source: text }))}
                    placeholder="affiliate"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>UTM Medium</Text>
                  <TextInput
                    style={styles.smallInputField}
                    value={utmParams.medium}
                    onChangeText={(text) => setUtmParams(p => ({ ...p, medium: text }))}
                    placeholder="referral"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>UTM Campaign</Text>
                  <TextInput
                    style={styles.smallInputField}
                    value={utmParams.campaign}
                    onChangeText={(text) => setUtmParams(p => ({ ...p, campaign: text }))}
                    placeholder="summer-2024"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>UTM Content</Text>
                  <TextInput
                    style={styles.smallInputField}
                    value={utmParams.content}
                    onChangeText={(text) => setUtmParams(p => ({ ...p, content: text }))}
                    placeholder="banner-ad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          )}` : ''}

          <TouchableOpacity
            style={[styles.generateButton, (!targetUrl || generateMutation.isPending) && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={!targetUrl || generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate Link</Text>
              </>
            )}
          </TouchableOpacity>

          {generatedLink && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Your Affiliate Link:</Text>
              <View style={styles.resultRow}>
                <TextInput
                  style={styles.resultInput}
                  value={generatedLink}
                  editable={false}
                  selectTextOnFocus
                />
                <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy'}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          ${showQRCode ? `{generatedLink && (
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={80} color="#D1D5DB" />
              <Text style={styles.qrText}>QR Code will be generated here</Text>
            </View>
          )}` : ''}

          {recentLinks && recentLinks.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent Links</Text>
              {recentLinks.slice(0, 5).map((link: any) => (
                <View key={link.id} style={styles.recentItem}>
                  <Text style={styles.recentUrl} numberOfLines={1}>{link.target_url}</Text>
                  <Text style={styles.recentClicks}>{link.clicks || 0} clicks</Text>
                </View>
              ))}
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
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  advancedToggleText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  advancedSection: {
    marginBottom: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  smallInputField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resultInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  copyButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    marginTop: 16,
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignItems: 'center',
  },
  qrText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  recentSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentUrl: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    marginRight: 12,
  },
  recentClicks: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export interface PayoutBalanceOptions {
  componentName?: string;
  endpoint?: string;
  showPendingPayout?: boolean;
  showPayoutHistory?: boolean;
}

export function generatePayoutBalance(options: PayoutBalanceOptions = {}): string {
  const {
    componentName = 'PayoutBalance',
    endpoint = '/affiliates/balance',
    showPendingPayout = true,
    showPayoutHistory = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  affiliateId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ affiliateId }) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const { data: balance, isLoading, refetch } = useQuery({
    queryKey: ['affiliate-balance', affiliateId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}\${affiliateId ? \`?affiliate_id=\${affiliateId}\` : ''}\`);
      return response?.data || response || {
        available: 1250.00,
        pending: 450.00,
        lifetime: 15780.00,
        nextPayout: '2024-02-01',
        minimumPayout: 50,
        payoutMethod: 'PayPal',
      };
    },
  });

  ${showPayoutHistory ? `const { data: payoutHistory } = useQuery({
    queryKey: ['payout-history', affiliateId],
    queryFn: async () => {
      const response = await api.get<any>(\`/affiliates/payouts\${affiliateId ? \`?affiliate_id=\${affiliateId}\` : ''}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });` : ''}

  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/affiliates/payouts/request', { affiliate_id: affiliateId });
      return response?.data || response;
    },
    onSuccess: () => {
      Alert.alert('Success', 'Payout requested successfully');
      queryClient.invalidateQueries({ queryKey: ['affiliate-balance'] });
      setShowPayoutModal(false);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to request payout');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const canRequestPayout = (balance?.available || 0) >= (balance?.minimumPayout || 50);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10B981"
          colors={['#10B981']}
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="wallet" size={20} color="#10B981" />
          <Text style={styles.headerTitle}>Earnings & Payouts</Text>
        </View>

        <View style={styles.content}>
          {/* Balance Cards */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Ionicons name="cash" size={20} color="#FFFFFF" style={{ opacity: 0.8 }} />
            </View>
            <Text style={styles.balanceAmount}>\${(balance?.available || 0).toFixed(2)}</Text>
            <TouchableOpacity
              style={[styles.payoutButton, !canRequestPayout && styles.payoutButtonDisabled]}
              onPress={() => setShowPayoutModal(true)}
              disabled={!canRequestPayout}
            >
              <Text style={styles.payoutButtonText}>Request Payout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            ${showPendingPayout ? `<View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Pending</Text>
                <Ionicons name="time" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.statAmount}>\${(balance?.pending || 0).toFixed(2)}</Text>
              <Text style={styles.statSubtext}>Clears in 30 days</Text>
            </View>` : ''}

            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Lifetime</Text>
                <Ionicons name="trending-up" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.statAmount}>\${(balance?.lifetime || 0).toLocaleString()}</Text>
              <Text style={styles.statSubtext}>Total earned</Text>
            </View>
          </View>

          {/* Payout Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={18} color="#3B82F6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Next Payout Date</Text>
                <Text style={styles.infoValue}>
                  {balance?.nextPayout ? formatDate(balance.nextPayout) : 'Not scheduled'}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="card" size={18} color="#3B82F6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Payout Method</Text>
                <Text style={styles.infoValue}>{balance?.payoutMethod || 'Not set'}</Text>
              </View>
            </View>
          </View>

          {!canRequestPayout && (
            <View style={styles.warningCard}>
              <Ionicons name="alert-circle" size={18} color="#F59E0B" />
              <Text style={styles.warningText}>
                Minimum payout is \${balance?.minimumPayout || 50}. Keep earning!
              </Text>
            </View>
          )}

          ${showPayoutHistory ? `{payoutHistory && payoutHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Recent Payouts</Text>
              {payoutHistory.slice(0, 5).map((payout: any) => (
                <View key={payout.id} style={styles.historyItem}>
                  <View style={[
                    styles.historyIcon,
                    payout.status === 'completed' ? styles.historyIconSuccess : styles.historyIconPending
                  ]}>
                    <Ionicons
                      name={payout.status === 'completed' ? 'checkmark-circle' : 'time'}
                      size={16}
                      color={payout.status === 'completed' ? '#10B981' : '#F59E0B'}
                    />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyAmount}>\${(payout.amount || 0).toFixed(2)}</Text>
                    <Text style={styles.historyDate}>{formatDate(payout.created_at)}</Text>
                  </View>
                  <View style={[
                    styles.historyBadge,
                    payout.status === 'completed' ? styles.badgeSuccess : styles.badgePending
                  ]}>
                    <Text style={[
                      styles.historyBadgeText,
                      payout.status === 'completed' ? styles.badgeTextSuccess : styles.badgeTextPending
                    ]}>
                      {payout.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}` : ''}
        </View>
      </View>

      {/* Payout Modal */}
      <Modal
        visible={showPayoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Payout</Text>
            <Text style={styles.modalText}>
              You are about to request a payout of <Text style={styles.modalAmount}>\${(balance?.available || 0).toFixed(2)}</Text> to your {balance?.payoutMethod || 'default'} account.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPayoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => requestPayoutMutation.mutate()}
                disabled={requestPayoutMutation.isPending}
              >
                {requestPayoutMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm Payout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  payoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payoutButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  payoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#BFDBFE',
    marginVertical: 12,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  historySection: {
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconSuccess: {
    backgroundColor: '#D1FAE5',
  },
  historyIconPending: {
    backgroundColor: '#FEF3C7',
  },
  historyInfo: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeTextSuccess: {
    color: '#065F46',
  },
  badgeTextPending: {
    color: '#92400E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalAmount: {
    fontWeight: '600',
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export interface CommissionSummaryOptions {
  componentName?: string;
  endpoint?: string;
  showBreakdown?: boolean;
  showTiers?: boolean;
}

export function generateCommissionSummary(options: CommissionSummaryOptions = {}): string {
  const {
    componentName = 'CommissionSummary',
    endpoint = '/affiliates/commissions',
    showBreakdown = true,
    showTiers = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  affiliateId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ affiliateId }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['commission-summary', affiliateId, period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/summary?affiliate_id=\${affiliateId || ''}&period=\${period}\`);
      return response?.data || response || {
        totalCommissions: 2450.00,
        commissionRate: 15,
        totalSales: 16333.33,
        totalOrders: 48,
        avgOrderValue: 340.28,
        breakdown: [
          { product: 'Pro Plan', sales: 8500, commission: 1275, orders: 25 },
          { product: 'Team Plan', sales: 5200, commission: 780, orders: 13 },
          { product: 'Enterprise', sales: 2633.33, commission: 395, orders: 10 },
        ],
        tiers: [
          { name: 'Bronze', min: 0, max: 1000, rate: 10, current: false },
          { name: 'Silver', min: 1001, max: 5000, rate: 12.5, current: true },
          { name: 'Gold', min: 5001, max: 10000, rate: 15, current: false },
          { name: 'Platinum', min: 10001, max: null, rate: 20, current: false },
        ],
      };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const periods = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#8B5CF6"
          colors={['#8B5CF6']}
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="analytics" size={20} color="#8B5CF6" />
            <Text style={styles.headerTitle}>Commission Summary</Text>
          </View>
          <View style={styles.periodSelector}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.periodTab, period === p.value && styles.periodTabActive]}
                onPress={() => setPeriod(p.value as any)}
              >
                <Text style={[
                  styles.periodTabText,
                  period === p.value && styles.periodTabTextActive
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Summary Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <View style={styles.statRow}>
                <Ionicons name="cash" size={18} color="#8B5CF6" />
                <Text style={styles.statLabel}>Total Commission</Text>
              </View>
              <Text style={styles.statValueLarge}>
                \${(summary?.totalCommissions || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Ionicons name="stats-chart" size={18} color="#3B82F6" />
                <Text style={styles.statLabel}>Commission Rate</Text>
              </View>
              <Text style={styles.statValue}>{summary?.commissionRate || 0}%</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
                <Text style={styles.statLabel}>Total Sales</Text>
              </View>
              <Text style={styles.statValue}>
                \${(summary?.totalSales || 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Ionicons name="bag" size={18} color="#F59E0B" />
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <Text style={styles.statValue}>{summary?.totalOrders || 0}</Text>
            </View>
          </View>

          ${showBreakdown ? `{/* Breakdown by Product */}
          {summary?.breakdown && summary.breakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breakdown by Product</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Product</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>Sales</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>Commission</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>Orders</Text>
                </View>
                {summary.breakdown.map((item: any, index: number) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2, color: '#111827', fontWeight: '500' }]}>
                      {item.product}
                    </Text>
                    <Text style={styles.tableCell}>\${(item.sales || 0).toLocaleString()}</Text>
                    <Text style={[styles.tableCell, { color: '#10B981', fontWeight: '600' }]}>
                      \${(item.commission || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.tableCell}>{item.orders || 0}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}` : ''}

          ${showTiers ? `{/* Commission Tiers */}
          {summary?.tiers && summary.tiers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Commission Tiers</Text>
              {summary.tiers.map((tier: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.tierItem,
                    tier.current && styles.tierItemCurrent
                  ]}
                >
                  <View style={styles.tierInfo}>
                    {tier.current && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.tierName,
                      tier.current && styles.tierNameCurrent
                    ]}>
                      {tier.name}
                    </Text>
                    <Text style={styles.tierRange}>
                      \${tier.min.toLocaleString()}{tier.max ? \` - \$\${tier.max.toLocaleString()}\` : '+'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.tierRate,
                    tier.current && styles.tierRateCurrent
                  ]}>
                    {tier.rate}%
                  </Text>
                </View>
              ))}
            </View>
          )}` : ''}
        </View>
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
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
  },
  periodTabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  periodTabTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  statCardPrimary: {
    width: '100%',
    marginBottom: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statValueLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontWeight: '500',
    color: '#6B7280',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
  },
  tierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
  },
  tierItemCurrent: {
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  currentBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tierName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  tierNameCurrent: {
    color: '#6B21A8',
  },
  tierRange: {
    fontSize: 12,
    color: '#6B7280',
  },
  tierRate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  tierRateCurrent: {
    color: '#8B5CF6',
  },
});

export default ${componentName};
`;
}
