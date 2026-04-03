import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelFlightBookingPage(
  resolved: ResolvedComponent,
  variant?: string,
): string {
  return `import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plane, Clock, Users, Calendar, Check, CreditCard, Wallet, Luggage, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  airline_logo?: string;
  departure_airport: string;
  departure_city: string;
  departure_country?: string;
  arrival_airport: string;
  arrival_city: string;
  arrival_country?: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes?: number;
  stops?: number;
  stop_details?: any;
  aircraft?: string;
  cabin_class: string;
  price: number;
  currency?: string;
  baggage_allowance?: any;
  amenities?: string[];
  available_seats?: number;
  is_refundable?: boolean;
}

interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
}

export default function FlightBookingPage() {
  const { flightId } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  // Booking details
  const [passengerCount, setPassengerCount] = useState(parseInt(searchParams.get('passengers') || '1'));
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  const { data: flight, isLoading: loading } = useQuery({
    queryKey: ['flight', flightId],
    queryFn: async () => {
      const response = await api.get<any>(\`/flights/\${flightId}\`);
      return response?.data || response;
    },
    enabled: !!flightId,
    retry: 1,
  });

  useEffect(() => {
    // Initialize passengers array based on count
    const newPassengers: Passenger[] = Array.from({ length: passengerCount }, (_, i) => ({
      id: \`passenger-\${i}\`,
      type: 'adult',
      firstName: i === 0 && user?.name ? user.name.split(' ')[0] : '',
      lastName: i === 0 && user?.name ? user.name.split(' ').slice(1).join(' ') : '',
      dateOfBirth: '',
      passportNumber: '',
      passportExpiry: '',
      nationality: '',
    }));
    setPassengers(newPassengers);
  }, [passengerCount, user]);

  useEffect(() => {
    if (user) {
      setContactEmail(user.email || '');
    }
  }, [user]);

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return \`\${hours}h \${mins}m\`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const calculateTotal = () => {
    return (flight?.price || 0) * passengerCount;
  };

  const handleBooking = async () => {
    if (!token) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    // Validate required fields
    const invalidPassengers = passengers.filter(p => !p.firstName || !p.lastName);
    if (invalidPassengers.length > 0 || !contactEmail) {
      alert('Please fill in all required passenger details');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        booking_type: 'flight',
        booking_reference: \`FLT-\${Date.now()}-\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`,
        provider_name: flight?.airline,
        start_date: flight?.departure_time,
        end_date: flight?.arrival_time,
        location: \`\${flight?.departure_city} to \${flight?.arrival_city}\`,
        details: {
          flight_id: flight?.id,
          flight_number: flight?.flight_number,
          airline: flight?.airline,
          departure_airport: flight?.departure_airport,
          departure_city: flight?.departure_city,
          arrival_airport: flight?.arrival_airport,
          arrival_city: flight?.arrival_city,
          departure_time: flight?.departure_time,
          arrival_time: flight?.arrival_time,
          cabin_class: flight?.cabin_class,
          duration_minutes: flight?.duration_minutes,
          passengers: passengers,
          passenger_count: passengerCount,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          payment_method: paymentMethod,
          price_per_person: flight?.price,
          is_refundable: flight?.is_refundable,
        },
        cost: calculateTotal(),
        currency: flight?.currency || 'USD',
        status: 'pending',
      };

      const response = await api.post<any>('/bookings', bookingData, { requireAuth: true });
      const booking = response?.data || response;

      navigate(\`/bookings/\${booking.id}/confirmation\`, {
        state: { booking, flight }
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

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Flight not found</p>
      </div>
    );
  }

  const total = calculateTotal();
  const currency = flight.currency || '$';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Book Flight</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Flight Summary */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {flight.airline_logo ? (
                <img src={flight.airline_logo} alt={flight.airline} className="w-10 h-10 rounded" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{flight.airline}</p>
                <p className="text-gray-400 text-sm">{flight.flight_number} · {flight.cabin_class}</p>
              </div>
            </div>
            {flight.is_refundable && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Refundable</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{formatTime(flight.departure_time)}</p>
              <p className="text-gray-400 text-sm">{flight.departure_airport}</p>
              <p className="text-gray-500 text-xs">{flight.departure_city}</p>
            </div>
            <div className="flex-1 flex flex-col items-center px-4">
              <p className="text-gray-400 text-xs mb-1">{formatDuration(flight.duration_minutes)}</p>
              <div className="w-full flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="flex-1 h-px bg-blue-400/50 mx-1"></div>
                <Plane className="w-4 h-4 text-blue-400 transform rotate-90" />
                <div className="flex-1 h-px bg-blue-400/50 mx-1"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <p className="text-gray-400 text-xs mt-1">{flight.stops === 0 ? 'Direct' : \`\${flight.stops} stop\${flight.stops > 1 ? 's' : ''}\`}</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{formatTime(flight.arrival_time)}</p>
              <p className="text-gray-400 text-sm">{flight.arrival_airport}</p>
              <p className="text-gray-500 text-xs">{flight.arrival_city}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-sm">{formatDate(flight.departure_time)}</p>
            <p className="text-white font-bold text-lg">{currency}{flight.price}<span className="text-gray-400 text-sm font-normal">/person</span></p>
          </div>
        </div>

        {/* Number of Passengers */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Passengers</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Number of Passengers</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white"
                disabled={passengerCount <= 1}
              >-</button>
              <span className="text-white font-semibold w-8 text-center">{passengerCount}</span>
              <button
                onClick={() => setPassengerCount(Math.min(flight.available_seats || 9, passengerCount + 1))}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white"
              >+</button>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Passenger {index + 1}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">First Name *</label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                    placeholder="First name"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Last Name *</label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
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
                    value={passenger.dateOfBirth}
                    onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Nationality</label>
                  <input
                    type="text"
                    value={passenger.nationality}
                    onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                    placeholder="e.g., US"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Passport Number</label>
                  <input
                    type="text"
                    value={passenger.passportNumber}
                    onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                    placeholder="Passport number"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Passport Expiry</label>
                  <input
                    type="date"
                    value={passenger.passportExpiry}
                    onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact Details */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Contact Details</h3>
          <div className="space-y-4">
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
                <p className="text-gray-400 text-sm">Pay at the counter</p>
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
              <span>{currency}{flight.price} x {passengerCount} passenger{passengerCount !== 1 ? 's' : ''}</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Taxes & Fees</span>
              <span>Included</span>
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
          disabled={submitting || passengers.some(p => !p.firstName || !p.lastName) || !contactEmail}
          className={\`w-full py-4 rounded-xl font-semibold text-lg transition-all \${
            submitting || passengers.some(p => !p.firstName || !p.lastName) || !contactEmail
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
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
