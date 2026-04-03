/**
 * Security Industry Component Generators
 *
 * Components for security companies, guard management, and incident tracking.
 */

export interface SecurityOptions {
  componentName?: string;
  title?: string;
  endpoint?: string;
}

// Guard Filters Component
export function generateGuardFilters(options: SecurityOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';

interface GuardFilters {
  search: string;
  status: string;
  site: string;
  shift: string;
  certification: string;
}

interface GuardFiltersProps {
  onFilter?: (filters: GuardFilters) => void;
}

export default function GuardFilters({ onFilter }: GuardFiltersProps) {
  const [filters, setFilters] = useState<GuardFilters>({
    search: '',
    status: 'all',
    site: 'all',
    shift: 'all',
    certification: 'all'
  });

  const handleChange = (key: keyof GuardFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search guards..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="on-duty">On Duty</option>
            <option value="off-duty">Off Duty</option>
            <option value="on-break">On Break</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site</label>
          <select
            value={filters.site}
            onChange={(e) => handleChange('site', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Sites</option>
            <option value="corporate-hq">Corporate HQ</option>
            <option value="warehouse-a">Warehouse A</option>
            <option value="retail-mall">Retail Mall</option>
            <option value="residential">Residential Complex</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift</label>
          <select
            value={filters.shift}
            onChange={(e) => handleChange('shift', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Shifts</option>
            <option value="day">Day (6AM-2PM)</option>
            <option value="evening">Evening (2PM-10PM)</option>
            <option value="night">Night (10PM-6AM)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certification</label>
          <select
            value={filters.certification}
            onChange={(e) => handleChange('certification', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Certifications</option>
            <option value="armed">Armed Guard</option>
            <option value="unarmed">Unarmed Guard</option>
            <option value="supervisor">Supervisor</option>
            <option value="k9">K-9 Handler</option>
          </select>
        </div>
      </div>
    </div>
  );
}`;
}

// Guard List Active Component
export function generateGuardListActive(options: SecurityOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Clock, Phone, Radio } from 'lucide-react';

interface Guard {
  id: string;
  name: string;
  photo?: string;
  badge: string;
  site: string;
  position: string;
  shift: string;
  checkInTime: string;
  status: 'on-duty' | 'on-break' | 'patrolling' | 'responding';
  phone: string;
  lastCheckpoint?: string;
}

export default function GuardListActive() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setGuards([
      { id: '1', name: 'John Martinez', badge: 'G-001', site: 'Corporate HQ', position: 'Main Entrance', shift: 'Day', checkInTime: '06:00', status: 'on-duty', phone: '555-0101', lastCheckpoint: 'Lobby A - 2 min ago' },
      { id: '2', name: 'Sarah Johnson', badge: 'G-002', site: 'Corporate HQ', position: 'Perimeter', shift: 'Day', checkInTime: '06:00', status: 'patrolling', phone: '555-0102', lastCheckpoint: 'Gate B - 5 min ago' },
      { id: '3', name: 'Mike Chen', badge: 'G-003', site: 'Warehouse A', position: 'Loading Dock', shift: 'Day', checkInTime: '06:00', status: 'on-duty', phone: '555-0103', lastCheckpoint: 'Dock 3 - 1 min ago' },
      { id: '4', name: 'Emily Davis', badge: 'G-004', site: 'Retail Mall', position: 'Food Court', shift: 'Day', checkInTime: '08:00', status: 'on-break', phone: '555-0104' },
      { id: '5', name: 'Robert Wilson', badge: 'G-005', site: 'Corporate HQ', position: 'Parking', shift: 'Day', checkInTime: '06:00', status: 'responding', phone: '555-0105' }
    ]);
  }, []);

  const statusColors: Record<string, { bg: string; text: string }> = {
    'on-duty': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
    'on-break': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
    'patrolling': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
    'responding': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' }
  };

  const filteredGuards = filter === 'all' ? guards : guards.filter(g => g.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Active Guards
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="on-duty">On Duty</option>
          <option value="patrolling">Patrolling</option>
          <option value="on-break">On Break</option>
          <option value="responding">Responding</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredGuards.map((guard) => (
          <div key={guard.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{guard.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">#{guard.badge}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {guard.site} - {guard.position}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Since {guard.checkInTime}
                    </span>
                  </div>
                  {guard.lastCheckpoint && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Last checkpoint: {guard.lastCheckpoint}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[guard.status].bg} \${statusColors[guard.status].text}\`}>
                  {guard.status.replace('-', ' ')}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                    <Radio className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Guard Profile Component
export function generateGuardProfile(options: SecurityOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, MapPin, Phone, Mail, Award, Calendar, Clock, FileText } from 'lucide-react';

interface GuardProfileProps {
  guardId?: string;
  className?: string;
}

export default function GuardProfile({ guardId, className }: GuardProfileProps) {
  const { data: guard, isLoading } = useQuery({
    queryKey: ['guard-profile', guardId],
    queryFn: async () => ({
      id: guardId || '1',
      name: 'John Martinez',
      badge: 'G-001',
      photo: null,
      email: 'j.martinez@security.com',
      phone: '555-0101',
      hireDate: '2022-03-15',
      status: 'active',
      certifications: ['Armed Guard License', 'First Aid/CPR', 'Fire Safety'],
      sites: ['Corporate HQ', 'Warehouse A'],
      currentAssignment: 'Corporate HQ - Main Entrance',
      shift: 'Day Shift (6AM - 2PM)',
      supervisor: 'Captain Robert Brown',
      hoursThisWeek: 32,
      incidentsReported: 3,
      commendations: 5
    })
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-lg shadow \${className || ''}\`}>
      <div className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{guard?.name}</h2>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                Active
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Badge #{guard?.badge}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {guard?.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {guard?.phone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Since {guard?.hireDate}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{guard?.hoursThisWeek}h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hours This Week</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">{guard?.incidentsReported}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Incidents Reported</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-green-600 dark:text-green-400 text-2xl font-bold">{guard?.commendations}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Commendations</div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Current Assignment
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{guard?.currentAssignment}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{guard?.shift}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {guard?.certifications.map((cert, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Guard Schedule Component
export function generateGuardSchedule(options: SecurityOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleEntry {
  id: string;
  date: string;
  shift: 'day' | 'evening' | 'night';
  site: string;
  position: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed';
}

interface GuardScheduleProps {
  guardId?: string;
}

export default function GuardSchedule({ guardId }: GuardScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const generateWeekSchedule = () => {
      const entries: ScheduleEntry[] = [];
      const start = new Date(currentWeek);
      start.setDate(start.getDate() - start.getDay());

      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        if (i !== 0 && i !== 6) {
          entries.push({
            id: \`\${i}\`,
            date: date.toISOString().split('T')[0],
            shift: i % 2 === 0 ? 'day' : 'evening',
            site: i % 2 === 0 ? 'Corporate HQ' : 'Warehouse A',
            position: i % 2 === 0 ? 'Main Entrance' : 'Perimeter Patrol',
            startTime: i % 2 === 0 ? '06:00' : '14:00',
            endTime: i % 2 === 0 ? '14:00' : '22:00',
            status: date < new Date() ? 'completed' : 'scheduled'
          });
        }
      }
      setSchedule(entries);
    };
    generateWeekSchedule();
  }, [currentWeek]);

  const shiftColors: Record<string, string> = {
    day: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    evening: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
    night: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700'
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const weekStart = new Date(currentWeek);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Weekly Schedule
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {schedule.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No shifts scheduled this week</p>
        ) : (
          schedule.map((entry) => (
            <div
              key={entry.id}
              className={\`p-4 rounded-lg border-l-4 \${shiftColors[entry.shift]}\`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {entry.startTime} - {entry.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {entry.site}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Position: {entry.position}
                  </div>
                </div>
                <span className={\`px-2 py-1 text-xs rounded-full \${
                  entry.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  entry.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }\`}>
                  {entry.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`;
}

// Incident Filters Component
export function generateIncidentFilters(options: SecurityOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, AlertTriangle, Calendar } from 'lucide-react';

interface IncidentFilters {
  search: string;
  type: string;
  severity: string;
  site: string;
  status: string;
  dateRange: { start: string; end: string };
}

interface IncidentFiltersProps {
  onFilter?: (filters: IncidentFilters) => void;
}

export default function IncidentFilters({ onFilter }: IncidentFiltersProps) {
  const [filters, setFilters] = useState<IncidentFilters>({
    search: '',
    type: 'all',
    severity: 'all',
    site: 'all',
    status: 'all',
    dateRange: { start: '', end: '' }
  });

  const handleChange = (key: keyof IncidentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search incidents..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="theft">Theft</option>
            <option value="trespass">Trespassing</option>
            <option value="vandalism">Vandalism</option>
            <option value="assault">Assault</option>
            <option value="fire">Fire/Safety</option>
            <option value="medical">Medical</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
          <select
            value={filters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site</label>
          <select
            value={filters.site}
            onChange={(e) => handleChange('site', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Sites</option>
            <option value="corporate-hq">Corporate HQ</option>
            <option value="warehouse-a">Warehouse A</option>
            <option value="retail-mall">Retail Mall</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}`;
}

// Incident List Recent Component
export function generateIncidentListRecent(options: SecurityOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, User, ChevronRight } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  site: string;
  location: string;
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
}

export default function IncidentListRecent() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setIncidents([
      { id: '1', title: 'Unauthorized Access Attempt', type: 'trespass', severity: 'high', site: 'Corporate HQ', location: 'Server Room', reportedBy: 'John Martinez', reportedAt: '2024-01-15T14:30:00', status: 'investigating', description: 'Individual attempted to access server room without proper credentials' },
      { id: '2', title: 'Fire Alarm - False Alarm', type: 'fire', severity: 'medium', site: 'Warehouse A', location: 'Section B', reportedBy: 'Sarah Johnson', reportedAt: '2024-01-15T12:15:00', status: 'resolved', description: 'Fire alarm triggered by dust in smoke detector' },
      { id: '3', title: 'Theft Report', type: 'theft', severity: 'high', site: 'Retail Mall', location: 'Store 23', reportedBy: 'Mike Chen', reportedAt: '2024-01-15T11:00:00', status: 'open', description: 'Reported theft of merchandise from electronics store' },
      { id: '4', title: 'Parking Lot Damage', type: 'vandalism', severity: 'low', site: 'Corporate HQ', location: 'Parking Level B', reportedBy: 'Emily Davis', reportedAt: '2024-01-15T09:45:00', status: 'resolved', description: 'Vehicle damage reported in parking lot, no suspects' }
    ]);
  }, []);

  const severityColors: Record<string, { bg: string; text: string; icon: string }> = {
    low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', icon: 'text-green-500' },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', icon: 'text-yellow-500' },
    high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200', icon: 'text-orange-500' },
    critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', icon: 'text-red-500' }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    investigating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          Recent Incidents
        </h2>
        <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={\`p-2 rounded-lg \${severityColors[incident.severity].bg}\`}>
                  <AlertTriangle className={\`w-5 h-5 \${severityColors[incident.severity].icon}\`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                    <span className={\`px-2 py-0.5 text-xs rounded-full \${statusColors[incident.status]}\`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {incident.site} - {incident.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(incident.reportedAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {incident.reportedBy}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {incident.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Schedule Calendar for Security
export function generateScheduleCalendarSecurity(options: SecurityOptions = {}): string {
  return `import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, MapPin } from 'lucide-react';

interface Shift {
  id: string;
  guardName: string;
  site: string;
  position: string;
  startTime: string;
  endTime: string;
  type: 'day' | 'evening' | 'night';
}

interface DaySchedule {
  date: Date;
  shifts: Shift[];
}

export default function ScheduleCalendarSecurity() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const generateShiftsForDate = (date: Date): Shift[] => {
    if (date.getDay() === 0) return [];
    return [
      { id: '1', guardName: 'John M.', site: 'HQ', position: 'Main Gate', startTime: '06:00', endTime: '14:00', type: 'day' },
      { id: '2', guardName: 'Sarah J.', site: 'HQ', position: 'Patrol', startTime: '14:00', endTime: '22:00', type: 'evening' },
      { id: '3', guardName: 'Mike C.', site: 'Warehouse', position: 'Loading', startTime: '22:00', endTime: '06:00', type: 'night' }
    ];
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const shiftColors = {
    day: 'bg-yellow-200 dark:bg-yellow-700',
    evening: 'bg-orange-200 dark:bg-orange-700',
    night: 'bg-indigo-200 dark:bg-indigo-700'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Security Schedule
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium min-w-[150px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={\`empty-\${i}\`} className="min-h-[100px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
          const shifts = generateShiftsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={i + 1}
              onClick={() => setSelectedDate(date)}
              className={\`min-h-[100px] p-1 border border-gray-100 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 \${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} \${isSelected ? 'ring-2 ring-blue-500' : ''}\`}
            >
              <div className={\`text-sm font-medium mb-1 \${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}\`}>
                {i + 1}
              </div>
              <div className="space-y-0.5">
                {shifts.slice(0, 3).map(shift => (
                  <div key={shift.id} className={\`text-xs px-1 py-0.5 rounded truncate \${shiftColors[shift.type]}\`}>
                    {shift.guardName}
                  </div>
                ))}
                {shifts.length > 3 && (
                  <div className="text-xs text-gray-500">+{shifts.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-semibold mb-3">
            Shifts for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <div className="space-y-2">
            {generateShiftsForDate(selectedDate).map(shift => (
              <div key={shift.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  <div className={\`w-3 h-3 rounded-full \${shiftColors[shift.type]}\`} />
                  <span className="font-medium">{shift.guardName}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {shift.startTime} - {shift.endTime} | {shift.site} - {shift.position}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;
}
