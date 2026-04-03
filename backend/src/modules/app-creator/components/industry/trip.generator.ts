/**
 * Trip & Travel Component Generators
 * For trip planning, logistics, and travel management
 */

export interface TripOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Trip Filters Component
 */
export function generateTripFilters(options: TripOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TripFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const TripFilters: React.FC<TripFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        destination: '',
        dateRange: '',
        tripType: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search trips..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                placeholder="Enter destination"
                value={filters.destination}
                onChange={(e) => handleChange('destination', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="past">Past Trips</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
              <select
                value={filters.tripType}
                onChange={(e) => handleChange('tripType', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="business">Business</option>
                <option value="leisure">Leisure</option>
                <option value="delivery">Delivery</option>
                <option value="service">Service Call</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Trip Itinerary Component
 */
export function generateTripItinerary(options: TripOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TripItineraryProps {
      trip: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        days: Array<{
          date: string;
          dayNumber: number;
          activities: Array<{
            id: string;
            time: string;
            title: string;
            description: string;
            location: string;
            type: 'transport' | 'accommodation' | 'activity' | 'meal' | 'meeting';
            duration?: string;
            notes?: string;
          }>;
        }>;
      };
      onActivityClick?: (activityId: string) => void;
    }

    const TripItinerary: React.FC<TripItineraryProps> = ({ trip, onActivityClick }) => {
      const getIcon = (type: string) => {
        switch (type) {
          case 'transport': return '✈️';
          case 'accommodation': return '🏨';
          case 'activity': return '🎯';
          case 'meal': return '🍽️';
          case 'meeting': return '📋';
          default: return '📍';
        }
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">{trip.name}</h2>
            <p className="text-sm text-gray-500">
              {trip.startDate} - {trip.endDate}
            </p>
          </div>

          <div className="divide-y">
            {trip.days.map((day) => (
              <div key={day.date} className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: '${primaryColor}' }}
                  >
                    {day.dayNumber}
                  </div>
                  <div>
                    <p className="font-semibold">Day {day.dayNumber}</p>
                    <p className="text-sm text-gray-500">{day.date}</p>
                  </div>
                </div>

                <div className="ml-5 border-l-2 border-gray-200 pl-5 space-y-4">
                  {day.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative cursor-pointer hover:bg-gray-50 p-3 rounded-lg -ml-3"
                      onClick={() => onActivityClick?.(activity.id)}
                    >
                      <div className="absolute -left-8 top-4 w-4 h-4 bg-white border-2 rounded-full"
                        style={{ borderColor: '${primaryColor}' }}
                      />
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getIcon(activity.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.title}</p>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>📍 {activity.location}</span>
                            {activity.duration && <span>⏱️ {activity.duration}</span>}
                          </div>
                          {activity.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">{activity.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Trip Card Component
 */
export function generateTripCard(options: TripOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TripCardProps {
      trip: {
        id: string;
        name: string;
        destination: string;
        startDate: string;
        endDate: string;
        status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
        imageUrl?: string;
        travelers: number;
        budget?: number;
        spent?: number;
      };
      onSelect?: (id: string) => void;
    }

    const TripCard: React.FC<TripCardProps> = ({ trip, onSelect }) => {
      const statusColors = {
        'planned': 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
      };

      return (
        <div
          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect?.(trip.id)}
        >
          <div className="h-40 bg-gray-200 relative">
            {trip.imageUrl ? (
              <img src={trip.imageUrl} alt={trip.destination} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-5xl">🗺️</span>
              </div>
            )}
            <span className={\`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium \${statusColors[trip.status]}\`}>
              {trip.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">{trip.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <span>📍</span> {trip.destination}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span>📅 {trip.startDate} - {trip.endDate}</span>
              <span>👥 {trip.travelers}</span>
            </div>
            {trip.budget && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium">\${trip.budget.toLocaleString()}</span>
                </div>
                {trip.spent !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Spent: \${trip.spent.toLocaleString()}</span>
                      <span>{Math.round((trip.spent / trip.budget) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: \`\${Math.min((trip.spent / trip.budget) * 100, 100)}%\`,
                          backgroundColor: (trip.spent / trip.budget) > 0.9 ? '#EF4444' : '${primaryColor}'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Tracking Info Component
 */
export function generateTrackingInfo(options: TripOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TrackingInfoProps {
      tracking: {
        trackingNumber: string;
        carrier: string;
        status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'exception';
        estimatedDelivery: string;
        origin: string;
        destination: string;
        events: Array<{
          timestamp: string;
          location: string;
          status: string;
          description: string;
        }>;
      };
    }

    const TrackingInfo: React.FC<TrackingInfoProps> = ({ tracking }) => {
      const statusColors = {
        'pending': 'text-gray-500',
        'picked-up': 'text-blue-500',
        'in-transit': 'text-yellow-500',
        'out-for-delivery': 'text-orange-500',
        'delivered': 'text-green-500',
        'exception': 'text-red-500',
      };

      const getProgressWidth = () => {
        const statusProgress = {
          'pending': 0,
          'picked-up': 25,
          'in-transit': 50,
          'out-for-delivery': 75,
          'delivered': 100,
          'exception': 50,
        };
        return statusProgress[tracking.status] || 0;
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="font-mono font-semibold">{tracking.trackingNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Carrier</p>
              <p className="font-semibold">{tracking.carrier}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{tracking.origin}</span>
              <span>{tracking.destination}</span>
            </div>
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: \`\${getProgressWidth()}%\`, backgroundColor: '${primaryColor}' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {['Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'].map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={\`w-3 h-3 rounded-full \${getProgressWidth() >= (index + 1) * 25 ? '' : 'bg-gray-300'}\`}
                      style={{ backgroundColor: getProgressWidth() >= (index + 1) * 25 ? '${primaryColor}' : undefined }}
                    />
                    <span className="text-xs text-gray-500 mt-1 hidden md:block">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={\`text-center py-3 rounded-lg mb-6 \${statusColors[tracking.status].replace('text-', 'bg-').replace('500', '100')}\`}>
            <p className={\`font-semibold \${statusColors[tracking.status]}\`}>
              {tracking.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Estimated Delivery: {tracking.estimatedDelivery}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Tracking History</h3>
            <div className="space-y-3">
              {tracking.events.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: index === 0 ? '${primaryColor}' : '#D1D5DB' }}
                    />
                    {index < tracking.events.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="font-medium text-sm">{event.status}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.location} • {event.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Upcoming Moves Component
 */
export function generateUpcomingMoves(options: TripOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface UpcomingMovesProps {
      moves: Array<{
        id: string;
        customer: string;
        fromAddress: string;
        toAddress: string;
        date: string;
        time: string;
        crew: number;
        truck: string;
        status: 'scheduled' | 'confirmed' | 'in-progress';
      }>;
      onSelect?: (id: string) => void;
    }

    const UpcomingMoves: React.FC<UpcomingMovesProps> = ({ moves, onSelect }) => {
      const statusColors = {
        'scheduled': 'bg-blue-100 text-blue-800',
        'confirmed': 'bg-green-100 text-green-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Upcoming Moves</h2>
          </div>
          <div className="divide-y">
            {moves.map((move) => (
              <div
                key={move.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(move.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{move.customer}</p>
                    <p className="text-sm text-gray-500">{move.date} at {move.time}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[move.status]}\`}>
                    {move.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>📍</span>
                  <span className="flex-1 truncate">{move.fromAddress}</span>
                  <span>→</span>
                  <span className="flex-1 truncate">{move.toAddress}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👥 {move.crew} crew</span>
                  <span>🚚 {move.truck}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Upcoming Departures Component
 */
export function generateUpcomingDepartures(options: TripOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface UpcomingDeparturesProps {
      departures: Array<{
        id: string;
        flightNumber?: string;
        route: string;
        departureTime: string;
        gate?: string;
        status: 'on-time' | 'delayed' | 'boarding' | 'departed' | 'cancelled';
        aircraft?: string;
      }>;
      onSelect?: (id: string) => void;
    }

    const UpcomingDepartures: React.FC<UpcomingDeparturesProps> = ({ departures, onSelect }) => {
      const statusColors = {
        'on-time': 'bg-green-100 text-green-800',
        'delayed': 'bg-red-100 text-red-800',
        'boarding': 'bg-blue-100 text-blue-800',
        'departed': 'bg-gray-100 text-gray-800',
        'cancelled': 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Upcoming Departures</h2>
          </div>
          <div className="divide-y">
            {departures.map((departure) => (
              <div
                key={departure.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(departure.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✈️</span>
                    <div>
                      {departure.flightNumber && (
                        <p className="font-medium">{departure.flightNumber}</p>
                      )}
                      <p className="text-sm text-gray-600">{departure.route}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[departure.status]}\`}>
                    {departure.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 ml-10">
                  <span>🕐 {departure.departureTime}</span>
                  {departure.gate && <span>🚪 Gate {departure.gate}</span>}
                  {departure.aircraft && <span>🛩️ {departure.aircraft}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}
