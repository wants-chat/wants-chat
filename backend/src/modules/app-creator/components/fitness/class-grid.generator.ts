/**
 * Class Grid Component Generator
 */

export interface ClassGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClassGrid(options: ClassGridOptions = {}): string {
  const { componentName = 'ClassGrid', endpoint = '/classes' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, Users, Calendar, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  category?: string;
  date?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category, date }) => {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', category, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (date) params.append('date', date);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {classes && classes.length > 0 ? (
        classes.map((cls: any) => (
          <Link
            key={cls.id}
            to={\`/classes/\${cls.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {cls.image_url && (
              <img src={cls.image_url} alt={cls.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              {cls.category && (
                <span className="text-xs font-medium text-blue-600 uppercase">{cls.category}</span>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white mt-1">{cls.name}</h3>
              {cls.instructor_name && (
                <p className="text-sm text-gray-500">with {cls.instructor_name}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                {cls.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {cls.duration} min
                  </span>
                )}
                {cls.capacity && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cls.spots_left || cls.capacity} spots
                  </span>
                )}
                {cls.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {cls.location}
                  </span>
                )}
              </div>
              {cls.next_session && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Next: {cls.next_session}</span>
                </div>
              )}
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          No classes found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateClassSchedule(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'ClassSchedule', endpoint = '/class-schedule' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, MapPin, User } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['class-schedule', selectedDate],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?date=' + selectedDate);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }\`}
              >
                <span className="text-xs">{dayNames[d.getDay()]}</span>
                <span className="text-lg font-semibold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {schedule && schedule.length > 0 ? (
          schedule.map((cls: any) => (
            <Link
              key={cls.id}
              to={\`/classes/\${cls.class_id || cls.id}\`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{cls.time || cls.start_time}</p>
                  <p className="text-xs text-gray-500">{cls.duration} min</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{cls.name || cls.class_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {cls.instructor_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {cls.instructor_name}
                      </span>
                    )}
                    {cls.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cls.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Book
              </button>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No classes scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateClassDetail(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'ClassDetail', endpoint = '/classes' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Clock, Users, MapPin, Calendar, User, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: classItem, isLoading } = useQuery({
    queryKey: ['class', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const bookMutation = useMutation({
    mutationFn: () => api.post('/bookings', { class_id: id }),
    onSuccess: () => {
      toast.success('Class booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['class', id] });
    },
    onError: () => toast.error('Failed to book class'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!classItem) {
    return <div className="text-center py-12 text-gray-500">Class not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {classItem.image_url && (
        <img src={classItem.image_url} alt={classItem.name} className="w-full h-64 object-cover" />
      )}
      <div className="p-6">
        <Link to="/classes" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Classes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{classItem.name}</h1>
        {classItem.category && (
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm mb-4">
            {classItem.category}
          </span>
        )}
        {classItem.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">{classItem.description}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {classItem.instructor_name && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Instructor</p>
                <p className="font-medium text-gray-900 dark:text-white">{classItem.instructor_name}</p>
              </div>
            </div>
          )}
          {classItem.duration && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">{classItem.duration} minutes</p>
              </div>
            </div>
          )}
          {classItem.location && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{classItem.location}</p>
              </div>
            </div>
          )}
          {classItem.capacity && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Spots Available</p>
                <p className="font-medium text-gray-900 dark:text-white">{classItem.spots_left || classItem.capacity} / {classItem.capacity}</p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => bookMutation.mutate()}
          disabled={bookMutation.isPending || classItem.is_booked}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {bookMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : classItem.is_booked ? (
            'Already Booked'
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Book This Class
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateClassFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'ClassFilters';

  return `import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ${componentName}Props {
  category: string;
  onCategoryChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  categories?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  category,
  onCategoryChange,
  date,
  onDateChange,
  categories = ['All', 'Yoga', 'HIIT', 'Strength', 'Cardio', 'Pilates', 'Dance', 'Cycling'],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat === 'All' ? '' : cat)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
