/**
 * Rehabilitation/Physical Therapy Component Generators
 */

export interface RehabOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAppointmentListTodayRehab(options: RehabOptions = {}): string {
  const { componentName = 'AppointmentListTodayRehab', endpoint = '/rehab/appointments/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, User, Activity, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface RehabAppointment {
  id: string;
  patient_name: string;
  patient_id: string;
  therapist_id: string;
  therapist_name: string;
  time: string;
  end_time: string;
  therapy_type: string;
  session_number: number;
  total_sessions: number;
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  room?: string;
  notes?: string;
  injury_area?: string;
}

const ${componentName}: React.FC = () => {
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['rehab-appointments-today'],
    queryFn: async () => {
      const response = await api.get<RehabAppointment[]>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getStatusColor = (status: RehabAppointment['status']) => {
    const colors = {
      scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      checked_in: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      in_progress: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      no_show: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusIcon = (status: RehabAppointment['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return PlayCircle;
      case 'cancelled':
      case 'no_show': return AlertCircle;
      default: return Clock;
    }
  };

  const now = new Date();
  const upcomingAppointments = appointments?.filter(apt => {
    const [hours, minutes] = apt.time.split(':').map(Number);
    const aptTime = new Date();
    aptTime.setHours(hours, minutes, 0);
    return aptTime >= now || apt.status === 'in_progress';
  }) || [];

  const completedAppointments = appointments?.filter(apt =>
    apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show'
  ) || [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Today's Schedule
          </h2>
          <span className="text-sm text-gray-500">
            {appointments?.length || 0} appointments
          </span>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingAppointments.map((apt) => {
              const StatusIcon = getStatusIcon(apt.status);
              return (
                <Link
                  key={apt.id}
                  to={\`/rehab/appointments/\${apt.id}\`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{apt.time}</p>
                        <p className="text-xs text-gray-500">{apt.end_time}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{apt.patient_name}</h3>
                        <p className="text-sm text-emerald-600">{apt.therapy_type}</p>
                        {apt.injury_area && (
                          <p className="text-xs text-gray-500">{apt.injury_area}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={\`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs \${getStatusColor(apt.status)}\`}>
                        <StatusIcon className="w-3 h-3" />
                        {apt.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Session {apt.session_number}/{apt.total_sessions}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {apt.therapist_name}
                    </span>
                    {apt.room && <span>Room: {apt.room}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No upcoming appointments today
          </div>
        )}
      </div>

      {completedAppointments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">Completed Today</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {completedAppointments.map((apt) => (
              <div key={apt.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{apt.patient_name}</p>
                  <p className="text-sm text-gray-500">{apt.time} - {apt.therapy_type}</p>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs \${getStatusColor(apt.status)}\`}>
                  {apt.status.replace('_', ' ')}
                </span>
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

export function generatePatientProfileRehab(options: RehabOptions = {}): string {
  const { componentName = 'PatientProfileRehab', endpoint = '/rehab/patients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Phone, Mail, Calendar, MapPin, AlertCircle, Activity, FileText, Target, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface RehabPatient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  avatar_url?: string;
  primary_diagnosis: string;
  injury_date?: string;
  referral_source?: string;
  referring_physician?: string;
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  treatment_plan?: {
    start_date: string;
    end_date?: string;
    total_sessions: number;
    completed_sessions: number;
    frequency: string;
    goals: string[];
  };
  medical_history?: string[];
  allergies?: string[];
  medications?: string[];
  precautions?: string[];
  current_therapist?: {
    id: string;
    name: string;
  };
  progress_percentage?: number;
  notes?: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['rehab-patient', id],
    queryFn: async () => {
      const response = await api.get<RehabPatient>('${endpoint}/' + id);
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

  const progressPercentage = patient.treatment_plan
    ? Math.round((patient.treatment_plan.completed_sessions / patient.treatment_plan.total_sessions) * 100)
    : patient.progress_percentage || 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4 mb-6">
          {patient.avatar_url ? (
            <img src={patient.avatar_url} alt={patient.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="w-10 h-10 text-emerald-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            <p className="text-emerald-600 font-medium">{patient.primary_diagnosis}</p>
            {patient.date_of_birth && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            to={\`/rehab/appointments/new?patient_id=\${patient.id}\`}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Schedule Session
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

        {(patient.precautions?.length || patient.allergies?.length) && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
              <AlertCircle className="w-5 h-5" />
              Precautions & Allergies
            </div>
            <div className="flex flex-wrap gap-2">
              {[...(patient.precautions || []), ...(patient.allergies || [])].map((item, i) => (
                <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {patient.treatment_plan && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Treatment Plan
          </h3>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {patient.treatment_plan.completed_sessions}/{patient.treatment_plan.total_sessions} sessions
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all"
                style={{ width: \`\${progressPercentage}%\` }}
              />
            </div>
            <p className="text-right text-sm text-emerald-600 mt-1">{progressPercentage}% complete</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(patient.treatment_plan.start_date).toLocaleDateString()}
              </p>
            </div>
            {patient.treatment_plan.end_date && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500">Target End Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(patient.treatment_plan.end_date).toLocaleDateString()}
                </p>
              </div>
            )}
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="font-medium text-gray-900 dark:text-white">{patient.treatment_plan.frequency}</p>
            </div>
          </div>

          {patient.treatment_plan.goals && patient.treatment_plan.goals.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Treatment Goals
              </h4>
              <ul className="space-y-2">
                {patient.treatment_plan.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {patient.current_therapist && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Assigned Therapist</h3>
            <Link
              to={\`/rehab/therapists/\${patient.current_therapist.id}\`}
              className="flex items-center gap-3 hover:text-emerald-600 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{patient.current_therapist.name}</span>
            </Link>
          </div>
        )}

        {patient.referring_physician && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Referring Physician</h3>
            <p className="text-gray-600 dark:text-gray-400">{patient.referring_physician}</p>
            {patient.referral_source && (
              <p className="text-sm text-gray-500 mt-1">Source: {patient.referral_source}</p>
            )}
          </div>
        )}
      </div>

      {patient.medications && patient.medications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Current Medications</h3>
          <div className="flex flex-wrap gap-2">
            {patient.medications.map((med, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                {med}
              </span>
            ))}
          </div>
        </div>
      )}

      {patient.emergency_contact && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

export function generatePatientProgressOverview(options: RehabOptions = {}): string {
  const { componentName = 'PatientProgressOverview', endpoint = '/rehab/patients' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, Target, Calendar, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface ProgressData {
  patient_id: string;
  patient_name: string;
  diagnosis: string;
  overall_progress: number;
  sessions_completed: number;
  sessions_remaining: number;
  treatment_start: string;
  estimated_completion: string;
  goals: Array<{
    id: string;
    description: string;
    target_date: string;
    status: 'not_started' | 'in_progress' | 'achieved' | 'modified';
    progress: number;
  }>;
  metrics: Array<{
    name: string;
    initial_value: number;
    current_value: number;
    target_value: number;
    unit: string;
  }>;
  recent_sessions: Array<{
    date: string;
    therapist: string;
    notes: string;
    pain_level: number;
  }>;
  attendance_rate: number;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['rehab-progress', id],
    queryFn: async () => {
      const response = await api.get<ProgressData>('${endpoint}/' + id + '/progress');
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

  if (!progress) {
    return <div className="text-center py-12 text-gray-500">No progress data available</div>;
  }

  const getGoalStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      achieved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      modified: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{progress.patient_name}</h2>
            <p className="text-emerald-600">{progress.diagnosis}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-600">{progress.overall_progress}%</p>
            <p className="text-sm text-gray-500">Overall Progress</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all"
            style={{ width: \`\${progress.overall_progress}%\` }}
          />
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{progress.sessions_completed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{progress.sessions_remaining}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-purple-600">{new Date(progress.estimated_completion).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Est. Completion</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
            <Activity className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">{progress.attendance_rate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Treatment Goals
        </h3>
        <div className="space-y-4">
          {progress.goals.map((goal) => (
            <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900 dark:text-white">{goal.description}</p>
                <span className={\`px-2 py-1 rounded-full text-xs \${getGoalStatusColor(goal.status)}\`}>
                  {goal.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`h-2 rounded-full \${goal.status === 'achieved' ? 'bg-green-500' : 'bg-emerald-500'}\`}
                      style={{ width: \`\${goal.progress}%\` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{goal.progress}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {progress.metrics && progress.metrics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Progress Metrics
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {progress.metrics.map((metric, i) => {
              const progressPct = ((metric.current_value - metric.initial_value) / (metric.target_value - metric.initial_value)) * 100;
              const isImproving = metric.current_value > metric.initial_value;

              return (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">{metric.name}</p>
                  <div className="flex items-end gap-4 mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Initial</p>
                      <p className="text-lg text-gray-600 dark:text-gray-400">{metric.initial_value} {metric.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current</p>
                      <p className={\`text-xl font-bold \${isImproving ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}\`}>
                        {metric.current_value} {metric.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Target</p>
                      <p className="text-lg text-gray-600 dark:text-gray-400">{metric.target_value} {metric.unit}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: \`\${Math.min(Math.max(progressPct, 0), 100)}%\` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {progress.recent_sessions && progress.recent_sessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h3>
          <div className="space-y-4">
            {progress.recent_sessions.map((session, i) => (
              <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(session.date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Pain Level:</span>
                    <span className={\`px-2 py-0.5 rounded text-sm font-medium \${
                      session.pain_level <= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      session.pain_level <= 6 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }\`}>
                      {session.pain_level}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">Therapist: {session.therapist}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{session.notes}</p>
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

export function generateRehabStats(options: RehabOptions = {}): string {
  const { componentName = 'RehabStats', endpoint = '/rehab/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Calendar, Activity, TrendingUp, Clock, CheckCircle, Target, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

interface RehabStatsData {
  total_patients: number;
  active_patients: number;
  new_patients_month: number;
  appointments_today: number;
  appointments_week: number;
  completed_sessions_month: number;
  average_progress: number;
  discharge_rate: number;
  patient_satisfaction: number;
  revenue_month: number;
  therapist_utilization: number;
  therapy_types: {
    physical_therapy: number;
    occupational_therapy: number;
    sports_rehab: number;
    post_surgical: number;
    neurological: number;
    pediatric: number;
  };
  common_diagnoses: Array<{
    name: string;
    count: number;
  }>;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['rehab-stats'],
    queryFn: async () => {
      const response = await api.get<RehabStatsData>('${endpoint}');
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
    { title: 'Active Patients', value: stats.active_patients, icon: Users, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
    { title: 'Appointments Today', value: stats.appointments_today, icon: Calendar, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { title: 'Avg Progress', value: \`\${stats.average_progress}%\`, icon: TrendingUp, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
    { title: 'Monthly Revenue', value: formatCurrency(stats.revenue_month), icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
  ];

  const secondaryStats = [
    { title: 'Total Patients', value: stats.total_patients, icon: Users },
    { title: 'New This Month', value: stats.new_patients_month, icon: TrendingUp },
    { title: 'Sessions Completed', value: stats.completed_sessions_month, icon: CheckCircle },
    { title: 'Appointments This Week', value: stats.appointments_week, icon: Calendar },
    { title: 'Discharge Rate', value: \`\${stats.discharge_rate}%\`, icon: Target },
    { title: 'Patient Satisfaction', value: \`\${stats.patient_satisfaction}%\`, icon: Activity },
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Therapist Utilization</h3>
          <span className="text-2xl font-bold text-emerald-600">{stats.therapist_utilization}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-emerald-600 h-4 rounded-full transition-all"
            style={{ width: \`\${stats.therapist_utilization}%\` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {stats.therapy_types && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Patients by Therapy Type
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.therapy_types).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.common_diagnoses && stats.common_diagnoses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Common Diagnoses</h3>
            <div className="space-y-3">
              {stats.common_diagnoses.map((diagnosis, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{diagnosis.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{diagnosis.count} patients</span>
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

export function generateTherapistSchedule(options: RehabOptions = {}): string {
  const { componentName = 'TherapistSchedule', endpoint = '/rehab/therapists' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, ChevronLeft, ChevronRight, User, Activity } from 'lucide-react';
import { api } from '@/lib/api';

interface ScheduleSlot {
  time: string;
  end_time: string;
  patient_id?: string;
  patient_name?: string;
  therapy_type?: string;
  status: 'available' | 'booked' | 'break' | 'blocked';
  room?: string;
}

interface DaySchedule {
  date: string;
  slots: ScheduleSlot[];
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['therapist-schedule', id, selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await api.get<DaySchedule>(\`${endpoint}/\${id}/schedule?date=\${dateStr}\`);
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

  const getSlotColor = (status: ScheduleSlot['status']) => {
    const colors = {
      available: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
      booked: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
      break: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
      blocked: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-500',
    };
    return colors[status] || colors.available;
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={() => navigateDay(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          {isToday && <span className="text-sm text-emerald-600">Today</span>}
        </div>
        <button
          onClick={() => navigateDay(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Break</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
        </div>

        {schedule?.slots && schedule.slots.length > 0 ? (
          <div className="space-y-2">
            {schedule.slots.map((slot, i) => (
              <div
                key={i}
                className={\`p-3 rounded-lg border \${getSlotColor(slot.status)}\`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[80px]">
                      <p className="font-medium">{slot.time}</p>
                      <p className="text-xs opacity-75">- {slot.end_time}</p>
                    </div>
                    {slot.status === 'booked' && slot.patient_name && (
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {slot.patient_name}
                        </p>
                        {slot.therapy_type && (
                          <p className="text-sm opacity-75">{slot.therapy_type}</p>
                        )}
                      </div>
                    )}
                    {slot.status === 'break' && (
                      <p className="font-medium">Break</p>
                    )}
                    {slot.status === 'available' && (
                      <p className="font-medium">Available</p>
                    )}
                    {slot.status === 'blocked' && (
                      <p className="font-medium">Blocked</p>
                    )}
                  </div>
                  {slot.room && (
                    <span className="text-sm opacity-75">Room {slot.room}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No schedule available for this day
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
