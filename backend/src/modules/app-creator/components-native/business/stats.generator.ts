/**
 * Business Stats Generators (React Native)
 *
 * Generates stats dashboard components for various business types.
 * Uses React Native components with @expo/vector-icons for icons.
 */

export interface BusinessStatsOptions {
  title?: string;
  apiEndpoint?: string;
  componentName?: string;
}

// Helper to generate the base stats component structure
function generateStatsComponent(
  componentName: string,
  title: string,
  statsInterface: string,
  defaultStats: string,
  statItems: string
): string {
  return `import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: screenWidth } = Dimensions.get('window');

${statsInterface}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, index }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: '#DBEAFE', text: '#1D4ED8' },
    green: { bg: '#D1FAE5', text: '#047857' },
    yellow: { bg: '#FEF3C7', text: '#B45309' },
    red: { bg: '#FEE2E2', text: '#B91C1C' },
    purple: { bg: '#EDE9FE', text: '#7C3AED' },
    pink: { bg: '#FCE7F3', text: '#BE185D' },
    orange: { bg: '#FFEDD5', text: '#C2410C' },
    amber: { bg: '#FEF3C7', text: '#B45309' },
    cyan: { bg: '#CFFAFE', text: '#0891B2' },
    gray: { bg: '#F3F4F6', text: '#4B5563' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <Animated.View
      style={[
        styles.statCard,
        { backgroundColor: colors.bg, opacity: animatedValue },
      ]}
    >
      <Ionicons name={icon} size={28} color={colors.text} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>{label}</Text>
    </Animated.View>
  );
};

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['${componentName.toLowerCase()}'],
    queryFn: async () => {
      // Simulated data - replace with actual API call
      return ${defaultStats};
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

  const statItems: StatCardProps[] = ${statItems};

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
      <Text style={styles.title}>${title}</Text>
      <View style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <StatCard key={index} {...item} index={index} />
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: (screenWidth - 44) / 2,
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

// Accounting Stats
export function generateAccountingStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Accounting Overview', componentName = 'AccountingStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface AccountingStatsData {
  activeClients: number;
  pendingReturns: number;
  dueDeadlines: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
  completedEngagements: number;
}`,
    `{
      activeClients: 45,
      pendingReturns: 12,
      dueDeadlines: 5,
      monthlyRevenue: 28500,
      outstandingInvoices: 8,
      completedEngagements: 156,
    } as AccountingStatsData`,
    `[
    { icon: 'people', label: 'Active Clients', value: stats?.activeClients || 0, color: 'blue', index: 0 },
    { icon: 'document-text', label: 'Pending Returns', value: stats?.pendingReturns || 0, color: 'yellow', index: 1 },
    { icon: 'alarm', label: 'Due Deadlines', value: stats?.dueDeadlines || 0, color: 'red', index: 2 },
    { icon: 'cash', label: 'Monthly Revenue', value: '$' + (stats?.monthlyRevenue?.toLocaleString() || '0'), color: 'green', index: 3 },
    { icon: 'receipt', label: 'Outstanding Invoices', value: stats?.outstandingInvoices || 0, color: 'orange', index: 4 },
    { icon: 'checkmark-circle', label: 'Completed', value: stats?.completedEngagements || 0, color: 'purple', index: 5 },
  ]`
  );
}

// Arcade Stats
export function generateArcadeStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Arcade Dashboard', componentName = 'ArcadeStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface ArcadeStatsData {
  dailyVisitors: number;
  activeGames: number;
  tokensDispensed: number;
  partyBookings: number;
  dailyRevenue: number;
}`,
    `{
      dailyVisitors: 234,
      activeGames: 48,
      tokensDispensed: 5670,
      partyBookings: 8,
      dailyRevenue: 4520,
    } as ArcadeStatsData`,
    `[
    { icon: 'game-controller', label: 'Active Games', value: stats?.activeGames || 0, color: 'purple', index: 0 },
    { icon: 'people', label: "Today's Visitors", value: stats?.dailyVisitors || 0, color: 'blue', index: 1 },
    { icon: 'disc', label: 'Tokens Dispensed', value: stats?.tokensDispensed || 0, color: 'yellow', index: 2 },
    { icon: 'balloon', label: 'Party Bookings', value: stats?.partyBookings || 0, color: 'pink', index: 3 },
  ]`
  );
}

// Bakery Stats
export function generateBakeryStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Bakery Dashboard', componentName = 'BakeryStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface BakeryStatsData {
  todaysOrders: number;
  itemsBaked: number;
  customOrders: number;
  dailySales: number;
}`,
    `{
      todaysOrders: 45,
      itemsBaked: 320,
      customOrders: 8,
      dailySales: 2840,
    } as BakeryStatsData`,
    `[
    { icon: 'restaurant', label: "Today's Orders", value: stats?.todaysOrders || 0, color: 'amber', index: 0 },
    { icon: 'nutrition', label: 'Items Baked', value: stats?.itemsBaked || 0, color: 'orange', index: 1 },
    { icon: 'gift', label: 'Custom Orders', value: stats?.customOrders || 0, color: 'pink', index: 2 },
    { icon: 'cash', label: 'Daily Sales', value: '$' + (stats?.dailySales || 0), color: 'green', index: 3 },
  ]`
  );
}

