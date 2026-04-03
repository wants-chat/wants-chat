/**
 * Hotel Management Component Generators
 *
 * Generates components for hotel property management including:
 * - HotelStats, RoomFiltersHotel, RoomCalendar, RoomStatusOverview
 * - GuestProfileHotel, GuestStats, HousekeepingBoard, OccupancyChart
 */

export interface HotelOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateHotelStats(options: HotelOptions = {}): string {
  const { componentName = 'HotelStats', endpoint = '/hotel/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, Users, Bed, DollarSign, TrendingUp, TrendingDown, Loader2, Calendar, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hotel-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch hotel stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: Bed, color: 'blue', format: (v: number) => \`\${v || 0}%\` },
    { key: 'totalGuests', label: 'Active Guests', icon: Users, color: 'green', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'availableRooms', label: 'Available Rooms', icon: Building, color: 'purple', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'todayRevenue', label: "Today's Revenue", icon: DollarSign, color: 'emerald', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'checkInsToday', label: 'Check-ins Today', icon: Calendar, color: 'orange', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'checkOutsToday', label: 'Check-outs Today', icon: Calendar, color: 'red', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'avgRating', label: 'Avg Guest Rating', icon: Star, color: 'yellow', format: (v: number) => v?.toFixed(1) || '0.0' },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: TrendingUp, color: 'indigo', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
  };

