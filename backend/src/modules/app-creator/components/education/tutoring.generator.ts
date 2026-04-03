/**
 * Tutoring Component Generators
 *
 * Generates tutoring-related components for education applications.
 * Components: TutorProfile, TutorFilters, TutorSchedule, TutoringStats, StudentProfileTutoring
 */

export interface TutorProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTutorProfile(options: TutorProfileOptions = {}): string {
  const { componentName = 'TutorProfile', endpoint = '/tutors' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Star, Clock, MapPin, BookOpen, Award, Calendar, Video, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor', id],
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

  if (!tutor) {
    return <div className="text-center py-12 text-gray-500">Tutor not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {tutor.avatar_url ? (
            <img src={tutor.avatar_url} alt={tutor.name} className="w-32 h-32 rounded-xl object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-16 h-16 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tutor.name}</h1>
                <p className="text-gray-500">{tutor.title || 'Professional Tutor'}</p>
              </div>
              {tutor.verified && (
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>

            {/* Rating */}
            {tutor.rating && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={\`w-5 h-5 \${i < Math.floor(tutor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{tutor.rating}</span>
                {tutor.reviews_count && (
                  <span className="text-gray-500">({tutor.reviews_count} reviews)</span>
                )}
              </div>
            )}

            {/* Subjects */}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tutor.subjects.map((subject: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              {tutor.hourly_rate && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  \${tutor.hourly_rate}/hr
                </span>
              )}
              {tutor.experience_years && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {tutor.experience_years} years exp.
                </span>
              )}
              {tutor.sessions_completed && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {tutor.sessions_completed} sessions
                </span>
              )}
              {tutor.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tutor.location}
                </span>
              )}
            </div>
          </div>

          {/* Book Button */}
          <div className="flex flex-col gap-3">
            <Link
              to={\`/tutors/\${tutor.id}/book\`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
            >
              Book Session
            </Link>
            {tutor.offers_online && (
              <span className="text-sm text-gray-500 flex items-center gap-1 justify-center">
                <Video className="w-4 h-4" />
                Online available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {tutor.bio && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{tutor.bio}</p>
        </div>
      )}

      {/* Education & Qualifications */}
      <div className="grid md:grid-cols-2 gap-6">
        {tutor.education && tutor.education.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
            <div className="space-y-4">
              {tutor.education.map((edu: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{edu.degree}</p>
                    <p className="text-sm text-gray-500">{edu.institution}</p>
                    {edu.year && <p className="text-sm text-gray-400">{edu.year}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tutor.certifications && tutor.certifications.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certifications</h2>
            <div className="space-y-3">
              {tutor.certifications.map((cert: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-900 dark:text-white">{cert.name || cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Availability */}
      {tutor.availability && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const dayAvail = tutor.availability[day.toLowerCase()];
              return (
                <div key={day} className="text-center">
                  <p className="text-sm font-medium text-gray-500 mb-2">{day}</p>
                  {dayAvail ? (
                    <div className="space-y-1">
                      {dayAvail.map((slot: string, i: number) => (
                        <span key={i} className="block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                          {slot}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-xs">
                      Unavailable
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews */}
      {tutor.reviews && tutor.reviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tutor.reviews.map((review: any, index: number) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium">
                    {review.student_name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white">{review.student_name}</p>
                      <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={\`w-4 h-4 \${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>
                  </div>
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

export interface TutorFiltersOptions {
  componentName?: string;
}

export function generateTutorFilters(options: TutorFiltersOptions = {}): string {
  const componentName = options.componentName || 'TutorFilters';

  return `import React from 'react';
import { Search, ChevronDown, Star, DollarSign, MapPin } from 'lucide-react';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  rating: string;
  onRatingChange: (value: string) => void;
  availability: string;
  onAvailabilityChange: (value: string) => void;
  subjects?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  subject,
  onSubjectChange,
  priceRange,
  onPriceRangeChange,
  rating,
  onRatingChange,
  availability,
  onAvailabilityChange,
  subjects = ['All', 'Math', 'English', 'Science', 'History', 'Physics', 'Chemistry', 'Biology', 'Programming'],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tutors by name or subject..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Subject Filter */}
        <div className="relative">
          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="appearance-none w-full lg:w-40 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {subjects.map((subj) => (
              <option key={subj} value={subj === 'All' ? '' : subj}>{subj}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Price Range Filter */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={priceRange}
            onChange={(e) => onPriceRangeChange(e.target.value)}
            className="appearance-none w-full lg:w-40 pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Price</option>
            <option value="0-25">$0 - $25/hr</option>
            <option value="25-50">$25 - $50/hr</option>
            <option value="50-100">$50 - $100/hr</option>
            <option value="100+">$100+/hr</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Rating Filter */}
        <div className="relative">
          <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={rating}
            onChange={(e) => onRatingChange(e.target.value)}
            className="appearance-none w-full lg:w-36 pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Availability Filter */}
        <div className="relative">
          <select
            value={availability}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="appearance-none w-full lg:w-40 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="weekend">Weekends</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface TutorScheduleOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTutorSchedule(options: TutorScheduleOptions = {}): string {
  const { componentName = 'TutorSchedule', endpoint = '/tutors' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Clock, User, Video, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  tutorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ tutorId: propTutorId }) => {
  const { id } = useParams<{ id: string }>();
  const tutorId = propTutorId || id;
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
    queryKey: ['tutor-schedule', tutorId, currentWeek.toISOString()],
    queryFn: async () => {
      const weekStart = getWeekDates()[0].toISOString().split('T')[0];
      const weekEnd = getWeekDates()[6].toISOString().split('T')[0];
      const response = await api.get<any>(\`${endpoint}/\${tutorId}/schedule?start=\${weekStart}&end=\${weekEnd}\`);
      return response?.data || response;
    },
  });

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const weekDates = getWeekDates();
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

  const getSessionForSlot = (date: Date, time: string) => {
    if (!schedule?.sessions) return null;
    const dateStr = date.toISOString().split('T')[0];
    return schedule.sessions.find((s: any) => s.date === dateStr && s.time === time);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Schedule</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[180px] text-center">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="w-24 p-3 text-left text-xs font-medium text-gray-500">Time</th>
              {weekDates.map((date, i) => (
                <th key={i} className={\`p-3 text-center \${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}\`}>
                  <div className="text-xs font-medium text-gray-500">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={\`text-lg font-bold \${isToday(date) ? 'text-blue-600' : 'text-gray-900 dark:text-white'}\`}>
                    {date.getDate()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, timeIndex) => (
              <tr key={time} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 text-sm text-gray-500 font-medium">{time}</td>
                {weekDates.map((date, dateIndex) => {
                  const session = getSessionForSlot(date, time);
                  return (
                    <td
                      key={dateIndex}
                      className={\`p-1 \${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}\`}
                    >
                      {session ? (
                        <div className={\`p-2 rounded-lg text-xs \${
                          session.type === 'booked'
                            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200'
                            : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        }\`}>
                          <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                            <User className="w-3 h-3" />
                            {session.student_name || 'Session'}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 mt-1">
                            {session.is_online ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {session.is_online ? 'Online' : session.location}
                          </div>
                        </div>
                      ) : (
                        <div className="h-12" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded" />
          Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded" />
          Available
        </span>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface TutoringStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTutoringStats(options: TutoringStatsOptions = {}): string {
  const { componentName = 'TutoringStats', endpoint = '/tutoring/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Clock, DollarSign, Star, TrendingUp, Calendar, BookOpen, Award } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  tutorId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ tutorId, className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['tutoring-stats', tutorId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (tutorId) url += \`?tutor_id=\${tutorId}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_students || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.sessions_completed || 0}</p>
              <p className="text-sm text-gray-500">Sessions</p>
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
              <p className="text-sm text-gray-500">Total Hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.average_rating || 'N/A'}</p>
              <p className="text-sm text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-200" />
            <span className="text-blue-100 text-sm">Revenue</span>
          </div>
          <p className="text-2xl font-bold">\${stats?.total_revenue || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-200" />
            <span className="text-green-100 text-sm">Completion Rate</span>
          </div>
          <p className="text-2xl font-bold">{stats?.completion_rate || 0}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-orange-200" />
            <span className="text-orange-100 text-sm">Subjects</span>
          </div>
          <p className="text-2xl font-bold">{stats?.subjects_taught || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-purple-200" />
            <span className="text-purple-100 text-sm">Repeat Rate</span>
          </div>
          <p className="text-2xl font-bold">{stats?.repeat_student_rate || 0}%</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface StudentProfileTutoringOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileTutoring(options: StudentProfileTutoringOptions = {}): string {
  const { componentName = 'StudentProfileTutoring', endpoint = '/tutoring/students' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Calendar, Clock, BookOpen, TrendingUp, Target, Award } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['tutoring-student', id],
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
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
            {student.grade_level && <p className="text-gray-500">Grade {student.grade_level}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {student.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </span>
              )}
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {student.phone}
                </span>
              )}
            </div>
          </div>
          <Link
            to={\`/tutoring/sessions/new?student_id=\${student.id}\`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schedule Session
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.total_sessions || 0}</p>
          <p className="text-sm text-gray-500">Total Sessions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.total_hours || 0}h</p>
          <p className="text-sm text-gray-500">Hours Studied</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.improvement_rate || 0}%</p>
          <p className="text-sm text-gray-500">Improvement</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.goals_completed || 0}</p>
          <p className="text-sm text-gray-500">Goals Met</p>
        </div>
      </div>

      {/* Subjects & Progress */}
      {student.subjects && student.subjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Subject Progress</h3>
          </div>
          <div className="p-4 space-y-4">
            {student.subjects.map((subject: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">{subject.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={\`h-2 rounded-full transition-all \${
                      subject.progress >= 80 ? 'bg-green-500' :
                      subject.progress >= 50 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }\`}
                    style={{ width: \`\${subject.progress}%\` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Goals */}
      {student.goals && student.goals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Learning Goals</h3>
          </div>
          <div className="p-4 space-y-3">
            {student.goals.map((goal: any, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                  goal.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }\`}>
                  <Target className={\`w-4 h-4 \${goal.completed ? 'text-green-600' : 'text-gray-400'}\`} />
                </div>
                <div className="flex-1">
                  <p className={\`font-medium \${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}\`}>
                    {goal.title}
                  </p>
                  {goal.target_date && !goal.completed && (
                    <p className="text-sm text-gray-500">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {student.recent_sessions && student.recent_sessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
            <Link to={\`/tutoring/students/\${student.id}/sessions\`} className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {student.recent_sessions.map((session: any, index: number) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.subject}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString()} - {session.duration} min
                  </p>
                </div>
                {session.notes && (
                  <span className="text-sm text-gray-500 max-w-xs truncate">{session.notes}</span>
                )}
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