// Brewery Stats
export function generateBreweryStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Brewery Dashboard', componentName = 'BreweryStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface BreweryStatsData {
  activeBatches: number;
  beerOnTap: number;
  taproomVisitors: number;
  weeklyProduction: number;
  upcomingTours: number;
}`,
    `{
      activeBatches: 6,
      beerOnTap: 12,
      taproomVisitors: 89,
      weeklyProduction: 450,
      upcomingTours: 3,
    } as BreweryStatsData`,
    `[
    { icon: 'beer', label: 'Active Batches', value: stats?.activeBatches || 0, color: 'amber', index: 0 },
    { icon: 'pint', label: 'Beers on Tap', value: stats?.beerOnTap || 0, color: 'yellow', index: 1 },
    { icon: 'people', label: 'Taproom Visitors', value: stats?.taproomVisitors || 0, color: 'blue', index: 2 },
    { icon: 'server', label: 'Weekly Production', value: (stats?.weeklyProduction || 0) + 'L', color: 'green', index: 3 },
    { icon: 'ticket', label: 'Upcoming Tours', value: stats?.upcomingTours || 0, color: 'purple', index: 4 },
  ]`
  );
}

// Catering Stats
export function generateCateringStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Catering Dashboard', componentName = 'CateringStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface CateringStatsData {
  upcomingEvents: number;
  thisWeekEvents: number;
  pendingQuotes: number;
  monthlyRevenue: number;
  staffOnDuty: number;
}`,
    `{
      upcomingEvents: 8,
      thisWeekEvents: 3,
      pendingQuotes: 5,
      monthlyRevenue: 45000,
      staffOnDuty: 12,
    } as CateringStatsData`,
    `[
    { icon: 'calendar', label: 'Upcoming Events', value: stats?.upcomingEvents || 0, color: 'blue', index: 0 },
    { icon: 'today', label: 'This Week', value: stats?.thisWeekEvents || 0, color: 'green', index: 1 },
    { icon: 'chatbox', label: 'Pending Quotes', value: stats?.pendingQuotes || 0, color: 'yellow', index: 2 },
    { icon: 'cash', label: 'Monthly Revenue', value: '$' + (stats?.monthlyRevenue?.toLocaleString() || '0'), color: 'purple', index: 3 },
    { icon: 'person', label: 'Staff on Duty', value: stats?.staffOnDuty || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Cinema Stats
export function generateCinemaStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Cinema Dashboard', componentName = 'CinemaStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface CinemaStatsData {
  todayScreenings: number;
  ticketsSold: number;
  occupancyRate: number;
  nowShowing: number;
  concessionSales: number;
}`,
    `{
      todayScreenings: 24,
      ticketsSold: 456,
      occupancyRate: 72,
      nowShowing: 8,
      concessionSales: 3200,
    } as CinemaStatsData`,
    `[
    { icon: 'film', label: "Today's Screenings", value: stats?.todayScreenings || 0, color: 'red', index: 0 },
    { icon: 'ticket', label: 'Tickets Sold', value: stats?.ticketsSold || 0, color: 'blue', index: 1 },
    { icon: 'analytics', label: 'Occupancy Rate', value: (stats?.occupancyRate || 0) + '%', color: 'green', index: 2 },
    { icon: 'videocam', label: 'Now Showing', value: stats?.nowShowing || 0, color: 'purple', index: 3 },
    { icon: 'fast-food', label: 'Concession Sales', value: '$' + (stats?.concessionSales || 0), color: 'yellow', index: 4 },
  ]`
  );
}

// Consulting Stats
export function generateConsultingStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Consulting Dashboard', componentName = 'ConsultingStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface ConsultingStatsData {
  activeProjects: number;
  activeClients: number;
  billableHours: number;
  monthlyRevenue: number;
  utilization: number;
}`,
    `{
      activeProjects: 12,
      activeClients: 8,
      billableHours: 156,
      monthlyRevenue: 85000,
      utilization: 85,
    } as ConsultingStatsData`,
    `[
    { icon: 'folder', label: 'Active Projects', value: stats?.activeProjects || 0, color: 'blue', index: 0 },
    { icon: 'people', label: 'Active Clients', value: stats?.activeClients || 0, color: 'green', index: 1 },
    { icon: 'time', label: 'Billable Hours', value: stats?.billableHours || 0, color: 'purple', index: 2 },
    { icon: 'cash', label: 'Monthly Revenue', value: '$' + (stats?.monthlyRevenue?.toLocaleString() || '0'), color: 'yellow', index: 3 },
    { icon: 'trending-up', label: 'Utilization', value: (stats?.utilization || 0) + '%', color: 'orange', index: 4 },
  ]`
  );
}

// CrossFit Stats
export function generateCrossfitStats(options: BusinessStatsOptions = {}): string {
  const { title = 'CrossFit Box Dashboard', componentName = 'CrossfitStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface CrossfitStatsData {
  todayAttendance: number;
  activeMembers: number;
  todayWOD: string;
  personalRecords: number;
  upcomingCompetitions: number;
}`,
    `{
      todayAttendance: 45,
      activeMembers: 180,
      todayWOD: 'AMRAP 20',
      personalRecords: 12,
      upcomingCompetitions: 2,
    } as CrossfitStatsData`,
    `[
    { icon: 'barbell', label: "Today's Attendance", value: stats?.todayAttendance || 0, color: 'red', index: 0 },
    { icon: 'people', label: 'Active Members', value: stats?.activeMembers || 0, color: 'blue', index: 1 },
    { icon: 'fitness', label: "Today's WOD", value: stats?.todayWOD || '-', color: 'orange', index: 2 },
    { icon: 'trophy', label: 'PRs This Week', value: stats?.personalRecords || 0, color: 'yellow', index: 3 },
    { icon: 'flag', label: 'Competitions', value: stats?.upcomingCompetitions || 0, color: 'purple', index: 4 },
  ]`
  );
}

