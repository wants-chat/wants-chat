import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelBookingHistoryPage(
  resolved: ResolvedComponent,
  variant?: string,
): string {
  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Plane, Bed, Mountain, ChevronRight, Search, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Booking {
  id: string;
  user_id?: string;
  booking_type: string;
  booking_reference?: string;
  provider_name?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  details?: any;
  cost?: number;
  currency?: string;
  status: string;
  created_at: string;
}

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [filter, setFilter] = useState<'all' | 'flight' | 'hotel' | 'activity'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const { data: bookings = [], isLoading: loading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get<any>('/bookings', { requireAuth: true });
      const data = response?.data || response;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!token,
    retry: 1,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'hotel':
        return <Bed className="w-5 h-5" />;
      case 'activity':
      case 'tour':
        return <Mountain className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getBookingGradient = (type: string) => {
    switch (type) {
      case 'flight':
        return 'from-blue-500 to-cyan-500';
      case 'hotel':
        return 'from-purple-500 to-pink-500';
      case 'activity':
      case 'tour':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-slate-500';
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

  const filteredBookings = bookings.filter(booking => {
    const typeMatch = filter === 'all' || booking.booking_type === filter;
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    return typeMatch && statusMatch;
  });

  // Group bookings by status
  const upcomingBookings = filteredBookings.filter(b =>
    new Date(b.start_date) >= new Date() && b.status !== 'cancelled'
  );
  const pastBookings = filteredBookings.filter(b =>
    new Date(b.start_date) < new Date() || b.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">My Bookings</h1>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'all', label: 'All' },
            { value: 'flight', label: 'Flights' },
            { value: 'hotel', label: 'Hotels' },
            { value: 'activity', label: 'Tours' },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={\`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all \${
                filter === item.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value as any)}
              className={\`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all \${
                statusFilter === item.value
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-500'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No Bookings Found</p>
            <p className="text-gray-400 text-sm">
              {filter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start exploring and make your first booking!'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium"
            >
              Explore Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-white font-semibold mb-3">Upcoming ({upcomingBookings.length})</h2>
                <div className="space-y-3">
                  {upcomingBookings.map(booking => (
                    <div
                      key={booking.id}
                      onClick={() => navigate(\`/bookings/\${booking.id}/confirmation\`)}
                      className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      <div className="flex items-start gap-3">
                        <div className={\`w-12 h-12 bg-gradient-to-br \${getBookingGradient(booking.booking_type)} rounded-xl flex items-center justify-center text-white\`}>
                          {getBookingIcon(booking.booking_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-white font-semibold truncate">
                              {booking.provider_name || booking.details?.tour_name || booking.details?.hotel_name || 'Booking'}
                            </h3>
                            <span className={\`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 \${getStatusColor(booking.status)}\`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm capitalize">{booking.booking_type}</p>
                          <div className="flex items-center gap-3 mt-2 text-gray-400 text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(booking.start_date)}
                            </span>
                            {booking.location && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3" />
                                {booking.location}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-white font-semibold">
                              {booking.currency || '$'}{Number(booking.cost || 0).toFixed(2)}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Ref: {booking.booking_reference || booking.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-white font-semibold mb-3">Past Bookings ({pastBookings.length})</h2>
                <div className="space-y-3">
                  {pastBookings.map(booking => (
                    <div
                      key={booking.id}
                      onClick={() => navigate(\`/bookings/\${booking.id}/confirmation\`)}
                      className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={\`w-10 h-10 bg-gradient-to-br \${getBookingGradient(booking.booking_type)} opacity-50 rounded-lg flex items-center justify-center text-white\`}>
                          {getBookingIcon(booking.booking_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-gray-300 font-medium truncate">
                              {booking.provider_name || booking.details?.tour_name || booking.details?.hotel_name || 'Booking'}
                            </h3>
                            <span className={\`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 \${getStatusColor(booking.status)}\`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(booking.start_date)}
                            </span>
                            <span>
                              {booking.currency || '$'}{Number(booking.cost || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
