import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelTourBookingPage(
  resolved: ResolvedComponent,
  variant?: string,
): string {
  return `import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Star, Users, Calendar, Clock, Check, CreditCard, Wallet, Mountain, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface TourPackage {
  id: string;
  destination_id?: string;
  name: string;
  description?: string;
  short_description?: string;
  duration_days: number;
  duration_nights?: number;
  tour_type?: string;
  difficulty_level?: string;
  group_size_min?: number;
  group_size_max?: number;
  price: number;
  currency?: string;
  price_includes?: string[];
  price_excludes?: string[];
  highlights?: string[];
  images?: string[];
  cover_image?: string;
  rating?: number;
  departure_dates?: string[];
  is_featured?: boolean;
}

interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  dietaryRequirements: string;
}

export default function TourBookingPage() {
  const { tourId } = useParams<{ tourId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  // Booking details
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [travelerCount, setTravelerCount] = useState(parseInt(searchParams.get('travelers') || '2'));
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  const { data: tour, isLoading: loading } = useQuery({
    queryKey: ['tour-package', tourId],
    queryFn: async () => {
      const response = await api.get<any>(\`/tour_packages/\${tourId}\`);
      return response?.data || response;
    },
    enabled: !!tourId,
    retry: 1,
  });

  useEffect(() => {
    // Initialize travelers array based on count
    const newTravelers: Traveler[] = Array.from({ length: travelerCount }, (_, i) => ({
      id: \`traveler-\${i}\`,
      firstName: i === 0 && user?.name ? user.name.split(' ')[0] : '',
      lastName: i === 0 && user?.name ? user.name.split(' ').slice(1).join(' ') : '',
      dateOfBirth: '',
      nationality: '',
      dietaryRequirements: '',
    }));
    setTravelers(newTravelers);
  }, [travelerCount, user]);

  useEffect(() => {
    if (user) {
      setContactName(user.name || '');
      setContactEmail(user.email || '');
    }
  }, [user]);

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    setTravelers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateTotal = () => {
    return (tour?.price || 0) * travelerCount;
  };

  const calculateEndDate = () => {
    if (!selectedDate || !tour) return '';
    const start = new Date(selectedDate);
    start.setDate(start.getDate() + (tour.duration_days - 1));
    return start.toISOString().split('T')[0];
  };

  const handleBooking = async () => {
    if (!token) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    // Validate required fields
    const invalidTravelers = travelers.filter(t => !t.firstName || !t.lastName);
    if (invalidTravelers.length > 0 || !contactEmail || !selectedDate) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        booking_type: 'activity',
        booking_reference: \`TUR-\${Date.now()}-\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`,
        provider_name: tour?.name,
        start_date: selectedDate,
        end_date: calculateEndDate(),
        location: tour?.name,
        details: {
          tour_package_id: tour?.id,
          tour_name: tour?.name,
          tour_type: tour?.tour_type,
          difficulty_level: tour?.difficulty_level,
          duration_days: tour?.duration_days,
          duration_nights: tour?.duration_nights,
          departure_date: selectedDate,
          travelers: travelers,
          traveler_count: travelerCount,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          special_requests: specialRequests,
          payment_method: paymentMethod,
          price_per_person: tour?.price,
          price_includes: tour?.price_includes,
          price_excludes: tour?.price_excludes,
          highlights: tour?.highlights,
        },
        cost: calculateTotal(),
        currency: tour?.currency || 'USD',
        status: 'pending',
      };

      const response = await api.post<any>('/bookings', bookingData, { requireAuth: true });
      const booking = response?.data || response;

      navigate(\`/bookings/\${booking.id}/confirmation\`, {
        state: { booking, tour }
      });
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Tour not found</p>
      </div>
    );
  }

  const total = calculateTotal();
  const currency = tour.currency || '$';

  // Parse departure_dates if it's a string
  const departureDates = Array.isArray(tour.departure_dates)
    ? tour.departure_dates
    : (typeof tour.departure_dates === 'string' ? JSON.parse(tour.departure_dates || '[]') : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Book Tour</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Tour Summary */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              {tour.cover_image || tour.images?.[0] ? (
                <img src={tour.cover_image || tour.images?.[0]} alt={tour.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Mountain className="w-8 h-8 text-white/50" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold line-clamp-2">{tour.name}</h2>
              {tour.tour_type && (
                <span className="inline-block bg-white/10 text-cyan-400 text-xs px-2 py-0.5 rounded-full mt-1 capitalize">
                  {tour.tour_type}
                </span>
              )}
              <div className="flex items-center gap-3 mt-2 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {tour.duration_days} days
                </span>
                {tour.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {Number(tour.rating).toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-white font-bold mt-2">
                {currency}{tour.price}
                <span className="text-gray-400 text-sm font-normal">/person</span>
              </p>
            </div>
          </div>
        </div>

        {/* Departure Date */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Select Departure Date *</h3>
          {departureDates.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {departureDates.map((date: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={\`p-3 rounded-xl border text-left transition-all \${
                    selectedDate === date
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/20'
                  }\`}
                >
                  <p className="text-white font-medium">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
                required
              />
            </div>
          )}
        </div>

        {/* Number of Travelers */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Travelers</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Number of Travelers</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTravelerCount(Math.max(tour.group_size_min || 1, travelerCount - 1))}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white"
                disabled={travelerCount <= (tour.group_size_min || 1)}
              >-</button>
              <span className="text-white font-semibold w-8 text-center">{travelerCount}</span>
              <button
                onClick={() => setTravelerCount(Math.min(tour.group_size_max || 20, travelerCount + 1))}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white"
                disabled={travelerCount >= (tour.group_size_max || 20)}
              >+</button>
            </div>
          </div>
          {tour.group_size_max && (
            <p className="text-gray-500 text-xs mt-2">
              Group size: {tour.group_size_min || 1} - {tour.group_size_max} travelers
            </p>
          )}
        </div>

        {/* Traveler Details */}
        {travelers.map((traveler, index) => (
          <div key={traveler.id} className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Traveler {index + 1}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">First Name *</label>
                  <input
                    type="text"
                    value={traveler.firstName}
                    onChange={(e) => updateTraveler(index, 'firstName', e.target.value)}
                    placeholder="First name"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Last Name *</label>
                  <input
                    type="text"
                    value={traveler.lastName}
                    onChange={(e) => updateTraveler(index, 'lastName', e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={traveler.dateOfBirth}
                    onChange={(e) => updateTraveler(index, 'dateOfBirth', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Nationality</label>
                  <input
                    type="text"
                    value={traveler.nationality}
                    onChange={(e) => updateTraveler(index, 'nationality', e.target.value)}
                    placeholder="e.g., US"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Dietary Requirements</label>
                <input
                  type="text"
                  value={traveler.dietaryRequirements}
                  onChange={(e) => updateTraveler(index, 'dietaryRequirements', e.target.value)}
                  placeholder="e.g., Vegetarian, Halal, None"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Contact Details */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Contact Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Contact Name *</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Primary contact name"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email *</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Email for booking confirmation"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Phone Number</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Contact phone number"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Special Requests</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests or requirements?"
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Payment Method</h3>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={\`w-full flex items-center gap-3 p-4 rounded-xl border transition-all \${
                paymentMethod === 'card'
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-white/5 border-white/20'
              }\`}
            >
              <CreditCard className={\`w-5 h-5 \${paymentMethod === 'card' ? 'text-blue-400' : 'text-gray-400'}\`} />
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Credit/Debit Card</p>
                <p className="text-gray-400 text-sm">Pay securely with your card</p>
              </div>
              {paymentMethod === 'card' && <Check className="w-5 h-5 text-blue-400" />}
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={\`w-full flex items-center gap-3 p-4 rounded-xl border transition-all \${
                paymentMethod === 'cash'
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-white/5 border-white/20'
              }\`}
            >
              <Wallet className={\`w-5 h-5 \${paymentMethod === 'cash' ? 'text-blue-400' : 'text-gray-400'}\`} />
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Pay Later</p>
                <p className="text-gray-400 text-sm">Pay before departure</p>
              </div>
              {paymentMethod === 'cash' && <Check className="w-5 h-5 text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Price Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>{currency}{tour.price} x {travelerCount} traveler{travelerCount !== 1 ? 's' : ''}</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tour Duration</span>
              <span>{tour.duration_days} days{tour.duration_nights ? \` / \${tour.duration_nights} nights\` : ''}</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span>{currency}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-20">
        <button
          onClick={handleBooking}
          disabled={submitting || travelers.some(t => !t.firstName || !t.lastName) || !contactEmail || !selectedDate}
          className={\`w-full py-4 rounded-xl font-semibold text-lg transition-all \${
            submitting || travelers.some(t => !t.firstName || !t.lastName) || !contactEmail || !selectedDate
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
          }\`}
        >
          {submitting ? 'Processing...' : \`Confirm Booking - \${currency}\${total.toFixed(2)}\`}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
