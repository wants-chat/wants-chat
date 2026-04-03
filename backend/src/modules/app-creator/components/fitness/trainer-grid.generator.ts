/**
 * Trainer Grid Component Generator
 */

export interface TrainerGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTrainerGrid(options: TrainerGridOptions = {}): string {
  const { componentName = 'TrainerGrid', endpoint = '/trainers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, User, Star, Award } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: trainers, isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {trainers && trainers.length > 0 ? (
        trainers.map((trainer: any) => (
          <Link
            key={trainer.id}
            to={\`/trainers/\${trainer.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg transition-shadow"
          >
            {trainer.avatar_url ? (
              <img src={trainer.avatar_url} alt={trainer.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-blue-600" />
              </div>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white">{trainer.name}</h3>
            {trainer.specialty && (
              <p className="text-sm text-blue-600 mt-1">{trainer.specialty}</p>
            )}
            {trainer.rating && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{trainer.rating}</span>
              </div>
            )}
            {trainer.certifications && (
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                <Award className="w-3 h-3" />
                {trainer.certifications.length} certifications
              </div>
            )}
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No trainers found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTrainerProfile(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'TrainerProfile', endpoint = '/trainers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, Award, Calendar, Mail, Phone, Instagram, Twitter } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer', id],
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

  if (!trainer) {
    return <div className="text-center py-12 text-gray-500">Trainer not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center text-white">
        {trainer.avatar_url ? (
          <img src={trainer.avatar_url} alt={trainer.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-16 h-16" />
          </div>
        )}
        <h1 className="text-2xl font-bold">{trainer.name}</h1>
        {trainer.specialty && <p className="opacity-90">{trainer.specialty}</p>}
        {trainer.rating && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-medium">{trainer.rating}</span>
            {trainer.reviews_count && <span className="opacity-75">({trainer.reviews_count} reviews)</span>}
          </div>
        )}
      </div>
      <div className="p-6">
        {trainer.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{trainer.bio}</p>
          </div>
        )}
        {trainer.certifications && trainer.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.certifications.map((cert: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                  <Award className="w-3 h-3" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
        {trainer.specialties && trainer.specialties.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((spec: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-4">
          <Link
            to={\`/classes?trainer=\${trainer.id}\`}
            className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-center font-medium"
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            View Classes
          </Link>
          <button className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Mail className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
