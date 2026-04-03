/**
 * Kanban Board Component Generator (React Native)
 *
 * Generates kanban board and pipeline overview components for CRM.
 * Features: Horizontal ScrollView with columns, tap-to-move cards, pipeline stats.
 */

export interface KanbanBoardOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  stages?: Array<{ id: string; name: string; color?: string }>;
}

export function generateKanbanBoard(options: KanbanBoardOptions = {}): string {
  const {
    componentName = 'KanbanBoard',
    entity = 'deal',
    endpoint,
    stages = [
      { id: 'lead', name: 'Lead', color: 'gray' },
      { id: 'qualified', name: 'Qualified', color: 'blue' },
      { id: 'proposal', name: 'Proposal', color: 'yellow' },
      { id: 'negotiation', name: 'Negotiation', color: 'orange' },
      { id: 'closed', name: 'Closed Won', color: 'green' },
    ],
  } = options;

  const pluralEntity = entity.endsWith('s') ? entity : entity + 's';
  const finalEndpoint = endpoint || `/${pluralEntity}`;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH * 0.75;

interface ${componentName}Props {
  onCardPress?: (item: any) => void;
  onAddItem?: (stageId: string) => void;
}

const stages = ${JSON.stringify(stages, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({ onCardPress, onAddItem }) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['${pluralEntity}'],
    queryFn: async () => {
      const response = await api.get<any>('${finalEndpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.put('${finalEndpoint}/' + id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${pluralEntity}'] });
      setMoveModalVisible(false);
      setSelectedCard(null);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStageColor = (color: string): { bg: string; border: string; text: string } => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      gray: { bg: '#F3F4F6', border: '#9CA3AF', text: '#4B5563' },
      blue: { bg: '#DBEAFE', border: '#3B82F6', text: '#1D4ED8' },
      yellow: { bg: '#FEF9C3', border: '#F59E0B', text: '#B45309' },
      orange: { bg: '#FFEDD5', border: '#F97316', text: '#C2410C' },
      green: { bg: '#DCFCE7', border: '#22C55E', text: '#15803D' },
      red: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' },
      purple: { bg: '#F3E8FF', border: '#A855F7', text: '#7C3AED' },
    };
    return colors[color] || colors.gray;
  };

  const getItemsByStage = (stageId: string) =>
    items?.filter((item: any) => item.stage === stageId || item.status === stageId) || [];

  const handleCardPress = (item: any) => {
    if (onCardPress) {
      onCardPress(item);
    }
  };

  const handleCardLongPress = (item: any) => {
    setSelectedCard(item);
    setMoveModalVisible(true);
  };

  const handleMoveToStage = (stageId: string) => {
    if (selectedCard) {
      updateStageMutation.mutate({ id: selectedCard.id, stage: stageId });
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toLocaleString();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {stages.map((stage) => {
          const stageItems = getItemsByStage(stage.id);
          const stageValue = stageItems.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
          const stageColors = getStageColor(stage.color || 'gray');

          return (
            <View key={stage.id} style={styles.column}>
              <View style={[styles.columnHeader, { backgroundColor: stageColors.bg, borderTopColor: stageColors.border }]}>
                <View style={styles.columnHeaderContent}>
                  <Text style={[styles.columnTitle, { color: stageColors.text }]}>{stage.name}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{stageItems.length}</Text>
                  </View>
                </View>
                {stageValue > 0 && (
                  <View style={styles.valueContainer}>
                    <Ionicons name="cash-outline" size={14} color="#6B7280" />
                    <Text style={styles.valueText}>{formatCurrency(stageValue)}</Text>
                  </View>
                )}
              </View>

              <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
                {stageItems.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() => handleCardPress(item)}
                    onLongPress={() => handleCardLongPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.name || item.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => handleCardLongPress(item)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                    {item.company_name && (
                      <Text style={styles.cardCompany} numberOfLines={1}>
                        {item.company_name}
                      </Text>
                    )}
                    {item.value !== undefined && item.value > 0 && (
                      <Text style={styles.cardValue}>
                        {'$'}{item.value.toLocaleString()}
                      </Text>
                    )}
                    {item.contact_name && (
                      <View style={styles.cardMeta}>
                        <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.cardMetaText}>{item.contact_name}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => onAddItem?.(stage.id)}
                >
                  <Ionicons name="add" size={18} color="#6B7280" />
                  <Text style={styles.addButtonText}>Add ${entity}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={moveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMoveModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move to Stage</Text>
            {stages.map((stage) => {
              const stageColors = getStageColor(stage.color || 'gray');
              const isCurrentStage = selectedCard?.stage === stage.id || selectedCard?.status === stage.id;

              return (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.modalOption,
                    isCurrentStage && styles.modalOptionCurrent,
                  ]}
                  onPress={() => handleMoveToStage(stage.id)}
                  disabled={isCurrentStage || updateStageMutation.isPending}
                >
                  <View style={[styles.stageDot, { backgroundColor: stageColors.border }]} />
                  <Text style={[
                    styles.modalOptionText,
                    isCurrentStage && styles.modalOptionTextCurrent,
                  ]}>
                    {stage.name}
                  </Text>
                  {isCurrentStage && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setMoveModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  columnsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  column: {
    width: COLUMN_WIDTH,
    marginHorizontal: 6,
    maxHeight: '100%',
  },
  columnHeader: {
    borderTopWidth: 4,
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  valueText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  cardsContainer: {
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 8,
    maxHeight: 500,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  cardCompany: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginTop: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionCurrent: {
    backgroundColor: '#EFF6FF',
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  modalOptionTextCurrent: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export interface PipelineOverviewOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePipelineOverview(options: PipelineOverviewOptions = {}): string {
  const { componentName = 'PipelineOverview', endpoint = '/deals' } = options;

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

interface ${componentName}Props {
  onStatPress?: (stat: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onStatPress }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: deals, isLoading, refetch } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
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
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  const totalValue = deals?.reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0;
  const wonValue = deals?.filter((d: any) => d.stage === 'closed' || d.status === 'won')
    .reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0;
  const activeDeals = deals?.filter((d: any) =>
    d.stage !== 'closed' && d.status !== 'won' && d.status !== 'lost'
  ).length || 0;
  const winRate = deals && deals.length > 0
    ? Math.round((deals.filter((d: any) => d.stage === 'closed' || d.status === 'won').length / deals.length) * 100)
    : 0;

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toLocaleString();
  };

  const stats = [
    {
      key: 'pipeline',
      label: 'Pipeline Value',
      value: formatCurrency(totalValue),
      icon: 'wallet-outline' as const,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      key: 'won',
      label: 'Won Revenue',
      value: formatCurrency(wonValue),
      icon: 'trending-up-outline' as const,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      key: 'active',
      label: 'Active Deals',
      value: activeDeals.toString(),
      icon: 'briefcase-outline' as const,
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
    {
      key: 'winRate',
      label: 'Win Rate',
      value: winRate + '%',
      icon: 'trophy-outline' as const,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.key} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.stageBreakdown}>
        <Text style={styles.sectionTitle}>Stage Breakdown</Text>
        {['lead', 'qualified', 'proposal', 'negotiation', 'closed'].map((stage) => {
          const stageDeals = deals?.filter((d: any) => d.stage === stage || d.status === stage) || [];
          const stageValue = stageDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
          const percentage = totalValue > 0 ? (stageValue / totalValue) * 100 : 0;

          const stageColors: Record<string, string> = {
            lead: '#9CA3AF',
            qualified: '#3B82F6',
            proposal: '#F59E0B',
            negotiation: '#F97316',
            closed: '#10B981',
          };

          return (
            <View key={stage} style={styles.stageRow}>
              <View style={styles.stageInfo}>
                <View style={[styles.stageDot, { backgroundColor: stageColors[stage] || '#6B7280' }]} />
                <Text style={styles.stageName}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </Text>
                <Text style={styles.stageCount}>({stageDeals.length})</Text>
              </View>
              <View style={styles.stageBarContainer}>
                <View
                  style={[
                    styles.stageBar,
                    { width: percentage + '%', backgroundColor: stageColors[stage] || '#6B7280' },
                  ]}
                />
              </View>
              <Text style={styles.stageValue}>{formatCurrency(stageValue)}</Text>
            </View>
          );
        })}
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
    padding: 32,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stageBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stageName: {
    fontSize: 13,
    color: '#374151',
  },
  stageCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  stageBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  stageBar: {
    height: '100%',
    borderRadius: 4,
  },
  stageValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    width: 70,
    textAlign: 'right',
  },
});

export default ${componentName};
`;
}
