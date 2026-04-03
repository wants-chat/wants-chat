/**
 * Business Stats Generators
 *
 * Generates stats dashboard components for various business types.
 */

export interface BusinessStatsOptions {
  title?: string;
  apiEndpoint?: string;
}

// Accounting Stats
export function generateAccountingStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Accounting Overview' } = options;
  return `import React, { useState, useEffect } from 'react';

interface AccountingStatsData {
  activeClients: number;
  pendingReturns: number;
  dueDeadlines: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
  completedEngagements: number;
}

export default function AccountingStats() {
  const [stats, setStats] = useState<AccountingStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with actual API call
    setTimeout(() => {
      setStats({
        activeClients: 45,
        pendingReturns: 12,
        dueDeadlines: 5,
        monthlyRevenue: 28500,
        outstandingInvoices: 8,
        completedEngagements: 156
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  const statItems = [
    { label: 'Active Clients', value: stats?.activeClients, icon: '👥', color: 'bg-blue-100 text-blue-800' },
    { label: 'Pending Returns', value: stats?.pendingReturns, icon: '📋', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Due Deadlines', value: stats?.dueDeadlines, icon: '⏰', color: 'bg-red-100 text-red-800' },
    { label: 'Monthly Revenue', value: \`$\${stats?.monthlyRevenue?.toLocaleString()}\`, icon: '💰', color: 'bg-green-100 text-green-800' },
    { label: 'Outstanding Invoices', value: stats?.outstandingInvoices, icon: '📄', color: 'bg-orange-100 text-orange-800' },
    { label: 'Completed Engagements', value: stats?.completedEngagements, icon: '✓', color: 'bg-purple-100 text-purple-800' }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">${title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className={\`\${item.color} rounded-lg p-4 shadow-sm\`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <div className="text-2xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Arcade Stats
export function generateArcadeStats(options: BusinessStatsOptions = {}): string {
  const { title = 'Arcade Dashboard' } = options;
  return `import React, { useState, useEffect } from 'react';

interface ArcadeStatsData {
  dailyVisitors: number;
  activeGames: number;
  tokensDispensed: number;
  partyBookings: number;
  topGames: string[];
  dailyRevenue: number;
}

