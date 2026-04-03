/**
 * Appointment List Component Generator
 *
 * Generates a list of appointments with status badges.
 */

export interface AppointmentListOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateAppointmentList(options: AppointmentListOptions = {}): string {
  const {
    componentName = 'AppointmentList',
    endpoint = '/appointments',
    title = 'My Appointments',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Clock, User, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  title?: string;
  userScoped?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ title = '${title}', userScoped = true }) => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
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

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt: any) => (
            <div key={apt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {apt.service_name || apt.service?.name || 'Appointment'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(apt.date || apt.appointment_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {apt.time || apt.appointment_time}
                    </span>
                    {(apt.staff_name || apt.staff?.name) && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {apt.staff_name || apt.staff?.name}
                      </span>
                    )}
                    {apt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {apt.location}
                      </span>
                    )}
                  </div>
                </div>
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${statusColors[apt.status] || 'bg-gray-100 text-gray-700'}\`}>
                  {apt.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No appointments scheduled
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBookingConfirmation(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'BookingConfirmation', endpoint = '/appointments' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Calendar, Clock, MapPin, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['appointment', id],
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

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-6">Your appointment has been scheduled successfully.</p>

        {booking && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-3">
              {booking.service_name && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900 dark:text-white">{booking.service_name}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">{new Date(booking.date || booking.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">{booking.time || booking.appointment_time}</span>
              </div>
              {booking.staff_name && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{booking.staff_name}</span>
                </div>
              )}
              {booking.location && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{booking.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="${endpoint}" className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            View Appointments
          </Link>
          <Link to="/" className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDatePicker(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'DatePicker';

  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ${componentName}Props {
  onSelect?: (date: Date) => void;
  minDate?: Date;
  disabledDates?: Date[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSelect, minDate, disabledDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, () => null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleSelect = (day: number) => {
    const date = new Date(year, month, day);
    if (isDisabled(day)) return;
    setSelectedDate(date);
    onSelect?.(date);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day);
    if (minDate && date < minDate) return true;
    return disabledDates.some(d =>
      d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white">{monthNames[month]} {year}</span>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="py-2 text-gray-500 font-medium">{d}</div>
        ))}
        {[...padding, ...days].map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {day && (
              <button
                onClick={() => handleSelect(day)}
                disabled={isDisabled(day)}
                className={\`w-10 h-10 rounded-full transition-colors \${
                  isSelected(day) ? 'bg-blue-600 text-white' :
                  isToday(day) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                  isDisabled(day) ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' :
                  'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }\`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTimeSlots(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'TimeSlots';

  return `import React from 'react';
import { Clock } from 'lucide-react';

interface ${componentName}Props {
  slots?: string[];
  selectedSlot?: string;
  onSelect?: (slot: string) => void;
  disabledSlots?: string[];
}

const defaultSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];

const ${componentName}: React.FC<${componentName}Props> = ({
  slots = defaultSlots,
  selectedSlot,
  onSelect,
  disabledSlots = []
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" /> Available Times
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isDisabled = disabledSlots.includes(slot);
          return (
            <button
              key={slot}
              onClick={() => !isDisabled && onSelect?.(slot)}
              disabled={isDisabled}
              className={\`py-2 px-3 rounded-lg text-sm font-medium transition-colors \${
                selectedSlot === slot
                  ? 'bg-blue-600 text-white'
                  : isDisabled
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
