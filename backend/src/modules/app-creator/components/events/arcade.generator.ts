/**
 * Arcade Component Generators
 */

export interface ArcadeOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateArcadeStats(options: ArcadeOptions = {}): string {
  const { componentName = 'ArcadeStats', endpoint = '/arcade/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Gamepad2, Trophy, Users, Coins, TrendingUp, Star } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['arcade-stats'],
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
    { label: 'Total Games', value: stats?.total_games || 0, icon: Gamepad2, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Active Players', value: stats?.active_players || 0, icon: Users, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'High Scores Today', value: stats?.high_scores_today || 0, icon: Trophy, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'Tokens Earned', value: stats?.tokens_earned || 0, icon: Coins, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Games Played Today', value: stats?.games_played_today || 0, icon: TrendingUp, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { label: 'Top Rated', value: stats?.top_rated || 0, icon: Star, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
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

export function generateGameListPopular(options: ArcadeOptions = {}): string {
  const { componentName = 'GameListPopular', endpoint = '/arcade/games/popular' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Gamepad2, Star, Users, Trophy, Play } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: games, isLoading } = useQuery({
    queryKey: ['popular-games'],
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
          <Trophy className="w-5 h-5 text-yellow-500" />
          Popular Games
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {games && games.length > 0 ? (
          games.map((game: any, index: number) => (
            <Link
              key={game.id}
              to={\`/games/\${game.id}\`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm">
                {index + 1}
              </div>
              {game.image_url ? (
                <img src={game.image_url} alt={game.title} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">{game.genre || game.category}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  {game.rating !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {game.rating.toFixed(1)}
                    </span>
                  )}
                  {game.players_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.players_count.toLocaleString()} players
                    </span>
                  )}
                </div>
              </div>
              <button className="p-2 bg-purple-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4" />
              </button>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No games available
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePartyCalendarArcade(options: ArcadeOptions = {}): string {
  const { componentName = 'PartyCalendarArcade', endpoint = '/arcade/parties' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, PartyPopper, Clock, Users, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: parties, isLoading } = useQuery({
    queryKey: ['arcade-parties', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: currentDate.getFullYear().toString(),
        month: (currentDate.getMonth() + 1).toString(),
      });
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getPartiesForDay = (day: number) => {
    if (!parties) return [];
    return parties.filter((party: any) => {
      const partyDate = new Date(party.date || party.start_date);
      return partyDate.getDate() === day;
    });
  };

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-pink-500" />
            Party Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={\`empty-\${i}\`} className="h-24" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayParties = getPartiesForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div
                key={day}
                className={\`h-24 border border-gray-200 dark:border-gray-700 rounded-lg p-1 overflow-hidden \${
                  isToday ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' : ''
                }\`}
              >
                <div className={\`text-xs font-medium mb-1 \${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}\`}>
                  {day}
                </div>
                {dayParties.slice(0, 2).map((party: any, idx: number) => (
                  <div
                    key={party.id || idx}
                    className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded px-1 py-0.5 mb-0.5 truncate"
                    title={party.title || party.name}
                  >
                    {party.title || party.name}
                  </div>
                ))}
                {dayParties.length > 2 && (
                  <div className="text-xs text-gray-500">+{dayParties.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {parties && parties.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Upcoming Parties</h3>
          <div className="space-y-3">
            {parties.slice(0, 3).map((party: any) => (
              <div key={party.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <PartyPopper className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{party.title || party.name}</h4>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    {(party.date || party.start_date) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(party.date || party.start_date).toLocaleDateString()}
                      </span>
                    )}
                    {party.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {party.capacity} guests
                      </span>
                    )}
                    {party.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {party.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePartyListToday(options: ArcadeOptions = {}): string {
  const { componentName = 'PartyListToday', endpoint = '/arcade/parties/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, PartyPopper, Clock, Users, MapPin, Gift, Cake } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: parties, isLoading } = useQuery({
    queryKey: ['arcade-parties-today'],
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
          <Cake className="w-5 h-5 text-pink-500" />
          Today's Parties
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {parties && parties.length > 0 ? (
          parties.map((party: any) => (
            <Link
              key={party.id}
              to={\`/parties/\${party.id}\`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={\`p-3 rounded-xl \${
                  party.type === 'birthday' ? 'bg-pink-100 dark:bg-pink-900/30' :
                  party.type === 'corporate' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }\`}>
                  {party.type === 'birthday' ? (
                    <Cake className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  ) : party.type === 'corporate' ? (
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <PartyPopper className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{party.title || party.name}</h3>
                      {party.host_name && (
                        <p className="text-sm text-gray-500">Hosted by {party.host_name}</p>
                      )}
                    </div>
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                      party.status === 'in_progress' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      party.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }\`}>
                      {party.status === 'in_progress' ? 'In Progress' : party.status === 'upcoming' ? 'Upcoming' : party.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {party.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {party.start_time} - {party.end_time || 'TBD'}
                      </span>
                    )}
                    {party.guest_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {party.guest_count} guests
                      </span>
                    )}
                    {party.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {party.room}
                      </span>
                    )}
                  </div>
                  {party.package_name && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
                      <Gift className="w-4 h-4" />
                      {party.package_name} Package
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <PartyPopper className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No parties scheduled for today
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
