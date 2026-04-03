import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateTripDetailPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, Users, Wallet, Edit2, Trash2, Plus, Plane, Building2, Car, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Trip {
  id: string;
  name: string;
  description?: string;
  destination: string;
  destination_country?: string;
  start_date: string;
  end_date: string;
  status: string;
  trip_type?: string;
  budget?: number;
  budget_currency?: string;
  total_expenses?: number;
  travelers?: any[];
  cover_image?: string;
  notes?: string;
}

interface TripActivity {
  id: string;
  name: string;
  activity_type: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  cost?: number;
  status: string;
}

interface Booking {
  id: string;
  booking_type: string;
  provider?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  cost?: number;
  status: string;
}

const statusColors: Record<string, string> = {
  planning: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const activityTypeIcons: Record<string, any> = {
  sightseeing: MapPin,
  dining: Users,
  activity: Calendar,
  transportation: Car,
  accommodation: Building2,
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'bookings' | 'expenses'>('itinerary');

  const { data: trip, isLoading: loading } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/trips/\${id}\`, { requireAuth: true });
      return response?.data || response;
    },
    enabled: !!id && !!token,
    retry: 1,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['trip-activities', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/trip_activities?trip_id=\${id}\`, { requireAuth: true });
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id && !!token,
    retry: 1,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['trip-bookings', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/bookings?trip_id=\${id}\`, { requireAuth: true });
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id && !!token,
    retry: 1,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Trip not found</p>
      </div>
    );
  }

  const tripDays = getDaysBetween(trip.start_date, trip.end_date);

  // Group activities by date
  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, TripActivity[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header with Cover */}
      <div className="relative h-56">
        {trip.cover_image ? (
          <img src={trip.cover_image} alt={trip.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-6xl">✈️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Top buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 border border-white/20 backdrop-blur-xl p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(\`/trips/\${id}/edit\`)}
              className="bg-white/10 border border-white/20 backdrop-blur-xl p-2 rounded-full"
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Trip info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[trip.status] || 'bg-gray-500/20 text-gray-400'}\`}>
              {trip.status}
            </span>
            {trip.trip_type && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-white text-xs capitalize">
                {trip.trip_type}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{trip.name}</h1>
          <div className="flex items-center gap-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}{trip.destination_country ? \`, \${trip.destination_country}\` : ''}</span>
          </div>
        </div>
      </div>

      {/* Trip Stats */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-white font-semibold">{tripDays} Days</p>
              <p className="text-gray-400 text-xs">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <Wallet className="w-4 h-4" />
              </div>
              <p className="text-white font-semibold">
                {trip.budget_currency || '$'}{trip.total_expenses || 0}
              </p>
              <p className="text-gray-400 text-xs">of {trip.budget_currency || '$'}{trip.budget || 0}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-white font-semibold">{trip.travelers?.length || 1}</p>
              <p className="text-gray-400 text-xs">Travelers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-1">
          {(['itinerary', 'bookings', 'expenses'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all \${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-400'
              }\`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            <button
              onClick={() => navigate(\`/trips/\${id}/activities/add\`)}
              className="w-full py-3 bg-white/10 border border-white/20 border-dashed rounded-xl text-gray-400 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Activity
            </button>

            {Object.keys(activitiesByDate).length === 0 ? (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No activities planned yet</p>
              </div>
            ) : (
              Object.entries(activitiesByDate).sort().map(([date, dayActivities]) => (
                <div key={date}>
                  <h3 className="text-white font-medium mb-2">{formatDate(date)}</h3>
                  <div className="space-y-2">
                    {dayActivities.map((activity) => {
                      const Icon = activityTypeIcons[activity.activity_type] || Calendar;
                      return (
                        <div
                          key={activity.id}
                          onClick={() => navigate(\`/trips/\${id}/activities/\${activity.id}\`)}
                          className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.name}</p>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              {activity.start_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {activity.start_time}
                                </span>
                              )}
                              {activity.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {activity.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <button
              onClick={() => navigate(\`/trips/\${id}/bookings/add\`)}
              className="w-full py-3 bg-white/10 border border-white/20 border-dashed rounded-xl text-gray-400 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Booking
            </button>

            {bookings.length === 0 ? (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <Plane className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No bookings added yet</p>
              </div>
            ) : (
              bookings.map((booking) => {
                const Icon = booking.booking_type === 'flight' ? Plane :
                            booking.booking_type === 'hotel' ? Building2 : Car;
                return (
                  <div
                    key={booking.id}
                    className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium capitalize">{booking.booking_type}</p>
                        <p className="text-gray-400 text-sm">{booking.provider || booking.location}</p>
                      </div>
                      <div className="text-right">
                        {booking.cost && (
                          <p className="text-white font-semibold">\${booking.cost}</p>
                        )}
                        <span className={\`text-xs \${statusColors[booking.status] || 'text-gray-400'}\`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <button
              onClick={() => navigate(\`/trips/\${id}/expenses/add\`)}
              className="w-full py-3 bg-white/10 border border-white/20 border-dashed rounded-xl text-gray-400 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>

            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Total Expenses</span>
                <span className="text-2xl font-bold text-white">
                  {trip.budget_currency || '$'}{trip.total_expenses || 0}
                </span>
              </div>
              {trip.budget && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Budget</span>
                    <span className="text-gray-400">{trip.budget_currency || '$'}{trip.budget}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: \`\${Math.min(((trip.total_expenses || 0) / trip.budget) * 100, 100)}%\` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
