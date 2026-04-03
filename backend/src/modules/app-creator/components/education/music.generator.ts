/**
 * Music School Component Generators
 *
 * Generates music education-related components.
 * Components: InstructorProfileMusic, InstructorScheduleMusic, LessonCalendarMusic,
 *             StudentProfileMusic, StudentProgressMusic, MusicSchoolStats, SearchResultsMusic
 */

export interface InstructorProfileMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInstructorProfileMusic(options: InstructorProfileMusicOptions = {}): string {
  const { componentName = 'InstructorProfileMusic', endpoint = '/music/instructors' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Music, Star, Clock, Award, Video, Calendar, Play } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: instructor, isLoading } = useQuery({
    queryKey: ['music-instructor', id],
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {instructor.avatar_url ? (
            <img src={instructor.avatar_url} alt={instructor.name} className="w-32 h-32 rounded-xl object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Music className="w-16 h-16 text-purple-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.name}</h1>
            <p className="text-gray-500">{instructor.title || 'Music Instructor'}</p>

            {/* Rating */}
            {instructor.rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={\`w-4 h-4 \${i < Math.floor(instructor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
                    />
                  ))}
                </div>
                <span className="font-medium">{instructor.rating}</span>
                {instructor.reviews_count && (
                  <span className="text-gray-500">({instructor.reviews_count} reviews)</span>
                )}
              </div>
            )}

            {/* Instruments */}
            {instructor.instruments && instructor.instruments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {instructor.instruments.map((inst: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              {instructor.experience_years && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {instructor.experience_years} years experience
                </span>
              )}
              {instructor.students_count && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {instructor.students_count} students
                </span>
              )}
              {instructor.offers_online && (
                <span className="flex items-center gap-1 text-green-600">
                  <Video className="w-4 h-4" />
                  Online lessons available
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={\`/music/book/\${instructor.id}\`}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-center"
            >
              Book Lesson
            </Link>
            <p className="text-center text-lg font-bold text-gray-900 dark:text-white">
              \${instructor.hourly_rate || 50}/hour
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {instructor.bio && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{instructor.bio}</p>
        </div>
      )}

      {/* Teaching Style & Genres */}
      <div className="grid md:grid-cols-2 gap-6">
        {instructor.teaching_style && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teaching Style</h2>
            <p className="text-gray-600 dark:text-gray-400">{instructor.teaching_style}</p>
          </div>
        )}

        {instructor.genres && instructor.genres.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {instructor.genres.map((genre: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sample Performances */}
      {instructor.sample_videos && instructor.sample_videos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sample Performances</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructor.sample_videos.map((video: any, i: number) => (
              <div key={i} className="relative group">
                <img
                  src={video.thumbnail || '/placeholder-video.jpg'}
                  alt={video.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <p className="mt-2 text-sm text-gray-900 dark:text-white">{video.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qualifications */}
      {instructor.qualifications && instructor.qualifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualifications</h2>
          <div className="space-y-3">
            {instructor.qualifications.map((qual: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{qual.title || qual}</p>
                  {qual.institution && <p className="text-sm text-gray-500">{qual.institution}</p>}
                </div>
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

export interface InstructorScheduleMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInstructorScheduleMusic(options: InstructorScheduleMusicOptions = {}): string {
  const { componentName = 'InstructorScheduleMusic', endpoint = '/music/instructors' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Music, User, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  instructorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId: propId }) => {
  const { id } = useParams<{ id: string }>();
  const instructorId = propId || id;
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['music-instructor-schedule', instructorId, currentWeek.toISOString()],
    queryFn: async () => {
      const weekStart = getWeekDates()[0].toISOString().split('T')[0];
      const weekEnd = getWeekDates()[6].toISOString().split('T')[0];
      const response = await api.get<any>(\`${endpoint}/\${instructorId}/schedule?start=\${weekStart}&end=\${weekEnd}\`);
      return response?.data || response;
    },
  });

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const weekDates = getWeekDates();
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

  const getLessonForSlot = (date: Date, time: string) => {
    if (!schedule?.lessons) return null;
    const dateStr = date.toISOString().split('T')[0];
    return schedule.lessons.find((l: any) => l.date === dateStr && l.time === time);
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-600" />
          Lesson Schedule
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="w-20 p-3 text-left text-xs font-medium text-gray-500">Time</th>
              {weekDates.map((date, i) => (
                <th key={i} className={\`p-3 text-center \${isToday(date) ? 'bg-purple-50 dark:bg-purple-900/20' : ''}\`}>
                  <div className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={\`text-lg font-bold \${isToday(date) ? 'text-purple-600' : 'text-gray-900 dark:text-white'}\`}>
                    {date.getDate()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 text-sm text-gray-500">{time}</td>
                {weekDates.map((date, i) => {
                  const lesson = getLessonForSlot(date, time);
                  return (
                    <td key={i} className={\`p-1 \${isToday(date) ? 'bg-purple-50 dark:bg-purple-900/20' : ''}\`}>
                      {lesson ? (
                        <div className="p-2 rounded-lg text-xs bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-1 font-medium text-purple-900 dark:text-purple-100">
                            <User className="w-3 h-3" />
                            {lesson.student_name}
                          </div>
                          <div className="text-purple-600 dark:text-purple-400 mt-0.5">
                            {lesson.instrument}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {lesson.duration || 60} min
                          </div>
                        </div>
                      ) : (
                        <div className="h-16" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface LessonCalendarMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLessonCalendarMusic(options: LessonCalendarMusicOptions = {}): string {
  const { componentName = 'LessonCalendarMusic', endpoint = '/music/lessons' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Music, Clock, User, X } from 'lucide-react';
import { api } from '@/lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ${componentName}Props {
  studentId?: string;
  instructorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ studentId, instructorId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['music-lessons-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), studentId, instructorId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', String(currentMonth.getMonth() + 1));
      params.append('year', String(currentMonth.getFullYear()));
      if (studentId) params.append('student_id', studentId);
      if (instructorId) params.append('instructor_id', instructorId);
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
            <Music className="w-5 h-5 text-purple-600" />
            Lesson Calendar
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
                    ? 'w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto'
                    : !day.isCurrentMonth ? 'text-gray-400 text-center' : 'text-gray-700 dark:text-gray-300 text-center'
                }\`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayLessons.slice(0, 2).map((lesson: any, i: number) => (
                    <button
                      key={lesson.id || i}
                      onClick={() => setSelectedLesson(lesson)}
                      className="w-full text-left px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 truncate hover:bg-purple-200 dark:hover:bg-purple-900/50"
                    >
                      {lesson.time} - {lesson.instrument}
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
              <Music className="w-5 h-5 text-purple-600" />
              {selectedLesson.instrument} Lesson
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{selectedLesson.instructor_name || selectedLesson.student_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(selectedLesson.date).toLocaleDateString()} at {selectedLesson.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Duration: {selectedLesson.duration || 60} minutes</span>
              </div>
              {selectedLesson.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {selectedLesson.notes}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedLesson(null)}
              className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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

export interface StudentProfileMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileMusic(options: StudentProfileMusicOptions = {}): string {
  const { componentName = 'StudentProfileMusic', endpoint = '/music/students' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Music, Calendar, Clock, Award, TrendingUp, Target } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['music-student', id],
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          {student.avatar_url ? (
            <img src={student.avatar_url} alt={student.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User className="w-10 h-10 text-purple-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
            <p className="text-gray-500">{student.level || 'Beginner'} Level</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {student.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{student.email}</span>}
              {student.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{student.phone}</span>}
            </div>
          </div>
          <Link
            to={\`/music/lessons/new?student_id=\${student.id}\`}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Schedule Lesson
          </Link>
        </div>
      </div>

      {/* Instruments */}
      {student.instruments && student.instruments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Instruments</h2>
          <div className="flex flex-wrap gap-3">
            {student.instruments.map((inst: any, i: number) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Music className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">{inst.name || inst}</span>
                {inst.level && <span className="text-sm text-gray-500">({inst.level})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.total_lessons || 0}</p>
          <p className="text-sm text-gray-500">Total Lessons</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.practice_hours || 0}h</p>
          <p className="text-sm text-gray-500">Practice Hours</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-3">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.pieces_learned || 0}</p>
          <p className="text-sm text-gray-500">Pieces Learned</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.skill_level || 1}</p>
          <p className="text-sm text-gray-500">Skill Level</p>
        </div>
      </div>

      {/* Current Pieces */}
      {student.current_pieces && student.current_pieces.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Currently Learning</h3>
          </div>
          <div className="p-4 space-y-4">
            {student.current_pieces.map((piece: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{piece.title}</p>
                    <p className="text-sm text-gray-500">{piece.composer}</p>
                  </div>
                  <span className="text-sm font-medium text-purple-600">{piece.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: \`\${piece.progress || 0}%\` }}
                  />
                </div>
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

export interface StudentProgressMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProgressMusic(options: StudentProgressMusicOptions = {}): string {
  const { componentName = 'StudentProgressMusic', endpoint = '/music/students' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Music, TrendingUp, Award, Target, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  studentId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ studentId: propId }) => {
  const { id } = useParams<{ id: string }>();
  const studentId = propId || id;

  const { data: progress, isLoading } = useQuery({
    queryKey: ['music-student-progress', studentId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${studentId}/progress\`);
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

  return (
    <div className="space-y-6">
      {/* Skill Progress */}
      {progress?.skills && progress.skills.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Skill Development
          </h3>
          <div className="space-y-4">
            {progress.skills.map((skill: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                  <span className="text-sm text-gray-500">{skill.level}/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: \`\${(skill.level / 10) * 100}%\` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {progress?.achievements && progress.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Achievements
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {progress.achievements.map((achievement: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{achievement.title}</p>
                  <p className="text-sm text-gray-500">{new Date(achievement.earned_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {progress?.goals && progress.goals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Learning Goals
          </h3>
          <div className="space-y-3">
            {progress.goals.map((goal: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                  goal.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }\`}>
                  {goal.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Target className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={\`font-medium \${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}\`}>
                    {goal.title}
                  </p>
                  {!goal.completed && goal.target_date && (
                    <p className="text-sm text-gray-500">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice Log */}
      {progress?.practice_log && progress.practice_log.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Recent Practice
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {progress.practice_log.slice(0, 5).map((log: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{log.piece || log.activity}</p>
                  <p className="text-sm text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <span className="text-purple-600 font-medium">{log.duration} min</span>
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

export interface MusicSchoolStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMusicSchoolStats(options: MusicSchoolStatsOptions = {}): string {
  const { componentName = 'MusicSchoolStats', endpoint = '/music/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Music, Calendar, DollarSign, TrendingUp, Award } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['music-school-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_students || 0}</p>
              <p className="text-sm text-gray-500">Active Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_instructors || 0}</p>
              <p className="text-sm text-gray-500">Instructors</p>
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
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.instruments_offered || 0}</p>
              <p className="text-sm text-gray-500">Instruments</p>
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

export interface SearchResultsMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSearchResultsMusic(options: SearchResultsMusicOptions = {}): string {
  const { componentName = 'SearchResultsMusic', endpoint = '/music/search' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Music, Star, Clock, DollarSign, Video, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  query: string;
  instrument?: string;
  priceRange?: string;
  availability?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ query, instrument, priceRange, availability }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['music-search', query, instrument, priceRange, availability],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (instrument) params.append('instrument', instrument);
      if (priceRange) params.append('price_range', priceRange);
      if (availability) params.append('availability', availability);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response;
    },
    enabled: !!query || !!instrument,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const instructors = data?.instructors || data || [];

  if (instructors.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Music className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500">No instructors found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{instructors.length} instructor(s) found</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor: any) => (
          <Link
            key={instructor.id}
            to={\`/music/instructors/\${instructor.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {instructor.avatar_url ? (
                <img src={instructor.avatar_url} alt={instructor.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Music className="w-8 h-8 text-purple-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{instructor.name}</h3>
                {instructor.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{instructor.rating}</span>
                    {instructor.reviews_count && (
                      <span className="text-sm text-gray-500">({instructor.reviews_count})</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {instructor.instruments && (
              <div className="flex flex-wrap gap-1 mt-3">
                {instructor.instruments.slice(0, 3).map((inst: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
                    {inst}
                  </span>
                ))}
                {instructor.instruments.length > 3 && (
                  <span className="text-xs text-gray-500">+{instructor.instruments.length - 3} more</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                \${instructor.hourly_rate || 50}/hr
              </span>
              {instructor.experience_years && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {instructor.experience_years} yrs
                </span>
              )}
              {instructor.offers_online && (
                <span className="flex items-center gap-1 text-green-600">
                  <Video className="w-4 h-4" />
                  Online
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
