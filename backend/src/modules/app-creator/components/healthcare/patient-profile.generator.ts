/**
 * Patient Profile Component Generator
 */

export interface PatientProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePatientProfile(options: PatientProfileOptions = {}): string {
  const { componentName = 'PatientProfile', endpoint = '/patients' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Phone, Mail, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start gap-4 mb-6">
        {patient.avatar_url ? (
          <img src={patient.avatar_url} alt={patient.name} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
          <p className="text-gray-500">Patient ID: {patient.patient_id || patient.id}</p>
          {patient.date_of_birth && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
            </p>
          )}
        </div>
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

      {patient.allergies && patient.allergies.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
            <AlertCircle className="w-5 h-5" />
            Allergies
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-sm">
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {patient.emergency_contact && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Emergency Contact</h3>
          <p className="text-gray-600 dark:text-gray-400">{patient.emergency_contact.name}</p>
          <p className="text-gray-500 text-sm">{patient.emergency_contact.phone}</p>
          <p className="text-gray-500 text-sm">{patient.emergency_contact.relationship}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMedicalHistory(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'MedicalHistory', endpoint = '/medical-history' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Calendar, User, Pill } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: records, isLoading } = useQuery({
    queryKey: ['medical-history', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?patient_id=' + id);
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Medical History</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {records && records.length > 0 ? (
          records.map((record: any) => (
            <div key={record.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{record.diagnosis || record.title}</h3>
                    <p className="text-sm text-gray-500">{record.type || 'Visit'}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(record.date || record.created_at).toLocaleDateString()}
                </span>
              </div>
              {record.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm ml-10">{record.description}</p>
              )}
              {record.doctor_name && (
                <p className="text-sm text-gray-500 ml-10 mt-2 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Dr. {record.doctor_name}
                </p>
              )}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div className="mt-3 ml-10 flex flex-wrap gap-2">
                  {record.prescriptions.map((rx: any, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                      <Pill className="w-3 h-3" />
                      {rx.name || rx}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
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
