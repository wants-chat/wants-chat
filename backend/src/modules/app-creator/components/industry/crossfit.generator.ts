/**
 * CrossFit/Gym Component Generators
 *
 * Components for CrossFit gyms, workout tracking, and leaderboards.
 */

export interface CrossfitOptions {
  componentName?: string;
  title?: string;
  endpoint?: string;
}

// WOD Calendar Component
export function generateWodCalendar(options: CrossfitOptions = {}): string {
  return `import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Flame, Clock, Users } from 'lucide-react';

interface WOD {
  id: string;
  date: string;
  name: string;
  type: 'AMRAP' | 'For Time' | 'EMOM' | 'Chipper' | 'Rest';
  duration?: number;
  movements: string[];
}

export default function WodCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWod, setSelectedWod] = useState<WOD | null>(null);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getWodForDate = (day: number): WOD | null => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (date.getDay() === 0) return { id: \`\${day}\`, date: date.toISOString(), name: 'Rest Day', type: 'Rest', movements: [] };

    const wods: WOD[] = [
      { id: '1', date: '', name: 'Fran', type: 'For Time', movements: ['21-15-9', 'Thrusters (95/65)', 'Pull-ups'] },
      { id: '2', date: '', name: 'Murph', type: 'For Time', duration: 60, movements: ['1 Mile Run', '100 Pull-ups', '200 Push-ups', '300 Squats', '1 Mile Run'] },
      { id: '3', date: '', name: 'Cindy', type: 'AMRAP', duration: 20, movements: ['5 Pull-ups', '10 Push-ups', '15 Air Squats'] }
    ];
    return wods[day % 3];
  };

  const typeColors: Record<string, string> = {
    'AMRAP': 'bg-blue-500',
    'For Time': 'bg-red-500',
    'EMOM': 'bg-green-500',
    'Chipper': 'bg-purple-500',
    'Rest': 'bg-gray-300'
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            WOD Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium min-w-[150px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={\`empty-\${i}\`} className="min-h-[80px]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const wod = getWodForDate(i + 1);
            const isToday = new Date().getDate() === i + 1 &&
              new Date().getMonth() === currentMonth.getMonth() &&
              new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div
                key={i + 1}
                onClick={() => wod && setSelectedWod(wod)}
                className={\`min-h-[80px] p-1 border border-gray-100 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 \${isToday ? 'ring-2 ring-orange-500' : ''}\`}
              >
                <div className={\`text-sm font-medium mb-1 \${isToday ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'}\`}>
                  {i + 1}
                </div>
                {wod && wod.type !== 'Rest' && (
                  <div className="space-y-1">
                    <div className={\`text-xs px-1 py-0.5 rounded text-white \${typeColors[wod.type]}\`}>
                      {wod.type}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                      {wod.name}
                    </div>
                  </div>
                )}
                {wod?.type === 'Rest' && (
                  <div className="text-xs text-gray-400 italic">Rest</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedWod && selectedWod.type !== 'Rest' && (
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedWod.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-300">
                <span className={\`px-2 py-0.5 rounded text-white \${typeColors[selectedWod.type]}\`}>
                  {selectedWod.type}
                </span>
                {selectedWod.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedWod.duration} min
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setSelectedWod(null)} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Movements:</h4>
            <ul className="space-y-1">
              {selectedWod.movements.map((movement, idx) => (
                <li key={idx} className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  {movement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}`;
}

