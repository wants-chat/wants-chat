/**
 * Fitness & Yoga Component Generators
 */

export interface FitnessYogaOptions {
  title?: string;
}

// Class Calendar Yoga
export function generateClassCalendarYoga(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface YogaClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  spotsAvailable: number;
  maxSpots: number;
  room: string;
}

export default function ClassCalendarYoga() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<YogaClass[]>([]);

  useEffect(() => {
    setClasses([
      { id: '1', name: 'Morning Flow', instructor: 'Sarah', time: '06:00', duration: 60, level: 'all-levels', spotsAvailable: 8, maxSpots: 20, room: 'Studio A' },
      { id: '2', name: 'Vinyasa Power', instructor: 'Mike', time: '08:00', duration: 75, level: 'intermediate', spotsAvailable: 3, maxSpots: 15, room: 'Studio B' },
      { id: '3', name: 'Gentle Stretch', instructor: 'Emma', time: '10:00', duration: 45, level: 'beginner', spotsAvailable: 12, maxSpots: 20, room: 'Studio A' },
      { id: '4', name: 'Hot Yoga', instructor: 'Alex', time: '12:00', duration: 90, level: 'advanced', spotsAvailable: 0, maxSpots: 25, room: 'Hot Room' },
      { id: '5', name: 'Restorative', instructor: 'Sarah', time: '17:00', duration: 60, level: 'all-levels', spotsAvailable: 15, maxSpots: 20, room: 'Studio A' },
      { id: '6', name: 'Evening Flow', instructor: 'Emma', time: '19:00', duration: 60, level: 'intermediate', spotsAvailable: 5, maxSpots: 20, room: 'Studio B' }
    ]);
  }, [selectedDate]);

  const levelColors: Record<string, string> = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-blue-100 text-blue-800',
    'advanced': 'bg-purple-100 text-purple-800',
    'all-levels': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Class Schedule</h2>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="grid gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{cls.time}</div>
                  <div className="text-sm text-gray-500">{cls.duration} min</div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cls.name}</h3>
                  <p className="text-gray-600">with {cls.instructor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={\`px-2 py-0.5 rounded-full text-xs \${levelColors[cls.level]}\`}>
                      {cls.level.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">{cls.room}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={\`text-sm \${cls.spotsAvailable === 0 ? 'text-red-600' : 'text-gray-600'}\`}>
                  {cls.spotsAvailable === 0 ? 'Full' : \`\${cls.spotsAvailable} spots left\`}
                </div>
                <button
                  disabled={cls.spotsAvailable === 0}
                  className={\`mt-2 px-4 py-2 rounded-lg text-sm \${
                    cls.spotsAvailable === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }\`}
                >
                  {cls.spotsAvailable === 0 ? 'Join Waitlist' : 'Book Class'}
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

// Class List Today Yoga
export function generateClassListTodayYoga(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface TodayClass {
  id: string;
  time: string;
  name: string;
  instructor: string;
  enrolled: number;
  capacity: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export default function ClassListTodayYoga() {
  const [classes, setClasses] = useState<TodayClass[]>([]);

  useEffect(() => {
    setClasses([
      { id: '1', time: '06:00 AM', name: 'Sunrise Flow', instructor: 'Sarah', enrolled: 18, capacity: 20, status: 'completed' },
      { id: '2', time: '08:00 AM', name: 'Power Vinyasa', instructor: 'Mike', enrolled: 15, capacity: 15, status: 'completed' },
      { id: '3', time: '10:00 AM', name: 'Gentle Yoga', instructor: 'Emma', enrolled: 12, capacity: 20, status: 'in-progress' },
      { id: '4', time: '12:00 PM', name: 'Hot Yoga', instructor: 'Alex', enrolled: 22, capacity: 25, status: 'upcoming' },
      { id: '5', time: '05:00 PM', name: 'After Work Flow', instructor: 'Sarah', enrolled: 8, capacity: 20, status: 'upcoming' }
    ]);
  }, []);

  const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    'upcoming': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    'in-progress': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500 animate-pulse' },
    'completed': { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Today's Classes</h2>
      </div>
      <div className="divide-y">
        {classes.map((cls) => {
          const style = statusStyles[cls.status];
          return (
            <div key={cls.id} className={\`p-4 \${style.bg}\`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={\`w-2 h-2 rounded-full \${style.dot}\`} />
                  <div>
                    <div className="font-medium">{cls.time} - {cls.name}</div>
                    <div className="text-sm text-gray-600">Instructor: {cls.instructor}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={\`text-sm \${style.text}\`}>
                    {cls.enrolled}/{cls.capacity} enrolled
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: \`\${(cls.enrolled / cls.capacity) * 100}%\` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// Instructor Profile Yoga
export function generateInstructorProfileYoga(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface YogaInstructor {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  upcomingClasses: { name: string; day: string; time: string }[];
}

export default function InstructorProfileYoga() {
  const [instructor, setInstructor] = useState<YogaInstructor | null>(null);

  useEffect(() => {
    setInstructor({
      id: '1',
      name: 'Sarah Johnson',
      bio: 'Certified yoga instructor with a passion for helping students find balance and inner peace through mindful movement.',
      specialties: ['Vinyasa Flow', 'Restorative Yoga', 'Prenatal Yoga', 'Meditation'],
      certifications: ['RYT-500', 'Prenatal Yoga Certified', 'Meditation Teacher Training'],
      yearsExperience: 8,
      rating: 4.9,
      reviewCount: 127,
      upcomingClasses: [
        { name: 'Morning Flow', day: 'Mon/Wed/Fri', time: '6:00 AM' },
        { name: 'Restorative', day: 'Tue/Thu', time: '5:00 PM' },
        { name: 'Weekend Vinyasa', day: 'Sat', time: '9:00 AM' }
      ]
    });
  }, []);

  if (!instructor) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
            🧘‍♀️
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{instructor.name}</h2>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{instructor.rating}</span>
                <span className="text-gray-500">({instructor.reviewCount} reviews)</span>
              </div>
              <span className="text-gray-500">{instructor.yearsExperience} years experience</span>
            </div>
            <p className="mt-3 text-gray-600">{instructor.bio}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {instructor.specialties.map((specialty, i) => (
              <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Certifications</h3>
          <ul className="space-y-2">
            {instructor.certifications.map((cert, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                {cert}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Upcoming Classes</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {instructor.upcomingClasses.map((cls, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium">{cls.name}</div>
              <div className="text-sm text-gray-600">{cls.day}</div>
              <div className="text-sm text-purple-600">{cls.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

// Instructor Schedule Yoga
export function generateInstructorScheduleYoga(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface ScheduleSlot {
  id: string;
  day: string;
  time: string;
  className: string;
  room: string;
  enrolled: number;
  capacity: number;
}

export default function InstructorScheduleYoga() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    setSchedule([
      { id: '1', day: 'Monday', time: '06:00 AM', className: 'Morning Flow', room: 'Studio A', enrolled: 18, capacity: 20 },
      { id: '2', day: 'Monday', time: '05:00 PM', className: 'Restorative', room: 'Studio B', enrolled: 12, capacity: 15 },
      { id: '3', day: 'Wednesday', time: '06:00 AM', className: 'Morning Flow', room: 'Studio A', enrolled: 20, capacity: 20 },
      { id: '4', day: 'Wednesday', time: '07:00 PM', className: 'Evening Vinyasa', room: 'Studio A', enrolled: 15, capacity: 20 },
      { id: '5', day: 'Friday', time: '06:00 AM', className: 'Morning Flow', room: 'Studio A', enrolled: 16, capacity: 20 },
      { id: '6', day: 'Saturday', time: '09:00 AM', className: 'Weekend Workshop', room: 'Studio B', enrolled: 10, capacity: 12 }
    ]);
  }, [selectedWeek]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getClassesForDay = (day: string) => schedule.filter(s => s.day === day);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Weekly Schedule</h2>
        <div className="flex gap-2">
          <button onClick={() => setSelectedWeek(w => w - 1)} className="px-3 py-1 border rounded hover:bg-gray-50">← Previous</button>
          <button onClick={() => setSelectedWeek(0)} className="px-3 py-1 bg-purple-600 text-white rounded">This Week</button>
          <button onClick={() => setSelectedWeek(w => w + 1)} className="px-3 py-1 border rounded hover:bg-gray-50">Next →</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div key={day} className="bg-white rounded-lg shadow min-h-[200px]">
            <div className="p-2 bg-purple-50 text-center font-medium text-sm border-b">
              {day.slice(0, 3)}
            </div>
            <div className="p-2 space-y-2">
              {getClassesForDay(day).map(slot => (
                <div key={slot.id} className="p-2 bg-purple-100 rounded text-xs">
                  <div className="font-medium">{slot.time}</div>
                  <div>{slot.className}</div>
                  <div className="text-purple-600">{slot.enrolled}/{slot.capacity}</div>
                </div>
              ))}
              {getClassesForDay(day).length === 0 && (
                <div className="text-center text-gray-400 text-xs py-4">No classes</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Member Profile Yoga
export function generateMemberProfileYoga(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface YogaMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  membershipType: 'monthly' | 'annual' | 'class-pack';
  classesRemaining?: number;
  renewalDate: string;
  totalClasses: number;
  favoriteClasses: string[];
  recentClasses: { name: string; date: string; instructor: string }[];
}

export default function MemberProfileYoga() {
  const [member, setMember] = useState<YogaMember | null>(null);

  useEffect(() => {
    setMember({
      id: '1',
      name: 'Emily Chen',
      email: 'emily@email.com',
      phone: '555-0123',
      memberSince: '2023-03-15',
      membershipType: 'annual',
      renewalDate: '2025-03-15',
      totalClasses: 87,
      favoriteClasses: ['Morning Flow', 'Restorative', 'Hot Yoga'],
      recentClasses: [
        { name: 'Morning Flow', date: '2024-01-18', instructor: 'Sarah' },
        { name: 'Hot Yoga', date: '2024-01-17', instructor: 'Alex' },
        { name: 'Restorative', date: '2024-01-15', instructor: 'Emma' }
      ]
    });
  }, []);

  if (!member) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <p className="text-gray-600">{member.email} • {member.phone}</p>
            <p className="text-sm text-gray-500 mt-1">Member since {new Date(member.memberSince).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm capitalize">
              {member.membershipType.replace('-', ' ')}
            </span>
            <p className="text-sm text-gray-500 mt-2">Renews {new Date(member.renewalDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-700">{member.totalClasses}</div>
          <div className="text-purple-600">Total Classes Attended</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Favorite Classes</h3>
          <div className="flex flex-wrap gap-2">
            {member.favoriteClasses.map((cls, i) => (
              <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {cls}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Recent Classes</h3>
          <div className="space-y-2">
            {member.recentClasses.map((cls, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{cls.name} with {cls.instructor}</span>
                <span className="text-gray-500">{new Date(cls.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Public Schedule Yoga
export function generatePublicScheduleYoga(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface PublicClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  level: string;
  spotsAvailable: number;
  description: string;
}

export default function PublicScheduleYoga() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [classes, setClasses] = useState<PublicClass[]>([]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    setClasses([
      { id: '1', name: 'Sunrise Flow', instructor: 'Sarah', time: '6:00 AM', duration: 60, level: 'All Levels', spotsAvailable: 8, description: 'Start your day with an energizing flow sequence.' },
      { id: '2', name: 'Power Vinyasa', instructor: 'Mike', time: '8:00 AM', duration: 75, level: 'Intermediate', spotsAvailable: 3, description: 'Build strength and flexibility with dynamic sequences.' },
      { id: '3', name: 'Gentle Yoga', instructor: 'Emma', time: '10:00 AM', duration: 60, level: 'Beginner', spotsAvailable: 12, description: 'Perfect for beginners or those seeking a gentle practice.' },
      { id: '4', name: 'Hot Yoga', instructor: 'Alex', time: '12:00 PM', duration: 90, level: 'Advanced', spotsAvailable: 0, description: 'Challenge yourself in our heated studio.' }
    ]);
  }, [selectedDay]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Class Schedule</h1>
        <p className="text-gray-600 mt-2">Find the perfect class for your practice</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {days.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(i)}
            className={\`w-12 h-12 rounded-full font-medium transition-colors \${
              selectedDay === i
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }\`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-purple-600">{cls.time}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{cls.duration} min</span>
                </div>
                <h3 className="text-xl font-semibold mt-2">{cls.name}</h3>
                <p className="text-gray-600">with {cls.instructor}</p>
                <p className="text-sm text-gray-500 mt-2">{cls.description}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {cls.level}
                </span>
              </div>
              <div className="text-right">
                <div className={\`text-sm mb-2 \${cls.spotsAvailable === 0 ? 'text-red-600' : 'text-green-600'}\`}>
                  {cls.spotsAvailable === 0 ? 'Class Full' : \`\${cls.spotsAvailable} spots available\`}
                </div>
                <button
                  className={\`px-6 py-2 rounded-lg font-medium \${
                    cls.spotsAvailable === 0
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }\`}
                >
                  {cls.spotsAvailable === 0 ? 'Join Waitlist' : 'Book Now'}
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

// Dance Studio Stats
export function generateDanceStudioStatsView(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function DanceStudioStats() {
  const [stats, setStats] = useState({
    totalStudents: 245,
    activeClasses: 18,
    monthlyRevenue: 28500,
    classesToday: 8,
    newStudents: 12,
    retention: 94,
    popularStyles: [
      { name: 'Ballet', students: 68 },
      { name: 'Hip Hop', students: 54 },
      { name: 'Contemporary', students: 42 },
      { name: 'Jazz', students: 38 }
    ]
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Studio Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-pink-600">{stats.totalStudents}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-purple-600">{stats.activeClasses}</div>
          <div className="text-sm text-gray-600">Active Classes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-green-600">\${stats.monthlyRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Monthly Revenue</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-blue-600">{stats.retention}%</div>
          <div className="text-sm text-gray-600">Retention Rate</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Today's Schedule</h3>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-pink-600">{stats.classesToday}</div>
              <div className="text-gray-600">Classes Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Popular Dance Styles</h3>
          <div className="space-y-3">
            {stats.popularStyles.map((style, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{style.name}</span>
                    <span>{style.students} students</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: \`\${(style.students / stats.totalStudents) * 100}%\` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Class Filters Dance
export function generateClassFiltersDance(options: FitnessYogaOptions = {}): string {
  return `import React, { useState } from 'react';

interface DanceFilters {
  style: string;
  level: string;
  instructor: string;
  dayOfWeek: string;
  timeSlot: string;
}

interface ClassFiltersDanceProps {
  onFilter?: (filters: DanceFilters) => void;
}

export default function ClassFiltersDance({ onFilter }: ClassFiltersDanceProps) {
  const [filters, setFilters] = useState<DanceFilters>({
    style: 'all',
    level: 'all',
    instructor: 'all',
    dayOfWeek: 'all',
    timeSlot: 'all'
  });

  const styles = ['all', 'ballet', 'hip-hop', 'contemporary', 'jazz', 'tap', 'ballroom'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced', 'professional'];
  const timeSlots = ['all', 'morning', 'afternoon', 'evening'];

  const handleChange = (key: keyof DanceFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Filter Classes</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <select
          value={filters.style}
          onChange={(e) => handleChange('style', e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          {styles.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Styles' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
          ))}
        </select>

        <select
          value={filters.level}
          onChange={(e) => handleChange('level', e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          {levels.map(l => (
            <option key={l} value={l}>{l === 'all' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>

        <select
          value={filters.dayOfWeek}
          onChange={(e) => handleChange('dayOfWeek', e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">Any Day</option>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
            <option key={d} value={d.toLowerCase()}>{d}</option>
          ))}
        </select>

        <select
          value={filters.timeSlot}
          onChange={(e) => handleChange('timeSlot', e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          {timeSlots.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'Any Time' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <button
          onClick={() => {
            const reset = { style: 'all', level: 'all', instructor: 'all', dayOfWeek: 'all', timeSlot: 'all' };
            setFilters(reset);
            onFilter?.(reset);
          }}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}`;
}

// Instructor Profile Dance
export function generateInstructorProfileDance(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface DanceInstructor {
  id: string;
  name: string;
  styles: string[];
  bio: string;
  experience: number;
  achievements: string[];
  upcomingClasses: { name: string; time: string; day: string }[];
}

export default function InstructorProfileDance() {
  const [instructor, setInstructor] = useState<DanceInstructor | null>(null);

  useEffect(() => {
    setInstructor({
      id: '1',
      name: 'Maria Rodriguez',
      styles: ['Ballet', 'Contemporary', 'Jazz'],
      bio: 'Professional dancer with over 15 years of experience performing and teaching. Former principal dancer with the City Ballet Company.',
      experience: 15,
      achievements: ['City Ballet Principal Dancer (2010-2018)', 'Dance Teacher of the Year 2022', 'Choreographed 20+ productions'],
      upcomingClasses: [
        { name: 'Ballet Fundamentals', time: '10:00 AM', day: 'Mon/Wed/Fri' },
        { name: 'Contemporary Fusion', time: '2:00 PM', day: 'Tue/Thu' },
        { name: 'Jazz Technique', time: '6:00 PM', day: 'Mon/Wed' }
      ]
    });
  }, []);

  if (!instructor) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-3xl">
            💃
          </div>
          <div>
            <h2 className="text-2xl font-bold">{instructor.name}</h2>
            <div className="flex gap-2 mt-2">
              {instructor.styles.map((style, i) => (
                <span key={i} className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">{style}</span>
              ))}
            </div>
            <p className="mt-3 text-gray-600">{instructor.bio}</p>
            <p className="mt-2 text-sm text-gray-500">{instructor.experience} years of experience</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Achievements</h3>
          <ul className="space-y-2">
            {instructor.achievements.map((achievement, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-500">🏆</span>
                {achievement}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Upcoming Classes</h3>
          <div className="space-y-3">
            {instructor.upcomingClasses.map((cls, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{cls.name}</div>
                <div className="text-sm text-gray-600">{cls.day} at {cls.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Student Profile Dance
export function generateStudentProfileDance(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface DanceStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledSince: string;
  styles: string[];
  level: string;
  currentClasses: { name: string; instructor: string; schedule: string }[];
  attendance: number;
  upcomingRecitals: { name: string; date: string; role: string }[];
}

export default function StudentProfileDance() {
  const [student, setStudent] = useState<DanceStudent | null>(null);

  useEffect(() => {
    setStudent({
      id: '1',
      name: 'Sophie Anderson',
      email: 'sophie@email.com',
      phone: '555-0123',
      enrolledSince: '2022-09-01',
      styles: ['Ballet', 'Jazz'],
      level: 'Intermediate',
      currentClasses: [
        { name: 'Ballet Level 2', instructor: 'Maria Rodriguez', schedule: 'Mon/Wed 4:00 PM' },
        { name: 'Jazz Technique', instructor: 'James Wilson', schedule: 'Tue/Thu 5:00 PM' }
      ],
      attendance: 92,
      upcomingRecitals: [
        { name: 'Spring Showcase', date: '2024-03-15', role: 'Corps de Ballet' },
        { name: 'Summer Gala', date: '2024-06-20', role: 'Featured Soloist' }
      ]
    });
  }, []);

  if (!student) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <p className="text-gray-600">{student.email} • {student.phone}</p>
            <div className="flex gap-2 mt-2">
              {student.styles.map((style, i) => (
                <span key={i} className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">{style}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">{student.level}</span>
            <p className="text-sm text-gray-500 mt-2">Student since {new Date(student.enrolledSince).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{student.attendance}%</div>
          <div className="text-sm text-green-600">Attendance Rate</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Current Classes</h3>
          <div className="space-y-3">
            {student.currentClasses.map((cls, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{cls.name}</div>
                <div className="text-sm text-gray-600">with {cls.instructor}</div>
                <div className="text-sm text-pink-600">{cls.schedule}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Upcoming Recitals</h3>
          <div className="space-y-3">
            {student.upcomingRecitals.map((recital, i) => (
              <div key={i} className="p-3 bg-pink-50 rounded-lg">
                <div className="font-medium">{recital.name}</div>
                <div className="text-sm text-gray-600">{new Date(recital.date).toLocaleDateString()}</div>
                <div className="text-sm text-pink-600">Role: {recital.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Schedule Calendar Dance
export function generateScheduleCalendarDance(options: FitnessYogaOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface DanceClass {
  id: string;
  name: string;
  style: string;
  instructor: string;
  time: string;
  duration: number;
  room: string;
  level: string;
  enrolled: number;
  capacity: number;
}

export default function ScheduleCalendarDance() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [classes, setClasses] = useState<DanceClass[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    setClasses([
      { id: '1', name: 'Ballet Beginners', style: 'Ballet', instructor: 'Maria', time: '09:00', duration: 60, room: 'Studio 1', level: 'Beginner', enrolled: 12, capacity: 15 },
      { id: '2', name: 'Hip Hop Crew', style: 'Hip Hop', instructor: 'James', time: '10:30', duration: 75, room: 'Studio 2', level: 'Intermediate', enrolled: 18, capacity: 20 },
      { id: '3', name: 'Contemporary Flow', style: 'Contemporary', instructor: 'Emma', time: '12:00', duration: 60, room: 'Studio 1', level: 'All Levels', enrolled: 10, capacity: 15 },
      { id: '4', name: 'Jazz Technique', style: 'Jazz', instructor: 'Lisa', time: '14:00', duration: 60, room: 'Studio 2', level: 'Intermediate', enrolled: 14, capacity: 15 },
      { id: '5', name: 'Ballet Advanced', style: 'Ballet', instructor: 'Maria', time: '16:00', duration: 90, room: 'Studio 1', level: 'Advanced', enrolled: 8, capacity: 12 }
    ]);
  }, [selectedDay]);

  const styleColors: Record<string, string> = {
    'Ballet': 'bg-pink-100 border-l-4 border-pink-500',
    'Hip Hop': 'bg-purple-100 border-l-4 border-purple-500',
    'Contemporary': 'bg-blue-100 border-l-4 border-blue-500',
    'Jazz': 'bg-yellow-100 border-l-4 border-yellow-500',
    'Tap': 'bg-orange-100 border-l-4 border-orange-500'
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(i)}
            className={\`px-4 py-2 rounded-lg whitespace-nowrap \${
              selectedDay === i ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }\`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {classes.map((cls) => (
          <div key={cls.id} className={\`bg-white rounded-lg shadow p-4 \${styleColors[cls.style] || 'border-l-4 border-gray-300'}\`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{cls.time}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{cls.duration} min</span>
                </div>
                <h3 className="font-semibold text-lg mt-1">{cls.name}</h3>
                <p className="text-gray-600">with {cls.instructor} • {cls.room}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-sm">{cls.level}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{cls.enrolled}/{cls.capacity}</div>
                <button className="mt-2 px-4 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700">
                  Enroll
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
