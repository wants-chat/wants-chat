/**
 * Schedule Component Generators
 * For calendars, schedules, and time-based displays
 */

export interface ScheduleComponentsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Schedule Calendar Foodtruck Component
 */
export function generateScheduleCalendarFoodtruck(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ScheduleCalendarFoodtruckProps {
      locations: Array<{
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        location: string;
        address: string;
        event?: string;
        expectedSales?: number;
      }>;
      onSelectDate?: (date: string) => void;
      onAddLocation?: () => void;
    }

    const ScheduleCalendarFoodtruck: React.FC<ScheduleCalendarFoodtruckProps> = ({ locations, onSelectDate, onAddLocation }) => {
      const groupedByDate = locations.reduce((acc, loc) => {
        if (!acc[loc.date]) acc[loc.date] = [];
        acc[loc.date].push(loc);
        return acc;
      }, {} as Record<string, typeof locations>);

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Location Schedule</h3>
            {onAddLocation && (
              <button
                onClick={onAddLocation}
                className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                + Add Location
              </button>
            )}
          </div>
          <div className="divide-y">
            {Object.entries(groupedByDate).map(([date, locs]) => (
              <div key={date} className="p-4">
                <p className="font-medium mb-3">{date}</p>
                <div className="space-y-2">
                  {locs.map((loc) => (
                    <div key={loc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl">🚚</span>
                      <div className="flex-1">
                        <p className="font-medium">{loc.location}</p>
                        <p className="text-sm text-gray-500">{loc.address}</p>
                        <p className="text-sm text-gray-500">{loc.startTime} - {loc.endTime}</p>
                        {loc.event && <p className="text-xs text-blue-600">📅 {loc.event}</p>}
                      </div>
                      {loc.expectedSales && (
                        <p className="text-sm font-medium">\${loc.expectedSales} est.</p>
                      )}
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
 * Generate Party Calendar Arcade Component
 */
export function generatePartyCalendarArcade(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface PartyCalendarArcadeProps {
      parties: Array<{
        id: string;
        date: string;
        time: string;
        partyType: string;
        guestOfHonor: string;
        guestCount: number;
        package: string;
        room: string;
        status: 'confirmed' | 'pending' | 'completed';
        depositPaid: boolean;
      }>;
      onSelect?: (id: string) => void;
    }

    const PartyCalendarArcade: React.FC<PartyCalendarArcadeProps> = ({ parties, onSelect }) => {
      const statusColors = {
        confirmed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-gray-100 text-gray-800',
      };

      const groupedByDate = parties.reduce((acc, party) => {
        if (!acc[party.date]) acc[party.date] = [];
        acc[party.date].push(party);
        return acc;
      }, {} as Record<string, typeof parties>);

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Party Calendar</h3>
          </div>
          <div className="divide-y">
            {Object.entries(groupedByDate).map(([date, dateParties]) => (
              <div key={date} className="p-4">
                <p className="font-medium text-sm text-gray-500 mb-3">{date}</p>
                <div className="space-y-3">
                  {dateParties.map((party) => (
                    <div
                      key={party.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelect?.(party.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>🎮</span>
                          <span className="font-medium">{party.guestOfHonor}'s {party.partyType}</span>
                        </div>
                        <span className={\`px-2 py-0.5 rounded text-xs font-medium \${statusColors[party.status]}\`}>
                          {party.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>🕐 {party.time}</span>
                        <span>👥 {party.guestCount} guests</span>
                        <span>🎁 {party.package}</span>
                        <span>🚪 {party.room}</span>
                      </div>
                      {!party.depositPaid && (
                        <p className="text-xs text-red-500 mt-2">⚠️ Deposit pending</p>
                      )}
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
 * Generate Party List Today Component
 */
export function generatePartyListToday(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface PartyListTodayProps {
      parties: Array<{
        id: string;
        time: string;
        guestOfHonor: string;
        age?: number;
        guestCount: number;
        package: string;
        room: string;
        status: 'upcoming' | 'in-progress' | 'completed';
        notes?: string;
      }>;
      onSelect?: (id: string) => void;
      onStart?: (id: string) => void;
    }

    const PartyListToday: React.FC<PartyListTodayProps> = ({ parties, onSelect, onStart }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Today's Parties</h3>
            <p className="text-sm text-gray-500">{parties.length} scheduled</p>
          </div>
          <div className="divide-y">
            {parties.map((party) => (
              <div
                key={party.id}
                className={\`p-4 \${party.status === 'in-progress' ? 'bg-green-50' : ''}\`}
              >
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer" onClick={() => onSelect?.(party.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🎉</span>
                      <span className="font-medium">
                        {party.guestOfHonor}{party.age ? \` turns \${party.age}!\` : "'s Party"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>🕐 {party.time}</span>
                      <span>👥 {party.guestCount}</span>
                      <span>🎁 {party.package}</span>
                      <span>🚪 {party.room}</span>
                    </div>
                    {party.notes && (
                      <p className="text-xs text-gray-400 mt-1">📝 {party.notes}</p>
                    )}
                  </div>
                  {party.status === 'upcoming' && onStart && (
                    <button
                      onClick={() => onStart(party.id)}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Start Party
                    </button>
                  )}
                  {party.status === 'in-progress' && (
                    <span className="px-3 py-1 text-sm bg-green-500 text-white rounded">In Progress</span>
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
 * Generate Tour Calendar Brewery Component
 */
export function generateTourCalendarBrewery(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TourCalendarBreweryProps {
      tours: Array<{
        id: string;
        date: string;
        time: string;
        tourType: 'standard' | 'premium' | 'private';
        guide: string;
        participants: number;
        maxCapacity: number;
        duration: string;
        includesTasting: boolean;
      }>;
      onSelect?: (id: string) => void;
      onBook?: (id: string) => void;
    }

    const TourCalendarBrewery: React.FC<TourCalendarBreweryProps> = ({ tours, onSelect, onBook }) => {
      const typeColors = {
        standard: 'bg-blue-100 text-blue-800',
        premium: 'bg-purple-100 text-purple-800',
        private: 'bg-amber-100 text-amber-800',
      };

      const groupedByDate = tours.reduce((acc, tour) => {
        if (!acc[tour.date]) acc[tour.date] = [];
        acc[tour.date].push(tour);
        return acc;
      }, {} as Record<string, typeof tours>);

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Brewery Tours</h3>
          </div>
          <div className="divide-y">
            {Object.entries(groupedByDate).map(([date, dateTours]) => (
              <div key={date} className="p-4">
                <p className="font-medium text-sm text-gray-500 mb-3">{date}</p>
                <div className="space-y-3">
                  {dateTours.map((tour) => {
                    const spotsLeft = tour.maxCapacity - tour.participants;
                    return (
                      <div
                        key={tour.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelect?.(tour.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>🍺</span>
                            <span className="font-medium">{tour.time}</span>
                            <span className={\`px-2 py-0.5 rounded text-xs font-medium \${typeColors[tour.tourType]}\`}>
                              {tour.tourType}
                            </span>
                          </div>
                          {spotsLeft > 0 && onBook && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onBook(tour.id); }}
                              className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                              style={{ backgroundColor: '${primaryColor}' }}
                            >
                              Book ({spotsLeft} left)
                            </button>
                          )}
                          {spotsLeft <= 0 && (
                            <span className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded">Full</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>👤 Guide: {tour.guide}</span>
                          <span>⏱️ {tour.duration}</span>
                          <span>👥 {tour.participants}/{tour.maxCapacity}</span>
                          {tour.includesTasting && <span>🥃 Tasting included</span>}
                        </div>
                      </div>
                    );
                  })}
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
 * Generate Room Schedule Escape Component
 */
export function generateRoomScheduleEscape(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface RoomScheduleEscapeProps {
      rooms: Array<{
        id: string;
        name: string;
        theme: string;
        difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
        duration: number;
        schedule: Array<{
          time: string;
          status: 'available' | 'booked' | 'in-progress' | 'cleaning';
          booking?: { groupName: string; size: number };
        }>;
      }>;
      onBook?: (roomId: string, time: string) => void;
    }

    const RoomScheduleEscape: React.FC<RoomScheduleEscapeProps> = ({ rooms, onBook }) => {
      const difficultyColors = {
        easy: 'text-green-600',
        medium: 'text-yellow-600',
        hard: 'text-orange-600',
        extreme: 'text-red-600',
      };

      const statusColors = {
        available: 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer',
        booked: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-purple-100 text-purple-800',
        cleaning: 'bg-gray-100 text-gray-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Room</th>
                {rooms[0]?.schedule.map((slot, i) => (
                  <th key={i} className="text-center p-2 text-sm">{slot.time}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-gray-500">{room.theme}</p>
                      <p className={\`text-xs \${difficultyColors[room.difficulty]}\`}>
                        {room.difficulty} • {room.duration}min
                      </p>
                    </div>
                  </td>
                  {room.schedule.map((slot, i) => (
                    <td key={i} className="p-2">
                      <div
                        className={\`p-2 rounded text-center text-xs \${statusColors[slot.status]}\`}
                        onClick={() => slot.status === 'available' && onBook?.(room.id, slot.time)}
                      >
                        {slot.status === 'available' && 'Open'}
                        {slot.status === 'booked' && (
                          <div>
                            <p>{slot.booking?.groupName}</p>
                            <p className="text-xs opacity-75">{slot.booking?.size}p</p>
                          </div>
                        )}
                        {slot.status === 'in-progress' && '🔓 Playing'}
                        {slot.status === 'cleaning' && '🧹'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
  `;
}

/**
 * Generate Screening Calendar Component
 */
export function generateScreeningCalendar(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ScreeningCalendarProps {
      screenings: Array<{
        id: string;
        date: string;
        time: string;
        movie: string;
        theater: string;
        format: '2D' | '3D' | 'IMAX' | '4DX';
        seatsAvailable: number;
        totalSeats: number;
        price: number;
      }>;
      onSelect?: (id: string) => void;
    }

    const ScreeningCalendar: React.FC<ScreeningCalendarProps> = ({ screenings, onSelect }) => {
      const formatColors = {
        '2D': 'bg-gray-100 text-gray-800',
        '3D': 'bg-blue-100 text-blue-800',
        'IMAX': 'bg-purple-100 text-purple-800',
        '4DX': 'bg-orange-100 text-orange-800',
      };

      const groupedByMovie = screenings.reduce((acc, s) => {
        if (!acc[s.movie]) acc[s.movie] = [];
        acc[s.movie].push(s);
        return acc;
      }, {} as Record<string, typeof screenings>);

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Screenings</h3>
          </div>
          <div className="divide-y">
            {Object.entries(groupedByMovie).map(([movie, movieScreenings]) => (
              <div key={movie} className="p-4">
                <h4 className="font-medium mb-3">🎬 {movie}</h4>
                <div className="flex flex-wrap gap-2">
                  {movieScreenings.map((screening) => {
                    const availability = (screening.seatsAvailable / screening.totalSeats) * 100;
                    return (
                      <button
                        key={screening.id}
                        onClick={() => onSelect?.(screening.id)}
                        className={\`p-2 border rounded-lg hover:border-gray-400 \${
                          screening.seatsAvailable === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }\`}
                        disabled={screening.seatsAvailable === 0}
                      >
                        <p className="font-medium text-sm">{screening.time}</p>
                        <p className="text-xs text-gray-500">{screening.theater}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={\`px-1 text-xs rounded \${formatColors[screening.format]}\`}>
                            {screening.format}
                          </span>
                          <span className={\`text-xs \${availability < 20 ? 'text-red-500' : 'text-gray-500'}\`}>
                            {screening.seatsAvailable} left
                          </span>
                        </div>
                        <p className="text-xs font-medium mt-1">\${screening.price}</p>
                      </button>
                    );
                  })}
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
 * Generate Screening List Today Component
 */
export function generateScreeningListToday(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ScreeningListTodayProps {
      screenings: Array<{
        id: string;
        time: string;
        movie: string;
        theater: string;
        format: string;
        ticketsSold: number;
        totalSeats: number;
        status: 'upcoming' | 'in-progress' | 'completed';
      }>;
      onSelect?: (id: string) => void;
    }

    const ScreeningListToday: React.FC<ScreeningListTodayProps> = ({ screenings, onSelect }) => {
      const statusColors = {
        upcoming: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Today's Screenings</h3>
          </div>
          <div className="divide-y">
            {screenings.map((screening) => {
              const occupancy = Math.round((screening.ticketsSold / screening.totalSeats) * 100);
              return (
                <div
                  key={screening.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect?.(screening.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎬</span>
                      <div>
                        <p className="font-medium">{screening.movie}</p>
                        <p className="text-sm text-gray-500">{screening.theater} • {screening.format}</p>
                      </div>
                    </div>
                    <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[screening.status]}\`}>
                      {screening.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">🕐 {screening.time}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: \`\${occupancy}%\`,
                            backgroundColor: occupancy > 80 ? '#22c55e' : '${primaryColor}'
                          }}
                        />
                      </div>
                      <span className="text-sm">{occupancy}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Session List Component
 */
export function generateSessionList(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SessionListProps {
      sessions: Array<{
        id: string;
        title: string;
        instructor?: string;
        time: string;
        duration: string;
        room?: string;
        participants: number;
        maxParticipants?: number;
        status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
      }>;
      onSelect?: (id: string) => void;
      onJoin?: (id: string) => void;
    }

    const SessionList: React.FC<SessionListProps> = ({ sessions, onSelect, onJoin }) => {
      const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Sessions</h3>
          </div>
          <div className="divide-y">
            {sessions.map((session) => {
              const spotsLeft = session.maxParticipants ? session.maxParticipants - session.participants : null;
              return (
                <div
                  key={session.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect?.(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      {session.instructor && (
                        <p className="text-sm text-gray-500">with {session.instructor}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>🕐 {session.time}</span>
                        <span>⏱️ {session.duration}</span>
                        {session.room && <span>📍 {session.room}</span>}
                        <span>👥 {session.participants}{session.maxParticipants ? \`/\${session.maxParticipants}\` : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[session.status]}\`}>
                        {session.status}
                      </span>
                      {session.status === 'scheduled' && spotsLeft && spotsLeft > 0 && onJoin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onJoin(session.id); }}
                          className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                          style={{ backgroundColor: '${primaryColor}' }}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Site Schedule Component
 */
export function generateSiteScheduleComponent(options: ScheduleComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SiteScheduleComponentProps {
      sites: Array<{
        id: string;
        name: string;
        type: string;
        schedule: Array<{
          date: string;
          status: 'available' | 'reserved' | 'maintenance';
          reservation?: { name: string; checkIn: string; checkOut: string };
        }>;
      }>;
      onSelectSite?: (id: string) => void;
      onBook?: (siteId: string, date: string) => void;
    }

    const SiteScheduleComponent: React.FC<SiteScheduleComponentProps> = ({ sites, onSelectSite, onBook }) => {
      const statusColors = {
        available: 'bg-green-100 text-green-800',
        reserved: 'bg-blue-100 text-blue-800',
        maintenance: 'bg-gray-100 text-gray-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Site Schedule</h3>
          </div>
          <div className="divide-y">
            {sites.map((site) => (
              <div key={site.id} className="p-4">
                <div
                  className="flex items-center gap-2 mb-3 cursor-pointer"
                  onClick={() => onSelectSite?.(site.id)}
                >
                  <span className="text-xl">⛺</span>
                  <div>
                    <p className="font-medium">{site.name}</p>
                    <p className="text-sm text-gray-500">{site.type}</p>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {site.schedule.slice(0, 7).map((day, i) => (
                    <div
                      key={i}
                      className={\`flex-shrink-0 p-2 rounded-lg text-center min-w-[80px] \${statusColors[day.status]} \${
                        day.status === 'available' ? 'cursor-pointer hover:opacity-80' : ''
                      }\`}
                      onClick={() => day.status === 'available' && onBook?.(site.id, day.date)}
                    >
                      <p className="text-xs font-medium">{day.date}</p>
                      <p className="text-xs capitalize">{day.status}</p>
                      {day.reservation && (
                        <p className="text-xs truncate">{day.reservation.name}</p>
                      )}
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
