/**
 * Appointment Calendar Component Generator
 */

export interface AppointmentCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAppointmentCalendar(options: AppointmentCalendarOptions = {}): string {
  const { componentName = 'AppointmentCalendar', endpoint = '/appointments' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get<any>(\`${endpoint}?year=\${year}&month=\${month}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, () => null);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getAppointmentsForDay = (day: number) => {
    return appointments?.filter((apt: any) => {
      const aptDate = new Date(apt.date || apt.appointment_date);
      return aptDate.getDate() === day && aptDate.getMonth() === month && aptDate.getFullYear() === year;
    }) || [];
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 text-gray-500 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...padding, ...days].map((day, i) => {
            const dayAppointments = day ? getAppointmentsForDay(day) : [];
            const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <div
                key={i}
                className={\`min-h-[80px] p-1 border rounded-lg \${
                  day ? 'border-gray-200 dark:border-gray-700' : 'border-transparent'
                } \${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''}\`}
              >
                {day && (
                  <>
                    <span className={\`text-sm font-medium \${isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'}\`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map((apt: any) => (
                        <div
                          key={apt.id}
                          className="text-xs p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded truncate"
                        >
                          {apt.time || apt.appointment_time}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAppointmentForm(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'AppointmentForm', endpoint = '/appointments' } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, Calendar, Clock, User, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    doctor_id: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await api.get<any>('/doctors');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      toast.success('Appointment scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      navigate('${endpoint}');
    },
    onError: () => toast.error('Failed to schedule appointment'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Schedule Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Select Doctor *
          </label>
          <select
            value={formData.doctor_id}
            onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            required
          >
            <option value="">Choose a doctor...</option>
            {doctors?.map((doctor: any) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name} - {doctor.specialty}
              </option>
            ))}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Time *
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              required
            >
              <option value="">Select time...</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Reason for Visit *
          </label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g., Annual checkup, Follow-up visit"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any symptoms or concerns..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Schedule Appointment'
          )}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}
