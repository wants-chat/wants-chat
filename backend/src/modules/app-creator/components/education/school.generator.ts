/**
 * School Component Generators
 *
 * Generates school-wide components for education applications.
 * Components: SchoolStats, SchoolEvents, ExamCalendar, ExamListToday, TestListUpcoming
 */

export interface SchoolStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSchoolStats(options: SchoolStatsOptions = {}): string {
  const { componentName = 'SchoolStats', endpoint = '/school/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, GraduationCap, BookOpen, Award, TrendingUp, TrendingDown, Calendar, Building } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['school-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'blue',
      change: stats?.students_change,
    },
    {
      label: 'Total Teachers',
      value: stats?.total_teachers || 0,
      icon: GraduationCap,
      color: 'green',
      change: stats?.teachers_change,
    },
    {
      label: 'Active Classes',
      value: stats?.total_classes || 0,
      icon: BookOpen,
      color: 'yellow',
      change: stats?.classes_change,
    },
    {
      label: 'Courses',
      value: stats?.total_courses || 0,
      icon: Building,
      color: 'purple',
      change: stats?.courses_change,
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600' },
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={\`p-3 rounded-xl \${colors.bg}\`}>
                  <Icon className={\`w-6 h-6 \${colors.icon}\`} />
                </div>
                {stat.change !== undefined && stat.change !== 0 && (
                  <div className={\`flex items-center gap-1 text-sm font-medium \${
                    stat.change > 0 ? 'text-green-600' : 'text-red-600'
                  }\`}>
                    {stat.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-200" />
            <span className="text-blue-100 text-sm">Attendance Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats?.attendance_rate || 0}%</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-green-200" />
            <span className="text-green-100 text-sm">Average GPA</span>
          </div>
          <p className="text-3xl font-bold">{stats?.average_gpa || 'N/A'}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-purple-200" />
            <span className="text-purple-100 text-sm">Graduation Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats?.graduation_rate || 0}%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-orange-200" />
            <span className="text-orange-100 text-sm">Student:Teacher</span>
          </div>
          <p className="text-3xl font-bold">{stats?.student_teacher_ratio || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface SchoolEventsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSchoolEvents(options: SchoolEventsOptions = {}): string {
  const { componentName = 'SchoolEvents', endpoint = '/school/events' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, MapPin, Clock, Users, ChevronRight, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showViewAll?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5, showViewAll = true }) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['school-events', limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      sports: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cultural: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      holiday: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      meeting: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      exam: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[type?.toLowerCase()] || colors.academic;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Upcoming Events
        </h3>
        {showViewAll && (
          <Link
            to="/events"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {events && events.length > 0 ? (
          events.map((event: any) => (
            <Link
              key={event.id}
              to={\`/events/\${event.id}\`}
              className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Date Box */}
              <div className="flex-shrink-0 w-14 text-center">
                <div className="bg-blue-600 text-white rounded-t-lg py-1 text-xs font-medium">
                  {new Date(event.date || event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-b-lg py-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {new Date(event.date || event.start_date).getDate()}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{event.title}</h4>
                  {event.is_important && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                {event.type && (
                  <span className={\`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 \${getEventTypeColor(event.type)}\`}>
                    {event.type}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  {event.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {event.time}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                  )}
                  {event.attendees_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.attendees_count} attending
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            No upcoming events
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface ExamCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateExamCalendar(options: ExamCalendarOptions = {}): string {
  const { componentName = 'ExamCalendar', endpoint = '/exams' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, FileText, Clock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface ${componentName}Props {
  classId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedExam, setSelectedExam] = useState<any | null>(null);

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exam-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), classId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', String(currentMonth.getMonth() + 1));
      params.append('year', String(currentMonth.getFullYear()));
      if (classId) params.append('class_id', classId);
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

  const getExamsForDate = (date: Date) => {
    if (!exams) return [];
    return exams.filter((exam: any) => {
      const examDate = new Date(exam.date || exam.exam_date);
      return (
        examDate.getFullYear() === date.getFullYear() &&
        examDate.getMonth() === date.getMonth() &&
        examDate.getDate() === date.getDate()
      );
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getExamTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      midterm: 'bg-blue-100 text-blue-700 border-blue-200',
      final: 'bg-red-100 text-red-700 border-red-200',
      quiz: 'bg-green-100 text-green-700 border-green-200',
      test: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      practical: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

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
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Exam Schedule
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayExams = getExamsForDate(day.date);
            return (
              <div
                key={idx}
                className={\`min-h-[90px] p-1 border-b border-r border-gray-200 dark:border-gray-700 \${
                  !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                } \${idx % 7 === 6 ? 'border-r-0' : ''}\`}
              >
                <div className={\`text-xs mb-1 text-center \${
                  isToday(day.date)
                    ? 'w-6 h-6 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center'
                    : !day.isCurrentMonth
                    ? 'text-gray-400'
                    : 'text-gray-700 dark:text-gray-300'
                }\`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayExams.slice(0, 2).map((exam: any, i: number) => (
                    <button
                      key={exam.id || i}
                      onClick={() => setSelectedExam(exam)}
                      className={\`w-full text-left px-1.5 py-0.5 text-xs rounded truncate border-l-2 \${getExamTypeColor(exam.type)}\`}
                    >
                      {exam.subject || exam.title}
                    </button>
                  ))}
                  {dayExams.length > 2 && (
                    <button
                      onClick={() => {
                        // Could show a modal with all exams for the day
                      }}
                      className="text-xs text-blue-600 hover:underline pl-1"
                    >
                      +{dayExams.length - 2} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-gray-500">Types:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 border-l-2 border-red-500 rounded-sm" />
            Final
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500 rounded-sm" />
            Midterm
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border-l-2 border-green-500 rounded-sm" />
            Quiz
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-100 border-l-2 border-yellow-500 rounded-sm" />
            Test
          </span>
        </div>
      </div>

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedExam(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedExam.subject || selectedExam.title}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4" />
                <span>{selectedExam.type || 'Exam'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(selectedExam.date || selectedExam.exam_date).toLocaleDateString()}
                  {selectedExam.time && \` at \${selectedExam.time}\`}
                </span>
              </div>
              {selectedExam.duration && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {selectedExam.duration}</span>
                </div>
              )}
              {selectedExam.room && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>Room: {selectedExam.room}</span>
                </div>
              )}
              {selectedExam.topics && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Topics Covered:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedExam.topics}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedExam(null)}
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

export interface ExamListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateExamListToday(options: ExamListTodayOptions = {}): string {
  const { componentName = 'ExamListToday', endpoint = '/exams/today' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Clock, MapPin, Users, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['exams-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const exams = data?.exams || data || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Today's Exams
          </h3>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
        <Link
          to="/exams"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {exams.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {exams.map((exam: any) => (
            <div key={exam.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{exam.subject || exam.title}</h4>
                    {exam.is_mandatory && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <span className={\`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium \${
                    exam.type === 'final' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    exam.type === 'midterm' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }\`}>
                    {exam.type || 'Exam'}
                  </span>
                </div>
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
                  exam.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  exam.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }\`}>
                  {exam.status || 'Scheduled'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exam.time || exam.start_time}
                  {exam.duration && \` (\${exam.duration})\`}
                </span>
                {exam.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Room {exam.room}
                  </span>
                )}
                {exam.students_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {exam.students_count} students
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          No exams scheduled for today
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface TestListUpcomingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTestListUpcoming(options: TestListUpcomingOptions = {}): string {
  const { componentName = 'TestListUpcoming', endpoint = '/exams/upcoming' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Calendar, Clock, MapPin, ChevronRight, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  classId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5, classId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['tests-upcoming', limit, classId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      if (classId) params.append('class_id', classId);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getDaysUntil = (date: string) => {
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return \`In \${diffDays} days\`;
  };

  const getUrgencyColor = (date: string) => {
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (diffDays <= 3) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (diffDays <= 7) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Upcoming Tests & Exams
        </h3>
        <Link
          to="/exams"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {data && data.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((exam: any) => (
            <Link
              key={exam.id}
              to={\`/exams/\${exam.id}\`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Date Badge */}
              <div className="flex-shrink-0 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {new Date(exam.date || exam.exam_date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {new Date(exam.date || exam.exam_date).getDate()}
                  </span>
                </div>
              </div>

              {/* Exam Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {exam.subject || exam.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  {exam.class_name && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {exam.class_name}
                    </span>
                  )}
                  {exam.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.time}
                    </span>
                  )}
                  {exam.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {exam.room}
                    </span>
                  )}
                </div>
              </div>

              {/* Days Until */}
              <span className={\`px-3 py-1 rounded-full text-xs font-medium \${getUrgencyColor(exam.date || exam.exam_date)}\`}>
                {getDaysUntil(exam.date || exam.exam_date)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          No upcoming tests or exams
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
