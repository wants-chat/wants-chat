/**
 * React Native Order Tracking Generator
 * Generates an order tracking component with timeline of statuses
 */

export function generateRNOrderTracking(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface TimelineItem {
  status: string;
  timestamp: string;
  location?: string;
  completed: boolean;
}

interface OrderTrackingProps {
  orderNumber?: string;
  status?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  timeline?: TimelineItem[];
  data?: any;
  entity?: string;
  orderId?: string;
  [key: string]: any;
}

export default function OrderTracking({
  orderNumber: propOrderNumber,
  status: propStatus,
  trackingNumber: propTrackingNumber,
  estimatedDelivery: propEstimatedDelivery,
  timeline: propTimeline,
  data,
  entity = 'orders',
  orderId
}: OrderTrackingProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propData = data || (propOrderNumber ? { orderNumber: propOrderNumber, status: propStatus, trackingNumber: propTrackingNumber, estimatedDelivery: propEstimatedDelivery, timeline: propTimeline } : null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      if (!orderId) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}/\${orderId}\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, orderId, propData]);

  const sourceData = propData || fetchedData || {};
  const orderNumber = sourceData.orderNumber || sourceData.order_number || '';
  const status = sourceData.status || '';
  const trackingNumber = sourceData.trackingNumber || sourceData.tracking_number;
  const estimatedDelivery = sourceData.estimatedDelivery || sourceData.estimated_delivery;
  const timeline = sourceData.timeline || [];

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
  const getStatusColor = (completed: boolean) => {
    return completed ? '#10B981' : '#E5E7EB';
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    const iconName = completed ? 'checkmark-circle' : 'ellipse-outline';
    return iconName;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Tracking</Text>
        <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
      </View>

      {trackingNumber && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tracking Number</Text>
            <Text style={styles.infoValue}>{trackingNumber}</Text>
          </View>
          {estimatedDelivery && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Delivery</Text>
              <Text style={styles.infoValue}>{formatDate(estimatedDelivery)}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.statusCard}>
        <Text style={styles.currentStatusLabel}>Current Status</Text>
        <Text style={styles.currentStatus}>{status}</Text>
      </View>

      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>Tracking Timeline</Text>

        {timeline.map((item: any, index: number) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineIconContainer}>
              <View
                style={[
                  styles.timelineIcon,
                  { backgroundColor: getStatusColor(item.completed) }
                ]}
              >
                <Ionicons
                  name={getStatusIcon(item.status, item.completed)}
                  size={24}
                  color={item.completed ? '#fff' : '#9CA3AF'}
                />
              </View>
              {index < timeline.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: item.completed ? '#10B981' : '#E5E7EB' }
                  ]}
                />
              )}
            </View>

            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineStatus,
                  { color: item.completed ? '#111827' : '#6B7280' }
                ]}
              >
                {item.status}
              </Text>
              <Text style={styles.timelineTimestamp}>
                {formatDate(item.timestamp)}
              </Text>
              {item.location && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.timelineLocation}>{item.location}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusCard: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  currentStatusLabel: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
  },
  currentStatus: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
  },
  timelineContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timelineLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
});`;

  return { code, imports };
}
