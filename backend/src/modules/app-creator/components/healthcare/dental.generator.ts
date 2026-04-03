/**
 * Dental Component Generators
 */

export interface DentalOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAppointmentCalendarDental(options: DentalOptions = {}): string {
  const { componentName = 'AppointmentCalendarDental', endpoint = '/dental/appointments' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight, Clock, User, Smile } from 'lucide-react';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  patient_name: string;
  patient_id: string;
  dentist_id: string;
  dentist_name: string;
  date: string;
  time: string;
  procedure_type: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  duration_minutes: number;
  notes?: string;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['dental-appointments', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get<Appointment[]>(\`${endpoint}?year=\${year}&month=\${month}\`);
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

  const getStatusColor = (status: Appointment['status']) => {
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
          <Smile className="w-5 h-5 text-cyan-600" />
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

            return (
              <button
                key={i}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                disabled={!day}
                className={\`min-h-[80px] p-1 border rounded-lg text-left transition-colors \${
                  day ? 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700' : 'border-transparent'
                } \${isToday ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300' : ''} \${isSelected ? 'ring-2 ring-cyan-500' : ''}\`}
              >
                {day && (
                  <>
                    <span className={\`text-sm font-medium \${isToday ? 'text-cyan-600' : 'text-gray-900 dark:text-white'}\`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={\`text-xs p-1 rounded truncate \${getStatusColor(apt.status)}\`}
                        >
                          {apt.time} - {apt.procedure_type}
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
              <div key={apt.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{apt.time}</span>
                    <span className="text-gray-500">({apt.duration_minutes} min)</span>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs \${getStatusColor(apt.status)}\`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  {apt.patient_name}
                </div>
                <p className="text-sm text-cyan-600 mt-1">{apt.procedure_type}</p>
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

export function generateBillingStatsDental(options: DentalOptions = {}): string {
  const { componentName = 'BillingStatsDental', endpoint = '/dental/billing/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface BillingStats {
  total_revenue: number;
  monthly_revenue: number;
  outstanding_balance: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  average_invoice_amount: number;
  revenue_trend: number;
  insurance_claims_pending: number;
  insurance_claims_approved: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dental-billing-stats'],
    queryFn: async () => {
      const response = await api.get<BillingStats>('${endpoint}');
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
      color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600',
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insurance Claims</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Claims</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.insurance_claims_pending}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved Claims</p>
            <p className="text-2xl font-bold text-green-600">{stats.insurance_claims_approved}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-cyan-600">{formatCurrency(stats.total_revenue)}</p>
        <p className="text-sm text-gray-500 mt-1">All time</p>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePatientProfileDental(options: DentalOptions = {}): string {
  const { componentName = 'PatientProfileDental', endpoint = '/dental/patients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Phone, Mail, Calendar, MapPin, AlertCircle, Smile, Clock, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface DentalPatient {
  id: string;
  name: string;
  patient_id: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  avatar_url?: string;
  allergies?: string[];
  dental_allergies?: string[];
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  last_visit?: string;
  next_appointment?: string;
  dental_history?: {
    last_cleaning?: string;
    last_xray?: string;
    fillings_count?: number;
    crowns_count?: number;
    root_canals_count?: number;
  };
  notes?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['dental-patient', id],
    queryFn: async () => {
      const response = await api.get<DentalPatient>('${endpoint}/' + id);
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
            <img src={patient.avatar_url} alt={patient.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Smile className="w-10 h-10 text-cyan-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            <p className="text-gray-500">Patient ID: {patient.patient_id || patient.id}</p>
            {patient.date_of_birth && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            to={\`/dental/appointments/new?patient_id=\${patient.id}\`}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Book Appointment
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {patient.email && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              {patient.email}
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              {patient.phone}
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 sm:col-span-2">
              <MapPin className="w-4 h-4" />
              {patient.address}
            </div>
          )}
        </div>

        {(patient.allergies?.length || patient.dental_allergies?.length) && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
              <AlertCircle className="w-5 h-5" />
              Allergies
            </div>
            <div className="flex flex-wrap gap-2">
              {[...(patient.allergies || []), ...(patient.dental_allergies || [])].map((allergy, i) => (
                <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-sm">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {patient.insurance_provider && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Insurance Information</h3>
            <p className="text-gray-600 dark:text-gray-400">{patient.insurance_provider}</p>
            {patient.insurance_id && (
              <p className="text-sm text-gray-500">ID: {patient.insurance_id}</p>
            )}
          </div>
        )}
      </div>

      {patient.dental_history && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            Dental History
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patient.dental_history.last_cleaning && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500">Last Cleaning</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(patient.dental_history.last_cleaning).toLocaleDateString()}
                </p>
              </div>
            )}
            {patient.dental_history.last_xray && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500">Last X-Ray</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(patient.dental_history.last_xray).toLocaleDateString()}
                </p>
              </div>
            )}
            {patient.dental_history.fillings_count !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500">Fillings</p>
                <p className="font-medium text-gray-900 dark:text-white">{patient.dental_history.fillings_count}</p>
              </div>
            )}
            {patient.dental_history.crowns_count !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500">Crowns</p>
                <p className="font-medium text-gray-900 dark:text-white">{patient.dental_history.crowns_count}</p>
              </div>
            )}
            {patient.dental_history.root_canals_count !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500">Root Canals</p>
                <p className="font-medium text-gray-900 dark:text-white">{patient.dental_history.root_canals_count}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {patient.last_visit && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock className="w-4 h-4" />
              Last Visit
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {new Date(patient.last_visit).toLocaleDateString()}
            </p>
          </div>
        )}
        {patient.next_appointment && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Calendar className="w-4 h-4" />
              Next Appointment
            </div>
            <p className="text-lg font-medium text-cyan-600">
              {new Date(patient.next_appointment).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {patient.emergency_contact && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Emergency Contact</h3>
          <p className="text-gray-600 dark:text-gray-400">{patient.emergency_contact.name}</p>
          <p className="text-gray-500 text-sm">{patient.emergency_contact.phone}</p>
          <p className="text-gray-500 text-sm">{patient.emergency_contact.relationship}</p>
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

export function generateDentistProfile(options: DentalOptions = {}): string {
  const { componentName = 'DentistProfile', endpoint = '/dental/dentists' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, MapPin, Clock, Award, Calendar, Phone, Mail, Smile, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

interface Dentist {
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
  procedures_offered?: string[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: dentist, isLoading } = useQuery({
    queryKey: ['dentist', id],
    queryFn: async () => {
      const response = await api.get<Dentist>('${endpoint}/' + id);
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

  if (!dentist) {
    return <div className="text-center py-12 text-gray-500">Dentist not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-8">
        <div className="flex items-center gap-6">
          {dentist.avatar_url ? (
            <img src={dentist.avatar_url} alt={dentist.name} className="w-24 h-24 rounded-full object-cover border-4 border-white" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <Smile className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="text-white">
            <h1 className="text-2xl font-bold">Dr. {dentist.name}</h1>
            <p className="opacity-90">{dentist.specialties?.join(', ') || 'General Dentistry'}</p>
            {dentist.rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{dentist.rating}</span>
                {dentist.reviews_count && <span className="opacity-75">({dentist.reviews_count} reviews)</span>}
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
              {dentist.email && (
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {dentist.email}</p>
              )}
              {dentist.phone && (
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {dentist.phone}</p>
              )}
              {dentist.location && (
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {dentist.location}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Experience</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {dentist.experience_years && (
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {dentist.experience_years} years experience</p>
              )}
              {dentist.education && (
                <p className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {dentist.education}</p>
              )}
              {dentist.qualifications && (
                <p className="flex items-center gap-2"><Award className="w-4 h-4" /> {dentist.qualifications}</p>
              )}
            </div>
          </div>
        </div>

        {dentist.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{dentist.bio}</p>
          </div>
        )}

        {dentist.procedures_offered && dentist.procedures_offered.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Procedures Offered</h3>
            <div className="flex flex-wrap gap-2">
              {dentist.procedures_offered.map((procedure, i) => (
                <span key={i} className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm">
                  {procedure}
                </span>
              ))}
            </div>
          </div>
        )}

        {dentist.certifications && dentist.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {dentist.certifications.map((cert, i) => (
                <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {dentist.languages && dentist.languages.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Languages</h3>
            <p className="text-gray-600 dark:text-gray-400">{dentist.languages.join(', ')}</p>
          </div>
        )}

        <Link
          to={\`/dental/appointments/new?dentist_id=\${dentist.id}\`}
          className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center justify-center gap-2 transition-colors"
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

export function generateDentistSchedule(options: DentalOptions = {}): string {
  const { componentName = 'DentistSchedule', endpoint = '/dental/schedules' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, CheckCircle, XCircle, Smile } from 'lucide-react';
import { api } from '@/lib/api';

interface DaySchedule {
  day: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
  lunch_start?: string;
  lunch_end?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['dentist-schedule', id],
    queryFn: async () => {
      const response = await api.get<DaySchedule[] | Record<string, DaySchedule>>('${endpoint}?dentist_id=' + id);
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
          <Smile className="w-5 h-5 text-cyan-600" />
          <Clock className="w-5 h-5" />
          Working Hours
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {days.map((day) => {
          const daySchedule = getDaySchedule(day);
          const isAvailable = daySchedule && daySchedule.available !== false;

          return (
            <div key={day} className="flex items-center justify-between p-4">
              <span className="font-medium text-gray-900 dark:text-white">{day}</span>
              {isAvailable ? (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {daySchedule?.start_time || '9:00 AM'} - {daySchedule?.end_time || '5:00 PM'}
                    </span>
                  </div>
                  {daySchedule?.lunch_start && daySchedule?.lunch_end && (
                    <span className="text-xs text-gray-500 mt-1">
                      Lunch: {daySchedule.lunch_start} - {daySchedule.lunch_end}
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
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDentalStats(options: DentalOptions = {}): string {
  const { componentName = 'DentalStats', endpoint = '/dental/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, Smile, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface DentalStatsData {
  total_patients: number;
  new_patients_month: number;
  appointments_today: number;
  appointments_week: number;
  completed_procedures_month: number;
  revenue_month: number;
  average_wait_time: number;
  patient_satisfaction: number;
  pending_appointments: number;
  cancelled_appointments_month: number;
  procedures_breakdown: {
    cleanings: number;
    fillings: number;
    crowns: number;
    root_canals: number;
    extractions: number;
    whitening: number;
  };
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dental-stats'],
    queryFn: async () => {
      const response = await api.get<DentalStatsData>('${endpoint}');
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
    { title: 'Total Patients', value: stats.total_patients, icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { title: 'New Patients (Month)', value: stats.new_patients_month, icon: TrendingUp, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    { title: 'Appointments Today', value: stats.appointments_today, icon: Calendar, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' },
    { title: 'Monthly Revenue', value: formatCurrency(stats.revenue_month), icon: DollarSign, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  ];

  const secondaryStats = [
    { title: 'Appointments This Week', value: stats.appointments_week, icon: Calendar },
    { title: 'Completed Procedures', value: stats.completed_procedures_month, icon: CheckCircle },
    { title: 'Avg Wait Time', value: \`\${stats.average_wait_time} min\`, icon: Clock },
    { title: 'Patient Satisfaction', value: \`\${stats.patient_satisfaction}%\`, icon: Smile },
    { title: 'Pending Appointments', value: stats.pending_appointments, icon: AlertCircle },
    { title: 'Cancellations (Month)', value: stats.cancelled_appointments_month, icon: AlertCircle },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {stats.procedures_breakdown && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Smile className="w-5 h-5 text-cyan-600" />
            Procedures Breakdown (This Month)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.procedures_breakdown).map(([procedure, count]) => (
              <div key={procedure} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{procedure.replace('_', ' ')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
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
