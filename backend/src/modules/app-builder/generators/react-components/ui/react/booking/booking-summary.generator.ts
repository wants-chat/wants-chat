/**
 * Booking Summary Generator
 *
 * Generates booking confirmation and summary components.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generateBookingSummary = (
  resolved: ResolvedComponent,
  variant: 'card' | 'sidebar' | 'confirmation' = 'card'
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
    if (!dataSource || dataSource.trim() === '') return 'booking';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'booking';
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
    return `/${dataSource || 'bookings'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'booking';

  if (variant === 'sidebar') {
    return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface BookingItem {
  name: string;
  quantity?: number;
  price: number;
}

interface BookingSummaryProps {
  ${dataName}?: any;
  serviceName?: string;
  date?: string;
  time?: string;
  duration?: string;
  items?: BookingItem[];
  subtotal?: number;
  taxes?: number;
  discount?: number;
  total?: number;
  onConfirm?: () => void;
  onEdit?: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  ${dataName}: propData,
  serviceName: propServiceName,
  date: propDate,
  time: propTime,
  duration: propDuration,
  items: propItems,
  subtotal: propSubtotal,
  taxes: propTaxes,
  discount: propDiscount,
  total: propTotal,
  onConfirm,
  onEdit,
}) => {
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propServiceName,
    retry: 1,
  });

  // Mutation for confirming booking
  const confirmBookingMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('${apiRoute}', {
        serviceName,
        date,
        time,
        duration,
        items,
        subtotal,
        taxes,
        discount,
        total,
      });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onConfirm) onConfirm();
    },
  });

  const bookingData = propData || fetchedData || {};
  const serviceName = propServiceName || bookingData.serviceName || 'Service';
  const date = propDate || bookingData.date;
  const time = propTime || bookingData.time;
  const duration = propDuration || bookingData.duration;
  const items = propItems || bookingData.items || [];
  const subtotal = propSubtotal ?? bookingData.subtotal ?? 0;
  const taxes = propTaxes ?? bookingData.taxes ?? 0;
  const discount = propDiscount ?? bookingData.discount ?? 0;
  const total = propTotal ?? bookingData.total ?? (subtotal + taxes - discount);

  if (isLoading && !propData && !propServiceName) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl ${styles.cardShadow} sticky top-4">
      <div className="p-4 border-b ${styles.cardBorder}">
        <h3 className="${styles.textPrimary} font-semibold">Booking Summary</h3>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="${styles.textMuted} text-xs uppercase tracking-wider">Service</p>
          <p className="${styles.textPrimary} font-medium">{serviceName}</p>
        </div>

        <div className="flex gap-4">
          <div>
            <p className="${styles.textMuted} text-xs uppercase tracking-wider">Date</p>
            <p className="${styles.textPrimary} font-medium">{date}</p>
          </div>
          <div>
            <p className="${styles.textMuted} text-xs uppercase tracking-wider">Time</p>
            <p className="${styles.textPrimary} font-medium">{time}</p>
          </div>
        </div>

        {duration && (
          <div>
            <p className="${styles.textMuted} text-xs uppercase tracking-wider">Duration</p>
            <p className="${styles.textPrimary} font-medium">{duration}</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t ${styles.cardBorder} pt-4 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="${styles.textSecondary}">
                  {item.name} {item.quantity && item.quantity > 1 ? \`x\${item.quantity}\` : ''}
                </span>
                <span className="${styles.textPrimary}">\${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t ${styles.cardBorder} pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="${styles.textMuted}">Subtotal</span>
            <span className="${styles.textPrimary}">\${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-\${discount.toFixed(2)}</span>
            </div>
          )}
          {taxes > 0 && (
            <div className="flex justify-between">
              <span className="${styles.textMuted}">Taxes</span>
              <span className="${styles.textPrimary}">\${taxes.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t ${styles.cardBorder}">
            <span className="${styles.textPrimary}">Total</span>
            <span className="${styles.primary}">\${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => confirmBookingMutation.mutate()}
            disabled={confirmBookingMutation.isPending}
            className="w-full ${styles.button} text-white py-3 rounded-lg font-medium hover:${styles.buttonHover} transition-colors disabled:opacity-50"
          >
            {confirmBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-full border ${styles.cardBorder} ${styles.textSecondary} py-2 rounded-lg text-sm hover:${styles.background} transition-colors"
            >
              Edit Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
`;
  }

  if (variant === 'confirmation') {
    return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface BookingSummaryProps {
  ${dataName}?: any;
  bookingId?: string;
  serviceName?: string;
  providerName?: string;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  total?: number;
  status?: 'confirmed' | 'pending' | 'cancelled';
  onAddToCalendar?: () => void;
  onViewDetails?: () => void;
  onCancel?: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  ${dataName}: propData,
  bookingId: propBookingId,
  serviceName: propServiceName,
  providerName: propProviderName,
  date: propDate,
  time: propTime,
  duration: propDuration,
  location: propLocation,
  total: propTotal,
  status: propStatus,
  onAddToCalendar,
  onViewDetails,
  onCancel,
}) => {
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', propBookingId],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propBookingId,
    retry: 1,
  });

  // Mutation for cancelling booking
  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('${apiRoute}/cancel', { bookingId });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onCancel) onCancel();
    },
  });

  const bookingData = propData || fetchedData || {};
  const bookingId = propBookingId || bookingData.bookingId || bookingData.id || 'N/A';
  const serviceName = propServiceName || bookingData.serviceName || 'Service';
  const providerName = propProviderName || bookingData.providerName;
  const date = propDate || bookingData.date;
  const time = propTime || bookingData.time;
  const duration = propDuration || bookingData.duration;
  const location = propLocation || bookingData.location;
  const total = propTotal ?? bookingData.total ?? 0;
  const status = propStatus || bookingData.status || 'confirmed';

  if (isLoading && !propData && !propBookingId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusConfig = {
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: '✓' },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: '⏳' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '✗' },
  };

  return (
    <div className="${styles.card} rounded-2xl ${styles.cardShadow} overflow-hidden text-center">
      <div className="${styles.primary} py-8 text-white">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-3xl">
          {statusConfig[status].icon}
        </div>
        <h2 className="text-2xl font-bold mb-1">Booking {statusConfig[status].label}!</h2>
        <p className="text-white/80">Confirmation #{bookingId}</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="${styles.background} rounded-xl p-4 text-left space-y-3">
          <div>
            <p className="${styles.textMuted} text-xs uppercase tracking-wider">Service</p>
            <p className="${styles.textPrimary} font-semibold">{serviceName}</p>
            {providerName && <p className="${styles.textSecondary} text-sm">with {providerName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="${styles.textMuted} text-xs uppercase tracking-wider">Date</p>
              <p className="${styles.textPrimary} font-medium">{date}</p>
            </div>
            <div>
              <p className="${styles.textMuted} text-xs uppercase tracking-wider">Time</p>
              <p className="${styles.textPrimary} font-medium">{time}</p>
            </div>
          </div>

          {duration && (
            <div>
              <p className="${styles.textMuted} text-xs uppercase tracking-wider">Duration</p>
              <p className="${styles.textPrimary} font-medium">{duration}</p>
            </div>
          )}

          {location && (
            <div>
              <p className="${styles.textMuted} text-xs uppercase tracking-wider">Location</p>
              <p className="${styles.textPrimary} font-medium">{location}</p>
            </div>
          )}

          <div className="pt-3 border-t ${styles.cardBorder}">
            <div className="flex justify-between">
              <span className="${styles.textSecondary}">Total Paid</span>
              <span className="${styles.primary} font-bold text-lg">\${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onAddToCalendar && (
            <button
              onClick={onAddToCalendar}
              className="flex-1 ${styles.button} text-white py-2.5 rounded-lg font-medium hover:${styles.buttonHover} transition-colors"
            >
              Add to Calendar
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 border ${styles.cardBorder} ${styles.textPrimary} py-2.5 rounded-lg font-medium hover:${styles.background} transition-colors"
            >
              View Details
            </button>
          )}
        </div>

        {status !== 'cancelled' && onCancel && (
          <button
            onClick={() => cancelBookingMutation.mutate()}
            disabled={cancelBookingMutation.isPending}
            className="${styles.textMuted} text-sm hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
`;
  }

  // Default card variant
  return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface BookingItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

interface BookingSummaryProps {
  ${dataName}?: any;
  title?: string;
  date?: string;
  time?: string;
  items?: BookingItem[];
  subtotal?: number;
  discount?: { code: string; amount: number };
  tax?: number;
  total?: number;
  onRemoveItem?: (id: string) => void;
  onApplyPromo?: (code: string) => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  ${dataName}: propData,
  title = 'Order Summary',
  date: propDate,
  time: propTime,
  items: propItems,
  subtotal: propSubtotal,
  discount: propDiscount,
  tax: propTax,
  total: propTotal,
  onRemoveItem,
  onApplyPromo,
}) => {
  const [promoCode, setPromoCode] = React.useState('');

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propDate,
    retry: 1,
  });

  const bookingData = propData || fetchedData || {};
  const date = propDate || bookingData.date;
  const time = propTime || bookingData.time;
  const items = propItems || bookingData.items || [];
  const subtotal = propSubtotal ?? bookingData.subtotal ?? 0;
  const discount = propDiscount || bookingData.discount;
  const tax = propTax ?? bookingData.tax ?? 0;
  const total = propTotal ?? bookingData.total ?? (subtotal + tax - (discount?.amount || 0));

  if (isLoading && !propData && !propDate) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl p-6 ${styles.cardShadow}">
      <h3 className="${styles.textPrimary} font-semibold text-lg mb-4">{title}</h3>

      {/* Date & Time */}
      {(date || time) && (
        <div className="${styles.background} rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 ${styles.primary}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              {date && <p className="${styles.textPrimary} font-medium">{date}</p>}
              {time && <p className="${styles.textSecondary} text-sm">{time}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      {items.length > 0 && (
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="${styles.textPrimary}">{item.name}</p>
                {item.quantity && item.quantity > 1 && (
                  <p className="${styles.textMuted} text-sm">Qty: {item.quantity}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="${styles.textPrimary} font-medium">\${item.price.toFixed(2)}</span>
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="${styles.textMuted} hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promo Code */}
      {onApplyPromo && !discount && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} text-sm"
          />
          <button
            onClick={() => onApplyPromo(promoCode)}
            className="${styles.primary} px-4 py-2 rounded-lg text-sm font-medium hover:underline"
          >
            Apply
          </button>
        </div>
      )}

      {/* Totals */}
      <div className="border-t ${styles.cardBorder} pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="${styles.textMuted}">Subtotal</span>
          <span className="${styles.textPrimary}">\${subtotal.toFixed(2)}</span>
        </div>

        {discount && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount ({discount.code})</span>
            <span>-\${discount.amount.toFixed(2)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="${styles.textMuted}">Tax</span>
            <span className="${styles.textPrimary}">\${tax.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg pt-2 border-t ${styles.cardBorder}">
          <span className="${styles.textPrimary}">Total</span>
          <span className="${styles.primary}">\${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
`;
};
