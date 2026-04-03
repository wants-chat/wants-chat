import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNClassDetailView = (resolved: ResolvedComponent): { code: string; imports: string[] } => {
  const entity = resolved.data?.entity || resolved.dataSource || 'classes';

  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getVariantStyles } from '@/lib/design-variants';
import { APP_DESIGN_VARIANT, APP_COLOR_SCHEME } from '@/lib/ui-config';

interface ClassDetailViewProps {
  data?: any;
  backRoute?: string;
  onBookingSuccess?: (data: any) => void;
  [key: string]: any;
}

export default function ClassDetailView({ data: propData, backRoute, onBookingSuccess }: ClassDetailViewProps) {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id } = (route.params as any) || {};
  const { colors, modifiers } = getVariantStyles(APP_DESIGN_VARIANT, APP_COLOR_SCHEME);
  const queryClient = useQueryClient();

  const [data, setData] = useState<any>(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propData && id) {
      fetchData();
    }
  }, [id, propData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<any>(\`/${entity}/\${id}\`);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (backRoute) {
      navigation.navigate(backRoute);
    } else {
      navigation.goBack();
    }
  };

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: { class_id: string | number }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/bookings\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to book class');
      }
      return response.json();
    },
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert('Success', 'Class booked successfully!', [
        { text: 'OK', onPress: () => onBookingSuccess?.(responseData) }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Booking Failed', error?.message || 'Unable to book this class. Please try again.');
    },
  });

  const handleBookClass = () => {
    if (!id && !data?.id) {
      Alert.alert('Error', 'Invalid class information');
      return;
    }
    bookingMutation.mutate({ class_id: id || data?.id });
  };

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return { date: '', time: '', day: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  };

  const getClassIcon = (classType: string | undefined) => {
    const type = (classType || '').toLowerCase();
    if (type.includes('yoga') || type.includes('meditation')) return 'body';
    if (type.includes('hiit') || type.includes('cardio')) return 'flame';
    if (type.includes('strength') || type.includes('weight')) return 'barbell';
    if (type.includes('spin') || type.includes('cycling')) return 'bicycle';
    if (type.includes('boxing')) return 'fitness';
    if (type.includes('dance') || type.includes('zumba')) return 'musical-notes';
    if (type.includes('swim')) return 'water';
    return 'fitness';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading class details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="fitness-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Class not found'}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { date, time, day } = formatDateTime(data.scheduled_at);
  const trainerName = \`\${data.trainer_first_name || ''} \${data.trainer_last_name || ''}\`.trim();
  const spotsLeft = (data.capacity || 20) - (data.enrolled_count || 0);
  const isFull = spotsLeft <= 0;
  const enrollmentPercentage = Math.min(((data.enrolled_count || 0) / (data.capacity || 20)) * 100, 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={getClassIcon(data.class_type) as any} size={32} color="#fff" />
            </View>

            {data.class_type && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{data.class_type}</Text>
              </View>
            )}

            <Text style={styles.className}>{data.name || 'Class'}</Text>

            <View style={styles.quickInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoText}>{day}, {date}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoText}>{time}</Text>
              </View>
              {data.duration_minutes && (
                <View style={styles.infoItem}>
                  <Ionicons name="timer-outline" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.infoText}>{data.duration_minutes} min</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Description */}
          {data.description && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: modifiers.borderRadius }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>About This Class</Text>
              </View>
              <Text style={[styles.description, { color: colors.textSecondary }]}>{data.description}</Text>
            </View>
          )}

          {/* Details Grid */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: modifiers.borderRadius }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="list-outline" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Class Details</Text>
            </View>

            <View style={styles.detailsGrid}>
              {/* Location */}
              {data.location && (
                <View style={[styles.detailItem, { backgroundColor: colors.background }]}>
                  <View style={[styles.detailIcon, { backgroundColor: colors.primary }]}>
                    <Ionicons name="location-outline" size={20} color="#fff" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{data.location}</Text>
                  </View>
                </View>
              )}

              {/* Trainer */}
              {trainerName && (
                <View style={[styles.detailItem, { backgroundColor: colors.background }]}>
                  <View style={[styles.detailIcon, { backgroundColor: '#f97316' }]}>
                    <Ionicons name="person-outline" size={20} color="#fff" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Instructor</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{trainerName}</Text>
                  </View>
                </View>
              )}

              {/* Duration */}
              {data.duration_minutes && (
                <View style={[styles.detailItem, { backgroundColor: colors.background }]}>
                  <View style={[styles.detailIcon, { backgroundColor: '#8b5cf6' }]}>
                    <Ionicons name="timer-outline" size={20} color="#fff" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Duration</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{data.duration_minutes} minutes</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Enrollment Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: modifiers.borderRadius }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Class Enrollment</Text>
            </View>

            <View style={styles.enrollmentInfo}>
              <Text style={[styles.enrollmentText, { color: colors.textSecondary }]}>
                {data.enrolled_count || 0} / {data.capacity || 20} spots filled
              </Text>
            </View>

            <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: \`\${enrollmentPercentage}%\`, backgroundColor: isFull ? '#ef4444' : colors.primary }
                ]}
              />
            </View>

            <View style={[
              styles.spotsBadge,
              { backgroundColor: isFull ? '#fef2f2' : spotsLeft <= 3 ? '#fffbeb' : '#f0fdf4' }
            ]}>
              <Text style={[
                styles.spotsBadgeText,
                { color: isFull ? '#dc2626' : spotsLeft <= 3 ? '#d97706' : '#16a34a' }
              ]}>
                {isFull ? 'Class Full' : \`\${spotsLeft} spots remaining\`}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.bookButton,
                { backgroundColor: isFull || bookingMutation.isPending ? '#d1d5db' : colors.primary }
              ]}
              onPress={handleBookClass}
              disabled={isFull || bookingMutation.isPending}
            >
              {bookingMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.bookButtonText}>
                  {isFull ? 'Class Full' : 'Book This Class'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Cover Image */}
          {data.cover_image && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: modifiers.borderRadius, overflow: 'hidden', padding: 0 }]}>
              <Image source={{ uri: data.cover_image }} style={styles.coverImage} resizeMode="cover" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
  retryButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  header: { paddingTop: 48, paddingBottom: 24, paddingHorizontal: 16 },
  backButton: { marginBottom: 16 },
  headerContent: { alignItems: 'center' },
  iconContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  className: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 12 },
  quickInfo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  content: { padding: 16 },
  card: { padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginLeft: 8 },
  description: { fontSize: 15, lineHeight: 24 },
  detailsGrid: { gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  detailIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  detailContent: { marginLeft: 12, flex: 1 },
  detailLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '600' },
  enrollmentInfo: { marginBottom: 8 },
  enrollmentText: { fontSize: 14 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  spotsBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  spotsBadgeText: { fontSize: 14, fontWeight: '600' },
  bookButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  coverImage: { width: '100%', height: 200 },
});`;

  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
      "import { useMutation, useQueryClient } from '@tanstack/react-query';",
    ],
  };
};
