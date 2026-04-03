/**
 * Time Slot Picker Generator
 *
 * Generates time slot selection components for booking applications.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generateTimeSlotPicker = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' | 'compact' = 'grid'
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
    return `/${dataSource || 'time-slots'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'timeSlots';

  if (variant === 'list') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
}

interface TimeSlotPickerProps {
  ${dataName}?: TimeSlot[];
  selectedTime?: string;
  onSelect?: (time: string) => void;
  showPrice?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  ${dataName}: propData,
  selectedTime,
  onSelect,
  showPrice = false,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.slots || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const slots = propData || fetchedData || [];

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[150px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => slot.available && onSelect?.(slot.time)}
          disabled={!slot.available}
          className={\`w-full p-3 rounded-lg flex items-center justify-between transition-all \${
            selectedTime === slot.time
              ? '${styles.button} text-white'
              : slot.available
              ? 'border ${styles.cardBorder} ${styles.textPrimary} hover:${styles.background}'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }\`}
        >
          <span className="font-medium">{slot.time}</span>
          {showPrice && slot.price && slot.available && (
            <span className="text-sm">\${slot.price}</span>
          )}
          {!slot.available && (
            <span className="text-sm">Unavailable</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker;
`;
  }

  if (variant === 'compact') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TimeSlotPickerProps {
  ${dataName}?: string[];
  selectedTime?: string;
  onSelect?: (time: string) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  ${dataName}: propData,
  selectedTime,
  onSelect,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.slots || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const slots = propData || fetchedData || [];

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[50px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((time) => (
        <button
          key={time}
          onClick={() => onSelect?.(time)}
          className={\`px-3 py-1.5 rounded text-sm font-medium transition-colors \${
            selectedTime === time
              ? '${styles.button} text-white'
              : 'border ${styles.cardBorder} ${styles.textSecondary} hover:${styles.background}'
          }\`}
        >
          {time}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker;
`;
  }

  // Default grid variant
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  spotsLeft?: number;
}

interface TimeSlotPickerProps {
  ${dataName}?: TimeSlot[];
  date?: Date;
  selectedTime?: string;
  onSelect?: (time: string) => void;
  showSpotsLeft?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  ${dataName}: propData,
  date = new Date(),
  selectedTime,
  onSelect,
  showSpotsLeft = false,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', date.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.slots || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const slots = propData || fetchedData || [];

  const morningSlots = slots.filter(s => parseInt(s.time) < 12);
  const afternoonSlots = slots.filter(s => parseInt(s.time) >= 12 && parseInt(s.time) < 17);
  const eveningSlots = slots.filter(s => parseInt(s.time) >= 17);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderSlots = (slotGroup: TimeSlot[], label: string) => {
    if (slotGroup.length === 0) return null;

    return (
      <div className="mb-4">
        <p className="${styles.textMuted} text-sm font-medium mb-2">{label}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slotGroup.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelect?.(slot.time)}
              disabled={!slot.available}
              className={\`relative py-2.5 px-3 rounded-lg text-sm font-medium transition-all \${
                selectedTime === slot.time
                  ? '${styles.button} text-white'
                  : slot.available
                  ? 'border ${styles.cardBorder} ${styles.textPrimary} hover:${styles.background}'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
              }\`}
            >
              {slot.time}
              {showSpotsLeft && slot.spotsLeft && slot.spotsLeft <= 3 && slot.available && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {slot.spotsLeft}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="${styles.card} rounded-xl p-4 ${styles.cardShadow}">
      <div className="mb-4">
        <p className="${styles.textMuted} text-sm">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h3 className="${styles.textPrimary} font-semibold">Select a Time</h3>
      </div>

      {slots.length === 0 ? (
        <p className="${styles.textMuted} text-center py-4">No available slots for this date</p>
      ) : (
        <>
          {renderSlots(morningSlots, 'Morning')}
          {renderSlots(afternoonSlots, 'Afternoon')}
          {renderSlots(eveningSlots, 'Evening')}
        </>
      )}

      {selectedTime && (
        <div className="mt-4 pt-4 border-t ${styles.cardBorder}">
          <p className="${styles.textSecondary} text-sm">
            Selected: <span className="${styles.textPrimary} font-medium">{selectedTime}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
`;
};
