/**
 * Activity and Calendar Component Generators
 *
 * Generators for activity feeds, calendars, and scheduling components.
 */

export interface ActivityCalendarOptions {
  title?: string;
  entityType?: string;
}

// Activity Calendar Senior
export function generateActivityCalendarSenior(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  enrolled: number;
}

export default function ActivityCalendarSenior() {
  const [date, setDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setActivities([
      { id: '1', title: 'Morning Yoga', time: '09:00 AM', location: 'Activity Room A', category: 'Fitness', capacity: 20, enrolled: 15 },
      { id: '2', title: 'Arts & Crafts', time: '10:30 AM', location: 'Craft Room', category: 'Creative', capacity: 12, enrolled: 10 },
      { id: '3', title: 'Bingo', time: '02:00 PM', location: 'Main Hall', category: 'Games', capacity: 50, enrolled: 35 },
      { id: '4', title: 'Movie Afternoon', time: '03:30 PM', location: 'Theater', category: 'Entertainment', capacity: 40, enrolled: 28 }
    ]);
  }, [date]);

  const categoryColors: Record<string, string> = {
    Fitness: 'bg-green-100 text-green-800',
    Creative: 'bg-purple-100 text-purple-800',
    Games: 'bg-blue-100 text-blue-800',
    Entertainment: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today's Activities</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(d => new Date(d.setDate(d.getDate() - 1)))} className="p-2 hover:bg-gray-100 rounded">←</button>
          <span className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <button onClick={() => setDate(d => new Date(d.setDate(d.getDate() + 1)))} className="p-2 hover:bg-gray-100 rounded">→</button>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-1 rounded-full text-xs \${categoryColors[activity.category]}\`}>
                    {activity.category}
                  </span>
                  <span className="text-gray-500 text-sm">{activity.time}</span>
                </div>
                <h3 className="font-semibold text-lg mt-1">{activity.title}</h3>
                <p className="text-gray-600 text-sm">📍 {activity.location}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">{activity.enrolled}/{activity.capacity} enrolled</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: \`\${(activity.enrolled / activity.capacity) * 100}%\` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Activity List Today
export function generateActivityListToday(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  title: string;
  time: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  participants: number;
}

export default function ActivityListToday() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setActivities([
      { id: '1', title: 'Team Standup', time: '09:00 AM', status: 'completed', participants: 8 },
      { id: '2', title: 'Product Review', time: '10:30 AM', status: 'completed', participants: 5 },
      { id: '3', title: 'Design Sprint', time: '01:00 PM', status: 'in-progress', participants: 6 },
      { id: '4', title: 'Client Call', time: '03:00 PM', status: 'upcoming', participants: 4 },
      { id: '5', title: 'Weekly Wrap-up', time: '04:30 PM', status: 'upcoming', participants: 12 }
    ]);
  }, []);

  const statusStyles: Record<string, { bg: string; text: string; icon: string }> = {
    'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '▶' },
    'upcoming': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '○' }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Today's Activities</h2>
      <div className="space-y-2">
        {activities.map((activity) => {
          const style = statusStyles[activity.status];
          return (
            <div key={activity.id} className={\`flex items-center gap-3 p-3 rounded-lg \${style.bg}\`}>
              <span className={\`w-6 h-6 flex items-center justify-center rounded-full bg-white \${style.text}\`}>
                {style.icon}
              </span>
              <div className="flex-1">
                <h3 className="font-medium">{activity.title}</h3>
                <span className="text-sm text-gray-500">{activity.time} · {activity.participants} participants</span>
              </div>
              <span className={\`text-xs px-2 py-1 rounded-full \${style.text} bg-white\`}>
                {activity.status.replace('-', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// Activity List Today Senior
export function generateActivityListTodaySenior(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  staff: string;
  isAccessible: boolean;
}

export default function ActivityListTodaySenior() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setActivities([
      { id: '1', title: 'Gentle Stretching', time: '08:30 AM', location: 'Wellness Center', staff: 'Nancy', isAccessible: true },
      { id: '2', title: 'Bible Study', time: '10:00 AM', location: 'Chapel', staff: 'Pastor John', isAccessible: true },
      { id: '3', title: 'Lunch', time: '12:00 PM', location: 'Dining Hall', staff: 'Kitchen Staff', isAccessible: true },
      { id: '4', title: 'Card Games', time: '02:00 PM', location: 'Game Room', staff: 'Mike', isAccessible: true },
      { id: '5', title: 'Music Therapy', time: '03:30 PM', location: 'Activity Room B', staff: 'Sarah', isAccessible: true }
    ]);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today's Schedule</h2>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className="bg-white rounded-lg shadow divide-y">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 flex items-center gap-4">
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold text-blue-600">{activity.time.split(' ')[0]}</div>
              <div className="text-xs text-gray-500">{activity.time.split(' ')[1]}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{activity.title}</h3>
                {activity.isAccessible && <span title="Wheelchair Accessible">♿</span>}
              </div>
              <div className="text-sm text-gray-500">
                <span>📍 {activity.location}</span>
                <span className="mx-2">•</span>
                <span>👤 {activity.staff}</span>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Calendar Accounting
export function generateCalendarAccounting(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'meeting' | 'filing' | 'review';
  client?: string;
}

export default function CalendarAccounting() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setEvents([
      { id: '1', title: 'Q4 Tax Filing', date: '2024-01-15', type: 'deadline', client: 'ABC Corp' },
      { id: '2', title: 'Client Review', date: '2024-01-18', type: 'meeting', client: 'XYZ Inc' },
      { id: '3', title: 'Payroll Processing', date: '2024-01-20', type: 'filing' },
      { id: '4', title: 'Annual Report Review', date: '2024-01-25', type: 'review', client: 'Tech Solutions' }
    ]);
  }, [currentMonth]);

  const typeColors: Record<string, string> = {
    deadline: 'bg-red-500',
    meeting: 'bg-blue-500',
    filing: 'bg-green-500',
    review: 'bg-purple-500'
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">←</button>
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-medium text-gray-500 py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDay)].map((_, i) => <div key={\`empty-\${i}\`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = \`\${currentMonth.getFullYear()}-\${String(currentMonth.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
          const dayEvents = events.filter(e => e.date === dateStr);
          return (
            <div key={day} className="min-h-[80px] border rounded p-1">
              <div className="text-sm font-medium">{day}</div>
              <div className="space-y-1 mt-1">
                {dayEvents.map(event => (
                  <div key={event.id} className={\`\${typeColors[event.type]} text-white text-xs p-1 rounded truncate\`}>
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-sm">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={\`w-3 h-3 rounded \${color}\`} />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Appointment Calendar Dental
export function generateAppointmentCalendarDental(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  procedure: string;
  time: string;
  duration: number;
  dentist: string;
  room: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
}

export default function AppointmentCalendarDental() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setAppointments([
      { id: '1', patientName: 'John Smith', procedure: 'Cleaning', time: '09:00', duration: 30, dentist: 'Dr. Wilson', room: 'Room 1', status: 'completed' },
      { id: '2', patientName: 'Mary Johnson', procedure: 'Root Canal', time: '09:30', duration: 90, dentist: 'Dr. Brown', room: 'Room 2', status: 'in-progress' },
      { id: '3', patientName: 'Bob Williams', procedure: 'Checkup', time: '11:00', duration: 30, dentist: 'Dr. Wilson', room: 'Room 1', status: 'checked-in' },
      { id: '4', patientName: 'Sarah Davis', procedure: 'Filling', time: '11:30', duration: 45, dentist: 'Dr. Brown', room: 'Room 3', status: 'scheduled' },
      { id: '5', patientName: 'Mike Thompson', procedure: 'Crown', time: '01:00', duration: 60, dentist: 'Dr. Wilson', room: 'Room 1', status: 'scheduled' }
    ]);
  }, [selectedDate]);

  const statusColors: Record<string, { bg: string; text: string }> = {
    'scheduled': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'checked-in': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'completed': { bg: 'bg-green-100', text: 'text-green-800' }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🦷 Dental Appointments</h2>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Procedure</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Dentist</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Room</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appointments.map((apt) => {
              const style = statusColors[apt.status];
              return (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{apt.time}</td>
                  <td className="px-4 py-3">{apt.patientName}</td>
                  <td className="px-4 py-3">
                    {apt.procedure}
                    <span className="text-gray-500 text-sm ml-2">({apt.duration}min)</span>
                  </td>
                  <td className="px-4 py-3">{apt.dentist}</td>
                  <td className="px-4 py-3">{apt.room}</td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded-full text-xs \${style.bg} \${style.text}\`}>
                      {apt.status.replace('-', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;
}

// Appointment Calendar Vet
export function generateAppointmentCalendarVet(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  petName: string;
  petType: string;
  ownerName: string;
  procedure: string;
  time: string;
  vet: string;
  status: 'scheduled' | 'waiting' | 'in-exam' | 'completed';
}

export default function AppointmentCalendarVet() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setAppointments([
      { id: '1', petName: 'Max', petType: '🐕', ownerName: 'John Smith', procedure: 'Annual Checkup', time: '09:00', vet: 'Dr. Johnson', status: 'completed' },
      { id: '2', petName: 'Whiskers', petType: '🐱', ownerName: 'Mary Davis', procedure: 'Vaccination', time: '09:30', vet: 'Dr. Lee', status: 'in-exam' },
      { id: '3', petName: 'Buddy', petType: '🐕', ownerName: 'Bob Wilson', procedure: 'Dental Cleaning', time: '10:00', vet: 'Dr. Johnson', status: 'waiting' },
      { id: '4', petName: 'Luna', petType: '🐱', ownerName: 'Sarah Brown', procedure: 'Spay Surgery', time: '11:00', vet: 'Dr. Lee', status: 'scheduled' },
      { id: '5', petName: 'Charlie', petType: '🐦', ownerName: 'Mike Thompson', procedure: 'Wing Trim', time: '02:00', vet: 'Dr. Johnson', status: 'scheduled' }
    ]);
  }, [selectedDate]);

  const statusColors: Record<string, { bg: string; text: string }> = {
    'scheduled': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'waiting': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'in-exam': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'completed': { bg: 'bg-green-100', text: 'text-green-800' }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🐾 Veterinary Appointments</h2>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="grid gap-3">
        {appointments.map((apt) => {
          const style = statusColors[apt.status];
          return (
            <div key={apt.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="text-3xl">{apt.petType}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{apt.petName}</h3>
                      <span className={\`px-2 py-0.5 rounded-full text-xs \${style.bg} \${style.text}\`}>
                        {apt.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Owner: {apt.ownerName}</p>
                    <p className="text-sm text-gray-600">{apt.procedure}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{apt.time}</div>
                  <div className="text-sm text-gray-500">{apt.vet}</div>
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

// Appointment Detail
export function generateAppointmentDetail(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface AppointmentDetailProps {
  appointmentId?: string;
}

export default function AppointmentDetail({ appointmentId }: AppointmentDetailProps) {
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    setAppointment({
      id: appointmentId || '1',
      title: 'Annual Checkup',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '30 minutes',
      provider: { name: 'Dr. Smith', specialty: 'General Practice', avatar: 'https://via.placeholder.com/60' },
      location: { name: 'Main Office', address: '123 Medical Center Dr, Suite 100', phone: '(555) 123-4567' },
      notes: 'Regular annual physical examination. Please bring insurance card and photo ID.',
      status: 'confirmed',
      reminders: [
        { type: 'email', sent: true, date: '2024-01-14' },
        { type: 'sms', sent: true, date: '2024-01-15' }
      ]
    });
  }, [appointmentId]);

  if (!appointment) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <span className={\`inline-block px-3 py-1 rounded-full text-sm \${
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }\`}>
              {appointment.status}
            </span>
            <h1 className="text-2xl font-bold mt-2">{appointment.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <span>📅 {appointment.date}</span>
              <span>🕐 {appointment.time}</span>
              <span>⏱️ {appointment.duration}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Reschedule
            </button>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Provider Info */}
        <div>
          <h3 className="font-semibold mb-3">Provider</h3>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img src={appointment.provider.avatar} alt={appointment.provider.name} className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-medium">{appointment.provider.name}</div>
              <div className="text-sm text-gray-500">{appointment.provider.specialty}</div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div>
          <h3 className="font-semibold mb-3">Location</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">{appointment.location.name}</div>
            <div className="text-sm text-gray-500">{appointment.location.address}</div>
            <div className="text-sm text-gray-500">{appointment.location.phone}</div>
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <h3 className="font-semibold mb-3">Notes</h3>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
        </div>

        {/* Reminders */}
        <div className="md:col-span-2">
          <h3 className="font-semibold mb-3">Reminders</h3>
          <div className="flex gap-4">
            {appointment.reminders.map((reminder: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={reminder.sent ? 'text-green-600' : 'text-gray-400'}>
                  {reminder.sent ? '✓' : '○'}
                </span>
                <span className="capitalize">{reminder.type}</span>
                <span className="text-gray-500">({reminder.date})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Appointment List Today Rehab
export function generateAppointmentListTodayRehab(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  therapyType: string;
  time: string;
  therapist: string;
  room: string;
  progressNote?: string;
  status: 'scheduled' | 'in-session' | 'completed' | 'no-show';
}

export default function AppointmentListTodayRehab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments([
      { id: '1', patientName: 'Robert Chen', therapyType: 'Physical Therapy', time: '08:00', therapist: 'Dr. Martinez', room: 'PT Room 1', status: 'completed', progressNote: 'Good progress on mobility exercises' },
      { id: '2', patientName: 'Linda Park', therapyType: 'Occupational Therapy', time: '09:00', therapist: 'Sarah Wilson', room: 'OT Suite', status: 'in-session' },
      { id: '3', patientName: 'James Taylor', therapyType: 'Speech Therapy', time: '10:00', therapist: 'Dr. Brown', room: 'Speech Lab', status: 'scheduled' },
      { id: '4', patientName: 'Maria Garcia', therapyType: 'Physical Therapy', time: '11:00', therapist: 'Dr. Martinez', room: 'PT Room 2', status: 'scheduled' },
      { id: '5', patientName: 'David Kim', therapyType: 'Aquatic Therapy', time: '01:00', therapist: 'Mike Johnson', room: 'Pool', status: 'scheduled' }
    ]);
  }, []);

  const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
    'scheduled': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⏰' },
    'in-session': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '▶️' },
    'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
    'no-show': { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today's Rehab Sessions</h2>
        <span className="text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>

      <div className="space-y-3">
        {appointments.map((apt) => {
          const config = statusConfig[apt.status];
          return (
            <div key={apt.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="text-center min-w-[50px]">
                    <div className="text-lg font-bold">{apt.time}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{apt.patientName}</h3>
                      <span className={\`px-2 py-0.5 rounded-full text-xs \${config.bg} \${config.text}\`}>
                        {config.icon} {apt.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600">{apt.therapyType}</p>
                    <p className="text-sm text-gray-500">{apt.therapist} · {apt.room}</p>
                    {apt.progressNote && (
                      <p className="text-sm text-gray-600 mt-1 italic">"{apt.progressNote}"</p>
                    )}
                  </div>
                </div>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// Event Calendar
export function generateEventCalendar(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  attendees: number;
}

export default function EventCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setEvents([
      { id: '1', title: 'Team Meeting', date: '2024-01-15', startTime: '10:00', endTime: '11:00', location: 'Conference Room A', category: 'meeting', attendees: 8 },
      { id: '2', title: 'Product Launch', date: '2024-01-18', startTime: '14:00', endTime: '16:00', location: 'Main Hall', category: 'event', attendees: 50 },
      { id: '3', title: 'Training Session', date: '2024-01-20', startTime: '09:00', endTime: '12:00', location: 'Training Room', category: 'training', attendees: 15 },
      { id: '4', title: 'Client Presentation', date: '2024-01-22', startTime: '15:00', endTime: '16:30', location: 'Meeting Room B', category: 'meeting', attendees: 6 }
    ]);
  }, [currentMonth]);

  const categoryColors: Record<string, string> = {
    meeting: 'bg-blue-500',
    event: 'bg-purple-500',
    training: 'bg-green-500',
    deadline: 'bg-red-500'
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return {
      firstDay: new Date(year, month, 1).getDay(),
      daysInMonth: new Date(year, month + 1, 0).getDate()
    };
  };

  const { firstDay, daysInMonth } = getDaysInMonth();
  const selectedEvents = events.filter(e => e.date === selectedDate);

  return (
    <div className="flex gap-6">
      <div className="flex-1 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">←</button>
          <h2 className="text-lg font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-medium text-gray-500 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDay)].map((_, i) => <div key={\`empty-\${i}\`} />)}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = \`\${currentMonth.getFullYear()}-\${String(currentMonth.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={\`min-h-[60px] border rounded p-1 text-left \${isSelected ? 'border-blue-500 bg-blue-50' : ''} \${isToday ? 'bg-yellow-50' : ''}\`}
              >
                <div className={\`text-sm font-medium \${isToday ? 'text-blue-600' : ''}\`}>{day}</div>
                {dayEvents.slice(0, 2).map(event => (
                  <div key={event.id} className={\`\${categoryColors[event.category]} text-white text-xs p-0.5 rounded truncate mt-0.5\`}>
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="w-80 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">{new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
          {selectedEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map(event => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className={\`w-2 h-2 rounded-full \${categoryColors[event.category]} inline-block mr-2\`} />
                  <span className="font-medium">{event.title}</span>
                  <div className="text-sm text-gray-500 mt-1">
                    <div>🕐 {event.startTime} - {event.endTime}</div>
                    <div>📍 {event.location}</div>
                    <div>👥 {event.attendees} attendees</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}`;
}

