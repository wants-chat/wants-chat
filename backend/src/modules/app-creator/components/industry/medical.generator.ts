/**
 * Medical/Healthcare Industry Component Generators
 *
 * Components for healthcare, dental, veterinary, and rehabilitation facilities.
 */

export interface MedicalOptions {
  componentName?: string;
  title?: string;
  endpoint?: string;
}

// Patient Filters Component
export function generatePatientFilters(options: MedicalOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface PatientFilters {
  search: string;
  status: string;
  provider: string;
  insurance: string;
  dateRange: { start: string; end: string };
}

interface PatientFiltersProps {
  onFilter?: (filters: PatientFilters) => void;
}

export default function PatientFilters({ onFilter }: PatientFiltersProps) {
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'all',
    provider: 'all',
    insurance: 'all',
    dateRange: { start: '', end: '' }
  });

  const handleChange = (key: keyof PatientFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name, ID, or phone..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Patients</option>
            <option value="active">Active</option>
            <option value="scheduled">Has Appointment</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
          <select
            value={filters.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Providers</option>
            <option value="dr-smith">Dr. Smith</option>
            <option value="dr-jones">Dr. Jones</option>
            <option value="dr-wilson">Dr. Wilson</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance</label>
          <select
            value={filters.insurance}
            onChange={(e) => handleChange('insurance', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Insurance</option>
            <option value="medicare">Medicare</option>
            <option value="medicaid">Medicaid</option>
            <option value="private">Private</option>
            <option value="self-pay">Self Pay</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Visit</label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );
}`;
}

// Patient Filters Vet Component
export function generatePatientFiltersVet(options: MedicalOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface VetPatientFilters {
  search: string;
  species: string;
  status: string;
  vet: string;
  visitType: string;
}

interface PatientFiltersVetProps {
  onFilter?: (filters: VetPatientFilters) => void;
}

export default function PatientFiltersVet({ onFilter }: PatientFiltersVetProps) {
  const [filters, setFilters] = useState<VetPatientFilters>({
    search: '',
    species: 'all',
    status: 'all',
    vet: 'all',
    visitType: 'all'
  });

  const handleChange = (key: keyof VetPatientFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by pet name or owner..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Species</label>
          <select
            value={filters.species}
            onChange={(e) => handleChange('species', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Species</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="bird">Birds</option>
            <option value="exotic">Exotic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="hospitalized">Hospitalized</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Veterinarian</label>
          <select
            value={filters.vet}
            onChange={(e) => handleChange('vet', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Vets</option>
            <option value="dr-martin">Dr. Martin</option>
            <option value="dr-chen">Dr. Chen</option>
            <option value="dr-patel">Dr. Patel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visit Type</label>
          <select
            value={filters.visitType}
            onChange={(e) => handleChange('visitType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Types</option>
            <option value="wellness">Wellness</option>
            <option value="sick">Sick Visit</option>
            <option value="surgery">Surgery</option>
            <option value="vaccination">Vaccination</option>
          </select>
        </div>
      </div>
    </div>
  );
}`;
}

// Patient Profile Dental Component
export function generatePatientProfileDental(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Phone, Mail, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';

interface PatientProfileDentalProps {
  patientId?: string;
}

export default function PatientProfileDental({ patientId }: PatientProfileDentalProps) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ['dental-patient', patientId],
    queryFn: async () => ({
      id: patientId || '1',
      name: 'Jane Smith',
      dob: '1985-06-15',
      phone: '555-0123',
      email: 'jane.smith@email.com',
      insurance: 'Delta Dental PPO',
      memberId: 'DD123456789',
      nextAppointment: '2024-02-15T10:00:00',
      lastVisit: '2024-01-10',
      balance: 150.00,
      allergies: ['Penicillin', 'Latex'],
      conditions: ['Bruxism', 'Sensitive teeth'],
      primaryDentist: 'Dr. Robert Williams',
      treatmentPlan: [
        { procedure: 'Crown - Tooth #14', status: 'scheduled', date: '2024-02-15' },
        { procedure: 'Filling - Tooth #19', status: 'completed', date: '2024-01-10' }
      ]
    })
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{patient?.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                DOB: {patient?.dob}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {patient?.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {patient?.email}
              </span>
            </div>
          </div>
          {patient?.balance > 0 && (
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">Balance Due</span>
              <div className="text-xl font-bold text-red-600">\${patient.balance.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Insurance
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="font-medium">{patient?.insurance}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Member ID: {patient?.memberId}</div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Allergies & Conditions
          </h3>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {patient?.allergies.map((allergy, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm rounded">
                  {allergy}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {patient?.conditions.map((condition, idx) => (
                <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded">
                  {condition}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Treatment Plan
          </h3>
          <div className="space-y-2">
            {patient?.treatmentPlan.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{item.procedure}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.date}</div>
                </div>
                <span className={\`px-2 py-1 text-xs rounded \${item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}\`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Patient Profile Rehab Component
export function generatePatientProfileRehab(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Phone, Mail, Calendar, Activity, Target, TrendingUp } from 'lucide-react';

interface PatientProfileRehabProps {
  patientId?: string;
}

export default function PatientProfileRehab({ patientId }: PatientProfileRehabProps) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ['rehab-patient', patientId],
    queryFn: async () => ({
      id: patientId || '1',
      name: 'Michael Johnson',
      dob: '1978-03-22',
      phone: '555-0456',
      email: 'm.johnson@email.com',
      admissionDate: '2024-01-05',
      condition: 'Post-Knee Replacement Surgery',
      therapist: 'Dr. Sarah Martinez',
      sessionsCompleted: 12,
      sessionsTotal: 24,
      nextSession: '2024-02-01T14:00:00',
      goals: [
        { goal: 'Walk 100 meters unassisted', progress: 75, status: 'in-progress' },
        { goal: 'Full range of motion', progress: 60, status: 'in-progress' },
        { goal: 'Climb stairs independently', progress: 40, status: 'in-progress' }
      ],
      painLevel: 3,
      mobilityScore: 7,
      notes: 'Patient showing good progress. Increase exercise intensity next session.'
    })
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  const progressPercent = ((patient?.sessionsCompleted || 0) / (patient?.sessionsTotal || 1)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <User className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{patient?.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{patient?.condition}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Admitted: {patient?.admissionDate}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Therapist: {patient?.therapist}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Treatment Progress</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Sessions: {patient?.sessionsCompleted} / {patient?.sessionsTotal}</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div className="bg-green-500 rounded-full h-3 transition-all" style={{ width: \`\${progressPercent}%\` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">Pain Level</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{patient?.painLevel}/10</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Mobility Score</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{patient?.mobilityScore}/10</div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recovery Goals
          </h3>
          <div className="space-y-3">
            {patient?.goals.map((goal, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{goal.goal}</span>
                  <span className="text-sm text-gray-500">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: \`\${goal.progress}%\` }} />
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

// Patient Profile Vet Component
export function generatePatientProfileVet(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Calendar, Syringe, AlertCircle, FileText, Scale } from 'lucide-react';

interface PatientProfileVetProps {
  patientId?: string;
}

export default function PatientProfileVet({ patientId }: PatientProfileVetProps) {
  const { data: pet, isLoading } = useQuery({
    queryKey: ['vet-patient', patientId],
    queryFn: async () => ({
      id: patientId || '1',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: '5 years',
      weight: '32 kg',
      ownerName: 'John Smith',
      ownerPhone: '555-0123',
      microchip: '985121012345678',
      lastVisit: '2024-01-15',
      nextVaccination: '2024-07-15',
      allergies: ['Chicken'],
      conditions: ['Hip Dysplasia - Mild'],
      medications: [
        { name: 'Joint Supplement', dosage: '1 tablet daily', status: 'active' }
      ],
      vaccinations: [
        { name: 'Rabies', date: '2023-07-15', dueDate: '2024-07-15' },
        { name: 'DHPP', date: '2023-10-01', dueDate: '2024-10-01' }
      ]
    })
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-3xl">
            🐕
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{pet?.name}</h2>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
                {pet?.species}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{pet?.breed} • {pet?.age}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Scale className="w-4 h-4" />
                {pet?.weight}
              </span>
              <span className="flex items-center gap-1">
                Microchip: {pet?.microchip}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Owner</div>
          <div className="font-medium text-gray-900 dark:text-white">{pet?.ownerName}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{pet?.ownerPhone}</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {pet?.allergies.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Allergies
            </h3>
            <div className="flex flex-wrap gap-2">
              {pet.allergies.map((allergy, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Syringe className="w-4 h-4" />
            Vaccinations
          </h3>
          <div className="space-y-2">
            {pet?.vaccinations.map((vax, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{vax.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Last: {vax.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Due</div>
                  <div className="font-medium text-orange-600 dark:text-orange-400">{vax.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Current Medications
          </h3>
          <div className="space-y-2">
            {pet?.medications.map((med, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{med.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{med.dosage}</div>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                  {med.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Patient Progress Overview Component
export function generatePatientProgressOverview(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Activity, Target, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

interface PatientProgressOverviewProps {
  patientId?: string;
}

export default function PatientProgressOverview({ patientId }: PatientProgressOverviewProps) {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['patient-progress', patientId],
    queryFn: async () => ({
      overallProgress: 68,
      sessionsCompleted: 15,
      sessionsRemaining: 9,
      metrics: [
        { name: 'Pain Level', current: 3, previous: 6, unit: '/10', trend: 'down' },
        { name: 'Mobility', current: 7, previous: 5, unit: '/10', trend: 'up' },
        { name: 'Strength', current: 65, previous: 50, unit: '%', trend: 'up' },
        { name: 'Flexibility', current: 72, previous: 60, unit: '%', trend: 'up' }
      ],
      milestones: [
        { name: 'Initial Assessment', date: '2024-01-05', completed: true },
        { name: 'Walk Without Aid', date: '2024-01-20', completed: true },
        { name: 'Climb Stairs', date: '2024-02-01', completed: false },
        { name: 'Return to Normal Activity', date: '2024-02-15', completed: false }
      ]
    })
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-500" />
          Recovery Progress
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-green-600 dark:text-green-400 text-4xl font-bold">{progress?.overallProgress}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-bold">{progress?.sessionsCompleted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-orange-600 dark:text-orange-400 text-4xl font-bold">{progress?.sessionsRemaining}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Remaining</div>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {progress?.metrics.map((metric, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">{metric.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.current}{metric.unit}
                </span>
                <span className={\`flex items-center text-sm \${metric.trend === 'up' ? 'text-green-500' : 'text-green-500'}\`}>
                  {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Previous: {metric.previous}{metric.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Recovery Milestones
        </h3>
        <div className="space-y-4">
          {progress?.milestones.map((milestone, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                milestone.completed
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }\`}>
                {milestone.completed ? '✓' : (idx + 1)}
              </div>
              <div className="flex-1">
                <div className={\`font-medium \${milestone.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}\`}>
                  {milestone.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {milestone.date}
                </div>
              </div>
              {milestone.completed && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                  Completed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

// Vet Profile Component
export function generateVetProfile(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Stethoscope, Phone, Mail, Award, Calendar, Clock, Star } from 'lucide-react';

interface VetProfileProps {
  vetId?: string;
}

export default function VetProfile({ vetId }: VetProfileProps) {
  const { data: vet, isLoading } = useQuery({
    queryKey: ['vet-profile', vetId],
    queryFn: async () => ({
      id: vetId || '1',
      name: 'Dr. Sarah Chen',
      title: 'DVM, DACVIM',
      specialties: ['Internal Medicine', 'Cardiology', 'Emergency Care'],
      photo: null,
      phone: '555-0199',
      email: 'dr.chen@vetclinic.com',
      yearsExperience: 12,
      education: 'Cornell University College of Veterinary Medicine',
      bio: 'Dr. Chen specializes in complex internal medicine cases and has a particular interest in cardiac conditions in dogs and cats.',
      rating: 4.9,
      reviewCount: 156,
      availableSlots: [
        { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Wednesday', hours: '9:00 AM - 1:00 PM' },
        { day: 'Friday', hours: '9:00 AM - 5:00 PM' }
      ],
      languages: ['English', 'Mandarin']
    })
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
            <Stethoscope className="w-12 h-12 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{vet?.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{vet?.title}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-medium">{vet?.rating}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">({vet?.reviewCount} reviews)</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-300">{vet?.yearsExperience} years experience</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <a href={\`tel:\${vet?.phone}\`} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                <Phone className="w-4 h-4" />
                {vet?.phone}
              </a>
              <a href={\`mailto:\${vet?.email}\`} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                <Mail className="w-4 h-4" />
                {vet?.email}
              </a>
            </div>
          </div>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Book Appointment
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Specialties
          </h3>
          <div className="flex flex-wrap gap-2">
            {vet?.specialties.map((specialty, idx) => (
              <span key={idx} className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full text-sm">
                {specialty}
              </span>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 text-sm">{vet?.bio}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Availability
          </h3>
          <div className="space-y-2">
            {vet?.availableSlots.map((slot, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium text-gray-900 dark:text-white">{slot.day}</span>
                <span className="text-gray-600 dark:text-gray-300 text-sm">{slot.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Vet Schedule Component
export function generateVetSchedule(options: MedicalOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  petName: string;
  ownerName: string;
  type: string;
  species: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
  notes?: string;
}

interface VetScheduleProps {
  vetId?: string;
}

export default function VetSchedule({ vetId }: VetScheduleProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setAppointments([
      { id: '1', time: '09:00', petName: 'Max', ownerName: 'John Smith', type: 'Annual Checkup', species: 'Dog', status: 'completed' },
      { id: '2', time: '09:30', petName: 'Whiskers', ownerName: 'Sarah Johnson', type: 'Vaccination', species: 'Cat', status: 'completed' },
      { id: '3', time: '10:00', petName: 'Buddy', ownerName: 'Mike Wilson', type: 'Sick Visit', species: 'Dog', status: 'in-progress' },
      { id: '4', time: '10:30', petName: 'Luna', ownerName: 'Emily Davis', type: 'Surgery Follow-up', species: 'Cat', status: 'checked-in' },
      { id: '5', time: '11:00', petName: 'Charlie', ownerName: 'Chris Brown', type: 'Dental Cleaning', species: 'Dog', status: 'scheduled' },
      { id: '6', time: '14:00', petName: 'Bella', ownerName: 'Amanda Lee', type: 'Wellness Exam', species: 'Dog', status: 'scheduled' }
    ]);
  }, [selectedDate]);

  const statusColors: Record<string, string> = {
    'scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'checked-in': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'in-progress': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };

  const speciesEmoji: Record<string, string> = {
    'Dog': '🐕',
    'Cat': '🐈',
    'Bird': '🐦',
    'Rabbit': '🐇'
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Today's Schedule
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium min-w-[150px] text-center">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {appointments.map((apt) => (
          <div key={apt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="text-lg font-mono font-bold text-gray-400 w-14">{apt.time}</div>
                <div className="text-2xl">{speciesEmoji[apt.species] || '🐾'}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{apt.petName}</span>
                    <span className="text-gray-500 dark:text-gray-400">({apt.species})</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{apt.type}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {apt.ownerName}
                  </div>
                </div>
              </div>
              <span className={\`px-2 py-1 text-xs rounded-full \${statusColors[apt.status]}\`}>
                {apt.status.replace('-', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Treatment History Component
export function generateTreatmentHistory(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Calendar, User, Pill, Stethoscope, ChevronRight } from 'lucide-react';

interface TreatmentHistoryProps {
  patientId?: string;
}

export default function TreatmentHistory({ patientId }: TreatmentHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['treatment-history', patientId],
    queryFn: async () => ([
      {
        id: '1',
        date: '2024-01-15',
        type: 'Office Visit',
        provider: 'Dr. Chen',
        diagnosis: 'Annual Wellness Exam',
        treatment: 'Vaccines updated, heartworm prevention prescribed',
        notes: 'Patient in good health. Weight stable.',
        medications: ['Heartgard Plus - Monthly']
      },
      {
        id: '2',
        date: '2023-11-20',
        type: 'Sick Visit',
        provider: 'Dr. Martin',
        diagnosis: 'Ear Infection (Otitis Externa)',
        treatment: 'Ear cleaning, prescribed Otomax',
        notes: 'Follow up in 2 weeks if not improved',
        medications: ['Otomax - Twice daily for 14 days']
      },
      {
        id: '3',
        date: '2023-08-10',
        type: 'Surgery',
        provider: 'Dr. Chen',
        diagnosis: 'Dental Disease',
        treatment: 'Dental cleaning under anesthesia, 2 extractions',
        notes: 'Recovered well from anesthesia. Soft food for 1 week.',
        medications: ['Carprofen - Pain relief for 5 days', 'Antibiotics - 7 days']
      }
    ])
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  const typeIcons: Record<string, React.ReactNode> = {
    'Office Visit': <Stethoscope className="w-5 h-5" />,
    'Sick Visit': <FileText className="w-5 h-5" />,
    'Surgery': <Pill className="w-5 h-5" />
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Treatment History
        </h2>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {history?.map((record) => (
          <div key={record.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                  {typeIcons[record.type] || <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{record.type}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1">{record.diagnosis}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" />
                    {record.provider}
                  </div>
                  {record.medications.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {record.medications.map((med, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                          {med}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Dentist Profile Component
export function generateDentistProfile(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Phone, Mail, Award, Calendar, Star, Clock } from 'lucide-react';

interface DentistProfileProps {
  dentistId?: string;
}

export default function DentistProfile({ dentistId }: DentistProfileProps) {
  const { data: dentist, isLoading } = useQuery({
    queryKey: ['dentist-profile', dentistId],
    queryFn: async () => ({
      id: dentistId || '1',
      name: 'Dr. Robert Williams',
      title: 'DDS, FAGD',
      specialties: ['General Dentistry', 'Cosmetic Dentistry', 'Implants'],
      photo: null,
      phone: '555-0188',
      email: 'dr.williams@dentalcare.com',
      yearsExperience: 15,
      education: 'NYU College of Dentistry',
      bio: 'Dr. Williams is dedicated to providing comfortable, patient-centered dental care using the latest techniques and technology.',
      rating: 4.8,
      reviewCount: 234,
      languages: ['English', 'Spanish'],
      insuranceAccepted: ['Delta Dental', 'Cigna', 'MetLife', 'Aetna']
    })
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dentist?.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{dentist?.title}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-medium">{dentist?.rating}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">({dentist?.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {dentist?.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {dentist?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {dentist?.specialties.map((specialty, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Insurance Accepted</h3>
            <div className="flex flex-wrap gap-2">
              {dentist?.insuranceAccepted.map((ins, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                  {ins}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">{dentist?.bio}</p>
        </div>

        <button className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Appointment
        </button>
      </div>
    </div>
  );
}`;
}

// Appointment Detail Component
export function generateAppointmentDetail(options: MedicalOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, MapPin, FileText, Phone, AlertCircle } from 'lucide-react';

interface AppointmentDetailProps {
  appointmentId?: string;
}

export default function AppointmentDetail({ appointmentId }: AppointmentDetailProps) {
  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment-detail', appointmentId],
    queryFn: async () => ({
      id: appointmentId || '1',
      patientName: 'Jane Smith',
      patientPhone: '555-0123',
      provider: 'Dr. Robert Williams',
      date: '2024-02-15',
      time: '10:00 AM',
      duration: 60,
      type: 'Crown Placement',
      status: 'confirmed',
      location: 'Room 3',
      notes: 'Patient requested numbing gel before anesthesia',
      preInstructions: 'Please arrive 15 minutes early. Avoid eating 2 hours before appointment.',
      estimatedCost: 850,
      insuranceCoverage: 600
    })
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{appointment?.type}</h2>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              {appointment?.status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <Calendar className="w-6 h-6 text-blue-500" />
              {new Date(appointment?.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300 flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4" />
              {appointment?.time}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Patient</div>
                <div className="font-medium text-gray-900 dark:text-white">{appointment?.patientName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{appointment?.patientPhone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Provider</div>
                <div className="font-medium text-gray-900 dark:text-white">{appointment?.provider}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                <div className="font-medium text-gray-900 dark:text-white">{appointment?.location}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Estimate</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Procedure Cost</span>
                <span className="font-medium">\${appointment?.estimatedCost}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Insurance Coverage</span>
                <span>-\${appointment?.insuranceCoverage}</span>
              </div>
              <div className="border-t dark:border-gray-600 pt-2 flex justify-between font-bold">
                <span>Your Cost</span>
                <span>\${(appointment?.estimatedCost || 0) - (appointment?.insuranceCoverage || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {appointment?.preInstructions && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Pre-Appointment Instructions</h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{appointment.preInstructions}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Reschedule
          </button>
          <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
}`;
}