// Dance Studio Stats
export function generateDanceStudioStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Dance Studio Dashboard', componentName = 'DanceStudioStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface DanceStudioStatsData {
  todayClasses: number;
  activeStudents: number;
  instructors: number;
  upcomingRecitals: number;
  monthlyEnrollments: number;
}`,
    `{
      todayClasses: 8,
      activeStudents: 145,
      instructors: 6,
      upcomingRecitals: 2,
      monthlyEnrollments: 18,
    } as DanceStudioStatsData`,
    `[
    { icon: 'musical-notes', label: "Today's Classes", value: stats?.todayClasses || 0, color: 'pink', index: 0 },
    { icon: 'people', label: 'Active Students', value: stats?.activeStudents || 0, color: 'purple', index: 1 },
    { icon: 'person', label: 'Instructors', value: stats?.instructors || 0, color: 'blue', index: 2 },
    { icon: 'star', label: 'Upcoming Recitals', value: stats?.upcomingRecitals || 0, color: 'yellow', index: 3 },
    { icon: 'create', label: 'New Enrollments', value: stats?.monthlyEnrollments || 0, color: 'green', index: 4 },
  ]`
  );
}

// Dental Stats
export function generateDentalStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Dental Practice Dashboard', componentName = 'DentalStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface DentalStatsData {
  todayAppointments: number;
  activePatients: number;
  pendingTreatments: number;
  monthlyRevenue: number;
  waitingRoom: number;
}`,
    `{
      todayAppointments: 18,
      activePatients: 450,
      pendingTreatments: 23,
      monthlyRevenue: 65000,
      waitingRoom: 3,
    } as DentalStatsData`,
    `[
    { icon: 'medical', label: "Today's Appointments", value: stats?.todayAppointments || 0, color: 'blue', index: 0 },
    { icon: 'people', label: 'Active Patients', value: stats?.activePatients || 0, color: 'green', index: 1 },
    { icon: 'clipboard', label: 'Pending Treatments', value: stats?.pendingTreatments || 0, color: 'yellow', index: 2 },
    { icon: 'cash', label: 'Monthly Revenue', value: '$' + (stats?.monthlyRevenue?.toLocaleString() || '0'), color: 'purple', index: 3 },
    { icon: 'hourglass', label: 'In Waiting Room', value: stats?.waitingRoom || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Escape Room Stats
export function generateEscapeRoomStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Escape Room Dashboard', componentName = 'EscapeRoomStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface EscapeRoomStatsData {
  todayBookings: number;
  activeRooms: number;
  escapeRate: number;
  avgCompletionTime: number;
  upcomingGroups: number;
}`,
    `{
      todayBookings: 12,
      activeRooms: 4,
      escapeRate: 68,
      avgCompletionTime: 52,
      upcomingGroups: 5,
    } as EscapeRoomStatsData`,
    `[
    { icon: 'lock-closed', label: "Today's Bookings", value: stats?.todayBookings || 0, color: 'purple', index: 0 },
    { icon: 'home', label: 'Active Rooms', value: stats?.activeRooms || 0, color: 'blue', index: 1 },
    { icon: 'trophy', label: 'Escape Rate', value: (stats?.escapeRate || 0) + '%', color: 'green', index: 2 },
    { icon: 'timer', label: 'Avg Time (min)', value: stats?.avgCompletionTime || 0, color: 'yellow', index: 3 },
    { icon: 'people', label: 'Upcoming Groups', value: stats?.upcomingGroups || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Florist Stats
export function generateFloristStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Florist Dashboard', componentName = 'FloristStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface FloristStatsData {
  todayOrders: number;
  pendingDeliveries: number;
  arrangementsComplete: number;
  dailyRevenue: number;
  lowStockItems: number;
}`,
    `{
      todayOrders: 24,
      pendingDeliveries: 8,
      arrangementsComplete: 18,
      dailyRevenue: 2450,
      lowStockItems: 5,
    } as FloristStatsData`,
    `[
    { icon: 'flower', label: "Today's Orders", value: stats?.todayOrders || 0, color: 'pink', index: 0 },
    { icon: 'car', label: 'Pending Deliveries', value: stats?.pendingDeliveries || 0, color: 'blue', index: 1 },
    { icon: 'checkmark', label: 'Arrangements Done', value: stats?.arrangementsComplete || 0, color: 'green', index: 2 },
    { icon: 'cash', label: 'Daily Revenue', value: '$' + (stats?.dailyRevenue || 0), color: 'yellow', index: 3 },
    { icon: 'warning', label: 'Low Stock Items', value: stats?.lowStockItems || 0, color: 'red', index: 4 },
  ]`
  );
}

