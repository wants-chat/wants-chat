/**
 * Spa Component Generators
 *
 * Generates spa/wellness components including:
 * - AppointmentCalendarSpa: Calendar view for spa appointments with treatment details
 * - SpaStats: Statistics dashboard for spa metrics
 * - SpaSchedule: Spa operating hours and treatment room availability
 * - TherapistProfileSpa: Individual therapist profile display
 * - ClientProfileSpa: Client profile with wellness history and preferences
 */

export interface SpaOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate an appointment calendar component for spa
 */
export function generateAppointmentCalendarSpa(options: SpaOptions = {}): string {
  const { componentName = 'AppointmentCalendarSpa', endpoint = '/appointments' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Clock, User, Sparkles, Droplets } from 'lucide-react';
import { api } from '@/lib/api';

interface SpaAppointment {
  id: string;
  date: string;
  time: string;
  client_name: string;
  therapist_name: string;
  treatment: string;
  room: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  duration: number;
  package_name?: string;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['spa-appointments', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get<SpaAppointment[]>(\`${endpoint}?year=\${year}&month=\${month}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, () => null);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getAppointmentsForDay = (day: number) => {
    return appointments?.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === day && aptDate.getMonth() === month && aptDate.getFullYear() === year;
    }) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'no_show': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-500" />
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 text-gray-500 dark:text-gray-400 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...padding, ...days].map((day, i) => {
            const dayAppointments = day ? getAppointmentsForDay(day) : [];
            const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            const isSelected = day === selectedDay;

            return (
              <div
                key={i}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                className={\`min-h-[80px] p-1 border rounded-lg cursor-pointer transition-all \${
                  day ? 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600' : 'border-transparent'
                } \${isToday ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-600' : ''}
                \${isSelected ? 'ring-2 ring-teal-500' : ''}\`}
              >
                {day && (
                  <>
                    <span className={\`text-sm font-medium \${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-gray-900 dark:text-white'}\`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={\`text-xs p-1 rounded truncate \${getStatusColor(apt.status)}\`}
                        >
                          {apt.time} - {apt.treatment}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected day details */}
        {selectedDay && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Treatments for {monthNames[month]} {selectedDay}
            </h3>
            <div className="space-y-2">
              {getAppointmentsForDay(selectedDay).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{apt.client_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{apt.treatment} ({apt.duration} min)</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Room: {apt.room} | Therapist: {apt.therapist_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{apt.time}</span>
                    </div>
                    <span className={\`text-xs px-2 py-1 rounded-full \${getStatusColor(apt.status)}\`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {getAppointmentsForDay(selectedDay).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No treatments scheduled</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate spa statistics dashboard
 */
export function generateSpaStats(options: SpaOptions = {}): string {
  const { componentName = 'SpaStats', endpoint = '/spa/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, DollarSign, TrendingUp, Sparkles, Star, Clock, Droplets, Leaf, Heart } from 'lucide-react';
import { api } from '@/lib/api';

interface SpaStatsData {
  total_clients: number;
  total_treatments: number;
  revenue_today: number;
  revenue_month: number;
  treatments_today: number;
  treatments_week: number;
  average_rating: number;
  room_utilization: number;
  popular_treatments: Array<{ name: string; count: number; category: string }>;
  top_therapists: Array<{ name: string; treatments: number; rating: number; specialty: string }>;
  package_sales: number;
  membership_renewals: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['spa-stats'],
    queryFn: async () => {
      const response = await api.get<SpaStatsData>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.total_clients?.toLocaleString() || '0',
      icon: Users,
      color: 'from-teal-500 to-cyan-500',
    },
    {
      title: 'Treatments Today',
      value: stats?.treatments_today?.toString() || '0',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: "Today's Revenue",
      value: \`$\${stats?.revenue_today?.toLocaleString() || '0'}\`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Monthly Revenue',
      value: \`$\${stats?.revenue_month?.toLocaleString() || '0'}\`,
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Average Rating',
      value: stats?.average_rating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Room Utilization',
      value: \`\${stats?.room_utilization || 0}%\`,
      icon: Clock,
      color: 'from-rose-500 to-red-500',
    },
  ];

  const getTreatmentIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'massage': return Heart;
      case 'facial': return Sparkles;
      case 'body': return Leaf;
      default: return Droplets;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-xl bg-gradient-to-br \${stat.color}\`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Package Sales This Month</p>
              <p className="text-3xl font-bold">{stats?.package_sales || 0}</p>
            </div>
            <Sparkles className="w-12 h-12 opacity-30" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Membership Renewals</p>
              <p className="text-3xl font-bold">{stats?.membership_renewals || 0}</p>
            </div>
            <Heart className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Popular Treatments & Top Therapists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Treatments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-teal-500" />
            Popular Treatments
          </h3>
          <div className="space-y-3">
            {stats?.popular_treatments?.length ? (
              stats.popular_treatments.map((treatment, index) => {
                const Icon = getTreatmentIcon(treatment.category);
                return (
                  <div key={treatment.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </span>
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">{treatment.name}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{treatment.category}</p>
                      </div>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{treatment.count} bookings</span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Top Therapists */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Top Therapists
          </h3>
          <div className="space-y-3">
            {stats?.top_therapists?.length ? (
              stats.top_therapists.map((therapist, index) => (
                <div key={therapist.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-medium text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">{therapist.name}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{therapist.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{therapist.treatments} sessions</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{therapist.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate spa schedule and room availability component
 */
export function generateSpaSchedule(options: SpaOptions = {}): string {
  const { componentName = 'SpaSchedule', endpoint = '/spa/schedule' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Clock, CheckCircle, XCircle, DoorOpen, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface RoomSchedule {
  room_id: string;
  room_name: string;
  room_type: string;
  time_slots: Array<{
    time: string;
    available: boolean;
    treatment?: string;
    therapist?: string;
    client?: string;
  }>;
}

interface OperatingHours {
  day: string;
  open: boolean;
  open_time?: string;
  close_time?: string;
}

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: roomSchedules, isLoading: roomsLoading } = useQuery({
    queryKey: ['spa-room-schedule', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const date = selectedDate.toISOString().split('T')[0];
      const response = await api.get<RoomSchedule[]>(\`${endpoint}/rooms?date=\${date}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: operatingHours, isLoading: hoursLoading } = useQuery({
    queryKey: ['spa-hours'],
    queryFn: async () => {
      const response = await api.get<OperatingHours[]>('${endpoint}/hours');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const changeDate = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  const isLoading = roomsLoading || hoursLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Operating Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" />
            Operating Hours
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-700">
          {days.map((day) => {
            const hours = operatingHours?.find((h) => h.day === day);
            const isOpen = hours?.open !== false;

            return (
              <div key={day} className="bg-white dark:bg-gray-800 p-4">
                <span className="font-medium text-gray-900 dark:text-white text-sm">{day}</span>
                {isOpen ? (
                  <div className="flex items-center gap-2 mt-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {hours?.open_time || '9:00 AM'} - {hours?.close_time || '9:00 PM'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1 text-gray-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Closed</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Room Availability */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-purple-500" />
            Room Availability
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
              {formatDate(selectedDate)}
            </span>
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          {roomSchedules?.length ? (
            <div className="space-y-4">
              {roomSchedules.map((room) => (
                <div key={room.room_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{room.room_name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{room.room_type}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.time_slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={\`p-2 rounded-lg text-xs font-medium min-w-[80px] text-center \${
                          slot.available
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }\`}
                        title={slot.treatment ? \`\${slot.treatment} with \${slot.therapist}\` : 'Available'}
                      >
                        <div>{slot.time}</div>
                        {!slot.available && slot.treatment && (
                          <div className="text-xs opacity-75 truncate max-w-[60px]">{slot.treatment}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No room data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate therapist profile component for spa
 */
export function generateTherapistProfileSpa(options: SpaOptions = {}): string {
  const { componentName = 'TherapistProfileSpa', endpoint = '/therapists' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, Clock, Award, Calendar, Phone, Mail, Sparkles, Heart, Leaf, Droplets } from 'lucide-react';
import { api } from '@/lib/api';

interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
  title: string;
  specialty: string[];
  bio?: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  treatments: string[];
  certifications?: string[];
  phone?: string;
  email?: string;
  languages?: string[];
  availability?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: therapist, isLoading } = useQuery({
    queryKey: ['spa-therapist', id],
    queryFn: async () => {
      const response = await api.get<Therapist>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!therapist) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Therapist not found</div>;
  }

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty?.toLowerCase()) {
      case 'massage': return Heart;
      case 'facial': return Sparkles;
      case 'body treatment': return Leaf;
      case 'aromatherapy': return Droplets;
      default: return Sparkles;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {therapist.avatar_url ? (
            <img src={therapist.avatar_url} alt={therapist.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-14 h-14 text-white" />
            </div>
          )}
          <div className="text-center sm:text-left text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">{therapist.name}</h1>
            <p className="opacity-90 text-lg">{therapist.title}</p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-300 fill-current" />
                <span className="font-semibold">{therapist.rating.toFixed(1)}</span>
                <span className="opacity-75">({therapist.reviews_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{therapist.experience_years} years</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Specialties */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-3">
            {therapist.specialty?.map((spec) => {
              const Icon = getSpecialtyIcon(spec);
              return (
                <div key={spec} className="flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{spec}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {therapist.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-500" /> {therapist.email}
                </p>
              )}
              {therapist.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-500" /> {therapist.phone}
                </p>
              )}
              {therapist.languages && therapist.languages.length > 0 && (
                <p className="flex items-center gap-2">
                  <span className="text-teal-500 font-medium">Languages:</span> {therapist.languages.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Treatments */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Treatments Offered</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.treatments?.map((treatment) => (
                <span key={treatment} className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm">
                  {treatment}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        {therapist.bio && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{therapist.bio}</p>
          </div>
        )}

        {/* Certifications */}
        {therapist.certifications && therapist.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Certifications & Training</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {therapist.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Award className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Button */}
        <Link
          to={\`/appointments/new?therapist_id=\${therapist.id}\`}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 flex items-center justify-center gap-2 font-semibold transition-all"
        >
          <Calendar className="w-5 h-5" />
          Book Treatment
        </Link>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate client profile component for spa
 */
export function generateClientProfileSpa(options: SpaOptions = {}): string {
  const { componentName = 'ClientProfileSpa', endpoint = '/clients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Phone, Mail, Calendar, Clock, Star, Sparkles, Heart, AlertTriangle, CreditCard, Droplets, Leaf, Award } from 'lucide-react';
import { api } from '@/lib/api';

interface WellnessVisit {
  id: string;
  date: string;
  treatment: string;
  therapist_name: string;
  duration: number;
  amount: number;
  rating?: number;
  notes?: string;
}

interface WellnessGoal {
  id: string;
  goal: string;
  progress: number;
  target_date?: string;
}

interface SpaClient {
  id: string;
  name: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  joined_at: string;
  membership_type?: string;
  membership_expiry?: string;
  total_visits: number;
  total_spent: number;
  wellness_points: number;
  preferred_therapist?: string;
  preferred_treatments?: string[];
  health_conditions?: string[];
  allergies?: string[];
  pressure_preference?: 'light' | 'medium' | 'firm' | 'deep';
  aromatherapy_preferences?: string[];
  notes?: string;
  upcoming_appointment?: {
    date: string;
    time: string;
    treatment: string;
    therapist: string;
    room: string;
  };
  wellness_goals?: WellnessGoal[];
  visit_history: WellnessVisit[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: client, isLoading } = useQuery({
    queryKey: ['spa-client', id],
    queryFn: async () => {
      const response = await api.get<SpaClient>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Client not found</div>;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPressureColor = (pressure?: string) => {
    switch (pressure) {
      case 'light': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'medium': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'firm': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'deep': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {client.avatar_url ? (
              <img src={client.avatar_url} alt={client.name} className="w-20 h-20 rounded-full object-cover border-4 border-white" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="text-white text-center sm:text-left">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <p className="opacity-90 text-sm">Member since {formatDate(client.joined_at)}</p>
              {client.membership_type && (
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {client.membership_type} Member
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-teal-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.total_visits}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Visits</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${client.total_spent.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.wellness_points}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wellness Points</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <Heart className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{client.preferred_therapist || 'None'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Therapist</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-3">
              {client.email && (
                <a href={\`mailto:\${client.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                  <Mail className="w-5 h-5 text-teal-500" />
                  <span className="text-sm">{client.email}</span>
                </a>
              )}
              {client.phone && (
                <a href={\`tel:\${client.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                  <Phone className="w-5 h-5 text-teal-500" />
                  <span className="text-sm">{client.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-teal-500" />
              Treatment Preferences
            </h3>
            <div className="space-y-4">
              {/* Pressure Preference */}
              {client.pressure_preference && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Pressure Preference</p>
                  <span className={\`px-3 py-1 rounded-full text-sm font-medium capitalize \${getPressureColor(client.pressure_preference)}\`}>
                    {client.pressure_preference}
                  </span>
                </div>
              )}

              {/* Preferred Treatments */}
              {client.preferred_treatments?.length ? (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Favorite Treatments</p>
                  <div className="flex flex-wrap gap-2">
                    {client.preferred_treatments.map((treatment) => (
                      <span key={treatment} className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm">
                        {treatment}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Aromatherapy */}
              {client.aromatherapy_preferences?.length ? (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> Aromatherapy
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {client.aromatherapy_preferences.map((scent) => (
                      <span key={scent} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                        {scent}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Health Info */}
          {(client.health_conditions?.length || client.allergies?.length) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Health Information
              </h3>
              {client.health_conditions && client.health_conditions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Health Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {client.health_conditions.map((condition) => (
                      <span key={condition} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.allergies && client.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {client.allergies.map((allergy) => (
                      <span key={allergy} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - History & Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointment */}
          {client.upcoming_appointment && (
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-semibold mb-3">Next Wellness Session</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{client.upcoming_appointment.treatment}</p>
                  <p className="opacity-90 text-sm">with {client.upcoming_appointment.therapist}</p>
                  <p className="opacity-75 text-xs mt-1">Room: {client.upcoming_appointment.room}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDate(client.upcoming_appointment.date)}</p>
                  <p className="opacity-90 text-sm">{client.upcoming_appointment.time}</p>
                </div>
              </div>
            </div>
          )}

          {/* Wellness Goals */}
          {client.wellness_goals && client.wellness_goals.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Wellness Goals
              </h3>
              <div className="space-y-4">
                {client.wellness_goals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{goal.goal}</span>
                      <span className="text-sm text-teal-600 dark:text-teal-400">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: \`\${goal.progress}%\` }}
                      />
                    </div>
                    {goal.target_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target: {formatDate(goal.target_date)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Wellness Journey
            </h3>
            <div className="space-y-4">
              {client.visit_history?.length ? (
                client.visit_history.map((visit) => (
                  <div key={visit.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{visit.treatment}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">with {visit.therapist_name} ({visit.duration} min)</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(visit.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">\${visit.amount}</p>
                      {visit.rating && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{visit.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No visit history</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book New Treatment */}
      <Link
        to={\`/appointments/new?client_id=\${client.id}\`}
        className="block w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 text-center font-semibold transition-all"
      >
        <Calendar className="w-5 h-5 inline mr-2" />
        Book New Treatment
      </Link>
    </div>
  );
};

export default ${componentName};
`;
}
