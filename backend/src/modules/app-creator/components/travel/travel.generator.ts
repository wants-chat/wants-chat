/**
 * Travel Domain Component Generators
 */

export interface TravelOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTravelSearch(options: TravelOptions = {}): string {
  const { componentName = 'TravelSearch' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Plane, Hotel } from 'lucide-react';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'flights' | 'hotels'>('flights');
  const [formData, setFormData] = useState({ from: '', to: '', checkIn: '', checkOut: '', guests: 1 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(formData as any).toString();
    navigate(\`/\${searchType}?\${params}\`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setSearchType('flights')} className={\`flex items-center gap-2 px-4 py-2 rounded-lg \${searchType === 'flights' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}\`}><Plane className="w-5 h-5" /> Flights</button>
        <button onClick={() => setSearchType('hotels')} className={\`flex items-center gap-2 px-4 py-2 rounded-lg \${searchType === 'hotels' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}\`}><Hotel className="w-5 h-5" /> Hotels</button>
      </div>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder={searchType === 'flights' ? 'From' : 'Destination'} value={formData.from} onChange={(e) => setFormData({ ...formData, from: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
        </div>
        {searchType === 'flights' && (
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="To" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
          </div>
        )}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="date" value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })} className="w-full pl-10 pr-4 py-3 border rounded-lg">
            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <button type="submit" className="md:col-span-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
          <Search className="w-5 h-5" /> Search
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDestinationGrid(options: TravelOptions = {}): string {
  const { componentName = 'DestinationGrid', endpoint = '/destinations' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Star } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: destinations, isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return Array.isArray(r) ? r : (r?.data || []); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations?.map((dest: any) => (
        <Link key={dest.id} to={\`/destinations/\${dest.id}\`} className="group">
          <div className="relative h-64 rounded-xl overflow-hidden">
            {dest.image ? <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold">{dest.name}</h3>
              <div className="flex items-center gap-2 text-sm mt-1">
                <MapPin className="w-4 h-4" /> {dest.country}
                {dest.rating && <><Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-2" /> {dest.rating}</>}
              </div>
            </div>
          </div>
        </Link>
      )) || <div className="col-span-full text-center py-12 text-gray-500">No destinations found</div>}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDestinationFilters(options: TravelOptions = {}): string {
  const { componentName = 'DestinationFilters' } = options;

  return `import React from 'react';
import { Search, Filter, DollarSign, Star } from 'lucide-react';

interface ${componentName}Props {
  onFilterChange?: (filters: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</h3>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search destinations..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option value="">All Regions</option>
            <option>Europe</option><option>Asia</option><option>Americas</option><option>Africa</option><option>Oceania</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><DollarSign className="w-4 h-4 inline" /> Budget</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option value="">Any Budget</option>
            <option>Budget</option><option>Mid-Range</option><option>Luxury</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Star className="w-4 h-4 inline" /> Rating</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option value="">Any Rating</option>
            <option>4+ Stars</option><option>3+ Stars</option>
          </select>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Apply Filters</button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDestinationHeader(options: TravelOptions = {}): string {
  const { componentName = 'DestinationHeader', endpoint = '/destinations' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Star, Thermometer, Globe } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: destination, isLoading } = useQuery({
    queryKey: ['destination', id],
    queryFn: async () => { const r = await api.get<any>('${endpoint}/' + id); return r?.data || r; },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!destination) return null;

  return (
    <div className="relative h-80 rounded-xl overflow-hidden mb-6">
      {destination.image ? <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {destination.country}</span>
          {destination.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {destination.rating}</span>}
          {destination.climate && <span className="flex items-center gap-1"><Thermometer className="w-4 h-4" /> {destination.climate}</span>}
          {destination.language && <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {destination.language}</span>}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateHotelGrid(options: TravelOptions = {}): string {
  const { componentName = 'HotelGrid', endpoint = '/hotels' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Star, Wifi, Coffee, Car } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return Array.isArray(r) ? r : (r?.data || []); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      {hotels?.map((hotel: any) => (
        <Link key={hotel.id} to={\`/hotels/\${hotel.id}\`} className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div className="w-48 h-36 flex-shrink-0">
            {hotel.image ? <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />}
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{hotel.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {hotel.location}</p>
              </div>
              {hotel.rating && <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded"><Star className="w-4 h-4" /> {hotel.rating}</div>}
            </div>
            <div className="flex gap-3 mt-2 text-gray-400">
              {hotel.wifi && <Wifi className="w-4 h-4" />}
              {hotel.breakfast && <Coffee className="w-4 h-4" />}
              {hotel.parking && <Car className="w-4 h-4" />}
            </div>
            <div className="mt-2 text-right">
              <span className="text-2xl font-bold text-blue-600">\${hotel.price || 99}</span>
              <span className="text-sm text-gray-500">/night</span>
            </div>
          </div>
        </Link>
      )) || <div className="text-center py-12 text-gray-500">No hotels found</div>}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateHotelFilters(options: TravelOptions = {}): string {
  const { componentName = 'HotelFilters' } = options;

  return `import React from 'react';
import { Filter, Star, DollarSign, Wifi, Coffee, Car, Dumbbell } from 'lucide-react';

const ${componentName}: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><DollarSign className="w-4 h-4 inline" /> Price Range</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Min" className="w-1/2 px-3 py-2 border rounded-lg" />
            <input type="number" placeholder="Max" className="w-1/2 px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Star className="w-4 h-4 inline" /> Star Rating</label>
          <div className="flex gap-2">
            {[5, 4, 3, 2, 1].map(stars => (
              <button key={stars} className="flex items-center gap-1 px-2 py-1 border rounded hover:bg-blue-50">
                {stars}<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
          <div className="space-y-2">
            {[{ icon: Wifi, label: 'WiFi' }, { icon: Coffee, label: 'Breakfast' }, { icon: Car, label: 'Parking' }, { icon: Dumbbell, label: 'Gym' }].map(({ icon: Icon, label }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" /><Icon className="w-4 h-4 text-gray-400" />{label}
              </label>
            ))}
          </div>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Apply Filters</button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateHotelDetail(options: TravelOptions = {}): string {
  const { componentName = 'HotelDetail', endpoint = '/hotels' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Star, Wifi, Coffee, Car, Dumbbell, Phone, Mail } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => { const r = await api.get<any>('${endpoint}/' + id); return r?.data || r; },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!hotel) return <div className="text-center py-12">Hotel not found</div>;

  return (
    <div className="space-y-6">
      <div className="relative h-80 rounded-xl overflow-hidden">
        {hotel.image ? <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{hotel.name}</h1>
            <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {hotel.location || hotel.address}</p>
          </div>
          {hotel.rating && <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg"><Star className="w-5 h-5" /> {hotel.rating}</div>}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{hotel.description}</p>
        <div className="flex flex-wrap gap-4 mb-6">
          {hotel.wifi && <span className="flex items-center gap-2 text-gray-500"><Wifi className="w-5 h-5" /> Free WiFi</span>}
          {hotel.breakfast && <span className="flex items-center gap-2 text-gray-500"><Coffee className="w-5 h-5" /> Breakfast</span>}
          {hotel.parking && <span className="flex items-center gap-2 text-gray-500"><Car className="w-5 h-5" /> Parking</span>}
          {hotel.gym && <span className="flex items-center gap-2 text-gray-500"><Dumbbell className="w-5 h-5" /> Gym</span>}
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-3xl font-bold text-blue-600">\${hotel.price || 99}</span>
            <span className="text-gray-500">/night</span>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateFlightSearch(options: TravelOptions = {}): string {
  const { componentName = 'FlightSearch' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, Users, ArrowLeftRight } from 'lucide-react';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [formData, setFormData] = useState({ from: '', to: '', departure: '', return: '', passengers: 1, class: 'economy' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ ...formData, tripType } as any).toString();
    navigate(\`/flights/results?\${params}\`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTripType('roundtrip')} className={\`px-4 py-2 rounded-lg \${tripType === 'roundtrip' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}\`}>Round Trip</button>
        <button onClick={() => setTripType('oneway')} className={\`px-4 py-2 rounded-lg \${tripType === 'oneway' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}\`}>One Way</button>
      </div>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-[-45deg]" />
            <input type="text" placeholder="From" value={formData.from} onChange={(e) => setFormData({ ...formData, from: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
          </div>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-[45deg]" />
            <input type="text" placeholder="To" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="date" value={formData.departure} onChange={(e) => setFormData({ ...formData, departure: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
          </div>
          {tripType === 'roundtrip' && (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="date" value={formData.return} onChange={(e) => setFormData({ ...formData, return: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" />
            </div>
          )}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })} className="w-full pl-10 pr-4 py-3 border rounded-lg">
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <select value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} className="px-4 py-3 border rounded-lg">
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Search Flights</button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRoomSelector(options: TravelOptions = {}): string {
  const { componentName = 'RoomSelector', endpoint = '/rooms' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Maximize, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  hotelId?: string;
  onSelect?: (room: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ hotelId, onSelect }) => {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms', hotelId],
    queryFn: async () => { const r = await api.get<any>('${endpoint}' + (hotelId ? '?hotel_id=' + hotelId : '')); return Array.isArray(r) ? r : (r?.data || []); },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Room</h3>
      {rooms?.map((room: any) => (
        <div key={room.id} className="flex gap-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {room.image ? <img src={room.image} alt={room.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{room.name || room.type}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.capacity || 2} guests</span>
              <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {room.size || 25} m²</span>
            </div>
            {room.amenities && <div className="flex gap-2 mt-2 text-xs text-gray-500">{room.amenities.slice(0, 3).map((a: string, i: number) => <span key={i} className="flex items-center gap-1"><Check className="w-3 h-3" />{a}</span>)}</div>}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">\${room.price || 99}</div>
            <div className="text-xs text-gray-500">per night</div>
            <button onClick={() => onSelect?.(room)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Select</button>
          </div>
        </div>
      )) || <div className="text-center py-8 text-gray-500">No rooms available</div>}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTourFilters(options: TravelOptions = {}): string {
  const { componentName = 'TourFilters' } = options;

  return `import React from 'react';
import { Filter, Clock, DollarSign, Users, MapPin } from 'lucide-react';

const ${componentName}: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Filter className="w-5 h-5" /> Filter Tours</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><MapPin className="w-4 h-4 inline" /> Destination</label>
          <select className="w-full px-3 py-2 border rounded-lg"><option value="">All Destinations</option></select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Clock className="w-4 h-4 inline" /> Duration</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option value="">Any Duration</option>
            <option>1-3 Days</option><option>4-7 Days</option><option>8-14 Days</option><option>15+ Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><DollarSign className="w-4 h-4 inline" /> Price Range</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Min" className="w-1/2 px-3 py-2 border rounded-lg" />
            <input type="number" placeholder="Max" className="w-1/2 px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Users className="w-4 h-4 inline" /> Group Size</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option value="">Any Size</option>
            <option>Small (1-10)</option><option>Medium (11-20)</option><option>Large (20+)</option>
          </select>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Apply Filters</button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTourItinerary(options: TravelOptions = {}): string {
  const { componentName = 'TourItinerary' } = options;

  return `import React from 'react';
import { MapPin, Clock, Coffee, Camera, Utensils } from 'lucide-react';

interface ${componentName}Props {
  days?: any[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ days = [] }) => {
  const getIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'meal': return <Utensils className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'break': return <Coffee className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Tour Itinerary</h3>
      <div className="space-y-6">
        {days.map((day: any, i: number) => (
          <div key={i} className="relative pl-8 pb-6 border-l-2 border-blue-200 dark:border-blue-800 last:border-0 last:pb-0">
            <div className="absolute -left-3 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Day {i + 1}: {day.title}</h4>
            {day.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{day.description}</p>}
            {day.activities && (
              <div className="space-y-2">
                {day.activities.map((activity: any, j: number) => (
                  <div key={j} className="flex items-center gap-3 text-sm">
                    <span className="text-blue-600">{getIcon(activity.type)}</span>
                    <span className="text-gray-500"><Clock className="w-3 h-3 inline mr-1" />{activity.time}</span>
                    <span className="text-gray-700 dark:text-gray-300">{activity.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {days.length === 0 && <div className="text-gray-500 text-center py-4">No itinerary available</div>}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
