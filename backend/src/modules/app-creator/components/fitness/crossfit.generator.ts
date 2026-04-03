/**
 * CrossFit Component Generators
 */

export interface CrossfitOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateWodCalendar(options: CrossfitOptions = {}): string {
  const { componentName = 'WodCalendar', endpoint = '/crossfit/wods' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, Dumbbell, Clock, Flame, Zap } from 'lucide-react';
import { api } from '@/lib/api';

interface WOD {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string;
  time_cap?: number;
  movements: string[];
  difficulty: string;
  is_benchmark?: boolean;
  is_hero?: boolean;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: wods, isLoading } = useQuery({
    queryKey: ['wod-calendar', year, month],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?year=\${year}&month=\${month + 1}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWodForDay = (day: number): WOD | null => {
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return (wods || []).find((w: WOD) => w.date === dateStr) || null;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const selectedWod = selectedDate ? (wods || []).find((w: WOD) => w.date === selectedDate) : null;

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'AMRAP':
        return 'bg-red-500';
      case 'EMOM':
        return 'bg-blue-500';
      case 'FOR TIME':
        return 'bg-green-500';
      case 'STRENGTH':
        return 'bg-purple-500';
      case 'CHIPPER':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'rx':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'scaled':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'beginner':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[month]} {year}
        </h2>
        <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={\`blank-\${i}\`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const wod = getWodForDay(day);
            const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={\`aspect-square p-1 rounded-lg text-sm relative transition-colors flex flex-col items-center justify-center \${
                  isSelected
                    ? 'bg-red-600 text-white'
                    : isToday
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }\`}
              >
                <span>{day}</span>
                {wod && (
                  <span className={\`mt-1 w-2 h-2 rounded-full \${isSelected ? 'bg-white' : getTypeColor(wod.type)}\`} />
                )}
                {wod?.is_hero && (
                  <Zap className={\`w-3 h-3 absolute top-1 right-1 \${isSelected ? 'text-yellow-300' : 'text-yellow-500'}\`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedWod ? (
            <Link
              to={\`/crossfit/wods/\${selectedWod.id}\`}
              className="block p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={\`text-xs font-bold px-2 py-1 rounded text-white \${getTypeColor(selectedWod.type)}\`}>
                    {selectedWod.type}
                  </span>
                  {selectedWod.is_hero && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Hero WOD
                    </span>
                  )}
                  {selectedWod.is_benchmark && (
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                      Benchmark
                    </span>
                  )}
                </div>
                <span className={\`text-xs px-2 py-1 rounded \${getDifficultyColor(selectedWod.difficulty)}\`}>
                  {selectedWod.difficulty}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{selectedWod.name}</h4>
              {selectedWod.time_cap && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <Clock className="w-4 h-4" />
                  {selectedWod.time_cap} min cap
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedWod.description}</p>
              {selectedWod.movements && selectedWod.movements.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedWod.movements.map((movement: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {movement}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ) : (
            <p className="text-gray-500 text-sm">No WOD scheduled for this day</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWodToday(options: CrossfitOptions = {}): string {
  const { componentName = 'WodToday', endpoint = '/crossfit/wods/today' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Dumbbell, Clock, Flame, Zap, Trophy, ChevronDown, ChevronUp, Play, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface WOD {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string;
  time_cap?: number;
  movements: { name: string; reps?: number | string; weight?: string; notes?: string }[];
  difficulty: string;
  is_benchmark?: boolean;
  is_hero?: boolean;
  scaled_options?: { name: string; description: string }[];
  warmup?: string[];
  cooldown?: string[];
}

interface WodResult {
  time?: string;
  rounds?: number;
  reps?: number;
  weight?: string;
  notes?: string;
  difficulty: string;
}

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [showScaled, setShowScaled] = useState(false);
  const [showWarmup, setShowWarmup] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<WodResult>({
    time: '',
    rounds: undefined,
    reps: undefined,
    weight: '',
    notes: '',
    difficulty: 'Rx',
  });

  const { data: wod, isLoading } = useQuery({
    queryKey: ['wod-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  const submitResult = useMutation({
    mutationFn: (data: WodResult) => api.post(\`/crossfit/wods/\${wod?.id}/results\`, data),
    onSuccess: () => {
      toast.success('Result logged!');
      queryClient.invalidateQueries({ queryKey: ['wod-today'] });
      setShowResult(false);
    },
    onError: () => toast.error('Failed to log result'),
  });

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'AMRAP':
        return 'bg-red-500';
      case 'EMOM':
        return 'bg-blue-500';
      case 'FOR TIME':
        return 'bg-green-500';
      case 'STRENGTH':
        return 'bg-purple-500';
      case 'CHIPPER':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!wod) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No WOD posted for today yet</p>
        <Link to="/crossfit/wods" className="text-red-600 hover:text-red-700 text-sm mt-2 inline-block">
          View past WODs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={\`p-4 text-white \${getTypeColor(wod.type)}\`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded">
                {wod.type}
              </span>
              {wod.is_hero && (
                <span className="text-xs px-2 py-1 bg-yellow-400/30 rounded flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Hero WOD
                </span>
              )}
              {wod.is_benchmark && (
                <span className="text-xs px-2 py-1 bg-white/20 rounded">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  Benchmark
                </span>
              )}
            </div>
            {wod.time_cap && (
              <span className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                {wod.time_cap} min
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold">{wod.name}</h2>
          <p className="text-sm opacity-90 mt-1">
            {new Date(wod.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="p-4">
          {wod.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">{wod.description}</p>
          )}

          {wod.movements && wod.movements.length > 0 && (
            <div className="space-y-2 mb-4">
              {wod.movements.map((movement: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{movement.name}</p>
                    {movement.notes && (
                      <p className="text-xs text-gray-500">{movement.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {movement.reps && (
                      <p className="font-bold text-red-600">{movement.reps}</p>
                    )}
                    {movement.weight && (
                      <p className="text-sm text-gray-500">{movement.weight}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {wod.scaled_options && wod.scaled_options.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowScaled(!showScaled)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {showScaled ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Scaled Options
              </button>
              {showScaled && (
                <div className="mt-2 space-y-2">
                  {wod.scaled_options.map((option: any, i: number) => (
                    <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="font-medium text-blue-700 dark:text-blue-400">{option.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">{option.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {wod.warmup && wod.warmup.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowWarmup(!showWarmup)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {showWarmup ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Warm-up
              </button>
              {showWarmup && (
                <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {wod.warmup.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowResult(!showResult)}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {showResult ? <Check className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
              {showResult ? 'Cancel' : 'Log Result'}
            </button>
          </div>
        </div>
      </div>

      {showResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Log Your Result</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(wod.type === 'FOR TIME' || wod.type === 'CHIPPER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={result.time}
                    onChange={(e) => setResult({ ...result, time: e.target.value })}
                    placeholder="e.g., 12:34"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                  />
                </div>
              )}
              {wod.type === 'AMRAP' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rounds</label>
                    <input
                      type="number"
                      value={result.rounds || ''}
                      onChange={(e) => setResult({ ...result, rounds: parseInt(e.target.value) || undefined })}
                      placeholder="Rounds"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">+ Reps</label>
                    <input
                      type="number"
                      value={result.reps || ''}
                      onChange={(e) => setResult({ ...result, reps: parseInt(e.target.value) || undefined })}
                      placeholder="Extra reps"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                    />
                  </div>
                </>
              )}
              {wod.type === 'STRENGTH' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                  <input
                    type="text"
                    value={result.weight}
                    onChange={(e) => setResult({ ...result, weight: e.target.value })}
                    placeholder="e.g., 225 lbs"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                <select
                  value={result.difficulty}
                  onChange={(e) => setResult({ ...result, difficulty: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                >
                  <option value="Rx">Rx</option>
                  <option value="Scaled">Scaled</option>
                  <option value="Rx+">Rx+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={result.notes}
                onChange={(e) => setResult({ ...result, notes: e.target.value })}
                placeholder="How did it feel?"
                rows={2}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
              />
            </div>
            <button
              onClick={() => submitResult.mutate(result)}
              disabled={submitResult.isPending}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitResult.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit Result
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePublicWod(options: CrossfitOptions = {}): string {
  const { componentName = 'PublicWod', endpoint = '/crossfit/wods/public' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Dumbbell, Clock, Zap, Trophy, Calendar, Users, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface WOD {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string;
  time_cap?: number;
  movements: { name: string; reps?: string | number }[];
  difficulty: string;
  is_benchmark?: boolean;
  is_hero?: boolean;
  participants_count?: number;
  average_time?: string;
}

const ${componentName}: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['public-wods'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  const todayWod = data?.today;
  const recentWods = data?.recent || [];
  const benchmarks = data?.benchmarks || [];

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'AMRAP':
        return 'bg-red-500';
      case 'EMOM':
        return 'bg-blue-500';
      case 'FOR TIME':
        return 'bg-green-500';
      case 'STRENGTH':
        return 'bg-purple-500';
      case 'CHIPPER':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {todayWod && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className={\`p-4 text-white \${getTypeColor(todayWod.type)}\`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded">TODAY'S WOD</span>
              <div className="flex items-center gap-2">
                {todayWod.is_hero && (
                  <Zap className="w-4 h-4 text-yellow-300" />
                )}
                {todayWod.time_cap && (
                  <span className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4" />
                    {todayWod.time_cap}min
                  </span>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold">{todayWod.name}</h2>
          </div>
          <div className="p-4">
            {todayWod.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">{todayWod.description}</p>
            )}
            {todayWod.movements && todayWod.movements.length > 0 && (
              <div className="space-y-2 mb-4">
                {todayWod.movements.slice(0, 5).map((m: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{m.name}</span>
                    {m.reps && <span className="font-bold text-red-600">{m.reps}</span>}
                  </div>
                ))}
                {todayWod.movements.length > 5 && (
                  <p className="text-sm text-gray-500">+ {todayWod.movements.length - 5} more movements</p>
                )}
              </div>
            )}
            {todayWod.participants_count !== undefined && (
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {todayWod.participants_count} athletes
                </span>
                {todayWod.average_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Avg: {todayWod.average_time}
                  </span>
                )}
              </div>
            )}
            <Link
              to={\`/crossfit/wods/\${todayWod.id}\`}
              className="block w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center font-medium transition-colors"
            >
              View Full WOD
            </Link>
          </div>
        </div>
      )}

      {recentWods.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Recent WODs
            </h2>
            <Link to="/crossfit/wods" className="text-sm text-red-600 hover:text-red-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentWods.slice(0, 5).map((wod: WOD) => (
              <Link
                key={wod.id}
                to={\`/crossfit/wods/\${wod.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={\`w-2 h-10 rounded-full \${getTypeColor(wod.type)}\`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{wod.name}</h3>
                      <span className={\`text-xs px-2 py-0.5 rounded text-white \${getTypeColor(wod.type)}\`}>
                        {wod.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(wod.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {benchmarks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Benchmark WODs
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {benchmarks.map((wod: WOD) => (
              <Link
                key={wod.id}
                to={\`/crossfit/wods/\${wod.id}\`}
                className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-center"
              >
                <p className="font-bold text-gray-900 dark:text-white">{wod.name}</p>
                <span className={\`text-xs px-2 py-0.5 rounded text-white \${getTypeColor(wod.type)}\`}>
                  {wod.type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!todayWod && recentWods.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No WODs available</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCrossfitStats(options: CrossfitOptions = {}): string {
  const { componentName = 'CrossfitStats', endpoint = '/crossfit/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, Clock, Flame, TrendingUp, Trophy, Dumbbell, Target } from 'lucide-react';
import { api } from '@/lib/api';

interface CrossfitStatsData {
  total_members: number;
  active_members: number;
  wods_this_month: number;
  total_wods_completed: number;
  average_attendance: number;
  total_prs_this_month: number;
  popular_movements: { name: string; count: number }[];
  monthly_growth: number;
  leaderboard_top?: { id: string; name: string; avatar_url?: string; score: number }[];
  wod_type_distribution: { type: string; count: number }[];
  average_class_size: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['crossfit-stats'],
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

  const statItems = [
    { icon: Users, label: 'Members', value: stats?.total_members || 0, color: 'text-red-600 bg-red-100 dark:bg-red-900/30', change: stats?.monthly_growth ? \`+\${stats.monthly_growth}%\` : null },
    { icon: Calendar, label: 'WODs This Month', value: stats?.wods_this_month || 0, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { icon: Trophy, label: 'PRs This Month', value: stats?.total_prs_this_month || 0, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: Target, label: 'Avg Attendance', value: \`\${stats?.average_attendance || 0}%\`, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { icon: Dumbbell, label: 'WODs Completed', value: stats?.total_wods_completed || 0, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { icon: Users, label: 'Avg Class Size', value: stats?.average_class_size || 0, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'AMRAP':
        return 'bg-red-500';
      case 'EMOM':
        return 'bg-blue-500';
      case 'FOR TIME':
        return 'bg-green-500';
      case 'STRENGTH':
        return 'bg-purple-500';
      case 'CHIPPER':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${stat.color}\`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.change && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {stats?.wod_type_distribution && stats.wod_type_distribution.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">WOD Types</h3>
            <div className="space-y-3">
              {stats.wod_type_distribution.map((item: any) => {
                const total = stats.wod_type_distribution.reduce((sum: number, i: any) => sum + i.count, 0);
                const percentage = (item.count / total) * 100;

                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                      <span className="text-sm text-gray-500">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={\`\${getTypeColor(item.type)} h-2 rounded-full transition-all\`}
                        style={{ width: \`\${percentage}%\` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats?.popular_movements && stats.popular_movements.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Popular Movements
            </h3>
            <div className="space-y-2">
              {stats.popular_movements.slice(0, 8).map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {stats?.leaderboard_top && stats.leaderboard_top.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Athletes This Month
          </h3>
          <div className="space-y-3">
            {stats.leaderboard_top.slice(0, 5).map((athlete: any, index: number) => (
              <div key={athlete.id} className="flex items-center gap-3">
                <span className={\`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold \${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }\`}>
                  {index + 1}
                </span>
                {athlete.avatar_url ? (
                  <img src={athlete.avatar_url} alt={athlete.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Users className="w-4 h-4 text-red-600" />
                  </div>
                )}
                <span className="flex-1 font-medium text-gray-900 dark:text-white">{athlete.name}</span>
                <span className="text-sm font-bold text-red-600">{athlete.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Members</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.active_members || 0}</p>
          <p className="text-xs text-gray-500">attended this week</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-sm p-4 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Community PRs</h3>
          <p className="text-3xl font-bold">{stats?.total_prs_this_month || 0}</p>
          <p className="text-xs opacity-75">personal records this month</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
