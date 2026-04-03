/**
 * Dance Studio Component Generators
 */

export interface DanceOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClassFiltersDance(options: DanceOptions = {}): string {
  const componentName = options.componentName || 'ClassFiltersDance';

  return `import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface ${componentName}Props {
  style: string;
  onStyleChange: (value: string) => void;
  level: string;
  onLevelChange: (value: string) => void;
  instructor: string;
  onInstructorChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  styles?: string[];
  levels?: string[];
  instructors?: { id: string; name: string }[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  style,
  onStyleChange,
  level,
  onLevelChange,
  instructor,
  onInstructorChange,
  searchQuery,
  onSearchChange,
  styles = ['All', 'Hip Hop', 'Ballet', 'Jazz', 'Contemporary', 'Salsa', 'Bachata', 'Ballroom', 'K-Pop', 'Breaking', 'Tap'],
  levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
  instructors = [],
}) => {
  const hasActiveFilters = style || level || instructor || searchQuery;

  const clearAll = () => {
    onStyleChange('');
    onLevelChange('');
    onInstructorChange('');
    onSearchChange('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search classes..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Dance Style</label>
          <select
            value={style}
            onChange={(e) => onStyleChange(e.target.value === 'All' ? '' : e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {styles.map((s) => (
              <option key={s} value={s === 'All' ? '' : s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
          <select
            value={level}
            onChange={(e) => onLevelChange(e.target.value === 'All Levels' ? '' : e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {levels.map((l) => (
              <option key={l} value={l === 'All Levels' ? '' : l}>{l}</option>
            ))}
          </select>
        </div>

        {instructors.length > 0 && (
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Instructor</label>
            <select
              value={instructor}
              onChange={(e) => onInstructorChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Instructors</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {style && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded text-xs">
                {style}
                <button onClick={() => onStyleChange('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {level && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded text-xs">
                {level}
                <button onClick={() => onLevelChange('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {instructor && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded text-xs">
                Instructor: {instructors.find(i => i.id === instructor)?.name}
                <button onClick={() => onInstructorChange('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
          <button onClick={clearAll} className="text-sm text-pink-600 hover:text-pink-700">
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateInstructorProfileDance(options: DanceOptions = {}): string {
  const { componentName = 'InstructorProfileDance', endpoint = '/dance/instructors' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, Award, Calendar, Clock, Music, Instagram, Youtube, Play } from 'lucide-react';
import { api } from '@/lib/api';

interface Instructor {
  id: string;
  name: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  specialty: string;
  styles: string[];
  experience_years: number;
  achievements: string[];
  rating: number;
  reviews_count: number;
  classes_count: number;
  students_count: number;
  instagram?: string;
  youtube?: string;
  demo_video_url?: string;
  upcoming_workshops?: { id: string; name: string; date: string }[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: instructor, isLoading } = useQuery({
    queryKey: ['dance-instructor', id],
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
      <div className="relative">
        {instructor.cover_url ? (
          <img src={instructor.cover_url} alt="" className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-pink-500 to-purple-500" />
        )}
        <div className="absolute -bottom-16 left-6">
          {instructor.avatar_url ? (
            <img src={instructor.avatar_url} alt={instructor.name} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center border-4 border-white dark:border-gray-800">
              <User className="w-16 h-16 text-pink-600" />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {instructor.instagram && (
            <a href={\`https://instagram.com/\${instructor.instagram}\`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors">
              <Instagram className="w-5 h-5 text-pink-600" />
            </a>
          )}
          {instructor.youtube && (
            <a href={instructor.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors">
              <Youtube className="w-5 h-5 text-red-600" />
            </a>
          )}
        </div>
      </div>

      <div className="pt-20 px-6 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.name}</h1>
            {instructor.specialty && (
              <p className="text-pink-600 font-medium">{instructor.specialty}</p>
            )}
          </div>
          {instructor.rating && (
            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium text-yellow-700 dark:text-yellow-400">{instructor.rating}</span>
              {instructor.reviews_count && (
                <span className="text-xs text-gray-500">({instructor.reviews_count})</span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.experience_years || 0}</p>
            <p className="text-xs text-gray-500">Years Experience</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.classes_count || 0}</p>
            <p className="text-xs text-gray-500">Classes Taught</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.students_count || 0}</p>
            <p className="text-xs text-gray-500">Students</p>
          </div>
        </div>

        {instructor.demo_video_url && (
          <div className="mb-6">
            <a
              href={instructor.demo_video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Play className="w-5 h-5" />
              Watch Demo Reel
            </a>
          </div>
        )}

        {instructor.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{instructor.bio}</p>
          </div>
        )}

        {instructor.styles && instructor.styles.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-pink-500" />
              Dance Styles
            </h3>
            <div className="flex flex-wrap gap-2">
              {instructor.styles.map((style: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full text-sm">
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}

        {instructor.achievements && instructor.achievements.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Achievements
            </h3>
            <ul className="space-y-2">
              {instructor.achievements.map((achievement: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-yellow-500 mt-1">*</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {instructor.upcoming_workshops && instructor.upcoming_workshops.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Upcoming Workshops</h3>
            <div className="space-y-2">
              {instructor.upcoming_workshops.map((workshop: any) => (
                <Link
                  key={workshop.id}
                  to={\`/dance/workshops/\${workshop.id}\`}
                  className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{workshop.name}</p>
                  <p className="text-sm text-gray-500">{new Date(workshop.date).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to={\`/dance/schedule?instructor=\${instructor.id}\`}
            className="flex-1 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-center font-medium transition-colors"
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            View Schedule
          </Link>
          <button className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Star className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateScheduleCalendarDance(options: DanceOptions = {}): string {
  const { componentName = 'ScheduleCalendarDance', endpoint = '/dance/schedule' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, Clock, User, MapPin, Music } from 'lucide-react';
import { api } from '@/lib/api';

interface DanceClass {
  id: string;
  name: string;
  instructor_name: string;
  instructor_id: string;
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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: classes, isLoading } = useQuery({
    queryKey: ['dance-schedule', year, month, viewMode],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?year=\${year}&month=\${month + 1}&view=\${viewMode}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const getMonthDates = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const blanks = Array.from({ length: firstDay }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      return \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(i + 1).padStart(2, '0')}\`;
    });
    return [...blanks, ...days];
  };

  const dates = viewMode === 'week' ? getWeekDates() : getMonthDates();

  const getClassesForDay = (dateStr: string | null) => {
    if (!dateStr) return [];
    return (classes || []).filter((c: DanceClass) => c.start_time?.startsWith(dateStr));
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const getStyleColor = (style: string) => {
    const colors: Record<string, string> = {
      'Hip Hop': 'bg-orange-500',
      'Ballet': 'bg-pink-500',
      'Jazz': 'bg-purple-500',
      'Contemporary': 'bg-blue-500',
      'Salsa': 'bg-red-500',
      'Bachata': 'bg-rose-500',
      'Ballroom': 'bg-amber-500',
      'K-Pop': 'bg-violet-500',
      'Breaking': 'bg-emerald-500',
      'Tap': 'bg-cyan-500',
    };
    return colors[style] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const selectedClasses = selectedDate ? getClassesForDay(selectedDate) : [];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
              {viewMode === 'week'
                ? \`Week of \${new Date(dates[0] || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}\`
                : \`\${monthNames[month]} \${year}\`
              }
            </h2>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
                viewMode === 'week' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }\`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
                viewMode === 'month' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }\`}
            >
              Month
            </button>
          </div>
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
            {dates.map((dateStr, i) => {
              if (!dateStr) {
                return <div key={\`blank-\${i}\`} className="aspect-square" />;
              }
              const dayClasses = getClassesForDay(dateStr);
              const date = new Date(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={\`aspect-square p-1 rounded-lg text-sm relative transition-colors flex flex-col items-center \${
                    isSelected
                      ? 'bg-pink-600 text-white'
                      : isToday
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }\`}
                >
                  <span>{date.getDate()}</span>
                  {dayClasses.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayClasses.slice(0, 3).map((cls: DanceClass, j: number) => (
                        <span key={j} className={\`w-1.5 h-1.5 rounded-full \${isSelected ? 'bg-white' : getStyleColor(cls.style)}\`} />
                      ))}
                      {dayClasses.length > 3 && (
                        <span className="text-[8px] ml-0.5">+{dayClasses.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {selectedClasses.length > 0 ? (
              selectedClasses.map((cls: DanceClass) => (
                <Link
                  key={cls.id}
                  to={\`/dance/classes/\${cls.id}\`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={\`w-1 h-12 rounded-full \${getStyleColor(cls.style)}\`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{cls.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          {cls.style}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(cls.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
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
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors">
                    Book
                  </button>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Music className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                No classes scheduled for this day
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateStudentProfileDance(options: DanceOptions = {}): string {
  const { componentName = 'StudentProfileDance', endpoint = '/dance/students' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, User, Calendar, Clock, Award, Music, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface StudentProfile {
  id: string;
  name: string;
  avatar_url?: string;
  email: string;
  member_since: string;
  membership_type: string;
  total_classes: number;
  total_hours: number;
  current_level: string;
  favorite_style?: string;
  favorite_instructor?: { id: string; name: string; avatar_url?: string };
  styles_practiced: { style: string; classes_count: number }[];
  achievements: { id: string; name: string; icon: string; earned_at: string }[];
  upcoming_classes: { id: string; name: string; instructor_name: string; start_time: string; style: string }[];
  progress: { skill: string; level: number; max_level: number }[];
}

const ${componentName}: React.FC = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['dance-student-profile'],
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

  const getStyleColor = (style: string) => {
    const colors: Record<string, string> = {
      'Hip Hop': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'Ballet': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      'Jazz': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'Contemporary': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'Salsa': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[style] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white">
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
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-white/20 rounded text-sm">{profile.current_level}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
          <div className="p-4 text-center">
            <Calendar className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_classes}</p>
            <p className="text-xs text-gray-500">Classes</p>
          </div>
          <div className="p-4 text-center">
            <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_hours}h</p>
            <p className="text-xs text-gray-500">Dance Time</p>
          </div>
          <div className="p-4 text-center">
            <Award className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.achievements?.length || 0}</p>
            <p className="text-xs text-gray-500">Badges</p>
          </div>
        </div>
      </div>

      {profile.styles_practiced && profile.styles_practiced.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-600" />
            Styles Practiced
          </h2>
          <div className="space-y-3">
            {profile.styles_practiced.map((item: any) => (
              <div key={item.style}>
                <div className="flex items-center justify-between mb-1">
                  <span className={\`text-sm px-2 py-0.5 rounded \${getStyleColor(item.style)}\`}>{item.style}</span>
                  <span className="text-sm text-gray-500">{item.classes_count} classes</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                    style={{ width: \`\${Math.min((item.classes_count / 50) * 100, 100)}%\` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.progress && profile.progress.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Skill Progress
          </h2>
          <div className="space-y-4">
            {profile.progress.map((item: any) => (
              <div key={item.skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.skill}</span>
                  <span className="text-xs text-gray-500">Level {item.level}/{item.max_level}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: item.max_level }, (_, i) => (
                    <div
                      key={i}
                      className={\`flex-1 h-2 rounded-full \${
                        i < item.level ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }\`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.favorite_instructor && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Favorite Instructor
          </h2>
          <Link
            to={\`/dance/instructors/\${profile.favorite_instructor.id}\`}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            {profile.favorite_instructor.avatar_url ? (
              <img src={profile.favorite_instructor.avatar_url} alt={profile.favorite_instructor.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <User className="w-6 h-6 text-pink-600" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{profile.favorite_instructor.name}</p>
              <p className="text-sm text-gray-500">View profile</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      )}

      {profile.upcoming_classes && profile.upcoming_classes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Classes</h2>
            <Link to="/dance/my-bookings" className="text-sm text-pink-600 hover:text-pink-700">View All</Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {profile.upcoming_classes.slice(0, 3).map((cls: any) => (
              <Link
                key={cls.id}
                to={\`/dance/classes/\${cls.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">{cls.name}</p>
                    <span className={\`text-xs px-2 py-0.5 rounded \${getStyleColor(cls.style)}\`}>{cls.style}</span>
                  </div>
                  <p className="text-sm text-gray-500">with {cls.instructor_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-pink-600 font-medium">
                    {new Date(cls.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
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

export function generateDanceStudioStats(options: DanceOptions = {}): string {
  const { componentName = 'DanceStudioStats', endpoint = '/dance/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, Clock, Music, TrendingUp, Award, Star, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

interface StudioStats {
  total_students: number;
  active_students: number;
  total_instructors: number;
  classes_today: number;
  classes_this_week: number;
  total_hours_taught: number;
  average_class_rating: number;
  popular_styles: { style: string; count: number }[];
  monthly_growth: number;
  total_bookings_today: number;
  revenue_this_month?: number;
  new_students_this_month: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dance-studio-stats'],
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
    { icon: Users, label: 'Total Students', value: stats?.total_students || 0, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', change: stats?.monthly_growth ? \`+\${stats.monthly_growth}%\` : null },
    { icon: Calendar, label: 'Classes Today', value: stats?.classes_today || 0, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { icon: Clock, label: 'Hours Taught', value: stats?.total_hours_taught || 0, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { icon: Star, label: 'Avg Rating', value: stats?.average_class_rating?.toFixed(1) || '-', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: Music, label: 'Instructors', value: stats?.total_instructors || 0, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
    { icon: Award, label: 'New Students', value: stats?.new_students_this_month || 0, color: 'text-green-600 bg-green-100 dark:bg-green-900/30', subtitle: 'this month' },
  ];

  const getStyleColor = (index: number) => {
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500'];
    return colors[index % colors.length];
  };

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
            {stat.subtitle && <p className="text-xs text-gray-400">{stat.subtitle}</p>}
          </div>
        ))}
      </div>

      {stats?.popular_styles && stats.popular_styles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-600" />
            Popular Dance Styles
          </h3>
          <div className="space-y-3">
            {stats.popular_styles.slice(0, 5).map((item: any, index: number) => {
              const maxCount = Math.max(...stats.popular_styles.map((s: any) => s.count));
              const percentage = (item.count / maxCount) * 100;

              return (
                <div key={item.style}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.style}</span>
                    <span className="text-sm text-gray-500">{item.count} classes</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`\${getStyleColor(index)} h-2 rounded-full transition-all\`}
                      style={{ width: \`\${percentage}%\` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Students</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.active_students || 0}</p>
          <p className="text-xs text-gray-500">attended this week</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Weekly Classes</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.classes_this_week || 0}</p>
          <p className="text-xs text-gray-500">scheduled this week</p>
        </div>
      </div>

      {stats?.revenue_this_month !== undefined && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-sm p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Revenue This Month</p>
              <p className="text-3xl font-bold">\${stats.revenue_this_month.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
