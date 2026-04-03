/**
 * Salon Component Generators
 *
 * Generates salon/beauty shop components including:
 * - AppointmentCalendarSalon: Calendar view for salon appointments
 * - SalonStats: Statistics dashboard for salon metrics
 * - StylistProfile: Individual stylist profile display
 * - StylistSchedule: Working hours and availability for stylists
 * - ClientProfileSalon: Client profile with visit history
 */

export interface SalonOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate an appointment calendar component for salon
 */
export function generateAppointmentCalendarSalon(options: SalonOptions = {}): string {
  const { componentName = 'AppointmentCalendarSalon', endpoint = '/appointments' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Clock, User, Scissors } from 'lucide-react';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  date: string;
  time: string;
  client_name: string;
  stylist_name: string;
  service: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  duration: number;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['salon-appointments', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get<Appointment[]>(\`${endpoint}?year=\${year}&month=\${month}\`);
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
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'no_show': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400';
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
          <Scissors className="w-5 h-5 text-pink-500" />
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
                  day ? 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600' : 'border-transparent'
                } \${isToday ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-600' : ''}
                \${isSelected ? 'ring-2 ring-pink-500' : ''}\`}
              >
                {day && (
                  <>
                    <span className={\`text-sm font-medium \${isToday ? 'text-pink-600 dark:text-pink-400' : 'text-gray-900 dark:text-white'}\`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={\`text-xs p-1 rounded truncate \${getStatusColor(apt.status)}\`}
                        >
                          {apt.time} - {apt.service}
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
              Appointments for {monthNames[month]} {selectedDay}
            </h3>
            <div className="space-y-2">
              {getAppointmentsForDay(selectedDay).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{apt.client_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{apt.service} with {apt.stylist_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{apt.time}</span>
                    </div>
                    <span className={\`text-xs px-2 py-1 rounded-full \${getStatusColor(apt.status)}\`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
              {getAppointmentsForDay(selectedDay).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No appointments scheduled</p>
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
 * Generate salon statistics dashboard
 */
export function generateSalonStats(options: SalonOptions = {}): string {
  const { componentName = 'SalonStats', endpoint = '/salon/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, DollarSign, TrendingUp, Scissors, Star, Clock, Repeat } from 'lucide-react';
import { api } from '@/lib/api';

interface SalonStatsData {
  total_clients: number;
  total_appointments: number;
  revenue_today: number;
  revenue_month: number;
  appointments_today: number;
  appointments_week: number;
  average_rating: number;
  returning_clients_rate: number;
  popular_services: Array<{ name: string; count: number }>;
  top_stylists: Array<{ name: string; appointments: number; rating: number }>;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['salon-stats'],
    queryFn: async () => {
      const response = await api.get<SalonStatsData>('${endpoint}');
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
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      title: 'Appointments Today',
      value: stats?.appointments_today?.toString() || '0',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: "Today's Revenue",
      value: \`$\${stats?.revenue_today?.toLocaleString() || '0'}\`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Monthly Revenue',
      value: \`$\${stats?.revenue_month?.toLocaleString() || '0'}\`,
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Average Rating',
      value: stats?.average_rating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Returning Clients',
      value: \`\${stats?.returning_clients_rate || 0}%\`,
      icon: Repeat,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    },
  ];

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

      {/* Popular Services & Top Stylists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Services */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-pink-500" />
            Popular Services
          </h3>
          <div className="space-y-3">
            {stats?.popular_services?.length ? (
              stats.popular_services.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-xs font-medium text-pink-600 dark:text-pink-400">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">{service.name}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{service.count} bookings</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Top Stylists */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Top Stylists
          </h3>
          <div className="space-y-3">
            {stats?.top_stylists?.length ? (
              stats.top_stylists.map((stylist, index) => (
                <div key={stylist.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-medium text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">{stylist.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{stylist.appointments} appts</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{stylist.rating.toFixed(1)}</span>
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
 * Generate stylist profile component
 */
export function generateStylistProfile(options: SalonOptions = {}): string {
  const { componentName = 'StylistProfile', endpoint = '/stylists' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, MapPin, Clock, Award, Calendar, Phone, Mail, Scissors, Instagram, Facebook } from 'lucide-react';
import { api } from '@/lib/api';

interface Stylist {
  id: string;
  name: string;
  avatar_url?: string;
  specialty: string;
  bio?: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  services: string[];
  certifications?: string[];
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  availability?: string;
  price_range?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: stylist, isLoading } = useQuery({
    queryKey: ['stylist', id],
    queryFn: async () => {
      const response = await api.get<Stylist>('${endpoint}/' + id);
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

  if (!stylist) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Stylist not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {stylist.avatar_url ? (
            <img src={stylist.avatar_url} alt={stylist.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-14 h-14 text-white" />
            </div>
          )}
          <div className="text-center sm:text-left text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">{stylist.name}</h1>
            <p className="opacity-90 flex items-center gap-2 justify-center sm:justify-start mt-1">
              <Scissors className="w-4 h-4" />
              {stylist.specialty}
            </p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-300 fill-current" />
                <span className="font-semibold">{stylist.rating.toFixed(1)}</span>
                <span className="opacity-75">({stylist.reviews_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{stylist.experience_years} years</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {stylist.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pink-500" /> {stylist.email}
                </p>
              )}
              {stylist.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-pink-500" /> {stylist.phone}
                </p>
              )}
              {stylist.instagram && (
                <a href={\`https://instagram.com/\${stylist.instagram}\`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                  <Instagram className="w-4 h-4 text-pink-500" /> @{stylist.instagram}
                </a>
              )}
              {stylist.facebook && (
                <a href={\`https://facebook.com/\${stylist.facebook}\`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                  <Facebook className="w-4 h-4 text-pink-500" /> {stylist.facebook}
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {stylist.services?.map((service) => (
                <span key={service} className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        {stylist.bio && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{stylist.bio}</p>
          </div>
        )}

        {/* Certifications */}
        {stylist.certifications && stylist.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Certifications</h3>
            <div className="space-y-2">
              {stylist.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Button */}
        <Link
          to={\`/appointments/new?stylist_id=\${stylist.id}\`}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 flex items-center justify-center gap-2 font-semibold transition-all"
        >
          <Calendar className="w-5 h-5" />
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate stylist schedule component
 */
export function generateStylistSchedule(options: SalonOptions = {}): string {
  const { componentName = 'StylistSchedule', endpoint = '/schedules' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, CheckCircle, XCircle, Coffee } from 'lucide-react';
import { api } from '@/lib/api';

interface DaySchedule {
  day: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
  break_start?: string;
  break_end?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['stylist-schedule', id],
    queryFn: async () => {
      const response = await api.get<DaySchedule[]>('${endpoint}?stylist_id=' + id);
      return response?.data || response || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getScheduleForDay = (day: string): DaySchedule | undefined => {
    if (Array.isArray(schedule)) {
      return schedule.find((s) => s.day === day);
    }
    return undefined;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-pink-500" />
          Working Hours
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {days.map((day) => {
          const daySchedule = getScheduleForDay(day);
          const isAvailable = daySchedule?.available !== false;

          return (
            <div key={day} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <span className="font-medium text-gray-900 dark:text-white">{day}</span>
              {isAvailable && daySchedule ? (
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {daySchedule.start_time || '9:00 AM'} - {daySchedule.end_time || '6:00 PM'}
                    </span>
                  </div>
                  {daySchedule.break_start && daySchedule.break_end && (
                    <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 text-sm">
                      <Coffee className="w-3 h-3" />
                      <span>Break: {daySchedule.break_start} - {daySchedule.break_end}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">Closed</span>
                </div>
              )}
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

/**
 * Generate client profile component for salon
 */
export function generateClientProfileSalon(options: SalonOptions = {}): string {
  const { componentName = 'ClientProfileSalon', endpoint = '/clients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Phone, Mail, Calendar, Clock, Star, Scissors, Heart, AlertTriangle, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';

interface ClientVisit {
  id: string;
  date: string;
  service: string;
  stylist_name: string;
  amount: number;
  rating?: number;
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  joined_at: string;
  total_visits: number;
  total_spent: number;
  average_rating?: number;
  preferred_stylist?: string;
  preferred_services?: string[];
  allergies?: string[];
  notes?: string;
  upcoming_appointment?: {
    date: string;
    time: string;
    service: string;
    stylist: string;
  };
  visit_history: ClientVisit[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: client, isLoading } = useQuery({
    queryKey: ['salon-client', id],
    queryFn: async () => {
      const response = await api.get<Client>('${endpoint}/' + id);
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6">
          <div className="flex items-center gap-4">
            {client.avatar_url ? (
              <img src={client.avatar_url} alt={client.name} className="w-20 h-20 rounded-full object-cover border-4 border-white" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="text-white">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <p className="opacity-90 text-sm">Member since {formatDate(client.joined_at)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.total_visits}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Visits</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${client.total_spent.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.average_rating?.toFixed(1) || 'N/A'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Heart className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{client.preferred_stylist || 'None'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Stylist</p>
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
                <a href={\`mailto:\${client.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">
                  <Mail className="w-5 h-5 text-pink-500" />
                  <span className="text-sm">{client.email}</span>
                </a>
              )}
              {client.phone && (
                <a href={\`tel:\${client.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">
                  <Phone className="w-5 h-5 text-pink-500" />
                  <span className="text-sm">{client.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-pink-500" />
              Preferred Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {client.preferred_services?.length ? (
                client.preferred_services.map((service) => (
                  <span key={service} className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full text-sm">
                    {service}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No preferences set</p>
              )}
            </div>
          </div>

          {/* Allergies/Notes */}
          {(client.allergies?.length || client.notes) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {client.allergies && client.allergies.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Allergies & Sensitivities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {client.allergies.map((allergy) => (
                      <span key={allergy} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{client.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointment */}
          {client.upcoming_appointment && (
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-semibold mb-3">Upcoming Appointment</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{client.upcoming_appointment.service}</p>
                  <p className="opacity-90 text-sm">with {client.upcoming_appointment.stylist}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDate(client.upcoming_appointment.date)}</p>
                  <p className="opacity-90 text-sm">{client.upcoming_appointment.time}</p>
                </div>
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Visit History
            </h3>
            <div className="space-y-4">
              {client.visit_history?.length ? (
                client.visit_history.map((visit) => (
                  <div key={visit.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{visit.service}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">with {visit.stylist_name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(visit.date)}</p>
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

      {/* Book New Appointment */}
      <Link
        to={\`/appointments/new?client_id=\${client.id}\`}
        className="block w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 text-center font-semibold transition-all"
      >
        <Calendar className="w-5 h-5 inline mr-2" />
        Book New Appointment
      </Link>
    </div>
  );
};

export default ${componentName};
`;
}
