/**
 * Mixed Component Generators
 *
 * Various component generators for different industries.
 */

export interface MixedComponentOptions {
  title?: string;
  entityType?: string;
}

// Appointment Detail
export function generateAppointmentDetailView(options: MixedComponentOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface AppointmentDetail {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  duration: number;
  provider: string;
  service: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export default function AppointmentDetail() {
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);

  useEffect(() => {
    setAppointment({
      id: '1',
      patientName: 'John Smith',
      phone: '555-0123',
      email: 'john@email.com',
      date: '2024-01-20',
      time: '10:00 AM',
      duration: 60,
      provider: 'Dr. Sarah Johnson',
      service: 'Consultation',
      status: 'scheduled',
      notes: 'First-time patient, bring medical records'
    });
  }, []);

  if (!appointment) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  const statusColors: Record<string, string> = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'confirmed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{appointment.patientName}</h2>
          <p className="text-gray-600">{appointment.phone} • {appointment.email}</p>
        </div>
        <span className={\`px-3 py-1 rounded-full text-sm \${statusColors[appointment.status]}\`}>
          {appointment.status.replace('-', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Date</div>
          <div className="font-medium">{new Date(appointment.date).toLocaleDateString()}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Time</div>
          <div className="font-medium">{appointment.time}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Duration</div>
          <div className="font-medium">{appointment.duration} minutes</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Service</div>
          <div className="font-medium">{appointment.service}</div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-500">Provider</div>
        <div className="font-medium">{appointment.provider}</div>
      </div>

      {appointment.notes && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="text-sm font-medium text-yellow-800">Notes</div>
          <div className="text-yellow-700">{appointment.notes}</div>
        </div>
      )}

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Check In</button>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Reschedule</button>
        <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Cancel</button>
      </div>
    </div>
  );
}`;
}

// Contact Info Component
export function generateContactInfo(options: MixedComponentOptions = {}): string {
  return `import React from 'react';

interface ContactInfoProps {
  address?: string;
  phone?: string;
  email?: string;
  hours?: { day: string; hours: string }[];
  socialLinks?: { platform: string; url: string }[];
}

export default function ContactInfo({
  address = '123 Main Street, Suite 100, City, ST 12345',
  phone = '(555) 123-4567',
  email = 'contact@business.com',
  hours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ],
  socialLinks = []
}: ContactInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold">Contact Information</h2>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📍</span>
          <div>
            <div className="font-medium">Address</div>
            <div className="text-gray-600">{address}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-2xl">📞</span>
          <div>
            <div className="font-medium">Phone</div>
            <a href={\`tel:\${phone}\`} className="text-blue-600 hover:underline">{phone}</a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-2xl">✉️</span>
          <div>
            <div className="font-medium">Email</div>
            <a href={\`mailto:\${email}\`} className="text-blue-600 hover:underline">{email}</a>
          </div>
        </div>
      </div>

      {hours.length > 0 && (
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <span>🕐</span> Business Hours
          </h3>
          <div className="space-y-1">
            {hours.map((h, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{h.day}</span>
                <span className="font-medium">{h.hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

// Client Logos Component
export function generateClientLogos(options: MixedComponentOptions = {}): string {
  return `import React from 'react';

interface Client {
  name: string;
  logo: string;
}

interface ClientLogosProps {
  title?: string;
  clients?: Client[];
}

export default function ClientLogos({
  title = 'Trusted by Industry Leaders',
  clients = [
    { name: 'Company A', logo: '/logos/company-a.png' },
    { name: 'Company B', logo: '/logos/company-b.png' },
    { name: 'Company C', logo: '/logos/company-c.png' },
    { name: 'Company D', logo: '/logos/company-d.png' },
    { name: 'Company E', logo: '/logos/company-e.png' },
    { name: 'Company F', logo: '/logos/company-f.png' }
  ]
}: ClientLogosProps) {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-gray-500 mb-8">{title}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {clients.map((client, i) => (
            <div key={i} className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                {client.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

// Contract Renewal Due Component
export function generateContractRenewalDue(options: MixedComponentOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Contract {
  id: string;
  clientName: string;
  contractType: string;
  currentValue: number;
  renewalDate: string;
  daysUntilRenewal: number;
  autoRenew: boolean;
  status: 'active' | 'pending-review' | 'at-risk';
}

export default function ContractRenewalDue() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    setContracts([
      { id: '1', clientName: 'ABC Corporation', contractType: 'Annual Service', currentValue: 24000, renewalDate: '2024-02-01', daysUntilRenewal: 12, autoRenew: true, status: 'active' },
      { id: '2', clientName: 'XYZ Industries', contractType: 'Maintenance', currentValue: 18000, renewalDate: '2024-02-15', daysUntilRenewal: 26, autoRenew: false, status: 'pending-review' },
      { id: '3', clientName: 'Tech Solutions', contractType: 'Support Package', currentValue: 36000, renewalDate: '2024-01-25', daysUntilRenewal: 5, autoRenew: false, status: 'at-risk' },
      { id: '4', clientName: 'Global Enterprises', contractType: 'Full Service', currentValue: 48000, renewalDate: '2024-02-28', daysUntilRenewal: 39, autoRenew: true, status: 'active' }
    ]);
  }, []);

  const statusColors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'pending-review': 'bg-yellow-100 text-yellow-800',
    'at-risk': 'bg-red-100 text-red-800'
  };

  const urgencyColors = (days: number) => {
    if (days <= 7) return 'text-red-600 font-bold';
    if (days <= 14) return 'text-yellow-600 font-medium';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Contracts Due for Renewal</h2>
        <span className="text-sm text-gray-500">{contracts.length} contracts</span>
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className={\`p-4 rounded-lg border \${contract.daysUntilRenewal <= 7 ? 'border-red-200 bg-red-50' : 'border-gray-200'}\`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{contract.clientName}</div>
                <div className="text-sm text-gray-600">{contract.contractType}</div>
                <div className="text-lg font-bold mt-1">\${contract.currentValue.toLocaleString()}/year</div>
              </div>
              <div className="text-right">
                <span className={\`px-2 py-1 rounded-full text-xs \${statusColors[contract.status]}\`}>
                  {contract.status.replace('-', ' ')}
                </span>
                <div className={\`mt-2 \${urgencyColors(contract.daysUntilRenewal)}\`}>
                  {contract.daysUntilRenewal} days left
                </div>
                <div className="text-xs text-gray-500">{new Date(contract.renewalDate).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className={\`text-sm \${contract.autoRenew ? 'text-green-600' : 'text-gray-500'}\`}>
                {contract.autoRenew ? '✓ Auto-renew enabled' : 'Manual renewal required'}
              </span>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Review Contract
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Dentist Schedule Component
export function generateDentistSchedule(options: MixedComponentOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface DentistScheduleSlot {
  id: string;
  time: string;
  patientName?: string;
  procedure?: string;
  duration: number;
  status: 'available' | 'booked' | 'blocked' | 'in-progress' | 'completed';
}

interface Dentist {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  schedule: DentistScheduleSlot[];
}

export default function DentistSchedule() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setDentists([
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        specialty: 'General Dentistry',
        schedule: [
          { id: '1', time: '09:00', patientName: 'John Smith', procedure: 'Cleaning', duration: 30, status: 'completed' },
          { id: '2', time: '09:30', patientName: 'Emily Davis', procedure: 'Filling', duration: 60, status: 'in-progress' },
          { id: '3', time: '10:30', patientName: 'Mike Brown', procedure: 'Checkup', duration: 30, status: 'booked' },
          { id: '4', time: '11:00', duration: 30, status: 'available' },
          { id: '5', time: '11:30', duration: 30, status: 'blocked' }
        ]
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        specialty: 'Orthodontics',
        schedule: [
          { id: '6', time: '09:00', patientName: 'Sarah Wilson', procedure: 'Braces Adjustment', duration: 45, status: 'completed' },
          { id: '7', time: '10:00', patientName: 'Alex Turner', procedure: 'Consultation', duration: 30, status: 'booked' },
          { id: '8', time: '10:30', duration: 30, status: 'available' }
        ]
      }
    ]);
  }, [selectedDate]);

  const statusColors: Record<string, string> = {
    'available': 'bg-green-100 border-green-300 text-green-800',
    'booked': 'bg-blue-100 border-blue-300 text-blue-800',
    'blocked': 'bg-gray-100 border-gray-300 text-gray-500',
    'in-progress': 'bg-yellow-100 border-yellow-300 text-yellow-800',
    'completed': 'bg-gray-50 border-gray-200 text-gray-500'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dentist Schedule</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {dentists.map((dentist) => (
          <div key={dentist.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {dentist.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold">{dentist.name}</div>
                <div className="text-sm text-gray-500">{dentist.specialty}</div>
              </div>
            </div>
            <div className="space-y-2">
              {dentist.schedule.map((slot) => (
                <div key={slot.id} className={\`p-3 rounded-lg border \${statusColors[slot.status]}\`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{slot.time}</div>
                      {slot.patientName && <div className="text-sm">{slot.patientName}</div>}
                      {slot.procedure && <div className="text-xs">{slot.procedure}</div>}
                    </div>
                    <div className="text-right">
                      <span className="text-xs">{slot.duration}min</span>
                      {slot.status === 'available' && (
                        <button className="block mt-1 text-xs px-2 py-1 bg-green-600 text-white rounded">Book</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Event Calendar Component
export function generateEventCalendarView(options: MixedComponentOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: 'meeting' | 'event' | 'deadline' | 'reminder';
  color?: string;
}

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setEvents([
      { id: '1', title: 'Team Meeting', date: '2024-01-20', time: '10:00', endTime: '11:00', type: 'meeting' },
      { id: '2', title: 'Product Launch', date: '2024-01-22', time: '14:00', type: 'event' },
      { id: '3', title: 'Project Deadline', date: '2024-01-25', time: '17:00', type: 'deadline' },
      { id: '4', title: 'Client Call', date: '2024-01-20', time: '15:00', endTime: '15:30', type: 'meeting' }
    ]);
  }, []);

  const typeColors: Record<string, string> = {
    'meeting': 'bg-blue-100 border-l-4 border-blue-500',
    'event': 'bg-purple-100 border-l-4 border-purple-500',
    'deadline': 'bg-red-100 border-l-4 border-red-500',
    'reminder': 'bg-yellow-100 border-l-4 border-yellow-500'
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = \`\${currentDate.getFullYear()}-\${String(currentDate.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded">←</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-blue-600 text-white rounded">Today</button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">{day}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} className={\`min-h-[80px] p-1 border rounded \${day ? 'bg-white' : 'bg-gray-50'}\`}>
            {day && (
              <>
                <div className="text-sm font-medium text-right">{day}</div>
                <div className="space-y-1 mt-1">
                  {getEventsForDay(day).slice(0, 2).map(event => (
                    <div key={event.id} className={\`text-xs p-1 rounded \${typeColors[event.type]}\`}>
                      {event.title}
                    </div>
                  ))}
                  {getEventsForDay(day).length > 2 && (
                    <div className="text-xs text-gray-500">+{getEventsForDay(day).length - 2} more</div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`;
}
