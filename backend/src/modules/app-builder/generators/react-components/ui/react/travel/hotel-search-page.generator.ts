import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateHotelSearchPage(
  blueprint: AppBlueprint,
  page: Page & { dataSource?: string },
): string {
  const dataSource = page?.dataSource || 'hotels';
  const apiRoute = `/${dataSource}`;
  const entity = dataSource?.split('.').pop() || 'hotels';

  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, Building2, Calendar, Users, MapPin, Search, Star, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function HotelSearchPage() {
  const navigate = useNavigate();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['${entity}Config'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}/config');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    retry: 1,
  });
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      guests: guests.toString(),
      rooms: rooms.toString(),
    });
    navigate(\`/hotels/results?\${params.toString()}\`);
  };

  const popularCities = pageData?.popularCities || [
    { city: 'Paris', country: 'France', image: '🗼' },
    { city: 'Tokyo', country: 'Japan', image: '🗾' },
    { city: 'New York', country: 'USA', image: '🗽' },
    { city: 'Bali', country: 'Indonesia', image: '🏝️' },
  ];

  const featuredHotels = pageData?.featuredHotels || [
    { name: 'Grand Hotel', city: 'Paris', rating: 4.8, price: 250 },
    { name: 'Ocean View Resort', city: 'Bali', rating: 4.9, price: 180 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-4 pt-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/20 backdrop-blur-xl">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">Find Hotels</h1>
            <p className="text-white/80">Discover your perfect stay</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4">
          {/* Destination */}
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <label className="text-gray-400 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you going?"
              className="w-full bg-transparent text-white text-lg font-medium outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3">
              <label className="text-gray-400 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <label className="text-gray-400 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3">
              <label className="text-gray-400 text-xs flex items-center gap-1">
                <Users className="w-3 h-3" /> Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-transparent text-white outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} className="bg-slate-800">
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <label className="text-gray-400 text-xs flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Rooms
              </label>
              <select
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
                className="w-full bg-transparent text-white outline-none"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n} className="bg-slate-800">
                    {n} {n === 1 ? 'Room' : 'Rooms'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!destination || !checkIn || !checkOut}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            Search Hotels
          </button>
        </div>
      </div>

      {/* Popular Cities */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-white mb-3">Popular Cities</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {popularCities.map((city) => (
            <button
              key={city.city}
              onClick={() => setDestination(city.city)}
              className="flex-shrink-0 bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 text-center hover:bg-white/20 transition-all min-w-[100px]"
            >
              <span className="text-3xl mb-2 block">{city.image}</span>
              <p className="text-white font-medium">{city.city}</p>
              <p className="text-gray-400 text-xs">{city.country}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Hotels */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-white mb-3">Featured Hotels</h2>
        <div className="space-y-3">
          {featuredHotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{hotel.name}</h3>
                <p className="text-gray-400 text-sm">{hotel.city}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-white text-sm">{hotel.rating}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">\${hotel.price}</p>
                <p className="text-gray-400 text-xs">/night</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
