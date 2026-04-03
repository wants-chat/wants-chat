/**
 * Escape Room Component Generators
 */

export interface EscapeRoomOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateEscapeRoomStats(options: EscapeRoomOptions = {}): string {
  const { componentName = 'EscapeRoomStats', endpoint = '/escape-room/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Key, Users, Trophy, Clock, Calendar, Percent } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['escape-room-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    { label: 'Active Rooms', value: stats?.active_rooms || 0, icon: Key, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { label: 'Players Today', value: stats?.players_today || 0, icon: Users, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Escapes Today', value: stats?.escapes_today || 0, icon: Trophy, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Avg. Escape Time', value: stats?.avg_escape_time ? \`\${stats.avg_escape_time} min\` : 'N/A', icon: Clock, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'Bookings Today', value: stats?.bookings_today || 0, icon: Calendar, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Escape Rate', value: stats?.escape_rate ? \`\${stats.escape_rate}%\` : 'N/A', icon: Percent, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className={\`p-3 rounded-lg \${stat.color}\`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBookingCalendarEscape(options: EscapeRoomOptions = {}): string {
  const { componentName = 'BookingCalendarEscape', endpoint = '/escape-room/bookings' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Key, Clock, Users } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['escape-bookings', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: currentDate.getFullYear().toString(),
        month: (currentDate.getMonth() + 1).toString(),
      });
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getBookingsForDay = (day: number) => {
    if (!bookings) return [];
    return bookings.filter((booking: any) => {
      const bookingDate = new Date(booking.date || booking.booking_date);
      return bookingDate.getDate() === day;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Booking Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={\`empty-\${i}\`} className="h-24" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayBookings = getBookingsForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div
                key={day}
                className={\`h-24 border border-gray-200 dark:border-gray-700 rounded-lg p-1 overflow-hidden \${
                  isToday ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : ''
                }\`}
              >
                <div className={\`text-xs font-medium mb-1 \${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}\`}>
                  {day}
                </div>
                {dayBookings.slice(0, 2).map((booking: any, idx: number) => (
                  <div
                    key={booking.id || idx}
                    className={\`text-xs rounded px-1 py-0.5 mb-0.5 truncate \${
                      booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      booking.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    }\`}
                    title={\`\${booking.room_name || booking.room} - \${booking.time || booking.start_time}\`}
                  >
                    {booking.time || booking.start_time} - {booking.room_name || booking.room}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-xs text-gray-500">+{dayBookings.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"></span>
            <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"></span>
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700"></span>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBookingListTodayEscape(options: EscapeRoomOptions = {}): string {
  const { componentName = 'BookingListTodayEscape', endpoint = '/escape-room/bookings/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Key, Clock, Users, AlertCircle, CheckCircle, Timer } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['escape-bookings-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Today's Bookings
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking: any) => (
            <Link
              key={booking.id}
              to={\`/bookings/\${booking.id}\`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-center min-w-[60px] bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-2">
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{booking.time || booking.start_time}</p>
                  {booking.duration && (
                    <p className="text-xs text-indigo-500">{booking.duration} min</p>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-indigo-500" />
                        {booking.room_name || booking.room}
                      </h3>
                      {booking.customer_name && (
                        <p className="text-sm text-gray-500">Booked by {booking.customer_name}</p>
                      )}
                    </div>
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 \${
                      booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      booking.status === 'escaped' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      booking.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      booking.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }\`}>
                      {booking.status === 'in_progress' && <Timer className="w-3 h-3" />}
                      {(booking.status === 'completed' || booking.status === 'escaped') && <CheckCircle className="w-3 h-3" />}
                      {booking.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                      {booking.status === 'in_progress' ? 'In Progress' :
                       booking.status === 'escaped' ? 'Escaped!' :
                       booking.status === 'failed' ? 'Failed' :
                       booking.status === 'confirmed' ? 'Confirmed' :
                       booking.status === 'completed' ? 'Completed' :
                       booking.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {booking.players !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {booking.players} players
                      </span>
                    )}
                    {booking.difficulty && (
                      <span className={\`px-2 py-0.5 rounded text-xs \${
                        booking.difficulty === 'hard' || booking.difficulty === 'expert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        booking.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }\`}>
                        {booking.difficulty}
                      </span>
                    )}
                    {booking.escape_time && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Timer className="w-4 h-4" />
                        Escaped in {booking.escape_time} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No bookings for today
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRoomScheduleEscape(options: EscapeRoomOptions = {}): string {
  const { componentName = 'RoomScheduleEscape', endpoint = '/escape-room/rooms/schedule' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Key, Clock, Users, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['escape-room-schedule', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${selectedDate.toISOString().split('T')[0]}\`);
      return response?.data || response;
    },
  });

  const rooms = schedule?.rooms || [];
  const timeSlots = schedule?.time_slots || [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const getSlotStatus = (roomId: string, time: string) => {
    if (!schedule?.bookings) return 'available';
    const booking = schedule.bookings.find((b: any) =>
      (b.room_id === roomId || b.room === roomId) &&
      (b.time === time || b.start_time === time)
    );
    if (!booking) return 'available';
    return booking.status || 'booked';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Room Schedule
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-48">Room</th>
              {timeSlots.map((time) => (
                <th key={time} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rooms.length > 0 ? (
              rooms.map((room: any) => (
                <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={\`p-2 rounded-lg \${
                        room.difficulty === 'hard' || room.difficulty === 'expert' ? 'bg-red-100 dark:bg-red-900/30' :
                        room.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-green-100 dark:bg-green-900/30'
                      }\`}>
                        <Key className={\`w-4 h-4 \${
                          room.difficulty === 'hard' || room.difficulty === 'expert' ? 'text-red-600 dark:text-red-400' :
                          room.difficulty === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-green-600 dark:text-green-400'
                        }\`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{room.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {room.min_players}-{room.max_players}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {room.duration || 60} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {timeSlots.map((time) => {
                    const status = getSlotStatus(room.id, time);
                    return (
                      <td key={time} className="p-1 text-center">
                        <button
                          className={\`w-full p-2 rounded-lg text-xs font-medium transition-colors \${
                            status === 'available'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                              : status === 'in_progress'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }\`}
                          disabled={status !== 'available'}
                        >
                          {status === 'available' ? (
                            <Unlock className="w-4 h-4 mx-auto" />
                          ) : status === 'in_progress' ? (
                            <Clock className="w-4 h-4 mx-auto animate-pulse" />
                          ) : (
                            <Lock className="w-4 h-4 mx-auto" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={timeSlots.length + 1} className="p-8 text-center text-gray-500">
                  No rooms available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
