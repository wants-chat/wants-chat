/**
 * Company Card Component Generators for React Native
 *
 * Provides generators for React Native company components:
 * - Company Card displaying company information
 * - Company Grid with FlatList showing multiple companies
 */

export interface CompanyCardOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a company card component for React Native
 */
export function generateCompanyCard(options: CompanyCardOptions = {}): string {
  const componentName = options.componentName || 'CompanyCard';

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

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  location?: string;
  industry?: string;
  size?: string;
  rating?: number;
  open_jobs?: number;
}

interface ${componentName}Props {
  company: Company;
  onPress?: () => void;
  style?: any;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 >= 0.5;

  return (
    <View style={styles.ratingContainer}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <Ionicons key={i} name="star" size={12} color="#FBBF24" />;
        }
        if (i === fullStars && hasHalf) {
          return <Ionicons key={i} name="star-half" size={12} color="#FBBF24" />;
        }
        return <Ionicons key={i} name="star-outline" size={12} color="#D1D5DB" />;
      })}
      <Text style={styles.ratingText}>{rating?.toFixed(1)}</Text>
    </View>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({ company, onPress, style }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('CompanyDetail' as never, { id: company.id } as never);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {company.logo_url ? (
          <Image
            source={{ uri: company.logo_url }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Ionicons name="business-outline" size={28} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.titleSection}>
          <Text style={styles.companyName} numberOfLines={1}>
            {company.name}
          </Text>
          {company.industry && (
            <Text style={styles.industry}>{company.industry}</Text>
          )}
        </View>
      </View>

      <View style={styles.metaList}>
        {company.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{company.location}</Text>
          </View>
        )}
        {company.size && (
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{company.size} employees</Text>
          </View>
        )}
        {company.rating && <StarRating rating={company.rating} />}
      </View>

      {company.open_jobs !== undefined && company.open_jobs > 0 && (
        <View style={styles.jobsRow}>
          <Ionicons name="briefcase-outline" size={16} color="#3B82F6" />
          <Text style={styles.jobsText}>{company.open_jobs} open positions</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  industry: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  metaList: {
    gap: 6,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  jobsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a company grid component for React Native
 */
export function generateCompanyGrid(options: CompanyCardOptions = {}): string {
  const { componentName = 'CompanyGrid', endpoint = '/companies' } = options;

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
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * 3) / 2;

interface ${componentName}Props {
  industry?: string;
  onCompanyPress?: (company: any) => void;
  style?: any;
}

interface CompanyCardProps {
  company: any;
  onPress: () => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 >= 0.5;

  return (
    <View style={styles.ratingContainer}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <Ionicons key={i} name="star" size={10} color="#FBBF24" />;
        }
        if (i === fullStars && hasHalf) {
          return <Ionicons key={i} name="star-half" size={10} color="#FBBF24" />;
        }
        return <Ionicons key={i} name="star-outline" size={10} color="#D1D5DB" />;
      })}
      <Text style={styles.ratingText}>{rating?.toFixed(1)}</Text>
    </View>
  );
};

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        {company.logo_url ? (
          <Image
            source={{ uri: company.logo_url }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Ionicons name="business-outline" size={24} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.titleSection}>
          <Text style={styles.companyName} numberOfLines={1}>
            {company.name}
          </Text>
          {company.industry && (
            <Text style={styles.industry} numberOfLines={1}>
              {company.industry}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.metaList}>
        {company.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText} numberOfLines={1}>
              {company.location}
            </Text>
          </View>
        )}
        {company.size && (
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{company.size}</Text>
          </View>
        )}
        {company.rating && <StarRating rating={company.rating} />}
      </View>

      {company.open_jobs !== undefined && company.open_jobs > 0 && (
        <View style={styles.jobsRow}>
          <Ionicons name="briefcase-outline" size={14} color="#3B82F6" />
          <Text style={styles.jobsText}>{company.open_jobs} jobs</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  industry,
  onCompanyPress,
  style,
}) => {
  const navigation = useNavigation();

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies', industry],
    queryFn: async () => {
      const url = industry
        ? \`${endpoint}?industry=\${encodeURIComponent(industry)}\`
        : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleCompanyPress = useCallback((company: any) => {
    if (onCompanyPress) {
      onCompanyPress(company);
    } else {
      navigation.navigate('CompanyDetail' as never, { id: company.id } as never);
    }
  }, [onCompanyPress, navigation]);

  const renderCompany = useCallback(({ item }: { item: any }) => (
    <CompanyCard
      company={item}
      onPress={() => handleCompanyPress(item)}
    />
  ), [handleCompanyPress]);

  const keyExtractor = useCallback((item: any) => item.id?.toString(), []);

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
        <Text style={styles.errorText}>Failed to load companies.</Text>
      </View>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="business-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No companies found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={companies}
      renderItem={renderCompany}
      keyExtractor={keyExtractor}
      numColumns={2}
      contentContainerStyle={[styles.listContent, style]}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  listContent: {
    padding: CARD_MARGIN,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    margin: CARD_MARGIN / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  industry: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  metaList: {
    gap: 4,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  jobsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
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
});

export default ${componentName};
`;
}