// Food Truck Stats
export function generateFoodtruckStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Food Truck Dashboard', componentName = 'FoodtruckStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface FoodtruckStatsData {
  todayOrders: number;
  avgWaitTime: number;
  dailyRevenue: number;
  itemsSold: number;
  currentLocation: string;
}`,
    `{
      todayOrders: 86,
      avgWaitTime: 8,
      dailyRevenue: 1850,
      itemsSold: 142,
      currentLocation: 'Downtown',
    } as FoodtruckStatsData`,
    `[
    { icon: 'bus', label: "Today's Orders", value: stats?.todayOrders || 0, color: 'orange', index: 0 },
    { icon: 'time', label: 'Avg Wait (min)', value: stats?.avgWaitTime || 0, color: 'blue', index: 1 },
    { icon: 'cash', label: 'Daily Revenue', value: '$' + (stats?.dailyRevenue || 0), color: 'green', index: 2 },
    { icon: 'fast-food', label: 'Items Sold', value: stats?.itemsSold || 0, color: 'yellow', index: 3 },
    { icon: 'location', label: 'Location', value: stats?.currentLocation || '-', color: 'purple', index: 4 },
  ]`
  );
}

// Freelance Stats
export function generateFreelanceStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Freelance Dashboard', componentName = 'FreelanceStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface FreelanceStatsData {
  activeProjects: number;
  pendingProposals: number;
  monthlyEarnings: number;
  hoursThisWeek: number;
  completedProjects: number;
}`,
    `{
      activeProjects: 5,
      pendingProposals: 3,
      monthlyEarnings: 8500,
      hoursThisWeek: 32,
      completedProjects: 47,
    } as FreelanceStatsData`,
    `[
    { icon: 'folder', label: 'Active Projects', value: stats?.activeProjects || 0, color: 'blue', index: 0 },
    { icon: 'document-text', label: 'Pending Proposals', value: stats?.pendingProposals || 0, color: 'yellow', index: 1 },
    { icon: 'cash', label: 'Monthly Earnings', value: '$' + (stats?.monthlyEarnings?.toLocaleString() || '0'), color: 'green', index: 2 },
    { icon: 'time', label: 'Hours This Week', value: stats?.hoursThisWeek || 0, color: 'purple', index: 3 },
    { icon: 'checkmark', label: 'Completed', value: stats?.completedProjects || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Jeweler Stats
export function generateJewelerStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Jewelry Store Dashboard', componentName = 'JewelerStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface JewelerStatsData {
  pendingRepairs: number;
  customOrders: number;
  inventoryValue: number;
  dailySales: number;
  appraisalsScheduled: number;
}`,
    `{
      pendingRepairs: 12,
      customOrders: 5,
      inventoryValue: 125000,
      dailySales: 4500,
      appraisalsScheduled: 3,
    } as JewelerStatsData`,
    `[
    { icon: 'diamond', label: 'Pending Repairs', value: stats?.pendingRepairs || 0, color: 'purple', index: 0 },
    { icon: 'sparkles', label: 'Custom Orders', value: stats?.customOrders || 0, color: 'pink', index: 1 },
    { icon: 'cube', label: 'Inventory Value', value: '$' + (stats?.inventoryValue?.toLocaleString() || '0'), color: 'blue', index: 2 },
    { icon: 'cash', label: 'Daily Sales', value: '$' + (stats?.dailySales || 0), color: 'green', index: 3 },
    { icon: 'clipboard', label: 'Appraisals', value: stats?.appraisalsScheduled || 0, color: 'yellow', index: 4 },
  ]`
  );
}

// Library Stats
export function generateLibraryStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Library Dashboard', componentName = 'LibraryStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface LibraryStatsData {
  booksCheckedOut: number;
  activeMembers: number;
  overdueItems: number;
  newArrivals: number;
  eventsThisWeek: number;
}`,
    `{
      booksCheckedOut: 234,
      activeMembers: 1250,
      overdueItems: 45,
      newArrivals: 28,
      eventsThisWeek: 5,
    } as LibraryStatsData`,
    `[
    { icon: 'book', label: 'Checked Out', value: stats?.booksCheckedOut || 0, color: 'blue', index: 0 },
    { icon: 'people', label: 'Active Members', value: stats?.activeMembers || 0, color: 'green', index: 1 },
    { icon: 'alarm', label: 'Overdue Items', value: stats?.overdueItems || 0, color: 'red', index: 2 },
    { icon: 'library', label: 'New Arrivals', value: stats?.newArrivals || 0, color: 'purple', index: 3 },
    { icon: 'calendar', label: 'Events This Week', value: stats?.eventsThisWeek || 0, color: 'yellow', index: 4 },
  ]`
  );
}

// Lot Stats (Parking)
export function generateLotStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Parking Lot Dashboard', componentName = 'LotStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface LotStatsData {
  totalSpaces: number;
  occupied: number;
  available: number;
  dailyRevenue: number;
  monthlyPassholders: number;
}`,
    `{
      totalSpaces: 200,
      occupied: 156,
      available: 44,
      dailyRevenue: 2840,
      monthlyPassholders: 85,
    } as LotStatsData`,
    `[
    { icon: 'car', label: 'Total Spaces', value: stats?.totalSpaces || 0, color: 'gray', index: 0 },
    { icon: 'car-sport', label: 'Occupied', value: stats?.occupied || 0, color: 'red', index: 1 },
    { icon: 'checkmark-circle', label: 'Available', value: stats?.available || 0, color: 'green', index: 2 },
    { icon: 'cash', label: 'Daily Revenue', value: '$' + (stats?.dailyRevenue || 0), color: 'yellow', index: 3 },
    { icon: 'analytics', label: 'Occupancy', value: Math.round(((stats?.occupied || 0) / (stats?.totalSpaces || 1)) * 100) + '%', color: 'blue', index: 4 },
  ]`
  );
}