export default function ArcadeStats() {
  const [stats, setStats] = useState<ArcadeStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        dailyVisitors: 234,
        activeGames: 48,
        tokensDispensed: 5670,
        partyBookings: 8,
        topGames: ['Racing Simulator', 'Air Hockey', 'Claw Machine'],
        dailyRevenue: 4520
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">${title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🎮" label="Active Games" value={stats?.activeGames} color="purple" />
        <StatCard icon="👥" label="Today's Visitors" value={stats?.dailyVisitors} color="blue" />
        <StatCard icon="🪙" label="Tokens Dispensed" value={stats?.tokensDispensed} color="yellow" />
        <StatCard icon="🎉" label="Party Bookings" value={stats?.partyBookings} color="pink" />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-2">Top Games Today</h3>
        <ul className="space-y-2">
          {stats?.topGames.map((game, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span>{game}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value?: number; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    pink: 'bg-pink-100 text-pink-800'
  };
  return (
    <div className={\`\${colors[color]} rounded-lg p-4\`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}`;
}

// Bakery Stats
export function generateBakeryStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface BakeryStatsData {
  todaysOrders: number;
  itemsBaked: number;
  customOrders: number;
  dailySales: number;
  popularItems: { name: string; count: number }[];
}

export default function BakeryStats() {
  const [stats, setStats] = useState<BakeryStatsData | null>(null);

  useEffect(() => {
    setStats({
      todaysOrders: 45,
      itemsBaked: 320,
      customOrders: 8,
      dailySales: 2840,
      popularItems: [
        { name: 'Croissants', count: 48 },
        { name: 'Sourdough Loaf', count: 35 },
        { name: 'Chocolate Cake', count: 12 }
      ]
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bakery Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-100 rounded-lg p-4">
          <span className="text-2xl">🥐</span>
          <div className="text-2xl font-bold mt-2">{stats?.todaysOrders}</div>
          <div className="text-sm text-amber-800">Today's Orders</div>
        </div>
        <div className="bg-orange-100 rounded-lg p-4">
          <span className="text-2xl">🍞</span>
          <div className="text-2xl font-bold mt-2">{stats?.itemsBaked}</div>
          <div className="text-sm text-orange-800">Items Baked</div>
        </div>
        <div className="bg-pink-100 rounded-lg p-4">
          <span className="text-2xl">🎂</span>
          <div className="text-2xl font-bold mt-2">{stats?.customOrders}</div>
          <div className="text-sm text-pink-800">Custom Orders</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <span className="text-2xl">💰</span>
          <div className="text-2xl font-bold mt-2">\${stats?.dailySales}</div>
          <div className="text-sm text-green-800">Daily Sales</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-3">Popular Items Today</h3>
        <div className="space-y-2">
          {stats?.popularItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{item.name}</span>
              <span className="font-semibold">{item.count} sold</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

// Brewery Stats
export function generateBreweryStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface BreweryStatsData {
  activeBatches: number;
  beerOnTap: number;
  taproomVisitors: number;
  weeklyProduction: number;
  upcomingTours: number;
}

export default function BreweryStats() {
  const [stats, setStats] = useState<BreweryStatsData | null>(null);

  useEffect(() => {
    setStats({
      activeBatches: 6,
      beerOnTap: 12,
      taproomVisitors: 89,
      weeklyProduction: 450,
      upcomingTours: 3
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Brewery Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-amber-100 rounded-lg p-4 text-center">
          <span className="text-3xl">🍺</span>
          <div className="text-2xl font-bold mt-2">{stats?.activeBatches}</div>
          <div className="text-sm text-amber-800">Active Batches</div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <span className="text-3xl">🍻</span>
          <div className="text-2xl font-bold mt-2">{stats?.beerOnTap}</div>
          <div className="text-sm text-yellow-800">Beers on Tap</div>
        </div>
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <span className="text-3xl">👥</span>
          <div className="text-2xl font-bold mt-2">{stats?.taproomVisitors}</div>
          <div className="text-sm text-blue-800">Taproom Visitors</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <span className="text-3xl">🛢️</span>
          <div className="text-2xl font-bold mt-2">{stats?.weeklyProduction}L</div>
          <div className="text-sm text-green-800">Weekly Production</div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <span className="text-3xl">🎫</span>
          <div className="text-2xl font-bold mt-2">{stats?.upcomingTours}</div>
          <div className="text-sm text-purple-800">Upcoming Tours</div>
        </div>
      </div>
    </div>
  );
}`;
}

// Catering Stats
export function generateCateringStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function CateringStats() {
  const [stats, setStats] = useState({
    upcomingEvents: 8,
    thisWeekEvents: 3,
    pendingQuotes: 5,
    monthlyRevenue: 45000,
    staffOnDuty: 12
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Catering Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📅', label: 'Upcoming Events', value: stats.upcomingEvents, color: 'bg-blue-100' },
          { icon: '📋', label: 'This Week', value: stats.thisWeekEvents, color: 'bg-green-100' },
          { icon: '💬', label: 'Pending Quotes', value: stats.pendingQuotes, color: 'bg-yellow-100' },
          { icon: '💰', label: 'Monthly Revenue', value: \`$\${stats.monthlyRevenue.toLocaleString()}\`, color: 'bg-purple-100' },
          { icon: '👨‍🍳', label: 'Staff on Duty', value: stats.staffOnDuty, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Cinema Stats
export function generateCinemaStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function CinemaStats() {
  const [stats, setStats] = useState({
    todayScreenings: 24,
    ticketsSold: 456,
    occupancyRate: 72,
    nowShowing: 8,
    concessionSales: 3200
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Cinema Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🎬', label: 'Today\\'s Screenings', value: stats.todayScreenings, color: 'bg-red-100 text-red-800' },
          { icon: '🎟️', label: 'Tickets Sold', value: stats.ticketsSold, color: 'bg-blue-100 text-blue-800' },
          { icon: '📊', label: 'Occupancy Rate', value: \`\${stats.occupancyRate}%\`, color: 'bg-green-100 text-green-800' },
          { icon: '🎥', label: 'Now Showing', value: stats.nowShowing, color: 'bg-purple-100 text-purple-800' },
          { icon: '🍿', label: 'Concession Sales', value: \`$\${stats.concessionSales}\`, color: 'bg-yellow-100 text-yellow-800' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Consulting Stats
export function generateConsultingStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function ConsultingStats() {
  const [stats, setStats] = useState({
    activeProjects: 12,
    activeClients: 8,
    billableHours: 156,
    monthlyRevenue: 85000,
    utilization: 85
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Consulting Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📁', label: 'Active Projects', value: stats.activeProjects, color: 'bg-blue-100' },
          { icon: '👥', label: 'Active Clients', value: stats.activeClients, color: 'bg-green-100' },
          { icon: '⏱️', label: 'Billable Hours', value: stats.billableHours, color: 'bg-purple-100' },
          { icon: '💰', label: 'Monthly Revenue', value: \`$\${stats.monthlyRevenue.toLocaleString()}\`, color: 'bg-yellow-100' },
          { icon: '📈', label: 'Utilization', value: \`\${stats.utilization}%\`, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// CrossFit Stats
export function generateCrossfitStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function CrossfitStats() {
  const [stats, setStats] = useState({
    todayAttendance: 45,
    activeMembers: 180,
    todayWOD: 'AMRAP 20',
    personalRecords: 12,
    upcomingCompetitions: 2
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">CrossFit Box Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '💪', label: 'Today\\'s Attendance', value: stats.todayAttendance, color: 'bg-red-100' },
          { icon: '👥', label: 'Active Members', value: stats.activeMembers, color: 'bg-blue-100' },
          { icon: '🏋️', label: 'Today\\'s WOD', value: stats.todayWOD, color: 'bg-orange-100' },
          { icon: '🏆', label: 'PRs This Week', value: stats.personalRecords, color: 'bg-yellow-100' },
          { icon: '🎯', label: 'Competitions', value: stats.upcomingCompetitions, color: 'bg-purple-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Dance Studio Stats
export function generateDanceStudioStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function DanceStudioStats() {
  const [stats, setStats] = useState({
    todayClasses: 8,
    activeStudents: 145,
    instructors: 6,
    upcomingRecitals: 2,
    monthlyEnrollments: 18
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dance Studio Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '💃', label: 'Today\\'s Classes', value: stats.todayClasses, color: 'bg-pink-100' },
          { icon: '👯', label: 'Active Students', value: stats.activeStudents, color: 'bg-purple-100' },
          { icon: '👩‍🏫', label: 'Instructors', value: stats.instructors, color: 'bg-blue-100' },
          { icon: '🎭', label: 'Upcoming Recitals', value: stats.upcomingRecitals, color: 'bg-yellow-100' },
          { icon: '📝', label: 'New Enrollments', value: stats.monthlyEnrollments, color: 'bg-green-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Dental Stats
export function generateDentalStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function DentalStats() {
  const [stats, setStats] = useState({
    todayAppointments: 18,
    activePatients: 450,
    pendingTreatments: 23,
    monthlyRevenue: 65000,
    waitingRoom: 3
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dental Practice Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🦷', label: 'Today\\'s Appointments', value: stats.todayAppointments, color: 'bg-blue-100' },
          { icon: '👥', label: 'Active Patients', value: stats.activePatients, color: 'bg-green-100' },
          { icon: '📋', label: 'Pending Treatments', value: stats.pendingTreatments, color: 'bg-yellow-100' },
          { icon: '💰', label: 'Monthly Revenue', value: \`$\${stats.monthlyRevenue.toLocaleString()}\`, color: 'bg-purple-100' },
          { icon: '⏳', label: 'In Waiting Room', value: stats.waitingRoom, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Escape Room Stats
export function generateEscapeRoomStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function EscapeRoomStats() {
  const [stats, setStats] = useState({
    todayBookings: 12,
    activeRooms: 4,
    escapeRate: 68,
    avgCompletionTime: 52,
    upcomingGroups: 5
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Escape Room Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🔐', label: 'Today\\'s Bookings', value: stats.todayBookings, color: 'bg-purple-100' },
          { icon: '🚪', label: 'Active Rooms', value: stats.activeRooms, color: 'bg-blue-100' },
          { icon: '🏆', label: 'Escape Rate', value: \`\${stats.escapeRate}%\`, color: 'bg-green-100' },
          { icon: '⏱️', label: 'Avg Time (min)', value: stats.avgCompletionTime, color: 'bg-yellow-100' },
          { icon: '👥', label: 'Upcoming Groups', value: stats.upcomingGroups, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Florist Stats
export function generateFloristStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function FloristStats() {
  const [stats, setStats] = useState({
    todayOrders: 24,
    pendingDeliveries: 8,
    arrangementsComplete: 18,
    dailyRevenue: 2450,
    lowStockItems: 5
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Florist Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '💐', label: 'Today\\'s Orders', value: stats.todayOrders, color: 'bg-pink-100' },
          { icon: '🚚', label: 'Pending Deliveries', value: stats.pendingDeliveries, color: 'bg-blue-100' },
          { icon: '✓', label: 'Arrangements Done', value: stats.arrangementsComplete, color: 'bg-green-100' },
          { icon: '💰', label: 'Daily Revenue', value: \`$\${stats.dailyRevenue}\`, color: 'bg-yellow-100' },
          { icon: '⚠️', label: 'Low Stock Items', value: stats.lowStockItems, color: 'bg-red-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Food Truck Stats
export function generateFoodtruckStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function FoodtruckStats() {
  const [stats, setStats] = useState({
    todayOrders: 86,
    avgWaitTime: 8,
    dailyRevenue: 1850,
    itemsSold: 142,
    currentLocation: 'Downtown'
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Food Truck Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🚚', label: 'Today\\'s Orders', value: stats.todayOrders, color: 'bg-orange-100' },
          { icon: '⏱️', label: 'Avg Wait (min)', value: stats.avgWaitTime, color: 'bg-blue-100' },
          { icon: '💰', label: 'Daily Revenue', value: \`$\${stats.dailyRevenue}\`, color: 'bg-green-100' },
          { icon: '🍔', label: 'Items Sold', value: stats.itemsSold, color: 'bg-yellow-100' },
          { icon: '📍', label: 'Location', value: stats.currentLocation, color: 'bg-purple-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Freelance Stats
export function generateFreelanceStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function FreelanceStats() {
  const [stats, setStats] = useState({
    activeProjects: 5,
    pendingProposals: 3,
    monthlyEarnings: 8500,
    hoursThisWeek: 32,
    completedProjects: 47
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Freelance Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📁', label: 'Active Projects', value: stats.activeProjects, color: 'bg-blue-100' },
          { icon: '📝', label: 'Pending Proposals', value: stats.pendingProposals, color: 'bg-yellow-100' },
          { icon: '💰', label: 'Monthly Earnings', value: \`$\${stats.monthlyEarnings.toLocaleString()}\`, color: 'bg-green-100' },
          { icon: '⏱️', label: 'Hours This Week', value: stats.hoursThisWeek, color: 'bg-purple-100' },
          { icon: '✓', label: 'Completed', value: stats.completedProjects, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Jeweler Stats
export function generateJewelerStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function JewelerStats() {
  const [stats, setStats] = useState({
    pendingRepairs: 12,
    customOrders: 5,
    inventoryValue: 125000,
    dailySales: 4500,
    appraisalsScheduled: 3
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Jewelry Store Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '💎', label: 'Pending Repairs', value: stats.pendingRepairs, color: 'bg-purple-100' },
          { icon: '✨', label: 'Custom Orders', value: stats.customOrders, color: 'bg-pink-100' },
          { icon: '📦', label: 'Inventory Value', value: \`$\${stats.inventoryValue.toLocaleString()}\`, color: 'bg-blue-100' },
          { icon: '💰', label: 'Daily Sales', value: \`$\${stats.dailySales}\`, color: 'bg-green-100' },
          { icon: '📋', label: 'Appraisals', value: stats.appraisalsScheduled, color: 'bg-yellow-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Library Stats
export function generateLibraryStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function LibraryStats() {
  const [stats, setStats] = useState({
    booksCheckedOut: 234,
    activeMembers: 1250,
    overdueItems: 45,
    newArrivals: 28,
    eventsThisWeek: 5
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Library Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📚', label: 'Checked Out', value: stats.booksCheckedOut, color: 'bg-blue-100' },
          { icon: '👥', label: 'Active Members', value: stats.activeMembers, color: 'bg-green-100' },
          { icon: '⏰', label: 'Overdue Items', value: stats.overdueItems, color: 'bg-red-100' },
          { icon: '📖', label: 'New Arrivals', value: stats.newArrivals, color: 'bg-purple-100' },
          { icon: '📅', label: 'Events This Week', value: stats.eventsThisWeek, color: 'bg-yellow-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Lot Stats (Parking/Auto)
export function generateLotStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function LotStats() {
  const [stats, setStats] = useState({
    totalSpaces: 200,
    occupied: 156,
    available: 44,
    dailyRevenue: 2840,
    monthlyPassholders: 85
  });

  const occupancyRate = Math.round((stats.occupied / stats.totalSpaces) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parking Lot Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🅿️', label: 'Total Spaces', value: stats.totalSpaces, color: 'bg-gray-100' },
          { icon: '🚗', label: 'Occupied', value: stats.occupied, color: 'bg-red-100' },
          { icon: '✓', label: 'Available', value: stats.available, color: 'bg-green-100' },
          { icon: '💰', label: 'Daily Revenue', value: \`$\${stats.dailyRevenue}\`, color: 'bg-yellow-100' },
          { icon: '📊', label: 'Occupancy', value: \`\${occupancyRate}%\`, color: 'bg-blue-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Marketing Stats
export function generateMarketingStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function MarketingStats() {
  const [stats, setStats] = useState({
    activeCampaigns: 8,
    totalReach: 125000,
    conversionRate: 3.2,
    monthlySpend: 15000,
    leadsGenerated: 450
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Marketing Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📢', label: 'Active Campaigns', value: stats.activeCampaigns, color: 'bg-blue-100' },
          { icon: '👁️', label: 'Total Reach', value: \`\${(stats.totalReach / 1000).toFixed(0)}K\`, color: 'bg-green-100' },
          { icon: '📈', label: 'Conversion Rate', value: \`\${stats.conversionRate}%\`, color: 'bg-purple-100' },
          { icon: '💰', label: 'Monthly Spend', value: \`$\${stats.monthlySpend.toLocaleString()}\`, color: 'bg-yellow-100' },
          { icon: '🎯', label: 'Leads Generated', value: stats.leadsGenerated, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Membership Stats
export function generateMembershipStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function MembershipStats() {
  const [stats, setStats] = useState({
    totalMembers: 1250,
    activeMembers: 980,
    newThisMonth: 45,
    renewalsDue: 23,
    churnRate: 2.5
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Membership Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '👥', label: 'Total Members', value: stats.totalMembers, color: 'bg-blue-100' },
          { icon: '✓', label: 'Active', value: stats.activeMembers, color: 'bg-green-100' },
          { icon: '🆕', label: 'New This Month', value: stats.newThisMonth, color: 'bg-purple-100' },
          { icon: '🔄', label: 'Renewals Due', value: stats.renewalsDue, color: 'bg-yellow-100' },
          { icon: '📉', label: 'Churn Rate', value: \`\${stats.churnRate}%\`, color: 'bg-red-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Nursery Stats (Plant)
export function generateNurseryStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function NurseryStats() {
  const [stats, setStats] = useState({
    plantsInStock: 2450,
    todaySales: 45,
    lowStockItems: 12,
    dailyRevenue: 1850,
    specialOrders: 8
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Plant Nursery Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🌱', label: 'Plants in Stock', value: stats.plantsInStock, color: 'bg-green-100' },
          { icon: '🛒', label: 'Today\\'s Sales', value: stats.todaySales, color: 'bg-blue-100' },
          { icon: '⚠️', label: 'Low Stock', value: stats.lowStockItems, color: 'bg-yellow-100' },
          { icon: '💰', label: 'Daily Revenue', value: \`$\${stats.dailyRevenue}\`, color: 'bg-purple-100' },
          { icon: '📦', label: 'Special Orders', value: stats.specialOrders, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Optician Stats
export function generateOpticianStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function OpticianStats() {
  const [stats, setStats] = useState({
    todayAppointments: 12,
    pendingOrders: 18,
    examsCompleted: 8,
    glassesReady: 15,
    dailyRevenue: 3200
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Optician Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '👓', label: 'Appointments', value: stats.todayAppointments, color: 'bg-blue-100' },
          { icon: '📦', label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-yellow-100' },
          { icon: '👁️', label: 'Exams Done', value: stats.examsCompleted, color: 'bg-green-100' },
          { icon: '✓', label: 'Glasses Ready', value: stats.glassesReady, color: 'bg-purple-100' },
          { icon: '💰', label: 'Daily Revenue', value: \`$\${stats.dailyRevenue}\`, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Pharmacy Stats
export function generatePharmacyStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function PharmacyStats() {
  const [stats, setStats] = useState({
    prescriptionsPending: 28,
    prescriptionsReady: 45,
    lowStockMeds: 12,
    dailyPrescriptions: 156,
    consultationsToday: 8
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pharmacy Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '💊', label: 'Pending', value: stats.prescriptionsPending, color: 'bg-yellow-100' },
          { icon: '✓', label: 'Ready for Pickup', value: stats.prescriptionsReady, color: 'bg-green-100' },
          { icon: '⚠️', label: 'Low Stock Meds', value: stats.lowStockMeds, color: 'bg-red-100' },
          { icon: '📋', label: 'Daily Scripts', value: stats.dailyPrescriptions, color: 'bg-blue-100' },
          { icon: '👨‍⚕️', label: 'Consultations', value: stats.consultationsToday, color: 'bg-purple-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Rehab Stats
export function generateRehabStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function RehabStats() {
  const [stats, setStats] = useState({
    activePatients: 45,
    todaySessions: 32,
    therapists: 8,
    avgProgressScore: 78,
    dischargesThisWeek: 5
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Rehabilitation Center Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🏥', label: 'Active Patients', value: stats.activePatients, color: 'bg-blue-100' },
          { icon: '📅', label: 'Today\\'s Sessions', value: stats.todaySessions, color: 'bg-green-100' },
          { icon: '👨‍⚕️', label: 'Therapists', value: stats.therapists, color: 'bg-purple-100' },
          { icon: '📈', label: 'Avg Progress', value: \`\${stats.avgProgressScore}%\`, color: 'bg-yellow-100' },
          { icon: '🏠', label: 'Discharges', value: stats.dischargesThisWeek, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Rental Stats (Equipment/Vehicle)
export function generateRentalStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function RentalStats() {
  const [stats, setStats] = useState({
    totalItems: 250,
    currentlyRented: 85,
    available: 165,
    reservations: 23,
    overdueReturns: 5
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Rental Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📦', label: 'Total Items', value: stats.totalItems, color: 'bg-gray-100' },
          { icon: '🔒', label: 'Currently Rented', value: stats.currentlyRented, color: 'bg-blue-100' },
          { icon: '✓', label: 'Available', value: stats.available, color: 'bg-green-100' },
          { icon: '📅', label: 'Reservations', value: stats.reservations, color: 'bg-purple-100' },
          { icon: '⚠️', label: 'Overdue', value: stats.overdueReturns, color: 'bg-red-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Security Stats
export function generateSecurityStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function SecurityStats() {
  const [stats, setStats] = useState({
    guardsOnDuty: 24,
    activeSites: 12,
    incidentsToday: 2,
    upcomingShifts: 18,
    alertsOpen: 3
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Security Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '👮', label: 'Guards on Duty', value: stats.guardsOnDuty, color: 'bg-blue-100' },
          { icon: '📍', label: 'Active Sites', value: stats.activeSites, color: 'bg-green-100' },
          { icon: '⚠️', label: 'Incidents Today', value: stats.incidentsToday, color: 'bg-red-100' },
          { icon: '📅', label: 'Upcoming Shifts', value: stats.upcomingShifts, color: 'bg-purple-100' },
          { icon: '🔔', label: 'Open Alerts', value: stats.alertsOpen, color: 'bg-yellow-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Senior Stats (Senior Living/Care)
export function generateSeniorStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function SeniorStats() {
  const [stats, setStats] = useState({
    residents: 85,
    staffOnDuty: 24,
    activitiesScheduled: 8,
    mealsToday: 255,
    medicationsDue: 42
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Senior Living Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🏠', label: 'Residents', value: stats.residents, color: 'bg-blue-100' },
          { icon: '👨‍⚕️', label: 'Staff on Duty', value: stats.staffOnDuty, color: 'bg-green-100' },
          { icon: '📅', label: 'Activities', value: stats.activitiesScheduled, color: 'bg-purple-100' },
          { icon: '🍽️', label: 'Meals Today', value: stats.mealsToday, color: 'bg-yellow-100' },
          { icon: '💊', label: 'Medications Due', value: stats.medicationsDue, color: 'bg-red-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Ski Resort Stats
export function generateSkiResortStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function SkiResortStats() {
  const [stats, setStats] = useState({
    liftsOpen: 12,
    trailsOpen: 45,
    snowDepth: 48,
    dailyVisitors: 2340,
    temperature: 28
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Ski Resort Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🚡', label: 'Lifts Open', value: \`\${stats.liftsOpen}/14\`, color: 'bg-blue-100' },
          { icon: '⛷️', label: 'Trails Open', value: \`\${stats.trailsOpen}/52\`, color: 'bg-green-100' },
          { icon: '❄️', label: 'Snow Depth', value: \`\${stats.snowDepth}"\`, color: 'bg-cyan-100' },
          { icon: '👥', label: 'Visitors Today', value: stats.dailyVisitors, color: 'bg-purple-100' },
          { icon: '🌡️', label: 'Temperature', value: \`\${stats.temperature}°F\`, color: 'bg-yellow-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Ticket Stats (Support/Events)
export function generateTicketStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function TicketStats() {
  const [stats, setStats] = useState({
    openTickets: 45,
    resolvedToday: 28,
    avgResponseTime: 2.4,
    pendingEscalation: 5,
    customerSatisfaction: 94
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Ticket Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🎫', label: 'Open Tickets', value: stats.openTickets, color: 'bg-blue-100' },
          { icon: '✓', label: 'Resolved Today', value: stats.resolvedToday, color: 'bg-green-100' },
          { icon: '⏱️', label: 'Avg Response (hrs)', value: stats.avgResponseTime, color: 'bg-yellow-100' },
          { icon: '⚠️', label: 'Pending Escalation', value: stats.pendingEscalation, color: 'bg-red-100' },
          { icon: '😊', label: 'Satisfaction', value: \`\${stats.customerSatisfaction}%\`, color: 'bg-purple-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Travel Agency Stats
export function generateTravelagencyStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function TravelagencyStats() {
  const [stats, setStats] = useState({
    activeBookings: 34,
    pendingQuotes: 12,
    monthlyRevenue: 85000,
    upcomingTrips: 28,
    newInquiries: 8
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Travel Agency Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '✈️', label: 'Active Bookings', value: stats.activeBookings, color: 'bg-blue-100' },
          { icon: '📝', label: 'Pending Quotes', value: stats.pendingQuotes, color: 'bg-yellow-100' },
          { icon: '💰', label: 'Monthly Revenue', value: \`$\${stats.monthlyRevenue.toLocaleString()}\`, color: 'bg-green-100' },
          { icon: '🗓️', label: 'Upcoming Trips', value: stats.upcomingTrips, color: 'bg-purple-100' },
          { icon: '📨', label: 'New Inquiries', value: stats.newInquiries, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Vet Clinic Stats
export function generateVetClinicStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function VetClinicStats() {
  const [stats, setStats] = useState({
    todayAppointments: 24,
    patientsWaiting: 4,
    emergencies: 1,
    surgeries: 3,
    boardingPets: 8
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Veterinary Clinic Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🐾', label: 'Appointments', value: stats.todayAppointments, color: 'bg-blue-100' },
          { icon: '⏳', label: 'Waiting', value: stats.patientsWaiting, color: 'bg-yellow-100' },
          { icon: '🚨', label: 'Emergencies', value: stats.emergencies, color: 'bg-red-100' },
          { icon: '💉', label: 'Surgeries Today', value: stats.surgeries, color: 'bg-purple-100' },
          { icon: '🏠', label: 'Boarding', value: stats.boardingPets, color: 'bg-green-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Yoga Stats
export function generateYogaStats(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function YogaStats() {
  const [stats, setStats] = useState({
    todayClasses: 8,
    activeMembers: 245,
    instructors: 6,
    avgAttendance: 18,
    workshopsScheduled: 2
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Yoga Studio Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🧘', label: 'Today\\'s Classes', value: stats.todayClasses, color: 'bg-purple-100' },
          { icon: '👥', label: 'Active Members', value: stats.activeMembers, color: 'bg-blue-100' },
          { icon: '👩‍🏫', label: 'Instructors', value: stats.instructors, color: 'bg-green-100' },
          { icon: '📊', label: 'Avg Attendance', value: stats.avgAttendance, color: 'bg-yellow-100' },
          { icon: '📅', label: 'Workshops', value: stats.workshopsScheduled, color: 'bg-pink-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Billing Stats Dental
export function generateBillingStatsDental(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function BillingStatsDental() {
  const [stats, setStats] = useState({
    todayCharges: 8500,
    pendingClaims: 23,
    paymentsReceived: 6200,
    insuranceOutstanding: 12400,
    patientBalance: 3800
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dental Billing Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '💵', label: 'Today\\'s Charges', value: \`$\${stats.todayCharges.toLocaleString()}\`, color: 'bg-blue-100' },
          { icon: '📋', label: 'Pending Claims', value: stats.pendingClaims, color: 'bg-yellow-100' },
          { icon: '✓', label: 'Payments Received', value: \`$\${stats.paymentsReceived.toLocaleString()}\`, color: 'bg-green-100' },
          { icon: '🏥', label: 'Insurance Outstanding', value: \`$\${stats.insuranceOutstanding.toLocaleString()}\`, color: 'bg-purple-100' },
          { icon: '👤', label: 'Patient Balance', value: \`$\${stats.patientBalance.toLocaleString()}\`, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Billing Stats Vet
export function generateBillingStatsVet(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function BillingStatsVet() {
  const [stats, setStats] = useState({
    todayCharges: 5200,
    paymentsReceived: 4800,
    outstandingBalance: 8500,
    petInsuranceClaims: 12,
    paymentPlans: 8
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Veterinary Billing Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '💵', label: 'Today\\'s Charges', value: \`$\${stats.todayCharges.toLocaleString()}\`, color: 'bg-blue-100' },
          { icon: '✓', label: 'Payments Received', value: \`$\${stats.paymentsReceived.toLocaleString()}\`, color: 'bg-green-100' },
          { icon: '⏳', label: 'Outstanding', value: \`$\${stats.outstandingBalance.toLocaleString()}\`, color: 'bg-yellow-100' },
          { icon: '🐾', label: 'Insurance Claims', value: stats.petInsuranceClaims, color: 'bg-purple-100' },
          { icon: '📋', label: 'Payment Plans', value: stats.paymentPlans, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Invoice Stats Consulting
export function generateInvoiceStatsConsulting(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function InvoiceStatsConsulting() {
  const [stats, setStats] = useState({
    invoicedThisMonth: 125000,
    paidThisMonth: 98000,
    outstanding: 45000,
    overdueInvoices: 5,
    avgPaymentDays: 28
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Consulting Invoice Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📄', label: 'Invoiced (Month)', value: \`$\${stats.invoicedThisMonth.toLocaleString()}\`, color: 'bg-blue-100' },
          { icon: '✓', label: 'Paid (Month)', value: \`$\${stats.paidThisMonth.toLocaleString()}\`, color: 'bg-green-100' },
          { icon: '⏳', label: 'Outstanding', value: \`$\${stats.outstanding.toLocaleString()}\`, color: 'bg-yellow-100' },
          { icon: '⚠️', label: 'Overdue', value: stats.overdueInvoices, color: 'bg-red-100' },
          { icon: '📊', label: 'Avg Payment Days', value: stats.avgPaymentDays, color: 'bg-purple-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Stats Section (Generic)
export function generateStatsSection(options: BusinessStatsOptions = {}): string {
  return `import React from 'react';

interface Stat {
  label: string;
  value: string | number;
  icon?: string;
  change?: number;
}

interface StatsSectionProps {
  title?: string;
  stats?: Stat[];
}

export default function StatsSection({ title = 'Overview', stats }: StatsSectionProps) {
  const defaultStats: Stat[] = stats || [
    { label: 'Total Users', value: '12,345', icon: '👥', change: 12 },
    { label: 'Revenue', value: '$45,678', icon: '💰', change: 8 },
    { label: 'Orders', value: '1,234', icon: '📦', change: -3 },
    { label: 'Conversion', value: '3.2%', icon: '📈', change: 5 }
  ];

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {defaultStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              {stat.change !== undefined && (
                <span className={\`text-sm \${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Sales Stats Gallery
export function generateSalesStatsGalleryComponent(options: BusinessStatsOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function SalesStatsGallery() {
  const [stats, setStats] = useState({
    totalSales: 45,
    totalRevenue: 125000,
    avgSalePrice: 2780,
    pendingInquiries: 12,
    exhibitionsActive: 3
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gallery Sales Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '🖼️', label: 'Total Sales', value: stats.totalSales, color: 'bg-blue-100' },
          { icon: '💰', label: 'Revenue', value: \`$\${stats.totalRevenue.toLocaleString()}\`, color: 'bg-green-100' },
          { icon: '📊', label: 'Avg Sale Price', value: \`$\${stats.avgSalePrice.toLocaleString()}\`, color: 'bg-purple-100' },
          { icon: '📝', label: 'Inquiries', value: stats.pendingInquiries, color: 'bg-yellow-100' },
          { icon: '🎨', label: 'Exhibitions', value: stats.exhibitionsActive, color: 'bg-pink-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4 text-center\`}>
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}
