/**
 * Appointment Scheduler Generator
 *
 * Generates an appointment scheduling component with calendar and time slots.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generateAppointmentScheduler = (
  resolved: ResolvedComponent,
  variant: 'calendar' | 'list' | 'compact' = 'calendar'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'slots';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'slots';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'appointments/slots'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'appointmentSlots';

  if (variant === 'list') {
    return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface AppointmentSchedulerProps {
  ${dataName}?: TimeSlot[];
  providerId?: string;
  providerName?: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onSlotSelect?: (slot: TimeSlot) => void;
  onConfirm?: (date: Date, slot: TimeSlot) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  ${dataName}: propData,
  providerId,
  providerName,
  selectedDate: propSelectedDate,
  onDateChange,
  onSlotSelect,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const queryClient = useQueryClient();

  // Mutation for booking appointment
  const bookAppointmentMutation = useMutation({
    mutationFn: async (bookingData: { date: Date; slot: TimeSlot }) => {
      const response = await api.post<any>('${apiRoute}', {
        date: bookingData.date.toISOString(),
        slotId: bookingData.slot.id,
        time: bookingData.slot.time,
        providerId,
      });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onConfirm && selectedSlot) onConfirm(selectedDate, selectedSlot);
    },
  });

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.slots || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const availableSlots = propData || fetchedData || [];

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    onDateChange?.(date);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      onSlotSelect?.(slot);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl p-6 ${styles.cardShadow}">
      <div className="mb-6">
        <h2 className="${styles.textPrimary} text-xl font-bold mb-2">Schedule Appointment</h2>
        {providerName && (
          <p className="${styles.textMuted}">with {providerName}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="${styles.textSecondary} text-sm font-medium mb-2 block">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => handleDateChange(new Date(e.target.value))}
          className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} focus:ring-2 focus:ring-${styles.primary} focus:border-transparent"
        />
        <p className="${styles.textMuted} text-sm mt-2">{formatDate(selectedDate)}</p>
      </div>

      <div className="mb-6">
        <label className="${styles.textSecondary} text-sm font-medium mb-3 block">
          Available Times
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={!slot.available}
              className={\`py-3 px-4 rounded-lg text-sm font-medium transition-all \${
                selectedSlot?.id === slot.id
                  ? '${styles.button} text-white'
                  : slot.available
                  ? 'border ${styles.cardBorder} ${styles.textPrimary} hover:${styles.background}'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
              }\`}
            >
              {slot.time}
            </button>
          ))}
        </div>
        {availableSlots.filter(s => s.available).length === 0 && (
          <p className="${styles.textMuted} text-center py-4">No available slots for this date</p>
        )}
      </div>

      <button
        onClick={() => selectedSlot && bookAppointmentMutation.mutate({ date: selectedDate, slot: selectedSlot })}
        disabled={!selectedSlot || bookAppointmentMutation.isPending}
        className={\`w-full py-3 px-4 rounded-lg font-medium transition-colors \${
          selectedSlot
            ? '${styles.button} text-white hover:${styles.buttonHover}'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }\`}
      >
        {bookAppointmentMutation.isPending ? 'Booking...' : selectedSlot ? \`Confirm \${selectedSlot.time} Appointment\` : 'Select a Time Slot'}
      </button>
    </div>
  );
};

export default AppointmentScheduler;
`;
  }

  if (variant === 'compact') {
    return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface AppointmentSchedulerProps {
  ${dataName}?: string[];
  onSchedule?: (date: string, time: string) => void;
  minDate?: string;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  ${dataName}: propData,
  onSchedule,
  minDate = new Date().toISOString().split('T')[0],
}) => {
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState('09:00');
  const queryClient = useQueryClient();

  // Mutation for scheduling appointment
  const scheduleMutation = useMutation({
    mutationFn: async (scheduleData: { date: string; time: string }) => {
      const response = await api.post<any>('${apiRoute}', scheduleData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onSchedule) onSchedule(date, time);
    },
  });

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.times || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const timeOptions = propData || fetchedData || [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[150px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-lg p-4 ${styles.cardShadow}">
      <h3 className="${styles.textPrimary} font-semibold mb-4">Quick Schedule</h3>
      <div className="space-y-3">
        <input
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} text-sm"
        />
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} text-sm"
        >
          {timeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          onClick={() => scheduleMutation.mutate({ date, time })}
          disabled={scheduleMutation.isPending}
          className="w-full ${styles.button} text-white py-2 rounded-lg text-sm font-medium hover:${styles.buttonHover} transition-colors disabled:opacity-50"
        >
          {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
        </button>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
`;
  }

  // Default calendar variant
  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface AppointmentSchedulerProps {
  ${dataName}?: Record<string, TimeSlot[]>;
  providerId?: string;
  providerName?: string;
  providerSpecialty?: string;
  onConfirm?: (date: Date, slot: TimeSlot, notes?: string) => void;
  appointmentType?: string;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  ${dataName}: propData,
  providerId,
  providerName,
  providerSpecialty,
  onConfirm,
  appointmentType = 'General Consultation',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Mutation for booking appointment
  const bookAppointmentMutation = useMutation({
    mutationFn: async (bookingData: { date: Date; slot: TimeSlot; notes?: string }) => {
      const response = await api.post<any>('${apiRoute}', {
        date: bookingData.date.toISOString(),
        slotId: bookingData.slot.id,
        time: bookingData.slot.time,
        providerId,
        appointmentType,
        notes: bookingData.notes,
      });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onConfirm && selectedDate && selectedSlot) onConfirm(selectedDate, selectedSlot, notes);
    },
  });

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', currentMonth.getMonth(), currentMonth.getFullYear()],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? {} : (response?.data || response?.slots || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const availableSlots = propData || fetchedData || {};

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];

  const hasAvailableSlots = (date: Date) => {
    const key = getDateKey(date);
    return availableSlots[key]?.some(s => s.available) ?? false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const selectedDateSlots = selectedDate
    ? availableSlots[getDateKey(selectedDate)] || []
    : [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-2xl overflow-hidden ${styles.cardShadow}">
      {/* Header */}
      <div className="${styles.primary} p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Book Appointment</h2>
        {providerName && (
          <p className="text-white/80">
            {providerName}
            {providerSpecialty && \` \${providerSpecialty}\`}
          </p>
        )}
        <p className="text-white/60 text-sm mt-2">{appointmentType}</p>
      </div>

      <div className="p-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="${styles.textSecondary} hover:${styles.textPrimary} p-2 rounded-lg hover:${styles.background} transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="${styles.textPrimary} font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="${styles.textSecondary} hover:${styles.textPrimary} p-2 rounded-lg hover:${styles.background} transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="${styles.textMuted} text-center text-xs font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {daysInMonth.map((date, idx) => (
            <div key={idx} className="aspect-square">
              {date ? (
                <button
                  onClick={() => !isPast(date) && setSelectedDate(date)}
                  disabled={isPast(date)}
                  className={\`w-full h-full rounded-lg text-sm font-medium transition-all \${
                    selectedDate?.toDateString() === date.toDateString()
                      ? '${styles.button} text-white'
                      : isPast(date)
                      ? '${styles.textMuted} cursor-not-allowed'
                      : isToday(date)
                      ? 'ring-2 ring-${styles.primary} ${styles.textPrimary}'
                      : hasAvailableSlots(date)
                      ? '${styles.textPrimary} hover:${styles.background}'
                      : '${styles.textMuted}'
                  }\`}
                >
                  {date.getDate()}
                  {hasAvailableSlots(date) && !isPast(date) && (
                    <div className="w-1.5 h-1.5 ${styles.button} rounded-full mx-auto mt-0.5" />
                  )}
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="border-t ${styles.cardBorder} pt-6">
            <h4 className="${styles.textPrimary} font-medium mb-3">
              Available Times for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h4>
            {selectedDateSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {selectedDateSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && setSelectedSlot(slot)}
                    disabled={!slot.available}
                    className={\`py-2 px-3 rounded-lg text-sm font-medium transition-all \${
                      selectedSlot?.id === slot.id
                        ? '${styles.button} text-white'
                        : slot.available
                        ? 'border ${styles.cardBorder} ${styles.textPrimary} hover:${styles.background}'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }\`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="${styles.textMuted} text-center py-4">No available slots</p>
            )}
          </div>
        )}

        {/* Notes */}
        {selectedSlot && (
          <div className="mt-4">
            <label className="${styles.textSecondary} text-sm font-medium mb-2 block">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for visit, symptoms, etc."
              rows={3}
              className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} resize-none focus:ring-2 focus:ring-${styles.primary} focus:border-transparent"
            />
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={() => selectedDate && selectedSlot && bookAppointmentMutation.mutate({ date: selectedDate, slot: selectedSlot, notes })}
          disabled={!selectedDate || !selectedSlot || bookAppointmentMutation.isPending}
          className={\`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors \${
            selectedDate && selectedSlot
              ? '${styles.button} text-white hover:${styles.buttonHover}'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }\`}
        >
          {bookAppointmentMutation.isPending
            ? 'Booking...'
            : selectedDate && selectedSlot
            ? \`Confirm \${selectedSlot.time} on \${selectedDate.toLocaleDateString()}\`
            : 'Select Date & Time'}
        </button>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
`;
};