// Marketing Stats
export function generateMarketingStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Marketing Dashboard', componentName = 'MarketingStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface MarketingStatsData {
  activeCampaigns: number;
  totalReach: number;
  conversionRate: number;
  monthlySpend: number;
  leadsGenerated: number;
}`,
    `{
      activeCampaigns: 8,
      totalReach: 125000,
      conversionRate: 3.2,
      monthlySpend: 15000,
      leadsGenerated: 450,
    } as MarketingStatsData`,
    `[
    { icon: 'megaphone', label: 'Active Campaigns', value: stats?.activeCampaigns || 0, color: 'blue', index: 0 },
    { icon: 'eye', label: 'Total Reach', value: ((stats?.totalReach || 0) / 1000).toFixed(0) + 'K', color: 'green', index: 1 },
    { icon: 'trending-up', label: 'Conversion Rate', value: (stats?.conversionRate || 0) + '%', color: 'purple', index: 2 },
    { icon: 'cash', label: 'Monthly Spend', value: '$' + (stats?.monthlySpend?.toLocaleString() || '0'), color: 'yellow', index: 3 },
    { icon: 'flag', label: 'Leads Generated', value: stats?.leadsGenerated || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Membership Stats
export function generateMembershipStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Membership Dashboard', componentName = 'MembershipStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface MembershipStatsData {
  totalMembers: number;
  activeMembers: number;
  newThisMonth: number;
  renewalsDue: number;
  churnRate: number;
}`,
    `{
      totalMembers: 1250,
      activeMembers: 980,
      newThisMonth: 45,
      renewalsDue: 23,
      churnRate: 2.5,
    } as MembershipStatsData`,
    `[
    { icon: 'people', label: 'Total Members', value: stats?.totalMembers || 0, color: 'blue', index: 0 },
    { icon: 'checkmark', label: 'Active', value: stats?.activeMembers || 0, color: 'green', index: 1 },
    { icon: 'add-circle', label: 'New This Month', value: stats?.newThisMonth || 0, color: 'purple', index: 2 },
    { icon: 'refresh', label: 'Renewals Due', value: stats?.renewalsDue || 0, color: 'yellow', index: 3 },
    { icon: 'trending-down', label: 'Churn Rate', value: (stats?.churnRate || 0) + '%', color: 'red', index: 4 },
  ]`
  );
}

// Nursery Stats (Plant)
export function generateNurseryStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Plant Nursery Dashboard', componentName = 'NurseryStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface NurseryStatsData {
  plantsInStock: number;
  todaySales: number;
  lowStockItems: number;
  dailyRevenue: number;
  specialOrders: number;
}`,
    `{
      plantsInStock: 2450,
      todaySales: 45,
      lowStockItems: 12,
      dailyRevenue: 1850,
      specialOrders: 8,
    } as NurseryStatsData`,
    `[
    { icon: 'leaf', label: 'Plants in Stock', value: stats?.plantsInStock || 0, color: 'green', index: 0 },
    { icon: 'cart', label: "Today's Sales", value: stats?.todaySales || 0, color: 'blue', index: 1 },
    { icon: 'warning', label: 'Low Stock', value: stats?.lowStockItems || 0, color: 'yellow', index: 2 },
    { icon: 'cash', label: 'Daily Revenue', value: '$' + (stats?.dailyRevenue || 0), color: 'purple', index: 3 },
    { icon: 'cube', label: 'Special Orders', value: stats?.specialOrders || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Optician Stats
export function generateOpticianStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Optician Dashboard', componentName = 'OpticianStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface OpticianStatsData {
  todayAppointments: number;
  pendingOrders: number;
  examsCompleted: number;
  glassesReady: number;
  dailyRevenue: number;
}`,
    `{
      todayAppointments: 12,
      pendingOrders: 18,
      examsCompleted: 8,
      glassesReady: 15,
      dailyRevenue: 3200,
    } as OpticianStatsData`,
    `[
    { icon: 'glasses', label: 'Appointments', value: stats?.todayAppointments || 0, color: 'blue', index: 0 },
    { icon: 'cube', label: 'Pending Orders', value: stats?.pendingOrders || 0, color: 'yellow', index: 1 },
    { icon: 'eye', label: 'Exams Done', value: stats?.examsCompleted || 0, color: 'green', index: 2 },
    { icon: 'checkmark', label: 'Glasses Ready', value: stats?.glassesReady || 0, color: 'purple', index: 3 },
    { icon: 'cash', label: 'Daily Revenue', value: '$' + (stats?.dailyRevenue || 0), color: 'orange', index: 4 },
  ]`
  );
}

// Pharmacy Stats
export function generatePharmacyStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Pharmacy Dashboard', componentName = 'PharmacyStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface PharmacyStatsData {
  prescriptionsPending: number;
  prescriptionsReady: number;
  lowStockMeds: number;
  dailyPrescriptions: number;
  consultationsToday: number;
}`,
    `{
      prescriptionsPending: 28,
      prescriptionsReady: 45,
      lowStockMeds: 12,
      dailyPrescriptions: 156,
      consultationsToday: 8,
    } as PharmacyStatsData`,
    `[
    { icon: 'medkit', label: 'Pending', value: stats?.prescriptionsPending || 0, color: 'yellow', index: 0 },
    { icon: 'checkmark', label: 'Ready for Pickup', value: stats?.prescriptionsReady || 0, color: 'green', index: 1 },
    { icon: 'warning', label: 'Low Stock Meds', value: stats?.lowStockMeds || 0, color: 'red', index: 2 },
    { icon: 'clipboard', label: 'Daily Scripts', value: stats?.dailyPrescriptions || 0, color: 'blue', index: 3 },
    { icon: 'person', label: 'Consultations', value: stats?.consultationsToday || 0, color: 'purple', index: 4 },
  ]`
  );
}

// Rehab Stats
export function generateRehabStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Rehabilitation Center Dashboard', componentName = 'RehabStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface RehabStatsData {
  activePatients: number;
  todaySessions: number;
  therapists: number;
  avgProgressScore: number;
  dischargesThisWeek: number;
}`,
    `{
      activePatients: 45,
      todaySessions: 32,
      therapists: 8,
      avgProgressScore: 78,
      dischargesThisWeek: 5,
    } as RehabStatsData`,
    `[
    { icon: 'fitness', label: 'Active Patients', value: stats?.activePatients || 0, color: 'blue', index: 0 },
    { icon: 'calendar', label: "Today's Sessions", value: stats?.todaySessions || 0, color: 'green', index: 1 },
    { icon: 'people', label: 'Therapists', value: stats?.therapists || 0, color: 'purple', index: 2 },
    { icon: 'trending-up', label: 'Avg Progress', value: (stats?.avgProgressScore || 0) + '%', color: 'yellow', index: 3 },
    { icon: 'home', label: 'Discharges', value: stats?.dischargesThisWeek || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Rental Stats
export function generateRentalStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Rental Dashboard', componentName = 'RentalStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface RentalStatsData {
  totalItems: number;
  currentlyRented: number;
  available: number;
  reservations: number;
  overdueReturns: number;
}`,
    `{
      totalItems: 250,
      currentlyRented: 85,
      available: 165,
      reservations: 23,
      overdueReturns: 5,
    } as RentalStatsData`,
    `[
    { icon: 'cube', label: 'Total Items', value: stats?.totalItems || 0, color: 'gray', index: 0 },
    { icon: 'lock-closed', label: 'Currently Rented', value: stats?.currentlyRented || 0, color: 'blue', index: 1 },
    { icon: 'checkmark', label: 'Available', value: stats?.available || 0, color: 'green', index: 2 },
    { icon: 'calendar', label: 'Reservations', value: stats?.reservations || 0, color: 'purple', index: 3 },
    { icon: 'warning', label: 'Overdue', value: stats?.overdueReturns || 0, color: 'red', index: 4 },
  ]`
  );
}

