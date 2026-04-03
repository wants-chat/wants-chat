/**
 * Funeral Component Generators
 * Components for funeral home management and arrangements
 */

export interface FuneralOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFuneralStats(options: FuneralOptions = {}): string {
  const { componentName = 'FuneralStats', endpoint = '/funeral' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Users, Clock, FileText, Heart, TrendingUp, Building } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['funeral-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/stats');
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

  const statItems = [
    {
      label: 'Active Arrangements',
      value: stats?.active_arrangements || 0,
      icon: FileText,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      subtext: 'Currently in progress'
    },
    {
      label: 'Upcoming Services',
      value: stats?.upcoming_services || 0,
      icon: Calendar,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      subtext: 'Next 7 days'
    },
    {
      label: 'Families Served',
      value: stats?.families_served_this_month || 0,
      icon: Users,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
      subtext: 'This month'
    },
    {
      label: 'Pending Tasks',
      value: stats?.pending_tasks || 0,
      icon: Clock,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      subtext: 'Requires attention'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">Funeral Home Dashboard</h2>
            <p className="text-3xl font-bold mt-2">
              {stats?.total_arrangements_this_year || 0} arrangements this year
            </p>
            <p className="text-sm mt-2 opacity-80">
              {stats?.comparison_text || 'Thank you for your service to families'}
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-full">
            <Building className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className={\`p-3 rounded-lg \${stat.color}\`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.subtext}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {stats?.todays_events?.length > 0 ? (
              stats.todays_events.map((event: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{event.time}</p>
                    <p className="text-xs text-gray-500">{event.type}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{event.family_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.location}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No events scheduled today</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Service Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Traditional Services', value: stats?.traditional_services || 0, color: 'bg-blue-500' },
              { label: 'Cremation Services', value: stats?.cremation_services || 0, color: 'bg-purple-500' },
              { label: 'Memorial Services', value: stats?.memorial_services || 0, color: 'bg-green-500' },
              { label: 'Direct Services', value: stats?.direct_services || 0, color: 'bg-orange-500' },
            ].map((item, i) => {
              const total = (stats?.traditional_services || 0) + (stats?.cremation_services || 0) +
                           (stats?.memorial_services || 0) + (stats?.direct_services || 0);
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`\${item.color} rounded-full h-2\`}
                      style={{ width: \`\${percentage}%\` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateArrangementList(options: FuneralOptions = {}): string {
  const { componentName = 'ArrangementList', endpoint = '/arrangements' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, Search, Filter, Calendar, Clock, User, ChevronRight,
  FileText, Phone, MapPin, Plus
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  showFilters?: boolean;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showFilters = true, limit }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [serviceType, setServiceType] = useState('all');

  const { data: arrangements, isLoading } = useQuery({
    queryKey: ['arrangements', status, serviceType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (serviceType !== 'all') params.append('service_type', serviceType);
      if (limit) params.append('limit', limit.toString());
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredArrangements = arrangements?.filter((arr: any) =>
    arr.deceased_name?.toLowerCase().includes(search.toLowerCase()) ||
    arr.family_contact?.toLowerCase().includes(search.toLowerCase()) ||
    arr.case_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (arrStatus: string) => {
    const statusStyles: Record<string, string> = {
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'scheduled': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return statusStyles[arrStatus] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Arrangements</h2>
        <Link
          to="/arrangements/new"
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          New Arrangement
        </Link>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or case number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Services</option>
              <option value="traditional">Traditional</option>
              <option value="cremation">Cremation</option>
              <option value="memorial">Memorial</option>
              <option value="direct">Direct</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredArrangements && filteredArrangements.length > 0 ? (
            filteredArrangements.map((arrangement: any) => (
              <Link
                key={arrangement.id}
                to={\`/arrangements/\${arrangement.id}\`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {arrangement.deceased_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Case #{arrangement.case_number}
                        </p>
                      </div>
                      <span className={\`px-2 py-1 text-xs rounded-full \${getStatusBadge(arrangement.status)}\`}>
                        {arrangement.status?.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      {arrangement.service_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(arrangement.service_date).toLocaleDateString()}
                        </span>
                      )}
                      {arrangement.service_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {arrangement.service_time}
                        </span>
                      )}
                      {arrangement.service_type && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {arrangement.service_type}
                        </span>
                      )}
                    </div>

                    {arrangement.family_contact && (
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          {arrangement.family_contact}
                        </span>
                        {arrangement.family_phone && (
                          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                            <Phone className="w-4 h-4" />
                            {arrangement.family_phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No arrangements found</p>
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

export function generateArrangementListUpcoming(options: FuneralOptions = {}): string {
  const { componentName = 'ArrangementListUpcoming', endpoint = '/arrangements' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, Clock, MapPin, ChevronRight, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  days?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5, days = 7 }) => {
  const { data: arrangements, isLoading } = useQuery({
    queryKey: ['upcoming-arrangements', limit, days],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/upcoming?limit=\${limit}&days=\${days}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const groupedByDate = arrangements?.reduce((groups: any, arr: any) => {
    const date = new Date(arr.service_date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(arr);
    return groups;
  }, {});

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          Upcoming Services
        </h2>
        <Link
          to="/arrangements?status=scheduled"
          className="text-sm text-slate-600 hover:text-slate-700"
        >
          View All
        </Link>
      </div>

      {arrangements && arrangements.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(groupedByDate).map(([date, dateArrangements]: [string, any]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{date}</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {dateArrangements.map((arrangement: any) => (
                  <Link
                    key={arrangement.id}
                    to={\`/arrangements/\${arrangement.id}\`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 text-center min-w-[60px]">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {arrangement.service_time}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {arrangement.service_type}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {arrangement.deceased_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {arrangement.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3" />
                              {arrangement.location}
                            </span>
                          )}
                          {arrangement.expected_attendees && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              ~{arrangement.expected_attendees}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No upcoming services in the next {days} days</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateObituaryListRecent(options: FuneralOptions = {}): string {
  const { componentName = 'ObituaryListRecent', endpoint = '/obituaries' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, Search, Calendar, Heart, MessageCircle, Share2,
  ChevronRight, Flower, BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showSearch?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 10, showSearch = true }) => {
  const [search, setSearch] = useState('');

  const { data: obituaries, isLoading } = useQuery({
    queryKey: ['recent-obituaries', limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}&sort=created_at:desc\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredObituaries = obituaries?.filter((obit: any) =>
    obit.name?.toLowerCase().includes(search.toLowerCase()) ||
    obit.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search obituaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      )}

      <div className="grid gap-4">
        {filteredObituaries && filteredObituaries.length > 0 ? (
          filteredObituaries.map((obituary: any) => (
            <div
              key={obituary.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex gap-4">
                  {obituary.photo_url ? (
                    <img
                      src={obituary.photo_url}
                      alt={obituary.name}
                      className="w-24 h-28 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-28 bg-slate-100 dark:bg-slate-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      to={\`/obituaries/\${obituary.id}\`}
                      className="block"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-slate-600">
                        {obituary.name}
                      </h3>
                    </Link>
                    {(obituary.birth_date || obituary.death_date) && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {obituary.birth_date && new Date(obituary.birth_date).toLocaleDateString()}
                        {obituary.birth_date && obituary.death_date && ' - '}
                        {obituary.death_date && new Date(obituary.death_date).toLocaleDateString()}
                      </p>
                    )}
                    {obituary.location && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{obituary.location}</p>
                    )}

                    {obituary.summary && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                        {obituary.summary}
                      </p>
                    )}

                    {obituary.service_info && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {obituary.service_info}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Heart className="w-4 h-4" />
                      {obituary.tribute_count || 0} Tributes
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MessageCircle className="w-4 h-4" />
                      {obituary.memory_count || 0} Memories
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Flower className="w-4 h-4" />
                      {obituary.flower_count || 0} Flowers
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={\`/obituaries/\${obituary.id}\`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-700 font-medium"
                    >
                      Read More
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No obituaries found</p>
          </div>
        )}
      </div>

      {obituaries && obituaries.length >= limit && (
        <div className="text-center">
          <Link
            to="/obituaries"
            className="inline-flex items-center gap-2 px-6 py-2 text-slate-600 hover:text-slate-700 font-medium"
          >
            View All Obituaries
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
