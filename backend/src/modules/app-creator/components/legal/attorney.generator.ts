/**
 * Attorney Profile Component Generators
 *
 * Generates attorney profile and detail components for law firm applications.
 */

export interface AttorneyOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAttorneyProfile(options: AttorneyOptions = {}): string {
  const { componentName = 'AttorneyProfile', endpoint = '/attorneys' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Briefcase, Award, GraduationCap, Calendar, Scale, Users, Clock, Star, Edit, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

interface Attorney {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  title: string;
  bar_number?: string;
  admitted_date?: string;
  practice_areas: string[];
  education: { institution: string; degree: string; year: number }[];
  experience_years: number;
  bio?: string;
  specializations?: string[];
  languages?: string[];
  office_location?: string;
  linkedin_url?: string;
  active_cases_count?: number;
  total_cases?: number;
  win_rate?: number;
  hourly_rate?: number;
  is_partner?: boolean;
  joined_date?: string;
  awards?: { title: string; year: number }[];
  publications?: { title: string; publication: string; year: number }[];
}

interface AttorneyProfileProps {
  attorneyId?: string;
  showEdit?: boolean;
}

const ${componentName}: React.FC<AttorneyProfileProps> = ({ attorneyId: propAttorneyId, showEdit = true }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const attorneyId = propAttorneyId || paramId;

  const { data: attorney, isLoading } = useQuery({
    queryKey: ['attorney', attorneyId],
    queryFn: async () => {
      const response = await api.get<Attorney>('${endpoint}/' + attorneyId);
      return response?.data || response;
    },
    enabled: !!attorneyId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!attorney) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Attorney not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/attorneys"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Attorneys
        </Link>
        {showEdit && (
          <Link
            to={\`/attorneys/\${attorneyId}/edit\`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              {attorney.avatar_url ? (
                <img
                  src={attorney.avatar_url}
                  alt={attorney.name}
                  className="w-32 h-32 rounded-xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {attorney.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{attorney.name}</h1>
                    {attorney.is_partner && (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                        Partner
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{attorney.title}</p>
                  {attorney.bar_number && (
                    <p className="text-sm text-gray-500 mt-1">Bar #: {attorney.bar_number}</p>
                  )}
                </div>

                {attorney.win_rate !== undefined && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
                      <Star className="w-5 h-5 fill-current" />
                      {attorney.win_rate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500">Win Rate</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                {attorney.email && (
                  <a href={\`mailto:\${attorney.email}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Mail className="w-4 h-4" />
                    {attorney.email}
                  </a>
                )}
                {attorney.phone && (
                  <a href={\`tel:\${attorney.phone}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {attorney.phone}
                  </a>
                )}
                {attorney.office_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {attorney.office_location}
                  </span>
                )}
                {attorney.linkedin_url && (
                  <a
                    href={attorney.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>

              {attorney.practice_areas && attorney.practice_areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {attorney.practice_areas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{attorney.experience_years || 0}</p>
            <p className="text-xs text-gray-500">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{attorney.active_cases_count || 0}</p>
            <p className="text-xs text-gray-500">Active Cases</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{attorney.total_cases || 0}</p>
            <p className="text-xs text-gray-500">Total Cases</p>
          </div>
          {attorney.hourly_rate && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${attorney.hourly_rate}</p>
              <p className="text-xs text-gray-500">Hourly Rate</p>
            </div>
          )}
        </div>
      </div>

      {attorney.bio && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{attorney.bio}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {attorney.education && attorney.education.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h2>
            </div>
            <div className="space-y-4">
              {attorney.education.map((edu, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{edu.degree}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {attorney.awards && attorney.awards.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Awards & Recognition</h2>
            </div>
            <div className="space-y-3">
              {attorney.awards.map((award, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{award.title}</p>
                    <p className="text-xs text-gray-500">{award.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {attorney.specializations && attorney.specializations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Specializations</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {attorney.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {attorney.languages && attorney.languages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Languages</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {attorney.languages.map((lang, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {attorney.publications && attorney.publications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Publications</h2>
          </div>
          <div className="space-y-4">
            {attorney.publications.map((pub, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{pub.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{pub.publication}</p>
                  <p className="text-xs text-gray-500">{pub.year}</p>
                </div>
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