// Security Stats
export function generateSecurityStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Security Dashboard', componentName = 'SecurityStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface SecurityStatsData {
  guardsOnDuty: number;
  activeSites: number;
  incidentsToday: number;
  upcomingShifts: number;
  alertsOpen: number;
}`,
    `{
      guardsOnDuty: 24,
      activeSites: 12,
      incidentsToday: 2,
      upcomingShifts: 18,
      alertsOpen: 3,
    } as SecurityStatsData`,
    `[
    { icon: 'shield', label: 'Guards on Duty', value: stats?.guardsOnDuty || 0, color: 'blue', index: 0 },
    { icon: 'location', label: 'Active Sites', value: stats?.activeSites || 0, color: 'green', index: 1 },
    { icon: 'warning', label: 'Incidents Today', value: stats?.incidentsToday || 0, color: 'red', index: 2 },
    { icon: 'calendar', label: 'Upcoming Shifts', value: stats?.upcomingShifts || 0, color: 'purple', index: 3 },
    { icon: 'notifications', label: 'Open Alerts', value: stats?.alertsOpen || 0, color: 'yellow', index: 4 },
  ]`
  );
}

// Senior Stats
export function generateSeniorStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Senior Living Dashboard', componentName = 'SeniorStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface SeniorStatsData {
  residents: number;
  staffOnDuty: number;
  activitiesScheduled: number;
  mealsToday: number;
  medicationsDue: number;
}`,
    `{
      residents: 85,
      staffOnDuty: 24,
      activitiesScheduled: 8,
      mealsToday: 255,
      medicationsDue: 42,
    } as SeniorStatsData`,
    `[
    { icon: 'home', label: 'Residents', value: stats?.residents || 0, color: 'blue', index: 0 },
    { icon: 'people', label: 'Staff on Duty', value: stats?.staffOnDuty || 0, color: 'green', index: 1 },
    { icon: 'calendar', label: 'Activities', value: stats?.activitiesScheduled || 0, color: 'purple', index: 2 },
    { icon: 'restaurant', label: 'Meals Today', value: stats?.mealsToday || 0, color: 'yellow', index: 3 },
    { icon: 'medkit', label: 'Medications Due', value: stats?.medicationsDue || 0, color: 'red', index: 4 },
  ]`
  );
}

// Ski Resort Stats
export function generateSkiResortStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Ski Resort Dashboard', componentName = 'SkiResortStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface SkiResortStatsData {
  liftsOpen: number;
  trailsOpen: number;
  snowDepth: number;
  dailyVisitors: number;
  temperature: number;
}`,
    `{
      liftsOpen: 12,
      trailsOpen: 45,
      snowDepth: 48,
      dailyVisitors: 2340,
      temperature: 28,
    } as SkiResortStatsData`,
    `[
    { icon: 'caret-up', label: 'Lifts Open', value: (stats?.liftsOpen || 0) + '/14', color: 'blue', index: 0 },
    { icon: 'navigate', label: 'Trails Open', value: (stats?.trailsOpen || 0) + '/52', color: 'green', index: 1 },
    { icon: 'snow', label: 'Snow Depth', value: (stats?.snowDepth || 0) + '"', color: 'cyan', index: 2 },
    { icon: 'people', label: 'Visitors Today', value: stats?.dailyVisitors || 0, color: 'purple', index: 3 },
    { icon: 'thermometer', label: 'Temperature', value: (stats?.temperature || 0) + '\u00B0F', color: 'yellow', index: 4 },
  ]`
  );
}

// Ticket Stats
export function generateTicketStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Ticket Dashboard', componentName = 'TicketStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface TicketStatsData {
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  pendingEscalation: number;
  customerSatisfaction: number;
}`,
    `{
      openTickets: 45,
      resolvedToday: 28,
      avgResponseTime: 2.4,
      pendingEscalation: 5,
      customerSatisfaction: 94,
    } as TicketStatsData`,
    `[
    { icon: 'ticket', label: 'Open Tickets', value: stats?.openTickets || 0, color: 'blue', index: 0 },
    { icon: 'checkmark', label: 'Resolved Today', value: stats?.resolvedToday || 0, color: 'green', index: 1 },
    { icon: 'time', label: 'Avg Response (hrs)', value: stats?.avgResponseTime || 0, color: 'yellow', index: 2 },
    { icon: 'warning', label: 'Pending Escalation', value: stats?.pendingEscalation || 0, color: 'red', index: 3 },
    { icon: 'happy', label: 'Satisfaction', value: (stats?.customerSatisfaction || 0) + '%', color: 'purple', index: 4 },
  ]`
  );
}

