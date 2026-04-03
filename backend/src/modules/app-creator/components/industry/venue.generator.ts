/**
 * Venue Component Generators
 * For venue management, events, and booking systems
 */

export interface VenueOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Venue Stats Component
 */
export function generateVenueStats(options: VenueOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    const VenueStats: React.FC = () => {
      const stats = [
        { label: 'Total Venues', value: '12', icon: '🏛️', change: '+2 this month' },
        { label: 'Active Bookings', value: '48', icon: '📅', change: '+15%' },
        { label: 'Revenue (MTD)', value: '$24,500', icon: '💰', change: '+8%' },
        { label: 'Occupancy Rate', value: '78%', icon: '📊', change: '+5%' },
      ];

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Venue Card Component
 */
export function generateVenueCard(options: VenueOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VenueCardProps {
      venue: {
        id: string;
        name: string;
        type: string;
        capacity: number;
        location: string;
        pricePerHour: number;
        rating: number;
        imageUrl?: string;
        amenities: string[];
        availability: 'available' | 'booked' | 'maintenance';
      };
      onSelect?: (id: string) => void;
    }

    const VenueCard: React.FC<VenueCardProps> = ({ venue, onSelect }) => {
      const availabilityColors = {
        available: 'bg-green-100 text-green-800',
        booked: 'bg-red-100 text-red-800',
        maintenance: 'bg-yellow-100 text-yellow-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-48 bg-gray-200 relative">
            {venue.imageUrl ? (
              <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-6xl">🏛️</span>
              </div>
            )}
            <span className={\`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium \${availabilityColors[venue.availability]}\`}>
              {venue.availability.charAt(0).toUpperCase() + venue.availability.slice(1)}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{venue.name}</h3>
                <p className="text-sm text-gray-500">{venue.type}</p>
              </div>
              <div className="flex items-center text-yellow-500">
                <span>★</span>
                <span className="ml-1 text-sm text-gray-700">{venue.rating}</span>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span>📍</span>
              <span className="ml-1">{venue.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span>👥</span>
              <span className="ml-1">Capacity: {venue.capacity}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {venue.amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {amenity}
                </span>
              ))}
              {venue.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{venue.amenities.length - 3} more
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                <span className="text-lg font-bold" style={{ color: '${primaryColor}' }}>
                  \${venue.pricePerHour}
                </span>
                <span className="text-sm text-gray-500">/hour</span>
              </div>
              <button
                onClick={() => onSelect?.(venue.id)}
                className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Venue Filters Component
 */
export function generateVenueFilters(options: VenueOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VenueFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const VenueFilters: React.FC<VenueFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        type: '',
        capacity: '',
        priceRange: '',
        availability: '',
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
                placeholder="Search venues..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': '${primaryColor}' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              >
                <option value="">All Types</option>
                <option value="conference">Conference Room</option>
                <option value="ballroom">Ballroom</option>
                <option value="outdoor">Outdoor Space</option>
                <option value="theater">Theater</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <select
                value={filters.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              >
                <option value="">Any Capacity</option>
                <option value="0-50">Up to 50</option>
                <option value="50-100">50 - 100</option>
                <option value="100-200">100 - 200</option>
                <option value="200+">200+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              >
                <option value="">Any Price</option>
                <option value="0-100">Under $100/hr</option>
                <option value="100-250">$100 - $250/hr</option>
                <option value="250-500">$250 - $500/hr</option>
                <option value="500+">$500+/hr</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Venue Detail Component
 */
export function generateVenueDetail(options: VenueOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VenueDetailProps {
      venue: {
        id: string;
        name: string;
        type: string;
        description: string;
        capacity: number;
        location: string;
        address: string;
        pricePerHour: number;
        rating: number;
        reviewCount: number;
        images: string[];
        amenities: string[];
        rules: string[];
        availability: { date: string; slots: string[] }[];
      };
      onBook?: (venueId: string, date: string, slot: string) => void;
    }

    const VenueDetail: React.FC<VenueDetailProps> = ({ venue, onBook }) => {
      const [selectedDate, setSelectedDate] = React.useState('');
      const [selectedSlot, setSelectedSlot] = React.useState('');

      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-64 bg-gray-200 relative">
            {venue.images[0] ? (
              <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-8xl">🏛️</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{venue.name}</h1>
                <p className="text-gray-500">{venue.type}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-500">
                  <span>★</span>
                  <span className="ml-1 text-gray-700 font-medium">{venue.rating}</span>
                  <span className="ml-1 text-gray-500 text-sm">({venue.reviewCount} reviews)</span>
                </div>
                <p className="text-2xl font-bold mt-1" style={{ color: '${primaryColor}' }}>
                  \${venue.pricePerHour}<span className="text-sm text-gray-500">/hour</span>
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <span>📍</span>
              <span className="ml-2">{venue.address}</span>
            </div>

            <p className="text-gray-600 mb-6">{venue.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Venue Rules</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {venue.rules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Book This Venue</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Time Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Choose a slot</option>
                    <option value="09:00-12:00">9:00 AM - 12:00 PM</option>
                    <option value="12:00-15:00">12:00 PM - 3:00 PM</option>
                    <option value="15:00-18:00">3:00 PM - 6:00 PM</option>
                    <option value="18:00-21:00">6:00 PM - 9:00 PM</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => onBook?.(venue.id, selectedDate, selectedSlot)}
                    disabled={!selectedDate || !selectedSlot}
                    className="w-full px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '${primaryColor}' }}
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Venue Booking Form Component
 */
export function generateVenueBookingForm(options: VenueOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VenueBookingFormProps {
      venueName: string;
      pricePerHour: number;
      onSubmit?: (data: any) => void;
    }

    const VenueBookingForm: React.FC<VenueBookingFormProps> = ({ venueName, pricePerHour, onSubmit }) => {
      const [formData, setFormData] = React.useState({
        eventName: '',
        eventType: '',
        date: '',
        startTime: '',
        endTime: '',
        guests: '',
        name: '',
        email: '',
        phone: '',
        notes: '',
      });

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
      };

      const calculateTotal = () => {
        if (!formData.startTime || !formData.endTime) return 0;
        const start = parseInt(formData.startTime.split(':')[0]);
        const end = parseInt(formData.endTime.split(':')[0]);
        return (end - start) * pricePerHour;
      };

      return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Book {venueName}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select type</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate Event</option>
                <option value="birthday">Birthday Party</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
              <input
                type="number"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <h3 className="font-semibold mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Estimated Total</p>
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>
                \${calculateTotal()}
              </p>
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90"
              style={{ backgroundColor: '${primaryColor}' }}
            >
              Submit Booking Request
            </button>
          </div>
        </form>
      );
    };
  `;
}
