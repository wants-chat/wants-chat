/**
 * Driving School Component Generators
 *
 * Generates driving education-related components.
 * Components: LessonCalendarDriving, LessonListTodayDriving, StudentProfileDriving, DrivingStats
 */

export interface LessonCalendarDrivingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLessonCalendarDriving(options: LessonCalendarDrivingOptions = {}): string {
  const { componentName = 'LessonCalendarDriving', endpoint = '/driving/lessons' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Car, Clock, User, MapPin, X } from 'lucide-react';
import { api } from '@/lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ${componentName}Props {
  instructorId?: string;
  studentId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId, studentId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['driving-lessons-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), instructorId, studentId],
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

  const getLessonsForDate = (date: Date) => {
    if (!lessons) return [];
    return lessons.filter((lesson: any) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate.toDateString() === date.toDateString();
    });
  };

  const getLessonTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      theory: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      practical: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      highway: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      parking: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      test: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
            <Car className="w-5 h-5 text-blue-600" />
            Lesson Schedule
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
            const dayLessons = getLessonsForDate(day.date);
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
                  {dayLessons.slice(0, 2).map((lesson: any, i: number) => (
                    <button
                      key={lesson.id || i}
                      onClick={() => setSelectedLesson(lesson)}
                      className={\`w-full text-left px-2 py-1 text-xs rounded truncate hover:opacity-80 \${getLessonTypeColor(lesson.type)}\`}
                    >
                      {lesson.time} - {lesson.type}
                    </button>
                  ))}
                  {dayLessons.length > 2 && (
                    <span className="text-xs text-gray-500 pl-2">+{dayLessons.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 rounded" /> Theory</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> Practical</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 rounded" /> Highway</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 rounded" /> Parking</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded" /> Test</span>
        </div>
      </div>

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedLesson(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <button onClick={() => setSelectedLesson(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              {selectedLesson.type} Lesson
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{selectedLesson.student_name || selectedLesson.instructor_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(selectedLesson.date).toLocaleDateString()} at {selectedLesson.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Duration: {selectedLesson.duration || 60} minutes</span>
              </div>
              {selectedLesson.vehicle && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Car className="w-4 h-4" />
                  <span>{selectedLesson.vehicle}</span>
                </div>
              )}
              {selectedLesson.pickup_location && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedLesson.pickup_location}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedLesson(null)}
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

export interface LessonListTodayDrivingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLessonListTodayDriving(options: LessonListTodayDrivingOptions = {}): string {
  const { componentName = 'LessonListTodayDriving', endpoint = '/driving/lessons/today' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Car, Clock, User, MapPin, ChevronRight, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  instructorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['driving-lessons-today', instructorId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (instructorId) url += \`?instructor_id=\${instructorId}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const getLessonStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'in-progress': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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

  const lessons = data?.lessons || data || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Today's Lessons
          </h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>
        <Link
          to="/driving/schedule"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {lessons.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {lessons.map((lesson: any) => (
            <Link
              key={lesson.id}
              to={\`/driving/lessons/\${lesson.id}\`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{lesson.type} Lesson</p>
                  <span className={\`px-2 py-0.5 rounded text-xs font-medium \${getLessonStatusColor(lesson.status)}\`}>
                    {lesson.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {lesson.student_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {lesson.time} ({lesson.duration || 60} min)
                  </span>
                  {lesson.pickup_location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {lesson.pickup_location}
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
          <Car className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          No lessons scheduled for today
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface StudentProfileDrivingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileDriving(options: StudentProfileDrivingOptions = {}): string {
  const { componentName = 'StudentProfileDriving', endpoint = '/driving/students' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Car, Calendar, Clock, CheckCircle, AlertCircle, Target, Award } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['driving-student', id],
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

  const getLicenseStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'test-ready': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      licensed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return colors[status?.toLowerCase()] || colors.pending;
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
              <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getLicenseStatusColor(student.status)}\`}>
                {student.status || 'In Progress'}
              </span>
            </div>
            {student.license_type && (
              <p className="text-gray-500 mt-1">License Type: {student.license_type}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {student.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{student.email}</span>}
              {student.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{student.phone}</span>}
              {student.enrollment_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <Link
            to={\`/driving/lessons/new?student_id=\${student.id}\`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schedule Lesson
          </Link>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.lessons_completed || 0}</p>
          <p className="text-sm text-gray-500">Lessons Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.driving_hours || 0}h</p>
          <p className="text-sm text-gray-500">Total Hours</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.theory_score || 'N/A'}</p>
          <p className="text-sm text-gray-500">Theory Score</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
            <Car className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.practical_progress || 0}%</p>
          <p className="text-sm text-gray-500">Practical Progress</p>
        </div>
      </div>

      {/* Skills Checklist */}
      {student.skills && student.skills.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills Progress</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {student.skills.map((skill: any, i: number) => (
              <div
                key={i}
                className={\`flex items-center gap-3 p-3 rounded-lg \${
                  skill.completed
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }\`}
              >
                {skill.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className={\`\${skill.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500'}\`}>
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test History */}
      {student.test_attempts && student.test_attempts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Test History</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {student.test_attempts.map((test: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{test.type} Test</p>
                  <p className="text-sm text-gray-500">{new Date(test.date).toLocaleDateString()}</p>
                </div>
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
                  test.passed
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }\`}>
                  {test.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
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

export interface DrivingStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDrivingStats(options: DrivingStatsOptions = {}): string {
  const { componentName = 'DrivingStats', endpoint = '/driving/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Car, Calendar, Award, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  instructorId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId, className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['driving-stats', instructorId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (instructorId) url += \`?instructor_id=\${instructorId}\`;
      const response = await api.get<any>(url);
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
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.lessons_this_month || 0}</p>
              <p className="text-sm text-gray-500">Lessons This Month</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_hours || 0}h</p>
              <p className="text-sm text-gray-500">Teaching Hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.vehicles_count || 0}</p>
              <p className="text-sm text-gray-500">Vehicles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pass Rates */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-200" />
            <span className="text-green-100">Theory Pass Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats?.theory_pass_rate || 0}%</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-blue-200" />
            <span className="text-blue-100">Practical Pass Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats?.practical_pass_rate || 0}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-200" />
            <span className="text-purple-100">Avg. Lessons to License</span>
          </div>
          <p className="text-3xl font-bold">{stats?.avg_lessons_to_pass || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
