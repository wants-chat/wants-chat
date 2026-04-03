/**
 * Logistics Stats Component Generator (React Native)
 *
 * Generates comprehensive logistics dashboard statistics for React Native.
 * Features: Stats cards, progress bars, performance metrics, pipeline visualization.
 */

export interface LogisticsStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLogisticsStats(options: LogisticsStatsOptions = {}): string {
  const { componentName = 'LogisticsStats', endpoint = '/logistics/stats' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface LogisticsMetrics {
  shipments: {
    total: number;
    in_transit: number;
    delivered_today: number;
    pending: number;
    exceptions: number;
    on_time_rate: number;
    change: number;
  };
  warehouse: {
    total_orders: number;
    picking_queue: number;
    packing_queue: number;
    ready_to_ship: number;
    receiving_pending: number;
    utilization: number;
  };
  delivery: {
    active_routes: number;
    completed_today: number;
    average_delivery_time: number;
    success_rate: number;
    drivers_active: number;
    vehicles_in_use: number;
  };
  performance: {
    orders_per_hour: number;
    picks_per_hour: number;
    average_cycle_time: number;
    accuracy_rate: number;
  };
}

interface ${componentName}Props {
  warehouseId?: string;
  dateRange?: { start: string; end: string };
  showDetails?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  dateRange,
  showDetails = true,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['logistics-stats', warehouseId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (dateRange?.start) params.append('start_date', dateRange.start);
      if (dateRange?.end) params.append('end_date', dateRange.end);
      const url = params.toString() ? \`${endpoint}?\${params.toString()}\` : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
    refetchInterval: 60000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderProgressBar = (value: number, color: string) => (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: \`\${Math.min(100, value)}%\`, backgroundColor: color }]} />
    </View>
  );

  const getHealthColor = (rate: number) => {
    if (rate >= 95) return '#10B981';
    if (rate >= 85) return '#F59E0B';
    return '#EF4444';
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Overview Cards */}
      <View style={styles.overviewGrid}>
        {/* Active Shipments */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="car" size={18} color="#3B82F6" />
            </View>
            {metrics?.shipments?.change !== 0 && (
              <View style={styles.changeContainer}>
                <Ionicons
                  name={metrics?.shipments?.change >= 0 ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={metrics?.shipments?.change >= 0 ? '#10B981' : '#EF4444'}
                />
                <Text style={[
                  styles.changeText,
                  { color: metrics?.shipments?.change >= 0 ? '#10B981' : '#EF4444' },
                ]}>
                  {Math.abs(metrics?.shipments?.change || 0)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.cardValue}>{metrics?.shipments?.in_transit?.toLocaleString() || 0}</Text>
          <Text style={styles.cardLabel}>In Transit</Text>
        </View>

        {/* Delivered Today */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
          </View>
          <Text style={styles.cardValue}>{metrics?.shipments?.delivered_today?.toLocaleString() || 0}</Text>
          <Text style={styles.cardLabel}>Delivered Today</Text>
        </View>

        {/* Pending Fulfillment */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={18} color="#F59E0B" />
            </View>
          </View>
          <Text style={styles.cardValue}>
            {((metrics?.warehouse?.picking_queue || 0) + (metrics?.warehouse?.packing_queue || 0)).toLocaleString()}
          </Text>
          <Text style={styles.cardLabel}>Pending Fulfillment</Text>
        </View>

        {/* Exceptions */}
        <View style={[
          styles.overviewCard,
          (metrics?.shipments?.exceptions || 0) > 0 && styles.overviewCardAlert,
        ]}>
          <View style={styles.cardHeader}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: (metrics?.shipments?.exceptions || 0) > 0 ? '#FEE2E2' : '#F3F4F6' },
            ]}>
              <Ionicons
                name="warning"
                size={18}
                color={(metrics?.shipments?.exceptions || 0) > 0 ? '#EF4444' : '#9CA3AF'}
              />
            </View>
          </View>
          <Text style={styles.cardValue}>{metrics?.shipments?.exceptions || 0}</Text>
          <Text style={styles.cardLabel}>Exceptions</Text>
        </View>
      </View>

      {showDetails && (
        <>
          {/* Performance Metrics */}
          <View style={styles.metricsRow}>
            {/* Shipment Performance */}
            <View style={[styles.metricsCard, styles.metricsCardHalf]}>
              <View style={styles.metricsHeader}>
                <Ionicons name="car" size={18} color="#3B82F6" />
                <Text style={styles.metricsTitle}>Shipment Performance</Text>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>On-Time Delivery Rate</Text>
                  <Text style={[styles.metricValue, { color: getHealthColor(metrics?.shipments?.on_time_rate || 0) }]}>
                    {metrics?.shipments?.on_time_rate || 0}%
                  </Text>
                </View>
                {renderProgressBar(metrics?.shipments?.on_time_rate || 0, getHealthColor(metrics?.shipments?.on_time_rate || 0))}
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Delivery Success Rate</Text>
                  <Text style={[styles.metricValue, { color: getHealthColor(metrics?.delivery?.success_rate || 0) }]}>
                    {metrics?.delivery?.success_rate || 0}%
                  </Text>
                </View>
                {renderProgressBar(metrics?.delivery?.success_rate || 0, getHealthColor(metrics?.delivery?.success_rate || 0))}
              </View>

              <View style={styles.metricStats}>
                <View style={styles.metricStatItem}>
                  <Text style={styles.metricStatLabel}>Avg. Delivery Time</Text>
                  <Text style={styles.metricStatValue}>{metrics?.delivery?.average_delivery_time || 0} min</Text>
                </View>
                <View style={styles.metricStatItem}>
                  <Text style={styles.metricStatLabel}>Active Routes</Text>
                  <Text style={styles.metricStatValue}>{metrics?.delivery?.active_routes || 0}</Text>
                </View>
              </View>
            </View>

            {/* Warehouse Performance */}
            <View style={[styles.metricsCard, styles.metricsCardHalf]}>
              <View style={styles.metricsHeader}>
                <Ionicons name="cube" size={18} color="#8B5CF6" />
                <Text style={styles.metricsTitle}>Warehouse Performance</Text>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Warehouse Utilization</Text>
                  <Text style={[
                    styles.metricValue,
                    { color: (metrics?.warehouse?.utilization || 0) > 90 ? '#EF4444' : (metrics?.warehouse?.utilization || 0) > 75 ? '#F59E0B' : '#10B981' },
                  ]}>
                    {metrics?.warehouse?.utilization || 0}%
                  </Text>
                </View>
                {renderProgressBar(
                  metrics?.warehouse?.utilization || 0,
                  (metrics?.warehouse?.utilization || 0) > 90 ? '#EF4444' : (metrics?.warehouse?.utilization || 0) > 75 ? '#F59E0B' : '#10B981'
                )}
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Pick Accuracy</Text>
                  <Text style={[styles.metricValue, { color: getHealthColor(metrics?.performance?.accuracy_rate || 0) }]}>
                    {metrics?.performance?.accuracy_rate || 0}%
                  </Text>
                </View>
                {renderProgressBar(metrics?.performance?.accuracy_rate || 0, getHealthColor(metrics?.performance?.accuracy_rate || 0))}
              </View>

              <View style={styles.metricStats}>
                <View style={styles.metricStatItem}>
                  <Text style={styles.metricStatLabel}>Orders/Hour</Text>
                  <Text style={styles.metricStatValue}>{metrics?.performance?.orders_per_hour || 0}</Text>
                </View>
                <View style={styles.metricStatItem}>
                  <Text style={styles.metricStatLabel}>Picks/Hour</Text>
                  <Text style={styles.metricStatValue}>{metrics?.performance?.picks_per_hour || 0}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Fulfillment Pipeline */}
          <View style={styles.pipelineCard}>
            <View style={styles.pipelineHeader}>
              <Ionicons name="analytics" size={18} color="#6366F1" />
              <Text style={styles.pipelineTitle}>Fulfillment Pipeline</Text>
            </View>

            <View style={styles.pipelineStages}>
              {[
                { label: 'Receiving', value: metrics?.warehouse?.receiving_pending || 0, color: '#8B5CF6' },
                { label: 'Picking', value: metrics?.warehouse?.picking_queue || 0, color: '#3B82F6' },
                { label: 'Packing', value: metrics?.warehouse?.packing_queue || 0, color: '#F59E0B' },
                { label: 'Ready to Ship', value: metrics?.warehouse?.ready_to_ship || 0, color: '#10B981' },
              ].map((stage, index, arr) => (
                <View key={stage.label} style={styles.pipelineStage}>
                  <View style={[styles.stageCircle, { backgroundColor: stage.color + '20' }]}>
                    <Text style={[styles.stageValue, { color: stage.color }]}>{stage.value}</Text>
                  </View>
                  <Text style={styles.stageLabel}>{stage.label}</Text>
                  {index < arr.length - 1 && <View style={styles.stageConnector} />}
                </View>
              ))}
            </View>
          </View>

          {/* Resources */}
          <View style={styles.resourcesRow}>
            <View style={styles.resourceCard}>
              <View style={[styles.resourceIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="people" size={20} color="#6366F1" />
              </View>
              <Text style={styles.resourceValue}>{metrics?.delivery?.drivers_active || 0}</Text>
              <Text style={styles.resourceLabel}>Active Drivers</Text>
            </View>

            <View style={styles.resourceCard}>
              <View style={[styles.resourceIcon, { backgroundColor: '#ECFEFF' }]}>
                <Ionicons name="car" size={20} color="#06B6D4" />
              </View>
              <Text style={styles.resourceValue}>{metrics?.delivery?.vehicles_in_use || 0}</Text>
              <Text style={styles.resourceLabel}>Vehicles in Use</Text>
            </View>

            <View style={styles.resourceCard}>
              <View style={[styles.resourceIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="location" size={20} color="#10B981" />
              </View>
              <Text style={styles.resourceValue}>{metrics?.delivery?.completed_today || 0}</Text>
              <Text style={styles.resourceLabel}>Deliveries Today</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingBottom: 8,
  },
  overviewCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overviewCardAlert: {
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricsCardHalf: {
    flex: 1,
    marginRight: 8,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  metricItem: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  metricStatItem: {
    flex: 1,
  },
  metricStatLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  metricStatValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  pipelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pipelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pipelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  pipelineStages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pipelineStage: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stageCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  stageLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  stageConnector: {
    position: 'absolute',
    top: 25,
    right: -10,
    width: 20,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  resourcesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resourceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  resourceLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}
