/**
 * Extended Booking Component Generators
 *
 * Industry-specific booking and reservation components.
 */

export interface ExtendedBookingOptions {
  title?: string;
  entityType?: string;
}

// Booking Calendar for Escape Rooms
export function generateBookingCalendarEscape(options: ExtendedBookingOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface TimeSlot {
  id: string;
  roomId: string;
  roomName: string;
  time: string;
  duration: number;
  capacity: number;
  booked: number;
  price: number;
  status: 'available' | 'booked' | 'blocked';
}

export default function BookingCalendarEscape() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  const rooms = [
    { id: '1', name: 'The Mystery Mansion' },
    { id: '2', name: 'Prison Break' },
    { id: '3', name: 'Zombie Apocalypse' },
    { id: '4', name: 'Egyptian Tomb' }
  ];

  useEffect(() => {
    const generateSlots = () => {
      const generatedSlots: TimeSlot[] = [];
      rooms.forEach(room => {
        ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].forEach(time => {
          generatedSlots.push({
            id: \`\${room.id}-\${time}\`,
            roomId: room.id,
            roomName: room.name,
            time,
            duration: 60,
            capacity: 6,
            booked: Math.floor(Math.random() * 6),
            price: 35,
            status: Math.random() > 0.3 ? 'available' : 'booked'
          });
        });
      });
      setSlots(generatedSlots);
    };
    generateSlots();
  }, [selectedDate]);

  const filteredSlots = selectedRoom === 'all'
    ? slots
    : slots.filter(s => s.roomId === selectedRoom);

  const groupedByRoom = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.roomId]) {
      acc[slot.roomId] = { name: slot.roomName, slots: [] };
    }
    acc[slot.roomId].slots.push(slot);
    return acc;
  }, {} as Record<string, { name: string; slots: TimeSlot[] }>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-xl font-semibold">Booking Calendar</h2>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          />
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Rooms</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByRoom).map(([roomId, { name, slots }]) => (
          <div key={roomId} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              {name}
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={slot.status !== 'available'}
                  className={\`p-3 rounded-lg text-center transition-colors \${
                    slot.status === 'available'
                      ? 'bg-green-100 hover:bg-green-200 text-green-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }\`}
                >
                  <div className="font-medium">{slot.time}</div>
                  <div className="text-xs">\${slot.price}/person</div>
                  {slot.status === 'available' && (
                    <div className="text-xs mt-1">{slot.capacity - slot.booked} spots</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Booking Filters for Rental
export function generateBookingFiltersRental(options: ExtendedBookingOptions = {}): string {
  return `import React, { useState } from 'react';

interface RentalFilters {
  category: string;
  dateRange: { start: string; end: string };
  priceRange: { min: number; max: number };
  availability: string;
  sortBy: string;
}

interface BookingFiltersRentalProps {
  onFilter?: (filters: RentalFilters) => void;
}

export default function BookingFiltersRental({ onFilter }: BookingFiltersRentalProps) {
  const [filters, setFilters] = useState<RentalFilters>({
    category: 'all',
    dateRange: { start: '', end: '' },
    priceRange: { min: 0, max: 1000 },
    availability: 'all',
    sortBy: 'popular'
  });

  const categories = ['all', 'vehicles', 'equipment', 'tools', 'electronics', 'sports', 'party'];

  const handleChange = (key: keyof RentalFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h3 className="font-semibold">Filter Rentals</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
        <select
          value={filters.availability}
          onChange={(e) => handleChange('availability', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="all">All Items</option>
          <option value="available">Available Now</option>
          <option value="soon">Available Soon</option>
        </select>
      </div>

      <button
        onClick={() => onFilter?.(filters)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Apply Filters
      </button>
    </div>
  );
}`;
}

// Booking Filters for Travel
export function generateBookingFiltersTravel(options: ExtendedBookingOptions = {}): string {
  return `import React, { useState } from 'react';

interface TravelFilters {
  tripType: 'roundtrip' | 'oneway' | 'multi-city';
  travelers: { adults: number; children: number; infants: number };
  class: 'economy' | 'premium' | 'business' | 'first';
  directOnly: boolean;
  flexibleDates: boolean;
}

interface BookingFiltersTravelProps {
  onFilter?: (filters: TravelFilters) => void;
}

export default function BookingFiltersTravel({ onFilter }: BookingFiltersTravelProps) {
  const [filters, setFilters] = useState<TravelFilters>({
    tripType: 'roundtrip',
    travelers: { adults: 1, children: 0, infants: 0 },
    class: 'economy',
    directOnly: false,
    flexibleDates: false
  });

  const handleChange = (key: keyof TravelFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex gap-4">
        {['roundtrip', 'oneway', 'multi-city'].map(type => (
          <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value={type}
              checked={filters.tripType === type}
              onChange={() => handleChange('tripType', type)}
              className="text-blue-600"
            />
            <span className="capitalize">{type.replace('-', ' ')}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
          <select
            value={filters.travelers.adults}
            onChange={(e) => handleChange('travelers', { ...filters.travelers, adults: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
          <select
            value={filters.travelers.children}
            onChange={(e) => handleChange('travelers', { ...filters.travelers, children: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Infants</label>
          <select
            value={filters.travelers.infants}
            onChange={(e) => handleChange('travelers', { ...filters.travelers, infants: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {[0,1,2].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
        <select
          value={filters.class}
          onChange={(e) => handleChange('class', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="economy">Economy</option>
          <option value="premium">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First Class</option>
        </select>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.directOnly}
            onChange={(e) => handleChange('directOnly', e.target.checked)}
            className="rounded text-blue-600"
          />
          <span>Direct flights only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.flexibleDates}
            onChange={(e) => handleChange('flexibleDates', e.target.checked)}
            className="rounded text-blue-600"
          />
          <span>Flexible dates</span>
        </label>
      </div>
    </div>
  );
}`;
}

// Booking List Today for Escape Rooms
export function generateBookingListTodayEscape(options: ExtendedBookingOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface EscapeBooking {
  id: string;
  room: string;
  time: string;
  groupName: string;
  groupSize: number;
  contact: string;
  phone: string;
  status: 'confirmed' | 'checked-in' | 'in-progress' | 'completed';
  notes?: string;
}

export default function BookingListTodayEscape() {
  const [bookings, setBookings] = useState<EscapeBooking[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setBookings([
      { id: '1', room: 'Mystery Mansion', time: '10:00', groupName: 'Team Alpha', groupSize: 5, contact: 'John Smith', phone: '555-0101', status: 'completed' },
      { id: '2', room: 'Prison Break', time: '12:00', groupName: 'Office Gang', groupSize: 6, contact: 'Sarah Wilson', phone: '555-0102', status: 'completed' },
      { id: '3', room: 'Zombie Apocalypse', time: '14:00', groupName: 'Birthday Party', groupSize: 4, contact: 'Mike Johnson', phone: '555-0103', status: 'in-progress' },
      { id: '4', room: 'Egyptian Tomb', time: '14:00', groupName: 'Escape Masters', groupSize: 3, contact: 'Emily Davis', phone: '555-0104', status: 'checked-in' },
      { id: '5', room: 'Mystery Mansion', time: '16:00', groupName: 'First Timers', groupSize: 5, contact: 'Chris Brown', phone: '555-0105', status: 'confirmed' }
    ]);
  }, []);

  const statusColors: Record<string, string> = {
    'confirmed': 'bg-blue-100 text-blue-800',
    'checked-in': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800'
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today's Bookings</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="text-2xl font-bold text-gray-300">{booking.time}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔐</span>
                    <span className="font-semibold">{booking.room}</span>
                  </div>
                  <div className="text-gray-600">{booking.groupName}</div>
                  <div className="text-sm text-gray-500">{booking.contact} • {booking.phone}</div>
                </div>
              </div>
              <div className="text-right">
                <span className={\`inline-block px-2 py-1 rounded-full text-xs \${statusColors[booking.status]}\`}>
                  {booking.status.replace('-', ' ')}
                </span>
                <div className="text-sm text-gray-500 mt-1">{booking.groupSize} players</div>
              </div>
            </div>
            {booking.notes && (
              <div className="mt-2 text-sm bg-yellow-50 p-2 rounded">{booking.notes}</div>
            )}
            <div className="mt-3 flex gap-2">
              {booking.status === 'confirmed' && (
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Check In</button>
              )}
              {booking.status === 'checked-in' && (
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Start Game</button>
              )}
              {booking.status === 'in-progress' && (
                <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">View Timer</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Booking List for Travel
export function generateBookingListTravel(options: ExtendedBookingOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface TravelBooking {
  id: string;
  bookingRef: string;
  type: 'flight' | 'hotel' | 'package';
  destination: string;
  travelerName: string;
  travelers: number;
  departDate: string;
  returnDate?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  total: number;
}

export default function BookingListTravel() {
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setBookings([
      { id: '1', bookingRef: 'TRV-001234', type: 'flight', destination: 'New York', travelerName: 'John Smith', travelers: 2, departDate: '2024-02-15', returnDate: '2024-02-22', status: 'confirmed', total: 850 },
      { id: '2', bookingRef: 'TRV-001235', type: 'package', destination: 'Cancun', travelerName: 'Sarah Wilson', travelers: 4, departDate: '2024-03-01', returnDate: '2024-03-08', status: 'confirmed', total: 4200 },
      { id: '3', bookingRef: 'TRV-001236', type: 'hotel', destination: 'Las Vegas', travelerName: 'Mike Johnson', travelers: 2, departDate: '2024-02-20', returnDate: '2024-02-23', status: 'pending', total: 650 }
    ]);
  }, []);

  const typeIcons: Record<string, string> = {
    'flight': '✈️',
    'hotel': '🏨',
    'package': '🎫'
  };

  const statusColors: Record<string, string> = {
    'confirmed': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Travel Bookings</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="flight">Flights</option>
          <option value="hotel">Hotels</option>
          <option value="package">Packages</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{typeIcons[booking.type]}</span>
                  <span className="font-mono text-sm text-gray-500">{booking.bookingRef}</span>
                  <span className={\`px-2 py-0.5 rounded-full text-xs \${statusColors[booking.status]}\`}>
                    {booking.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mt-1">{booking.destination}</h3>
                <div className="text-gray-600">{booking.travelerName} • {booking.travelers} travelers</div>
                <div className="text-sm text-gray-500">
                  {new Date(booking.departDate).toLocaleDateString()}
                  {booking.returnDate && \` - \${new Date(booking.returnDate).toLocaleDateString()}\`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">\${booking.total.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 pt-3 border-t">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">View Details</button>
              <button className="px-3 py-1 border text-sm rounded hover:bg-gray-50">Send Itinerary</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}