// Session Calendar
export function generateSessionCalendar(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  instructor: string;
  capacity: number;
  enrolled: number;
  status: 'open' | 'full' | 'cancelled';
}

export default function SessionCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions([
      { id: '1', title: 'Morning Yoga', date: selectedDate.toISOString().split('T')[0], time: '07:00', duration: 60, instructor: 'Sarah', capacity: 15, enrolled: 12, status: 'open' },
      { id: '2', title: 'HIIT Class', date: selectedDate.toISOString().split('T')[0], time: '08:30', duration: 45, instructor: 'Mike', capacity: 20, enrolled: 20, status: 'full' },
      { id: '3', title: 'Pilates', date: selectedDate.toISOString().split('T')[0], time: '10:00', duration: 50, instructor: 'Emma', capacity: 12, enrolled: 8, status: 'open' },
      { id: '4', title: 'Spin Class', date: selectedDate.toISOString().split('T')[0], time: '12:00', duration: 45, instructor: 'John', capacity: 25, enrolled: 18, status: 'open' }
    ]);
  }, [selectedDate]);

  const statusStyles: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-green-100', text: 'text-green-800' },
    full: { bg: 'bg-red-100', text: 'text-red-800' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Session Schedule</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() - 1)))} className="p-2 hover:bg-gray-100 rounded">←</button>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          />
          <button onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() + 1)))} className="p-2 hover:bg-gray-100 rounded">→</button>
        </div>
      </div>

      <div className="grid gap-3">
        {sessions.map((session) => {
          const style = statusStyles[session.status];
          return (
            <div key={session.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="text-center min-w-[60px]">
                  <div className="text-lg font-bold">{session.time}</div>
                  <div className="text-xs text-gray-500">{session.duration}min</div>
                </div>
                <div>
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-sm text-gray-600">with {session.instructor}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm">{session.enrolled}/{session.capacity}</div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: \`\${(session.enrolled / session.capacity) * 100}%\` }}
                    />
                  </div>
                </div>
                <span className={\`px-3 py-1 rounded-full text-sm \${style.bg} \${style.text}\`}>
                  {session.status}
                </span>
                {session.status === 'open' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Book
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// Schedule Calendar
export function generateScheduleCalendar(options: ActivityCalendarOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: string;
  color: string;
}

export default function ScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  useEffect(() => {
    setSchedule([
      { id: '1', title: 'Team Standup', startTime: '09:00', endTime: '09:30', type: 'meeting', color: 'bg-blue-200 border-blue-500' },
      { id: '2', title: 'Project Work', startTime: '10:00', endTime: '12:00', type: 'work', color: 'bg-green-200 border-green-500' },
      { id: '3', title: 'Lunch', startTime: '12:00', endTime: '13:00', type: 'break', color: 'bg-gray-200 border-gray-500' },
      { id: '4', title: 'Client Call', startTime: '14:00', endTime: '15:00', type: 'meeting', color: 'bg-purple-200 border-purple-500' },
      { id: '5', title: 'Code Review', startTime: '15:30', endTime: '16:30', type: 'work', color: 'bg-green-200 border-green-500' }
    ]);
  }, [selectedDate]);

  const getItemPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const top = ((startHour - 8) * 60 + startMin) * (60 / 60); // 60px per hour
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (60 / 60);
    return { top: \`\${top}px\`, height: \`\${height}px\` };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Schedule</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() - 1)))} className="p-2 hover:bg-gray-100 rounded">←</button>
          <span className="font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <button onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() + 1)))} className="p-2 hover:bg-gray-100 rounded">→</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] border-b px-2 text-sm text-gray-500 text-right pr-3 pt-1">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Schedule column */}
          <div className="flex-1 relative" style={{ height: \`\${hours.length * 60}px\` }}>
            {/* Hour lines */}
            {hours.map(hour => (
              <div key={hour} className="absolute w-full h-[60px] border-b" style={{ top: \`\${(hour - 8) * 60}px\` }} />
            ))}

            {/* Schedule items */}
            {schedule.map(item => {
              const position = getItemPosition(item.startTime, item.endTime);
              return (
                <div
                  key={item.id}
                  className={\`absolute left-2 right-2 \${item.color} border-l-4 rounded-r px-2 py-1 overflow-hidden\`}
                  style={position}
                >
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.startTime} - {item.endTime}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}