// Travel Agency Stats
export function generateTravelagencyStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Travel Agency Dashboard', componentName = 'TravelagencyStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface TravelagencyStatsData {
  activeBookings: number;
  pendingQuotes: number;
  monthlyRevenue: number;
  upcomingTrips: number;
  newInquiries: number;
}`,
    `{
      activeBookings: 34,
      pendingQuotes: 12,
      monthlyRevenue: 85000,
      upcomingTrips: 28,
      newInquiries: 8,
    } as TravelagencyStatsData`,
    `[
    { icon: 'airplane', label: 'Active Bookings', value: stats?.activeBookings || 0, color: 'blue', index: 0 },
    { icon: 'document-text', label: 'Pending Quotes', value: stats?.pendingQuotes || 0, color: 'yellow', index: 1 },
    { icon: 'cash', label: 'Monthly Revenue', value: '$' + (stats?.monthlyRevenue?.toLocaleString() || '0'), color: 'green', index: 2 },
    { icon: 'calendar', label: 'Upcoming Trips', value: stats?.upcomingTrips || 0, color: 'purple', index: 3 },
    { icon: 'mail', label: 'New Inquiries', value: stats?.newInquiries || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Vet Clinic Stats
export function generateVetClinicStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Veterinary Clinic Dashboard', componentName = 'VetClinicStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface VetClinicStatsData {
  todayAppointments: number;
  patientsWaiting: number;
  emergencies: number;
  surgeries: number;
  boardingPets: number;
}`,
    `{
      todayAppointments: 24,
      patientsWaiting: 4,
      emergencies: 1,
      surgeries: 3,
      boardingPets: 8,
    } as VetClinicStatsData`,
    `[
    { icon: 'paw', label: 'Appointments', value: stats?.todayAppointments || 0, color: 'blue', index: 0 },
    { icon: 'hourglass', label: 'Waiting', value: stats?.patientsWaiting || 0, color: 'yellow', index: 1 },
    { icon: 'alert-circle', label: 'Emergencies', value: stats?.emergencies || 0, color: 'red', index: 2 },
    { icon: 'pulse', label: 'Surgeries Today', value: stats?.surgeries || 0, color: 'purple', index: 3 },
    { icon: 'home', label: 'Boarding', value: stats?.boardingPets || 0, color: 'green', index: 4 },
  ]`
  );
}

// Yoga Stats
export function generateYogaStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Yoga Studio Dashboard', componentName = 'YogaStats' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface YogaStatsData {
  todayClasses: number;
  activeMembers: number;
  instructors: number;
  avgAttendance: number;
  workshopsScheduled: number;
}`,
    `{
      todayClasses: 8,
      activeMembers: 245,
      instructors: 6,
      avgAttendance: 18,
      workshopsScheduled: 2,
    } as YogaStatsData`,
    `[
    { icon: 'body', label: "Today's Classes", value: stats?.todayClasses || 0, color: 'purple', index: 0 },
    { icon: 'people', label: 'Active Members', value: stats?.activeMembers || 0, color: 'blue', index: 1 },
    { icon: 'person', label: 'Instructors', value: stats?.instructors || 0, color: 'green', index: 2 },
    { icon: 'analytics', label: 'Avg Attendance', value: stats?.avgAttendance || 0, color: 'yellow', index: 3 },
    { icon: 'calendar', label: 'Workshops', value: stats?.workshopsScheduled || 0, color: 'pink', index: 4 },
  ]`
  );
}

// Billing Stats Dental
export function generateBillingStatsDental(options: BusinessStatsOptions = {}): string {
  const { title = 'Dental Billing Overview', componentName = 'BillingStatsDental' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface BillingStatsDentalData {
  todayCharges: number;
  pendingClaims: number;
  paymentsReceived: number;
  insuranceOutstanding: number;
  patientBalance: number;
}`,
    `{
      todayCharges: 8500,
      pendingClaims: 23,
      paymentsReceived: 6200,
      insuranceOutstanding: 12400,
      patientBalance: 3800,
    } as BillingStatsDentalData`,
    `[
    { icon: 'cash', label: "Today's Charges", value: '$' + (stats?.todayCharges?.toLocaleString() || '0'), color: 'blue', index: 0 },
    { icon: 'clipboard', label: 'Pending Claims', value: stats?.pendingClaims || 0, color: 'yellow', index: 1 },
    { icon: 'checkmark', label: 'Payments Received', value: '$' + (stats?.paymentsReceived?.toLocaleString() || '0'), color: 'green', index: 2 },
    { icon: 'business', label: 'Insurance Outstanding', value: '$' + (stats?.insuranceOutstanding?.toLocaleString() || '0'), color: 'purple', index: 3 },
    { icon: 'person', label: 'Patient Balance', value: '$' + (stats?.patientBalance?.toLocaleString() || '0'), color: 'orange', index: 4 },
  ]`
  );
}

// Billing Stats Vet
export function generateBillingStatsVet(options: BusinessStatsOptions = {}): string {
  const { title = 'Veterinary Billing Overview', componentName = 'BillingStatsVet' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface BillingStatsVetData {
  todayCharges: number;
  paymentsReceived: number;
  outstandingBalance: number;
  petInsuranceClaims: number;
  paymentPlans: number;
}`,
    `{
      todayCharges: 5200,
      paymentsReceived: 4800,
      outstandingBalance: 8500,
      petInsuranceClaims: 12,
      paymentPlans: 8,
    } as BillingStatsVetData`,
    `[
    { icon: 'cash', label: "Today's Charges", value: '$' + (stats?.todayCharges?.toLocaleString() || '0'), color: 'blue', index: 0 },
    { icon: 'checkmark', label: 'Payments Received', value: '$' + (stats?.paymentsReceived?.toLocaleString() || '0'), color: 'green', index: 1 },
    { icon: 'hourglass', label: 'Outstanding', value: '$' + (stats?.outstandingBalance?.toLocaleString() || '0'), color: 'yellow', index: 2 },
    { icon: 'paw', label: 'Insurance Claims', value: stats?.petInsuranceClaims || 0, color: 'purple', index: 3 },
    { icon: 'clipboard', label: 'Payment Plans', value: stats?.paymentPlans || 0, color: 'orange', index: 4 },
  ]`
  );
}

