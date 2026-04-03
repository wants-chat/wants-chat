/**
 * Flight School Component Generators
 *
 * Generates flight training/aviation education-related components.
 * Components: FlightCalendar, FlightListToday, FlightStats, StudentProfileFlight, AircraftStatusOverview
 */

export interface FlightCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFlightCalendar(options: FlightCalendarOptions = {}): string {
  const { componentName = 'FlightCalendar', endpoint = '/flights' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Plane, Clock, User, MapPin, X, Wind, Cloud } from 'lucide-react';
import { api } from '@/lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ${componentName}Props {
  instructorId?: string;
  studentId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId, studentId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  const { data: flights, isLoading } = useQuery({
    queryKey: ['flights-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), instructorId, studentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', String(currentMonth.getMonth() + 1));
      params.append('year', String(currentMonth.getFullYear()));
      if (instructorId) params.append('instructor_id', instructorId);
      if (studentId) params.append('student_id', studentId);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
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
  }, [currentMonth]);

  const getFlightsForDate = (date: Date) => {
    if (!flights) return [];
    return flights.filter((flight: any) => {
      const flightDate = new Date(flight.date);
      return flightDate.toDateString() === date.toDateString();
    });
  };

  const getFlightTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      training: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      solo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cross_country: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      night: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      checkride: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      instrument: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[type?.toLowerCase().replace(' ', '_')] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            Flight Schedule
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayFlights = getFlightsForDate(day.date);
            return (
              <div
                key={idx}
                className={\`min-h-[100px] p-1.5 border-b border-r border-gray-200 dark:border-gray-700 \${
                  !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                } \${idx % 7 === 6 ? 'border-r-0' : ''}\`}
              >
                <div className={\`text-sm mb-1 \${
                  isToday(day.date)
                    ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto'
                    : !day.isCurrentMonth ? 'text-gray-400 text-center' : 'text-gray-700 dark:text-gray-300 text-center'
                }\`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayFlights.slice(0, 2).map((flight: any, i: number) => (
                    <button
                      key={flight.id || i}
                      onClick={() => setSelectedFlight(flight)}
                      className={\`w-full text-left px-2 py-1 text-xs rounded truncate hover:opacity-80 \${getFlightTypeColor(flight.type)}\`}
                    >
                      {flight.time} - {flight.aircraft}
                    </button>
                  ))}
                  {dayFlights.length > 2 && (
                    <span className="text-xs text-gray-500 pl-2">+{dayFlights.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 rounded" /> Training</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> Solo</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 rounded" /> Cross Country</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-100 rounded" /> Night</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded" /> Checkride</span>
        </div>
      </div>

      {/* Flight Detail Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedFlight(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <button onClick={() => setSelectedFlight(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              {selectedFlight.type} Flight
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Plane className="w-4 h-4" />
                <span>{selectedFlight.aircraft} ({selectedFlight.aircraft_registration})</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{selectedFlight.student_name || selectedFlight.instructor_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(selectedFlight.date).toLocaleDateString()} at {selectedFlight.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Duration: {selectedFlight.duration || 1} hours</span>
              </div>
              {selectedFlight.route && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>Route: {selectedFlight.route}</span>
                </div>
              )}
              {selectedFlight.weather && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Weather
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFlight.weather}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedFlight(null)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

export interface FlightListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFlightListToday(options: FlightListTodayOptions = {}): string {
  const { componentName = 'FlightListToday', endpoint = '/flights/today' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plane, Clock, User, MapPin, ChevronRight, Calendar, Wind, Cloud } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  instructorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['flights-today', instructorId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (instructorId) url += \`?instructor_id=\${instructorId}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const getFlightStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      preflight: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      airborne: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      delayed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[status?.toLowerCase()] || colors.scheduled;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const flights = data?.flights || data || [];
  const weather = data?.weather;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              Today's Flights
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
          <Link
            to="/flights/schedule"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Weather Info */}
        {weather && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Cloud className="w-4 h-4" />
              <span>{weather.conditions}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Wind className="w-4 h-4" />
              <span>{weather.wind}</span>
            </div>
            <span className={\`px-2 py-0.5 rounded text-xs font-medium \${
              weather.vfr ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }\`}>
              {weather.vfr ? 'VFR' : 'IFR'}
            </span>
          </div>
        )}
      </div>

      {flights.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {flights.map((flight: any) => (
            <Link
              key={flight.id}
              to={\`/flights/\${flight.id}\`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{flight.type} - {flight.aircraft}</p>
                  <span className={\`px-2 py-0.5 rounded text-xs font-medium \${getFlightStatusColor(flight.status)}\`}>
                    {flight.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {flight.student_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {flight.time} ({flight.duration}h)
                  </span>
                  {flight.route && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {flight.route}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <Plane className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          No flights scheduled for today
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface FlightStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFlightStats(options: FlightStatsOptions = {}): string {
  const { componentName = 'FlightStats', endpoint = '/flights/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plane, Users, Clock, Award, Calendar, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  instructorId?: string;
  studentId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId, studentId, className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['flight-stats', instructorId, studentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (instructorId) params.append('instructor_id', instructorId);
      if (studentId) params.append('student_id', studentId);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.active_students || 0}</p>
              <p className="text-sm text-gray-500">Active Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_flight_hours || 0}h</p>
              <p className="text-sm text-gray-500">Total Flight Hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.flights_this_month || 0}</p>
              <p className="text-sm text-gray-500">Flights This Month</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.aircraft_count || 0}</p>
              <p className="text-sm text-gray-500">Aircraft Fleet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certification Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-blue-200" />
            <span className="text-blue-100">Checkride Pass Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats?.checkride_pass_rate || 0}%</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-200" />
            <span className="text-green-100">Certificates Issued</span>
          </div>
          <p className="text-3xl font-bold">{stats?.certificates_issued || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-200" />
            <span className="text-purple-100">Solo Endorsements</span>
          </div>
          <p className="text-3xl font-bold">{stats?.solo_endorsements || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-200" />
            <span className="text-orange-100">Avg Hours to Certificate</span>
          </div>
          <p className="text-3xl font-bold">{stats?.avg_hours_to_certificate || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface StudentProfileFlightOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileFlight(options: StudentProfileFlightOptions = {}): string {
  const { componentName = 'StudentProfileFlight', endpoint = '/flights/students' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Plane, Clock, Award, Target, CheckCircle, Calendar, FileText } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['flight-student', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
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

  if (!student) {
    return <div className="text-center py-12 text-gray-500">Student not found</div>;
  }

  const getCertificateStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'in-training': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'pre-solo': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'solo': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'checkride-ready': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'certified': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return colors[status?.toLowerCase().replace(' ', '-')] || colors['in-training'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          {student.avatar_url ? (
            <img src={student.avatar_url} alt={student.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
              <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getCertificateStatusColor(student.status)}\`}>
                {student.status || 'In Training'}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              {student.certificate_goal || 'Private Pilot'} Certificate
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {student.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{student.email}</span>}
              {student.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{student.phone}</span>}
            </div>
          </div>
          <Link
            to={\`/flights/new?student_id=\${student.id}\`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schedule Flight
          </Link>
        </div>
      </div>

      {/* Flight Hours Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.total_flight_hours || 0}</p>
          <p className="text-sm text-gray-500">Total Flight Hours</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
            <Plane className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.solo_hours || 0}</p>
          <p className="text-sm text-gray-500">Solo Hours</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.cross_country_hours || 0}</p>
          <p className="text-sm text-gray-500">Cross Country</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.night_hours || 0}</p>
          <p className="text-sm text-gray-500">Night Hours</p>
        </div>
      </div>

      {/* Training Progress */}
      {student.training_items && student.training_items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Training Progress</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {student.training_items.map((item: any, i: number) => (
              <div
                key={i}
                className={\`flex items-center gap-3 p-3 rounded-lg \${
                  item.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                }\`}
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                <span className={\`\${item.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500'}\`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endorsements */}
      {student.endorsements && student.endorsements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Endorsements</h2>
          <div className="space-y-3">
            {student.endorsements.map((endorsement: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{endorsement.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(endorsement.date).toLocaleDateString()} - {endorsement.instructor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical & Documents */}
      <div className="grid md:grid-cols-2 gap-6">
        {student.medical && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              Medical Certificate
            </h2>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-white">Class: {student.medical.class}</p>
              <p className="text-gray-500">Expires: {new Date(student.medical.expires).toLocaleDateString()}</p>
              {new Date(student.medical.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                <p className="text-red-600 text-sm font-medium">Expiring soon!</p>
              )}
            </div>
          </div>
        )}

        {student.certificates && student.certificates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Certificates
            </h2>
            <div className="space-y-3">
              {student.certificates.map((cert: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">{cert.name}</span>
                  <span className="text-sm text-gray-500">{new Date(cert.date).toLocaleDateString()}</span>
                </div>
              ))}
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

export interface AircraftStatusOverviewOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAircraftStatusOverview(options: AircraftStatusOverviewOptions = {}): string {
  const { componentName = 'AircraftStatusOverview', endpoint = '/aircraft' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plane, CheckCircle, AlertTriangle, XCircle, Clock, Wrench, Calendar, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  showDetails?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showDetails = true }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['aircraft-status'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/status');
      return response?.data || response;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-flight':
        return <Plane className="w-5 h-5 text-blue-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-yellow-600" />;
      case 'grounded':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'in-flight': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      grounded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const aircraft = data?.aircraft || data || [];
  const summary = {
    available: aircraft.filter((a: any) => a.status?.toLowerCase() === 'available').length,
    inFlight: aircraft.filter((a: any) => a.status?.toLowerCase() === 'in-flight').length,
    maintenance: aircraft.filter((a: any) => a.status?.toLowerCase() === 'maintenance').length,
    grounded: aircraft.filter((a: any) => a.status?.toLowerCase() === 'grounded').length,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-600" />
          Aircraft Fleet Status
        </h3>
        <Link
          to="/aircraft"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Manage Fleet
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-600">{summary.available}</p>
          <p className="text-xs text-gray-500">Available</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
            <Plane className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-600">{summary.inFlight}</p>
          <p className="text-xs text-gray-500">In Flight</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
            <Wrench className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-xl font-bold text-yellow-600">{summary.maintenance}</p>
          <p className="text-xs text-gray-500">Maintenance</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-600">{summary.grounded}</p>
          <p className="text-xs text-gray-500">Grounded</p>
        </div>
      </div>

      {/* Aircraft List */}
      {showDetails && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {aircraft.map((plane: any) => (
            <Link
              key={plane.id}
              to={\`/aircraft/\${plane.id}\`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                {getStatusIcon(plane.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{plane.registration}</p>
                  <span className={\`px-2 py-0.5 rounded text-xs font-medium \${getStatusColor(plane.status)}\`}>
                    {plane.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{plane.make} {plane.model}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-900 dark:text-white">{plane.hobbs_time}h Hobbs</p>
                {plane.next_maintenance && (
                  <p className="text-gray-500 flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5" />
                    Next: {new Date(plane.next_maintenance).toLocaleDateString()}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      )}

      {/* Maintenance Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium mb-2">
            <AlertTriangle className="w-5 h-5" />
            Maintenance Alerts
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert: any, i: number) => (
              <p key={i} className="text-sm text-yellow-600 dark:text-yellow-400">
                {alert.aircraft}: {alert.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
