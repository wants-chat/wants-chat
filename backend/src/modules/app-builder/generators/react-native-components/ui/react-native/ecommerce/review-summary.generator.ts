/**
 * React Native Review Summary Generator
 * Generates a component showing product reviews with ratings
 */

export function generateRNReviewSummary(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
}

interface ReviewSummaryProps {
  averageRating?: number;
  totalReviews?: number;
  reviews?: Review[];
  data?: Review[];
  entity?: string;
  onSeeAllReviews?: () => void;
  [key: string]: any;
}

export default function ReviewSummary({
  averageRating: propAverageRating,
  totalReviews: propTotalReviews,
  reviews,
  data,
  entity = 'reviews',
  onSeeAllReviews
}: ReviewSummaryProps) {
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propData = reviews || data;

  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData;
  const averageRating = propAverageRating ?? (sourceData.length > 0 ? sourceData.reduce((acc: number, r: Review) => acc + r.rating, 0) / sourceData.length : 0);
  const totalReviews = propTotalReviews ?? sourceData.length;
  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={size}
          color="#fbbf24"
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    sourceData.forEach((review: Review) => {
      const rounded = Math.round(review.rating);
      if (rounded >= 1 && rounded <= 5) {
        distribution[rounded as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  const renderRatingBar = (stars: number) => {
    const count = ratingDistribution[stars as keyof typeof ratingDistribution];
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

    return (
      <View key={stars} style={styles.ratingBarContainer}>
        <Text style={styles.ratingBarLabel}>{stars}</Text>
        <Ionicons name="star" size={14} color="#fbbf24" />
        <View style={styles.ratingBarBackground}>
          <View style={[styles.ratingBarFill, { width: \`\${percentage}%\` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => {
    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: item.userAvatar || 'https://via.placeholder.com/40' }}
              style={styles.userAvatar}
            />
            <View>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{item.userName}</Text>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  </View>
                )}
              </View>
              <View style={styles.reviewRating}>{renderStars(item.rating, 12)}</View>
            </View>
          </View>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <Text style={styles.reviewComment} numberOfLines={3}>
          {item.comment}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summarySection}>
        <View style={styles.overallRating}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <View style={styles.overallStars}>{renderStars(averageRating, 20)}</View>
          <Text style={styles.totalReviews}>
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        <View style={styles.ratingDistribution}>
          {[5, 4, 3, 2, 1].map(renderRatingBar)}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>Customer Reviews</Text>
        {onSeeAllReviews && (
          <TouchableOpacity onPress={onSeeAllReviews} activeOpacity={0.7}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sourceData.slice(0, 3)}
        renderItem={renderReview}
        keyExtractor={(item) => item.id || item._id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {sourceData.length > 3 && onSeeAllReviews && (
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={onSeeAllReviews}
          activeOpacity={0.7}
        >
          <Text style={styles.viewMoreText}>
            View All {totalReviews} Reviews
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  summarySection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  overallRating: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
  },
  overallStars: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  ratingDistribution: {
    flex: 1.5,
    justifyContent: 'center',
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 12,
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
  },
  ratingBarCount: {
    fontSize: 12,
    color: '#6b7280',
    width: 30,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginRight: 4,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
});`;

  return { code, imports };
}
