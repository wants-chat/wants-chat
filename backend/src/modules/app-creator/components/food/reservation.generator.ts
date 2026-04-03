/**
 * Reservation Component Generator
 */

export interface ReservationOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateReservationForm(options: ReservationOptions = {}): string {
  const { componentName = 'ReservationForm', endpoint = '/reservations' } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calendar, Clock, Users, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    party_size: '2',
    name: '',
    email: '',
    phone: '',
    special_requests: '',
  });

  const createReservation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      toast.success('Reservation confirmed!');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setFormData({
        date: '',
        time: '',
        party_size: '2',
        name: '',
        email: '',
        phone: '',
        special_requests: '',
      });
    },
    onError: () => toast.error('Failed to make reservation'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReservation.mutate(formData);
  };

  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Make a Reservation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> Date *
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
              <Clock className="w-4 h-4 inline mr-1" /> Time *
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-1" /> Party Size *
            </label>
            <select
              value={formData.party_size}
              onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" /> Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" /> Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail className="w-4 h-4 inline mr-1" /> Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" /> Special Requests
          </label>
          <textarea
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            placeholder="Any dietary restrictions, special occasions, seating preferences..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={createReservation.isPending}
          className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createReservation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Confirm Reservation'
          )}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRestaurantInfo(options: ReservationOptions = {}): string {
  const componentName = options.componentName || 'RestaurantInfo';

  return `import React from 'react';
import { MapPin, Clock, Phone, Star, Wifi, Car, CreditCard } from 'lucide-react';

interface ${componentName}Props {
  restaurant?: {
    name?: string;
    address?: string;
    phone?: string;
    rating?: number;
    reviews_count?: number;
    hours?: Record<string, string>;
    amenities?: string[];
    description?: string;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ restaurant }) => {
  const defaultHours = {
    'Mon-Thu': '11:00 AM - 10:00 PM',
    'Fri-Sat': '11:00 AM - 11:00 PM',
    'Sunday': '12:00 PM - 9:00 PM',
  };

  const hours = restaurant?.hours || defaultHours;

  const amenityIcons: Record<string, any> = {
    'Free WiFi': Wifi,
    'Parking': Car,
    'Cards Accepted': CreditCard,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {restaurant?.name && (
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{restaurant.name}</h2>
      )}

      {restaurant?.rating && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={\`w-5 h-5 \${i < Math.floor(restaurant.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
              />
            ))}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{restaurant.rating}</span>
          {restaurant.reviews_count && (
            <span className="text-gray-500">({restaurant.reviews_count} reviews)</span>
          )}
        </div>
      )}

      {restaurant?.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{restaurant.description}</p>
      )}

      <div className="space-y-3 mb-4">
        {restaurant?.address && (
          <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <span>{restaurant.address}</span>
          </div>
        )}
        {restaurant?.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <a href={\`tel:\${restaurant.phone}\`} className="text-blue-600 hover:text-blue-700">
              {restaurant.phone}
            </a>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Hours
        </h3>
        <div className="space-y-1 text-sm">
          {Object.entries(hours).map(([day, time]) => (
            <div key={day} className="flex justify-between">
              <span className="text-gray-500">{day}</span>
              <span className="text-gray-900 dark:text-white">{time}</span>
            </div>
          ))}
        </div>
      </div>

      {restaurant?.amenities && restaurant.amenities.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {restaurant.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || null;
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {amenity}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
