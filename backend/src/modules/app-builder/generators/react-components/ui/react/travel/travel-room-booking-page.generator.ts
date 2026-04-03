import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelRoomBookingPage(
  resolved: ResolvedComponent,
  variant?: string,
): string {
  return `import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Star, Users, Calendar, Bed, Check, X, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Room {
  id: string;
  hotel_id: string;
  room_type: string;
  name?: string;
  description?: string;
  price_per_night: number;
  currency?: string;
  max_occupancy?: number;
  bed_type?: string;
  size_sqm?: number;
  amenities?: string[];
  images?: string[];
  is_available?: boolean;
}

interface Hotel {
  id: string;
  name: string;
  destination_id?: string;
  address?: string;
  city?: string;
  country?: string;
  star_rating?: number;
  cover_image?: string;
}

export default function RoomBookingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  // Booking details
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '2'));
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  // Guest details
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState('');

  const { data: room, isLoading: loadingRoom } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      const response = await api.get<any>(\`/rooms/\${roomId}\`);
      return response?.data || response;
    },
    enabled: !!roomId,
    retry: 1,
  });

  const { data: hotel, isLoading: loadingHotel } = useQuery({
    queryKey: ['hotel', room?.hotel_id],
    queryFn: async () => {
      const response = await api.get<any>(\`/hotels/\${room?.hotel_id}\`);
      return response?.data || response;
    },
    enabled: !!room?.hotel_id,
    retry: 1,
  });

  const loading = loadingRoom || (room?.hotel_id && loadingHotel);

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
    }
  }, [user]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (room?.price_per_night || 0);
  };

  const handleBooking = async () => {
    if (!token) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    if (!checkIn || !checkOut || !guestName || !guestEmail) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        booking_type: 'hotel',
        booking_reference: \`HTL-\${Date.now()}-\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`,
        provider_name: hotel?.name,
        start_date: checkIn,
        end_date: checkOut,
        location: hotel?.city ? \`\${hotel.city}, \${hotel.country}\` : hotel?.address,
        details: {
          room_id: room?.id,
          room_type: room?.room_type,
          room_name: room?.name,
          hotel_id: hotel?.id,
          hotel_name: hotel?.name,
          guests: guests,
          nights: calculateNights(),
          price_per_night: room?.price_per_night,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          special_requests: specialRequests,
          payment_method: paymentMethod,
        },
        cost: calculateTotal(),
        currency: room?.currency || 'USD',
        status: 'pending',
      };

      const response = await api.post<any>('/bookings', bookingData, { requireAuth: true });
      const booking = response?.data || response;

      navigate(\`/bookings/\${booking.id}/confirmation\`, {
        state: { booking, room, hotel }
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

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Room not found</p>
      </div>
    );
  }

  const nights = calculateNights();
  const total = calculateTotal();
  const currency = room.currency || '$';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Book Room</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Room Summary */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              {room.images?.[0] ? (
                <img src={room.images[0]} alt={room.name || room.room_type} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bed className="w-8 h-8 text-white/50" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold">{room.name || room.room_type}</h2>
              {hotel && (
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {hotel.name}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {room.max_occupancy && (
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" /> {room.max_occupancy} guests
                  </span>
                )}
                {room.bed_type && (
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Bed className="w-3 h-3" /> {room.bed_type}
                  </span>
                )}
              </div>
              <p className="text-white font-bold mt-2">
                {currency}{room.price_per_night}
                <span className="text-gray-400 text-sm font-normal">/night</span>
              </p>
            </div>
          </div>
        </div>

        {/* Dates & Guests */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Stay Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Check-in *</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Check-out *</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Number of Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
              >
                {Array.from({ length: room.max_occupancy || 4 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Guest Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Full Name *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email *</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Phone Number</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Special Requests</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests? (e.g., early check-in, room preferences)"
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
                <p className="text-white font-medium">Pay at Hotel</p>
                <p className="text-gray-400 text-sm">Pay when you arrive</p>
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
              <span>{currency}{room.price_per_night} x {nights} night{nights !== 1 ? 's' : ''}</span>
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
          disabled={submitting || !checkIn || !checkOut || !guestName || !guestEmail}
          className={\`w-full py-4 rounded-xl font-semibold text-lg transition-all \${
            submitting || !checkIn || !checkOut || !guestName || !guestEmail
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