// WOD Today Component
export function generateWodToday(options: CrossfitOptions = {}): string {
  return `import React from 'react';
import { Flame, Clock, Dumbbell, Users, TrendingUp } from 'lucide-react';

export default function WodToday() {
  const wod = {
    name: 'Helen',
    type: 'For Time',
    rounds: 3,
    movements: [
      { name: '400m Run', reps: '1' },
      { name: 'Kettlebell Swings', reps: '21', weight: '53/35 lb' },
      { name: 'Pull-ups', reps: '12' }
    ],
    timeCap: 15,
    scalingOptions: {
      rx: 'As written',
      scaled: 'Ring rows instead of pull-ups, 35/26 lb KB',
      beginner: 'Ring rows, 26/18 lb KB, 200m run'
    },
    coachNotes: 'Focus on maintaining a steady pace. The run should feel moderate, not a sprint.'
  };

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg text-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8" />
            <div>
              <div className="text-orange-200 text-sm">Today's WOD</div>
              <h2 className="text-3xl font-bold">{wod.name}</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-lg font-bold">{wod.type}</span>
            </div>
            <div className="text-sm text-orange-200 mt-1 flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4" />
              {wod.timeCap} min cap
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            {wod.rounds} Rounds For Time:
          </h3>
          <ul className="space-y-2">
            {wod.movements.map((movement, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-medium">{movement.reps} {movement.name}</span>
                  {movement.weight && <span className="text-orange-200 ml-2">({movement.weight})</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Scaling Options:
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded p-2">
              <div className="text-xs text-orange-200 mb-1">Rx</div>
              <div className="text-sm">{wod.scalingOptions.rx}</div>
            </div>
            <div className="bg-white/10 rounded p-2">
              <div className="text-xs text-orange-200 mb-1">Scaled</div>
              <div className="text-sm">{wod.scalingOptions.scaled}</div>
            </div>
            <div className="bg-white/10 rounded p-2">
              <div className="text-xs text-orange-200 mb-1">Beginner</div>
              <div className="text-sm">{wod.scalingOptions.beginner}</div>
            </div>
          </div>
        </div>

        {wod.coachNotes && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border-l-4 border-yellow-400">
            <div className="text-yellow-200 text-sm font-semibold mb-1">Coach Notes:</div>
            <p className="text-sm">{wod.coachNotes}</p>
          </div>
        )}

        <button className="mt-4 w-full py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors">
          Log Your Score
        </button>
      </div>
    </div>
  );
}`;
}

// Public WOD Component
export function generatePublicWod(options: CrossfitOptions = {}): string {
  return `import React from 'react';
import { Flame, Clock, Calendar, ChevronRight } from 'lucide-react';

export default function PublicWod() {
  const wods = [
    {
      id: '1',
      date: new Date().toISOString(),
      name: 'Helen',
      type: 'For Time',
      preview: '3 RFT: 400m Run, 21 KB Swings, 12 Pull-ups',
      difficulty: 'intermediate'
    },
    {
      id: '2',
      date: new Date(Date.now() + 86400000).toISOString(),
      name: 'AMRAP 12',
      type: 'AMRAP',
      preview: '5 Burpees, 10 Box Jumps, 15 Wall Balls',
      difficulty: 'all-levels'
    },
    {
      id: '3',
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      name: 'Deadlift Day',
      type: 'Strength',
      preview: '5x5 Deadlifts, progressive loading',
      difficulty: 'all-levels'
    }
  ];

  const difficultyColors: Record<string, string> = {
    'beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'all-levels': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Upcoming Workouts
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Check out what's coming up this week</p>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {wods.map((wod, idx) => {
          const isToday = new Date(wod.date).toDateString() === new Date().toDateString();

          return (
            <div
              key={wod.id}
              className={\`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer \${isToday ? 'bg-orange-50 dark:bg-orange-900/10' : ''}\`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={\`w-12 h-12 rounded-lg flex flex-col items-center justify-center \${isToday ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}\`}>
                    <div className="text-xs">{new Date(wod.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="font-bold">{new Date(wod.date).getDate()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{wod.name}</h3>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">TODAY</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{wod.type}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{wod.preview}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={\`px-2 py-1 text-xs rounded-full \${difficultyColors[wod.difficulty]}\`}>
                    {wod.difficulty.replace('-', ' ')}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <button className="w-full py-2 text-center text-orange-600 dark:text-orange-400 font-medium hover:underline">
          View Full Schedule
        </button>
      </div>
    </div>
  );
}`;
}

