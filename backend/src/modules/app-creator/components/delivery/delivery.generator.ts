/**
 * Delivery Component Generators
 */

export interface DeliveryOptions {
  title?: string;
  entityType?: string;
}

// Delivery List for Florist
export function generateDeliveryListFlorist(options: DeliveryOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface FloristDelivery {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  phone: string;
  arrangement: string;
  deliveryWindow: string;
  driver: string;
  status: 'pending' | 'out-for-delivery' | 'delivered' | 'failed';
  specialInstructions?: string;
}

export default function DeliveryListFlorist() {
  const [deliveries, setDeliveries] = useState<FloristDelivery[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setDeliveries([
      { id: '1', orderNumber: 'FL-001', customerName: 'Sarah Johnson', address: '123 Main St', phone: '555-0101', arrangement: 'Anniversary Bouquet', deliveryWindow: '9:00 AM - 11:00 AM', driver: 'Mike', status: 'delivered' },
      { id: '2', orderNumber: 'FL-002', customerName: 'Emily Davis', address: '456 Oak Ave', phone: '555-0102', arrangement: 'Birthday Roses', deliveryWindow: '11:00 AM - 1:00 PM', driver: 'Mike', status: 'out-for-delivery' },
      { id: '3', orderNumber: 'FL-003', customerName: 'John Smith', address: '789 Pine Rd', phone: '555-0103', arrangement: 'Sympathy Wreath', deliveryWindow: '1:00 PM - 3:00 PM', driver: 'Lisa', status: 'pending', specialInstructions: 'Leave at front door' },
      { id: '4', orderNumber: 'FL-004', customerName: 'Maria Garcia', address: '321 Elm St', phone: '555-0104', arrangement: 'Wedding Centerpieces (5)', deliveryWindow: '2:00 PM - 4:00 PM', driver: 'Lisa', status: 'pending' }
    ]);
  }, []);

  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'out-for-delivery': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800'
  };

  const filteredDeliveries = filter === 'all'
    ? deliveries
    : deliveries.filter(d => d.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today's Deliveries</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'out-for-delivery', 'delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={\`px-3 py-1 rounded-full text-sm \${filter === status ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}\`}
            >
              {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-gray-500">{delivery.orderNumber}</span>
                  <span className={\`px-2 py-0.5 rounded-full text-xs \${statusColors[delivery.status]}\`}>
                    {delivery.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
                <div className="font-semibold">{delivery.arrangement}</div>
                <div className="text-gray-600">{delivery.customerName}</div>
                <div className="text-sm text-gray-500">{delivery.address}</div>
                <div className="text-sm text-gray-500">{delivery.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{delivery.deliveryWindow}</div>
                <div className="text-sm text-gray-500">Driver: {delivery.driver}</div>
              </div>
            </div>
            {delivery.specialInstructions && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                ⚠️ {delivery.specialInstructions}
              </div>
            )}
            {delivery.status === 'pending' && (
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Mark Out for Delivery</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Generic Delivery Schedule
export function generateDeliveryScheduleGeneric(options: DeliveryOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface ScheduledDelivery {
  id: string;
  orderNumber: string;
  customer: string;
  address: string;
  scheduledTime: string;
  driver: string;
  items: number;
  status: 'scheduled' | 'in-transit' | 'delivered';
}

export default function DeliverySchedule() {
  const [deliveries, setDeliveries] = useState<ScheduledDelivery[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setDeliveries([
      { id: '1', orderNumber: 'DEL-001', customer: 'ABC Company', address: '100 Business Park', scheduledTime: '09:00', driver: 'John', items: 5, status: 'delivered' },
      { id: '2', orderNumber: 'DEL-002', customer: 'XYZ Corp', address: '200 Commerce Ave', scheduledTime: '10:30', driver: 'John', items: 3, status: 'in-transit' },
      { id: '3', orderNumber: 'DEL-003', customer: 'Smith Residence', address: '300 Oak Lane', scheduledTime: '13:00', driver: 'Sarah', items: 2, status: 'scheduled' },
      { id: '4', orderNumber: 'DEL-004', customer: 'Downtown Office', address: '400 Main St', scheduledTime: '14:30', driver: 'Sarah', items: 8, status: 'scheduled' },
      { id: '5', orderNumber: 'DEL-005', customer: 'Tech Hub', address: '500 Innovation Way', scheduledTime: '16:00', driver: 'Mike', items: 1, status: 'scheduled' }
    ]);
  }, [selectedDate]);

  const statusColors: Record<string, string> = {
    'scheduled': 'bg-gray-100 text-gray-800',
    'in-transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800'
  };

  const groupedByDriver = deliveries.reduce((acc, del) => {
    if (!acc[del.driver]) acc[del.driver] = [];
    acc[del.driver].push(del);
    return acc;
  }, {} as Record<string, ScheduledDelivery[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Delivery Schedule</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {Object.entries(groupedByDriver).map(([driver, driverDeliveries]) => (
        <div key={driver} className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm">
              {driver.charAt(0)}
            </span>
            {driver}'s Route
            <span className="text-sm font-normal text-gray-500">({driverDeliveries.length} stops)</span>
          </h3>
          <div className="space-y-2">
            {driverDeliveries.map((delivery, i) => (
              <div key={delivery.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-300 w-8">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{delivery.scheduledTime}</span>
                    <span className={\`px-2 py-0.5 rounded-full text-xs \${statusColors[delivery.status]}\`}>
                      {delivery.status}
                    </span>
                  </div>
                  <div className="text-gray-600">{delivery.customer}</div>
                  <div className="text-sm text-gray-500">{delivery.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{delivery.items} items</div>
                  <div className="font-mono text-xs text-gray-400">{delivery.orderNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

// Delivery Schedule for Florist
export function generateDeliveryScheduleFlorist(options: DeliveryOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface FloristScheduledDelivery {
  id: string;
  orderNumber: string;
  customer: string;
  address: string;
  phone: string;
  arrangement: string;
  occasion?: string;
  scheduledTime: string;
  driver: string;
  status: 'pending' | 'out-for-delivery' | 'delivered';
}

export default function DeliveryScheduleFlorist() {
  const [deliveries, setDeliveries] = useState<FloristScheduledDelivery[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setDeliveries([
      { id: '1', orderNumber: 'FL-001', customer: 'Sarah Johnson', address: '123 Main St', phone: '555-0101', arrangement: 'Anniversary Bouquet', occasion: 'Anniversary', scheduledTime: '09:00', driver: 'Mike', status: 'delivered' },
      { id: '2', orderNumber: 'FL-002', customer: 'Emily Davis', address: '456 Oak Ave', phone: '555-0102', arrangement: 'Birthday Roses (Dozen)', occasion: 'Birthday', scheduledTime: '11:00', driver: 'Mike', status: 'out-for-delivery' },
      { id: '3', orderNumber: 'FL-003', customer: 'Corporate Event', address: '789 Business Blvd', phone: '555-0103', arrangement: 'Table Centerpieces (10)', scheduledTime: '14:00', driver: 'Lisa', status: 'pending' },
      { id: '4', orderNumber: 'FL-004', customer: 'John Smith', address: '321 Pine Rd', phone: '555-0104', arrangement: 'Sympathy Arrangement', scheduledTime: '15:30', driver: 'Lisa', status: 'pending' }
    ]);
  }, [selectedDate]);

  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'out-for-delivery': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800'
  };

  const occasionIcons: Record<string, string> = {
    'Anniversary': '💕',
    'Birthday': '🎂',
    'Wedding': '💒',
    'Sympathy': '🕊️',
    'Get Well': '💐'
  };

  const groupedByDriver = deliveries.reduce((acc, del) => {
    if (!acc[del.driver]) acc[del.driver] = [];
    acc[del.driver].push(del);
    return acc;
  }, {} as Record<string, FloristScheduledDelivery[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🌸 Delivery Schedule</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {Object.entries(groupedByDriver).map(([driver, driverDeliveries]) => (
        <div key={driver} className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-pink-100 text-pink-800 rounded-full flex items-center justify-center text-sm">
              {driver.charAt(0)}
            </span>
            {driver}'s Route
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-200" />
            <div className="space-y-4">
              {driverDeliveries.map((delivery) => (
                <div key={delivery.id} className="relative pl-10">
                  <div className="absolute left-2 w-4 h-4 bg-pink-500 rounded-full border-2 border-white" />
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{delivery.scheduledTime}</span>
                          {delivery.occasion && <span>{occasionIcons[delivery.occasion] || '💐'}</span>}
                          <span className={\`px-2 py-0.5 rounded-full text-xs \${statusColors[delivery.status]}\`}>
                            {delivery.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        </div>
                        <div className="font-semibold mt-1">{delivery.arrangement}</div>
                        <div className="text-gray-600">{delivery.customer}</div>
                        <div className="text-sm text-gray-500">{delivery.address}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-gray-400">{delivery.orderNumber}</div>
                        <div className="text-sm text-gray-500 mt-1">{delivery.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

// Earnings Chart
export function generateEarningsChart(options: DeliveryOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface EarningsData {
  period: string;
  earnings: number;
  orders: number;
  tips: number;
}

export default function EarningsChart() {
  const [data, setData] = useState<EarningsData[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const weekData: EarningsData[] = [
      { period: 'Mon', earnings: 145, orders: 8, tips: 28 },
      { period: 'Tue', earnings: 189, orders: 11, tips: 35 },
      { period: 'Wed', earnings: 156, orders: 9, tips: 30 },
      { period: 'Thu', earnings: 210, orders: 13, tips: 42 },
      { period: 'Fri', earnings: 278, orders: 16, tips: 55 },
      { period: 'Sat', earnings: 325, orders: 19, tips: 68 },
      { period: 'Sun', earnings: 185, orders: 10, tips: 35 }
    ];
    setData(weekData);
  }, [period]);

  const totalEarnings = data.reduce((sum, d) => sum + d.earnings, 0);
  const totalTips = data.reduce((sum, d) => sum + d.tips, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const maxEarnings = Math.max(...data.map(d => d.earnings));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Earnings Overview</h2>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={\`px-3 py-1 rounded-lg text-sm \${period === p ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}\`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-700">\${totalEarnings}</div>
          <div className="text-sm text-green-600">Total Earnings</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-700">\${totalTips}</div>
          <div className="text-sm text-blue-600">Tips</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-700">{totalOrders}</div>
          <div className="text-sm text-purple-600">Orders</div>
        </div>
      </div>

      <div className="flex items-end gap-2 h-48">
        {data.map((d) => (
          <div key={d.period} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col items-center gap-1">
              <div className="text-xs text-gray-500">\${d.earnings}</div>
              <div
                className="w-full bg-green-500 rounded-t"
                style={{ height: \`\${(d.earnings / maxEarnings) * 150}px\` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-2">{d.period}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Earnings Summary
export function generateEarningsSummary(options: DeliveryOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayouts: number;
  nextPayoutDate: string;
}

export default function EarningsSummary() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);

  useEffect(() => {
    setSummary({
      today: 185,
      thisWeek: 1245,
      thisMonth: 4850,
      lastMonth: 5120,
      pendingPayouts: 890,
      nextPayoutDate: '2024-01-20'
    });
  }, []);

  if (!summary) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const monthlyChange = ((summary.thisMonth - summary.lastMonth) / summary.lastMonth * 100).toFixed(1);
  const isPositive = Number(monthlyChange) >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Earnings Summary</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Today</div>
          <div className="text-2xl font-bold">\${summary.today}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-2xl font-bold">\${summary.thisWeek}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">This Month</div>
          <div className="text-2xl font-bold">\${summary.thisMonth}</div>
          <div className={\`text-sm \${isPositive ? 'text-green-600' : 'text-red-600'}\`}>
            {isPositive ? '↑' : '↓'} {Math.abs(Number(monthlyChange))}% vs last month
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Pending Payouts</div>
            <div className="text-xl font-bold text-green-600">\${summary.pendingPayouts}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Next Payout</div>
            <div className="font-medium">{new Date(summary.nextPayoutDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}`;
}
