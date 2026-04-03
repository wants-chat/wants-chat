/**
 * Service Booking Generator
 *
 * Generates service appointment booking component for automotive applications.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generateServiceBooking = (
  resolved: ResolvedComponent,
  variant: 'full' | 'quick' | 'widget' = 'full'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'services'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'services';

  if (variant === 'quick') {
    return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface ServiceBookingProps {
  services?: Array<{ id: string; name: string; price: number; duration: string }>;
  onBook: (data: { serviceId: string; date: string; time: string }) => void;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  services: propServices,
  onBook,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.services || []);
    },
    enabled: !propServices,
    retry: 1,
  });

  const services = propServices || fetchedData || [];

  if (isLoading && !propServices) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');

  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  return (
    <div className="${styles.card} rounded-xl p-6 ${styles.cardShadow}">
      <h3 className="${styles.textPrimary} font-semibold text-lg mb-4">Quick Service Booking</h3>

      <div className="space-y-4">
        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full px-4 py-2.5 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - \${s.price} ({s.duration})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
          />
        </div>

        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2.5 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
          >
            {times.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onBook({ serviceId, date, time })}
          disabled={!date}
          className={\`w-full py-3 rounded-lg font-medium transition-colors \${
            date
              ? '${styles.button} text-white hover:${styles.buttonHover}'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }\`}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default ServiceBooking;
`;
  }

  if (variant === 'widget') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface ServiceBookingProps {
  config?: any;
  onSchedule: () => void;
  nextAvailable?: string;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  config: propData,
  onSchedule,
  nextAvailable: propNextAvailable,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const config = propData || fetchedData || {};
  const nextAvailable = propNextAvailable || config.nextAvailable || 'Today';

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[80px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="${styles.card} rounded-xl p-4 ${styles.cardShadow}">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 ${styles.background} rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 ${styles.primary}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="${styles.textPrimary} font-medium">Schedule Service</p>
          <p className="${styles.textMuted} text-sm">Next available: {nextAvailable}</p>
        </div>
        <button
          onClick={onSchedule}
          className="${styles.button} text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceBooking;
`;
  }

  // Default full variant
  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin?: string;
}

interface ServiceBookingProps {
  bookingData?: any;
  services?: Service[];
  vehicles?: Vehicle[];
  availableSlots?: Record<string, string[]>;
  onSubmit: (booking: BookingData) => void;
}

interface BookingData {
  vehicleId?: string;
  vehicleInfo?: { year: number; make: string; model: string };
  serviceIds: string[];
  date: string;
  time: string;
  notes?: string;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  bookingData: propData,
  services: propServices,
  vehicles: propVehicles = [],
  availableSlots: propAvailableSlots,
  onSubmit,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propServices,
    retry: 1,
  });

  const bookingData = propData || fetchedData || {};
  const services = propServices || bookingData.services || [];
  const vehicles = propVehicles.length > 0 ? propVehicles : (bookingData.vehicles || []);
  const availableSlots = propAvailableSlots || bookingData.availableSlots || {};

  if (isLoading && !propData && !propServices) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState({ year: '', make: '', model: '' });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const categories = [...new Set(services.map(s => s.category))];

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectedServicesData = services.filter(s => selectedServices.includes(s.id));
  const totalPrice = selectedServicesData.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesData.reduce((sum, s) => sum + parseInt(s.duration), 0);

  const handleSubmit = () => {
    onSubmit({
      vehicleId: selectedVehicle || undefined,
      vehicleInfo: !selectedVehicle && newVehicle.year ? {
        year: parseInt(newVehicle.year),
        make: newVehicle.make,
        model: newVehicle.model,
      } : undefined,
      serviceIds: selectedServices,
      date: selectedDate,
      time: selectedTime,
      notes: notes || undefined,
    });
  };

  return (
    <div className="${styles.card} rounded-2xl overflow-hidden ${styles.cardShadow}">
      {/* Header */}
      <div className="${styles.primary} p-6 text-white">
        <h2 className="text-xl font-bold">Schedule Service Appointment</h2>
        <p className="text-white/80 mt-1">Book your next service visit</p>
      </div>

      {/* Progress Steps */}
      <div className="flex border-b ${styles.cardBorder}">
        {[
          { num: 1, label: 'Vehicle' },
          { num: 2, label: 'Services' },
          { num: 3, label: 'Schedule' },
          { num: 4, label: 'Confirm' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={\`flex-1 py-4 text-center font-medium transition-colors \${
              step === s.num
                ? '${styles.primary} border-b-2 border-current'
                : step > s.num
                ? '${styles.textSecondary} cursor-pointer'
                : '${styles.textMuted} cursor-not-allowed'
            }\`}
            disabled={s.num > step}
          >
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{s.num}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Vehicle */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="${styles.textPrimary} font-semibold text-lg">Select Your Vehicle</h3>

            {vehicles.length > 0 && (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id)}
                    className={\`w-full p-4 rounded-lg border text-left transition-all \${
                      selectedVehicle === v.id
                        ? 'border-2 ${styles.primary} border-current'
                        : '${styles.cardBorder} hover:${styles.background}'
                    }\`}
                  >
                    <p className="${styles.textPrimary} font-medium">{v.year} {v.make} {v.model}</p>
                    {v.vin && <p className="${styles.textMuted} text-sm">VIN: {v.vin}</p>}
                  </button>
                ))}
              </div>
            )}

            <div className="pt-4 border-t ${styles.cardBorder}">
              <p className="${styles.textSecondary} text-sm mb-3">Or enter vehicle details:</p>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Year"
                  value={newVehicle.year}
                  onChange={(e) => { setNewVehicle(prev => ({ ...prev, year: e.target.value })); setSelectedVehicle(''); }}
                  className="px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                />
                <input
                  type="text"
                  placeholder="Make"
                  value={newVehicle.make}
                  onChange={(e) => { setNewVehicle(prev => ({ ...prev, make: e.target.value })); setSelectedVehicle(''); }}
                  className="px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={newVehicle.model}
                  onChange={(e) => { setNewVehicle(prev => ({ ...prev, model: e.target.value })); setSelectedVehicle(''); }}
                  className="px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedVehicle && !newVehicle.year}
              className={\`w-full py-3 rounded-lg font-medium transition-colors \${
                selectedVehicle || newVehicle.year
                  ? '${styles.button} text-white hover:${styles.buttonHover}'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }\`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="${styles.textPrimary} font-semibold text-lg">Select Services</h3>

            {categories.map((cat) => (
              <div key={cat}>
                <h4 className="${styles.textSecondary} text-sm font-medium uppercase tracking-wider mb-3">{cat}</h4>
                <div className="space-y-2">
                  {services.filter(s => s.category === cat).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={\`w-full p-4 rounded-lg border text-left transition-all \${
                        selectedServices.includes(service.id)
                          ? 'border-2 ${styles.primary} border-current ${styles.background}'
                          : '${styles.cardBorder} hover:${styles.background}'
                      }\`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="${styles.textPrimary} font-medium">{service.name}</p>
                          <p className="${styles.textMuted} text-sm">{service.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="${styles.primary} font-bold">\${service.price}</p>
                          <p className="${styles.textMuted} text-sm">{service.duration}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t ${styles.cardBorder}">
              <button onClick={() => setStep(1)} className="${styles.textSecondary}">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedServices.length === 0}
                className={\`px-6 py-2.5 rounded-lg font-medium transition-colors \${
                  selectedServices.length > 0
                    ? '${styles.button} text-white hover:${styles.buttonHover}'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }\`}
              >
                Continue ({selectedServices.length} selected)
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="${styles.textPrimary} font-semibold text-lg">Select Date & Time</h3>

            <div>
              <label className="${styles.textSecondary} text-sm font-medium block mb-2">Preferred Date</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
              />
            </div>

            {selectedDate && availableSlots[selectedDate] && (
              <div>
                <label className="${styles.textSecondary} text-sm font-medium block mb-2">Available Times</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots[selectedDate].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={\`py-2.5 rounded-lg text-sm font-medium transition-colors \${
                        selectedTime === time
                          ? '${styles.button} text-white'
                          : 'border ${styles.cardBorder} ${styles.textPrimary} hover:${styles.background}'
                      }\`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="${styles.textSecondary} text-sm font-medium block mb-2">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or requests..."
                rows={3}
                className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t ${styles.cardBorder}">
              <button onClick={() => setStep(2)} className="${styles.textSecondary}">Back</button>
              <button
                onClick={() => setStep(4)}
                disabled={!selectedTime}
                className={\`px-6 py-2.5 rounded-lg font-medium transition-colors \${
                  selectedTime
                    ? '${styles.button} text-white hover:${styles.buttonHover}'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }\`}
              >
                Review Booking
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="${styles.textPrimary} font-semibold text-lg">Confirm Your Appointment</h3>

            <div className="${styles.background} rounded-xl p-4 space-y-4">
              <div>
                <p className="${styles.textMuted} text-sm">Vehicle</p>
                <p className="${styles.textPrimary} font-medium">
                  {selectedVehicle
                    ? (() => { const v = vehicles.find(v => v.id === selectedVehicle); return v ? \`\${v.year} \${v.make} \${v.model}\` : ''; })()
                    : \`\${newVehicle.year} \${newVehicle.make} \${newVehicle.model}\`
                  }
                </p>
              </div>

              <div>
                <p className="${styles.textMuted} text-sm">Services</p>
                <ul className="${styles.textPrimary}">
                  {selectedServicesData.map((s) => (
                    <li key={s.id} className="flex justify-between py-1">
                      <span>{s.name}</span>
                      <span className="font-medium">\${s.price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t ${styles.cardBorder}">
                <div className="flex justify-between ${styles.textPrimary} font-bold">
                  <span>Total</span>
                  <span>\${totalPrice}</span>
                </div>
                <p className="${styles.textMuted} text-sm">Estimated time: {totalDuration} min</p>
              </div>

              <div>
                <p className="${styles.textMuted} text-sm">Date & Time</p>
                <p className="${styles.textPrimary} font-medium">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                </p>
              </div>

              {notes && (
                <div>
                  <p className="${styles.textMuted} text-sm">Notes</p>
                  <p className="${styles.textSecondary}">{notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(3)} className="${styles.textSecondary}">Back</button>
              <button
                onClick={handleSubmit}
                className="${styles.button} text-white px-8 py-3 rounded-lg font-medium hover:${styles.buttonHover} transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceBooking;
`;
};
