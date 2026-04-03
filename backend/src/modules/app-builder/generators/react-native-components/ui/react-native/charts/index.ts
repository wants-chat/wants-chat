// Charts Component Generators for React Native

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// KPI and Analytics Cards
export { generateRNKpiCard } from './kpi-card.generator';
export { generateAnalyticsOverviewCards as generateRNAnalyticsOverviewCards } from './analytics-overview-cards.generator';
export { generateRNBarChart } from './bar-chart.generator';

// Data Visualization Charts
export { generateRNDataVizBarChart } from './data-viz-bar-chart.generator';
export { generateRNDataVizLineChart } from './data-viz-line-chart.generator';
export { generateRNDataVizPieChart } from './data-viz-pie-chart.generator';
export { generateRNDataVizAreaChart } from './data-viz-area-chart.generator';

// ============================================================================
// ADDITIONAL CHART & ANALYTICS COMPONENTS
// ============================================================================

// Chart Widget
export function generateRNChartWidget(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChartWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  chartType?: 'line' | 'bar' | 'area';
  data?: number[];
  color?: string;
}

export default function ChartWidget({ title, value, change, chartType = 'line', data = [], color = '#3b82f6' }: ChartWidgetProps) {
  const maxValue = Math.max(...data, 1);
  const chartHeight = 60;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {change !== undefined && (
          <View style={[styles.changeBadge, { backgroundColor: change >= 0 ? '#dcfce7' : '#fee2e2' }]}>
            <Ionicons name={change >= 0 ? 'trending-up' : 'trending-down'} size={14} color={change >= 0 ? '#16a34a' : '#dc2626'} />
            <Text style={[styles.changeText, { color: change >= 0 ? '#16a34a' : '#dc2626' }]}>{Math.abs(change)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.chart}>
        {data.map((point, idx) => (
          <View key={idx} style={[styles.bar, { height: (point / maxValue) * chartHeight, backgroundColor: color + (chartType === 'area' ? '40' : '') }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 14, color: '#6b7280' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  changeText: { fontSize: 12, fontWeight: '600' },
  value: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 60 },
  bar: { flex: 1, borderRadius: 2, minHeight: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, Dimensions } from 'react-native';"],
  };
}

// Comparison Chart
export function generateRNComparisonChart(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface ComparisonChartProps {
  title?: string;
  data: { label: string; valueA: number; valueB: number }[];
  legendA?: string;
  legendB?: string;
  colorA?: string;
  colorB?: string;
}

export default function ComparisonChart({ title, data, legendA = 'Current', legendB = 'Previous', colorA = '#3b82f6', colorB = '#94a3b8' }: ComparisonChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.valueA, d.valueB]), 1);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colorA }]} /><Text style={styles.legendText}>{legendA}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colorB }]} /><Text style={styles.legendText}>{legendB}</Text></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chart}>
          {data.map((item, idx) => (
            <View key={idx} style={styles.barGroup}>
              <View style={styles.bars}>
                <View style={[styles.bar, { height: (item.valueA / maxValue) * 100, backgroundColor: colorA }]} />
                <View style={[styles.bar, { height: (item.valueB / maxValue) * 100, backgroundColor: colorB }]} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#6b7280' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, height: 120, paddingBottom: 24 },
  barGroup: { alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bar: { width: 16, borderRadius: 4, minHeight: 4 },
  label: { fontSize: 11, color: '#6b7280', marginTop: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Analytics Card
export function generateRNAnalyticsCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  trend?: { value: number; label?: string };
  onPress?: () => void;
}

export default function AnalyticsCard({ title, value, subtitle, icon = 'analytics-outline', iconColor = '#3b82f6', trend, onPress }: AnalyticsCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend.value >= 0 ? '#dcfce7' : '#fee2e2' }]}>
            <Ionicons name={trend.value >= 0 ? 'arrow-up' : 'arrow-down'} size={12} color={trend.value >= 0 ? '#16a34a' : '#dc2626'} />
            <Text style={[styles.trendText, { color: trend.value >= 0 ? '#16a34a' : '#dc2626' }]}>{Math.abs(trend.value)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trend?.label && <Text style={styles.trendLabel}>{trend.label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flex: 1, minWidth: 150 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 2 },
  trendText: { fontSize: 11, fontWeight: '600' },
  title: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  value: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  trendLabel: { fontSize: 11, color: '#6b7280', marginTop: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';"],
  };
}

// Stats Widget
export function generateRNStatsWidget(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Stat {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

interface StatsWidgetProps {
  title?: string;
  stats: Stat[];
  columns?: 2 | 3 | 4;
}

export default function StatsWidget({ title, stats, columns = 2 }: StatsWidgetProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.grid, { flexWrap: 'wrap' }]}>
        {stats.map((stat, idx) => (
          <View key={idx} style={[styles.statItem, { width: \`\${100 / columns - 2}%\` }]}>
            {stat.icon && (
              <View style={[styles.iconContainer, { backgroundColor: (stat.color || '#3b82f6') + '15' }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color || '#3b82f6'} />
              </View>
            )}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 8 },
  statItem: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 },
  iconContainer: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet } from 'react-native';"],
  };
}

// Stat Card
export function generateRNStatCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNAnalyticsCard(resolved, variant);
}

// Statistics Cards
export function generateRNStatisticsCards(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
  color?: string;
}

interface StatisticsCardsProps {
  cards: StatCard[];
  horizontal?: boolean;
}

export default function StatisticsCards({ cards, horizontal = true }: StatisticsCardsProps) {
  const content = cards.map((card, idx) => (
    <View key={idx} style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: (card.color || '#3b82f6') + '15' }]}>
          <Ionicons name={(card.icon || 'stats-chart') as any} size={20} color={card.color || '#3b82f6'} />
        </View>
        {card.change !== undefined && (
          <View style={[styles.changeBadge, { backgroundColor: card.change >= 0 ? '#dcfce7' : '#fee2e2' }]}>
            <Ionicons name={card.change >= 0 ? 'trending-up' : 'trending-down'} size={12} color={card.change >= 0 ? '#16a34a' : '#dc2626'} />
            <Text style={[styles.changeText, { color: card.change >= 0 ? '#16a34a' : '#dc2626' }]}>{Math.abs(card.change)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{card.value}</Text>
      <Text style={styles.title}>{card.title}</Text>
    </View>
  ));

  if (horizontal) {
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContainer}>{content}</ScrollView>;
  }

  return <View style={styles.gridContainer}>{content}</View>;
}

const styles = StyleSheet.create({
  horizontalContainer: { paddingHorizontal: 16, gap: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, minWidth: 160, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 2 },
  changeText: { fontSize: 11, fontWeight: '600' },
  value: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  title: { fontSize: 13, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Statistics Numbers Section
export function generateRNStatisticsNumbersSection(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Statistic {
  value: string | number;
  label: string;
  suffix?: string;
  prefix?: string;
}

interface StatisticsNumbersSectionProps {
  title?: string;
  subtitle?: string;
  statistics: Statistic[];
  columns?: 2 | 3 | 4;
}

export default function StatisticsNumbersSection({ title, subtitle, statistics, columns = 4 }: StatisticsNumbersSectionProps) {
  return (
    <View style={styles.container}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.grid}>
        {statistics.map((stat, idx) => (
          <View key={idx} style={[styles.statItem, { width: \`\${100 / columns - 4}%\` }]}>
            <Text style={styles.statValue}>
              {stat.prefix}<Text style={styles.statNumber}>{stat.value}</Text>{stat.suffix}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 24, borderRadius: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', padding: 16, minWidth: 80 },
  statValue: { fontSize: 14, color: '#6b7280' },
  statNumber: { fontSize: 36, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet } from 'react-native';"],
  };
}

// Dashboard
export function generateRNDashboard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
  color?: string;
}

interface DashboardProps {
  title?: string;
  greeting?: string;
  cards: DashboardCard[];
  quickActions?: { label: string; icon: string; onPress: () => void }[];
  onCardPress?: (card: DashboardCard) => void;
}

export default function Dashboard({ title = 'Dashboard', greeting, cards, quickActions, onCardPress }: DashboardProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {greeting && <Text style={styles.greeting}>{greeting}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>

      {quickActions && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsRow}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.actionButton} onPress={action.onPress}>
              <Ionicons name={action.icon as any} size={20} color="#3b82f6" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.cardsGrid}>
        {cards.map((card) => (
          <TouchableOpacity key={card.id} style={styles.card} onPress={() => onCardPress?.(card)}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: (card.color || '#3b82f6') + '15' }]}>
                <Ionicons name={(card.icon || 'stats-chart') as any} size={20} color={card.color || '#3b82f6'} />
              </View>
              {card.change !== undefined && (
                <View style={[styles.changeBadge, { backgroundColor: card.change >= 0 ? '#dcfce7' : '#fee2e2' }]}>
                  <Ionicons name={card.change >= 0 ? 'trending-up' : 'trending-down'} size={12} color={card.change >= 0 ? '#16a34a' : '#dc2626'} />
                  <Text style={[styles.changeText, { color: card.change >= 0 ? '#16a34a' : '#dc2626' }]}>{Math.abs(card.change)}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, paddingTop: 40 },
  greeting: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  actionsRow: { paddingHorizontal: 16, marginBottom: 16 },
  actionButton: { alignItems: 'center', marginRight: 16, padding: 12, backgroundColor: '#fff', borderRadius: 12, minWidth: 80 },
  actionLabel: { fontSize: 12, color: '#374151', marginTop: 6 },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  card: { width: '46%', backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: '2%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 2 },
  changeText: { fontSize: 10, fontWeight: '600' },
  cardValue: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardTitle: { fontSize: 13, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';"],
  };
}

// Activity Feed Dashboard
export function generateRNActivityFeedDashboard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Activity {
  id: string;
  type: 'sale' | 'user' | 'order' | 'alert' | 'update';
  title: string;
  description?: string;
  time: string;
  avatar?: string;
  value?: string;
}

interface ActivityFeedDashboardProps {
  title?: string;
  activities: Activity[];
  onActivityPress?: (activity: Activity) => void;
  onViewAll?: () => void;
}

export default function ActivityFeedDashboard({ title = 'Recent Activity', activities, onActivityPress, onViewAll }: ActivityFeedDashboardProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'sale': return { name: 'cart', color: '#10b981' };
      case 'user': return { name: 'person-add', color: '#3b82f6' };
      case 'order': return { name: 'cube', color: '#8b5cf6' };
      case 'alert': return { name: 'warning', color: '#f59e0b' };
      default: return { name: 'refresh', color: '#6b7280' };
    }
  };

  const renderActivity = ({ item }: { item: Activity }) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity style={styles.activityItem} onPress={() => onActivityPress?.(item)}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
            <Ionicons name={icon.name as any} size={18} color={icon.color} />
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          {item.description && <Text style={styles.description}>{item.description}</Text>}
          <Text style={styles.time}>{item.time}</Text>
        </View>
        {item.value && <Text style={styles.value}>{item.value}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll && <TouchableOpacity onPress={onViewAll}><Text style={styles.viewAll}>View All</Text></TouchableOpacity>}
      </View>
      <FlatList data={activities} renderItem={renderActivity} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  viewAll: { fontSize: 14, color: '#3b82f6', fontWeight: '500' },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 12 },
  activityTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  description: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  time: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  value: { fontSize: 14, fontWeight: '600', color: '#10b981' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';"],
  };
}

// Billing Dashboard
export function generateRNBillingDashboard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

interface BillingDashboardProps {
  balance?: number;
  nextBillDate?: string;
  nextBillAmount?: number;
  recentInvoices: Invoice[];
  onPayNow?: () => void;
  onViewInvoice?: (invoice: Invoice) => void;
}

export default function BillingDashboard({ balance = 0, nextBillDate, nextBillAmount, recentInvoices, onPayNow, onViewInvoice }: BillingDashboardProps) {
  const getStatusStyle = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#16a34a' };
      case 'pending': return { bg: '#fef3c7', text: '#d97706' };
      case 'overdue': return { bg: '#fee2e2', text: '#dc2626' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>\${balance.toFixed(2)}</Text>
        {nextBillDate && (
          <Text style={styles.nextBill}>Next bill: \${nextBillAmount?.toFixed(2)} on {nextBillDate}</Text>
        )}
        <TouchableOpacity style={styles.payButton} onPress={onPayNow}>
          <Ionicons name="card-outline" size={18} color="#fff" />
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Invoices</Text>
        {recentInvoices.map((invoice) => {
          const status = getStatusStyle(invoice.status);
          return (
            <TouchableOpacity key={invoice.id} style={styles.invoiceItem} onPress={() => onViewInvoice?.(invoice)}>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNumber}>{invoice.number}</Text>
                <Text style={styles.invoiceDue}>Due: {invoice.dueDate}</Text>
              </View>
              <View style={styles.invoiceRight}>
                <Text style={styles.invoiceAmount}>\${invoice.amount.toFixed(2)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.text }]}>{invoice.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  balanceCard: { backgroundColor: '#3b82f6', margin: 16, borderRadius: 16, padding: 24, alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 40, fontWeight: '800', color: '#fff', marginVertical: 8 },
  nextBill: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  payButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16, gap: 8 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  invoiceItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  invoiceInfo: {},
  invoiceNumber: { fontSize: 15, fontWeight: '600', color: '#111827' },
  invoiceDue: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  invoiceRight: { alignItems: 'flex-end' },
  invoiceAmount: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';"],
  };
}