// Leaderboard Preview Component
export function generateLeaderboardPreview(options: CrossfitOptions = {}): string {
  return `import React, { useState } from 'react';
import { Trophy, Medal, TrendingUp, ChevronRight } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: string;
  isRx: boolean;
  avatar?: string;
  change?: number;
}

export default function LeaderboardPreview() {
  const [category, setCategory] = useState<'male' | 'female' | 'scaled'>('male');

  const leaderboards: Record<string, LeaderboardEntry[]> = {
    male: [
      { rank: 1, name: 'Mike Thompson', score: '8:42', isRx: true, change: 0 },
      { rank: 2, name: 'Chris Martinez', score: '9:15', isRx: true, change: 2 },
      { rank: 3, name: 'Jason Lee', score: '9:28', isRx: true, change: -1 },
      { rank: 4, name: 'David Kim', score: '10:02', isRx: true, change: 1 },
      { rank: 5, name: 'Ryan Johnson', score: '10:15', isRx: false, change: -2 }
    ],
    female: [
      { rank: 1, name: 'Sarah Chen', score: '9:55', isRx: true, change: 0 },
      { rank: 2, name: 'Emily Davis', score: '10:22', isRx: true, change: 1 },
      { rank: 3, name: 'Amanda Wilson', score: '10:45', isRx: true, change: -1 },
      { rank: 4, name: 'Jessica Brown', score: '11:08', isRx: false, change: 0 },
      { rank: 5, name: 'Lauren Smith', score: '11:32', isRx: false, change: 2 }
    ],
    scaled: [
      { rank: 1, name: 'Tom Harris', score: '10:12', isRx: false, change: 1 },
      { rank: 2, name: 'Katie Moore', score: '10:45', isRx: false, change: -1 },
      { rank: 3, name: 'James Taylor', score: '11:20', isRx: false, change: 0 }
    ]
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Today's Leaderboard
          </h2>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['male', 'female', 'scaled'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
                  category === cat
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }\`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">WOD: Helen - For Time</p>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {leaderboards[category].map((entry) => (
          <div key={entry.rank} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="w-8 text-center">
              {entry.rank <= 3 ? (
                <Medal className={\`w-6 h-6 mx-auto \${getMedalColor(entry.rank)}\`} />
              ) : (
                <span className="text-gray-500 dark:text-gray-400 font-medium">{entry.rank}</span>
              )}
            </div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center font-medium text-gray-600 dark:text-gray-300">
              {entry.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">{entry.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {entry.isRx ? (
                  <span className="text-green-600 dark:text-green-400">Rx</span>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400">Scaled</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-gray-900 dark:text-white">{entry.score}</div>
              {entry.change !== undefined && entry.change !== 0 && (
                <div className={\`text-xs flex items-center justify-end gap-0.5 \${entry.change > 0 ? 'text-green-500' : 'text-red-500'}\`}>
                  <TrendingUp className={\`w-3 h-3 \${entry.change < 0 ? 'rotate-180' : ''}\`} />
                  {Math.abs(entry.change)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <button className="w-full py-2 flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 font-medium hover:underline">
          View Full Leaderboard
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}`;
}

// Workshop List Upcoming Component
export function generateWorkshopListUpcoming(options: CrossfitOptions = {}): string {
  return `import React from 'react';
import { Calendar, Clock, Users, MapPin, ChevronRight } from 'lucide-react';

interface Workshop {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  spotsLeft: number;
  totalSpots: number;
  price: number;
  level: string;
}

export default function WorkshopListUpcoming() {
  const workshops: Workshop[] = [
    {
      id: '1',
      title: 'Olympic Lifting Fundamentals',
      instructor: 'Coach Mike',
      date: '2024-02-10',
      time: '10:00 AM',
      duration: '3 hours',
      location: 'Main Gym',
      spotsLeft: 4,
      totalSpots: 12,
      price: 75,
      level: 'Beginner'
    },
    {
      id: '2',
      title: 'Handstand & Gymnastics',
      instructor: 'Coach Sarah',
      date: '2024-02-17',
      time: '2:00 PM',
      duration: '2 hours',
      location: 'Studio B',
      spotsLeft: 8,
      totalSpots: 10,
      price: 50,
      level: 'Intermediate'
    },
    {
      id: '3',
      title: 'Mobility & Recovery',
      instructor: 'Dr. James',
      date: '2024-02-24',
      time: '11:00 AM',
      duration: '90 min',
      location: 'Yoga Room',
      spotsLeft: 15,
      totalSpots: 20,
      price: 35,
      level: 'All Levels'
    }
  ];

  const levelColors: Record<string, string> = {
    'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'All Levels': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Workshops</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Special training sessions and clinics</p>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {workshops.map((workshop) => (
          <div key={workshop.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    {new Date(workshop.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {new Date(workshop.date).getDate()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{workshop.title}</h3>
                    <span className={\`px-2 py-0.5 text-xs rounded-full \${levelColors[workshop.level]}\`}>
                      {workshop.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">with {workshop.instructor}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {workshop.time} ({workshop.duration})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {workshop.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {workshop.spotsLeft} spots left
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">\${workshop.price}</div>
                <button className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium">
                  Register
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}
