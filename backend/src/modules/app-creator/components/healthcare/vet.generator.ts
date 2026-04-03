/**
 * Veterinary Component Generators
 */

export interface VetOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAppointmentCalendarVet(options: VetOptions = {}): string {
  const { componentName = 'AppointmentCalendarVet', endpoint = '/vet/appointments' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Clock, User, PawPrint } from 'lucide-react';
import { api } from '@/lib/api';

interface VetAppointment {
  id: string;
  pet_name: string;
  pet_type: string;
  owner_name: string;
  owner_id: string;
  vet_id: string;
  vet_name: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  duration_minutes: number;
  notes?: string;
  is_emergency?: boolean;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['vet-appointments', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get<VetAppointment[]>(\`${endpoint}?year=\${year}&month=\${month}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, () => null);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getAppointmentsForDay = (day: number) => {
    return appointments?.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === day && aptDate.getMonth() === month && aptDate.getFullYear() === year;
    }) || [];
  };

  const getStatusColor = (status: VetAppointment['status'], isEmergency?: boolean) => {
    if (isEmergency) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    const colors = {
      scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[status] || colors.scheduled;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const selectedAppointments = selectedDay ? getAppointmentsForDay(selectedDay) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-amber-600" />
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 text-gray-500 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...padding, ...days].map((day, i) => {
            const dayAppointments = day ? getAppointmentsForDay(day) : [];
            const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            const isSelected = day === selectedDay;
            const hasEmergency = dayAppointments.some((apt) => apt.is_emergency);

            return (
              <button
                key={i}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                disabled={!day}
                className={\`min-h-[80px] p-1 border rounded-lg text-left transition-colors \${
                  day ? 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700' : 'border-transparent'
                } \${isToday ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300' : ''} \${isSelected ? 'ring-2 ring-amber-500' : ''} \${hasEmergency ? 'border-red-300 dark:border-red-700' : ''}\`}
              >
                {day && (
                  <>
                    <span className={\`text-sm font-medium \${isToday ? 'text-amber-600' : 'text-gray-900 dark:text-white'}\`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={\`text-xs p-1 rounded truncate \${getStatusColor(apt.status, apt.is_emergency)}\`}
                        >
                          {apt.time} - {apt.pet_name}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && selectedAppointments.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Appointments for {monthNames[month]} {selectedDay}
          </h3>
          <div className="space-y-3">
            {selectedAppointments.map((apt) => (
              <div key={apt.id} className={\`p-3 rounded-lg \${apt.is_emergency ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-900/50'}\`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{apt.time}</span>
                    <span className="text-gray-500">({apt.duration_minutes} min)</span>
                    {apt.is_emergency && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">EMERGENCY</span>
                    )}
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs \${getStatusColor(apt.status)}\`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <PawPrint className="w-4 h-4" />
                  {apt.pet_name} ({apt.pet_type})
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  Owner: {apt.owner_name}
                </div>
                <p className="text-sm text-amber-600 mt-1">{apt.reason}</p>
                {apt.notes && <p className="text-sm text-gray-500 mt-1">{apt.notes}</p>}
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

export function generateBillingStatsVet(options: VetOptions = {}): string {
  const { componentName = 'BillingStatsVet', endpoint = '/vet/billing/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, AlertCircle, CheckCircle, PawPrint } from 'lucide-react';
import { api } from '@/lib/api';

interface VetBillingStats {
  total_revenue: number;
  monthly_revenue: number;
  outstanding_balance: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  average_invoice_amount: number;
  revenue_trend: number;
  services_breakdown: {
    consultations: number;
    vaccinations: number;
    surgeries: number;
    medications: number;
    grooming: number;
    boarding: number;
  };
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vet-billing-stats'],
    queryFn: async () => {
      const response = await api.get<VetBillingStats>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">No billing data available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const statCards = [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthly_revenue),
      icon: DollarSign,
      trend: stats.revenue_trend,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(stats.outstanding_balance),
      icon: CreditCard,
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    },
    {
      title: 'Paid Invoices',
      value: stats.paid_invoices.toString(),
      icon: CheckCircle,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    },
    {
      title: 'Pending Invoices',
      value: stats.pending_invoices.toString(),
      icon: Receipt,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    },
    {
      title: 'Overdue Invoices',
      value: stats.overdue_invoices.toString(),
      icon: AlertCircle,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    },
    {
      title: 'Avg Invoice Amount',
      value: formatCurrency(stats.average_invoice_amount),
      icon: Receipt,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-lg \${stat.color}\`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend !== undefined && (
                <div className={\`flex items-center gap-1 text-sm \${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                  {stat.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stat.trend)}%
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {stats.services_breakdown && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-amber-600" />
            Revenue by Service
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.services_breakdown).map(([service, amount]) => (
              <div key={service} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{service}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-amber-600">{formatCurrency(stats.total_revenue)}</p>
        <p className="text-sm text-gray-500 mt-1">All time</p>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePatientProfileVet(options: VetOptions = {}): string {
  const { componentName = 'PatientProfileVet', endpoint = '/vet/patients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Phone, Mail, Calendar, PawPrint, AlertCircle, Scale, Syringe, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface VetPatient {
  id: string;
  name: string;
  species: string;
  breed: string;
  age?: number;
  date_of_birth?: string;
  gender: 'male' | 'female';
  color?: string;
  weight?: number;
  microchip_id?: string;
  avatar_url?: string;
  owner: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  allergies?: string[];
  medical_conditions?: string[];
  vaccinations?: Array<{
    name: string;
    date: string;
    next_due?: string;
  }>;
  last_visit?: string;
  next_appointment?: string;
  notes?: string;
  is_neutered?: boolean;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['vet-patient', id],
    queryFn: async () => {
      const response = await api.get<VetPatient>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center py-12 text-gray-500">Patient not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4 mb-6">
          {patient.avatar_url ? (
            <img src={patient.avatar_url} alt={patient.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <PawPrint className="w-12 h-12 text-amber-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            <p className="text-amber-600 font-medium">{patient.species} - {patient.breed}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {patient.gender && <span className="capitalize">{patient.gender}</span>}
              {patient.age && <span>{patient.age} years old</span>}
              {patient.color && <span>{patient.color}</span>}
              {patient.is_neutered !== undefined && (
                <span>{patient.is_neutered ? 'Neutered/Spayed' : 'Not neutered'}</span>
              )}
            </div>
          </div>
          <Link
            to={\`/vet/appointments/new?patient_id=\${patient.id}\`}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Book Appointment
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {patient.weight && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center gap-3">
              <Scale className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium text-gray-900 dark:text-white">{patient.weight} kg</p>
              </div>
            </div>
          )}
          {patient.date_of_birth && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {patient.microchip_id && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Microchip ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{patient.microchip_id}</p>
              </div>
            </div>
          )}
        </div>

        {(patient.allergies?.length || patient.medical_conditions?.length) && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
              <AlertCircle className="w-5 h-5" />
              Medical Alerts
            </div>
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="mb-2">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Allergies:</p>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.medical_conditions && patient.medical_conditions.length > 0 && (
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {patient.medical_conditions.map((condition, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-sm">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-600" />
          Owner Information
        </h3>
        <div className="space-y-3">
          <p className="font-medium text-gray-900 dark:text-white">{patient.owner.name}</p>
          {patient.owner.email && (
            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" /> {patient.owner.email}
            </p>
          )}
          {patient.owner.phone && (
            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" /> {patient.owner.phone}
            </p>
          )}
          {patient.owner.address && (
            <p className="text-gray-600 dark:text-gray-400">{patient.owner.address}</p>
          )}
        </div>
      </div>

      {patient.vaccinations && patient.vaccinations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-amber-600" />
            Vaccination Records
          </h3>
          <div className="space-y-3">
            {patient.vaccinations.map((vax, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{vax.name}</p>
                  <p className="text-sm text-gray-500">
                    Given: {new Date(vax.date).toLocaleDateString()}
                  </p>
                </div>
                {vax.next_due && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Next Due</p>
                    <p className={\`font-medium \${new Date(vax.next_due) < new Date() ? 'text-red-600' : 'text-green-600'}\`}>
                      {new Date(vax.next_due).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {patient.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h3>
          <p className="text-gray-600 dark:text-gray-400">{patient.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateVetProfile(options: VetOptions = {}): string {
  const { componentName = 'VetProfile', endpoint = '/vet/veterinarians' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, MapPin, Clock, Award, Calendar, Phone, Mail, PawPrint, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

interface Veterinarian {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  specialties: string[];
  qualifications?: string;
  education?: string;
  experience_years?: number;
  bio?: string;
  location?: string;
  rating?: number;
  reviews_count?: number;
  available?: boolean;
  languages?: string[];
  certifications?: string[];
  species_treated?: string[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: vet, isLoading } = useQuery({
    queryKey: ['veterinarian', id],
    queryFn: async () => {
      const response = await api.get<Veterinarian>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!vet) {
    return <div className="text-center py-12 text-gray-500">Veterinarian not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-8">
        <div className="flex items-center gap-6">
          {vet.avatar_url ? (
            <img src={vet.avatar_url} alt={vet.name} className="w-24 h-24 rounded-full object-cover border-4 border-white" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <PawPrint className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="text-white">
            <h1 className="text-2xl font-bold">Dr. {vet.name}</h1>
            <p className="opacity-90">{vet.specialties?.join(', ') || 'General Veterinarian'}</p>
            {vet.rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{vet.rating}</span>
                {vet.reviews_count && <span className="opacity-75">({vet.reviews_count} reviews)</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {vet.email && (
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {vet.email}</p>
              )}
              {vet.phone && (
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {vet.phone}</p>
              )}
              {vet.location && (
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {vet.location}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Experience</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {vet.experience_years && (
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {vet.experience_years} years experience</p>
              )}
              {vet.education && (
                <p className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {vet.education}</p>
              )}
              {vet.qualifications && (
                <p className="flex items-center gap-2"><Award className="w-4 h-4" /> {vet.qualifications}</p>
              )}
            </div>
          </div>
        </div>

        {vet.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{vet.bio}</p>
          </div>
        )}

        {vet.species_treated && vet.species_treated.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Species Treated</h3>
            <div className="flex flex-wrap gap-2">
              {vet.species_treated.map((species, i) => (
                <span key={i} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                  {species}
                </span>
              ))}
            </div>
          </div>
        )}

        {vet.certifications && vet.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {vet.certifications.map((cert, i) => (
                <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {vet.languages && vet.languages.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Languages</h3>
            <p className="text-gray-600 dark:text-gray-400">{vet.languages.join(', ')}</p>
          </div>
        )}

        <Link
          to={\`/vet/appointments/new?vet_id=\${vet.id}\`}
          className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center gap-2 transition-colors"
        >
          <Calendar className="w-5 h-5" />
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateVetSchedule(options: VetOptions = {}): string {
  const { componentName = 'VetSchedule', endpoint = '/vet/schedules' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, CheckCircle, XCircle, PawPrint, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface DaySchedule {
  day: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
  emergency_only?: boolean;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['vet-schedule', id],
    queryFn: async () => {
      const response = await api.get<DaySchedule[] | Record<string, DaySchedule>>('${endpoint}?vet_id=' + id);
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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getDaySchedule = (day: string): DaySchedule | undefined => {
    if (Array.isArray(schedule)) {
      return schedule.find((s) => s.day === day);
    }
    return schedule?.[day.toLowerCase()];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-amber-600" />
          <Clock className="w-5 h-5" />
          Working Hours
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {days.map((day) => {
          const daySchedule = getDaySchedule(day);
          const isAvailable = daySchedule && daySchedule.available !== false;
          const isEmergencyOnly = daySchedule?.emergency_only;

          return (
            <div key={day} className="flex items-center justify-between p-4">
              <span className="font-medium text-gray-900 dark:text-white">{day}</span>
              {isAvailable ? (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {daySchedule?.start_time || '9:00 AM'} - {daySchedule?.end_time || '6:00 PM'}
                    </span>
                  </div>
                  {isEmergencyOnly && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Emergency only
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">Closed</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
        <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          24/7 Emergency services available. Call for emergencies outside regular hours.
        </p>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateVetClinicStats(options: VetOptions = {}): string {
  const { componentName = 'VetClinicStats', endpoint = '/vet/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, PawPrint, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Syringe } from 'lucide-react';
import { api } from '@/lib/api';

interface VetClinicStatsData {
  total_patients: number;
  new_patients_month: number;
  appointments_today: number;
  appointments_week: number;
  emergency_cases_month: number;
  revenue_month: number;
  vaccinations_due: number;
  surgeries_month: number;
  species_breakdown: {
    dogs: number;
    cats: number;
    birds: number;
    reptiles: number;
    small_mammals: number;
    other: number;
  };
  appointment_types: {
    wellness: number;
    sick_visit: number;
    surgery: number;
    emergency: number;
    vaccination: number;
    grooming: number;
  };
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vet-clinic-stats'],
    queryFn: async () => {
      const response = await api.get<VetClinicStatsData>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">No statistics available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const mainStats = [
    { title: 'Total Patients', value: stats.total_patients, icon: PawPrint, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
    { title: 'New Patients', value: stats.new_patients_month, icon: TrendingUp, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    { title: 'Appointments Today', value: stats.appointments_today, icon: Calendar, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { title: 'Monthly Revenue', value: formatCurrency(stats.revenue_month), icon: DollarSign, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  ];

  const secondaryStats = [
    { title: 'Appointments This Week', value: stats.appointments_week, icon: Calendar },
    { title: 'Emergency Cases', value: stats.emergency_cases_month, icon: AlertCircle },
    { title: 'Vaccinations Due', value: stats.vaccinations_due, icon: Syringe },
    { title: 'Surgeries (Month)', value: stats.surgeries_month, icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-lg \${stat.color}\`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {secondaryStats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4"
          >
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {stats.species_breakdown && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-amber-600" />
              Patients by Species
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.species_breakdown).map(([species, count]) => (
                <div key={species} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{species.replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.appointment_types && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Appointment Types (This Month)
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.appointment_types).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateVetSearch(options: VetOptions = {}): string {
  const { componentName = 'VetSearch', endpoint = '/vet/veterinarians' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, MapPin, Star, PawPrint, Filter, X } from 'lucide-react';
import { api } from '@/lib/api';

interface Veterinarian {
  id: string;
  name: string;
  avatar_url?: string;
  specialties: string[];
  location?: string;
  rating?: number;
  reviews_count?: number;
  available?: boolean;
  experience_years?: number;
  species_treated?: string[];
}

const ${componentName}: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: vets, isLoading } = useQuery({
    queryKey: ['veterinarians', searchQuery, selectedSpecialty, selectedSpecies],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedSpecialty) params.append('specialty', selectedSpecialty);
      if (selectedSpecies) params.append('species', selectedSpecies);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<Veterinarian[]>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const specialties = ['General Practice', 'Surgery', 'Dermatology', 'Cardiology', 'Oncology', 'Dentistry', 'Emergency', 'Exotic Animals'];
  const species = ['Dogs', 'Cats', 'Birds', 'Reptiles', 'Small Mammals', 'Exotic'];

  const clearFilters = () => {
    setSelectedSpecialty('');
    setSelectedSpecies('');
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || selectedSpecialty || selectedSpecies;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search veterinarians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={\`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors \${showFilters ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}\`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Species</label>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="">All Species</option>
                {species.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            <button
              onClick={clearFilters}
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vets && vets.length > 0 ? (
            vets.map((vet) => (
              <Link
                key={vet.id}
                to={\`/vet/veterinarians/\${vet.id}\`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all hover:border-amber-300 dark:hover:border-amber-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  {vet.avatar_url ? (
                    <img src={vet.avatar_url} alt={vet.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <PawPrint className="w-8 h-8 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Dr. {vet.name}</h3>
                    <p className="text-sm text-amber-600">{vet.specialties?.join(', ') || 'General Veterinarian'}</p>
                  </div>
                </div>
                {vet.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900 dark:text-white">{vet.rating}</span>
                    {vet.reviews_count && (
                      <span className="text-gray-500 text-sm">({vet.reviews_count} reviews)</span>
                    )}
                  </div>
                )}
                {vet.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4" />
                    {vet.location}
                  </p>
                )}
                {vet.species_treated && vet.species_treated.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {vet.species_treated.slice(0, 3).map((species, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        {species}
                      </span>
                    ))}
                    {vet.species_treated.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">+{vet.species_treated.length - 3}</span>
                    )}
                  </div>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              No veterinarians found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMedicalRecordsVet(options: VetOptions = {}): string {
  const { componentName = 'MedicalRecordsVet', endpoint = '/vet/medical-records' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Calendar, User, Pill, Syringe, Stethoscope, PawPrint } from 'lucide-react';
import { api } from '@/lib/api';

interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'vaccination' | 'surgery' | 'lab_work' | 'follow_up' | 'emergency';
  diagnosis?: string;
  treatment?: string;
  vet_name: string;
  vet_id: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes?: string;
  weight?: number;
  temperature?: number;
  attachments?: string[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: records, isLoading } = useQuery({
    queryKey: ['vet-medical-records', id],
    queryFn: async () => {
      const response = await api.get<MedicalRecord[]>('${endpoint}?patient_id=' + id);
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

  const getTypeIcon = (type: MedicalRecord['type']) => {
    const icons = {
      consultation: Stethoscope,
      vaccination: Syringe,
      surgery: FileText,
      lab_work: FileText,
      follow_up: Calendar,
      emergency: PawPrint,
    };
    return icons[type] || FileText;
  };

  const getTypeColor = (type: MedicalRecord['type']) => {
    const colors = {
      consultation: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      vaccination: 'bg-green-100 dark:bg-green-900/30 text-green-600',
      surgery: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      lab_work: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600',
      follow_up: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
      emergency: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    };
    return colors[type] || colors.consultation;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-amber-600" />
          Medical History
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {records && records.length > 0 ? (
          records.map((record) => {
            const TypeIcon = getTypeIcon(record.type);
            return (
              <div key={record.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${getTypeColor(record.type)}\`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                        {record.type.replace('_', ' ')}
                      </h3>
                      {record.diagnosis && (
                        <p className="text-sm text-amber-600">{record.diagnosis}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>

                {record.treatment && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{record.treatment}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Dr. {record.vet_name}
                  </span>
                  {record.weight && (
                    <span>Weight: {record.weight} kg</span>
                  )}
                  {record.temperature && (
                    <span>Temp: {record.temperature}°F</span>
                  )}
                </div>

                {record.medications && record.medications.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <Pill className="w-4 h-4" />
                      Medications
                    </p>
                    <div className="space-y-2">
                      {record.medications.map((med, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">{med.name}</span>
                          <span className="text-gray-500"> - {med.dosage}, {med.frequency} for {med.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {record.notes && (
                  <p className="text-sm text-gray-500 mt-3 italic">{record.notes}</p>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">No medical records found</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePatientFiltersVet(options: VetOptions = {}): string {
  const { componentName = 'PatientFiltersVet' } = options;

  return `import React from 'react';
import { Search, Filter, X, PawPrint } from 'lucide-react';

interface PatientFiltersVetProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSpecies: string;
  onSpeciesChange: (species: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

const ${componentName}: React.FC<PatientFiltersVetProps> = ({
  searchQuery,
  onSearchChange,
  selectedSpecies,
  onSpeciesChange,
  selectedStatus,
  onStatusChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
}) => {
  const speciesOptions = ['Dog', 'Cat', 'Bird', 'Reptile', 'Rabbit', 'Hamster', 'Guinea Pig', 'Fish', 'Other'];
  const statusOptions = ['Active', 'Inactive', 'Deceased', 'Transferred'];

  const hasActiveFilters = searchQuery || selectedSpecies || selectedStatus;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by pet name or owner..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={\`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors \${showFilters ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}\`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <PawPrint className="w-4 h-4 inline mr-1" />
              Species
            </label>
            <select
              value={selectedSpecies}
              onChange={(e) => onSpeciesChange(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="">All Species</option>
              {speciesOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="">All Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchQuery && (
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-sm flex items-center gap-1">
              Search: {searchQuery}
              <button onClick={() => onSearchChange('')} className="hover:text-amber-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSpecies && (
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-sm flex items-center gap-1">
              Species: {selectedSpecies}
              <button onClick={() => onSpeciesChange('')} className="hover:text-amber-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-sm flex items-center gap-1">
              Status: {selectedStatus}
              <button onClick={() => onStatusChange('')} className="hover:text-amber-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={onClearFilters}
            className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 ml-2"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