// Invoice Stats Consulting
export function generateInvoiceStatsConsulting(options: BusinessStatsOptions = {}): string {
  const { title = 'Consulting Invoice Overview', componentName = 'InvoiceStatsConsulting' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface InvoiceStatsConsultingData {
  invoicedThisMonth: number;
  paidThisMonth: number;
  outstanding: number;
  overdueInvoices: number;
  avgPaymentDays: number;
}`,
    `{
      invoicedThisMonth: 125000,
      paidThisMonth: 98000,
      outstanding: 45000,
      overdueInvoices: 5,
      avgPaymentDays: 28,
    } as InvoiceStatsConsultingData`,
    `[
    { icon: 'document', label: 'Invoiced (Month)', value: '$' + (stats?.invoicedThisMonth?.toLocaleString() || '0'), color: 'blue', index: 0 },
    { icon: 'checkmark', label: 'Paid (Month)', value: '$' + (stats?.paidThisMonth?.toLocaleString() || '0'), color: 'green', index: 1 },
    { icon: 'hourglass', label: 'Outstanding', value: '$' + (stats?.outstanding?.toLocaleString() || '0'), color: 'yellow', index: 2 },
    { icon: 'warning', label: 'Overdue', value: stats?.overdueInvoices || 0, color: 'red', index: 3 },
    { icon: 'analytics', label: 'Avg Payment Days', value: stats?.avgPaymentDays || 0, color: 'purple', index: 4 },
  ]`
  );
}

// Stats Section (Generic)
export function generateStatsSection(options: BusinessStatsOptions = {}): string {
  const { title = 'Overview', componentName = 'StatsSection' } = options;
  return `import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface Stat {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  change?: number;
}

interface StatsSectionProps {
  title?: string;
  stats?: Stat[];
}

const StatCard: React.FC<{ stat: Stat; index: number }> = ({ stat, index }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: animatedValue }]}>
      <View style={styles.statHeader}>
        {stat.icon && (
          <Ionicons name={stat.icon} size={24} color="#3B82F6" />
        )}
        {stat.change !== undefined && (
          <View style={styles.changeContainer}>
            <Ionicons
              name={stat.change >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={stat.change >= 0 ? '#10B981' : '#EF4444'}
            />
            <Text style={[styles.changeText, { color: stat.change >= 0 ? '#10B981' : '#EF4444' }]}>
              {stat.change >= 0 ? '+' : ''}{stat.change}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </Animated.View>
  );
};

const ${componentName}: React.FC<StatsSectionProps> = ({ title = '${title}', stats }) => {
  const defaultStats: Stat[] = stats || [
    { label: 'Total Users', value: '12,345', icon: 'people', change: 12 },
    { label: 'Revenue', value: '$45,678', icon: 'cash', change: 8 },
    { label: 'Orders', value: '1,234', icon: 'cube', change: -3 },
    { label: 'Conversion', value: '3.2%', icon: 'trending-up', change: 5 },
  ];

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.statsGrid}>
        {defaultStats.map((stat, index) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

// Sales Stats Gallery
export function generateSalesStatsGalleryComponent(options: BusinessStatsOptions = {}): string {
  const { title = 'Gallery Sales Overview', componentName = 'SalesStatsGallery' } = options;
  return generateStatsComponent(
    componentName,
    title,
    `interface SalesStatsGalleryData {
  totalSales: number;
  totalRevenue: number;
  avgSalePrice: number;
  pendingInquiries: number;
  exhibitionsActive: number;
}`,
    `{
      totalSales: 45,
      totalRevenue: 125000,
      avgSalePrice: 2780,
      pendingInquiries: 12,
      exhibitionsActive: 3,
    } as SalesStatsGalleryData`,
    `[
    { icon: 'image', label: 'Total Sales', value: stats?.totalSales || 0, color: 'blue', index: 0 },
    { icon: 'cash', label: 'Revenue', value: '$' + (stats?.totalRevenue?.toLocaleString() || '0'), color: 'green', index: 1 },
    { icon: 'analytics', label: 'Avg Sale Price', value: '$' + (stats?.avgSalePrice?.toLocaleString() || '0'), color: 'purple', index: 2 },
    { icon: 'document-text', label: 'Inquiries', value: stats?.pendingInquiries || 0, color: 'yellow', index: 3 },
    { icon: 'color-palette', label: 'Exhibitions', value: stats?.exhibitionsActive || 0, color: 'pink', index: 4 },
  ]`
  );
}
