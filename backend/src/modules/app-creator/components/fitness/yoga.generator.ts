/**
 * Yoga Component Generators
 */

export interface YogaOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClassCalendarYoga(options: YogaOptions = {}): string {
  const { componentName = 'ClassCalendarYoga', endpoint = '/yoga/classes' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, Clock, User, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface YogaClass {
  id: string;
  name: string;
  instructor_name: string;
  start_time: string;
  end_time: string;
  duration: number;
  location: string;
  style: string;
  level: string;
  spots_left: number;
  capacity: number;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: classes, isLoading } = useQuery({
    queryKey: ['yoga-calendar', year, month],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?year=\${year}&month=\${month + 1}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getClassesForDay = (day: number) => {
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return (classes || []).filter((c: YogaClass) => c.start_time?.startsWith(dateStr));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const selectedClasses = selectedDate ? (classes || []).filter((c: YogaClass) => c.start_time?.startsWith(selectedDate)) : [];

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
        <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[month]} {year}
        </h2>
        <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={\`blank-\${i}\`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dayClasses = getClassesForDay(day);
            const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={\`aspect-square p-1 rounded-lg text-sm relative transition-colors \${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : isToday
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }\`}
              >
                {day}
                {dayClasses.length > 0 && (
                  <span className={\`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full \${
                    isSelected ? 'bg-white' : 'bg-purple-600'
                  }\`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Classes on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedClasses.length > 0 ? (
            <div className="space-y-3">
              {selectedClasses.map((cls: YogaClass) => (
                <Link
                  key={cls.id}
                  to={\`/yoga/classes/\${cls.id}\`}
                  className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{cls.name}</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                      {cls.style}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(cls.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {cls.instructor_name}
                    </span>
                    {cls.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {cls.location}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No classes scheduled for this day</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateClassListTodayYoga(options: YogaOptions = {}): string {
  const { componentName = 'ClassListTodayYoga', endpoint = '/yoga/classes/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, User, MapPin, Users, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface YogaClass {
  id: string;
  name: string;
  instructor_name: string;
  start_time: string;
  duration: number;
  location: string;
  style: string;
  level: string;
  spots_left: number;
  capacity: number;
  description?: string;
}

const ${componentName}: React.FC = () => {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['yoga-classes-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Classes</h2>
        </div>
        <Link to="/yoga/schedule" className="text-sm text-purple-600 hover:text-purple-700">
          View Full Schedule
        </Link>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {classes && classes.length > 0 ? (
          classes.map((cls: YogaClass) => (
            <Link
              key={cls.id}
              to={\`/yoga/classes/\${cls.id}\`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[70px]">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(cls.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500">{cls.duration} min</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{cls.name}</h3>
                    {cls.level && (
                      <span className={\`text-xs px-2 py-0.5 rounded \${getLevelColor(cls.level)}\`}>
                        {cls.level}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {cls.instructor_name}
                    </span>
                    {cls.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cls.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cls.spots_left} spots left
                    </span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                Book
              </button>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No yoga classes scheduled for today
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateInstructorProfileYoga(options: YogaOptions = {}): string {
  const { componentName = 'InstructorProfileYoga', endpoint = '/yoga/instructors' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, Award, Calendar, Clock, Heart, Instagram, Globe } from 'lucide-react';
import { api } from '@/lib/api';

interface Instructor {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  specialty: string;
  styles: string[];
  experience_years: number;
  certifications: string[];
  rating: number;
  reviews_count: number;
  classes_count: number;
  students_count: number;
  instagram?: string;
  website?: string;
  philosophy?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: instructor, isLoading } = useQuery({
    queryKey: ['yoga-instructor', id],
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

  if (!instructor) {
    return <div className="text-center py-12 text-gray-500">Instructor not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center text-white">
        {instructor.avatar_url ? (
          <img src={instructor.avatar_url} alt={instructor.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-16 h-16" />
          </div>
        )}
        <h1 className="text-2xl font-bold">{instructor.name}</h1>
        {instructor.specialty && <p className="opacity-90">{instructor.specialty}</p>}
        {instructor.rating && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-medium">{instructor.rating}</span>
            {instructor.reviews_count && <span className="opacity-75">({instructor.reviews_count} reviews)</span>}
          </div>
        )}
        <div className="flex justify-center gap-3 mt-4">
          {instructor.instagram && (
            <a href={\`https://instagram.com/\${instructor.instagram}\`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {instructor.website && (
            <a href={instructor.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{instructor.experience_years || 0}</p>
            <p className="text-sm text-gray-500">Years Teaching</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{instructor.classes_count || 0}</p>
            <p className="text-sm text-gray-500">Classes Taught</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{instructor.students_count || 0}</p>
            <p className="text-sm text-gray-500">Students</p>
          </div>
        </div>
        {instructor.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{instructor.bio}</p>
          </div>
        )}
        {instructor.philosophy && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Teaching Philosophy
            </h3>
            <p className="text-gray-600 dark:text-gray-400 italic">"{instructor.philosophy}"</p>
          </div>
        )}
        {instructor.styles && instructor.styles.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Yoga Styles</h3>
            <div className="flex flex-wrap gap-2">
              {instructor.styles.map((style: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}
        {instructor.certifications && instructor.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {instructor.certifications.map((cert: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  <Award className="w-3 h-3" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
        <Link
          to={\`/yoga/schedule?instructor=\${instructor.id}\`}
          className="block w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center font-medium transition-colors"
        >
          <Calendar className="w-5 h-5 inline mr-2" />
          View Schedule
        </Link>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateInstructorScheduleYoga(options: YogaOptions = {}): string {
  const { componentName = 'InstructorScheduleYoga', endpoint = '/yoga/instructors' } = options;

  return `import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Clock, MapPin, Users, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { api } from '@/lib/api';

interface ScheduleClass {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  duration: number;
  location: string;
  style: string;
  level: string;
  spots_left: number;
  capacity: number;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = () => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    const monday = new Date(today);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-schedule', id, startDate, endDate],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/schedule?start=\${startDate}&end=\${endDate}\`);
      return response?.data || response;
    },
  });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getClassesForDay = (dateStr: string) => {
    return (data?.classes || []).filter((c: ScheduleClass) => c.start_time?.startsWith(dateStr));
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
      {data?.instructor && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
          {data.instructor.avatar_url ? (
            <img src={data.instructor.avatar_url} alt={data.instructor.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{data.instructor.name}</h2>
            <p className="text-sm text-gray-500">{data.instructor.specialty}</p>
          </div>
        </div>
      )}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-medium text-gray-900 dark:text-white">
          {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {weekDates.map((dateStr, i) => {
          const dayClasses = getClassesForDay(dateStr);
          const date = new Date(dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div key={dateStr} className={\`p-4 \${isToday ? 'bg-purple-50 dark:bg-purple-900/10' : ''}\`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={\`text-center min-w-[50px] \${isToday ? 'text-purple-600' : 'text-gray-500'}\`}>
                  <p className="text-xs font-medium">{dayNames[i]}</p>
                  <p className="text-lg font-bold">{date.getDate()}</p>
                </div>
                {dayClasses.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No classes scheduled</p>
                )}
              </div>
              {dayClasses.length > 0 && (
                <div className="space-y-2 ml-[66px]">
                  {dayClasses.map((cls: ScheduleClass) => (
                    <Link
                      key={cls.id}
                      to={\`/yoga/classes/\${cls.id}\`}
                      className="block p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{cls.name}</span>
                        <span className="text-sm text-purple-600 font-medium">
                          {new Date(cls.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.duration} min
                        </span>
                        {cls.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {cls.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cls.spots_left}/{cls.capacity}
                        </span>
                      </div>
                    </Link>
                  ))}
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

export function generateMemberProfileYoga(options: YogaOptions = {}): string {
  const { componentName = 'MemberProfileYoga', endpoint = '/yoga/members' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, User, Calendar, Clock, Flame, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface MemberProfile {
  id: string;
  name: string;
  avatar_url?: string;
  email: string;
  member_since: string;
  membership_type: string;
  total_classes: number;
  total_hours: number;
  current_streak: number;
  favorite_style?: string;
  favorite_instructor?: string;
  achievements: { id: string; name: string; icon: string; earned_at: string }[];
  upcoming_classes: { id: string; name: string; instructor_name: string; start_time: string }[];
  recent_classes: { id: string; name: string; date: string; duration: number }[];
}

const ${componentName}: React.FC = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['yoga-member-profile'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/me');
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

  if (!profile) {
    return <div className="text-center py-12 text-gray-500">Profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-4 border-white" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="opacity-90">{profile.membership_type} Member</p>
              <p className="text-sm opacity-75">Member since {new Date(profile.member_since).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700">
          <div className="p-4 text-center">
            <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_classes}</p>
            <p className="text-xs text-gray-500">Classes</p>
          </div>
          <div className="p-4 text-center">
            <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_hours}h</p>
            <p className="text-xs text-gray-500">Practice Time</p>
          </div>
          <div className="p-4 text-center">
            <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.current_streak}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
          <div className="p-4 text-center">
            <Award className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.achievements?.length || 0}</p>
            <p className="text-xs text-gray-500">Achievements</p>
          </div>
        </div>
      </div>

      {profile.upcoming_classes && profile.upcoming_classes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Classes</h2>
            <Link to="/yoga/my-bookings" className="text-sm text-purple-600 hover:text-purple-700">View All</Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {profile.upcoming_classes.slice(0, 3).map((cls: any) => (
              <Link
                key={cls.id}
                to={\`/yoga/classes/\${cls.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{cls.name}</p>
                  <p className="text-sm text-gray-500">with {cls.instructor_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-600 font-medium">
                    {new Date(cls.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {profile.achievements && profile.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Achievements</h2>
          <div className="grid grid-cols-4 gap-4">
            {profile.achievements.map((achievement: any) => (
              <div key={achievement.id} className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">{achievement.icon || '🏆'}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{achievement.name}</p>
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

export function generatePublicScheduleYoga(options: YogaOptions = {}): string {
  const { componentName = 'PublicScheduleYoga', endpoint = '/yoga/schedule' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, User, MapPin, Users, Filter, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';

interface YogaClass {
  id: string;
  name: string;
  instructor_name: string;
  instructor_id: string;
  start_time: string;
  duration: number;
  location: string;
  style: string;
  level: string;
  spots_left: number;
  capacity: number;
}

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [styleFilter, setStyleFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['yoga-schedule', selectedDate, styleFilter, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ date: selectedDate });
      if (styleFilter) params.append('style', styleFilter);
      if (levelFilter) params.append('level', levelFilter);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response;
    },
  });

  const classes = Array.isArray(data) ? data : (data?.classes || []);
  const styles = data?.styles || ['Vinyasa', 'Hatha', 'Yin', 'Power', 'Restorative', 'Ashtanga', 'Hot Yoga'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
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
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDates.map((date) => {
            const d = new Date(date);
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={\`flex flex-col items-center px-4 py-2 rounded-lg min-w-[60px] transition-colors \${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }\`}
              >
                <span className="text-xs">{dayNames[d.getDay()]}</span>
                <span className="text-lg font-semibold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={\`w-4 h-4 transition-transform \${showFilters ? 'rotate-180' : ''}\`} />
        </button>
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            >
              <option value="">All Styles</option>
              {styles.map((style: string) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {(styleFilter || levelFilter) && (
              <button
                onClick={() => { setStyleFilter(''); setLevelFilter(''); }}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {classes.length > 0 ? (
            classes.map((cls: YogaClass) => (
              <Link
                key={cls.id}
                to={\`/yoga/classes/\${cls.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[70px]">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(cls.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500">{cls.duration} min</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{cls.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                        {cls.style}
                      </span>
                      {cls.level && (
                        <span className={\`text-xs px-2 py-0.5 rounded \${getLevelColor(cls.level)}\`}>
                          {cls.level}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Link
                        to={\`/yoga/instructors/\${cls.instructor_id}\`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-purple-600"
                      >
                        <User className="w-3 h-3" />
                        {cls.instructor_name}
                      </Link>
                      {cls.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {cls.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cls.spots_left} spots left
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Book
                </button>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No classes found for this day
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateYogaStats(options: YogaOptions = {}): string {
  const { componentName = 'YogaStats', endpoint = '/yoga/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, Clock, Flame, TrendingUp, Award, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface YogaStatsData {
  total_members: number;
  active_members: number;
  classes_today: number;
  classes_this_week: number;
  total_hours_taught: number;
  average_class_rating: number;
  top_style: string;
  instructor_count: number;
  monthly_growth: number;
  total_bookings_today: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['yoga-stats'],
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

  const statItems = [
    { icon: Users, label: 'Total Members', value: stats?.total_members || 0, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', change: stats?.monthly_growth ? \`+\${stats.monthly_growth}%\` : null },
    { icon: Calendar, label: 'Classes Today', value: stats?.classes_today || 0, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { icon: Clock, label: 'Hours Taught', value: stats?.total_hours_taught || 0, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { icon: Star, label: 'Avg Rating', value: stats?.average_class_rating?.toFixed(1) || '-', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: Flame, label: 'Bookings Today', value: stats?.total_bookings_today || 0, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
    { icon: Award, label: 'Instructors', value: stats?.instructor_count || 0, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${stat.color}\`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.change && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats?.top_style && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Most Popular Style</h3>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.top_style}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Members</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.active_members || 0}</p>
          <p className="text-xs text-gray-500">practiced this week</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Weekly Classes</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.classes_this_week || 0}</p>
          <p className="text-xs text-gray-500">scheduled this week</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
