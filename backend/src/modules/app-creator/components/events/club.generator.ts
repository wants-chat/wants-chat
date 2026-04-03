/**
 * Club Component Generators
 */

export interface ClubOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMemberFiltersClub(options: ClubOptions = {}): string {
  const { componentName = 'MemberFiltersClub' } = options;

  return `import React from 'react';
import { Search, Users, Filter, SlidersHorizontal, Calendar } from 'lucide-react';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  membershipType: string;
  onMembershipTypeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  joinedAfter: string;
  onJoinedAfterChange: (value: string) => void;
  membershipTypes?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  membershipType,
  onMembershipTypeChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  joinedAfter,
  onJoinedAfterChange,
  membershipTypes = ['All', 'Basic', 'Premium', 'VIP', 'Lifetime', 'Student', 'Corporate'],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={joinedAfter}
            onChange={(e) => onJoinedAfterChange(e.target.value)}
            placeholder="Joined after"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="joined_desc">Recently Joined</option>
            <option value="joined_asc">Oldest Members</option>
            <option value="visits_desc">Most Active</option>
            <option value="expiry_asc">Expiring Soon</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
        {membershipTypes.map((type) => (
          <button
            key={type}
            onClick={() => onMembershipTypeChange(type === 'All' ? '' : type)}
            className={\`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 \${
              (type === 'All' && !membershipType) || membershipType === type
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }\`}
          >
            <Users className="w-4 h-4" />
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMemberProfileClub(options: ClubOptions = {}): string {
  const { componentName = 'MemberProfileClub', endpoint = '/club/members' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Calendar, Award, Clock, CreditCard, MapPin, Star, Activity } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ['club-member', id],
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

  if (!member) {
    return <div className="text-center py-12 text-gray-500">Member not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 -mt-12">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.name}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <User className="w-12 h-12 text-teal-600 dark:text-teal-400" />
              </div>
            )}
            <div className="flex-1 pt-2 sm:pt-14">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
                  <p className="text-gray-500">{member.email}</p>
                </div>
                <span className={\`px-4 py-1 rounded-full text-sm font-medium \${
                  member.membership_type === 'VIP' || member.membership_type === 'Lifetime'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : member.membership_type === 'Premium'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                }\`}>
                  {member.membership_type || 'Basic'} Member
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          <div className="space-y-4">
            {member.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 dark:text-white">{member.email}</p>
                </div>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 dark:text-white">{member.phone}</p>
                </div>
              </div>
            )}
            {member.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 dark:text-white">{member.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Membership Details</h2>
          <div className="space-y-4">
            {member.member_since && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(member.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {member.expiry_date && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Membership Expires</p>
                  <p className={\`\${new Date(member.expiry_date) < new Date() ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                    {new Date(member.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {member.member_id && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member ID</p>
                  <p className="font-mono text-gray-900 dark:text-white">{member.member_id}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.total_visits || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Events Attended</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.events_attended || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Loyalty Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.loyalty_points?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Achievements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.achievements_count || 0}</p>
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

export function generateEventCalendarClub(options: ClubOptions = {}): string {
  const { componentName = 'EventCalendarClub', endpoint = '/club/events' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin, Ticket } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['club-events', currentDate.getFullYear(), currentDate.getMonth()],
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
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    return events.filter((event: any) => {
      const eventDate = new Date(event.date || event.start_date);
      return eventDate.getDate() === day;
    });
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

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
            <Calendar className="w-5 h-5 text-teal-500" />
            Club Events
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
            <div key={\`empty-\${i}\`} className="h-20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={\`h-20 border rounded-lg p-1 overflow-hidden text-left transition-colors \${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : isToday
                    ? 'border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }\`}
              >
                <div className={\`text-xs font-medium mb-1 \${
                  isToday ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400'
                }\`}>
                  {day}
                </div>
                {dayEvents.slice(0, 2).map((event: any, idx: number) => (
                  <div
                    key={event.id || idx}
                    className={\`text-xs rounded px-1 py-0.5 mb-0.5 truncate \${
                      event.type === 'members_only' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
                      event.type === 'special' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }\`}
                    title={event.title || event.name}
                  >
                    {event.title || event.name}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && selectedDayEvents.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Events on {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}
          </h3>
          <div className="space-y-3">
            {selectedDayEvents.map((event: any) => (
              <Link
                key={event.id}
                to={\`/events/\${event.id}\`}
                className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={\`p-2 rounded-lg \${
                    event.type === 'members_only' ? 'bg-teal-100 dark:bg-teal-900/30' :
                    event.type === 'special' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }\`}>
                    <Calendar className={\`w-4 h-4 \${
                      event.type === 'members_only' ? 'text-teal-600 dark:text-teal-400' :
                      event.type === 'special' ? 'text-purple-600 dark:text-purple-400' :
                      'text-blue-600 dark:text-blue-400'
                    }\`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{event.title || event.name}</h4>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      {event.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                      )}
                      {event.attendees_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendees_count} attending
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {event.price !== undefined && (
                    <div className="text-right">
                      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                        event.price === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }\`}>
                        {event.price === 0 ? 'Free' : \`$\${event.price}\`}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {selectedDay && selectedDayEvents.length === 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <p className="text-center text-gray-500 py-4">No events scheduled for this day</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
