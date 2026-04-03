/**
 * Doctor Grid Component Generator
 */

export interface DoctorGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDoctorGrid(options: DoctorGridOptions = {}): string {
  const { componentName = 'DoctorGrid', endpoint = '/doctors' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, User, Star, MapPin, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  specialty?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ specialty }) => {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', specialty],
    queryFn: async () => {
      const url = specialty ? '${endpoint}?specialty=' + encodeURIComponent(specialty) : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {doctors && doctors.length > 0 ? (
        doctors.map((doctor: any) => (
          <Link
            key={doctor.id}
            to={\`/doctors/\${doctor.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              {doctor.avatar_url ? (
                <img src={doctor.avatar_url} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Dr. {doctor.name}</h3>
                <p className="text-sm text-blue-600">{doctor.specialty}</p>
              </div>
            </div>
            {doctor.rating && (
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900 dark:text-white">{doctor.rating}</span>
                {doctor.reviews_count && (
                  <span className="text-gray-500 text-sm">({doctor.reviews_count} reviews)</span>
                )}
              </div>
            )}
            {doctor.location && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4" />
                {doctor.location}
              </p>
            )}
            {doctor.available && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Available today
              </p>
            )}
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No doctors found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDoctorProfile(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'DoctorProfile', endpoint = '/doctors' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, MapPin, Clock, Award, Calendar, Phone, Mail } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', id],
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

  if (!doctor) {
    return <div className="text-center py-12 text-gray-500">Doctor not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
        <div className="flex items-center gap-6">
          {doctor.avatar_url ? (
            <img src={doctor.avatar_url} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-white" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="text-white">
            <h1 className="text-2xl font-bold">Dr. {doctor.name}</h1>
            <p className="opacity-90">{doctor.specialty}</p>
            {doctor.rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{doctor.rating}</span>
                {doctor.reviews_count && <span className="opacity-75">({doctor.reviews_count} reviews)</span>}
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
              {doctor.email && (
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {doctor.email}</p>
              )}
              {doctor.phone && (
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {doctor.phone}</p>
              )}
              {doctor.location && (
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {doctor.location}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Experience</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {doctor.experience_years && (
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {doctor.experience_years} years experience</p>
              )}
              {doctor.qualifications && (
                <p className="flex items-center gap-2"><Award className="w-4 h-4" /> {doctor.qualifications}</p>
              )}
            </div>
          </div>
        </div>
        {doctor.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{doctor.bio}</p>
          </div>
        )}
        <Link
          to={\`/appointments/new?doctor_id=\${doctor.id}\`}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
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

export function generateDoctorSchedule(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'DoctorSchedule', endpoint = '/schedules' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?doctor_id=' + id);
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Working Hours
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {days.map((day) => {
          const daySchedule = schedule?.[day.toLowerCase()] || schedule?.find?.((s: any) => s.day === day);
          const isAvailable = daySchedule && (daySchedule.available !== false);

          return (
            <div key={day} className="flex items-center justify-between p-4">
              <span className="font-medium text-gray-900 dark:text-white">{day}</span>
              {isAvailable ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {daySchedule.start_time || '9:00 AM'} - {daySchedule.end_time || '5:00 PM'}
                  </span>
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
