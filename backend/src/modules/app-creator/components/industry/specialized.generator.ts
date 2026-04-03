/**
 * Specialized Industry Component Generators
 * For specific industry verticals
 */

export interface SpecializedOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Vet Search Component
 */
export function generateVetSearch(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VetSearchProps {
      onSearch?: (query: string, filters: any) => void;
    }

    const VetSearch: React.FC<VetSearchProps> = ({ onSearch }) => {
      const [query, setQuery] = React.useState('');
      const [filters, setFilters] = React.useState({
        specialty: '',
        distance: '',
        availability: '',
      });

      const handleSearch = () => {
        onSearch?.(query, filters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search veterinarians..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': '${primaryColor}' } as any}
              />
            </div>
            <div>
              <select
                value={filters.specialty}
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Specialties</option>
                <option value="general">General Practice</option>
                <option value="surgery">Surgery</option>
                <option value="dental">Dental</option>
                <option value="dermatology">Dermatology</option>
                <option value="emergency">Emergency Care</option>
              </select>
            </div>
            <div>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Any Distance</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 text-white rounded-lg font-medium hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Tour List Today Component
 */
export function generateTourListToday(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TourListTodayProps {
      tours: Array<{
        id: string;
        name: string;
        time: string;
        guide: string;
        participants: number;
        maxParticipants: number;
        meetingPoint: string;
        status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
      }>;
      onSelect?: (id: string) => void;
    }

    const TourListToday: React.FC<TourListTodayProps> = ({ tours, onSelect }) => {
      const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Today's Tours</h3>
          </div>
          <div className="divide-y">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(tour.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{tour.name}</h4>
                    <p className="text-sm text-gray-500">🕐 {tour.time}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[tour.status]}\`}>
                    {tour.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👤 {tour.guide}</span>
                  <span>👥 {tour.participants}/{tour.maxParticipants}</span>
                  <span>📍 {tour.meetingPoint}</span>
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
 * Generate Tee Time List Today Component
 */
export function generateTeeTimeListToday(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TeeTimeListTodayProps {
      teeTimes: Array<{
        id: string;
        time: string;
        golfers: string[];
        course: string;
        holes: 9 | 18;
        status: 'available' | 'booked' | 'in-progress' | 'completed';
        cartIncluded: boolean;
      }>;
      onSelect?: (id: string) => void;
      onBook?: (id: string) => void;
    }

    const TeeTimeListToday: React.FC<TeeTimeListTodayProps> = ({ teeTimes, onSelect, onBook }) => {
      const statusColors = {
        available: 'bg-green-100 text-green-800',
        booked: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-gray-100 text-gray-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Today's Tee Times</h3>
          </div>
          <div className="divide-y">
            {teeTimes.map((teeTime) => (
              <div
                key={teeTime.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(teeTime.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold" style={{ color: '${primaryColor}' }}>
                      {teeTime.time}
                    </span>
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[teeTime.status]}\`}>
                      {teeTime.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  {teeTime.status === 'available' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onBook?.(teeTime.id); }}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Book
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>⛳ {teeTime.course}</span>
                  <span>🏌️ {teeTime.holes} holes</span>
                  {teeTime.cartIncluded && <span>🚗 Cart included</span>}
                </div>
                {teeTime.golfers.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>Players:</span>
                    {teeTime.golfers.map((golfer, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 rounded">{golfer}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Ski Resort Stats Component
 */
export function generateSkiResortStats(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SkiResortStatsProps {
      stats: {
        openLifts: number;
        totalLifts: number;
        openTrails: number;
        totalTrails: number;
        snowDepth: number;
        newSnow24h: number;
        temperature: number;
        windSpeed: number;
        visibility: 'poor' | 'fair' | 'good' | 'excellent';
        conditions: string;
      };
    }

    const SkiResortStats: React.FC<SkiResortStatsProps> = ({ stats }) => {
      const visibilityColors = {
        poor: 'text-red-600',
        fair: 'text-yellow-600',
        good: 'text-green-600',
        excellent: 'text-blue-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-lg mb-4">Current Conditions</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <span className="text-3xl">🎿</span>
              <p className="text-2xl font-bold mt-1" style={{ color: '${primaryColor}' }}>
                {stats.openLifts}/{stats.totalLifts}
              </p>
              <p className="text-sm text-gray-500">Lifts Open</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <span className="text-3xl">⛷️</span>
              <p className="text-2xl font-bold mt-1" style={{ color: '${primaryColor}' }}>
                {stats.openTrails}/{stats.totalTrails}
              </p>
              <p className="text-sm text-gray-500">Trails Open</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <span className="text-3xl">❄️</span>
              <p className="text-2xl font-bold mt-1" style={{ color: '${primaryColor}' }}>
                {stats.snowDepth}"
              </p>
              <p className="text-sm text-gray-500">Base Depth</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <span className="text-3xl">🌨️</span>
              <p className="text-2xl font-bold mt-1" style={{ color: '${primaryColor}' }}>
                {stats.newSnow24h}"
              </p>
              <p className="text-sm text-gray-500">New Snow (24h)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-lg font-medium">{stats.temperature}°F</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wind</p>
              <p className="text-lg font-medium">{stats.windSpeed} mph</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Visibility</p>
              <p className={\`text-lg font-medium \${visibilityColors[stats.visibility]}\`}>
                {stats.visibility.charAt(0).toUpperCase() + stats.visibility.slice(1)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-center text-gray-600">{stats.conditions}</p>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Tournament List Upcoming Component
 */
export function generateTournamentListUpcoming(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TournamentListUpcomingProps {
      tournaments: Array<{
        id: string;
        name: string;
        game: string;
        date: string;
        time: string;
        format: string;
        prizePool: number;
        entryFee: number;
        participants: number;
        maxParticipants: number;
        status: 'registration' | 'upcoming' | 'in-progress' | 'completed';
      }>;
      onRegister?: (id: string) => void;
      onSelect?: (id: string) => void;
    }

    const TournamentListUpcoming: React.FC<TournamentListUpcomingProps> = ({ tournaments, onRegister, onSelect }) => {
      const statusColors = {
        registration: 'bg-green-100 text-green-800',
        upcoming: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-gray-100 text-gray-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Upcoming Tournaments</h3>
          </div>
          <div className="divide-y">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(tournament.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{tournament.name}</h4>
                    <p className="text-sm text-gray-500">{tournament.game} • {tournament.format}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[tournament.status]}\`}>
                    {tournament.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>📅 {tournament.date} at {tournament.time}</span>
                  <span>👥 {tournament.participants}/{tournament.maxParticipants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium" style={{ color: '${primaryColor}' }}>
                      🏆 \${tournament.prizePool.toLocaleString()}
                    </span>
                    <span className="text-gray-500">Entry: \${tournament.entryFee}</span>
                  </div>
                  {tournament.status === 'registration' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRegister?.(tournament.id); }}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Register
                    </button>
                  )}
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
 * Generate Test List Upcoming Component
 */
export function generateTestListUpcoming(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TestListUpcomingProps {
      tests: Array<{
        id: string;
        name: string;
        subject: string;
        date: string;
        time: string;
        duration: string;
        room: string;
        instructor: string;
        totalMarks: number;
        studentsEnrolled: number;
      }>;
      onSelect?: (id: string) => void;
    }

    const TestListUpcoming: React.FC<TestListUpcomingProps> = ({ tests, onSelect }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Upcoming Tests</h3>
          </div>
          <div className="divide-y">
            {tests.map((test) => (
              <div
                key={test.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(test.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-gray-500">{test.subject}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    {test.totalMarks} marks
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <span>📅 {test.date}</span>
                  <span>🕐 {test.time}</span>
                  <span>⏱️ {test.duration}</span>
                  <span>📍 {test.room}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t text-sm">
                  <span className="text-gray-500">Instructor: {test.instructor}</span>
                  <span className="text-gray-500">👥 {test.studentsEnrolled} students</span>
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
 * Generate Room Status Overview Component
 */
export function generateRoomStatusOverview(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface RoomStatusOverviewProps {
      rooms: Array<{
        id: string;
        number: string;
        type: string;
        floor: number;
        status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';
        guest?: string;
        checkOut?: string;
      }>;
      onSelect?: (id: string) => void;
    }

    const RoomStatusOverview: React.FC<RoomStatusOverviewProps> = ({ rooms, onSelect }) => {
      const statusColors = {
        available: 'bg-green-100 text-green-800 border-green-200',
        occupied: 'bg-blue-100 text-blue-800 border-blue-200',
        cleaning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        maintenance: 'bg-red-100 text-red-800 border-red-200',
        reserved: 'bg-purple-100 text-purple-800 border-purple-200',
      };

      const groupedByFloor = rooms.reduce((acc, room) => {
        if (!acc[room.floor]) acc[room.floor] = [];
        acc[room.floor].push(room);
        return acc;
      }, {} as Record<number, typeof rooms>);

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Room Status</h3>
            <div className="flex gap-2 text-xs">
              {Object.entries(statusColors).map(([status, color]) => (
                <span key={status} className={\`px-2 py-1 rounded \${color}\`}>
                  {status}
                </span>
              ))}
            </div>
          </div>

          {Object.entries(groupedByFloor).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, floorRooms]) => (
            <div key={floor} className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Floor {floor}</p>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {floorRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onSelect?.(room.id)}
                    className={\`p-2 rounded border text-center hover:opacity-80 transition-opacity \${statusColors[room.status]}\`}
                  >
                    <p className="font-medium">{room.number}</p>
                    <p className="text-xs truncate">{room.type}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Resident Profile Component
 */
export function generateResidentProfile(options: SpecializedOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ResidentProfileProps {
      resident: {
        id: string;
        name: string;
        photo?: string;
        unit: string;
        building: string;
        moveInDate: string;
        leaseEnd: string;
        status: 'active' | 'pending' | 'notice';
        email: string;
        phone: string;
        emergencyContact: { name: string; phone: string; relation: string };
        vehicles: Array<{ make: string; model: string; plate: string }>;
        pets: Array<{ type: string; name: string }>;
        balance: number;
      };
      onEdit?: () => void;
      onMessage?: () => void;
    }

    const ResidentProfile: React.FC<ResidentProfileProps> = ({ resident, onEdit, onMessage }) => {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        notice: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {resident.photo ? (
                  <img src={resident.photo} alt={resident.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                    {resident.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{resident.name}</h2>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[resident.status]}\`}>
                    {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600">Unit {resident.unit}, {resident.building}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={onMessage} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                    Message
                  </button>
                  <button onClick={onEdit} className="px-3 py-1 text-white rounded text-sm hover:opacity-90" style={{ backgroundColor: '${primaryColor}' }}>
                    Edit
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Balance</p>
                <p className={\`text-xl font-bold \${resident.balance > 0 ? 'text-red-600' : 'text-green-600'}\`}>
                  \${Math.abs(resident.balance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p>📧 {resident.email}</p>
                <p>📱 {resident.phone}</p>
              </div>

              <h3 className="font-semibold mt-4 mb-3">Emergency Contact</h3>
              <div className="space-y-1 text-sm">
                <p>{resident.emergencyContact.name} ({resident.emergencyContact.relation})</p>
                <p>📱 {resident.emergencyContact.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Lease Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Move-in:</span> {resident.moveInDate}</p>
                <p><span className="text-gray-500">Lease ends:</span> {resident.leaseEnd}</p>
              </div>

              {resident.vehicles.length > 0 && (
                <>
                  <h3 className="font-semibold mt-4 mb-3">Vehicles</h3>
                  <div className="space-y-1 text-sm">
                    {resident.vehicles.map((v, i) => (
                      <p key={i}>🚗 {v.make} {v.model} - {v.plate}</p>
                    ))}
                  </div>
                </>
              )}

              {resident.pets.length > 0 && (
                <>
                  <h3 className="font-semibold mt-4 mb-3">Pets</h3>
                  <div className="space-y-1 text-sm">
                    {resident.pets.map((p, i) => (
                      <p key={i}>🐾 {p.name} ({p.type})</p>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    };
  `;
}
