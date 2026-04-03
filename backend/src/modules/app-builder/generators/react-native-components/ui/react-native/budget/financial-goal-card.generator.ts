import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNFinancialGoalCard = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'grid' | 'standard' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    if (fieldName.match(/items|goals|list|array|data/i)) {
      return `propData?.${fieldName} || []`;
    }
    if (fieldName.match(/category|metadata|config|settings/i)) {
      return `propData?.${fieldName} || {}`;
    }
    return `propData?.${fieldName} || ''`;
  };

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();
  const entityName = dataSource || 'items';

  const variants = {
    compact: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FinancialGoal {
  id: number | string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  icon: string;
  color: string;
  targetDate: string;
}

interface CompactFinancialGoalCardProps {
  ${dataName}?: any;
  onGoalPress?: (goal: FinancialGoal) => void;
  [key: string]: any; // Allow additional props from parent
}

export default function CompactFinancialGoalCard({
  ${dataName}: propData,
  onGoalPress
}: CompactFinancialGoalCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawGoals: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const goalsList = rawGoals.map((rawGoal: any) => {
    const current = rawGoal.current_amount || rawGoal.currentAmount || 0;
    const target = rawGoal.target_amount || rawGoal.targetAmount || 1;
    const percentage = (current / target) * 100;

    return {
      ...rawGoal,
      id: rawGoal.id || rawGoal._id,
      name: rawGoal.name || rawGoal.title || 'Untitled Goal',
      targetAmount: target,
      currentAmount: current,
      percentage: Math.min(percentage, 100),
      currency: rawGoal.currency || '$',
      icon: rawGoal.icon || 'trophy-outline',
      color: rawGoal.color || '#8b5cf6',
      targetDate: rawGoal.target_date ? new Date(rawGoal.target_date).toLocaleDateString() : '',
    };
  });

  const renderGoal = ({ item }: { item: FinancialGoal }) => {
    const remaining = item.targetAmount - item.currentAmount;

    return (
      <TouchableOpacity
        style={styles.goalCard}
        onPress={() => onGoalPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.goalHeader}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalName} numberOfLines={1}>{item.name}</Text>
            {item.targetDate && (
              <Text style={styles.targetDate}>Target: {item.targetDate}</Text>
            )}
          </View>
          <Text style={[styles.percentage, { color: item.color }]}>
            {item.percentage.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progress, { width: \`\${item.percentage}%\`, backgroundColor: item.color }]}
          />
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.current}>{item.currency}{item.currentAmount.toFixed(2)}</Text>
          <Text style={styles.target}>of {item.currency}{item.targetAmount.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={goalsList}
      renderItem={renderGoal}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  targetDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  current: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  target: {
    fontSize: 13,
    color: '#6b7280',
  },
});
    `,

    detailed: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DetailedFinancialGoal {
  id: number | string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  icon: string;
  color: string;
  targetDate: string;
  startDate: string;
  monthlyContribution: number;
  status: string;
}

interface DetailedFinancialGoalCardProps {
  ${dataName}?: any;
  onGoalPress?: (goal: DetailedFinancialGoal) => void;
  onContribute?: (goalId: number | string) => void;
  onEdit?: (goalId: number | string) => void;
  [key: string]: any;
}

export default function DetailedFinancialGoalCard({
  ${dataName}: propData,
  onGoalPress,
  onContribute,
  onEdit
}: DetailedFinancialGoalCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawGoals: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const goalsList = rawGoals.map((rawGoal: any) => {
    const current = rawGoal.current_amount || rawGoal.currentAmount || 0;
    const target = rawGoal.target_amount || rawGoal.targetAmount || 1;
    const percentage = (current / target) * 100;

    return {
      ...rawGoal,
      id: rawGoal.id || rawGoal._id,
      name: rawGoal.name || rawGoal.title || 'Untitled Goal',
      description: rawGoal.description || '',
      targetAmount: target,
      currentAmount: current,
      percentage: Math.min(percentage, 100),
      currency: rawGoal.currency || '$',
      icon: rawGoal.icon || 'trophy-outline',
      color: rawGoal.color || '#8b5cf6',
      targetDate: rawGoal.target_date ? new Date(rawGoal.target_date).toLocaleDateString() : '',
      startDate: rawGoal.start_date ? new Date(rawGoal.start_date).toLocaleDateString() : '',
      monthlyContribution: rawGoal.monthly_contribution || 0,
      status: rawGoal.status || 'active',
    };
  });

  const getDaysRemaining = (targetDate: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    const statuses: any = {
      active: { label: 'Active', color: '#3b82f6', icon: 'checkmark-circle' },
      completed: { label: 'Completed', color: '#10b981', icon: 'checkmark-circle' },
      paused: { label: 'Paused', color: '#f59e0b', icon: 'pause-circle' },
      cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle' },
    };
    return statuses[status] || statuses.active;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {goalsList.map((goal) => {
        const remaining = goal.targetAmount - goal.currentAmount;
        const daysRemaining = goal.targetDate ? getDaysRemaining(goal.targetDate) : null;
        const statusBadge = getStatusBadge(goal.status);

        return (
          <TouchableOpacity
            key={goal.id}
            style={styles.goalCard}
            onPress={() => onGoalPress?.(goal)}
            activeOpacity={0.95}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
                <Ionicons name={goal.icon as any} size={28} color={goal.color} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.goalName}>{goal.name}</Text>
                {goal.description && (
                  <Text style={styles.description} numberOfLines={2}>{goal.description}</Text>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '20' }]}>
                <Ionicons name={statusBadge.icon as any} size={14} color={statusBadge.color} />
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Current</Text>
                <Text style={[styles.amountValue, { color: goal.color }]}>
                  {goal.currency}{goal.currentAmount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Target</Text>
                <Text style={styles.amountValue}>
                  {goal.currency}{goal.targetAmount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Remaining</Text>
                <Text style={[styles.amountValue, { color: remaining > 0 ? '#ef4444' : '#10b981' }]}>
                  {goal.currency}{remaining.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={[styles.progressPercentage, { color: goal.color }]}>
                  {goal.percentage.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progress, { width: \`\${goal.percentage}%\`, backgroundColor: goal.color }]}
                />
              </View>
            </View>

            <View style={styles.detailsSection}>
              {goal.targetDate && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailLabel}>Target Date:</Text>
                  <Text style={styles.detailValue}>{goal.targetDate}</Text>
                  {daysRemaining !== null && (
                    <Text style={[styles.daysRemaining, { color: daysRemaining < 30 ? '#ef4444' : '#6b7280' }]}>
                      ({daysRemaining} days left)
                    </Text>
                  )}
                </View>
              )}
              {goal.monthlyContribution > 0 && (
                <View style={styles.detailRow}>
                  <Ionicons name="repeat-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailLabel}>Monthly:</Text>
                  <Text style={styles.detailValue}>
                    {goal.currency}{goal.monthlyContribution.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              {onContribute && goal.status === 'active' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.contributeButton, { backgroundColor: goal.color }]}
                  onPress={() => onContribute(goal.id)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.contributeText}>Contribute</Text>
                </TouchableOpacity>
              )}
              {onEdit && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(goal.id)}
                >
                  <Ionicons name="create-outline" size={18} color="#3b82f6" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  progressBarSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 6,
  },
  detailsSection: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
  daysRemaining: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  contributeButton: {
    flex: 1,
    justifyContent: 'center',
  },
  contributeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
    `,

    grid: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GridFinancialGoal {
  id: number | string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  icon: string;
  color: string;
}

interface GridFinancialGoalCardProps {
  ${dataName}?: any;
  onGoalPress?: (goal: GridFinancialGoal) => void;
  [key: string]: any;
}

export default function GridFinancialGoalCard({
  ${dataName}: propData,
  onGoalPress
}: GridFinancialGoalCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawGoals: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const goalsList = rawGoals.map((rawGoal: any) => {
    const current = rawGoal.current_amount || rawGoal.currentAmount || 0;
    const target = rawGoal.target_amount || rawGoal.targetAmount || 1;
    const percentage = (current / target) * 100;

    return {
      ...rawGoal,
      id: rawGoal.id || rawGoal._id,
      name: rawGoal.name || rawGoal.title || 'Untitled Goal',
      targetAmount: target,
      currentAmount: current,
      percentage: Math.min(percentage, 100),
      currency: rawGoal.currency || '$',
      icon: rawGoal.icon || 'trophy-outline',
      color: rawGoal.color || '#8b5cf6',
    };
  });

  const renderGoal = ({ item }: { item: GridFinancialGoal }) => {
    const remaining = item.targetAmount - item.currentAmount;

    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => onGoalPress?.(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={32} color={item.color} />
        </View>

        <Text style={styles.goalName} numberOfLines={1}>{item.name}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: \`\${item.percentage}%\`, backgroundColor: item.color }]} />
          </View>
          <Text style={[styles.percentage, { color: item.color }]}>
            {item.percentage.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.current}>{item.currency}{item.currentAmount.toFixed(0)}</Text>
          <Text style={styles.target}>of {item.currency}{item.targetAmount.toFixed(0)}</Text>
        </View>

        <Text style={styles.remaining}>
          {remaining > 0 ? item.currency + remaining.toFixed(0) + ' to go' : 'Achieved!'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={goalsList}
      renderItem={renderGoal}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    maxWidth: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  amountSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  current: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  target: {
    fontSize: 12,
    color: '#6b7280',
  },
  remaining: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
    textAlign: 'center',
  },
});
    `,

    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FinancialGoal {
  id: number | string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  icon: string;
  color: string;
  targetDate: string;
}

interface StandardFinancialGoalCardProps {
  ${dataName}?: any;
  onGoalPress?: (goal: FinancialGoal) => void;
  onAddGoal?: () => void;
  [key: string]: any;
}

export default function StandardFinancialGoalCard({
  ${dataName}: propData,
  onGoalPress,
  onAddGoal
}: StandardFinancialGoalCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawGoals: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const goalsList = rawGoals.map((rawGoal: any) => {
    const current = rawGoal.current_amount || rawGoal.currentAmount || 0;
    const target = rawGoal.target_amount || rawGoal.targetAmount || 1;
    const percentage = (current / target) * 100;

    return {
      ...rawGoal,
      id: rawGoal.id || rawGoal._id,
      name: rawGoal.name || rawGoal.title || 'Untitled Goal',
      targetAmount: target,
      currentAmount: current,
      percentage: Math.min(percentage, 100),
      currency: rawGoal.currency || '$',
      icon: rawGoal.icon || 'trophy-outline',
      color: rawGoal.color || '#8b5cf6',
      targetDate: rawGoal.target_date ? new Date(rawGoal.target_date).toLocaleDateString() : '',
    };
  });

  const totalTarget = goalsList.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = goalsList.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  const renderGoal = ({ item }: { item: FinancialGoal }) => {
    const remaining = item.targetAmount - item.currentAmount;

    return (
      <TouchableOpacity
        style={styles.goalCard}
        onPress={() => onGoalPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalLeft}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName} numberOfLines={1}>{item.name}</Text>
              {item.targetDate && (
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                  <Text style={styles.targetDate}>{item.targetDate}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.goalRight}>
            <Text style={[styles.percentage, { color: item.color }]}>
              {item.percentage.toFixed(0)}%
            </Text>
            <Text style={styles.remaining}>
              {remaining > 0 ? item.currency + remaining.toFixed(0) : 'Done'}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progress, { width: \`\${item.percentage}%\`, backgroundColor: item.color }]}
            />
          </View>
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.current}>{item.currency}{item.currentAmount.toFixed(2)}</Text>
          <Text style={styles.target}>of {item.currency}{item.targetAmount.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Financial Goals</Text>
          <Text style={styles.headerSubtitle}>Track your savings goals</Text>
        </View>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Overall</Text>
          <Text style={styles.totalPercentage}>
            {overallPercentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      <FlatList
        data={goalsList}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {onAddGoal && (
        <TouchableOpacity style={styles.fab} onPress={onAddGoal} activeOpacity={0.9}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8b5cf6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  targetDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  goalRight: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  remaining: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  current: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  target: {
    fontSize: 13,
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
    `
  };

  const code = variants[variant] || variants.standard;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
};