  return (
    <div className={\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
      {statItems.slice(0, 8).map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        const value = stats?.[stat.key];
        const change = stats?.[stat.key + 'Change'];

        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-lg \${colors.bg}\`}>
                <Icon className={\`w-6 h-6 \${colors.icon}\`} />
              </div>
              {change !== undefined && (
                <div className={\`flex items-center gap-1 text-sm font-medium \${change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                  {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.format(value)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRoomFiltersHotel(options: HotelOptions = {}): string {
  const { componentName = 'RoomFiltersHotel' } = options;

  return `import React, { useState } from 'react';
import { Filter, Search, Bed, Users, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ${componentName}Props {
  onFilterChange?: (filters: RoomFilters) => void;
  className?: string;
}

interface RoomFilters {
  search: string;
  status: string;
  roomType: string;
  floor: string;
  priceRange: { min: number; max: number };
  capacity: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, className }) => {
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    status: '',
    roomType: '',
    floor: '',
    priceRange: { min: 0, max: 1000 },
    capacity: '',
  });

  const handleChange = (key: keyof RoomFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential', 'Penthouse', 'Family'];
  const statuses = ['available', 'occupied', 'maintenance', 'cleaning', 'reserved'];
  const floors = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const capacities = ['1', '2', '3', '4', '5+'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'occupied': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'maintenance': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Filter Rooms</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Room number, guest name..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Bed className="w-4 h-4 inline mr-1" /> Room Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Type</label>
          <select
            value={filters.roomType}
            onChange={(e) => handleChange('roomType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Floor</label>
          <select
            value={filters.floor}
            onChange={(e) => handleChange('floor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Floors</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>Floor {floor}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 inline mr-1" /> Capacity
          </label>
          <select
            value={filters.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any Capacity</option>
            {capacities.map((cap) => (
              <option key={cap} value={cap}>{cap} {cap === '5+' ? 'or more' : ''} guests</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" /> Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min || ''}
              onChange={(e) => handleChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
              className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max || ''}
              onChange={(e) => handleChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
              className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={() => {
            const resetFilters: RoomFilters = { search: '', status: '', roomType: '', floor: '', priceRange: { min: 0, max: 1000 }, capacity: '' };
            setFilters(resetFilters);
            onFilterChange?.(resetFilters);
          }}
          className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRoomCalendar(options: HotelOptions = {}): string {
  const { componentName = 'RoomCalendar', endpoint = '/hotel/rooms/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Bed, Users, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  roomId?: string;
  onDateSelect?: (date: Date, room?: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ roomId, onDateSelect, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['room-calendar', roomId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(roomId ? { room_id: roomId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch room calendar:', err);
        return [];
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const getBookingsForDate = (date: Date) => {
    return bookings?.filter((booking: any) => {
      const checkIn = new Date(booking.check_in || booking.checkIn || booking.start_date);
      const checkOut = new Date(booking.check_out || booking.checkOut || booking.end_date);
      return date >= checkIn && date <= checkOut;
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bed className="w-5 h-5" />
            Room Availability Calendar
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-gray-900 dark:text-white font-medium min-w-[140px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dayBookings = getBookingsForDate(day.date);
            const hasBookings = dayBookings.length > 0;
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day.date)}
                className={\`
                  min-h-[80px] p-2 rounded-lg cursor-pointer transition-all
                  \${!day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  \${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
                  \${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                  \${hasBookings ? 'bg-red-50 dark:bg-red-900/20' : ''}
                \`}
              >
                <div className={\`text-sm font-medium mb-1 \${isToday(day.date) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}\`}>
                  {day.date.getDate()}
                </div>
                {hasBookings && (
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map((booking: any, i: number) => (
                      <div key={i} className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1 py-0.5 rounded truncate">
                        {booking.room_number || booking.roomNumber || 'Room'}: {booking.guest_name || booking.guestName || 'Guest'}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-blue-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRoomStatusOverview(options: HotelOptions = {}): string {
  const { componentName = 'RoomStatusOverview', endpoint = '/hotel/rooms/status' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bed, CheckCircle, XCircle, Clock, Wrench, Sparkles, Loader2, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  floor?: string;
  onRoomClick?: (room: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ floor, onRoomClick, className }) => {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['room-status', floor],
    queryFn: async () => {
      try {
        const params = floor ? \`?floor=\${floor}\` : '';
        const response = await api.get<any>(\`${endpoint}\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch room status:', err);
        return [];
      }
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; bg: string; text: string; border: string }> = {
      available: { icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-300 dark:border-green-700' },
      occupied: { icon: Users, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-300 dark:border-red-700' },
      reserved: { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700' },
      cleaning: { icon: Sparkles, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
      maintenance: { icon: Wrench, bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-600' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const statusCounts = rooms?.reduce((acc: Record<string, number>, room: any) => {
    const status = room.status?.toLowerCase() || 'available';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(getStatusConfig('')).length > 0 && ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'].map((status) => {
          const config = getStatusConfig(status);
          const Icon = config.icon;
          return (
            <div key={status} className={\`p-4 rounded-lg border \${config.bg} \${config.border}\`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={\`w-5 h-5 \${config.text}\`} />
                <span className={\`font-medium capitalize \${config.text}\`}>{status}</span>
              </div>
              <div className={\`text-2xl font-bold \${config.text}\`}>{statusCounts[status] || 0}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bed className="w-5 h-5" />
          Room Grid
        </h3>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {rooms?.map((room: any) => {
            const config = getStatusConfig(room.status);
            const Icon = config.icon;

            return (
              <div
                key={room.id || room.room_number}
                onClick={() => onRoomClick?.(room)}
                className={\`
                  p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md
                  \${config.bg} \${config.border}
                \`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={\`font-bold \${config.text}\`}>{room.room_number || room.number}</span>
                  <Icon className={\`w-4 h-4 \${config.text}\`} />
                </div>
                <div className={\`text-xs \${config.text}\`}>{room.room_type || room.type || 'Standard'}</div>
                {room.guest_name && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{room.guest_name}</div>
                )}
              </div>
            );
          })}
        </div>

        {(!rooms || rooms.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No rooms found
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateGuestProfileHotel(options: HotelOptions = {}): string {
  const { componentName = 'GuestProfileHotel', endpoint = '/hotel/guests' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Star, CreditCard, ArrowLeft, Edit, Bed, Clock, History } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  guestId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ guestId: propGuestId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const guestId = propGuestId || paramId;

  const { data: guest, isLoading } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${guestId}\`);
      return response?.data || response;
    },
    enabled: !!guestId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Guest not found</p>
      </div>
    );
  }

  return (
    <div className={\`max-w-4xl mx-auto \${className || ''}\`}>
      <div className="mb-6">
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Guests
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                {guest.avatar_url || guest.photo ? (
                  <img src={guest.avatar_url || guest.photo} alt={guest.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {guest.name || \`\${guest.first_name || ''} \${guest.last_name || ''}\`.trim()}
                </h1>
                {guest.vip && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-medium mt-1">
                    <Star className="w-3 h-3" /> VIP Guest
                  </span>
                )}
                {guest.loyalty_tier && (
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">{guest.loyalty_tier}</span>
                )}
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${guestId}/edit\`}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" /> Contact Information
            </h3>
            {guest.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${guest.email}\`} className="hover:text-blue-600">{guest.email}</a>
              </div>
            )}
            {guest.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${guest.phone}\`} className="hover:text-blue-600">{guest.phone}</a>
              </div>
            )}
            {(guest.address || guest.city || guest.country) && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{[guest.address, guest.city, guest.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bed className="w-5 h-5" /> Current Stay
            </h3>
            {guest.current_room && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Bed className="w-5 h-5 text-gray-400" />
                <span>Room {guest.current_room}</span>
              </div>
            )}
            {guest.check_in_date && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Check-in: {new Date(guest.check_in_date).toLocaleDateString()}</span>
              </div>
            )}
            {guest.check_out_date && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>Check-out: {new Date(guest.check_out_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Stay History
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{guest.total_stays || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Stays</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{guest.total_nights || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Nights</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">\${(guest.total_spent || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{guest.loyalty_points || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Loyalty Points</div>
            </div>
          </div>
        </div>

        {guest.preferences && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Guest Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(guest.preferences) ? guest.preferences : [guest.preferences]).map((pref: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                  {pref}
                </span>
              ))}
            </div>
          </div>
        )}

        {guest.notes && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
            <p className="text-gray-600 dark:text-gray-400">{guest.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateGuestStats(options: HotelOptions = {}): string {
  const { componentName = 'GuestStats', endpoint = '/hotel/guests/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, UserCheck, Star, TrendingUp, Globe, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['guest-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch guest stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statItems = [
    { key: 'totalGuests', label: 'Total Guests', icon: Users, color: 'blue', value: stats?.totalGuests || 0 },
    { key: 'newGuestsToday', label: 'New Today', icon: UserPlus, color: 'green', value: stats?.newGuestsToday || 0 },
    { key: 'returningGuests', label: 'Returning Guests', icon: UserCheck, color: 'purple', value: stats?.returningGuests || 0 },
    { key: 'vipGuests', label: 'VIP Guests', icon: Star, color: 'yellow', value: stats?.vipGuests || 0 },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  };

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          return (
            <div key={stat.key} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className={\`p-2 rounded-lg \${colors.bg}\`}>
                  <Icon className={\`w-5 h-5 \${colors.icon}\`} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" /> Top Nationalities
          </h3>
          <div className="space-y-3">
            {(stats?.topNationalities || []).slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{item.country || item.nationality}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: \`\${(item.count / (stats?.totalGuests || 1)) * 100}%\` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
            {(!stats?.topNationalities || stats.topNationalities.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Guest Trends
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Avg. Stay Duration</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats?.avgStayDuration || 0} nights</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Repeat Guest Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats?.repeatGuestRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Avg. Guest Rating</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats?.avgGuestRating || 0}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateHousekeepingBoard(options: HotelOptions = {}): string {
  const { componentName = 'HousekeepingBoard', endpoint = '/hotel/housekeeping' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Clock, CheckCircle, AlertCircle, User, Bed, Loader2, Filter, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'inspected';

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterFloor, setFilterFloor] = useState<string>('');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['housekeeping-tasks', filterStatus, filterFloor],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filterStatus) params.set('status', filterStatus);
        if (filterFloor) params.set('floor', filterFloor);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch housekeeping tasks:', err);
        return [];
      }
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      return api.put(\`${endpoint}/\${taskId}\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; bg: string; text: string; label: string }> = {
      pending: { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
      in_progress: { icon: Sparkles, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'In Progress' },
      completed: { icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completed' },
      inspected: { icon: CheckCircle, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Inspected' },
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'border-l-red-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-green-500',
    };
    return colors[priority?.toLowerCase()] || 'border-l-gray-300';
  };

  const columns: { status: TaskStatus; title: string }[] = [
    { status: 'pending', title: 'Pending' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'completed', title: 'Completed' },
    { status: 'inspected', title: 'Inspected' },
  ];

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.status] = tasks?.filter((t: any) => (t.status?.toLowerCase() || 'pending') === col.status) || [];
    return acc;
  }, {} as Record<TaskStatus, any[]>);

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Housekeeping Board
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="inspected">Inspected</option>
          </select>
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Floors</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
              <option key={f} value={f}>Floor {f}</option>
            ))}
          </select>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] })}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const config = getStatusConfig(column.status);
          const Icon = config.icon;
          const columnTasks = tasksByStatus[column.status];

          return (
            <div key={column.status} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={\`w-5 h-5 \${config.text}\`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${config.bg} \${config.text}\`}>
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className={\`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 \${getPriorityColor(task.priority)}\`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">Room {task.room_number || task.roomNumber}</span>
                      </div>
                      {task.priority && (
                        <span className={\`text-xs px-2 py-0.5 rounded capitalize \${
                          task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }\`}>
                          {task.priority}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.task_type || task.type || 'General Cleaning'}</p>

                    {task.assigned_to && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <User className="w-4 h-4" />
                        <span>{task.assigned_to}</span>
                      </div>
                    )}

                    {column.status !== 'inspected' && (
                      <select
                        value={task.status || 'pending'}
                        onChange={(e) => updateTask.mutate({ taskId: task.id, status: e.target.value as TaskStatus })}
                        className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="inspected">Inspected</option>
                      </select>
                    )}
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateOccupancyChart(options: HotelOptions = {}): string {
  const { componentName = 'OccupancyChart', endpoint = '/hotel/occupancy' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ['occupancy-data', period, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          period,
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { data: [], summary: {} };
      } catch (err) {
        console.error('Failed to fetch occupancy data:', err);
        return { data: [], summary: {} };
      }
    },
  });

  const navigatePrev = () => {
    if (period === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else if (period === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    }
  };

  const navigateNext = () => {
    if (period === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else if (period === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    }
  };

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const chartData = data?.data || [];
  const maxValue = Math.max(...chartData.map((d: any) => d.occupancy || d.rate || 0), 100);

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Occupancy Overview
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={\`px-3 py-1.5 text-sm capitalize \${
                    period === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }\`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={navigatePrev} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
                {period === 'year' ? currentDate.getFullYear() : \`\${MONTHS[currentDate.getMonth()]} \${currentDate.getFullYear()}\`}
              </span>
              <button onClick={navigateNext} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Occupancy</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data?.summary?.avgOccupancy || 0}%</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Peak Occupancy</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data?.summary?.peakOccupancy || 0}%</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">RevPAR</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">\${data?.summary?.revpar || 0}</div>
          </div>
        </div>

        <div className="h-64 flex items-end gap-1">
          {chartData.length > 0 ? chartData.map((item: any, index: number) => {
            const value = item.occupancy || item.rate || 0;
            const height = (value / maxValue) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className={\`w-full rounded-t transition-all \${
                      value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    } hover:opacity-80\`}
                    style={{ height: \`\${height}%\`, minHeight: '4px' }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value}%
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate max-w-full">
                  {item.label || item.date || index + 1}
                </div>
              </div>
            );
          }) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No occupancy data available
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">High (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Medium (50-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Low (&lt;50%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
