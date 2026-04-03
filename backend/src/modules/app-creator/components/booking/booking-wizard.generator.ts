/**
 * Booking Wizard Component Generator
 *
 * Generates a multi-step booking wizard with service selection,
 * date/time picker, and confirmation.
 */

export interface BookingWizardOptions {
  componentName?: string;
  endpoint?: string;
  steps?: string[];
}

export function generateBookingWizard(options: BookingWizardOptions = {}): string {
  const {
    componentName = 'BookingWizard',
    endpoint = '/appointments',
    steps = ['Service', 'Date & Time', 'Details', 'Confirm'],
  } = options;

  return `import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const steps = ${JSON.stringify(steps)};

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [booking, setBooking] = useState({
    service_id: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get<any>('/services');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createBooking = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      toast.success('Booking confirmed!');
      navigate('${endpoint}');
    },
    onError: () => toast.error('Failed to create booking'),
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      createBooking.mutate(booking);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!booking.service_id;
      case 1: return !!booking.date && !!booking.time;
      case 2: return !!booking.name && !!booking.email;
      default: return true;
    }
  };

  const selectedService = services?.find((s: any) => s.id === booking.service_id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-medium \${
              index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }\`}>
              {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
            </div>
            <span className={\`hidden sm:block ml-2 text-sm \${
              index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500'
            }\`}>
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className={\`w-8 sm:w-16 h-1 mx-2 \${index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}\`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {currentStep === 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select a Service</h3>
            <div className="grid gap-3">
              {services?.map((service: any) => (
                <label
                  key={service.id}
                  className={\`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors \${
                    booking.service_id === service.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={booking.service_id === service.id}
                      onChange={(e) => setBooking({ ...booking, service_id: e.target.value })}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                      {service.duration && <p className="text-sm text-gray-500">{service.duration} min</p>}
                    </div>
                  </div>
                  {service.price && <span className="font-semibold text-green-600">\${service.price}</span>}
                </label>
              )) || (
                <p className="text-gray-500">No services available</p>
              )}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Choose Date & Time</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={booking.date}
                onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </label>
              <select
                value={booking.time}
                onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="">Select time...</option>
                {['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Your Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Name *
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={booking.name}
                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={booking.email}
                onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={booking.phone}
                onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
              <textarea
                placeholder="Any special requests..."
                value={booking.notes}
                onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.email}</span>
              </div>
              {selectedService?.price && (
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-bold text-green-600">\${selectedService.price}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || createBooking.isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? (createBooking.isPending ? 'Confirming...' : 'Confirm Booking') : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
