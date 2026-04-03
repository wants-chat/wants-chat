import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTravelFlightDetailPage = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'minimal' | 'enhanced' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings?.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || propData?._id`;
    }
    // For array fields
    if (fieldName.match(/amenities|stop_details|baggage_allowance/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  const getApiRoutes = () => {
    if (!resolved.actions || resolved.actions.length === 0) {
      return { fetch: null };
    }
    const fetchAction = resolved.actions.find(
      action => action.type === 'fetch' && action.trigger === 'onLoad' && action.serverFunction
    );
    return {
      fetch: fetchAction?.serverFunction?.route?.replace(/^\/api\/v1\//, '') || null
    };
  };

  const apiRoutes = getApiRoutes();
  const useApiForData = !!apiRoutes.fetch;

  const commonImports = `
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plane, Clock, Luggage, Heart, Share2, Users, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';${useApiForData ? `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';` : ''}`;

  const variants = {
    standard: `
${commonImports}

interface FlightDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelFlightDetailPage: React.FC<FlightDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['flight', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });
  const flightData = apiData || propData;` : `
  const flightData = propData;`}

  // Default flight data - matches create form fields from catalog
  const defaultFlight = {
    id: '1',
    flight_number: 'AA 123',
    airline: 'American Airlines',
    airline_logo: '',
    departure_airport: 'JFK',
    departure_city: 'New York',
    departure_country: 'USA',
    arrival_airport: 'LAX',
    arrival_city: 'Los Angeles',
    arrival_country: 'USA',
    departure_time: new Date().toISOString(),
    arrival_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 300,
    stops: 0,
    aircraft: 'Boeing 737',
    cabin_class: 'economy',
    price: 299,
    currency: 'USD',
    available_seats: 45,
    is_refundable: true,
    baggage_allowance: '23kg',
  };

  let flight: any = defaultFlight;
  const sourceData = flightData;
  if (sourceData) {
    if (sourceData.id || sourceData.flight_number) {
      flight = { ...defaultFlight, ...sourceData };
    } else if (sourceData.data) {
      flight = { ...defaultFlight, ...sourceData.data };
    }
  }

  // Field mappings from catalog
  const flightNumber = ${getField('flight_number')} || flight.flight_number;
  const airline = ${getField('airline')} || flight.airline;
  const airlineLogo = ${getField('airline_logo')} || flight.airline_logo;
  const departureAirport = ${getField('departure_airport')} || flight.departure_airport;
  const departureCity = ${getField('departure_city')} || flight.departure_city;
  const departureCountry = ${getField('departure_country')} || flight.departure_country;
  const arrivalAirport = ${getField('arrival_airport')} || flight.arrival_airport;
  const arrivalCity = ${getField('arrival_city')} || flight.arrival_city;
  const arrivalCountry = ${getField('arrival_country')} || flight.arrival_country;
  const departureTime = ${getField('departure_time')} || flight.departure_time;
  const arrivalTime = ${getField('arrival_time')} || flight.arrival_time;
  const durationMinutes = ${getField('duration_minutes')} || flight.duration_minutes;
  const stops = ${getField('stops')} || flight.stops;
  const aircraft = ${getField('aircraft')} || flight.aircraft;
  const cabinClass = ${getField('cabin_class')} || flight.cabin_class;
  const price = ${getField('price')} || flight.price;
  const currency = ${getField('currency')} || flight.currency;
  const availableSeats = ${getField('available_seats')} || flight.available_seats;
  const isRefundable = ${getField('is_refundable')} || flight.is_refundable;

  // Safely get baggage allowance - handle object, string, or undefined
  const getBaggageDisplay = (baggage: any): string => {
    if (!baggage) return '';
    if (typeof baggage === 'string') return baggage;
    if (typeof baggage === 'object') {
      // Handle {info: "..."} or similar object structures
      if (baggage.info) return baggage.info;
      if (baggage.weight) return baggage.weight;
      if (baggage.allowance) return baggage.allowance;
      // Try to stringify if nothing else works
      try {
        return JSON.stringify(baggage);
      } catch {
        return '';
      }
    }
    return String(baggage);
  };
  const baggageAllowance = getBaggageDisplay(flight.baggage_allowance);

  const [isSaved, setIsSaved] = useState(false);
  const [passengers, setPassengers] = useState(1);

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return '00:00'; }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return \`\${hours}h \${mins}m\`;
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳' };
    return symbols[curr] || curr;
  };

  const getCabinClassName = (cabin: string) => {
    const names: Record<string, string> = {
      economy: 'Economy',
      premium_economy: 'Premium Economy',
      business: 'Business',
      first: 'First Class'
    };
    return names[cabin] || cabin;
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: \`\${airline} \${flightNumber}\`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleBookNow = () => {
    toast.success('Proceeding to booking...');
    navigate(\`/booking/flight/\${flight.id}\`);
  };

  ${useApiForData ? `
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <p className="text-xl mb-4">Failed to load flight</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24", className)}>
      {/* Header */}
      <div className="relative h-44 bg-gradient-to-br from-blue-600 to-cyan-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/10 backdrop-blur-xl rounded-full">
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleSave} className="bg-white/10 backdrop-blur-xl rounded-full">
              <Heart className={\`w-6 h-6 \${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} className="bg-white/10 backdrop-blur-xl rounded-full">
              <Share2 className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            {airlineLogo ? (
              <img src={airlineLogo} alt={airline} className="w-12 h-12 rounded-lg bg-white p-1" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{airline}</h1>
              <p className="text-white/80">{flightNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Route Card */}
      <div className="px-4 -mt-8">
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{formatTime(departureTime)}</p>
              <p className="text-cyan-400 font-semibold mt-1">{departureAirport}</p>
              <p className="text-gray-400 text-sm">{departureCity}{departureCountry ? \`, \${departureCountry}\` : ''}</p>
              <p className="text-gray-500 text-xs mt-1">{formatDate(departureTime)}</p>
            </div>
            <div className="flex-1 px-4">
              <div className="flex flex-col items-center">
                {durationMinutes && <span className="text-gray-400 text-sm mb-2">{formatDuration(durationMinutes)}</span>}
                <div className="flex items-center w-full">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <div className="flex-1 border-t-2 border-dashed border-white/30 mx-2 relative">
                    <Plane className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                </div>
                <span className="text-gray-400 text-xs mt-2">
                  {stops === 0 ? 'Non-stop' : \`\${stops} stop\${stops > 1 ? 's' : ''}\`}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{formatTime(arrivalTime)}</p>
              <p className="text-purple-400 font-semibold mt-1">{arrivalAirport}</p>
              <p className="text-gray-400 text-sm">{arrivalCity}{arrivalCountry ? \`, \${arrivalCountry}\` : ''}</p>
              <p className="text-gray-500 text-xs mt-1">{formatDate(arrivalTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Info */}
      <div className="px-4 mt-4 space-y-4">
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3">Flight Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {aircraft && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Aircraft</p>
                  <p className="text-white text-sm">{aircraft}</p>
                </div>
              </div>
            )}
            {baggageAllowance && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <Luggage className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Baggage</p>
                  <p className="text-white text-sm">{baggageAllowance}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Available Seats</p>
                <p className="text-white text-sm">{availableSeats || 'Limited'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                {isRefundable ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
              </div>
              <div>
                <p className="text-gray-400 text-xs">Refundable</p>
                <p className="text-white text-sm">{isRefundable ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cabin Class & Passengers */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3">Booking Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Cabin Class</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-0">{getCabinClassName(cabinClass)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Passengers</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">-</button>
                <span className="text-white w-6 text-center">{passengers}</span>
                <button onClick={() => setPassengers(Math.min(9, passengers + 1))} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-gray-400 text-sm">Total ({passengers} passenger{passengers > 1 ? 's' : ''})</p>
            <p className="text-white font-bold text-xl">
              {getCurrencySymbol(currency)}{(Number(price) * passengers).toFixed(0)}
            </p>
          </div>
          <Button onClick={handleBookNow} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelFlightDetailPage;
    `,

    minimal: `
${commonImports}

interface FlightDetailPageProps {
  ${dataName}?: any;
  className?: string;
}

const TravelFlightDetailPage: React.FC<FlightDetailPageProps> = ({ ${dataName}: propData, className }) => {
  const navigate = useNavigate();
  const flight = propData || {
    flight_number: 'AA 123', airline: 'American Airlines', departure_city: 'New York', arrival_city: 'Los Angeles', price: 299, currency: 'USD'
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ChevronLeft className="w-4 h-4 mr-2" />Back</Button>
        <h1 className="text-2xl font-bold">{flight.airline} - {flight.flight_number}</h1>
        <p className="text-gray-600 mt-2">{flight.departure_city} → {flight.arrival_city}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xl font-bold">\${flight.price}</span>
          <Button onClick={() => navigate('/booking')}>Book Now</Button>
        </div>
      </div>
    </div>
  );
};

export default TravelFlightDetailPage;
    `,

    enhanced: `
${commonImports}

interface FlightDetailPageProps {
  ${dataName}?: any;
  className?: string;
}

const TravelFlightDetailPage: React.FC<FlightDetailPageProps> = ({ ${dataName}: propData, className }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['flight', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });
  const flightData = apiData || propData;` : `const flightData = propData;`}

  const defaultFlight = {
    id: '1', flight_number: 'AA 123', airline: 'American Airlines', airline_logo: '',
    departure_airport: 'JFK', departure_city: 'New York', departure_country: 'USA',
    arrival_airport: 'LAX', arrival_city: 'Los Angeles', arrival_country: 'USA',
    departure_time: new Date().toISOString(), arrival_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 300, stops: 0, aircraft: 'Boeing 737', cabin_class: 'economy',
    price: 299, currency: 'USD', available_seats: 45, is_refundable: true,
  };

  let flight = { ...defaultFlight };
  if (flightData?.id || flightData?.flight_number) {
    flight = { ...defaultFlight, ...flightData };
  } else if (flightData?.data) {
    flight = { ...defaultFlight, ...flightData.data };
  }

  const [isSaved, setIsSaved] = useState(false);

  const formatTime = (d: string) => { try { return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch { return '00:00'; }};
  const formatDuration = (m: number) => \`\${Math.floor(m / 60)}h \${m % 60}m\`;
  const getCurrencySymbol = (c: string) => ({ USD: '$', EUR: '€', GBP: '£', BDT: '৳' }[c] || c);

  ${useApiForData ? `if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>;` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24", className)}>
      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-cyan-500">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl rounded-full">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { setIsSaved(!isSaved); toast.success(isSaved ? 'Removed' : 'Saved'); }} className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl rounded-full">
          <Heart className={\`w-6 h-6 \${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
        </Button>
        <div className="absolute bottom-4 left-4">
          <h1 className="text-2xl font-bold text-white">{flight.airline}</h1>
          <p className="text-white/80">{flight.flight_number}</p>
        </div>
      </div>

      <div className="px-4 -mt-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.departure_time)}</p>
              <p className="text-cyan-400 font-semibold">{flight.departure_airport}</p>
              <p className="text-gray-400 text-sm">{flight.departure_city}</p>
            </div>
            <div className="flex-1 px-4 text-center">
              <p className="text-gray-400 text-sm">{formatDuration(flight.duration_minutes)}</p>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <div className="flex-1 border-t border-dashed border-white/30 mx-2"></div>
                <Plane className="w-4 h-4 text-white rotate-90" />
                <div className="flex-1 border-t border-dashed border-white/30 mx-2"></div>
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              </div>
              <p className="text-gray-400 text-xs mt-1">{flight.stops === 0 ? 'Non-stop' : \`\${flight.stops} stop(s)\`}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.arrival_time)}</p>
              <p className="text-purple-400 font-semibold">{flight.arrival_airport}</p>
              <p className="text-gray-400 text-sm">{flight.arrival_city}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-gray-400 text-xs">Aircraft</p><p className="text-white">{flight.aircraft}</p></div>
            <div><p className="text-gray-400 text-xs">Class</p><p className="text-white capitalize">{flight.cabin_class}</p></div>
            <div><p className="text-gray-400 text-xs">Seats</p><p className="text-white">{flight.available_seats}</p></div>
            <div><p className="text-gray-400 text-xs">Refundable</p><p className="text-white">{flight.is_refundable ? 'Yes' : 'No'}</p></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex justify-between items-center">
          <p className="text-white font-bold text-xl">{getCurrencySymbol(flight.currency)}{flight.price}</p>
          <Button onClick={() => navigate('/booking')} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">Book</Button>
        </div>
      </div>
    </div>
  );
};

export default TravelFlightDetailPage;
    `
  };

  return variants[variant] || variants.standard;
};
