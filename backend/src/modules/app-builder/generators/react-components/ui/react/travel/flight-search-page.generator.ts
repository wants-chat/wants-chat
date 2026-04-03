import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateFlightSearchPage(
  blueprint: AppBlueprint,
  page: Page & { dataSource?: string },
): string {
  const dataSource = page?.dataSource || 'flights';
  const apiRoute = `/${dataSource}`;
  const entity = dataSource?.split('.').pop() || 'flights';

  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, Plane, Calendar, Users, ArrowRightLeft, Search, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function FlightSearchPage() {
  const navigate = useNavigate();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['${entity}Config'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}/config');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    retry: 1,
  });
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const handleSwapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      from,
      to,
      date: departDate,
      ...(tripType === 'round-trip' && returnDate ? { returnDate } : {}),
      passengers: passengers.toString(),
      class: cabinClass,
    });
    navigate(\`/flights/results?\${params.toString()}\`);
  };

  const popularDestinations = pageData?.popularDestinations || [
    { city: 'Dubai', code: 'DXB', country: 'UAE' },
    { city: 'Singapore', code: 'SIN', country: 'Singapore' },
    { city: 'Bangkok', code: 'BKK', country: 'Thailand' },
    { city: 'London', code: 'LHR', country: 'UK' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-4 pt-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/20 backdrop-blur-xl">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">Search Flights</h1>
            <p className="text-white/80">Find the best deals on flights</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4">
          {/* Trip Type */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTripType('one-way')}
              className={\`flex-1 py-2 rounded-xl text-sm font-medium transition-all \${
                tripType === 'one-way'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400'
              }\`}
            >
              One Way
            </button>
            <button
              onClick={() => setTripType('round-trip')}
              className={\`flex-1 py-2 rounded-xl text-sm font-medium transition-all \${
                tripType === 'round-trip'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400'
              }\`}
            >
              Round Trip
            </button>
          </div>

          {/* From/To */}
          <div className="relative mb-4">
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3">
                <label className="text-gray-400 text-xs">From</label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="City or Airport"
                  className="w-full bg-transparent text-white text-lg font-medium outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <label className="text-gray-400 text-xs">To</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="City or Airport"
                  className="w-full bg-transparent text-white text-lg font-medium outline-none placeholder:text-gray-500"
                />
              </div>
            </div>
            <button
              onClick={handleSwapCities}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <ArrowRightLeft className="w-5 h-5 text-white rotate-90" />
            </button>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3">
              <label className="text-gray-400 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Departure
              </label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
            {tripType === 'round-trip' && (
              <div className="bg-white/5 rounded-xl p-3">
                <label className="text-gray-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Return
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            )}
            {tripType === 'one-way' && (
              <div className="bg-white/5 rounded-xl p-3">
                <label className="text-gray-400 text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" /> Passengers
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full bg-transparent text-white outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n} className="bg-slate-800">
                      {n} {n === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {tripType === 'round-trip' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <label className="text-gray-400 text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" /> Passengers
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full bg-transparent text-white outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n} className="bg-slate-800">
                      {n} {n === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <label className="text-gray-400 text-xs">Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                >
                  <option value="economy" className="bg-slate-800">Economy</option>
                  <option value="premium_economy" className="bg-slate-800">Premium Economy</option>
                  <option value="business" className="bg-slate-800">Business</option>
                  <option value="first" className="bg-slate-800">First Class</option>
                </select>
              </div>
            </div>
          )}

          {tripType === 'one-way' && (
            <div className="mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <label className="text-gray-400 text-xs">Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                >
                  <option value="economy" className="bg-slate-800">Economy</option>
                  <option value="premium_economy" className="bg-slate-800">Premium Economy</option>
                  <option value="business" className="bg-slate-800">Business</option>
                  <option value="first" className="bg-slate-800">First Class</option>
                </select>
              </div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!from || !to || !departDate}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            Search Flights
          </button>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-white mb-3">Popular Destinations</h2>
        <div className="grid grid-cols-2 gap-3">
          {popularDestinations.map((dest) => (
            <button
              key={dest.code}
              onClick={() => setTo(dest.city)}
              className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 text-left hover:bg-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{dest.city}</p>
                  <p className="text-gray-400 text-sm">{dest.code} • {dest.country}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
