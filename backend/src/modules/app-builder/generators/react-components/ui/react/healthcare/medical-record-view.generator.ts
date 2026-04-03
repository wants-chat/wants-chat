/**
 * Medical Record View Generator
 *
 * Generates a medical record display component with history and details.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generateMedicalRecordView = (
  resolved: ResolvedComponent,
  variant: 'full' | 'summary' | 'timeline' = 'full'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'record';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'record';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'medical-records'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'medicalRecords';

  if (variant === 'timeline') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface MedicalEvent {
  id: string;
  date: string;
  type: 'visit' | 'test' | 'prescription' | 'procedure' | 'vaccination';
  title: string;
  provider?: string;
  notes?: string;
}

interface MedicalRecordViewProps {
  ${dataName}?: { patientName: string; events: MedicalEvent[] };
  patientName?: string;
  events?: MedicalEvent[];
  onEventClick?: (event: MedicalEvent) => void;
}

export const MedicalRecordView: React.FC<MedicalRecordViewProps> = ({
  ${dataName}: propData,
  patientName: propPatientName,
  events: propEvents,
  onEventClick,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propEvents,
    retry: 1,
  });

  const recordData = propData || fetchedData || {};
  const patientName = propPatientName || recordData.patientName || 'Patient';
  const events = propEvents || recordData.events || [];

  if (isLoading && !propData && !propEvents) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const typeIcons = {
    visit: '🩺',
    test: '🔬',
    prescription: '💊',
    procedure: '⚕️',
    vaccination: '💉',
  };

  const typeColors = {
    visit: 'bg-blue-100 border-blue-500',
    test: 'bg-purple-100 border-purple-500',
    prescription: 'bg-green-100 border-green-500',
    procedure: 'bg-red-100 border-red-500',
    vaccination: 'bg-amber-100 border-amber-500',
  };

  return (
    <div className="${styles.card} rounded-xl p-6 ${styles.cardShadow}">
      <h2 className="${styles.textPrimary} text-xl font-bold mb-6">
        Medical History - {patientName}
      </h2>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 ${styles.background}" />

        <div className="space-y-6">
          {events.map((event, idx) => (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className="relative pl-10 cursor-pointer group"
            >
              <div className={\`absolute left-2 w-5 h-5 rounded-full border-2 \${typeColors[event.type]} flex items-center justify-center text-xs\`}>
                {typeIcons[event.type]}
              </div>

              <div className="${styles.card} p-4 rounded-lg border ${styles.cardBorder} group-hover:${styles.cardHoverShadow} transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="${styles.textPrimary} font-medium">{event.title}</h3>
                  <span className="${styles.textMuted} text-sm">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                {event.provider && (
                  <p className="${styles.textSecondary} text-sm">Dr. {event.provider}</p>
                )}
                {event.notes && (
                  <p className="${styles.textMuted} text-sm mt-2 line-clamp-2">{event.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordView;
`;
  }

  if (variant === 'summary') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface MedicalRecordViewProps {
  ${dataName}?: any;
  patientId?: string;
  patientName?: string;
  lastVisit?: string;
  nextAppointment?: string;
  primaryDoctor?: string;
  allergies?: string[];
  medications?: Array<{ name: string; dosage: string }>;
  conditions?: string[];
  recentVitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
  };
  onViewFull?: () => void;
}

export const MedicalRecordView: React.FC<MedicalRecordViewProps> = ({
  ${dataName}: propData,
  patientId: propPatientId,
  patientName: propPatientName,
  lastVisit: propLastVisit,
  nextAppointment: propNextAppointment,
  primaryDoctor: propPrimaryDoctor,
  allergies: propAllergies,
  medications: propMedications,
  conditions: propConditions,
  recentVitals: propRecentVitals,
  onViewFull,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propPatientId,
    retry: 1,
  });

  const recordData = propData || fetchedData || {};
  const patientId = propPatientId || recordData.patientId || '';
  const patientName = propPatientName || recordData.patientName || 'Patient';
  const lastVisit = propLastVisit || recordData.lastVisit;
  const nextAppointment = propNextAppointment || recordData.nextAppointment;
  const primaryDoctor = propPrimaryDoctor || recordData.primaryDoctor;
  const allergies = propAllergies || recordData.allergies || [];
  const medications = propMedications || recordData.medications || [];
  const conditions = propConditions || recordData.conditions || [];
  const recentVitals = propRecentVitals || recordData.recentVitals;

  if (isLoading && !propData && !propPatientId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl p-6 ${styles.cardShadow}">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="${styles.textPrimary} text-xl font-bold">{patientName}</h2>
          <p className="${styles.textMuted} text-sm">ID: {patientId}</p>
        </div>
        <button
          onClick={onViewFull}
          className="${styles.primary} text-sm font-medium hover:underline"
        >
          View Full Record
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="${styles.background} rounded-lg p-3">
          <p className="${styles.textMuted} text-xs">Last Visit</p>
          <p className="${styles.textPrimary} font-medium">{lastVisit || 'N/A'}</p>
        </div>
        <div className="${styles.background} rounded-lg p-3">
          <p className="${styles.textMuted} text-xs">Next Appointment</p>
          <p className="${styles.textPrimary} font-medium">{nextAppointment || 'None'}</p>
        </div>
        <div className="${styles.background} rounded-lg p-3">
          <p className="${styles.textMuted} text-xs">Primary Doctor</p>
          <p className="${styles.textPrimary} font-medium">{primaryDoctor || 'N/A'}</p>
        </div>
        <div className="${styles.background} rounded-lg p-3">
          <p className="${styles.textMuted} text-xs">Active Conditions</p>
          <p className="${styles.textPrimary} font-medium">{conditions.length}</p>
        </div>
      </div>

      {recentVitals && (
        <div className="mb-6">
          <h3 className="${styles.textSecondary} text-sm font-medium mb-3">Recent Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentVitals.bloodPressure && (
              <div className="text-center p-3 border ${styles.cardBorder} rounded-lg">
                <p className="${styles.textMuted} text-xs">Blood Pressure</p>
                <p className="${styles.textPrimary} font-bold text-lg">{recentVitals.bloodPressure}</p>
              </div>
            )}
            {recentVitals.heartRate && (
              <div className="text-center p-3 border ${styles.cardBorder} rounded-lg">
                <p className="${styles.textMuted} text-xs">Heart Rate</p>
                <p className="${styles.textPrimary} font-bold text-lg">{recentVitals.heartRate} bpm</p>
              </div>
            )}
            {recentVitals.temperature && (
              <div className="text-center p-3 border ${styles.cardBorder} rounded-lg">
                <p className="${styles.textMuted} text-xs">Temperature</p>
                <p className="${styles.textPrimary} font-bold text-lg">{recentVitals.temperature}F</p>
              </div>
            )}
            {recentVitals.weight && (
              <div className="text-center p-3 border ${styles.cardBorder} rounded-lg">
                <p className="${styles.textMuted} text-xs">Weight</p>
                <p className="${styles.textPrimary} font-bold text-lg">{recentVitals.weight} lbs</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allergies.length > 0 && (
          <div>
            <h3 className="${styles.textSecondary} text-sm font-medium mb-2">Allergies</h3>
            <div className="flex flex-wrap gap-1">
              {allergies.map((allergy, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}
        {medications.length > 0 && (
          <div>
            <h3 className="${styles.textSecondary} text-sm font-medium mb-2">Current Medications</h3>
            <ul className="space-y-1">
              {medications.slice(0, 3).map((med, idx) => (
                <li key={idx} className="${styles.textPrimary} text-sm">
                  {med.name} <span className="${styles.textMuted}">({med.dosage})</span>
                </li>
              ))}
              {medications.length > 3 && (
                <li className="${styles.textMuted} text-sm">+{medications.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
        {conditions.length > 0 && (
          <div>
            <h3 className="${styles.textSecondary} text-sm font-medium mb-2">Conditions</h3>
            <ul className="space-y-1">
              {conditions.map((condition, idx) => (
                <li key={idx} className="${styles.textPrimary} text-sm">{condition}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordView;
`;
  }

  // Default full variant
  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Vital {
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  active: boolean;
}

interface LabResult {
  id: string;
  date: string;
  testName: string;
  result: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
}

interface Visit {
  id: string;
  date: string;
  type: string;
  provider: string;
  diagnosis?: string;
  notes: string;
}

interface MedicalRecordViewProps {
  ${dataName}?: any;
  patientId?: string;
  patientName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: Medication[];
  vitals?: Vital[];
  labResults?: LabResult[];
  visits?: Visit[];
  onAddNote?: () => void;
  onPrintRecord?: () => void;
}

export const MedicalRecordView: React.FC<MedicalRecordViewProps> = ({
  ${dataName}: propData,
  patientId: propPatientId,
  patientName: propPatientName,
  dateOfBirth: propDateOfBirth,
  gender: propGender,
  bloodType: propBloodType,
  allergies: propAllergies,
  conditions: propConditions,
  medications: propMedications,
  vitals: propVitals,
  labResults: propLabResults,
  visits: propVisits,
  onAddNote,
  onPrintRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'labs' | 'medications' | 'visits'>('overview');

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propPatientId,
    retry: 1,
  });

  const recordData = propData || fetchedData || {};
  const patientId = propPatientId || recordData.patientId || '';
  const patientName = propPatientName || recordData.patientName || 'Patient';
  const dateOfBirth = propDateOfBirth || recordData.dateOfBirth || '';
  const gender = propGender || recordData.gender || '';
  const bloodType = propBloodType || recordData.bloodType;
  const allergies = propAllergies || recordData.allergies || [];
  const conditions = propConditions || recordData.conditions || [];
  const medications = propMedications || recordData.medications || [];
  const vitals = propVitals || recordData.vitals || [];
  const labResults = propLabResults || recordData.labResults || [];
  const visits = propVisits || recordData.visits || [];

  if (isLoading && !propData && !propPatientId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'vitals', label: 'Vitals' },
    { id: 'labs', label: 'Lab Results' },
    { id: 'medications', label: 'Medications' },
    { id: 'visits', label: 'Visit History' },
  ];

  const latestVitals = vitals[0];

  return (
    <div className="${styles.card} rounded-2xl overflow-hidden ${styles.cardShadow}">
      {/* Patient Header */}
      <div className="${styles.primary} p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{patientName}</h1>
            <p className="text-white/80">
              DOB: {new Date(dateOfBirth).toLocaleDateString()} {gender}
              {bloodType && \` Blood Type: \${bloodType}\`}
            </p>
            <p className="text-white/60 text-sm mt-1">MRN: {patientId}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAddNote}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Add Note
            </button>
            <button
              onClick={onPrintRecord}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Print
            </button>
          </div>
        </div>

        {/* Alerts */}
        {allergies.length > 0 && (
          <div className="mt-4 p-3 bg-red-500/20 rounded-lg">
            <p className="text-sm font-medium">Allergies: {allergies.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b ${styles.cardBorder}">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={\`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors \${
                activeTab === tab.id
                  ? '${styles.primary} border-b-2 border-current'
                  : '${styles.textMuted} hover:${styles.textPrimary}'
              }\`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="${styles.background} rounded-xl p-4 text-center">
                <p className="${styles.textMuted} text-sm">Conditions</p>
                <p className="${styles.textPrimary} text-2xl font-bold">{conditions.length}</p>
              </div>
              <div className="${styles.background} rounded-xl p-4 text-center">
                <p className="${styles.textMuted} text-sm">Medications</p>
                <p className="${styles.textPrimary} text-2xl font-bold">{medications.filter(m => m.active).length}</p>
              </div>
              <div className="${styles.background} rounded-xl p-4 text-center">
                <p className="${styles.textMuted} text-sm">Lab Tests</p>
                <p className="${styles.textPrimary} text-2xl font-bold">{labResults.length}</p>
              </div>
              <div className="${styles.background} rounded-xl p-4 text-center">
                <p className="${styles.textMuted} text-sm">Total Visits</p>
                <p className="${styles.textPrimary} text-2xl font-bold">{visits.length}</p>
              </div>
            </div>

            {/* Latest Vitals */}
            {latestVitals && (
              <div>
                <h3 className="${styles.textPrimary} font-semibold mb-3">Latest Vitals ({new Date(latestVitals.date).toLocaleDateString()})</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {latestVitals.bloodPressure && (
                    <div className="border ${styles.cardBorder} rounded-lg p-3 text-center">
                      <p className="${styles.textMuted} text-xs">BP</p>
                      <p className="${styles.textPrimary} font-bold">{latestVitals.bloodPressure}</p>
                    </div>
                  )}
                  {latestVitals.heartRate && (
                    <div className="border ${styles.cardBorder} rounded-lg p-3 text-center">
                      <p className="${styles.textMuted} text-xs">HR</p>
                      <p className="${styles.textPrimary} font-bold">{latestVitals.heartRate} bpm</p>
                    </div>
                  )}
                  {latestVitals.temperature && (
                    <div className="border ${styles.cardBorder} rounded-lg p-3 text-center">
                      <p className="${styles.textMuted} text-xs">Temp</p>
                      <p className="${styles.textPrimary} font-bold">{latestVitals.temperature}F</p>
                    </div>
                  )}
                  {latestVitals.weight && (
                    <div className="border ${styles.cardBorder} rounded-lg p-3 text-center">
                      <p className="${styles.textMuted} text-xs">Weight</p>
                      <p className="${styles.textPrimary} font-bold">{latestVitals.weight} lbs</p>
                    </div>
                  )}
                  {latestVitals.oxygenSaturation && (
                    <div className="border ${styles.cardBorder} rounded-lg p-3 text-center">
                      <p className="${styles.textMuted} text-xs">SpO2</p>
                      <p className="${styles.textPrimary} font-bold">{latestVitals.oxygenSaturation}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Conditions */}
            {conditions.length > 0 && (
              <div>
                <h3 className="${styles.textPrimary} font-semibold mb-3">Active Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, idx) => (
                    <span key={idx} className="px-3 py-1.5 ${styles.background} ${styles.textPrimary} rounded-full text-sm">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="${styles.textPrimary} font-semibold">Current Medications</h3>
              <span className="${styles.textMuted} text-sm">{medications.filter(m => m.active).length} active</span>
            </div>
            {medications.map((med) => (
              <div key={med.id} className={\`p-4 rounded-lg border \${med.active ? '${styles.cardBorder}' : 'border-gray-200 opacity-60'}\`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="${styles.textPrimary} font-medium">{med.name}</h4>
                    <p className="${styles.textSecondary} text-sm">{med.dosage} {med.frequency}</p>
                    <p className="${styles.textMuted} text-xs mt-1">
                      Prescribed by Dr. {med.prescribedBy} on {new Date(med.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={\`px-2 py-1 text-xs rounded-full \${med.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}\`}>
                    {med.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b ${styles.cardBorder}">
                  <th className="text-left py-3 px-4 ${styles.textSecondary} text-sm font-medium">Date</th>
                  <th className="text-left py-3 px-4 ${styles.textSecondary} text-sm font-medium">Test</th>
                  <th className="text-left py-3 px-4 ${styles.textSecondary} text-sm font-medium">Result</th>
                  <th className="text-left py-3 px-4 ${styles.textSecondary} text-sm font-medium">Normal Range</th>
                  <th className="text-left py-3 px-4 ${styles.textSecondary} text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((result) => (
                  <tr key={result.id} className="border-b ${styles.cardBorder}">
                    <td className="py-3 px-4 ${styles.textMuted} text-sm">{new Date(result.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 ${styles.textPrimary} font-medium">{result.testName}</td>
                    <td className="py-3 px-4 ${styles.textPrimary}">{result.result}</td>
                    <td className="py-3 px-4 ${styles.textMuted}">{result.normalRange}</td>
                    <td className="py-3 px-4">
                      <span className={\`px-2 py-1 text-xs rounded-full \${
                        result.status === 'normal' ? 'bg-green-100 text-green-700' :
                        result.status === 'abnormal' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }\`}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="p-4 border ${styles.cardBorder} rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="${styles.textPrimary} font-medium">{visit.type}</h4>
                    <p className="${styles.textSecondary} text-sm">Dr. {visit.provider}</p>
                  </div>
                  <span className="${styles.textMuted} text-sm">{new Date(visit.date).toLocaleDateString()}</span>
                </div>
                {visit.diagnosis && (
                  <p className="${styles.textPrimary} text-sm mb-2">
                    <span className="${styles.textMuted}">Diagnosis:</span> {visit.diagnosis}
                  </p>
                )}
                <p className="${styles.textMuted} text-sm">{visit.notes}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-4">
            {vitals.map((vital, idx) => (
              <div key={idx} className="p-4 border ${styles.cardBorder} rounded-lg">
                <p className="${styles.textMuted} text-sm mb-3">{new Date(vital.date).toLocaleDateString()}</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {vital.bloodPressure && <div><p className="${styles.textMuted} text-xs">BP</p><p className="${styles.textPrimary} font-medium">{vital.bloodPressure}</p></div>}
                  {vital.heartRate && <div><p className="${styles.textMuted} text-xs">HR</p><p className="${styles.textPrimary} font-medium">{vital.heartRate} bpm</p></div>}
                  {vital.temperature && <div><p className="${styles.textMuted} text-xs">Temp</p><p className="${styles.textPrimary} font-medium">{vital.temperature}F</p></div>}
                  {vital.weight && <div><p className="${styles.textMuted} text-xs">Weight</p><p className="${styles.textPrimary} font-medium">{vital.weight} lbs</p></div>}
                  {vital.height && <div><p className="${styles.textMuted} text-xs">Height</p><p className="${styles.textPrimary} font-medium">{vital.height} in</p></div>}
                  {vital.oxygenSaturation && <div><p className="${styles.textMuted} text-xs">SpO2</p><p className="${styles.textPrimary} font-medium">{vital.oxygenSaturation}%</p></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordView;
`;
};
