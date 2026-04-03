/**
 * Cinema Component Generators
 */

export interface CinemaOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCinemaStats(options: CinemaOptions = {}): string {
  const { componentName = 'CinemaStats', endpoint = '/cinema/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Film, Ticket, Users, DollarSign, Clock, Star } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['cinema-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    { label: 'Now Showing', value: stats?.now_showing || 0, icon: Film, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { label: 'Tickets Sold Today', value: stats?.tickets_sold_today || 0, icon: Ticket, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Total Guests Today', value: stats?.guests_today || 0, icon: Users, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Revenue Today', value: stats?.revenue_today ? \`$\${stats.revenue_today.toLocaleString()}\` : '$0', icon: DollarSign, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Screenings Today', value: stats?.screenings_today || 0, icon: Clock, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'Average Rating', value: stats?.average_rating ? stats.average_rating.toFixed(1) : 'N/A', icon: Star, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className={\`p-3 rounded-lg \${stat.color}\`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateScreeningCalendar(options: CinemaOptions = {}): string {
  const { componentName = 'ScreeningCalendar', endpoint = '/cinema/screenings' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Film, Clock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);

  const { data: screenings, isLoading } = useQuery({
    queryKey: ['screenings', selectedDate.toISOString().split('T')[0], selectedMovie],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: selectedDate.toISOString().split('T')[0],
      });
      if (selectedMovie) params.append('movie_id', selectedMovie);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getDates = () => {
    const dates = [];
    for (let i = -3; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();

  const groupedByMovie = screenings?.reduce((acc: any, screening: any) => {
    const movieId = screening.movie_id || screening.movie?.id;
    const movieTitle = screening.movie_title || screening.movie?.title || 'Unknown Movie';
    if (!acc[movieId]) {
      acc[movieId] = {
        movie: { id: movieId, title: movieTitle, poster_url: screening.movie?.poster_url || screening.poster_url },
        screenings: [],
      };
    }
    acc[movieId].screenings.push(screening);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500" />
          Screening Schedule
        </h2>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          {dates.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={\`flex flex-col items-center px-4 py-2 rounded-lg min-w-[60px] flex-shrink-0 transition-colors \${
                  isSelected
                    ? 'bg-red-600 text-white'
                    : isToday
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }\`}
              >
                <span className="text-xs uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold">{date.getDate()}</span>
                <span className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.keys(groupedByMovie).length > 0 ? (
          Object.values(groupedByMovie).map((item: any) => (
            <div key={item.movie.id} className="p-4">
              <div className="flex gap-4">
                {item.movie.poster_url ? (
                  <img
                    src={item.movie.poster_url}
                    alt={item.movie.title}
                    className="w-20 h-28 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-28 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Film className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.movie.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.screenings.map((screening: any) => (
                      <button
                        key={screening.id}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
                          <span className="font-medium text-gray-900 dark:text-white">{screening.start_time}</span>
                        </div>
                        {screening.screen && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {screening.screen}
                          </div>
                        )}
                        {screening.format && (
                          <span className="text-xs text-red-600 mt-1 block">{screening.format}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No screenings scheduled for this date
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateScreeningListToday(options: CinemaOptions = {}): string {
  const { componentName = 'ScreeningListToday', endpoint = '/cinema/screenings/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Film, Clock, MapPin, Users, Ticket } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: screenings, isLoading } = useQuery({
    queryKey: ['screenings-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          Today's Screenings
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {screenings && screenings.length > 0 ? (
          screenings.map((screening: any) => (
            <Link
              key={screening.id}
              to={\`/screenings/\${screening.id}\`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="text-center min-w-[60px]">
                <p className="text-lg font-bold text-red-600">{screening.start_time}</p>
                {screening.end_time && (
                  <p className="text-xs text-gray-500">- {screening.end_time}</p>
                )}
              </div>
              {screening.movie?.poster_url || screening.poster_url ? (
                <img
                  src={screening.movie?.poster_url || screening.poster_url}
                  alt={screening.movie?.title || screening.movie_title}
                  className="w-12 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-16 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Film className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {screening.movie?.title || screening.movie_title}
                </h3>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  {screening.screen && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {screening.screen}
                    </span>
                  )}
                  {screening.seats_available !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {screening.seats_available} seats left
                    </span>
                  )}
                  {screening.format && (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                      {screening.format}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {screening.price !== undefined && (
                  <p className="font-semibold text-gray-900 dark:text-white">\${screening.price}</p>
                )}
                <span className={\`inline-block px-2 py-1 rounded text-xs font-medium mt-1 \${
                  screening.status === 'selling' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  screening.status === 'almost_full' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  screening.status === 'sold_out' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }\`}>
                  {screening.status === 'selling' ? 'Available' : screening.status === 'almost_full' ? 'Almost Full' : screening.status === 'sold_out' ? 'Sold Out' : screening.status}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No screenings today
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateNowPlaying(options: CinemaOptions = {}): string {
  const { componentName = 'NowPlaying', endpoint = '/cinema/movies/now-playing' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Film, Star, Clock, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: movies, isLoading } = useQuery({
    queryKey: ['now-playing'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500" />
          Now Playing
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4">
        {movies && movies.length > 0 ? (
          movies.map((movie: any) => (
            <Link
              key={movie.id}
              to={\`/movies/\${movie.id}\`}
              className="group rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-[2/3]">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Film className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {movie.rating && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-white text-sm font-medium">{movie.rating.toFixed(1)}</span>
                  </div>
                )}
                {movie.genre && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <span className="text-white text-xs">{movie.genre}</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-red-600">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {movie.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {movie.duration} min
                    </span>
                  )}
                  {movie.release_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No movies currently showing
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMovieFilters(options: CinemaOptions = {}): string {
  const { componentName = 'MovieFilters' } = options;

  return `import React from 'react';
import { Search, Film, Calendar, Clock, SlidersHorizontal } from 'lucide-react';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  genre: string;
  onGenreChange: (value: string) => void;
  format: string;
  onFormatChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  showTime: string;
  onShowTimeChange: (value: string) => void;
  genres?: string[];
  formats?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  format,
  onFormatChange,
  date,
  onDateChange,
  showTime,
  onShowTimeChange,
  genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Animation', 'Romance', 'Thriller'],
  formats = ['All', '2D', '3D', 'IMAX', 'Dolby Atmos', '4DX'],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <select
            value={showTime}
            onChange={(e) => onShowTimeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="">Any Time</option>
            <option value="morning">Morning (Before 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 5PM)</option>
            <option value="evening">Evening (5PM - 9PM)</option>
            <option value="night">Night (After 9PM)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            {formats.map((f) => (
              <option key={f} value={f === 'All' ? '' : f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => onGenreChange(g === 'All' ? '' : g)}
            className={\`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors \${
              (g === 'All' && !genre) || genre === g
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }\`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
