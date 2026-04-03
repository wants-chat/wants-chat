import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelBookingConfirmationPage(
  resolved: ResolvedComponent,
  variant?: string,
): string {
  return `import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, Users, Clock, Plane, Bed, Mountain, Download, Home, ChevronRight, Mail, Phone, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  user_id?: string;
  booking_type: string;
  booking_reference?: string;
  confirmation_number?: string;
  provider_name?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  details?: any;
  cost?: number;
  currency?: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface BookingConfirmationPageProps {
  variant?: string;
  colorScheme?: string;
  title?: string;
  showConfirmationNumber?: boolean;
  showCalendarLink?: boolean;
  showEmailButton?: boolean;
  confirmationField?: string;
  data?: any;
  [key: string]: any;
}

export default function BookingConfirmationPage(props: BookingConfirmationPageProps) {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const stateBooking = location.state?.booking || null;

  const { data: fetchedBooking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get<any>(\`/bookings/\${bookingId}\`, { requireAuth: true });
      return response?.data || response;
    },
    enabled: !!bookingId && !stateBooking,
    retry: 1,
  });

  const booking = stateBooking || fetchedBooking;
  const loading = !stateBooking && isLoading;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-8 h-8" />;
      case 'hotel':
        return <Bed className="w-8 h-8" />;
      case 'activity':
      case 'tour':
        return <Mountain className="w-8 h-8" />;
      default:
        return <Calendar className="w-8 h-8" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Booking not found</p>
      </div>
    );
  }

  const details = booking.details || {};
  const currency = booking.currency || '$';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl px-6 py-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-300">Your booking has been successfully placed</p>
        </div>

        <div className="space-y-4">
        {/* Booking Reference */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Booking Reference</p>
          <p className="text-white text-2xl font-bold font-mono tracking-wider">
            {booking.booking_reference || booking.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-gray-500 text-xs mt-2">Please save this reference for your records</p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              {getBookingIcon(booking.booking_type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">
                  {booking.provider_name || details.tour_name || details.hotel_name || 'Booking'}
                </h2>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium capitalize \${getStatusColor(booking.status)}\`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm capitalize">{booking.booking_type} Booking</p>
              {booking.location && (
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {booking.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dates & Times */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Booking Details</h3>

          <div className="space-y-3">
            {/* Start Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">
                  {booking.booking_type === 'hotel' ? 'Check-in' : booking.booking_type === 'flight' ? 'Departure' : 'Start Date'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{formatDate(booking.start_date)}</p>
                {booking.booking_type === 'flight' && (
                  <p className="text-gray-400 text-sm">{formatTime(booking.start_date)}</p>
                )}
              </div>
            </div>

            {/* End Date */}
            {booking.end_date && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400">
                    {booking.booking_type === 'hotel' ? 'Check-out' : booking.booking_type === 'flight' ? 'Arrival' : 'End Date'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatDate(booking.end_date)}</p>
                  {booking.booking_type === 'flight' && (
                    <p className="text-gray-400 text-sm">{formatTime(booking.end_date)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Duration/Nights */}
            {details.nights && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-400">Duration</span>
                </div>
                <p className="text-white font-medium">{details.nights} night{details.nights !== 1 ? 's' : ''}</p>
              </div>
            )}

            {details.duration_days && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-400">Duration</span>
                </div>
                <p className="text-white font-medium">
                  {details.duration_days} day{details.duration_days !== 1 ? 's' : ''}
                  {details.duration_nights ? \` / \${details.duration_nights} night\${details.duration_nights !== 1 ? 's' : ''}\` : ''}
                </p>
              </div>
            )}

            {/* Guests/Passengers/Travelers */}
            {(details.guests || details.passenger_count || details.traveler_count) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">
                    {booking.booking_type === 'hotel' ? 'Guests' : booking.booking_type === 'flight' ? 'Passengers' : 'Travelers'}
                  </span>
                </div>
                <p className="text-white font-medium">{details.guests || details.passenger_count || details.traveler_count}</p>
              </div>
            )}
          </div>
        </div>

        {/* Flight Specific Details */}
        {booking.booking_type === 'flight' && details.flight_number && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Flight Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Flight Number</span>
                <span className="text-white font-medium">{details.flight_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Airline</span>
                <span className="text-white">{details.airline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Class</span>
                <span className="text-white capitalize">{details.cabin_class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Route</span>
                <span className="text-white">{details.departure_airport} → {details.arrival_airport}</span>
              </div>
            </div>
          </div>
        )}

        {/* Hotel Specific Details */}
        {booking.booking_type === 'hotel' && details.room_type && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Room Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Room Type</span>
                <span className="text-white capitalize">{details.room_name || details.room_type}</span>
              </div>
              {details.hotel_name && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Hotel</span>
                  <span className="text-white">{details.hotel_name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tour Specific Details */}
        {booking.booking_type === 'activity' && details.tour_type && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Tour Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Tour Type</span>
                <span className="text-white capitalize">{details.tour_type}</span>
              </div>
              {details.difficulty_level && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty</span>
                  <span className="text-white capitalize">{details.difficulty_level}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {(details.guest_email || details.contact_email) && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Contact Information</h3>
            <div className="space-y-2">
              {(details.guest_name || details.contact_name) && (
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{details.guest_name || details.contact_name}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-white">{details.guest_email || details.contact_email}</span>
              </div>
              {(details.guest_phone || details.contact_phone) && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{details.guest_phone || details.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Payment Summary</h3>
          <div className="space-y-2">
            {details.payment_method && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Payment Method</span>
                </div>
                <span className="text-white capitalize">{details.payment_method === 'card' ? 'Credit/Debit Card' : 'Pay Later'}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total Paid</span>
                <span>{currency}{Number(booking.cost || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {details.special_requests && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Special Requests</h3>
            <p className="text-gray-300 text-sm">{details.special_requests}</p>
          </div>
        )}

        {/* Confirmation Email Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Confirmation Email Sent</p>
              <p className="text-gray-400 text-sm">
                A confirmation email has been sent to {details.guest_email || details.contact_email || 'your email address'}.
                Please check your inbox for booking details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
`;
}
